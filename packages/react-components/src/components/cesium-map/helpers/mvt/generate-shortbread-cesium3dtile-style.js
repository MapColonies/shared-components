'use strict';
/**
 * Generator: versatiles-shadow (Shortbread) MapLibre style -> Cesium3DTileStyle.
 *
 * This script is the seed of a general Shortbread -> Cesium3DTileStyle translator.
 * It is deliberately data-driven (walks the style JSON) rather than hand-authored,
 * so it can be re-run whenever shadow.local.json changes, and can later be extended
 * to cover other Shortbread-based styles beyond "versatiles-shadow".
 *
 * Scope decision (see README comment emitted in the output file for the "why"):
 * Cesium only evaluates `show` and `color` from a Cesium3DTileStyle for generic
 * batched 3D Tile features (which is what buildVectorGltfFromMVTWGS84 produces -
 * triangulated polygons / line quads / point quads baked into glTF, not a point-cloud
 * tileset). Properties like pointSize, font, label*, anchorLine*, image, etc. are only
 * evaluated by Cesium for Cesium3DTilePointFeature (pnts point-cloud tilesets), so they
 * would be silently ignored here - this generator does not emit them, and documents why
 * per-layer instead of emitting dead code.
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'shadow.local.json');
const OUT = path.join(__dirname, 'shortbread-cesium3dtile-style-claude.ts');

const style = JSON.parse(fs.readFileSync(SRC, 'utf8'));

function lit(v) {
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return String(v);
  return `"${String(v)}"`;
}

// --- Mapbox legacy filter -> Cesium boolean expression -------------------------------

function condToStr(cond) {
  const op = cond[0];
  if (op === 'has') return `(\${${cond[1]}} !== undefined)`;
  if (op === '!has') return `(\${${cond[1]}} === undefined)`;
  if (op === 'to-boolean') {
    // ['to-boolean', ['get', key]] - approximate truthiness as "property is present".
    const key = Array.isArray(cond[1]) && cond[1][0] === 'get' ? cond[1][1] : cond[1];
    return `(\${${key}} !== undefined)`;
  }
  if (op === 'in' || op === '!in') {
    const key = cond[1];
    const vals = cond.slice(2);
    const joiner = op === 'in' ? ' || ' : ' && ';
    const eq = op === 'in' ? '===' : '!==';
    return '(' + vals.map((v) => `(\${${key}} ${eq} ${lit(v)})`).join(joiner) + ')';
  }
  if (['==', '!=', '>', '>=', '<', '<='].includes(op)) {
    const key = cond[1];
    const val = cond[2];
    const jsOp = op === '==' ? '===' : op === '!=' ? '!==' : op;
    return `(\${${key}} ${jsOp} ${lit(val)})`;
  }
  throw new Error(`Unsupported filter operator: ${JSON.stringify(cond)}`);
}

function translateFilter(filter) {
  if (!filter) return 'true';
  if (filter[0] === 'all') {
    const parts = filter.slice(1).map(condToStr);
    if (parts.length === 0) return 'true';
    if (parts.length === 1) return parts[0];
    return '(' + parts.join(' && ') + ')';
  }
  return condToStr(filter);
}

// --- CSS color (rgb/rgba/hsl - the only forms present in this style) -> {r,g,b,a} ----

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r, g, b;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function parseColor(str) {
  let m = str.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i);
  if (m) {
    return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
  }
  m = str.match(/^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+)\s*)?\)$/i);
  if (m) {
    const [r, g, b] = hslToRgb(+m[1], +m[2], +m[3]);
    return { r, g, b, a: m[4] !== undefined ? +m[4] : 1 };
  }
  throw new Error(`Unsupported color format: ${str}`);
}

/** Plain number, or legacy {stops:[[zoom,value],...]} - approximate the latter with its last (max zoom) stop. */
function resolveScalar(value, layerId, propName, notes) {
  if (value === undefined) return { value: 1, note: null };
  if (typeof value === 'number') return { value, note: null };
  if (typeof value === 'object' && Array.isArray(value.stops)) {
    const last = value.stops[value.stops.length - 1];
    notes.push(`APPROXIMATION ${propName}: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom ${last[0]} = ${last[1]}.`);
    return { value: last[1], note: last };
  }
  throw new Error(`Unsupported scalar for ${layerId}.${propName}: ${JSON.stringify(value)}`);
}

function colorExpr(cssColor, opacity) {
  const c = parseColor(cssColor);
  const a = Math.max(0, Math.min(1, c.a * opacity));
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${Number(a.toFixed(3))})`;
}

/**
 * `line-width` is a real, evaluated Cesium3DTileStyle property (VectorGltf3DTileContent#applyStyle
 * reads `style.lineWidth` for BufferPolylineCollection features) - but, like every other paint property
 * here, it has no access to the current camera zoom, so a MapLibre zoom-interpolated stops list can't be
 * reproduced as-is; only a single width can be applied, at every zoom/camera distance alike. A "middle
 * stop" was tried first, but width stops keep growing with zoom (unlike opacity's, which settle at 1 and
 * stay there) - picking from the middle of the range meant a road's width was calibrated for a *closer*
 * zoom than this WGS84 provider is actually used at (see MVTDataProviderWGS84's tile-count constraints:
 * the whole tile tree is materialized eagerly, so a low `maxZoom` - 8 in this repo's own story - is the
 * realistic ceiling), and so it rendered far too thick at the low/regional zoom this pipeline is actually
 * viewed at. Interpolating each layer's stops at a single fixed, low `LINE_WIDTH_REFERENCE_ZOOM` instead
 * reproduces how that layer actually looks in MapLibre at that zoom - not correct at every zoom (nothing
 * static can be), but a much better match at the zoom this pipeline is meant for than either extreme.
 */
const LINE_WIDTH_REFERENCE_ZOOM = 8;

/**
 * Cap on the emitted `lineWidth`, independent of `LINE_WIDTH_REFERENCE_ZOOM`. Cesium's polyline
 * widening (`getPolylineWindowCoordinatesEC` in BufferPolylineMaterialVS.glsl - the same shared,
 * non-experimental miter-join math every Cesium polyline uses, not something specific to or fixable
 * in this vector tile pipeline) has no miter-limit: at a sharp vertex angle the join overshoots into a
 * visible spike, and that spike's length scales with the line's width. This mattered most for admin
 * boundary lines - their source geometry is simplified into the sharpest corners of any layer at low
 * zoom - but consumers are now expected to pass `lineSmoothingIterations` (Chaikin corner-cutting in
 * buildVectorGltfFromMVTWGS84, rounding those corners before triangulation) rather than relying on a
 * lower width to hide the spike, so a single cap can stay generous here. It only ends up affecting a
 * handful of the widest "outline"/"bridge underlay" layers (everything else already resolves well
 * under it) - see the `boundaries` line-width notes in this file's own UNSUPPORTED section for exactly
 * which layers currently hit it.
 */
const MAX_LINE_WIDTH = 6;

/** Legacy Mapbox `{stops:[[zoom,value],...]}` uses linear interpolation between stops, clamped at the ends. */
function interpolateStops(stops, zoom) {
  if (zoom <= stops[0][0]) return stops[0][1];
  const last = stops[stops.length - 1];
  if (zoom >= last[0]) return last[1];
  for (let i = 0; i < stops.length - 1; i++) {
    const [z0, v0] = stops[i];
    const [z1, v1] = stops[i + 1];
    if (zoom >= z0 && zoom <= z1) {
      const t = z1 === z0 ? 0 : (zoom - z0) / (z1 - z0);
      return v0 + t * (v1 - v0);
    }
  }
  return last[1];
}

function resolveLineWidth(value, layerId, notes) {
  if (value === undefined) return 1.0;
  if (typeof value === 'number') return value;
  if (typeof value === 'object' && Array.isArray(value.stops)) {
    const width = interpolateStops(value.stops, LINE_WIDTH_REFERENCE_ZOOM);
    notes.push(
      `APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom ${LINE_WIDTH_REFERENCE_ZOOM} (= ${Number(
        width.toFixed(2)
      )}) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.`
    );
    return width;
  }
  throw new Error(`Unsupported line-width for ${layerId}: ${JSON.stringify(value)}`);
}

// --- Walk layers -----------------------------------------------------------------------

const showConditions = [];
const colorConditions = [];
const lineWidthConditions = [];
const unsupported = []; // { num, id, type, sourceLayer, lines: [] }

let num = 0;
for (const layer of style.layers) {
  num += 1;
  const notes = [];
  const type = layer.type;
  const sourceLayer = layer['source-layer'];

  if (type === 'background') {
    notes.push('UNSUPPORTED background layer: Cesium3DTileStyle applies to per-feature 3D Tile styling, not the scene/tileset background.');
    unsupported.push({ num, id: layer.id, type, sourceLayer, notes });
    continue;
  }

  const filterExpr = translateFilter(layer.filter);
  const showCond = `((\${_layer} === "${sourceLayer}") && ${filterExpr})`;
  showConditions.push([showCond, 'true', `${String(num).padStart(3, '0')} ${layer.id} [${type}] source-layer=${sourceLayer}`]);

  const paint = layer.paint || {};
  const layout = layer.layout || {};

  if (type === 'fill' || type === 'line') {
    const colorKey = type === 'fill' ? 'fill-color' : 'line-color';
    const opacityKey = type === 'fill' ? 'fill-opacity' : 'line-opacity';
    const baseColor = paint[colorKey];
    if (baseColor !== undefined) {
      const { value: opacity } = resolveScalar(paint[opacityKey], layer.id, opacityKey, notes);
      colorConditions.push([showCond, colorExpr(baseColor, opacity), `${String(num).padStart(3, '0')} ${layer.id} [${type} color]`]);
    } else if (type === 'fill' && paint['fill-outline-color'] !== undefined) {
      notes.push(
        'UNSUPPORTED fill-outline-color: this fill layer has no fill-color (outline-only in Mapbox); Cesium3DTileStyle color has no separate polygon outline channel, so no color rule is emitted (fill stays at the style default).'
      );
    }
    if (paint['fill-pattern'] !== undefined)
      notes.push(`UNSUPPORTED fill-pattern='${paint['fill-pattern']}': sprite image fill patterns have no Cesium3DTileStyle equivalent.`);
    if (paint['fill-translate'] !== undefined)
      notes.push(
        `UNSUPPORTED fill-translate=${JSON.stringify(paint['fill-translate'])}: per-pixel paint translation has no Cesium3DTileStyle equivalent.`
      );
    if (paint['line-dasharray'] !== undefined)
      notes.push(`UNSUPPORTED line-dasharray=${JSON.stringify(paint['line-dasharray'])}: dash patterns have no Cesium3DTileStyle equivalent.`);
    if (paint['line-blur'] !== undefined) notes.push(`UNSUPPORTED line-blur=${JSON.stringify(paint['line-blur'])}: no Cesium3DTileStyle equivalent.`);
    if (type === 'line') {
      let width = resolveLineWidth(paint['line-width'], layer.id, notes);
      if (width > MAX_LINE_WIDTH) {
        notes.push(
          `APPROXIMATION line-width: capped from ${Number(
            width.toFixed(2)
          )} to ${MAX_LINE_WIDTH} (see MAX_LINE_WIDTH) to bound miter-join spiking at sharp vertices.`
        );
        width = MAX_LINE_WIDTH;
      }
      lineWidthConditions.push([showCond, String(Number(Math.max(width, 1).toFixed(2))), `${String(num).padStart(3, '0')} ${layer.id} [line width]`]);
    }
    if (layer.minzoom !== undefined || layer.maxzoom !== undefined)
      notes.push(
        `UNSUPPORTED zoom range [${layer.minzoom ?? '-'}, ${
          layer.maxzoom ?? '-'
        }]: Cesium3DTileStyle expressions have no access to the current view zoom level.`
      );
  } else if (type === 'symbol') {
    notes.push(
      'UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.'
    );
    if (paint['icon-color'] !== undefined) notes.push(`(icon-color='${paint['icon-color']}' not emitted - see above)`);
    if (paint['text-color'] !== undefined) notes.push(`(text-color='${paint['text-color']}' not emitted - see above)`);
  }

  if (notes.length > 0) unsupported.push({ num, id: layer.id, type, sourceLayer, notes });
}

// --- Emit ------------------------------------------------------------------------------

function fmtConditions(list) {
  return list.map(([cond, val, comment]) => `      // ${comment}\n      ['${cond}', '${val}'],`).join('\n');
}

const header = `import { Cesium3DTileStyle } from 'cesium';

/**
 * Shortbread (versatiles-shadow) -> Cesium3DTileStyle translation, generated from
 * shadow.local.json by generate-shortbread-style.js (kept as the seed of a general
 * Shortbread -> Cesium3DTileStyle translator - re-run it against an updated style
 * JSON to regenerate this file).
 *
 * Scope: only \`show\`, \`color\` and \`lineWidth\` (line layers only) are emitted.
 * buildVectorGltfFromMVTWGS84 bakes MVT features into batched glTF meshes
 * (polygons/lines/points as triangles/quads), and VectorGltf3DTileContent#applyStyle
 * (the Cesium engine code that actually evaluates a Cesium3DTileStyle against that
 * kind of feature) only reads \`show\`, \`color\`, \`pointSize\`/\`pointOutline*\` (points)
 * and \`lineWidth\` (lines) - properties such as font, label*, anchorLine*, image,
 * scaleByDistance etc. are only evaluated for point-cloud (pnts) tileset features
 * (Cesium3DTilePointFeature), so emitting them here would be dead code. \`lineWidth\`
 * (like every other paint property) has no access to the current camera zoom, so a
 * zoom-interpolated width is approximated with a single middle-of-the-range value -
 * see resolveLineWidth in the generator for why that stop, not the first or last, is
 * used. Every layer property that is therefore left untranslated - or approximated -
 * is documented per-layer in the UNSUPPORTED/APPROXIMATED section at the end of this
 * file, in original Shortbread layer order.
 *
 * Every condition is scoped by \`\${_layer}\`, the MVT source-layer name, because
 * MVTDataProviderWGS84 exposes it as an ordinary feature property and Shortbread
 * rules are keyed off the Mapbox source-layer rather than a feature attribute.
 */
const VECTOR_TILE_STYLE = new Cesium3DTileStyle({
  show: {
    conditions: [
${fmtConditions(showConditions)}
      ['true', 'false'],
    ],
  },
  color: {
    conditions: [
${fmtConditions(colorConditions)}
      ['true', "color('white')"],
    ],
  },
  lineWidth: {
    conditions: [
${fmtConditions(lineWidthConditions)}
      ['true', '1.0'],
    ],
  },
});

export { VECTOR_TILE_STYLE };
`;

const footerLines = [];
for (const u of unsupported) {
  footerLines.push(`// ${String(u.num).padStart(3, '0')} ${u.id} [${u.type}] source-layer=${u.sourceLayer ?? '<none>'}`);
  for (const n of u.notes) footerLines.push(`//   - ${n}`);
}

const full = header + '\n// UNSUPPORTED / APPROXIMATED RULES (original rule order):\n' + footerLines.join('\n') + '\n';

fs.writeFileSync(OUT, full, 'utf8');
console.log('Wrote', OUT);
console.log(
  'show conditions:',
  showConditions.length,
  'color conditions:',
  colorConditions.length,
  'lineWidth conditions:',
  lineWidthConditions.length,
  'layers with notes:',
  unsupported.length
);
