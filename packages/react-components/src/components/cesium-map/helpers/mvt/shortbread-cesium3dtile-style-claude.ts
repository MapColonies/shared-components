import { Cesium3DTileStyle } from 'cesium';

/**
 * Shortbread (versatiles-shadow) -> Cesium3DTileStyle translation, generated from
 * shadow.local.json by generate-shortbread-style.js (kept as the seed of a general
 * Shortbread -> Cesium3DTileStyle translator - re-run it against an updated style
 * JSON to regenerate this file).
 *
 * Scope: only `show`, `color` and `lineWidth` (line layers only) are emitted.
 * buildVectorGltfFromMVTWGS84 bakes MVT features into batched glTF meshes
 * (polygons/lines/points as triangles/quads), and VectorGltf3DTileContent#applyStyle
 * (the Cesium engine code that actually evaluates a Cesium3DTileStyle against that
 * kind of feature) only reads `show`, `color`, `pointSize`/`pointOutline*` (points)
 * and `lineWidth` (lines) - properties such as font, label*, anchorLine*, image,
 * scaleByDistance etc. are only evaluated for point-cloud (pnts) tileset features
 * (Cesium3DTilePointFeature), so emitting them here would be dead code. `lineWidth`
 * (like every other paint property) has no access to the current camera zoom, so a
 * zoom-interpolated width is approximated with a single middle-of-the-range value -
 * see resolveLineWidth in the generator for why that stop, not the first or last, is
 * used. Every layer property that is therefore left untranslated - or approximated -
 * is documented per-layer in the UNSUPPORTED/APPROXIMATED section at the end of this
 * file, in original Shortbread layer order.
 *
 * Every condition is scoped by `${_layer}`, the MVT source-layer name, because
 * MVTDataProviderWGS84 exposes it as an ordinary feature property and Shortbread
 * rules are keyed off the Mapbox source-layer rather than a feature attribute.
 */
const VECTOR_TILE_STYLE = new Cesium3DTileStyle({
  show: {
    conditions: [
      // 002 water-ocean [fill] source-layer=ocean
      ['((${_layer} === "ocean") && true)', 'true'],
      // 003 land-glacier [fill] source-layer=water_polygons
      ['((${_layer} === "water_polygons") && (${kind} === "glacier"))', 'true'],
      // 004 land-commercial [fill] source-layer=land
      ['((${_layer} === "land") && ((${kind} === "commercial") || (${kind} === "retail")))', 'true'],
      // 005 land-industrial [fill] source-layer=land
      ['((${_layer} === "land") && ((${kind} === "industrial") || (${kind} === "quarry") || (${kind} === "railway")))', 'true'],
      // 006 land-residential [fill] source-layer=land
      ['((${_layer} === "land") && ((${kind} === "garages") || (${kind} === "residential")))', 'true'],
      // 007 land-agriculture [fill] source-layer=land
      [
        '((${_layer} === "land") && ((${kind} === "brownfield") || (${kind} === "farmland") || (${kind} === "farmyard") || (${kind} === "greenfield") || (${kind} === "greenhouse_horticulture") || (${kind} === "orchard") || (${kind} === "plant_nursery") || (${kind} === "vineyard")))',
        'true',
      ],
      // 008 land-waste [fill] source-layer=land
      ['((${_layer} === "land") && ((${kind} === "landfill")))', 'true'],
      // 009 land-park [fill] source-layer=land
      ['((${_layer} === "land") && ((${kind} === "park") || (${kind} === "village_green") || (${kind} === "recreation_ground")))', 'true'],
      // 010 land-garden [fill] source-layer=land
      ['((${_layer} === "land") && ((${kind} === "allotments") || (${kind} === "garden")))', 'true'],
      // 011 land-burial [fill] source-layer=land
      ['((${_layer} === "land") && ((${kind} === "cemetery") || (${kind} === "grave_yard")))', 'true'],
      // 012 land-leisure [fill] source-layer=land
      ['((${_layer} === "land") && ((${kind} === "miniature_golf") || (${kind} === "playground") || (${kind} === "golf_course")))', 'true'],
      // 013 land-rock [fill] source-layer=land
      ['((${_layer} === "land") && ((${kind} === "bare_rock") || (${kind} === "scree") || (${kind} === "shingle")))', 'true'],
      // 014 land-forest [fill] source-layer=land
      ['((${_layer} === "land") && ((${kind} === "forest")))', 'true'],
      // 015 land-grass [fill] source-layer=land
      [
        '((${_layer} === "land") && ((${kind} === "grass") || (${kind} === "grassland") || (${kind} === "meadow") || (${kind} === "wet_meadow")))',
        'true',
      ],
      // 016 land-vegetation [fill] source-layer=land
      ['((${_layer} === "land") && ((${kind} === "heath") || (${kind} === "scrub")))', 'true'],
      // 017 land-sand [fill] source-layer=land
      ['((${_layer} === "land") && ((${kind} === "beach") || (${kind} === "sand")))', 'true'],
      // 018 land-wetland [fill] source-layer=land
      ['((${_layer} === "land") && ((${kind} === "bog") || (${kind} === "marsh") || (${kind} === "string_bog") || (${kind} === "swamp")))', 'true'],
      // 019 water-river [line] source-layer=water_lines
      ['((${_layer} === "water_lines") && (((${kind} === "river")) && (${tunnel} !== true) && (${bridge} !== true)))', 'true'],
      // 020 water-canal [line] source-layer=water_lines
      ['((${_layer} === "water_lines") && (((${kind} === "canal")) && (${tunnel} !== true) && (${bridge} !== true)))', 'true'],
      // 021 water-stream [line] source-layer=water_lines
      ['((${_layer} === "water_lines") && (((${kind} === "stream")) && (${tunnel} !== true) && (${bridge} !== true)))', 'true'],
      // 022 water-ditch [line] source-layer=water_lines
      ['((${_layer} === "water_lines") && (((${kind} === "ditch")) && (${tunnel} !== true) && (${bridge} !== true)))', 'true'],
      // 023 water-area [fill] source-layer=water_polygons
      ['((${_layer} === "water_polygons") && (${kind} === "water"))', 'true'],
      // 024 water-area-river [fill] source-layer=water_polygons
      ['((${_layer} === "water_polygons") && (${kind} === "river"))', 'true'],
      // 025 water-area-small [fill] source-layer=water_polygons
      ['((${_layer} === "water_polygons") && ((${kind} === "reservoir") || (${kind} === "basin") || (${kind} === "dock")))', 'true'],
      // 026 water-dam-area [fill] source-layer=dam_polygons
      ['((${_layer} === "dam_polygons") && (${kind} === "dam"))', 'true'],
      // 027 water-dam [line] source-layer=dam_lines
      ['((${_layer} === "dam_lines") && (${kind} === "dam"))', 'true'],
      // 028 water-pier-area [fill] source-layer=pier_polygons
      ['((${_layer} === "pier_polygons") && ((${kind} === "pier") || (${kind} === "breakwater") || (${kind} === "groyne")))', 'true'],
      // 029 water-pier [line] source-layer=pier_lines
      ['((${_layer} === "pier_lines") && ((${kind} === "pier") || (${kind} === "breakwater") || (${kind} === "groyne")))', 'true'],
      // 030 site-dangerarea [fill] source-layer=sites
      ['((${_layer} === "sites") && ((${kind} === "danger_area")))', 'true'],
      // 031 site-university [fill] source-layer=sites
      ['((${_layer} === "sites") && ((${kind} === "university")))', 'true'],
      // 032 site-college [fill] source-layer=sites
      ['((${_layer} === "sites") && ((${kind} === "college")))', 'true'],
      // 033 site-school [fill] source-layer=sites
      ['((${_layer} === "sites") && ((${kind} === "school")))', 'true'],
      // 034 site-hospital [fill] source-layer=sites
      ['((${_layer} === "sites") && ((${kind} === "hospital")))', 'true'],
      // 035 site-prison [fill] source-layer=sites
      ['((${_layer} === "sites") && ((${kind} === "prison")))', 'true'],
      // 036 site-parking [fill] source-layer=sites
      ['((${_layer} === "sites") && ((${kind} === "parking")))', 'true'],
      // 037 site-bicycleparking [fill] source-layer=sites
      ['((${_layer} === "sites") && ((${kind} === "bicycle_parking")))', 'true'],
      // 038 site-construction [fill] source-layer=sites
      ['((${_layer} === "sites") && ((${kind} === "construction")))', 'true'],
      // 039 airport-area [fill] source-layer=street_polygons
      ['((${_layer} === "street_polygons") && ((${kind} === "runway") || (${kind} === "taxiway")))', 'true'],
      // 040 airport-taxiway:outline [line] source-layer=streets
      ['((${_layer} === "streets") && (${kind} === "taxiway"))', 'true'],
      // 041 airport-runway:outline [line] source-layer=streets
      ['((${_layer} === "streets") && (${kind} === "runway"))', 'true'],
      // 042 airport-taxiway [line] source-layer=streets
      ['((${_layer} === "streets") && (${kind} === "taxiway"))', 'true'],
      // 043 airport-runway [line] source-layer=streets
      ['((${_layer} === "streets") && (${kind} === "runway"))', 'true'],
      // 044 building:outline [fill] source-layer=buildings
      ['((${_layer} === "buildings") && true)', 'true'],
      // 045 building [fill] source-layer=buildings
      ['((${_layer} === "buildings") && true)', 'true'],
      // 046 tunnel-street-pedestrian-zone [fill] source-layer=street_polygons
      ['((${_layer} === "street_polygons") && ((${tunnel} === true) && (${kind} === "pedestrian")))', 'true'],
      // 047 tunnel-way-footway:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "footway"))))', 'true'],
      // 048 tunnel-way-steps:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "steps"))))', 'true'],
      // 049 tunnel-way-path:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "path"))))', 'true'],
      // 050 tunnel-way-cycleway:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "cycleway"))))', 'true'],
      // 051 tunnel-street-track:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "track") && (${tunnel} === true)))', 'true'],
      // 052 tunnel-street-pedestrian:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${tunnel} === true)))', 'true'],
      // 053 tunnel-street-service:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "service") && (${tunnel} === true)))', 'true'],
      // 054 tunnel-street-livingstreet:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${tunnel} === true)))', 'true'],
      // 055 tunnel-street-residential:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${tunnel} === true)))', 'true'],
      // 056 tunnel-street-unclassified:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${tunnel} === true)))', 'true'],
      // 057 tunnel-street-busway:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${tunnel} === true)))', 'true'],
      // 058 tunnel-street-busguideway:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${tunnel} === true)))', 'true'],
      // 059 tunnel-street-tertiary-link:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "tertiary")) && (${link} === true)))', 'true'],
      // 060 tunnel-street-secondary-link:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "secondary")) && (${link} === true)))', 'true'],
      // 061 tunnel-street-primary-link:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "primary")) && (${link} === true)))', 'true'],
      // 062 tunnel-street-trunk-link:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "trunk")) && (${link} === true)))', 'true'],
      // 063 tunnel-street-motorway-link:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "motorway")) && (${link} === true)))', 'true'],
      // 064 tunnel-street-tertiary:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "tertiary")) && (${link} !== true)))', 'true'],
      // 065 tunnel-street-secondary:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "secondary")) && (${link} !== true)))', 'true'],
      // 066 tunnel-street-primary:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "primary")) && (${link} !== true)))', 'true'],
      // 067 tunnel-street-trunk:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "trunk")) && (${link} !== true)))', 'true'],
      // 068 tunnel-street-motorway:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "motorway")) && (${link} !== true)))', 'true'],
      // 069 tunnel-way-footway [line] source-layer=streets
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "footway"))))', 'true'],
      // 070 tunnel-way-steps [line] source-layer=streets
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "steps"))))', 'true'],
      // 071 tunnel-way-path [line] source-layer=streets
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "path"))))', 'true'],
      // 072 tunnel-way-cycleway [line] source-layer=streets
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "cycleway"))))', 'true'],
      // 073 tunnel-street-track [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "track") && (${tunnel} === true)))', 'true'],
      // 074 tunnel-street-pedestrian [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${tunnel} === true)))', 'true'],
      // 075 tunnel-street-service [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "service") && (${tunnel} === true)))', 'true'],
      // 076 tunnel-street-livingstreet [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${tunnel} === true)))', 'true'],
      // 077 tunnel-street-residential [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${tunnel} === true)))', 'true'],
      // 078 tunnel-street-unclassified [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${tunnel} === true)))', 'true'],
      // 079 tunnel-street-busway [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${tunnel} === true)))', 'true'],
      // 080 tunnel-street-busguideway [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${tunnel} === true)))', 'true'],
      // 081 tunnel-street-track-bicycle [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bicycle} === "designated") && (${tunnel} === true)))', 'true'],
      // 082 tunnel-street-pedestrian-bicycle [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bicycle} === "designated") && (${tunnel} === true)))', 'true'],
      // 083 tunnel-street-service-bicycle [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bicycle} === "designated") && (${tunnel} === true)))', 'true'],
      // 084 tunnel-street-livingstreet-bicycle [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bicycle} === "designated") && (${tunnel} === true)))', 'true'],
      // 085 tunnel-street-residential-bicycle [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bicycle} === "designated") && (${tunnel} === true)))', 'true'],
      // 086 tunnel-street-unclassified-bicycle [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bicycle} === "designated") && (${tunnel} === true)))', 'true'],
      // 087 tunnel-street-tertiary-link [line] source-layer=streets
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "tertiary")) && (${link} === true)))', 'true'],
      // 088 tunnel-street-secondary-link [line] source-layer=streets
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "secondary")) && (${link} === true)))', 'true'],
      // 089 tunnel-street-primary-link [line] source-layer=streets
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "primary")) && (${link} === true)))', 'true'],
      // 090 tunnel-street-trunk-link [line] source-layer=streets
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "trunk")) && (${link} === true)))', 'true'],
      // 091 tunnel-street-motorway-link [line] source-layer=streets
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "motorway")) && (${link} === true)))', 'true'],
      // 092 tunnel-street-tertiary [line] source-layer=streets
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "tertiary")) && (${link} !== true)))', 'true'],
      // 093 tunnel-street-secondary [line] source-layer=streets
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "secondary")) && (${link} !== true)))', 'true'],
      // 094 tunnel-street-primary [line] source-layer=streets
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "primary")) && (${link} !== true)))', 'true'],
      // 095 tunnel-street-trunk [line] source-layer=streets
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "trunk")) && (${link} !== true)))', 'true'],
      // 096 tunnel-street-motorway [line] source-layer=streets
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "motorway")) && (${link} !== true)))', 'true'],
      // 097 tunnel-transport-tram:outline [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${tunnel} === true)))', 'true'],
      // 098 tunnel-transport-narrowgauge:outline [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${tunnel} === true)))', 'true'],
      // 099 tunnel-transport-subway:outline [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${tunnel} === true)))', 'true'],
      // 100 tunnel-transport-lightrail:outline [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${tunnel} === true)))', 'true'],
      // 101 tunnel-transport-lightrail-service:outline [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${tunnel} === true)))', 'true'],
      // 102 tunnel-transport-rail:outline [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${tunnel} === true)))', 'true'],
      // 103 tunnel-transport-rail-service:outline [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${tunnel} === true)))', 'true'],
      // 104 tunnel-transport-monorail:outline [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "monorail")) && (${tunnel} === true)))', 'true'],
      // 105 tunnel-transport-funicular:outline [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "funicular")) && (${tunnel} === true)))', 'true'],
      // 106 tunnel-transport-tram [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${tunnel} === true)))', 'true'],
      // 107 tunnel-transport-narrowgauge [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${tunnel} === true)))', 'true'],
      // 108 tunnel-transport-subway [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${tunnel} === true)))', 'true'],
      // 109 tunnel-transport-lightrail [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${tunnel} === true)))', 'true'],
      // 110 tunnel-transport-lightrail-service [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${tunnel} === true)))', 'true'],
      // 111 tunnel-transport-rail [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${tunnel} === true)))', 'true'],
      // 112 tunnel-transport-rail-service [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${tunnel} === true)))', 'true'],
      // 113 tunnel-transport-monorail [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "monorail")) && (${tunnel} === true)))', 'true'],
      // 114 tunnel-transport-funicular [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "funicular")) && (${tunnel} === true)))', 'true'],
      // 115 bridge [fill] source-layer=bridges
      ['((${_layer} === "bridges") && true)', 'true'],
      // 116 street-pedestrian-zone [fill] source-layer=street_polygons
      ['((${_layer} === "street_polygons") && ((${bridge} !== true) && (${tunnel} !== true) && (${kind} === "pedestrian")))', 'true'],
      // 117 way-footway:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "footway"))))', 'true'],
      // 118 way-steps:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "steps"))))', 'true'],
      // 119 way-path:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "path"))))', 'true'],
      // 120 way-cycleway:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "cycleway"))))', 'true'],
      // 121 street-track:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bridge} !== true) && (${tunnel} !== true)))', 'true'],
      // 122 street-pedestrian:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bridge} !== true) && (${tunnel} !== true)))', 'true'],
      // 123 street-service:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bridge} !== true) && (${tunnel} !== true)))', 'true'],
      // 124 street-livingstreet:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bridge} !== true) && (${tunnel} !== true)))', 'true'],
      // 125 street-residential:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bridge} !== true) && (${tunnel} !== true)))', 'true'],
      // 126 street-unclassified:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bridge} !== true) && (${tunnel} !== true)))', 'true'],
      // 127 street-busway:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${bridge} !== true) && (${tunnel} !== true)))', 'true'],
      // 128 street-busguideway:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${bridge} !== true) && (${tunnel} !== true)))', 'true'],
      // 129 street-tertiary-link:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "tertiary")) && (${link} === true)))', 'true'],
      // 130 street-secondary-link:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "secondary")) && (${link} === true)))', 'true'],
      // 131 street-primary-link:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "primary")) && (${link} === true)))', 'true'],
      // 132 street-trunk-link:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "trunk")) && (${link} === true)))', 'true'],
      // 133 street-motorway-link:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "motorway")) && (${link} === true)))', 'true'],
      // 134 street-tertiary:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "tertiary")) && (${link} !== true)))', 'true'],
      // 135 street-secondary:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "secondary")) && (${link} !== true)))', 'true'],
      // 136 street-primary:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "primary")) && (${link} !== true)))', 'true'],
      // 137 street-trunk:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "trunk")) && (${link} !== true)))', 'true'],
      // 138 street-motorway:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "motorway")) && (${link} !== true)))', 'true'],
      // 139 way-footway [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "footway"))))', 'true'],
      // 140 way-steps [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "steps"))))', 'true'],
      // 141 way-path [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "path"))))', 'true'],
      // 142 way-cycleway [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "cycleway"))))', 'true'],
      // 143 street-track [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bridge} !== true) && (${tunnel} !== true)))', 'true'],
      // 144 street-pedestrian [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bridge} !== true) && (${tunnel} !== true)))', 'true'],
      // 145 street-service [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bridge} !== true) && (${tunnel} !== true)))', 'true'],
      // 146 street-livingstreet [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bridge} !== true) && (${tunnel} !== true)))', 'true'],
      // 147 street-residential [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bridge} !== true) && (${tunnel} !== true)))', 'true'],
      // 148 street-unclassified [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bridge} !== true) && (${tunnel} !== true)))', 'true'],
      // 149 street-busway [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${bridge} !== true) && (${tunnel} !== true)))', 'true'],
      // 150 street-busguideway [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${bridge} !== true) && (${tunnel} !== true)))', 'true'],
      // 151 street-track-bicycle [line] source-layer=streets
      [
        '((${_layer} === "streets") && ((${kind} === "track") && (${bicycle} === "designated") && (${bridge} !== true) && (${tunnel} !== true)))',
        'true',
      ],
      // 152 street-pedestrian-bicycle [line] source-layer=streets
      [
        '((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bicycle} === "designated") && (${bridge} !== true) && (${tunnel} !== true)))',
        'true',
      ],
      // 153 street-service-bicycle [line] source-layer=streets
      [
        '((${_layer} === "streets") && ((${kind} === "service") && (${bicycle} === "designated") && (${bridge} !== true) && (${tunnel} !== true)))',
        'true',
      ],
      // 154 street-livingstreet-bicycle [line] source-layer=streets
      [
        '((${_layer} === "streets") && ((${kind} === "living_street") && (${bicycle} === "designated") && (${bridge} !== true) && (${tunnel} !== true)))',
        'true',
      ],
      // 155 street-residential-bicycle [line] source-layer=streets
      [
        '((${_layer} === "streets") && ((${kind} === "residential") && (${bicycle} === "designated") && (${bridge} !== true) && (${tunnel} !== true)))',
        'true',
      ],
      // 156 street-unclassified-bicycle [line] source-layer=streets
      [
        '((${_layer} === "streets") && ((${kind} === "unclassified") && (${bicycle} === "designated") && (${bridge} !== true) && (${tunnel} !== true)))',
        'true',
      ],
      // 157 street-tertiary-link [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "tertiary")) && (${link} === true)))', 'true'],
      // 158 street-secondary-link [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "secondary")) && (${link} === true)))', 'true'],
      // 159 street-primary-link [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "primary")) && (${link} === true)))', 'true'],
      // 160 street-trunk-link [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "trunk")) && (${link} === true)))', 'true'],
      // 161 street-motorway-link [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "motorway")) && (${link} === true)))', 'true'],
      // 162 street-tertiary [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "tertiary")) && (${link} !== true)))', 'true'],
      // 163 street-secondary [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "secondary")) && (${link} !== true)))', 'true'],
      // 164 street-primary [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "primary")) && (${link} !== true)))', 'true'],
      // 165 street-trunk [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "trunk")) && (${link} !== true)))', 'true'],
      // 166 street-motorway [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "motorway")) && (${link} !== true)))', 'true'],
      // 167 transport-tram:outline [line] source-layer=streets
      [
        '((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'true',
      ],
      // 168 transport-narrowgauge:outline [line] source-layer=streets
      [
        '((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'true',
      ],
      // 169 transport-subway:outline [line] source-layer=streets
      [
        '((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'true',
      ],
      // 170 transport-lightrail:outline [line] source-layer=streets
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'true',
      ],
      // 171 transport-lightrail-service:outline [line] source-layer=streets
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'true',
      ],
      // 172 transport-rail:outline [line] source-layer=streets
      [
        '((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'true',
      ],
      // 173 transport-rail-service:outline [line] source-layer=streets
      [
        '((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'true',
      ],
      // 174 transport-monorail:outline [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "monorail")) && (${bridge} !== true) && (${tunnel} !== true)))', 'true'],
      // 175 transport-funicular:outline [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "funicular")) && (${bridge} !== true) && (${tunnel} !== true)))', 'true'],
      // 176 transport-tram [line] source-layer=streets
      [
        '((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'true',
      ],
      // 177 transport-narrowgauge [line] source-layer=streets
      [
        '((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'true',
      ],
      // 178 transport-subway [line] source-layer=streets
      [
        '((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'true',
      ],
      // 179 transport-lightrail [line] source-layer=streets
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'true',
      ],
      // 180 transport-lightrail-service [line] source-layer=streets
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'true',
      ],
      // 181 transport-rail [line] source-layer=streets
      [
        '((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'true',
      ],
      // 182 transport-rail-service [line] source-layer=streets
      [
        '((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'true',
      ],
      // 183 transport-monorail [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "monorail")) && (${bridge} !== true) && (${tunnel} !== true)))', 'true'],
      // 184 transport-funicular [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "funicular")) && (${bridge} !== true) && (${tunnel} !== true)))', 'true'],
      // 185 transport-ferry [line] source-layer=ferries
      ['((${_layer} === "ferries") && true)', 'true'],
      // 186 bridge-way-footway:bridge [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "footway"))))', 'true'],
      // 187 bridge-way-steps:bridge [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "steps"))))', 'true'],
      // 188 bridge-way-path:bridge [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "path"))))', 'true'],
      // 189 bridge-way-cycleway:bridge [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "cycleway"))))', 'true'],
      // 190 bridge-street-track:bridge [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bridge} === true)))', 'true'],
      // 191 bridge-street-pedestrian:bridge [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bridge} === true)))', 'true'],
      // 192 bridge-street-service:bridge [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bridge} === true)))', 'true'],
      // 193 bridge-street-livingstreet:bridge [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bridge} === true)))', 'true'],
      // 194 bridge-street-residential:bridge [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bridge} === true)))', 'true'],
      // 195 bridge-street-unclassified:bridge [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bridge} === true)))', 'true'],
      // 196 bridge-street-busway:bridge [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${bridge} === true)))', 'true'],
      // 197 bridge-street-busguideway:bridge [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${bridge} === true)))', 'true'],
      // 198 bridge-street-tertiary-link:bridge [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} === true)))', 'true'],
      // 199 bridge-street-secondary-link:bridge [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} === true)))', 'true'],
      // 200 bridge-street-primary-link:bridge [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} === true)))', 'true'],
      // 201 bridge-street-trunk-link:bridge [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} === true)))', 'true'],
      // 202 bridge-street-motorway-link:bridge [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} === true)))', 'true'],
      // 203 bridge-street-tertiary:bridge [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} !== true)))', 'true'],
      // 204 bridge-street-secondary:bridge [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} !== true)))', 'true'],
      // 205 bridge-street-primary:bridge [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} !== true)))', 'true'],
      // 206 bridge-street-trunk:bridge [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} !== true)))', 'true'],
      // 207 bridge-street-motorway:bridge [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} !== true)))', 'true'],
      // 208 bridge-street-pedestrian-zone [fill] source-layer=street_polygons
      ['((${_layer} === "street_polygons") && ((${bridge} === true) && (${kind} === "pedestrian")))', 'true'],
      // 209 bridge-way-footway:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "footway"))))', 'true'],
      // 210 bridge-way-steps:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "steps"))))', 'true'],
      // 211 bridge-way-path:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "path"))))', 'true'],
      // 212 bridge-way-cycleway:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "cycleway"))))', 'true'],
      // 213 bridge-street-track:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bridge} === true)))', 'true'],
      // 214 bridge-street-pedestrian:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bridge} === true)))', 'true'],
      // 215 bridge-street-service:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bridge} === true)))', 'true'],
      // 216 bridge-street-livingstreet:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bridge} === true)))', 'true'],
      // 217 bridge-street-residential:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bridge} === true)))', 'true'],
      // 218 bridge-street-unclassified:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bridge} === true)))', 'true'],
      // 219 bridge-street-busway:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${bridge} === true)))', 'true'],
      // 220 bridge-street-busguideway:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${bridge} === true)))', 'true'],
      // 221 bridge-street-tertiary-link:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} === true)))', 'true'],
      // 222 bridge-street-secondary-link:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} === true)))', 'true'],
      // 223 bridge-street-primary-link:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} === true)))', 'true'],
      // 224 bridge-street-trunk-link:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} === true)))', 'true'],
      // 225 bridge-street-motorway-link:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} === true)))', 'true'],
      // 226 bridge-street-tertiary:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} !== true)))', 'true'],
      // 227 bridge-street-secondary:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} !== true)))', 'true'],
      // 228 bridge-street-primary:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} !== true)))', 'true'],
      // 229 bridge-street-trunk:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} !== true)))', 'true'],
      // 230 bridge-street-motorway:outline [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} !== true)))', 'true'],
      // 231 bridge-way-footway [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "footway"))))', 'true'],
      // 232 bridge-way-steps [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "steps"))))', 'true'],
      // 233 bridge-way-path [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "path"))))', 'true'],
      // 234 bridge-way-cycleway [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "cycleway"))))', 'true'],
      // 235 bridge-street-track [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bridge} === true)))', 'true'],
      // 236 bridge-street-pedestrian [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bridge} === true)))', 'true'],
      // 237 bridge-street-service [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bridge} === true)))', 'true'],
      // 238 bridge-street-livingstreet [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bridge} === true)))', 'true'],
      // 239 bridge-street-residential [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bridge} === true)))', 'true'],
      // 240 bridge-street-unclassified [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bridge} === true)))', 'true'],
      // 241 bridge-street-busway [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${bridge} === true)))', 'true'],
      // 242 bridge-street-busguideway [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${bridge} === true)))', 'true'],
      // 243 bridge-street-track-bicycle [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bicycle} === "designated") && (${bridge} === true)))', 'true'],
      // 244 bridge-street-pedestrian-bicycle [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bicycle} === "designated") && (${bridge} === true)))', 'true'],
      // 245 bridge-street-service-bicycle [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bicycle} === "designated") && (${bridge} === true)))', 'true'],
      // 246 bridge-street-livingstreet-bicycle [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bicycle} === "designated") && (${bridge} === true)))', 'true'],
      // 247 bridge-street-residential-bicycle [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bicycle} === "designated") && (${bridge} === true)))', 'true'],
      // 248 bridge-street-unclassified-bicycle [line] source-layer=streets
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bicycle} === "designated") && (${bridge} === true)))', 'true'],
      // 249 bridge-street-tertiary-link [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} === true)))', 'true'],
      // 250 bridge-street-secondary-link [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} === true)))', 'true'],
      // 251 bridge-street-primary-link [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} === true)))', 'true'],
      // 252 bridge-street-trunk-link [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} === true)))', 'true'],
      // 253 bridge-street-motorway-link [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} === true)))', 'true'],
      // 254 bridge-street-tertiary [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} !== true)))', 'true'],
      // 255 bridge-street-secondary [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} !== true)))', 'true'],
      // 256 bridge-street-primary [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} !== true)))', 'true'],
      // 257 bridge-street-trunk [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} !== true)))', 'true'],
      // 258 bridge-street-motorway [line] source-layer=streets
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} !== true)))', 'true'],
      // 259 bridge-transport-tram:outline [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${bridge} === true)))', 'true'],
      // 260 bridge-transport-narrowgauge:outline [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${bridge} === true)))', 'true'],
      // 261 bridge-transport-subway:outline [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${bridge} === true)))', 'true'],
      // 262 bridge-transport-lightrail:outline [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${bridge} === true)))', 'true'],
      // 263 bridge-transport-lightrail-service:outline [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${bridge} === true)))', 'true'],
      // 264 bridge-transport-rail:outline [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${bridge} === true)))', 'true'],
      // 265 bridge-transport-rail-service:outline [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${bridge} === true)))', 'true'],
      // 266 bridge-transport-monorail:outline [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "monorail")) && (${bridge} === true)))', 'true'],
      // 267 bridge-transport-funicular:outline [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "funicular")) && (${bridge} === true)))', 'true'],
      // 268 bridge-transport-tram [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${bridge} === true)))', 'true'],
      // 269 bridge-transport-narrowgauge [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${bridge} === true)))', 'true'],
      // 270 bridge-transport-subway [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${bridge} === true)))', 'true'],
      // 271 bridge-transport-lightrail [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${bridge} === true)))', 'true'],
      // 272 bridge-transport-lightrail-service [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${bridge} === true)))', 'true'],
      // 273 bridge-transport-rail [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${bridge} === true)))', 'true'],
      // 274 bridge-transport-rail-service [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${bridge} === true)))', 'true'],
      // 275 bridge-transport-monorail [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "monorail")) && (${bridge} === true)))', 'true'],
      // 276 bridge-transport-funicular [line] source-layer=streets
      ['((${_layer} === "streets") && (((${kind} === "funicular")) && (${bridge} === true)))', 'true'],
      // 277 poi-amenity [symbol] source-layer=pois
      ['((${_layer} === "pois") && (${amenity} !== undefined))', 'true'],
      // 278 poi-leisure [symbol] source-layer=pois
      ['((${_layer} === "pois") && (${leisure} !== undefined))', 'true'],
      // 279 poi-tourism [symbol] source-layer=pois
      ['((${_layer} === "pois") && (${tourism} !== undefined))', 'true'],
      // 280 poi-shop [symbol] source-layer=pois
      ['((${_layer} === "pois") && (${shop} !== undefined))', 'true'],
      // 281 poi-man_made [symbol] source-layer=pois
      ['((${_layer} === "pois") && (${man_made} !== undefined))', 'true'],
      // 282 poi-historic [symbol] source-layer=pois
      ['((${_layer} === "pois") && (${historic} !== undefined))', 'true'],
      // 283 poi-emergency [symbol] source-layer=pois
      ['((${_layer} === "pois") && (${emergency} !== undefined))', 'true'],
      // 284 poi-highway [symbol] source-layer=pois
      ['((${_layer} === "pois") && (${highway} !== undefined))', 'true'],
      // 285 poi-office [symbol] source-layer=pois
      ['((${_layer} === "pois") && (${office} !== undefined))', 'true'],
      // 286 boundary-country:outline [line] source-layer=boundaries
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 2) && (${maritime} !== true) && (${disputed} !== true) && (${coastline} !== true)))',
        'true',
      ],
      // 287 boundary-country-disputed:outline [line] source-layer=boundaries
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 2) && (${disputed} === true) && (${maritime} !== true) && (${coastline} !== true)))',
        'true',
      ],
      // 288 boundary-state:outline [line] source-layer=boundaries
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 4) && (${maritime} !== true) && (${disputed} !== true) && (${coastline} !== true)))',
        'true',
      ],
      // 289 boundary-country [line] source-layer=boundaries
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 2) && (${maritime} !== true) && (${disputed} !== true) && (${coastline} !== true)))',
        'true',
      ],
      // 290 boundary-country-disputed [line] source-layer=boundaries
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 2) && (${disputed} === true) && (${maritime} !== true) && (${coastline} !== true)))',
        'true',
      ],
      // 291 boundary-state [line] source-layer=boundaries
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 4) && (${maritime} !== true) && (${disputed} !== true) && (${coastline} !== true)))',
        'true',
      ],
      // 292 label-address-housenumber [symbol] source-layer=addresses
      ['((${_layer} === "addresses") && (${housenumber} !== undefined))', 'true'],
      // 293 label-motorway-shield [symbol] source-layer=street_labels
      ['((${_layer} === "street_labels") && (${kind} === "motorway"))', 'true'],
      // 294 label-street-pedestrian [symbol] source-layer=street_labels
      ['((${_layer} === "street_labels") && (${kind} === "pedestrian"))', 'true'],
      // 295 label-street-livingstreet [symbol] source-layer=street_labels
      ['((${_layer} === "street_labels") && (${kind} === "living_street"))', 'true'],
      // 296 label-street-residential [symbol] source-layer=street_labels
      ['((${_layer} === "street_labels") && (${kind} === "residential"))', 'true'],
      // 297 label-street-unclassified [symbol] source-layer=street_labels
      ['((${_layer} === "street_labels") && (${kind} === "unclassified"))', 'true'],
      // 298 label-street-tertiary [symbol] source-layer=street_labels
      ['((${_layer} === "street_labels") && (${kind} === "tertiary"))', 'true'],
      // 299 label-street-secondary [symbol] source-layer=street_labels
      ['((${_layer} === "street_labels") && (${kind} === "secondary"))', 'true'],
      // 300 label-street-primary [symbol] source-layer=street_labels
      ['((${_layer} === "street_labels") && (${kind} === "primary"))', 'true'],
      // 301 label-street-trunk [symbol] source-layer=street_labels
      ['((${_layer} === "street_labels") && (${kind} === "trunk"))', 'true'],
      // 302 label-street-track [symbol] source-layer=street_labels
      ['((${_layer} === "street_labels") && (${kind} === "track"))', 'true'],
      // 303 label-place-neighbourhood [symbol] source-layer=place_labels
      ['((${_layer} === "place_labels") && (${kind} === "neighbourhood"))', 'true'],
      // 304 label-place-quarter [symbol] source-layer=place_labels
      ['((${_layer} === "place_labels") && (${kind} === "quarter"))', 'true'],
      // 305 label-place-suburb [symbol] source-layer=place_labels
      ['((${_layer} === "place_labels") && (${kind} === "suburb"))', 'true'],
      // 306 label-place-hamlet [symbol] source-layer=place_labels
      ['((${_layer} === "place_labels") && (${kind} === "hamlet"))', 'true'],
      // 307 label-place-village [symbol] source-layer=place_labels
      ['((${_layer} === "place_labels") && (${kind} === "village"))', 'true'],
      // 308 label-place-town [symbol] source-layer=place_labels
      ['((${_layer} === "place_labels") && (${kind} === "town"))', 'true'],
      // 309 label-boundary-state [symbol] source-layer=boundary_labels
      ['((${_layer} === "boundary_labels") && ((${admin_level} === 4) || (${admin_level} === "4")))', 'true'],
      // 310 label-place-city [symbol] source-layer=place_labels
      ['((${_layer} === "place_labels") && (${kind} === "city"))', 'true'],
      // 311 label-place-statecapital [symbol] source-layer=place_labels
      ['((${_layer} === "place_labels") && (${kind} === "state_capital"))', 'true'],
      // 312 label-place-capital [symbol] source-layer=place_labels
      ['((${_layer} === "place_labels") && (${kind} === "capital"))', 'true'],
      // 313 label-boundary-country-small [symbol] source-layer=boundary_labels
      ['((${_layer} === "boundary_labels") && (((${admin_level} === 2) || (${admin_level} === "2")) && (${way_area} <= 10000000)))', 'true'],
      // 314 label-boundary-country-medium [symbol] source-layer=boundary_labels
      [
        '((${_layer} === "boundary_labels") && (((${admin_level} === 2) || (${admin_level} === "2")) && (${way_area} < 90000000) && (${way_area} > 10000000)))',
        'true',
      ],
      // 315 label-boundary-country-large [symbol] source-layer=boundary_labels
      ['((${_layer} === "boundary_labels") && (((${admin_level} === 2) || (${admin_level} === "2")) && (${way_area} >= 90000000)))', 'true'],
      // 316 marking-oneway [symbol] source-layer=streets
      [
        '((${_layer} === "streets") && ((${oneway} === true) && ((${kind} === "trunk") || (${kind} === "primary") || (${kind} === "secondary") || (${kind} === "tertiary") || (${kind} === "unclassified") || (${kind} === "residential") || (${kind} === "living_street"))))',
        'true',
      ],
      // 317 marking-oneway-reverse [symbol] source-layer=streets
      [
        '((${_layer} === "streets") && ((${oneway_reverse} === true) && ((${kind} === "trunk") || (${kind} === "primary") || (${kind} === "secondary") || (${kind} === "tertiary") || (${kind} === "unclassified") || (${kind} === "residential") || (${kind} === "living_street"))))',
        'true',
      ],
      // 318 symbol-transit-bus [symbol] source-layer=public_transport
      ['((${_layer} === "public_transport") && (${kind} === "bus_stop"))', 'true'],
      // 319 symbol-transit-tram [symbol] source-layer=public_transport
      ['((${_layer} === "public_transport") && (${kind} === "tram_stop"))', 'true'],
      // 320 symbol-transit-subway [symbol] source-layer=public_transport
      ['((${_layer} === "public_transport") && (((${kind} === "station") || (${kind} === "halt")) && (${station} === "subway")))', 'true'],
      // 321 symbol-transit-lightrail [symbol] source-layer=public_transport
      ['((${_layer} === "public_transport") && (((${kind} === "station") || (${kind} === "halt")) && (${station} === "light_rail")))', 'true'],
      // 322 symbol-transit-station [symbol] source-layer=public_transport
      [
        '((${_layer} === "public_transport") && (((${kind} === "station") || (${kind} === "halt")) && ((${station} !== "light_rail") && (${station} !== "subway"))))',
        'true',
      ],
      // 323 symbol-transit-airfield [symbol] source-layer=public_transport
      ['((${_layer} === "public_transport") && ((${kind} === "aerodrome") && (${iata} === undefined)))', 'true'],
      // 324 symbol-transit-airport [symbol] source-layer=public_transport
      ['((${_layer} === "public_transport") && ((${kind} === "aerodrome") && (${iata} !== undefined)))', 'true'],
      ['true', 'false'],
    ],
  },
  color: {
    conditions: [
      // 002 water-ocean [fill color]
      ['((${_layer} === "ocean") && true)', 'rgba(82, 82, 82, 1)'],
      // 003 land-glacier [fill color]
      ['((${_layer} === "water_polygons") && (${kind} === "glacier"))', 'rgba(51, 51, 51, 1)'],
      // 004 land-commercial [fill color]
      ['((${_layer} === "land") && ((${kind} === "commercial") || (${kind} === "retail")))', 'rgba(67, 67, 67, 0.251)'],
      // 005 land-industrial [fill color]
      ['((${_layer} === "land") && ((${kind} === "industrial") || (${kind} === "quarry") || (${kind} === "railway")))', 'rgba(75, 75, 75, 0.333)'],
      // 006 land-residential [fill color]
      ['((${_layer} === "land") && ((${kind} === "garages") || (${kind} === "residential")))', 'rgba(71, 71, 71, 0.2)'],
      // 007 land-agriculture [fill color]
      [
        '((${_layer} === "land") && ((${kind} === "brownfield") || (${kind} === "farmland") || (${kind} === "farmyard") || (${kind} === "greenfield") || (${kind} === "greenhouse_horticulture") || (${kind} === "orchard") || (${kind} === "plant_nursery") || (${kind} === "vineyard")))',
        'rgba(75, 75, 75, 1)',
      ],
      // 008 land-waste [fill color]
      ['((${_layer} === "land") && ((${kind} === "landfill")))', 'rgba(92, 92, 92, 1)'],
      // 009 land-park [fill color]
      [
        '((${_layer} === "land") && ((${kind} === "park") || (${kind} === "village_green") || (${kind} === "recreation_ground")))',
        'rgba(102, 102, 102, 1)',
      ],
      // 010 land-garden [fill color]
      ['((${_layer} === "land") && ((${kind} === "allotments") || (${kind} === "garden")))', 'rgba(102, 102, 102, 1)'],
      // 011 land-burial [fill color]
      ['((${_layer} === "land") && ((${kind} === "cemetery") || (${kind} === "grave_yard")))', 'rgba(86, 86, 86, 1)'],
      // 012 land-leisure [fill color]
      [
        '((${_layer} === "land") && ((${kind} === "miniature_golf") || (${kind} === "playground") || (${kind} === "golf_course")))',
        'rgba(71, 71, 71, 1)',
      ],
      // 013 land-rock [fill color]
      ['((${_layer} === "land") && ((${kind} === "bare_rock") || (${kind} === "scree") || (${kind} === "shingle")))', 'rgba(74, 74, 74, 1)'],
      // 014 land-forest [fill color]
      ['((${_layer} === "land") && ((${kind} === "forest")))', 'rgba(160, 160, 160, 0.1)'],
      // 015 land-grass [fill color]
      [
        '((${_layer} === "land") && ((${kind} === "grass") || (${kind} === "grassland") || (${kind} === "meadow") || (${kind} === "wet_meadow")))',
        'rgba(82, 82, 82, 1)',
      ],
      // 016 land-vegetation [fill color]
      ['((${_layer} === "land") && ((${kind} === "heath") || (${kind} === "scrub")))', 'rgba(102, 102, 102, 1)'],
      // 017 land-sand [fill color]
      ['((${_layer} === "land") && ((${kind} === "beach") || (${kind} === "sand")))', 'rgba(60, 60, 60, 1)'],
      // 018 land-wetland [fill color]
      [
        '((${_layer} === "land") && ((${kind} === "bog") || (${kind} === "marsh") || (${kind} === "string_bog") || (${kind} === "swamp")))',
        'rgba(79, 79, 79, 1)',
      ],
      // 019 water-river [line color]
      ['((${_layer} === "water_lines") && (((${kind} === "river")) && (${tunnel} !== true) && (${bridge} !== true)))', 'rgba(82, 82, 82, 1)'],
      // 020 water-canal [line color]
      ['((${_layer} === "water_lines") && (((${kind} === "canal")) && (${tunnel} !== true) && (${bridge} !== true)))', 'rgba(82, 82, 82, 1)'],
      // 021 water-stream [line color]
      ['((${_layer} === "water_lines") && (((${kind} === "stream")) && (${tunnel} !== true) && (${bridge} !== true)))', 'rgba(82, 82, 82, 1)'],
      // 022 water-ditch [line color]
      ['((${_layer} === "water_lines") && (((${kind} === "ditch")) && (${tunnel} !== true) && (${bridge} !== true)))', 'rgba(82, 82, 82, 1)'],
      // 023 water-area [fill color]
      ['((${_layer} === "water_polygons") && (${kind} === "water"))', 'rgba(82, 82, 82, 1)'],
      // 024 water-area-river [fill color]
      ['((${_layer} === "water_polygons") && (${kind} === "river"))', 'rgba(82, 82, 82, 1)'],
      // 025 water-area-small [fill color]
      ['((${_layer} === "water_polygons") && ((${kind} === "reservoir") || (${kind} === "basin") || (${kind} === "dock")))', 'rgba(82, 82, 82, 1)'],
      // 026 water-dam-area [fill color]
      ['((${_layer} === "dam_polygons") && (${kind} === "dam"))', 'rgba(60, 60, 60, 1)'],
      // 027 water-dam [line color]
      ['((${_layer} === "dam_lines") && (${kind} === "dam"))', 'rgba(82, 82, 82, 1)'],
      // 028 water-pier-area [fill color]
      ['((${_layer} === "pier_polygons") && ((${kind} === "pier") || (${kind} === "breakwater") || (${kind} === "groyne")))', 'rgba(60, 60, 60, 1)'],
      // 029 water-pier [line color]
      ['((${_layer} === "pier_lines") && ((${kind} === "pier") || (${kind} === "breakwater") || (${kind} === "groyne")))', 'rgba(60, 60, 60, 1)'],
      // 030 site-dangerarea [fill color]
      ['((${_layer} === "sites") && ((${kind} === "danger_area")))', 'rgba(153, 153, 153, 0.3)'],
      // 031 site-university [fill color]
      ['((${_layer} === "sites") && ((${kind} === "university")))', 'rgba(102, 102, 102, 0.1)'],
      // 032 site-college [fill color]
      ['((${_layer} === "sites") && ((${kind} === "college")))', 'rgba(102, 102, 102, 0.1)'],
      // 033 site-school [fill color]
      ['((${_layer} === "sites") && ((${kind} === "school")))', 'rgba(102, 102, 102, 0.1)'],
      // 034 site-hospital [fill color]
      ['((${_layer} === "sites") && ((${kind} === "hospital")))', 'rgba(112, 112, 112, 0.1)'],
      // 035 site-prison [fill color]
      ['((${_layer} === "sites") && ((${kind} === "prison")))', 'rgba(57, 57, 57, 0.1)'],
      // 036 site-parking [fill color]
      ['((${_layer} === "sites") && ((${kind} === "parking")))', 'rgba(69, 69, 69, 1)'],
      // 037 site-bicycleparking [fill color]
      ['((${_layer} === "sites") && ((${kind} === "bicycle_parking")))', 'rgba(69, 69, 69, 1)'],
      // 038 site-construction [fill color]
      ['((${_layer} === "sites") && ((${kind} === "construction")))', 'rgba(120, 120, 120, 0.1)'],
      // 039 airport-area [fill color]
      ['((${_layer} === "street_polygons") && ((${kind} === "runway") || (${kind} === "taxiway")))', 'rgba(51, 51, 51, 0.5)'],
      // 040 airport-taxiway:outline [line color]
      ['((${_layer} === "streets") && (${kind} === "taxiway"))', 'rgba(91, 91, 91, 1)'],
      // 041 airport-runway:outline [line color]
      ['((${_layer} === "streets") && (${kind} === "runway"))', 'rgba(91, 91, 91, 1)'],
      // 042 airport-taxiway [line color]
      ['((${_layer} === "streets") && (${kind} === "taxiway"))', 'rgba(51, 51, 51, 1)'],
      // 043 airport-runway [line color]
      ['((${_layer} === "streets") && (${kind} === "runway"))', 'rgba(51, 51, 51, 1)'],
      // 044 building:outline [fill color]
      ['((${_layer} === "buildings") && true)', 'rgba(80, 80, 80, 1)'],
      // 045 building [fill color]
      ['((${_layer} === "buildings") && true)', 'rgba(68, 68, 68, 1)'],
      // 046 tunnel-street-pedestrian-zone [fill color]
      ['((${_layer} === "street_polygons") && ((${tunnel} === true) && (${kind} === "pedestrian")))', 'rgba(57, 57, 57, 1)'],
      // 047 tunnel-way-footway:outline [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "footway"))))', 'rgba(79, 79, 79, 1)'],
      // 048 tunnel-way-steps:outline [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "steps"))))', 'rgba(79, 79, 79, 1)'],
      // 049 tunnel-way-path:outline [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "path"))))', 'rgba(79, 79, 79, 1)'],
      // 050 tunnel-way-cycleway:outline [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "cycleway"))))', 'rgba(77, 77, 77, 1)'],
      // 051 tunnel-street-track:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${tunnel} === true)))', 'rgba(78, 78, 78, 1)'],
      // 052 tunnel-street-pedestrian:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${tunnel} === true)))', 'rgba(78, 78, 78, 1)'],
      // 053 tunnel-street-service:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${tunnel} === true)))', 'rgba(64, 64, 64, 1)'],
      // 054 tunnel-street-livingstreet:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${tunnel} === true)))', 'rgba(78, 78, 78, 1)'],
      // 055 tunnel-street-residential:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${tunnel} === true)))', 'rgba(78, 78, 78, 1)'],
      // 056 tunnel-street-unclassified:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${tunnel} === true)))', 'rgba(78, 78, 78, 1)'],
      // 057 tunnel-street-busway:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${tunnel} === true)))', 'rgba(64, 64, 64, 1)'],
      // 058 tunnel-street-busguideway:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${tunnel} === true)))', 'rgba(64, 64, 64, 1)'],
      // 059 tunnel-street-tertiary-link:outline [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "tertiary")) && (${link} === true)))', 'rgba(78, 78, 78, 1)'],
      // 060 tunnel-street-secondary-link:outline [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "secondary")) && (${link} === true)))', 'rgba(108, 108, 108, 1)'],
      // 061 tunnel-street-primary-link:outline [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "primary")) && (${link} === true)))', 'rgba(108, 108, 108, 1)'],
      // 062 tunnel-street-trunk-link:outline [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "trunk")) && (${link} === true)))', 'rgba(108, 108, 108, 1)'],
      // 063 tunnel-street-motorway-link:outline [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "motorway")) && (${link} === true)))', 'rgba(108, 108, 108, 1)'],
      // 064 tunnel-street-tertiary:outline [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "tertiary")) && (${link} !== true)))', 'rgba(78, 78, 78, 1)'],
      // 065 tunnel-street-secondary:outline [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "secondary")) && (${link} !== true)))', 'rgba(108, 108, 108, 1)'],
      // 066 tunnel-street-primary:outline [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "primary")) && (${link} !== true)))', 'rgba(108, 108, 108, 1)'],
      // 067 tunnel-street-trunk:outline [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "trunk")) && (${link} !== true)))', 'rgba(108, 108, 108, 1)'],
      // 068 tunnel-street-motorway:outline [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "motorway")) && (${link} !== true)))', 'rgba(108, 108, 108, 1)'],
      // 069 tunnel-way-footway [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "footway"))))', 'rgba(64, 64, 64, 1)'],
      // 070 tunnel-way-steps [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "steps"))))', 'rgba(64, 64, 64, 1)'],
      // 071 tunnel-way-path [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "path"))))', 'rgba(64, 64, 64, 1)'],
      // 072 tunnel-way-cycleway [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "cycleway"))))', 'rgba(61, 61, 61, 1)'],
      // 073 tunnel-street-track [line color]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${tunnel} === true)))', 'rgba(57, 57, 57, 1)'],
      // 074 tunnel-street-pedestrian [line color]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${tunnel} === true)))', 'rgba(57, 57, 57, 1)'],
      // 075 tunnel-street-service [line color]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${tunnel} === true)))', 'rgba(57, 57, 57, 1)'],
      // 076 tunnel-street-livingstreet [line color]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${tunnel} === true)))', 'rgba(57, 57, 57, 1)'],
      // 077 tunnel-street-residential [line color]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${tunnel} === true)))', 'rgba(57, 57, 57, 1)'],
      // 078 tunnel-street-unclassified [line color]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${tunnel} === true)))', 'rgba(57, 57, 57, 1)'],
      // 079 tunnel-street-busway [line color]
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${tunnel} === true)))', 'rgba(57, 57, 57, 1)'],
      // 080 tunnel-street-busguideway [line color]
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${tunnel} === true)))', 'rgba(57, 57, 57, 1)'],
      // 081 tunnel-street-track-bicycle [line color]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bicycle} === "designated") && (${tunnel} === true)))', 'rgba(57, 57, 57, 1)'],
      // 082 tunnel-street-pedestrian-bicycle [line color]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bicycle} === "designated") && (${tunnel} === true)))', 'rgba(57, 57, 57, 1)'],
      // 083 tunnel-street-service-bicycle [line color]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bicycle} === "designated") && (${tunnel} === true)))', 'rgba(57, 57, 57, 1)'],
      // 084 tunnel-street-livingstreet-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "living_street") && (${bicycle} === "designated") && (${tunnel} === true)))',
        'rgba(57, 57, 57, 1)',
      ],
      // 085 tunnel-street-residential-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "residential") && (${bicycle} === "designated") && (${tunnel} === true)))',
        'rgba(57, 57, 57, 1)',
      ],
      // 086 tunnel-street-unclassified-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "unclassified") && (${bicycle} === "designated") && (${tunnel} === true)))',
        'rgba(57, 57, 57, 1)',
      ],
      // 087 tunnel-street-tertiary-link [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "tertiary")) && (${link} === true)))', 'rgba(57, 57, 57, 1)'],
      // 088 tunnel-street-secondary-link [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "secondary")) && (${link} === true)))', 'rgba(77, 77, 77, 1)'],
      // 089 tunnel-street-primary-link [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "primary")) && (${link} === true)))', 'rgba(77, 77, 77, 1)'],
      // 090 tunnel-street-trunk-link [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "trunk")) && (${link} === true)))', 'rgba(77, 77, 77, 1)'],
      // 091 tunnel-street-motorway-link [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "motorway")) && (${link} === true)))', 'rgba(89, 89, 89, 1)'],
      // 092 tunnel-street-tertiary [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "tertiary")) && (${link} !== true)))', 'rgba(57, 57, 57, 1)'],
      // 093 tunnel-street-secondary [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "secondary")) && (${link} !== true)))', 'rgba(77, 77, 77, 1)'],
      // 094 tunnel-street-primary [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "primary")) && (${link} !== true)))', 'rgba(77, 77, 77, 1)'],
      // 095 tunnel-street-trunk [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "trunk")) && (${link} !== true)))', 'rgba(77, 77, 77, 1)'],
      // 096 tunnel-street-motorway [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "motorway")) && (${link} !== true)))', 'rgba(89, 89, 89, 1)'],
      // 097 tunnel-transport-tram:outline [line color]
      ['((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${tunnel} === true)))', 'rgba(106, 106, 106, 1)'],
      // 098 tunnel-transport-narrowgauge:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${tunnel} === true)))',
        'rgba(106, 106, 106, 1)',
      ],
      // 099 tunnel-transport-subway:outline [line color]
      ['((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${tunnel} === true)))', 'rgba(109, 109, 109, 0.5)'],
      // 100 tunnel-transport-lightrail:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${tunnel} === true)))',
        'rgba(106, 106, 106, 0.5)',
      ],
      // 101 tunnel-transport-lightrail-service:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${tunnel} === true)))',
        'rgba(106, 106, 106, 1)',
      ],
      // 102 tunnel-transport-rail:outline [line color]
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${tunnel} === true)))', 'rgba(106, 106, 106, 0.3)'],
      // 103 tunnel-transport-rail-service:outline [line color]
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${tunnel} === true)))', 'rgba(106, 106, 106, 1)'],
      // 104 tunnel-transport-monorail:outline [line color]
      ['((${_layer} === "streets") && (((${kind} === "monorail")) && (${tunnel} === true)))', 'rgba(106, 106, 106, 1)'],
      // 105 tunnel-transport-funicular:outline [line color]
      ['((${_layer} === "streets") && (((${kind} === "funicular")) && (${tunnel} === true)))', 'rgba(106, 106, 106, 1)'],
      // 106 tunnel-transport-tram [line color]
      ['((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${tunnel} === true)))', 'rgba(106, 106, 106, 1)'],
      // 107 tunnel-transport-narrowgauge [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${tunnel} === true)))',
        'rgba(106, 106, 106, 1)',
      ],
      // 108 tunnel-transport-subway [line color]
      ['((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${tunnel} === true)))', 'rgba(82, 82, 82, 1)'],
      // 109 tunnel-transport-lightrail [line color]
      ['((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${tunnel} === true)))', 'rgba(79, 79, 79, 1)'],
      // 110 tunnel-transport-lightrail-service [line color]
      ['((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${tunnel} === true)))', 'rgba(79, 79, 79, 1)'],
      // 111 tunnel-transport-rail [line color]
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${tunnel} === true)))', 'rgba(79, 79, 79, 0.3)'],
      // 112 tunnel-transport-rail-service [line color]
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${tunnel} === true)))', 'rgba(79, 79, 79, 1)'],
      // 113 tunnel-transport-monorail [line color]
      ['((${_layer} === "streets") && (((${kind} === "monorail")) && (${tunnel} === true)))', 'rgba(106, 106, 106, 1)'],
      // 114 tunnel-transport-funicular [line color]
      ['((${_layer} === "streets") && (((${kind} === "funicular")) && (${tunnel} === true)))', 'rgba(106, 106, 106, 1)'],
      // 115 bridge [fill color]
      ['((${_layer} === "bridges") && true)', 'rgba(64, 64, 64, 0.8)'],
      // 116 street-pedestrian-zone [fill color]
      [
        '((${_layer} === "street_polygons") && ((${bridge} !== true) && (${tunnel} !== true) && (${kind} === "pedestrian")))',
        'rgba(58, 58, 58, 0.25)',
      ],
      // 117 way-footway:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "footway"))))', 'rgba(79, 79, 79, 1)'],
      // 118 way-steps:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "steps"))))', 'rgba(79, 79, 79, 1)'],
      // 119 way-path:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "path"))))', 'rgba(79, 79, 79, 1)'],
      // 120 way-cycleway:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "cycleway"))))', 'rgba(77, 77, 77, 1)'],
      // 121 street-track:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bridge} !== true) && (${tunnel} !== true)))', 'rgba(91, 91, 91, 1)'],
      // 122 street-pedestrian:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bridge} !== true) && (${tunnel} !== true)))', 'rgba(91, 91, 91, 1)'],
      // 123 street-service:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bridge} !== true) && (${tunnel} !== true)))', 'rgba(64, 64, 64, 1)'],
      // 124 street-livingstreet:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bridge} !== true) && (${tunnel} !== true)))', 'rgba(91, 91, 91, 1)'],
      // 125 street-residential:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bridge} !== true) && (${tunnel} !== true)))', 'rgba(91, 91, 91, 1)'],
      // 126 street-unclassified:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bridge} !== true) && (${tunnel} !== true)))', 'rgba(91, 91, 91, 1)'],
      // 127 street-busway:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${bridge} !== true) && (${tunnel} !== true)))', 'rgba(64, 64, 64, 1)'],
      // 128 street-busguideway:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${bridge} !== true) && (${tunnel} !== true)))', 'rgba(64, 64, 64, 1)'],
      // 129 street-tertiary-link:outline [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "tertiary")) && (${link} === true)))',
        'rgba(91, 91, 91, 1)',
      ],
      // 130 street-secondary-link:outline [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "secondary")) && (${link} === true)))',
        'rgba(114, 114, 114, 1)',
      ],
      // 131 street-primary-link:outline [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "primary")) && (${link} === true)))',
        'rgba(114, 114, 114, 1)',
      ],
      // 132 street-trunk-link:outline [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "trunk")) && (${link} === true)))',
        'rgba(114, 114, 114, 1)',
      ],
      // 133 street-motorway-link:outline [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "motorway")) && (${link} === true)))',
        'rgba(114, 114, 114, 1)',
      ],
      // 134 street-tertiary:outline [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "tertiary")) && (${link} !== true)))',
        'rgba(91, 91, 91, 1)',
      ],
      // 135 street-secondary:outline [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "secondary")) && (${link} !== true)))',
        'rgba(114, 114, 114, 1)',
      ],
      // 136 street-primary:outline [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "primary")) && (${link} !== true)))',
        'rgba(114, 114, 114, 1)',
      ],
      // 137 street-trunk:outline [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "trunk")) && (${link} !== true)))',
        'rgba(114, 114, 114, 1)',
      ],
      // 138 street-motorway:outline [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "motorway")) && (${link} !== true)))',
        'rgba(114, 114, 114, 1)',
      ],
      // 139 way-footway [line color]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "footway"))))', 'rgba(58, 58, 58, 1)'],
      // 140 way-steps [line color]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "steps"))))', 'rgba(58, 58, 58, 1)'],
      // 141 way-path [line color]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "path"))))', 'rgba(58, 58, 58, 1)'],
      // 142 way-cycleway [line color]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "cycleway"))))', 'rgba(57, 57, 57, 1)'],
      // 143 street-track [line color]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bridge} !== true) && (${tunnel} !== true)))', 'rgba(51, 51, 51, 1)'],
      // 144 street-pedestrian [line color]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bridge} !== true) && (${tunnel} !== true)))', 'rgba(59, 59, 59, 1)'],
      // 145 street-service [line color]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bridge} !== true) && (${tunnel} !== true)))', 'rgba(57, 57, 57, 1)'],
      // 146 street-livingstreet [line color]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bridge} !== true) && (${tunnel} !== true)))', 'rgba(51, 51, 51, 1)'],
      // 147 street-residential [line color]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bridge} !== true) && (${tunnel} !== true)))', 'rgba(51, 51, 51, 1)'],
      // 148 street-unclassified [line color]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bridge} !== true) && (${tunnel} !== true)))', 'rgba(51, 51, 51, 1)'],
      // 149 street-busway [line color]
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${bridge} !== true) && (${tunnel} !== true)))', 'rgba(57, 57, 57, 1)'],
      // 150 street-busguideway [line color]
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${bridge} !== true) && (${tunnel} !== true)))', 'rgba(57, 57, 57, 1)'],
      // 151 street-track-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "track") && (${bicycle} === "designated") && (${bridge} !== true) && (${tunnel} !== true)))',
        'rgba(51, 51, 51, 1)',
      ],
      // 152 street-pedestrian-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bicycle} === "designated") && (${bridge} !== true) && (${tunnel} !== true)))',
        'rgba(57, 57, 57, 1)',
      ],
      // 153 street-service-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "service") && (${bicycle} === "designated") && (${bridge} !== true) && (${tunnel} !== true)))',
        'rgba(51, 51, 51, 1)',
      ],
      // 154 street-livingstreet-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "living_street") && (${bicycle} === "designated") && (${bridge} !== true) && (${tunnel} !== true)))',
        'rgba(57, 57, 57, 1)',
      ],
      // 155 street-residential-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "residential") && (${bicycle} === "designated") && (${bridge} !== true) && (${tunnel} !== true)))',
        'rgba(57, 57, 57, 1)',
      ],
      // 156 street-unclassified-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "unclassified") && (${bicycle} === "designated") && (${bridge} !== true) && (${tunnel} !== true)))',
        'rgba(57, 57, 57, 1)',
      ],
      // 157 street-tertiary-link [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "tertiary")) && (${link} === true)))',
        'rgba(51, 51, 51, 1)',
      ],
      // 158 street-secondary-link [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "secondary")) && (${link} === true)))',
        'rgba(85, 85, 85, 1)',
      ],
      // 159 street-primary-link [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "primary")) && (${link} === true)))',
        'rgba(85, 85, 85, 1)',
      ],
      // 160 street-trunk-link [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "trunk")) && (${link} === true)))',
        'rgba(85, 85, 85, 1)',
      ],
      // 161 street-motorway-link [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "motorway")) && (${link} === true)))',
        'rgba(99, 99, 99, 1)',
      ],
      // 162 street-tertiary [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "tertiary")) && (${link} !== true)))',
        'rgba(51, 51, 51, 1)',
      ],
      // 163 street-secondary [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "secondary")) && (${link} !== true)))',
        'rgba(85, 85, 85, 1)',
      ],
      // 164 street-primary [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "primary")) && (${link} !== true)))',
        'rgba(85, 85, 85, 1)',
      ],
      // 165 street-trunk [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "trunk")) && (${link} !== true)))',
        'rgba(85, 85, 85, 1)',
      ],
      // 166 street-motorway [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "motorway")) && (${link} !== true)))',
        'rgba(99, 99, 99, 1)',
      ],
      // 167 transport-tram:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'rgba(106, 106, 106, 1)',
      ],
      // 168 transport-narrowgauge:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'rgba(106, 106, 106, 1)',
      ],
      // 169 transport-subway:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'rgba(109, 109, 109, 1)',
      ],
      // 170 transport-lightrail:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'rgba(106, 106, 106, 1)',
      ],
      // 171 transport-lightrail-service:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'rgba(106, 106, 106, 1)',
      ],
      // 172 transport-rail:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'rgba(106, 106, 106, 1)',
      ],
      // 173 transport-rail-service:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'rgba(106, 106, 106, 1)',
      ],
      // 174 transport-monorail:outline [line color]
      ['((${_layer} === "streets") && (((${kind} === "monorail")) && (${bridge} !== true) && (${tunnel} !== true)))', 'rgba(106, 106, 106, 1)'],
      // 175 transport-funicular:outline [line color]
      ['((${_layer} === "streets") && (((${kind} === "funicular")) && (${bridge} !== true) && (${tunnel} !== true)))', 'rgba(106, 106, 106, 1)'],
      // 176 transport-tram [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'rgba(106, 106, 106, 1)',
      ],
      // 177 transport-narrowgauge [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'rgba(106, 106, 106, 1)',
      ],
      // 178 transport-subway [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'rgba(82, 82, 82, 1)',
      ],
      // 179 transport-lightrail [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'rgba(79, 79, 79, 1)',
      ],
      // 180 transport-lightrail-service [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'rgba(79, 79, 79, 1)',
      ],
      // 181 transport-rail [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'rgba(79, 79, 79, 1)',
      ],
      // 182 transport-rail-service [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'rgba(79, 79, 79, 1)',
      ],
      // 183 transport-monorail [line color]
      ['((${_layer} === "streets") && (((${kind} === "monorail")) && (${bridge} !== true) && (${tunnel} !== true)))', 'rgba(106, 106, 106, 1)'],
      // 184 transport-funicular [line color]
      ['((${_layer} === "streets") && (((${kind} === "funicular")) && (${bridge} !== true) && (${tunnel} !== true)))', 'rgba(106, 106, 106, 1)'],
      // 185 transport-ferry [line color]
      ['((${_layer} === "ferries") && true)', 'rgba(99, 99, 99, 1)'],
      // 186 bridge-way-footway:bridge [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "footway"))))', 'rgba(64, 64, 64, 0.5)'],
      // 187 bridge-way-steps:bridge [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "steps"))))', 'rgba(64, 64, 64, 0.5)'],
      // 188 bridge-way-path:bridge [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "path"))))', 'rgba(64, 64, 64, 0.5)'],
      // 189 bridge-way-cycleway:bridge [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "cycleway"))))', 'rgba(64, 64, 64, 0.5)'],
      // 190 bridge-street-track:bridge [line color]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bridge} === true)))', 'rgba(64, 64, 64, 1)'],
      // 191 bridge-street-pedestrian:bridge [line color]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bridge} === true)))', 'rgba(64, 64, 64, 1)'],
      // 192 bridge-street-service:bridge [line color]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bridge} === true)))', 'rgba(64, 64, 64, 1)'],
      // 193 bridge-street-livingstreet:bridge [line color]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bridge} === true)))', 'rgba(64, 64, 64, 1)'],
      // 194 bridge-street-residential:bridge [line color]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bridge} === true)))', 'rgba(64, 64, 64, 1)'],
      // 195 bridge-street-unclassified:bridge [line color]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bridge} === true)))', 'rgba(64, 64, 64, 1)'],
      // 196 bridge-street-busway:bridge [line color]
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${bridge} === true)))', 'rgba(64, 64, 64, 0.5)'],
      // 197 bridge-street-busguideway:bridge [line color]
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${bridge} === true)))', 'rgba(64, 64, 64, 0.5)'],
      // 198 bridge-street-tertiary-link:bridge [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} === true)))', 'rgba(64, 64, 64, 1)'],
      // 199 bridge-street-secondary-link:bridge [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} === true)))', 'rgba(64, 64, 64, 0.5)'],
      // 200 bridge-street-primary-link:bridge [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} === true)))', 'rgba(64, 64, 64, 0.5)'],
      // 201 bridge-street-trunk-link:bridge [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} === true)))', 'rgba(64, 64, 64, 0.5)'],
      // 202 bridge-street-motorway-link:bridge [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} === true)))', 'rgba(64, 64, 64, 0.5)'],
      // 203 bridge-street-tertiary:bridge [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} !== true)))', 'rgba(64, 64, 64, 1)'],
      // 204 bridge-street-secondary:bridge [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} !== true)))', 'rgba(64, 64, 64, 1)'],
      // 205 bridge-street-primary:bridge [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} !== true)))', 'rgba(64, 64, 64, 0.5)'],
      // 206 bridge-street-trunk:bridge [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} !== true)))', 'rgba(64, 64, 64, 0.5)'],
      // 207 bridge-street-motorway:bridge [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} !== true)))', 'rgba(64, 64, 64, 0.5)'],
      // 208 bridge-street-pedestrian-zone [fill color]
      ['((${_layer} === "street_polygons") && ((${bridge} === true) && (${kind} === "pedestrian")))', 'rgba(51, 51, 51, 1)'],
      // 209 bridge-way-footway:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "footway"))))', 'rgba(79, 79, 79, 1)'],
      // 210 bridge-way-steps:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "steps"))))', 'rgba(79, 79, 79, 1)'],
      // 211 bridge-way-path:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "path"))))', 'rgba(79, 79, 79, 1)'],
      // 212 bridge-way-cycleway:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "cycleway"))))', 'rgba(77, 77, 77, 1)'],
      // 213 bridge-street-track:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bridge} === true)))', 'rgba(82, 82, 82, 1)'],
      // 214 bridge-street-pedestrian:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bridge} === true)))', 'rgba(82, 82, 82, 1)'],
      // 215 bridge-street-service:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bridge} === true)))', 'rgba(64, 64, 64, 1)'],
      // 216 bridge-street-livingstreet:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bridge} === true)))', 'rgba(82, 82, 82, 1)'],
      // 217 bridge-street-residential:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bridge} === true)))', 'rgba(82, 82, 82, 1)'],
      // 218 bridge-street-unclassified:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bridge} === true)))', 'rgba(82, 82, 82, 1)'],
      // 219 bridge-street-busway:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${bridge} === true)))', 'rgba(64, 64, 64, 1)'],
      // 220 bridge-street-busguideway:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${bridge} === true)))', 'rgba(64, 64, 64, 1)'],
      // 221 bridge-street-tertiary-link:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} === true)))', 'rgba(82, 82, 82, 1)'],
      // 222 bridge-street-secondary-link:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} === true)))', 'rgba(114, 114, 114, 1)'],
      // 223 bridge-street-primary-link:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} === true)))', 'rgba(114, 114, 114, 1)'],
      // 224 bridge-street-trunk-link:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} === true)))', 'rgba(114, 114, 114, 1)'],
      // 225 bridge-street-motorway-link:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} === true)))', 'rgba(114, 114, 114, 1)'],
      // 226 bridge-street-tertiary:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} !== true)))', 'rgba(82, 82, 82, 1)'],
      // 227 bridge-street-secondary:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} !== true)))', 'rgba(114, 114, 114, 1)'],
      // 228 bridge-street-primary:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} !== true)))', 'rgba(114, 114, 114, 1)'],
      // 229 bridge-street-trunk:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} !== true)))', 'rgba(114, 114, 114, 1)'],
      // 230 bridge-street-motorway:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} !== true)))', 'rgba(114, 114, 114, 1)'],
      // 231 bridge-way-footway [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "footway"))))', 'rgba(58, 58, 58, 1)'],
      // 232 bridge-way-steps [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "steps"))))', 'rgba(58, 58, 58, 1)'],
      // 233 bridge-way-path [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "path"))))', 'rgba(58, 58, 58, 1)'],
      // 234 bridge-way-cycleway [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "cycleway"))))', 'rgba(57, 57, 57, 1)'],
      // 235 bridge-street-track [line color]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bridge} === true)))', 'rgba(51, 51, 51, 1)'],
      // 236 bridge-street-pedestrian [line color]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bridge} === true)))', 'rgba(51, 51, 51, 1)'],
      // 237 bridge-street-service [line color]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bridge} === true)))', 'rgba(57, 57, 57, 1)'],
      // 238 bridge-street-livingstreet [line color]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bridge} === true)))', 'rgba(51, 51, 51, 1)'],
      // 239 bridge-street-residential [line color]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bridge} === true)))', 'rgba(51, 51, 51, 1)'],
      // 240 bridge-street-unclassified [line color]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bridge} === true)))', 'rgba(51, 51, 51, 1)'],
      // 241 bridge-street-busway [line color]
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${bridge} === true)))', 'rgba(57, 57, 57, 1)'],
      // 242 bridge-street-busguideway [line color]
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${bridge} === true)))', 'rgba(57, 57, 57, 1)'],
      // 243 bridge-street-track-bicycle [line color]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bicycle} === "designated") && (${bridge} === true)))', 'rgba(51, 51, 51, 1)'],
      // 244 bridge-street-pedestrian-bicycle [line color]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bicycle} === "designated") && (${bridge} === true)))', 'rgba(57, 57, 57, 1)'],
      // 245 bridge-street-service-bicycle [line color]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bicycle} === "designated") && (${bridge} === true)))', 'rgba(51, 51, 51, 1)'],
      // 246 bridge-street-livingstreet-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "living_street") && (${bicycle} === "designated") && (${bridge} === true)))',
        'rgba(57, 57, 57, 1)',
      ],
      // 247 bridge-street-residential-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "residential") && (${bicycle} === "designated") && (${bridge} === true)))',
        'rgba(57, 57, 57, 1)',
      ],
      // 248 bridge-street-unclassified-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "unclassified") && (${bicycle} === "designated") && (${bridge} === true)))',
        'rgba(57, 57, 57, 1)',
      ],
      // 249 bridge-street-tertiary-link [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} === true)))', 'rgba(51, 51, 51, 1)'],
      // 250 bridge-street-secondary-link [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} === true)))', 'rgba(85, 85, 85, 1)'],
      // 251 bridge-street-primary-link [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} === true)))', 'rgba(85, 85, 85, 1)'],
      // 252 bridge-street-trunk-link [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} === true)))', 'rgba(85, 85, 85, 1)'],
      // 253 bridge-street-motorway-link [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} === true)))', 'rgba(99, 99, 99, 1)'],
      // 254 bridge-street-tertiary [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} !== true)))', 'rgba(51, 51, 51, 1)'],
      // 255 bridge-street-secondary [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} !== true)))', 'rgba(85, 85, 85, 1)'],
      // 256 bridge-street-primary [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} !== true)))', 'rgba(85, 85, 85, 1)'],
      // 257 bridge-street-trunk [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} !== true)))', 'rgba(85, 85, 85, 1)'],
      // 258 bridge-street-motorway [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} !== true)))', 'rgba(99, 99, 99, 1)'],
      // 259 bridge-transport-tram:outline [line color]
      ['((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${bridge} === true)))', 'rgba(106, 106, 106, 1)'],
      // 260 bridge-transport-narrowgauge:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${bridge} === true)))',
        'rgba(106, 106, 106, 1)',
      ],
      // 261 bridge-transport-subway:outline [line color]
      ['((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${bridge} === true)))', 'rgba(109, 109, 109, 1)'],
      // 262 bridge-transport-lightrail:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${bridge} === true)))',
        'rgba(106, 106, 106, 1)',
      ],
      // 263 bridge-transport-lightrail-service:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${bridge} === true)))',
        'rgba(106, 106, 106, 1)',
      ],
      // 264 bridge-transport-rail:outline [line color]
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${bridge} === true)))', 'rgba(106, 106, 106, 1)'],
      // 265 bridge-transport-rail-service:outline [line color]
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${bridge} === true)))', 'rgba(106, 106, 106, 1)'],
      // 266 bridge-transport-monorail:outline [line color]
      ['((${_layer} === "streets") && (((${kind} === "monorail")) && (${bridge} === true)))', 'rgba(106, 106, 106, 1)'],
      // 267 bridge-transport-funicular:outline [line color]
      ['((${_layer} === "streets") && (((${kind} === "funicular")) && (${bridge} === true)))', 'rgba(106, 106, 106, 1)'],
      // 268 bridge-transport-tram [line color]
      ['((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${bridge} === true)))', 'rgba(106, 106, 106, 1)'],
      // 269 bridge-transport-narrowgauge [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${bridge} === true)))',
        'rgba(106, 106, 106, 1)',
      ],
      // 270 bridge-transport-subway [line color]
      ['((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${bridge} === true)))', 'rgba(82, 82, 82, 1)'],
      // 271 bridge-transport-lightrail [line color]
      ['((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${bridge} === true)))', 'rgba(79, 79, 79, 1)'],
      // 272 bridge-transport-lightrail-service [line color]
      ['((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${bridge} === true)))', 'rgba(79, 79, 79, 1)'],
      // 273 bridge-transport-rail [line color]
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${bridge} === true)))', 'rgba(79, 79, 79, 1)'],
      // 274 bridge-transport-rail-service [line color]
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${bridge} === true)))', 'rgba(79, 79, 79, 1)'],
      // 275 bridge-transport-monorail [line color]
      ['((${_layer} === "streets") && (((${kind} === "monorail")) && (${bridge} === true)))', 'rgba(106, 106, 106, 1)'],
      // 276 bridge-transport-funicular [line color]
      ['((${_layer} === "streets") && (((${kind} === "funicular")) && (${bridge} === true)))', 'rgba(106, 106, 106, 1)'],
      // 286 boundary-country:outline [line color]
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 2) && (${maritime} !== true) && (${disputed} !== true) && (${coastline} !== true)))',
        'rgba(57, 57, 57, 0.75)',
      ],
      // 287 boundary-country-disputed:outline [line color]
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 2) && (${disputed} === true) && (${maritime} !== true) && (${coastline} !== true)))',
        'rgba(57, 57, 57, 0.75)',
      ],
      // 288 boundary-state:outline [line color]
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 4) && (${maritime} !== true) && (${disputed} !== true) && (${coastline} !== true)))',
        'rgba(54, 54, 54, 0.75)',
      ],
      // 289 boundary-country [line color]
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 2) && (${maritime} !== true) && (${disputed} !== true) && (${coastline} !== true)))',
        'rgba(109, 109, 109, 1)',
      ],
      // 290 boundary-country-disputed [line color]
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 2) && (${disputed} === true) && (${maritime} !== true) && (${coastline} !== true)))',
        'rgba(97, 97, 97, 1)',
      ],
      // 291 boundary-state [line color]
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 4) && (${maritime} !== true) && (${disputed} !== true) && (${coastline} !== true)))',
        'rgba(109, 109, 109, 1)',
      ],
      ['true', "color('white')"],
    ],
  },
  lineWidth: {
    conditions: [
      // 019 water-river [line width]
      ['((${_layer} === "water_lines") && (((${kind} === "river")) && (${tunnel} !== true) && (${bridge} !== true)))', '1'],
      // 020 water-canal [line width]
      ['((${_layer} === "water_lines") && (((${kind} === "canal")) && (${tunnel} !== true) && (${bridge} !== true)))', '1'],
      // 021 water-stream [line width]
      ['((${_layer} === "water_lines") && (((${kind} === "stream")) && (${tunnel} !== true) && (${bridge} !== true)))', '1'],
      // 022 water-ditch [line width]
      ['((${_layer} === "water_lines") && (((${kind} === "ditch")) && (${tunnel} !== true) && (${bridge} !== true)))', '1'],
      // 027 water-dam [line width]
      ['((${_layer} === "dam_lines") && (${kind} === "dam"))', '1'],
      // 029 water-pier [line width]
      ['((${_layer} === "pier_lines") && ((${kind} === "pier") || (${kind} === "breakwater") || (${kind} === "groyne")))', '1'],
      // 040 airport-taxiway:outline [line width]
      ['((${_layer} === "streets") && (${kind} === "taxiway"))', '1'],
      // 041 airport-runway:outline [line width]
      ['((${_layer} === "streets") && (${kind} === "runway"))', '1'],
      // 042 airport-taxiway [line width]
      ['((${_layer} === "streets") && (${kind} === "taxiway"))', '1'],
      // 043 airport-runway [line width]
      ['((${_layer} === "streets") && (${kind} === "runway"))', '1'],
      // 047 tunnel-way-footway:outline [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "footway"))))', '1'],
      // 048 tunnel-way-steps:outline [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "steps"))))', '1'],
      // 049 tunnel-way-path:outline [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "path"))))', '1'],
      // 050 tunnel-way-cycleway:outline [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "cycleway"))))', '1'],
      // 051 tunnel-street-track:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${tunnel} === true)))', '2'],
      // 052 tunnel-street-pedestrian:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${tunnel} === true)))', '2'],
      // 053 tunnel-street-service:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${tunnel} === true)))', '1'],
      // 054 tunnel-street-livingstreet:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${tunnel} === true)))', '2'],
      // 055 tunnel-street-residential:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${tunnel} === true)))', '2'],
      // 056 tunnel-street-unclassified:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${tunnel} === true)))', '2'],
      // 057 tunnel-street-busway:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${tunnel} === true)))', '1'],
      // 058 tunnel-street-busguideway:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${tunnel} === true)))', '1'],
      // 059 tunnel-street-tertiary-link:outline [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "tertiary")) && (${link} === true)))', '2'],
      // 060 tunnel-street-secondary-link:outline [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "secondary")) && (${link} === true)))', '2'],
      // 061 tunnel-street-primary-link:outline [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "primary")) && (${link} === true)))', '2'],
      // 062 tunnel-street-trunk-link:outline [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "trunk")) && (${link} === true)))', '2'],
      // 063 tunnel-street-motorway-link:outline [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "motorway")) && (${link} === true)))', '2'],
      // 064 tunnel-street-tertiary:outline [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "tertiary")) && (${link} !== true)))', '2'],
      // 065 tunnel-street-secondary:outline [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "secondary")) && (${link} !== true)))', '2'],
      // 066 tunnel-street-primary:outline [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "primary")) && (${link} !== true)))', '1'],
      // 067 tunnel-street-trunk:outline [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "trunk")) && (${link} !== true)))', '2.67'],
      // 068 tunnel-street-motorway:outline [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "motorway")) && (${link} !== true)))', '3.5'],
      // 069 tunnel-way-footway [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "footway"))))', '1'],
      // 070 tunnel-way-steps [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "steps"))))', '1'],
      // 071 tunnel-way-path [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "path"))))', '1'],
      // 072 tunnel-way-cycleway [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "cycleway"))))', '1'],
      // 073 tunnel-street-track [line width]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${tunnel} === true)))', '1'],
      // 074 tunnel-street-pedestrian [line width]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${tunnel} === true)))', '1'],
      // 075 tunnel-street-service [line width]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${tunnel} === true)))', '1'],
      // 076 tunnel-street-livingstreet [line width]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${tunnel} === true)))', '1'],
      // 077 tunnel-street-residential [line width]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${tunnel} === true)))', '1'],
      // 078 tunnel-street-unclassified [line width]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${tunnel} === true)))', '1'],
      // 079 tunnel-street-busway [line width]
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${tunnel} === true)))', '1'],
      // 080 tunnel-street-busguideway [line width]
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${tunnel} === true)))', '1'],
      // 081 tunnel-street-track-bicycle [line width]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bicycle} === "designated") && (${tunnel} === true)))', '1'],
      // 082 tunnel-street-pedestrian-bicycle [line width]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bicycle} === "designated") && (${tunnel} === true)))', '1'],
      // 083 tunnel-street-service-bicycle [line width]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bicycle} === "designated") && (${tunnel} === true)))', '1'],
      // 084 tunnel-street-livingstreet-bicycle [line width]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bicycle} === "designated") && (${tunnel} === true)))', '1'],
      // 085 tunnel-street-residential-bicycle [line width]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bicycle} === "designated") && (${tunnel} === true)))', '1'],
      // 086 tunnel-street-unclassified-bicycle [line width]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bicycle} === "designated") && (${tunnel} === true)))', '1'],
      // 087 tunnel-street-tertiary-link [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "tertiary")) && (${link} === true)))', '1'],
      // 088 tunnel-street-secondary-link [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "secondary")) && (${link} === true)))', '1'],
      // 089 tunnel-street-primary-link [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "primary")) && (${link} === true)))', '1'],
      // 090 tunnel-street-trunk-link [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "trunk")) && (${link} === true)))', '1'],
      // 091 tunnel-street-motorway-link [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "motorway")) && (${link} === true)))', '1'],
      // 092 tunnel-street-tertiary [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "tertiary")) && (${link} !== true)))', '1'],
      // 093 tunnel-street-secondary [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "secondary")) && (${link} !== true)))', '1'],
      // 094 tunnel-street-primary [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "primary")) && (${link} !== true)))', '1'],
      // 095 tunnel-street-trunk [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "trunk")) && (${link} !== true)))', '1.67'],
      // 096 tunnel-street-motorway [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "motorway")) && (${link} !== true)))', '2.5'],
      // 097 tunnel-transport-tram:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${tunnel} === true)))', '1'],
      // 098 tunnel-transport-narrowgauge:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${tunnel} === true)))', '1'],
      // 099 tunnel-transport-subway:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${tunnel} === true)))', '1'],
      // 100 tunnel-transport-lightrail:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${tunnel} === true)))', '1'],
      // 101 tunnel-transport-lightrail-service:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${tunnel} === true)))', '1'],
      // 102 tunnel-transport-rail:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${tunnel} === true)))', '1'],
      // 103 tunnel-transport-rail-service:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${tunnel} === true)))', '1'],
      // 104 tunnel-transport-monorail:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "monorail")) && (${tunnel} === true)))', '1'],
      // 105 tunnel-transport-funicular:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "funicular")) && (${tunnel} === true)))', '1'],
      // 106 tunnel-transport-tram [line width]
      ['((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${tunnel} === true)))', '1'],
      // 107 tunnel-transport-narrowgauge [line width]
      ['((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${tunnel} === true)))', '1'],
      // 108 tunnel-transport-subway [line width]
      ['((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${tunnel} === true)))', '1'],
      // 109 tunnel-transport-lightrail [line width]
      ['((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${tunnel} === true)))', '1'],
      // 110 tunnel-transport-lightrail-service [line width]
      ['((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${tunnel} === true)))', '1'],
      // 111 tunnel-transport-rail [line width]
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${tunnel} === true)))', '1'],
      // 112 tunnel-transport-rail-service [line width]
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${tunnel} === true)))', '1'],
      // 113 tunnel-transport-monorail [line width]
      ['((${_layer} === "streets") && (((${kind} === "monorail")) && (${tunnel} === true)))', '1'],
      // 114 tunnel-transport-funicular [line width]
      ['((${_layer} === "streets") && (((${kind} === "funicular")) && (${tunnel} === true)))', '1'],
      // 117 way-footway:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "footway"))))', '1'],
      // 118 way-steps:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "steps"))))', '1'],
      // 119 way-path:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "path"))))', '1'],
      // 120 way-cycleway:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "cycleway"))))', '1'],
      // 121 street-track:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bridge} !== true) && (${tunnel} !== true)))', '2'],
      // 122 street-pedestrian:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bridge} !== true) && (${tunnel} !== true)))', '2'],
      // 123 street-service:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bridge} !== true) && (${tunnel} !== true)))', '1'],
      // 124 street-livingstreet:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bridge} !== true) && (${tunnel} !== true)))', '2'],
      // 125 street-residential:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bridge} !== true) && (${tunnel} !== true)))', '2'],
      // 126 street-unclassified:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bridge} !== true) && (${tunnel} !== true)))', '2'],
      // 127 street-busway:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${bridge} !== true) && (${tunnel} !== true)))', '1'],
      // 128 street-busguideway:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${bridge} !== true) && (${tunnel} !== true)))', '1'],
      // 129 street-tertiary-link:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "tertiary")) && (${link} === true)))', '2'],
      // 130 street-secondary-link:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "secondary")) && (${link} === true)))', '2'],
      // 131 street-primary-link:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "primary")) && (${link} === true)))', '2'],
      // 132 street-trunk-link:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "trunk")) && (${link} === true)))', '2'],
      // 133 street-motorway-link:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "motorway")) && (${link} === true)))', '2'],
      // 134 street-tertiary:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "tertiary")) && (${link} !== true)))', '2'],
      // 135 street-secondary:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "secondary")) && (${link} !== true)))', '2'],
      // 136 street-primary:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "primary")) && (${link} !== true)))', '1'],
      // 137 street-trunk:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "trunk")) && (${link} !== true)))', '2.67'],
      // 138 street-motorway:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "motorway")) && (${link} !== true)))', '3.5'],
      // 139 way-footway [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "footway"))))', '1'],
      // 140 way-steps [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "steps"))))', '1'],
      // 141 way-path [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "path"))))', '1'],
      // 142 way-cycleway [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "cycleway"))))', '1'],
      // 143 street-track [line width]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bridge} !== true) && (${tunnel} !== true)))', '1'],
      // 144 street-pedestrian [line width]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bridge} !== true) && (${tunnel} !== true)))', '1'],
      // 145 street-service [line width]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bridge} !== true) && (${tunnel} !== true)))', '1'],
      // 146 street-livingstreet [line width]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bridge} !== true) && (${tunnel} !== true)))', '1'],
      // 147 street-residential [line width]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bridge} !== true) && (${tunnel} !== true)))', '1'],
      // 148 street-unclassified [line width]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bridge} !== true) && (${tunnel} !== true)))', '1'],
      // 149 street-busway [line width]
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${bridge} !== true) && (${tunnel} !== true)))', '1'],
      // 150 street-busguideway [line width]
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${bridge} !== true) && (${tunnel} !== true)))', '1'],
      // 151 street-track-bicycle [line width]
      [
        '((${_layer} === "streets") && ((${kind} === "track") && (${bicycle} === "designated") && (${bridge} !== true) && (${tunnel} !== true)))',
        '1',
      ],
      // 152 street-pedestrian-bicycle [line width]
      [
        '((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bicycle} === "designated") && (${bridge} !== true) && (${tunnel} !== true)))',
        '1',
      ],
      // 153 street-service-bicycle [line width]
      [
        '((${_layer} === "streets") && ((${kind} === "service") && (${bicycle} === "designated") && (${bridge} !== true) && (${tunnel} !== true)))',
        '1',
      ],
      // 154 street-livingstreet-bicycle [line width]
      [
        '((${_layer} === "streets") && ((${kind} === "living_street") && (${bicycle} === "designated") && (${bridge} !== true) && (${tunnel} !== true)))',
        '1',
      ],
      // 155 street-residential-bicycle [line width]
      [
        '((${_layer} === "streets") && ((${kind} === "residential") && (${bicycle} === "designated") && (${bridge} !== true) && (${tunnel} !== true)))',
        '1',
      ],
      // 156 street-unclassified-bicycle [line width]
      [
        '((${_layer} === "streets") && ((${kind} === "unclassified") && (${bicycle} === "designated") && (${bridge} !== true) && (${tunnel} !== true)))',
        '1',
      ],
      // 157 street-tertiary-link [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "tertiary")) && (${link} === true)))', '1'],
      // 158 street-secondary-link [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "secondary")) && (${link} === true)))', '1'],
      // 159 street-primary-link [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "primary")) && (${link} === true)))', '1'],
      // 160 street-trunk-link [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "trunk")) && (${link} === true)))', '1'],
      // 161 street-motorway-link [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "motorway")) && (${link} === true)))', '1'],
      // 162 street-tertiary [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "tertiary")) && (${link} !== true)))', '1'],
      // 163 street-secondary [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "secondary")) && (${link} !== true)))', '1'],
      // 164 street-primary [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "primary")) && (${link} !== true)))', '1'],
      // 165 street-trunk [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "trunk")) && (${link} !== true)))', '1.67'],
      // 166 street-motorway [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "motorway")) && (${link} !== true)))', '2.5'],
      // 167 transport-tram:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))', '1'],
      // 168 transport-narrowgauge:outline [line width]
      [
        '((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        '1',
      ],
      // 169 transport-subway:outline [line width]
      [
        '((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        '1',
      ],
      // 170 transport-lightrail:outline [line width]
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        '1',
      ],
      // 171 transport-lightrail-service:outline [line width]
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        '1',
      ],
      // 172 transport-rail:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))', '1'],
      // 173 transport-rail-service:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${bridge} !== true) && (${tunnel} !== true)))', '1'],
      // 174 transport-monorail:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "monorail")) && (${bridge} !== true) && (${tunnel} !== true)))', '1'],
      // 175 transport-funicular:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "funicular")) && (${bridge} !== true) && (${tunnel} !== true)))', '1'],
      // 176 transport-tram [line width]
      ['((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))', '1'],
      // 177 transport-narrowgauge [line width]
      [
        '((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        '1',
      ],
      // 178 transport-subway [line width]
      [
        '((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        '1',
      ],
      // 179 transport-lightrail [line width]
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        '1',
      ],
      // 180 transport-lightrail-service [line width]
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        '1',
      ],
      // 181 transport-rail [line width]
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))', '1'],
      // 182 transport-rail-service [line width]
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${bridge} !== true) && (${tunnel} !== true)))', '1'],
      // 183 transport-monorail [line width]
      ['((${_layer} === "streets") && (((${kind} === "monorail")) && (${bridge} !== true) && (${tunnel} !== true)))', '1'],
      // 184 transport-funicular [line width]
      ['((${_layer} === "streets") && (((${kind} === "funicular")) && (${bridge} !== true) && (${tunnel} !== true)))', '1'],
      // 185 transport-ferry [line width]
      ['((${_layer} === "ferries") && true)', '1'],
      // 186 bridge-way-footway:bridge [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "footway"))))', '1'],
      // 187 bridge-way-steps:bridge [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "steps"))))', '1'],
      // 188 bridge-way-path:bridge [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "path"))))', '1'],
      // 189 bridge-way-cycleway:bridge [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "cycleway"))))', '1'],
      // 190 bridge-street-track:bridge [line width]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bridge} === true)))', '3'],
      // 191 bridge-street-pedestrian:bridge [line width]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bridge} === true)))', '3'],
      // 192 bridge-street-service:bridge [line width]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bridge} === true)))', '3'],
      // 193 bridge-street-livingstreet:bridge [line width]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bridge} === true)))', '3'],
      // 194 bridge-street-residential:bridge [line width]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bridge} === true)))', '3'],
      // 195 bridge-street-unclassified:bridge [line width]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bridge} === true)))', '3'],
      // 196 bridge-street-busway:bridge [line width]
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${bridge} === true)))', '1'],
      // 197 bridge-street-busguideway:bridge [line width]
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${bridge} === true)))', '1'],
      // 198 bridge-street-tertiary-link:bridge [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} === true)))', '3'],
      // 199 bridge-street-secondary-link:bridge [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} === true)))', '3'],
      // 200 bridge-street-primary-link:bridge [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} === true)))', '3'],
      // 201 bridge-street-trunk-link:bridge [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} === true)))', '3'],
      // 202 bridge-street-motorway-link:bridge [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} === true)))', '3'],
      // 203 bridge-street-tertiary:bridge [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} !== true)))', '3'],
      // 204 bridge-street-secondary:bridge [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} !== true)))', '3'],
      // 205 bridge-street-primary:bridge [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} !== true)))', '1'],
      // 206 bridge-street-trunk:bridge [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} !== true)))', '3'],
      // 207 bridge-street-motorway:bridge [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} !== true)))', '5'],
      // 209 bridge-way-footway:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "footway"))))', '1'],
      // 210 bridge-way-steps:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "steps"))))', '1'],
      // 211 bridge-way-path:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "path"))))', '1'],
      // 212 bridge-way-cycleway:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "cycleway"))))', '1'],
      // 213 bridge-street-track:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bridge} === true)))', '2'],
      // 214 bridge-street-pedestrian:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bridge} === true)))', '2'],
      // 215 bridge-street-service:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bridge} === true)))', '1'],
      // 216 bridge-street-livingstreet:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bridge} === true)))', '2'],
      // 217 bridge-street-residential:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bridge} === true)))', '2'],
      // 218 bridge-street-unclassified:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bridge} === true)))', '2'],
      // 219 bridge-street-busway:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${bridge} === true)))', '1'],
      // 220 bridge-street-busguideway:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${bridge} === true)))', '1'],
      // 221 bridge-street-tertiary-link:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} === true)))', '2'],
      // 222 bridge-street-secondary-link:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} === true)))', '2'],
      // 223 bridge-street-primary-link:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} === true)))', '2'],
      // 224 bridge-street-trunk-link:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} === true)))', '2'],
      // 225 bridge-street-motorway-link:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} === true)))', '2'],
      // 226 bridge-street-tertiary:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} !== true)))', '2'],
      // 227 bridge-street-secondary:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} !== true)))', '2'],
      // 228 bridge-street-primary:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} !== true)))', '1'],
      // 229 bridge-street-trunk:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} !== true)))', '2.67'],
      // 230 bridge-street-motorway:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} !== true)))', '3.5'],
      // 231 bridge-way-footway [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "footway"))))', '1'],
      // 232 bridge-way-steps [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "steps"))))', '1'],
      // 233 bridge-way-path [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "path"))))', '1'],
      // 234 bridge-way-cycleway [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "cycleway"))))', '1'],
      // 235 bridge-street-track [line width]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bridge} === true)))', '1'],
      // 236 bridge-street-pedestrian [line width]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bridge} === true)))', '1'],
      // 237 bridge-street-service [line width]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bridge} === true)))', '1'],
      // 238 bridge-street-livingstreet [line width]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bridge} === true)))', '1'],
      // 239 bridge-street-residential [line width]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bridge} === true)))', '1'],
      // 240 bridge-street-unclassified [line width]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bridge} === true)))', '1'],
      // 241 bridge-street-busway [line width]
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${bridge} === true)))', '1'],
      // 242 bridge-street-busguideway [line width]
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${bridge} === true)))', '1'],
      // 243 bridge-street-track-bicycle [line width]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bicycle} === "designated") && (${bridge} === true)))', '1'],
      // 244 bridge-street-pedestrian-bicycle [line width]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bicycle} === "designated") && (${bridge} === true)))', '1'],
      // 245 bridge-street-service-bicycle [line width]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bicycle} === "designated") && (${bridge} === true)))', '1'],
      // 246 bridge-street-livingstreet-bicycle [line width]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bicycle} === "designated") && (${bridge} === true)))', '1'],
      // 247 bridge-street-residential-bicycle [line width]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bicycle} === "designated") && (${bridge} === true)))', '1'],
      // 248 bridge-street-unclassified-bicycle [line width]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bicycle} === "designated") && (${bridge} === true)))', '1'],
      // 249 bridge-street-tertiary-link [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} === true)))', '1'],
      // 250 bridge-street-secondary-link [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} === true)))', '1'],
      // 251 bridge-street-primary-link [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} === true)))', '1'],
      // 252 bridge-street-trunk-link [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} === true)))', '1'],
      // 253 bridge-street-motorway-link [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} === true)))', '1'],
      // 254 bridge-street-tertiary [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} !== true)))', '1'],
      // 255 bridge-street-secondary [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} !== true)))', '1'],
      // 256 bridge-street-primary [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} !== true)))', '1'],
      // 257 bridge-street-trunk [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} !== true)))', '1.67'],
      // 258 bridge-street-motorway [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} !== true)))', '2.5'],
      // 259 bridge-transport-tram:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${bridge} === true)))', '1'],
      // 260 bridge-transport-narrowgauge:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${bridge} === true)))', '1'],
      // 261 bridge-transport-subway:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${bridge} === true)))', '1'],
      // 262 bridge-transport-lightrail:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${bridge} === true)))', '1'],
      // 263 bridge-transport-lightrail-service:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${bridge} === true)))', '1'],
      // 264 bridge-transport-rail:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${bridge} === true)))', '1'],
      // 265 bridge-transport-rail-service:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${bridge} === true)))', '1'],
      // 266 bridge-transport-monorail:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "monorail")) && (${bridge} === true)))', '1'],
      // 267 bridge-transport-funicular:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "funicular")) && (${bridge} === true)))', '1'],
      // 268 bridge-transport-tram [line width]
      ['((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${bridge} === true)))', '1'],
      // 269 bridge-transport-narrowgauge [line width]
      ['((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${bridge} === true)))', '1'],
      // 270 bridge-transport-subway [line width]
      ['((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${bridge} === true)))', '1'],
      // 271 bridge-transport-lightrail [line width]
      ['((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${bridge} === true)))', '1'],
      // 272 bridge-transport-lightrail-service [line width]
      ['((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${bridge} === true)))', '1'],
      // 273 bridge-transport-rail [line width]
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${bridge} === true)))', '1'],
      // 274 bridge-transport-rail-service [line width]
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${bridge} === true)))', '1'],
      // 275 bridge-transport-monorail [line width]
      ['((${_layer} === "streets") && (((${kind} === "monorail")) && (${bridge} === true)))', '1'],
      // 276 bridge-transport-funicular [line width]
      ['((${_layer} === "streets") && (((${kind} === "funicular")) && (${bridge} === true)))', '1'],
      // 286 boundary-country:outline [line width]
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 2) && (${maritime} !== true) && (${disputed} !== true) && (${coastline} !== true)))',
        '6',
      ],
      // 287 boundary-country-disputed:outline [line width]
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 2) && (${disputed} === true) && (${maritime} !== true) && (${coastline} !== true)))',
        '6',
      ],
      // 288 boundary-state:outline [line width]
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 4) && (${maritime} !== true) && (${disputed} !== true) && (${coastline} !== true)))',
        '2',
      ],
      // 289 boundary-country [line width]
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 2) && (${maritime} !== true) && (${disputed} !== true) && (${coastline} !== true)))',
        '3.14',
      ],
      // 290 boundary-country-disputed [line width]
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 2) && (${disputed} === true) && (${maritime} !== true) && (${coastline} !== true)))',
        '3.14',
      ],
      // 291 boundary-state [line width]
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 4) && (${maritime} !== true) && (${disputed} !== true) && (${coastline} !== true)))',
        '1',
      ],
      ['true', '1.0'],
    ],
  },
});

export { VECTOR_TILE_STYLE };

// UNSUPPORTED / APPROXIMATED RULES (original rule order):
// 001 background [background] source-layer=<none>
//   - UNSUPPORTED background layer: Cesium3DTileStyle applies to per-feature 3D Tile styling, not the scene/tileset background.
// 004 land-commercial [fill] source-layer=land
//   - APPROXIMATION fill-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 11 = 1.
// 005 land-industrial [fill] source-layer=land
//   - APPROXIMATION fill-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 11 = 1.
// 006 land-residential [fill] source-layer=land
//   - APPROXIMATION fill-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 11 = 1.
// 007 land-agriculture [fill] source-layer=land
//   - APPROXIMATION fill-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 11 = 1.
// 008 land-waste [fill] source-layer=land
//   - APPROXIMATION fill-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 11 = 1.
// 009 land-park [fill] source-layer=land
//   - APPROXIMATION fill-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 1.
// 010 land-garden [fill] source-layer=land
//   - APPROXIMATION fill-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 1.
// 011 land-burial [fill] source-layer=land
//   - APPROXIMATION fill-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 14 = 1.
// 014 land-forest [fill] source-layer=land
//   - APPROXIMATION fill-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 8 = 0.1.
// 015 land-grass [fill] source-layer=land
//   - APPROXIMATION fill-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 1.
// 016 land-vegetation [fill] source-layer=land
//   - APPROXIMATION fill-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 1.
// 019 water-river [line] source-layer=water_lines
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 020 water-canal [line] source-layer=water_lines
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 021 water-stream [line] source-layer=water_lines
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 022 water-ditch [line] source-layer=water_lines
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 023 water-area [fill] source-layer=water_polygons
//   - APPROXIMATION fill-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 6 = 1.
// 024 water-area-river [fill] source-layer=water_polygons
//   - APPROXIMATION fill-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 6 = 1.
// 025 water-area-small [fill] source-layer=water_polygons
//   - APPROXIMATION fill-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 6 = 1.
// 026 water-dam-area [fill] source-layer=dam_polygons
//   - APPROXIMATION fill-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
// 028 water-pier-area [fill] source-layer=pier_polygons
//   - APPROXIMATION fill-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
// 030 site-dangerarea [fill] source-layer=sites
//   - UNSUPPORTED fill-pattern='basics:pattern-warning': sprite image fill patterns have no Cesium3DTileStyle equivalent.
// 035 site-prison [fill] source-layer=sites
//   - UNSUPPORTED fill-pattern='basics:pattern-striped': sprite image fill patterns have no Cesium3DTileStyle equivalent.
// 038 site-construction [fill] source-layer=sites
//   - UNSUPPORTED fill-pattern='basics:pattern-hatched_thin': sprite image fill patterns have no Cesium3DTileStyle equivalent.
// 040 airport-taxiway:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 041 airport-runway:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 042 airport-taxiway [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 14 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 043 airport-runway [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 044 building:outline [fill] source-layer=buildings
//   - APPROXIMATION fill-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
// 045 building [fill] source-layer=buildings
//   - APPROXIMATION fill-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
//   - UNSUPPORTED fill-translate=[-2,-2]: per-pixel paint translation has no Cesium3DTileStyle equivalent.
// 046 tunnel-street-pedestrian-zone [fill] source-layer=street_polygons
//   - APPROXIMATION fill-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
// 047 tunnel-way-footway:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 048 tunnel-way-steps:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 049 tunnel-way-path:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 050 tunnel-way-cycleway:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 051 tunnel-street-track:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 052 tunnel-street-pedestrian:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 053 tunnel-street-service:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 054 tunnel-street-livingstreet:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 055 tunnel-street-residential:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 056 tunnel-street-unclassified:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 057 tunnel-street-busway:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 058 tunnel-street-busguideway:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 059 tunnel-street-tertiary-link:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 060 tunnel-street-secondary-link:outline [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[1,0.3]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 061 tunnel-street-primary-link:outline [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[1,0.3]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 062 tunnel-street-trunk-link:outline [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[1,0.3]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 063 tunnel-street-motorway-link:outline [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[1,0.3]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [12, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 064 tunnel-street-tertiary:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 065 tunnel-street-secondary:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 1.
//   - UNSUPPORTED line-dasharray=[1,0.3]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 066 tunnel-street-primary:outline [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[1,0.3]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 067 tunnel-street-trunk:outline [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[1,0.3]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2.67) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 068 tunnel-street-motorway:outline [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[1,0.3]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 3.5) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 069 tunnel-way-footway [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[1,0.2]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 070 tunnel-way-steps [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[1,0.2]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 071 tunnel-way-path [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[1,0.2]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 072 tunnel-way-cycleway [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[1,0.2]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 073 tunnel-street-track [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 074 tunnel-street-pedestrian [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 075 tunnel-street-service [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 076 tunnel-street-livingstreet [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 077 tunnel-street-residential [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 078 tunnel-street-unclassified [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 079 tunnel-street-busway [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 080 tunnel-street-busguideway [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 082 tunnel-street-pedestrian-bicycle [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 084 tunnel-street-livingstreet-bicycle [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 085 tunnel-street-residential-bicycle [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 086 tunnel-street-unclassified-bicycle [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 087 tunnel-street-tertiary-link [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 088 tunnel-street-secondary-link [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 089 tunnel-street-primary-link [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 090 tunnel-street-trunk-link [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 091 tunnel-street-motorway-link [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [12, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 092 tunnel-street-tertiary [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 093 tunnel-street-secondary [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 094 tunnel-street-primary [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 9 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 095 tunnel-street-trunk [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 7 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1.67) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 096 tunnel-street-motorway [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 6 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2.5) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 097 tunnel-transport-tram:outline [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[0.1,0.5]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 098 tunnel-transport-narrowgauge:outline [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[0.1,0.5]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 099 tunnel-transport-subway:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 0.5.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 100 tunnel-transport-lightrail:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 0.5.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [8, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 101 tunnel-transport-lightrail-service:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [14, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 102 tunnel-transport-rail:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 9 = 0.3.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [8, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 103 tunnel-transport-rail-service:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [14, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 104 tunnel-transport-monorail:outline [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[0.1,0.5]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 105 tunnel-transport-funicular:outline [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[0.1,0.5]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 106 tunnel-transport-tram [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 107 tunnel-transport-narrowgauge [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 108 tunnel-transport-subway [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
//   - UNSUPPORTED line-dasharray=[2,2]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 109 tunnel-transport-lightrail [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
//   - UNSUPPORTED line-dasharray=[2,2]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [14, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 110 tunnel-transport-lightrail-service [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[2,2]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 111 tunnel-transport-rail [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 0.3.
//   - UNSUPPORTED line-dasharray=[2,2]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [14, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 112 tunnel-transport-rail-service [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[2,2]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 113 tunnel-transport-monorail [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 114 tunnel-transport-funicular [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 116 street-pedestrian-zone [fill] source-layer=street_polygons
//   - APPROXIMATION fill-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
// 117 way-footway:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 118 way-steps:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 119 way-path:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 120 way-cycleway:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 121 street-track:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 122 street-pedestrian:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 123 street-service:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 124 street-livingstreet:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 125 street-residential:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 126 street-unclassified:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 127 street-busway:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 128 street-busguideway:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 129 street-tertiary-link:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 130 street-secondary-link:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 131 street-primary-link:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 132 street-trunk-link:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 133 street-motorway-link:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [12, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 134 street-tertiary:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 135 street-secondary:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 136 street-primary:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 137 street-trunk:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2.67) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 138 street-motorway:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 3.5) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 139 way-footway [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 140 way-steps [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 141 way-path [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 142 way-cycleway [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 143 street-track [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 144 street-pedestrian [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 14 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 145 street-service [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 146 street-livingstreet [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 147 street-residential [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 148 street-unclassified [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 149 street-busway [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 150 street-busguideway [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 152 street-pedestrian-bicycle [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 154 street-livingstreet-bicycle [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 155 street-residential-bicycle [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 156 street-unclassified-bicycle [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 157 street-tertiary-link [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 158 street-secondary-link [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 159 street-primary-link [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 160 street-trunk-link [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 161 street-motorway-link [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [12, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 162 street-tertiary [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 163 street-secondary [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 164 street-primary [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 9 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 165 street-trunk [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 7 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1.67) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 166 street-motorway [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 6 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2.5) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 167 transport-tram:outline [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[0.1,0.5]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 168 transport-narrowgauge:outline [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[0.1,0.5]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 169 transport-subway:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 170 transport-lightrail:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [8, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 171 transport-lightrail-service:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [14, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 172 transport-rail:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 9 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [8, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 173 transport-rail-service:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [14, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 174 transport-monorail:outline [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[0.1,0.5]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 175 transport-funicular:outline [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[0.1,0.5]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 176 transport-tram [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 177 transport-narrowgauge [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 178 transport-subway [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
//   - UNSUPPORTED line-dasharray=[2,2]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 179 transport-lightrail [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
//   - UNSUPPORTED line-dasharray=[2,2]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [14, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 180 transport-lightrail-service [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[2,2]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 181 transport-rail [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
//   - UNSUPPORTED line-dasharray=[2,2]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [14, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 182 transport-rail-service [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[2,2]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 183 transport-monorail [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 184 transport-funicular [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 185 transport-ferry [line] source-layer=ferries
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 11 = 1.
//   - UNSUPPORTED line-dasharray=[1,1]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [10, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 186 bridge-way-footway:bridge [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 187 bridge-way-steps:bridge [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 188 bridge-way-path:bridge [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 189 bridge-way-cycleway:bridge [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 190 bridge-street-track:bridge [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 3) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 191 bridge-street-pedestrian:bridge [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 3) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 192 bridge-street-service:bridge [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 3) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 193 bridge-street-livingstreet:bridge [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 3) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 194 bridge-street-residential:bridge [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 3) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 195 bridge-street-unclassified:bridge [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 3) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 198 bridge-street-tertiary-link:bridge [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 3) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 199 bridge-street-secondary-link:bridge [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 3) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 200 bridge-street-primary-link:bridge [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 3) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 201 bridge-street-trunk-link:bridge [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 3) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 202 bridge-street-motorway-link:bridge [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 3) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [12, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 203 bridge-street-tertiary:bridge [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 3) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 204 bridge-street-secondary:bridge [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 3) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 205 bridge-street-primary:bridge [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 206 bridge-street-trunk:bridge [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 3) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 207 bridge-street-motorway:bridge [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 5) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 208 bridge-street-pedestrian-zone [fill] source-layer=street_polygons
//   - APPROXIMATION fill-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
// 209 bridge-way-footway:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 210 bridge-way-steps:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 211 bridge-way-path:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 212 bridge-way-cycleway:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 213 bridge-street-track:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 214 bridge-street-pedestrian:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 215 bridge-street-service:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 216 bridge-street-livingstreet:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 217 bridge-street-residential:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 218 bridge-street-unclassified:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 219 bridge-street-busway:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 220 bridge-street-busguideway:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 221 bridge-street-tertiary-link:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 222 bridge-street-secondary-link:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 223 bridge-street-primary-link:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 224 bridge-street-trunk-link:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 225 bridge-street-motorway-link:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [12, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 226 bridge-street-tertiary:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 227 bridge-street-secondary:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 228 bridge-street-primary:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 229 bridge-street-trunk:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2.67) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 230 bridge-street-motorway:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 3.5) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 231 bridge-way-footway [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 232 bridge-way-steps [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 233 bridge-way-path [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 234 bridge-way-cycleway [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 235 bridge-street-track [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 236 bridge-street-pedestrian [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 237 bridge-street-service [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 238 bridge-street-livingstreet [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 239 bridge-street-residential [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 240 bridge-street-unclassified [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 241 bridge-street-busway [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 242 bridge-street-busguideway [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 244 bridge-street-pedestrian-bicycle [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 246 bridge-street-livingstreet-bicycle [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 247 bridge-street-residential-bicycle [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 248 bridge-street-unclassified-bicycle [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 249 bridge-street-tertiary-link [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 250 bridge-street-secondary-link [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 251 bridge-street-primary-link [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 252 bridge-street-trunk-link [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 253 bridge-street-motorway-link [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [12, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 254 bridge-street-tertiary [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 255 bridge-street-secondary [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 256 bridge-street-primary [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 9 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 257 bridge-street-trunk [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 7 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1.67) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 258 bridge-street-motorway [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 6 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2.5) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 259 bridge-transport-tram:outline [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[0.1,0.5]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 260 bridge-transport-narrowgauge:outline [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[0.1,0.5]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 261 bridge-transport-subway:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 262 bridge-transport-lightrail:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [8, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 263 bridge-transport-lightrail-service:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [14, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 264 bridge-transport-rail:outline [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 9 = 1.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [8, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 265 bridge-transport-rail-service:outline [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [14, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 266 bridge-transport-monorail:outline [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[0.1,0.5]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 267 bridge-transport-funicular:outline [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[0.1,0.5]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 268 bridge-transport-tram [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 269 bridge-transport-narrowgauge [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 270 bridge-transport-subway [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
//   - UNSUPPORTED line-dasharray=[2,2]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 271 bridge-transport-lightrail [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
//   - UNSUPPORTED line-dasharray=[2,2]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [14, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 272 bridge-transport-lightrail-service [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[2,2]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 273 bridge-transport-rail [line] source-layer=streets
//   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
//   - UNSUPPORTED line-dasharray=[2,2]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [14, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 274 bridge-transport-rail-service [line] source-layer=streets
//   - UNSUPPORTED line-dasharray=[2,2]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [15, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 275 bridge-transport-monorail [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 276 bridge-transport-funicular [line] source-layer=streets
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 0) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - UNSUPPORTED zoom range [13, -]: Cesium3DTileStyle expressions have no access to the current view zoom level.
// 277 poi-amenity [symbol] source-layer=pois
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(187,187,187)' not emitted - see above)
//   - (text-color='rgb(187,187,187)' not emitted - see above)
// 278 poi-leisure [symbol] source-layer=pois
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(187,187,187)' not emitted - see above)
//   - (text-color='rgb(187,187,187)' not emitted - see above)
// 279 poi-tourism [symbol] source-layer=pois
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(187,187,187)' not emitted - see above)
//   - (text-color='rgb(187,187,187)' not emitted - see above)
// 280 poi-shop [symbol] source-layer=pois
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(187,187,187)' not emitted - see above)
//   - (text-color='rgb(187,187,187)' not emitted - see above)
// 281 poi-man_made [symbol] source-layer=pois
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(187,187,187)' not emitted - see above)
//   - (text-color='rgb(187,187,187)' not emitted - see above)
// 282 poi-historic [symbol] source-layer=pois
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(187,187,187)' not emitted - see above)
//   - (text-color='rgb(187,187,187)' not emitted - see above)
// 283 poi-emergency [symbol] source-layer=pois
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(187,187,187)' not emitted - see above)
//   - (text-color='rgb(187,187,187)' not emitted - see above)
// 284 poi-highway [symbol] source-layer=pois
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(187,187,187)' not emitted - see above)
//   - (text-color='rgb(187,187,187)' not emitted - see above)
// 285 poi-office [symbol] source-layer=pois
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(187,187,187)' not emitted - see above)
//   - (text-color='rgb(187,187,187)' not emitted - see above)
// 286 boundary-country:outline [line] source-layer=boundaries
//   - UNSUPPORTED line-blur=1: no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 6.29) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - APPROXIMATION line-width: capped from 6.29 to 6 (see MAX_LINE_WIDTH) to bound miter-join spiking at sharp vertices.
// 287 boundary-country-disputed:outline [line] source-layer=boundaries
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 6.29) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
//   - APPROXIMATION line-width: capped from 6.29 to 6 (see MAX_LINE_WIDTH) to bound miter-join spiking at sharp vertices.
// 288 boundary-state:outline [line] source-layer=boundaries
//   - UNSUPPORTED line-blur=1: no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 2) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 289 boundary-country [line] source-layer=boundaries
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 3.14) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 290 boundary-country-disputed [line] source-layer=boundaries
//   - UNSUPPORTED line-dasharray=[2,1]: dash patterns have no Cesium3DTileStyle equivalent.
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 3.14) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 291 boundary-state [line] source-layer=boundaries
//   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle (lineWidth has no per-frame access to camera zoom); using the value interpolated at a fixed reference zoom 8 (= 1) as a single always-applied width, matching how this layer looks in MapLibre at that zoom.
// 292 label-address-housenumber [symbol] source-layer=addresses
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(106,106,106)' not emitted - see above)
//   - (text-color='rgb(106,106,106)' not emitted - see above)
// 293 label-motorway-shield [symbol] source-layer=street_labels
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(51,51,51)' not emitted - see above)
//   - (text-color='rgb(51,51,51)' not emitted - see above)
// 294 label-street-pedestrian [symbol] source-layer=street_labels
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(207,207,207)' not emitted - see above)
//   - (text-color='rgb(207,207,207)' not emitted - see above)
// 295 label-street-livingstreet [symbol] source-layer=street_labels
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(207,207,207)' not emitted - see above)
//   - (text-color='rgb(207,207,207)' not emitted - see above)
// 296 label-street-residential [symbol] source-layer=street_labels
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(207,207,207)' not emitted - see above)
//   - (text-color='rgb(207,207,207)' not emitted - see above)
// 297 label-street-unclassified [symbol] source-layer=street_labels
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(207,207,207)' not emitted - see above)
//   - (text-color='rgb(207,207,207)' not emitted - see above)
// 298 label-street-tertiary [symbol] source-layer=street_labels
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(207,207,207)' not emitted - see above)
//   - (text-color='rgb(207,207,207)' not emitted - see above)
// 299 label-street-secondary [symbol] source-layer=street_labels
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(207,207,207)' not emitted - see above)
//   - (text-color='rgb(207,207,207)' not emitted - see above)
// 300 label-street-primary [symbol] source-layer=street_labels
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(207,207,207)' not emitted - see above)
//   - (text-color='rgb(207,207,207)' not emitted - see above)
// 301 label-street-trunk [symbol] source-layer=street_labels
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(207,207,207)' not emitted - see above)
//   - (text-color='rgb(207,207,207)' not emitted - see above)
// 302 label-street-track [symbol] source-layer=street_labels
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(207,207,207)' not emitted - see above)
//   - (text-color='rgb(207,207,207)' not emitted - see above)
// 303 label-place-neighbourhood [symbol] source-layer=place_labels
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(210,210,210)' not emitted - see above)
//   - (text-color='rgb(210,210,210)' not emitted - see above)
// 304 label-place-quarter [symbol] source-layer=place_labels
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(210,210,210)' not emitted - see above)
//   - (text-color='rgb(210,210,210)' not emitted - see above)
// 305 label-place-suburb [symbol] source-layer=place_labels
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(210,210,210)' not emitted - see above)
//   - (text-color='rgb(210,210,210)' not emitted - see above)
// 306 label-place-hamlet [symbol] source-layer=place_labels
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(210,210,210)' not emitted - see above)
//   - (text-color='rgb(210,210,210)' not emitted - see above)
// 307 label-place-village [symbol] source-layer=place_labels
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(210,210,210)' not emitted - see above)
//   - (text-color='rgb(210,210,210)' not emitted - see above)
// 308 label-place-town [symbol] source-layer=place_labels
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(210,210,210)' not emitted - see above)
//   - (text-color='rgb(210,210,210)' not emitted - see above)
// 309 label-boundary-state [symbol] source-layer=boundary_labels
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(197,197,197)' not emitted - see above)
//   - (text-color='rgb(197,197,197)' not emitted - see above)
// 310 label-place-city [symbol] source-layer=place_labels
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(210,210,210)' not emitted - see above)
//   - (text-color='rgb(210,210,210)' not emitted - see above)
// 311 label-place-statecapital [symbol] source-layer=place_labels
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(210,210,210)' not emitted - see above)
//   - (text-color='rgb(210,210,210)' not emitted - see above)
// 312 label-place-capital [symbol] source-layer=place_labels
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(210,210,210)' not emitted - see above)
//   - (text-color='rgb(210,210,210)' not emitted - see above)
// 313 label-boundary-country-small [symbol] source-layer=boundary_labels
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(207,207,207)' not emitted - see above)
//   - (text-color='rgb(207,207,207)' not emitted - see above)
// 314 label-boundary-country-medium [symbol] source-layer=boundary_labels
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(207,207,207)' not emitted - see above)
//   - (text-color='rgb(207,207,207)' not emitted - see above)
// 315 label-boundary-country-large [symbol] source-layer=boundary_labels
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(207,207,207)' not emitted - see above)
//   - (text-color='rgb(207,207,207)' not emitted - see above)
// 316 marking-oneway [symbol] source-layer=streets
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
// 317 marking-oneway-reverse [symbol] source-layer=streets
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
// 318 symbol-transit-bus [symbol] source-layer=public_transport
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(173,173,173)' not emitted - see above)
//   - (text-color='rgb(173,173,173)' not emitted - see above)
// 319 symbol-transit-tram [symbol] source-layer=public_transport
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(173,173,173)' not emitted - see above)
//   - (text-color='rgb(173,173,173)' not emitted - see above)
// 320 symbol-transit-subway [symbol] source-layer=public_transport
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(173,173,173)' not emitted - see above)
//   - (text-color='rgb(173,173,173)' not emitted - see above)
// 321 symbol-transit-lightrail [symbol] source-layer=public_transport
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(173,173,173)' not emitted - see above)
//   - (text-color='rgb(173,173,173)' not emitted - see above)
// 322 symbol-transit-station [symbol] source-layer=public_transport
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(173,173,173)' not emitted - see above)
//   - (text-color='rgb(173,173,173)' not emitted - see above)
// 323 symbol-transit-airfield [symbol] source-layer=public_transport
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(173,173,173)' not emitted - see above)
//   - (text-color='rgb(173,173,173)' not emitted - see above)
// 324 symbol-transit-airport [symbol] source-layer=public_transport
//   - UNSUPPORTED symbol layer: text-field/icon-image/font/label styling (labelColor, font, labelText, ...) is only evaluated by Cesium for point-cloud (pnts) tileset features, not for the batched glTF features this vector tile pipeline produces; only show is emitted for this layer.
//   - (icon-color='rgb(173,173,173)' not emitted - see above)
//   - (text-color='rgb(173,173,173)' not emitted - see above)
