import { Cesium3DTileStyle } from 'cesium';
/**
 * Shortbread (versatiles-shadow) -> Cesium3DTileStyle best-effort translation.
 *
 * IMPORTANT: Cesium MVT exposes the source layer as the `_layer` feature
 * property in current MVTDataProvider, so every condition is scoped by
 * `${_layer}`. This is required because the original Shortbread rules use
 * Mapbox source-layer rather than an ordinary feature attribute.
 *
 * Unsupported/approximated properties are preserved as comments below.
 * Mapbox layer compositing, zoom-dependent stops, dash arrays, caps/joins,
 * and symbol collision/placement cannot be represented by one Cesium3DTileStyle.
 */

const VECTOR_TILE_STYLE = new Cesium3DTileStyle({
  // Feature visibility: true when at least one Shortbread rule matches.
  show: {
    conditions: [
      // 002 water-ocean [fill] source-layer=ocean
      ['((${_layer} === "ocean") && true)', 'true'],
      // 003 land-glacier [fill] source-layer=water_polygons
      ['((${_layer} === "water_polygons") && ((${kind} === "glacier")))', 'true'],
      // 004 land-commercial [fill] source-layer=land
      ['((${_layer} === "land") && (((${kind} === "commercial") || (${kind} === "retail"))))', 'true'],
      // 005 land-industrial [fill] source-layer=land
      ['((${_layer} === "land") && (((${kind} === "industrial") || (${kind} === "quarry") || (${kind} === "railway"))))', 'true'],
      // 006 land-residential [fill] source-layer=land
      ['((${_layer} === "land") && (((${kind} === "garages") || (${kind} === "residential"))))', 'true'],
      // 007 land-agriculture [fill] source-layer=land
      [
        '((${_layer} === "land") && (((${kind} === "brownfield") || (${kind} === "farmland") || (${kind} === "farmyard") || (${kind} === "greenfield") || (${kind} === "greenhouse_horticulture") || (${kind} === "orchard") || (${kind} === "plant_nursery") || (${kind} === "vineyard"))))',
        'true',
      ],
      // 008 land-waste [fill] source-layer=land
      ['((${_layer} === "land") && (((${kind} === "landfill"))))', 'true'],
      // 009 land-park [fill] source-layer=land
      ['((${_layer} === "land") && (((${kind} === "park") || (${kind} === "village_green") || (${kind} === "recreation_ground"))))', 'true'],
      // 010 land-garden [fill] source-layer=land
      ['((${_layer} === "land") && (((${kind} === "allotments") || (${kind} === "garden"))))', 'true'],
      // 011 land-burial [fill] source-layer=land
      ['((${_layer} === "land") && (((${kind} === "cemetery") || (${kind} === "grave_yard"))))', 'true'],
      // 012 land-leisure [fill] source-layer=land
      ['((${_layer} === "land") && (((${kind} === "miniature_golf") || (${kind} === "playground") || (${kind} === "golf_course"))))', 'true'],
      // 013 land-rock [fill] source-layer=land
      ['((${_layer} === "land") && (((${kind} === "bare_rock") || (${kind} === "scree") || (${kind} === "shingle"))))', 'true'],
      // 014 land-forest [fill] source-layer=land
      ['((${_layer} === "land") && (((${kind} === "forest"))))', 'true'],
      // 015 land-grass [fill] source-layer=land
      [
        '((${_layer} === "land") && (((${kind} === "grass") || (${kind} === "grassland") || (${kind} === "meadow") || (${kind} === "wet_meadow"))))',
        'true',
      ],
      // 016 land-vegetation [fill] source-layer=land
      ['((${_layer} === "land") && (((${kind} === "heath") || (${kind} === "scrub"))))', 'true'],
      // 017 land-sand [fill] source-layer=land
      ['((${_layer} === "land") && (((${kind} === "beach") || (${kind} === "sand"))))', 'true'],
      // 018 land-wetland [fill] source-layer=land
      ['((${_layer} === "land") && (((${kind} === "bog") || (${kind} === "marsh") || (${kind} === "string_bog") || (${kind} === "swamp"))))', 'true'],
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
        '((${_layer} === "public_transport") && (((${kind} === "station") || (${kind} === "halt")) && (!((${station} === "light_rail") || (${station} === "subway")))))',
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
      ['((${_layer} === "ocean") && true)', 'color("rgba(82,82,82,1.0)")'],
      // 003 land-glacier [fill color]
      ['((${_layer} === "water_polygons") && ((${kind} === "glacier")))', 'color("rgba(51,51,51,1.0)")'],
      // 004 land-commercial [fill color]
      ['((${_layer} === "land") && (((${kind} === "commercial") || (${kind} === "retail"))))', 'color("rgba(67,67,67,0.251)")'],
      // 005 land-industrial [fill color]
      [
        '((${_layer} === "land") && (((${kind} === "industrial") || (${kind} === "quarry") || (${kind} === "railway"))))',
        'color("rgba(75,75,75,0.333)")',
      ],
      // 006 land-residential [fill color]
      ['((${_layer} === "land") && (((${kind} === "garages") || (${kind} === "residential"))))', 'color("rgba(71,71,71,0.2)")'],
      // 007 land-agriculture [fill color]
      [
        '((${_layer} === "land") && (((${kind} === "brownfield") || (${kind} === "farmland") || (${kind} === "farmyard") || (${kind} === "greenfield") || (${kind} === "greenhouse_horticulture") || (${kind} === "orchard") || (${kind} === "plant_nursery") || (${kind} === "vineyard"))))',
        'color("rgba(75,75,75,1.0)")',
      ],
      // 008 land-waste [fill color]
      ['((${_layer} === "land") && (((${kind} === "landfill"))))', 'color("rgba(92,92,92,1.0)")'],
      // 009 land-park [fill color]
      [
        '((${_layer} === "land") && (((${kind} === "park") || (${kind} === "village_green") || (${kind} === "recreation_ground"))))',
        'color("rgba(102,102,102,1.0)")',
      ],
      // 010 land-garden [fill color]
      ['((${_layer} === "land") && (((${kind} === "allotments") || (${kind} === "garden"))))', 'color("rgba(102,102,102,1.0)")'],
      // 011 land-burial [fill color]
      ['((${_layer} === "land") && (((${kind} === "cemetery") || (${kind} === "grave_yard"))))', 'color("rgba(86,86,86,1.0)")'],
      // 012 land-leisure [fill color]
      [
        '((${_layer} === "land") && (((${kind} === "miniature_golf") || (${kind} === "playground") || (${kind} === "golf_course"))))',
        'color("rgba(71,71,71,1.0)")',
      ],
      // 013 land-rock [fill color]
      [
        '((${_layer} === "land") && (((${kind} === "bare_rock") || (${kind} === "scree") || (${kind} === "shingle"))))',
        'color("rgba(74,74,74,1.0)")',
      ],
      // 014 land-forest [fill color]
      ['((${_layer} === "land") && (((${kind} === "forest"))))', 'color("rgba(160,160,160,0.1)")'],
      // 015 land-grass [fill color]
      [
        '((${_layer} === "land") && (((${kind} === "grass") || (${kind} === "grassland") || (${kind} === "meadow") || (${kind} === "wet_meadow"))))',
        'color("rgba(82,82,82,1.0)")',
      ],
      // 016 land-vegetation [fill color]
      ['((${_layer} === "land") && (((${kind} === "heath") || (${kind} === "scrub"))))', 'color("rgba(102,102,102,1.0)")'],
      // 017 land-sand [fill color]
      ['((${_layer} === "land") && (((${kind} === "beach") || (${kind} === "sand"))))', 'color("rgba(60,60,60,1.0)")'],
      // 018 land-wetland [fill color]
      [
        '((${_layer} === "land") && (((${kind} === "bog") || (${kind} === "marsh") || (${kind} === "string_bog") || (${kind} === "swamp"))))',
        'color("rgba(79,79,79,1.0)")',
      ],
      // 019 water-river [line color]
      ['((${_layer} === "water_lines") && (((${kind} === "river")) && (${tunnel} !== true) && (${bridge} !== true)))', 'color("rgba(82,82,82,1.0)")'],
      // 020 water-canal [line color]
      ['((${_layer} === "water_lines") && (((${kind} === "canal")) && (${tunnel} !== true) && (${bridge} !== true)))', 'color("rgba(82,82,82,1.0)")'],
      // 021 water-stream [line color]
      [
        '((${_layer} === "water_lines") && (((${kind} === "stream")) && (${tunnel} !== true) && (${bridge} !== true)))',
        'color("rgba(82,82,82,1.0)")',
      ],
      // 022 water-ditch [line color]
      ['((${_layer} === "water_lines") && (((${kind} === "ditch")) && (${tunnel} !== true) && (${bridge} !== true)))', 'color("rgba(82,82,82,1.0)")'],
      // 023 water-area [fill color]
      ['((${_layer} === "water_polygons") && (${kind} === "water"))', 'color("rgba(82,82,82,1.0)")'],
      // 024 water-area-river [fill color]
      ['((${_layer} === "water_polygons") && (${kind} === "river"))', 'color("rgba(82,82,82,1.0)")'],
      // 025 water-area-small [fill color]
      [
        '((${_layer} === "water_polygons") && ((${kind} === "reservoir") || (${kind} === "basin") || (${kind} === "dock")))',
        'color("rgba(82,82,82,1.0)")',
      ],
      // 026 water-dam-area [fill color]
      ['((${_layer} === "dam_polygons") && (${kind} === "dam"))', 'color("rgba(60,60,60,1.0)")'],
      // 027 water-dam [line color]
      ['((${_layer} === "dam_lines") && (${kind} === "dam"))', 'color("rgba(82,82,82,1.0)")'],
      // 028 water-pier-area [fill color]
      [
        '((${_layer} === "pier_polygons") && ((${kind} === "pier") || (${kind} === "breakwater") || (${kind} === "groyne")))',
        'color("rgba(60,60,60,1.0)")',
      ],
      // 029 water-pier [line color]
      [
        '((${_layer} === "pier_lines") && ((${kind} === "pier") || (${kind} === "breakwater") || (${kind} === "groyne")))',
        'color("rgba(60,60,60,1.0)")',
      ],
      // 030 site-dangerarea [fill color]
      ['((${_layer} === "sites") && ((${kind} === "danger_area")))', 'color("rgba(153,153,153,0.3)")'],
      // 031 site-university [fill color]
      ['((${_layer} === "sites") && ((${kind} === "university")))', 'color("rgba(102,102,102,0.1)")'],
      // 032 site-college [fill color]
      ['((${_layer} === "sites") && ((${kind} === "college")))', 'color("rgba(102,102,102,0.1)")'],
      // 033 site-school [fill color]
      ['((${_layer} === "sites") && ((${kind} === "school")))', 'color("rgba(102,102,102,0.1)")'],
      // 034 site-hospital [fill color]
      ['((${_layer} === "sites") && ((${kind} === "hospital")))', 'color("rgba(112,112,112,0.1)")'],
      // 035 site-prison [fill color]
      ['((${_layer} === "sites") && ((${kind} === "prison")))', 'color("rgba(57,57,57,0.1)")'],
      // 036 site-parking [fill color]
      ['((${_layer} === "sites") && ((${kind} === "parking")))', 'color("rgba(69,69,69,1.0)")'],
      // 037 site-bicycleparking [fill color]
      ['((${_layer} === "sites") && ((${kind} === "bicycle_parking")))', 'color("rgba(69,69,69,1.0)")'],
      // 038 site-construction [fill color]
      ['((${_layer} === "sites") && ((${kind} === "construction")))', 'color("rgba(120,120,120,0.1)")'],
      // 039 airport-area [fill color]
      ['((${_layer} === "street_polygons") && ((${kind} === "runway") || (${kind} === "taxiway")))', 'color("rgba(51,51,51,0.5)")'],
      // 040 airport-taxiway:outline [line color]
      ['((${_layer} === "streets") && (${kind} === "taxiway"))', 'color("rgba(91,91,91,1.0)")'],
      // 041 airport-runway:outline [line color]
      ['((${_layer} === "streets") && (${kind} === "runway"))', 'color("rgba(91,91,91,1.0)")'],
      // 042 airport-taxiway [line color]
      ['((${_layer} === "streets") && (${kind} === "taxiway"))', 'color("rgba(51,51,51,1.0)")'],
      // 043 airport-runway [line color]
      ['((${_layer} === "streets") && (${kind} === "runway"))', 'color("rgba(51,51,51,1.0)")'],
      // 044 building:outline [fill color]
      ['((${_layer} === "buildings") && true)', 'color("rgba(80,80,80,1.0)")'],
      // 045 building [fill color]
      ['((${_layer} === "buildings") && true)', 'color("rgba(68,68,68,1.0)")'],
      // 046 tunnel-street-pedestrian-zone [fill color]
      ['((${_layer} === "street_polygons") && ((${tunnel} === true) && (${kind} === "pedestrian")))', 'color("rgba(57,57,57,1.0)")'],
      // 047 tunnel-way-footway:outline [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "footway"))))', 'color("hsl(0,0%,31%)", 1)'],
      // 048 tunnel-way-steps:outline [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "steps"))))', 'color("hsl(0,0%,31%)", 1)'],
      // 049 tunnel-way-path:outline [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "path"))))', 'color("hsl(0,0%,31%)", 1)'],
      // 050 tunnel-way-cycleway:outline [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "cycleway"))))', 'color("hsl(0,0%,30%)", 1)'],
      // 051 tunnel-street-track:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${tunnel} === true)))', 'color("rgba(78,78,78,1.0)")'],
      // 052 tunnel-street-pedestrian:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${tunnel} === true)))', 'color("rgba(78,78,78,1.0)")'],
      // 053 tunnel-street-service:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${tunnel} === true)))', 'color("rgba(64,64,64,1.0)")'],
      // 054 tunnel-street-livingstreet:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${tunnel} === true)))', 'color("rgba(78,78,78,1.0)")'],
      // 055 tunnel-street-residential:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${tunnel} === true)))', 'color("rgba(78,78,78,1.0)")'],
      // 056 tunnel-street-unclassified:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${tunnel} === true)))', 'color("rgba(78,78,78,1.0)")'],
      // 057 tunnel-street-busway:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${tunnel} === true)))', 'color("rgba(64,64,64,1.0)")'],
      // 058 tunnel-street-busguideway:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${tunnel} === true)))', 'color("rgba(64,64,64,1.0)")'],
      // 059 tunnel-street-tertiary-link:outline [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "tertiary")) && (${link} === true)))', 'color("rgba(78,78,78,1.0)")'],
      // 060 tunnel-street-secondary-link:outline [line color]
      [
        '((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "secondary")) && (${link} === true)))',
        'color("rgba(108,108,108,1.0)")',
      ],
      // 061 tunnel-street-primary-link:outline [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "primary")) && (${link} === true)))', 'color("rgba(108,108,108,1.0)")'],
      // 062 tunnel-street-trunk-link:outline [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "trunk")) && (${link} === true)))', 'color("rgba(108,108,108,1.0)")'],
      // 063 tunnel-street-motorway-link:outline [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "motorway")) && (${link} === true)))', 'color("rgba(108,108,108,1.0)")'],
      // 064 tunnel-street-tertiary:outline [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "tertiary")) && (${link} !== true)))', 'color("rgba(78,78,78,1.0)")'],
      // 065 tunnel-street-secondary:outline [line color]
      [
        '((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "secondary")) && (${link} !== true)))',
        'color("rgba(108,108,108,1.0)")',
      ],
      // 066 tunnel-street-primary:outline [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "primary")) && (${link} !== true)))', 'color("rgba(108,108,108,1.0)")'],
      // 067 tunnel-street-trunk:outline [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "trunk")) && (${link} !== true)))', 'color("rgba(108,108,108,1.0)")'],
      // 068 tunnel-street-motorway:outline [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "motorway")) && (${link} !== true)))', 'color("rgba(108,108,108,1.0)")'],
      // 069 tunnel-way-footway [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "footway"))))', 'color("hsl(0,0%,25%)", 1)'],
      // 070 tunnel-way-steps [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "steps"))))', 'color("hsl(0,0%,25%)", 1)'],
      // 071 tunnel-way-path [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "path"))))', 'color("hsl(0,0%,25%)", 1)'],
      // 072 tunnel-way-cycleway [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "cycleway"))))', 'color("hsl(0,0%,24%)", 1)'],
      // 073 tunnel-street-track [line color]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${tunnel} === true)))', 'color("rgba(57,57,57,1.0)")'],
      // 074 tunnel-street-pedestrian [line color]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${tunnel} === true)))', 'color("rgba(57,57,57,1.0)")'],
      // 075 tunnel-street-service [line color]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${tunnel} === true)))', 'color("rgba(57,57,57,1.0)")'],
      // 076 tunnel-street-livingstreet [line color]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${tunnel} === true)))', 'color("rgba(57,57,57,1.0)")'],
      // 077 tunnel-street-residential [line color]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${tunnel} === true)))', 'color("rgba(57,57,57,1.0)")'],
      // 078 tunnel-street-unclassified [line color]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${tunnel} === true)))', 'color("rgba(57,57,57,1.0)")'],
      // 079 tunnel-street-busway [line color]
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${tunnel} === true)))', 'color("rgba(57,57,57,1.0)")'],
      // 080 tunnel-street-busguideway [line color]
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${tunnel} === true)))', 'color("rgba(57,57,57,1.0)")'],
      // 081 tunnel-street-track-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "track") && (${bicycle} === "designated") && (${tunnel} === true)))',
        'color("rgba(57,57,57,1.0)")',
      ],
      // 082 tunnel-street-pedestrian-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bicycle} === "designated") && (${tunnel} === true)))',
        'color("rgba(57,57,57,1.0)")',
      ],
      // 083 tunnel-street-service-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "service") && (${bicycle} === "designated") && (${tunnel} === true)))',
        'color("rgba(57,57,57,1.0)")',
      ],
      // 084 tunnel-street-livingstreet-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "living_street") && (${bicycle} === "designated") && (${tunnel} === true)))',
        'color("rgba(57,57,57,1.0)")',
      ],
      // 085 tunnel-street-residential-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "residential") && (${bicycle} === "designated") && (${tunnel} === true)))',
        'color("rgba(57,57,57,1.0)")',
      ],
      // 086 tunnel-street-unclassified-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "unclassified") && (${bicycle} === "designated") && (${tunnel} === true)))',
        'color("rgba(57,57,57,1.0)")',
      ],
      // 087 tunnel-street-tertiary-link [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "tertiary")) && (${link} === true)))', 'color("rgba(57,57,57,1.0)")'],
      // 088 tunnel-street-secondary-link [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "secondary")) && (${link} === true)))', 'color("rgba(77,77,77,1.0)")'],
      // 089 tunnel-street-primary-link [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "primary")) && (${link} === true)))', 'color("rgba(77,77,77,1.0)")'],
      // 090 tunnel-street-trunk-link [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "trunk")) && (${link} === true)))', 'color("rgba(77,77,77,1.0)")'],
      // 091 tunnel-street-motorway-link [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "motorway")) && (${link} === true)))', 'color("rgba(89,89,89,1.0)")'],
      // 092 tunnel-street-tertiary [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "tertiary")) && (${link} !== true)))', 'color("rgba(57,57,57,1.0)")'],
      // 093 tunnel-street-secondary [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "secondary")) && (${link} !== true)))', 'color("rgba(77,77,77,1.0)")'],
      // 094 tunnel-street-primary [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "primary")) && (${link} !== true)))', 'color("rgba(77,77,77,1.0)")'],
      // 095 tunnel-street-trunk [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "trunk")) && (${link} !== true)))', 'color("rgba(77,77,77,1.0)")'],
      // 096 tunnel-street-motorway [line color]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "motorway")) && (${link} !== true)))', 'color("rgba(89,89,89,1.0)")'],
      // 097 tunnel-transport-tram:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${tunnel} === true)))',
        'color("rgba(106,106,106,1.0)")',
      ],
      // 098 tunnel-transport-narrowgauge:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${tunnel} === true)))',
        'color("rgba(106,106,106,1.0)")',
      ],
      // 099 tunnel-transport-subway:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${tunnel} === true)))',
        'color("rgba(109,109,109,0.5)")',
      ],
      // 100 tunnel-transport-lightrail:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${tunnel} === true)))',
        'color("rgba(106,106,106,0.5)")',
      ],
      // 101 tunnel-transport-lightrail-service:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${tunnel} === true)))',
        'color("rgba(106,106,106,1.0)")',
      ],
      // 102 tunnel-transport-rail:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${tunnel} === true)))',
        'color("rgba(106,106,106,0.3)")',
      ],
      // 103 tunnel-transport-rail-service:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${tunnel} === true)))',
        'color("rgba(106,106,106,1.0)")',
      ],
      // 104 tunnel-transport-monorail:outline [line color]
      ['((${_layer} === "streets") && (((${kind} === "monorail")) && (${tunnel} === true)))', 'color("rgba(106,106,106,1.0)")'],
      // 105 tunnel-transport-funicular:outline [line color]
      ['((${_layer} === "streets") && (((${kind} === "funicular")) && (${tunnel} === true)))', 'color("rgba(106,106,106,1.0)")'],
      // 106 tunnel-transport-tram [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${tunnel} === true)))',
        'color("rgba(106,106,106,1.0)")',
      ],
      // 107 tunnel-transport-narrowgauge [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${tunnel} === true)))',
        'color("rgba(106,106,106,1.0)")',
      ],
      // 108 tunnel-transport-subway [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${tunnel} === true)))',
        'color("rgba(82,82,82,1.0)")',
      ],
      // 109 tunnel-transport-lightrail [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${tunnel} === true)))',
        'color("rgba(79,79,79,1.0)")',
      ],
      // 110 tunnel-transport-lightrail-service [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${tunnel} === true)))',
        'color("rgba(79,79,79,1.0)")',
      ],
      // 111 tunnel-transport-rail [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${tunnel} === true)))',
        'color("rgba(79,79,79,0.3)")',
      ],
      // 112 tunnel-transport-rail-service [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${tunnel} === true)))',
        'color("rgba(79,79,79,1.0)")',
      ],
      // 113 tunnel-transport-monorail [line color]
      ['((${_layer} === "streets") && (((${kind} === "monorail")) && (${tunnel} === true)))', 'color("rgba(106,106,106,1.0)")'],
      // 114 tunnel-transport-funicular [line color]
      ['((${_layer} === "streets") && (((${kind} === "funicular")) && (${tunnel} === true)))', 'color("rgba(106,106,106,1.0)")'],
      // 115 bridge [fill color]
      ['((${_layer} === "bridges") && true)', 'color("rgba(64,64,64,0.8)")'],
      // 116 street-pedestrian-zone [fill color]
      [
        '((${_layer} === "street_polygons") && ((${bridge} !== true) && (${tunnel} !== true) && (${kind} === "pedestrian")))',
        'color("rgba(58,58,58,0.25)")',
      ],
      // 117 way-footway:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "footway"))))', 'color("rgba(79,79,79,1.0)")'],
      // 118 way-steps:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "steps"))))', 'color("rgba(79,79,79,1.0)")'],
      // 119 way-path:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "path"))))', 'color("rgba(79,79,79,1.0)")'],
      // 120 way-cycleway:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "cycleway"))))', 'color("rgba(77,77,77,1.0)")'],
      // 121 street-track:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bridge} !== true) && (${tunnel} !== true)))', 'color("rgba(91,91,91,1.0)")'],
      // 122 street-pedestrian:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bridge} !== true) && (${tunnel} !== true)))', 'color("rgba(91,91,91,1.0)")'],
      // 123 street-service:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bridge} !== true) && (${tunnel} !== true)))', 'color("rgba(64,64,64,1.0)")'],
      // 124 street-livingstreet:outline [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "living_street") && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(91,91,91,1.0)")',
      ],
      // 125 street-residential:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bridge} !== true) && (${tunnel} !== true)))', 'color("rgba(91,91,91,1.0)")'],
      // 126 street-unclassified:outline [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "unclassified") && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(91,91,91,1.0)")',
      ],
      // 127 street-busway:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${bridge} !== true) && (${tunnel} !== true)))', 'color("rgba(64,64,64,1.0)")'],
      // 128 street-busguideway:outline [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(64,64,64,1.0)")',
      ],
      // 129 street-tertiary-link:outline [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "tertiary")) && (${link} === true)))',
        'color("rgba(91,91,91,1.0)")',
      ],
      // 130 street-secondary-link:outline [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "secondary")) && (${link} === true)))',
        'color("rgba(114,114,114,1.0)")',
      ],
      // 131 street-primary-link:outline [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "primary")) && (${link} === true)))',
        'color("rgba(114,114,114,1.0)")',
      ],
      // 132 street-trunk-link:outline [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "trunk")) && (${link} === true)))',
        'color("rgba(114,114,114,1.0)")',
      ],
      // 133 street-motorway-link:outline [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "motorway")) && (${link} === true)))',
        'color("rgba(114,114,114,1.0)")',
      ],
      // 134 street-tertiary:outline [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "tertiary")) && (${link} !== true)))',
        'color("rgba(91,91,91,1.0)")',
      ],
      // 135 street-secondary:outline [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "secondary")) && (${link} !== true)))',
        'color("rgba(114,114,114,1.0)")',
      ],
      // 136 street-primary:outline [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "primary")) && (${link} !== true)))',
        'color("rgba(114,114,114,1.0)")',
      ],
      // 137 street-trunk:outline [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "trunk")) && (${link} !== true)))',
        'color("rgba(114,114,114,1.0)")',
      ],
      // 138 street-motorway:outline [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "motorway")) && (${link} !== true)))',
        'color("rgba(114,114,114,1.0)")',
      ],
      // 139 way-footway [line color]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "footway"))))', 'color("rgba(58,58,58,1.0)")'],
      // 140 way-steps [line color]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "steps"))))', 'color("rgba(58,58,58,1.0)")'],
      // 141 way-path [line color]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "path"))))', 'color("rgba(58,58,58,1.0)")'],
      // 142 way-cycleway [line color]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "cycleway"))))', 'color("rgba(57,57,57,1.0)")'],
      // 143 street-track [line color]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bridge} !== true) && (${tunnel} !== true)))', 'color("rgba(51,51,51,1.0)")'],
      // 144 street-pedestrian [line color]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bridge} !== true) && (${tunnel} !== true)))', 'color("rgba(59,59,59,1.0)")'],
      // 145 street-service [line color]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bridge} !== true) && (${tunnel} !== true)))', 'color("rgba(57,57,57,1.0)")'],
      // 146 street-livingstreet [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "living_street") && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(51,51,51,1.0)")',
      ],
      // 147 street-residential [line color]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bridge} !== true) && (${tunnel} !== true)))', 'color("rgba(51,51,51,1.0)")'],
      // 148 street-unclassified [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "unclassified") && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(51,51,51,1.0)")',
      ],
      // 149 street-busway [line color]
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${bridge} !== true) && (${tunnel} !== true)))', 'color("rgba(57,57,57,1.0)")'],
      // 150 street-busguideway [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(57,57,57,1.0)")',
      ],
      // 151 street-track-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "track") && (${bicycle} === "designated") && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(51,51,51,1.0)")',
      ],
      // 152 street-pedestrian-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bicycle} === "designated") && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(57,57,57,1.0)")',
      ],
      // 153 street-service-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "service") && (${bicycle} === "designated") && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(51,51,51,1.0)")',
      ],
      // 154 street-livingstreet-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "living_street") && (${bicycle} === "designated") && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(57,57,57,1.0)")',
      ],
      // 155 street-residential-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "residential") && (${bicycle} === "designated") && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(57,57,57,1.0)")',
      ],
      // 156 street-unclassified-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "unclassified") && (${bicycle} === "designated") && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(57,57,57,1.0)")',
      ],
      // 157 street-tertiary-link [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "tertiary")) && (${link} === true)))',
        'color("rgba(51,51,51,1.0)")',
      ],
      // 158 street-secondary-link [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "secondary")) && (${link} === true)))',
        'color("rgba(85,85,85,1.0)")',
      ],
      // 159 street-primary-link [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "primary")) && (${link} === true)))',
        'color("rgba(85,85,85,1.0)")',
      ],
      // 160 street-trunk-link [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "trunk")) && (${link} === true)))',
        'color("rgba(85,85,85,1.0)")',
      ],
      // 161 street-motorway-link [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "motorway")) && (${link} === true)))',
        'color("rgba(99,99,99,1.0)")',
      ],
      // 162 street-tertiary [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "tertiary")) && (${link} !== true)))',
        'color("rgba(51,51,51,1.0)")',
      ],
      // 163 street-secondary [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "secondary")) && (${link} !== true)))',
        'color("rgba(85,85,85,1.0)")',
      ],
      // 164 street-primary [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "primary")) && (${link} !== true)))',
        'color("rgba(85,85,85,1.0)")',
      ],
      // 165 street-trunk [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "trunk")) && (${link} !== true)))',
        'color("rgba(85,85,85,1.0)")',
      ],
      // 166 street-motorway [line color]
      [
        '((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "motorway")) && (${link} !== true)))',
        'color("rgba(99,99,99,1.0)")',
      ],
      // 167 transport-tram:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(106,106,106,1.0)")',
      ],
      // 168 transport-narrowgauge:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(106,106,106,1.0)")',
      ],
      // 169 transport-subway:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(109,109,109,1.0)")',
      ],
      // 170 transport-lightrail:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(106,106,106,1.0)")',
      ],
      // 171 transport-lightrail-service:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(106,106,106,1.0)")',
      ],
      // 172 transport-rail:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(106,106,106,1.0)")',
      ],
      // 173 transport-rail-service:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(106,106,106,1.0)")',
      ],
      // 174 transport-monorail:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "monorail")) && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(106,106,106,1.0)")',
      ],
      // 175 transport-funicular:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "funicular")) && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(106,106,106,1.0)")',
      ],
      // 176 transport-tram [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(106,106,106,1.0)")',
      ],
      // 177 transport-narrowgauge [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(106,106,106,1.0)")',
      ],
      // 178 transport-subway [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(82,82,82,1.0)")',
      ],
      // 179 transport-lightrail [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(79,79,79,1.0)")',
      ],
      // 180 transport-lightrail-service [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(79,79,79,1.0)")',
      ],
      // 181 transport-rail [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(79,79,79,1.0)")',
      ],
      // 182 transport-rail-service [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(79,79,79,1.0)")',
      ],
      // 183 transport-monorail [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "monorail")) && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(106,106,106,1.0)")',
      ],
      // 184 transport-funicular [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "funicular")) && (${bridge} !== true) && (${tunnel} !== true)))',
        'color("rgba(106,106,106,1.0)")',
      ],
      // 185 transport-ferry [line color]
      ['((${_layer} === "ferries") && true)', 'color("rgba(99,99,99,1.0)")'],
      // 186 bridge-way-footway:bridge [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "footway"))))', 'color("rgba(64,64,64,0.5)")'],
      // 187 bridge-way-steps:bridge [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "steps"))))', 'color("rgba(64,64,64,0.5)")'],
      // 188 bridge-way-path:bridge [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "path"))))', 'color("rgba(64,64,64,0.5)")'],
      // 189 bridge-way-cycleway:bridge [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "cycleway"))))', 'color("rgba(64,64,64,0.5)")'],
      // 190 bridge-street-track:bridge [line color]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bridge} === true)))', 'color("rgba(64,64,64,1.0)")'],
      // 191 bridge-street-pedestrian:bridge [line color]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bridge} === true)))', 'color("rgba(64,64,64,1.0)")'],
      // 192 bridge-street-service:bridge [line color]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bridge} === true)))', 'color("rgba(64,64,64,1.0)")'],
      // 193 bridge-street-livingstreet:bridge [line color]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bridge} === true)))', 'color("rgba(64,64,64,1.0)")'],
      // 194 bridge-street-residential:bridge [line color]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bridge} === true)))', 'color("rgba(64,64,64,1.0)")'],
      // 195 bridge-street-unclassified:bridge [line color]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bridge} === true)))', 'color("rgba(64,64,64,1.0)")'],
      // 196 bridge-street-busway:bridge [line color]
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${bridge} === true)))', 'color("rgba(64,64,64,0.5)")'],
      // 197 bridge-street-busguideway:bridge [line color]
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${bridge} === true)))', 'color("rgba(64,64,64,0.5)")'],
      // 198 bridge-street-tertiary-link:bridge [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} === true)))', 'color("rgba(64,64,64,1.0)")'],
      // 199 bridge-street-secondary-link:bridge [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} === true)))', 'color("rgba(64,64,64,0.5)")'],
      // 200 bridge-street-primary-link:bridge [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} === true)))', 'color("rgba(64,64,64,0.5)")'],
      // 201 bridge-street-trunk-link:bridge [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} === true)))', 'color("rgba(64,64,64,0.5)")'],
      // 202 bridge-street-motorway-link:bridge [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} === true)))', 'color("rgba(64,64,64,0.5)")'],
      // 203 bridge-street-tertiary:bridge [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} !== true)))', 'color("rgba(64,64,64,1.0)")'],
      // 204 bridge-street-secondary:bridge [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} !== true)))', 'color("rgba(64,64,64,1.0)")'],
      // 205 bridge-street-primary:bridge [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} !== true)))', 'color("rgba(64,64,64,0.5)")'],
      // 206 bridge-street-trunk:bridge [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} !== true)))', 'color("rgba(64,64,64,0.5)")'],
      // 207 bridge-street-motorway:bridge [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} !== true)))', 'color("rgba(64,64,64,0.5)")'],
      // 208 bridge-street-pedestrian-zone [fill color]
      ['((${_layer} === "street_polygons") && ((${bridge} === true) && (${kind} === "pedestrian")))', 'color("rgba(51,51,51,1.0)")'],
      // 209 bridge-way-footway:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "footway"))))', 'color("rgba(79,79,79,1.0)")'],
      // 210 bridge-way-steps:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "steps"))))', 'color("rgba(79,79,79,1.0)")'],
      // 211 bridge-way-path:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "path"))))', 'color("rgba(79,79,79,1.0)")'],
      // 212 bridge-way-cycleway:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "cycleway"))))', 'color("rgba(77,77,77,1.0)")'],
      // 213 bridge-street-track:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bridge} === true)))', 'color("rgba(82,82,82,1.0)")'],
      // 214 bridge-street-pedestrian:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bridge} === true)))', 'color("rgba(82,82,82,1.0)")'],
      // 215 bridge-street-service:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bridge} === true)))', 'color("rgba(64,64,64,1.0)")'],
      // 216 bridge-street-livingstreet:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bridge} === true)))', 'color("rgba(82,82,82,1.0)")'],
      // 217 bridge-street-residential:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bridge} === true)))', 'color("rgba(82,82,82,1.0)")'],
      // 218 bridge-street-unclassified:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bridge} === true)))', 'color("rgba(82,82,82,1.0)")'],
      // 219 bridge-street-busway:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${bridge} === true)))', 'color("rgba(64,64,64,1.0)")'],
      // 220 bridge-street-busguideway:outline [line color]
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${bridge} === true)))', 'color("rgba(64,64,64,1.0)")'],
      // 221 bridge-street-tertiary-link:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} === true)))', 'color("rgba(82,82,82,1.0)")'],
      // 222 bridge-street-secondary-link:outline [line color]
      [
        '((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} === true)))',
        'color("rgba(114,114,114,1.0)")',
      ],
      // 223 bridge-street-primary-link:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} === true)))', 'color("rgba(114,114,114,1.0)")'],
      // 224 bridge-street-trunk-link:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} === true)))', 'color("rgba(114,114,114,1.0)")'],
      // 225 bridge-street-motorway-link:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} === true)))', 'color("rgba(114,114,114,1.0)")'],
      // 226 bridge-street-tertiary:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} !== true)))', 'color("rgba(82,82,82,1.0)")'],
      // 227 bridge-street-secondary:outline [line color]
      [
        '((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} !== true)))',
        'color("rgba(114,114,114,1.0)")',
      ],
      // 228 bridge-street-primary:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} !== true)))', 'color("rgba(114,114,114,1.0)")'],
      // 229 bridge-street-trunk:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} !== true)))', 'color("rgba(114,114,114,1.0)")'],
      // 230 bridge-street-motorway:outline [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} !== true)))', 'color("rgba(114,114,114,1.0)")'],
      // 231 bridge-way-footway [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "footway"))))', 'color("rgba(58,58,58,1.0)")'],
      // 232 bridge-way-steps [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "steps"))))', 'color("rgba(58,58,58,1.0)")'],
      // 233 bridge-way-path [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "path"))))', 'color("rgba(58,58,58,1.0)")'],
      // 234 bridge-way-cycleway [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "cycleway"))))', 'color("rgba(57,57,57,1.0)")'],
      // 235 bridge-street-track [line color]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bridge} === true)))', 'color("rgba(51,51,51,1.0)")'],
      // 236 bridge-street-pedestrian [line color]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bridge} === true)))', 'color("rgba(51,51,51,1.0)")'],
      // 237 bridge-street-service [line color]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bridge} === true)))', 'color("rgba(57,57,57,1.0)")'],
      // 238 bridge-street-livingstreet [line color]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bridge} === true)))', 'color("rgba(51,51,51,1.0)")'],
      // 239 bridge-street-residential [line color]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bridge} === true)))', 'color("rgba(51,51,51,1.0)")'],
      // 240 bridge-street-unclassified [line color]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bridge} === true)))', 'color("rgba(51,51,51,1.0)")'],
      // 241 bridge-street-busway [line color]
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${bridge} === true)))', 'color("rgba(57,57,57,1.0)")'],
      // 242 bridge-street-busguideway [line color]
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${bridge} === true)))', 'color("rgba(57,57,57,1.0)")'],
      // 243 bridge-street-track-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "track") && (${bicycle} === "designated") && (${bridge} === true)))',
        'color("rgba(51,51,51,1.0)")',
      ],
      // 244 bridge-street-pedestrian-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bicycle} === "designated") && (${bridge} === true)))',
        'color("rgba(57,57,57,1.0)")',
      ],
      // 245 bridge-street-service-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "service") && (${bicycle} === "designated") && (${bridge} === true)))',
        'color("rgba(51,51,51,1.0)")',
      ],
      // 246 bridge-street-livingstreet-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "living_street") && (${bicycle} === "designated") && (${bridge} === true)))',
        'color("rgba(57,57,57,1.0)")',
      ],
      // 247 bridge-street-residential-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "residential") && (${bicycle} === "designated") && (${bridge} === true)))',
        'color("rgba(57,57,57,1.0)")',
      ],
      // 248 bridge-street-unclassified-bicycle [line color]
      [
        '((${_layer} === "streets") && ((${kind} === "unclassified") && (${bicycle} === "designated") && (${bridge} === true)))',
        'color("rgba(57,57,57,1.0)")',
      ],
      // 249 bridge-street-tertiary-link [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} === true)))', 'color("rgba(51,51,51,1.0)")'],
      // 250 bridge-street-secondary-link [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} === true)))', 'color("rgba(85,85,85,1.0)")'],
      // 251 bridge-street-primary-link [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} === true)))', 'color("rgba(85,85,85,1.0)")'],
      // 252 bridge-street-trunk-link [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} === true)))', 'color("rgba(85,85,85,1.0)")'],
      // 253 bridge-street-motorway-link [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} === true)))', 'color("rgba(99,99,99,1.0)")'],
      // 254 bridge-street-tertiary [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} !== true)))', 'color("rgba(51,51,51,1.0)")'],
      // 255 bridge-street-secondary [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} !== true)))', 'color("rgba(85,85,85,1.0)")'],
      // 256 bridge-street-primary [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} !== true)))', 'color("rgba(85,85,85,1.0)")'],
      // 257 bridge-street-trunk [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} !== true)))', 'color("rgba(85,85,85,1.0)")'],
      // 258 bridge-street-motorway [line color]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} !== true)))', 'color("rgba(99,99,99,1.0)")'],
      // 259 bridge-transport-tram:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${bridge} === true)))',
        'color("rgba(106,106,106,1.0)")',
      ],
      // 260 bridge-transport-narrowgauge:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${bridge} === true)))',
        'color("rgba(106,106,106,1.0)")',
      ],
      // 261 bridge-transport-subway:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${bridge} === true)))',
        'color("rgba(109,109,109,1.0)")',
      ],
      // 262 bridge-transport-lightrail:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${bridge} === true)))',
        'color("rgba(106,106,106,1.0)")',
      ],
      // 263 bridge-transport-lightrail-service:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${bridge} === true)))',
        'color("rgba(106,106,106,1.0)")',
      ],
      // 264 bridge-transport-rail:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${bridge} === true)))',
        'color("rgba(106,106,106,1.0)")',
      ],
      // 265 bridge-transport-rail-service:outline [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${bridge} === true)))',
        'color("rgba(106,106,106,1.0)")',
      ],
      // 266 bridge-transport-monorail:outline [line color]
      ['((${_layer} === "streets") && (((${kind} === "monorail")) && (${bridge} === true)))', 'color("rgba(106,106,106,1.0)")'],
      // 267 bridge-transport-funicular:outline [line color]
      ['((${_layer} === "streets") && (((${kind} === "funicular")) && (${bridge} === true)))', 'color("rgba(106,106,106,1.0)")'],
      // 268 bridge-transport-tram [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${bridge} === true)))',
        'color("rgba(106,106,106,1.0)")',
      ],
      // 269 bridge-transport-narrowgauge [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${bridge} === true)))',
        'color("rgba(106,106,106,1.0)")',
      ],
      // 270 bridge-transport-subway [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${bridge} === true)))',
        'color("rgba(82,82,82,1.0)")',
      ],
      // 271 bridge-transport-lightrail [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${bridge} === true)))',
        'color("rgba(79,79,79,1.0)")',
      ],
      // 272 bridge-transport-lightrail-service [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${bridge} === true)))',
        'color("rgba(79,79,79,1.0)")',
      ],
      // 273 bridge-transport-rail [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${bridge} === true)))',
        'color("rgba(79,79,79,1.0)")',
      ],
      // 274 bridge-transport-rail-service [line color]
      [
        '((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${bridge} === true)))',
        'color("rgba(79,79,79,1.0)")',
      ],
      // 275 bridge-transport-monorail [line color]
      ['((${_layer} === "streets") && (((${kind} === "monorail")) && (${bridge} === true)))', 'color("rgba(106,106,106,1.0)")'],
      // 276 bridge-transport-funicular [line color]
      ['((${_layer} === "streets") && (((${kind} === "funicular")) && (${bridge} === true)))', 'color("rgba(106,106,106,1.0)")'],
      // 277 poi-amenity [point/icon color]
      ['((${_layer} === "pois") && (${amenity} !== undefined))', 'color("rgba(187,187,187,1)")'],
      // 278 poi-leisure [point/icon color]
      ['((${_layer} === "pois") && (${leisure} !== undefined))', 'color("rgba(187,187,187,1)")'],
      // 279 poi-tourism [point/icon color]
      ['((${_layer} === "pois") && (${tourism} !== undefined))', 'color("rgba(187,187,187,1)")'],
      // 280 poi-shop [point/icon color]
      ['((${_layer} === "pois") && (${shop} !== undefined))', 'color("rgba(187,187,187,1)")'],
      // 281 poi-man_made [point/icon color]
      ['((${_layer} === "pois") && (${man_made} !== undefined))', 'color("rgba(187,187,187,1)")'],
      // 282 poi-historic [point/icon color]
      ['((${_layer} === "pois") && (${historic} !== undefined))', 'color("rgba(187,187,187,1)")'],
      // 283 poi-emergency [point/icon color]
      ['((${_layer} === "pois") && (${emergency} !== undefined))', 'color("rgba(187,187,187,1)")'],
      // 284 poi-highway [point/icon color]
      ['((${_layer} === "pois") && (${highway} !== undefined))', 'color("rgba(187,187,187,1)")'],
      // 285 poi-office [point/icon color]
      ['((${_layer} === "pois") && (${office} !== undefined))', 'color("rgba(187,187,187,1)")'],
      // 286 boundary-country:outline [line color]
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 2) && (${maritime} !== true) && (${disputed} !== true) && (${coastline} !== true)))',
        'color("rgba(57,57,57,0.75)")',
      ],
      // 287 boundary-country-disputed:outline [line color]
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 2) && (${disputed} === true) && (${maritime} !== true) && (${coastline} !== true)))',
        'color("rgba(57,57,57,0.75)")',
      ],
      // 288 boundary-state:outline [line color]
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 4) && (${maritime} !== true) && (${disputed} !== true) && (${coastline} !== true)))',
        'color("rgba(54,54,54,0.75)")',
      ],
      // 289 boundary-country [line color]
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 2) && (${maritime} !== true) && (${disputed} !== true) && (${coastline} !== true)))',
        'color("rgba(109,109,109,1.0)")',
      ],
      // 290 boundary-country-disputed [line color]
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 2) && (${disputed} === true) && (${maritime} !== true) && (${coastline} !== true)))',
        'color("rgba(97,97,97,1.0)")',
      ],
      // 291 boundary-state [line color]
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 4) && (${maritime} !== true) && (${disputed} !== true) && (${coastline} !== true)))',
        'color("rgba(109,109,109,1.0)")',
      ],
      // 292 label-address-housenumber [point/icon color]
      ['((${_layer} === "addresses") && (${housenumber} !== undefined))', 'color("rgba(106,106,106,1)")'],
      // 293 label-motorway-shield [point/icon color]
      ['((${_layer} === "street_labels") && (${kind} === "motorway"))', 'color("rgba(51,51,51,1)")'],
      // 294 label-street-pedestrian [point/icon color]
      ['((${_layer} === "street_labels") && (${kind} === "pedestrian"))', 'color("rgba(207,207,207,1)")'],
      // 295 label-street-livingstreet [point/icon color]
      ['((${_layer} === "street_labels") && (${kind} === "living_street"))', 'color("rgba(207,207,207,1)")'],
      // 296 label-street-residential [point/icon color]
      ['((${_layer} === "street_labels") && (${kind} === "residential"))', 'color("rgba(207,207,207,1)")'],
      // 297 label-street-unclassified [point/icon color]
      ['((${_layer} === "street_labels") && (${kind} === "unclassified"))', 'color("rgba(207,207,207,1)")'],
      // 298 label-street-tertiary [point/icon color]
      ['((${_layer} === "street_labels") && (${kind} === "tertiary"))', 'color("rgba(207,207,207,1)")'],
      // 299 label-street-secondary [point/icon color]
      ['((${_layer} === "street_labels") && (${kind} === "secondary"))', 'color("rgba(207,207,207,1)")'],
      // 300 label-street-primary [point/icon color]
      ['((${_layer} === "street_labels") && (${kind} === "primary"))', 'color("rgba(207,207,207,1)")'],
      // 301 label-street-trunk [point/icon color]
      ['((${_layer} === "street_labels") && (${kind} === "trunk"))', 'color("rgba(207,207,207,1)")'],
      // 302 label-street-track [point/icon color]
      ['((${_layer} === "street_labels") && (${kind} === "track"))', 'color("rgba(207,207,207,1)")'],
      // 303 label-place-neighbourhood [point/icon color]
      ['((${_layer} === "place_labels") && (${kind} === "neighbourhood"))', 'color("rgba(210,210,210,1)")'],
      // 304 label-place-quarter [point/icon color]
      ['((${_layer} === "place_labels") && (${kind} === "quarter"))', 'color("rgba(210,210,210,1)")'],
      // 305 label-place-suburb [point/icon color]
      ['((${_layer} === "place_labels") && (${kind} === "suburb"))', 'color("rgba(210,210,210,1)")'],
      // 306 label-place-hamlet [point/icon color]
      ['((${_layer} === "place_labels") && (${kind} === "hamlet"))', 'color("rgba(210,210,210,1)")'],
      // 307 label-place-village [point/icon color]
      ['((${_layer} === "place_labels") && (${kind} === "village"))', 'color("rgba(210,210,210,1)")'],
      // 308 label-place-town [point/icon color]
      ['((${_layer} === "place_labels") && (${kind} === "town"))', 'color("rgba(210,210,210,1)")'],
      // 309 label-boundary-state [point/icon color]
      ['((${_layer} === "boundary_labels") && ((${admin_level} === 4) || (${admin_level} === "4")))', 'color("rgba(197,197,197,1)")'],
      // 310 label-place-city [point/icon color]
      ['((${_layer} === "place_labels") && (${kind} === "city"))', 'color("rgba(210,210,210,1)")'],
      // 311 label-place-statecapital [point/icon color]
      ['((${_layer} === "place_labels") && (${kind} === "state_capital"))', 'color("rgba(210,210,210,1)")'],
      // 312 label-place-capital [point/icon color]
      ['((${_layer} === "place_labels") && (${kind} === "capital"))', 'color("rgba(210,210,210,1)")'],
      // 313 label-boundary-country-small [point/icon color]
      [
        '((${_layer} === "boundary_labels") && (((${admin_level} === 2) || (${admin_level} === "2")) && (${way_area} <= 10000000)))',
        'color("rgba(207,207,207,1)")',
      ],
      // 314 label-boundary-country-medium [point/icon color]
      [
        '((${_layer} === "boundary_labels") && (((${admin_level} === 2) || (${admin_level} === "2")) && (${way_area} < 90000000) && (${way_area} > 10000000)))',
        'color("rgba(207,207,207,1)")',
      ],
      // 315 label-boundary-country-large [point/icon color]
      [
        '((${_layer} === "boundary_labels") && (((${admin_level} === 2) || (${admin_level} === "2")) && (${way_area} >= 90000000)))',
        'color("rgba(207,207,207,1)")',
      ],
      // 318 symbol-transit-bus [point/icon color]
      ['((${_layer} === "public_transport") && (${kind} === "bus_stop"))', 'color("rgba(173,173,173,1)")'],
      // 319 symbol-transit-tram [point/icon color]
      ['((${_layer} === "public_transport") && (${kind} === "tram_stop"))', 'color("rgba(173,173,173,1)")'],
      // 320 symbol-transit-subway [point/icon color]
      [
        '((${_layer} === "public_transport") && (((${kind} === "station") || (${kind} === "halt")) && (${station} === "subway")))',
        'color("rgba(173,173,173,1)")',
      ],
      // 321 symbol-transit-lightrail [point/icon color]
      [
        '((${_layer} === "public_transport") && (((${kind} === "station") || (${kind} === "halt")) && (${station} === "light_rail")))',
        'color("rgba(173,173,173,1)")',
      ],
      // 322 symbol-transit-station [point/icon color]
      [
        '((${_layer} === "public_transport") && (((${kind} === "station") || (${kind} === "halt")) && (!((${station} === "light_rail") || (${station} === "subway")))))',
        'color("rgba(173,173,173,1)")',
      ],
      // 323 symbol-transit-airfield [point/icon color]
      ['((${_layer} === "public_transport") && ((${kind} === "aerodrome") && (${iata} === undefined)))', 'color("rgba(173,173,173,1)")'],
      // 324 symbol-transit-airport [point/icon color]
      ['((${_layer} === "public_transport") && ((${kind} === "aerodrome") && (${iata} !== undefined)))', 'color("rgba(173,173,173,1)")'],
      ['true', "color('white', 1.0)"],
    ],
  },
  lineWidth: {
    conditions: [
      // 019 water-river [line width]
      ['((${_layer} === "water_lines") && (((${kind} === "river")) && (${tunnel} !== true) && (${bridge} !== true)))', '2.0'],
      // 020 water-canal [line width]
      ['((${_layer} === "water_lines") && (((${kind} === "canal")) && (${tunnel} !== true) && (${bridge} !== true)))', '1.5'],
      // 021 water-stream [line width]
      ['((${_layer} === "water_lines") && (((${kind} === "stream")) && (${tunnel} !== true) && (${bridge} !== true)))', '1.0'],
      // 022 water-ditch [line width]
      ['((${_layer} === "water_lines") && (((${kind} === "ditch")) && (${tunnel} !== true) && (${bridge} !== true)))', '1.0'],
      // 040 airport-taxiway:outline [line width]
      ['((${_layer} === "streets") && (${kind} === "taxiway"))', '2.5'],
      // 041 airport-runway:outline [line width]
      ['((${_layer} === "streets") && (${kind} === "runway"))', '6.0'],
      // 042 airport-taxiway [line width]
      ['((${_layer} === "streets") && (${kind} === "taxiway"))', '1.5'],
      // 043 airport-runway [line width]
      ['((${_layer} === "streets") && (${kind} === "runway"))', '5.0'],
      // 047 tunnel-way-footway:outline [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "footway"))))', '2.0'],
      // 048 tunnel-way-steps:outline [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "steps"))))', '2.0'],
      // 049 tunnel-way-path:outline [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "path"))))', '2.0'],
      // 050 tunnel-way-cycleway:outline [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "cycleway"))))', '2.0'],
      // 051 tunnel-street-track:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${tunnel} === true)))', '2.5'],
      // 052 tunnel-street-pedestrian:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${tunnel} === true)))', '3.0'],
      // 053 tunnel-street-service:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${tunnel} === true)))', '2.2'],
      // 054 tunnel-street-livingstreet:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${tunnel} === true)))', '3.0'],
      // 055 tunnel-street-residential:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${tunnel} === true)))', '3.0'],
      // 056 tunnel-street-unclassified:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${tunnel} === true)))', '3.0'],
      // 057 tunnel-street-busway:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${tunnel} === true)))', '2.2'],
      // 058 tunnel-street-busguideway:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${tunnel} === true)))', '2.2'],
      // 059 tunnel-street-tertiary-link:outline [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "tertiary")) && (${link} === true)))', '3.0'],
      // 060 tunnel-street-secondary-link:outline [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "secondary")) && (${link} === true)))', '3.5'],
      // 061 tunnel-street-primary-link:outline [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "primary")) && (${link} === true)))', '4.0'],
      // 062 tunnel-street-trunk-link:outline [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "trunk")) && (${link} === true)))', '4.0'],
      // 063 tunnel-street-motorway-link:outline [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "motorway")) && (${link} === true)))', '4.5'],
      // 064 tunnel-street-tertiary:outline [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "tertiary")) && (${link} !== true)))', '3.0'],
      // 065 tunnel-street-secondary:outline [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "secondary")) && (${link} !== true)))', '3.5'],
      // 066 tunnel-street-primary:outline [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "primary")) && (${link} !== true)))', '4.0'],
      // 067 tunnel-street-trunk:outline [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "trunk")) && (${link} !== true)))', '4.0'],
      // 068 tunnel-street-motorway:outline [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "motorway")) && (${link} !== true)))', '4.5'],
      // 069 tunnel-way-footway [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "footway"))))', '1.0'],
      // 070 tunnel-way-steps [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "steps"))))', '1.0'],
      // 071 tunnel-way-path [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "path"))))', '1.0'],
      // 072 tunnel-way-cycleway [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "cycleway"))))', '1.0'],
      // 073 tunnel-street-track [line width]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${tunnel} === true)))', '1.5'],
      // 074 tunnel-street-pedestrian [line width]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${tunnel} === true)))', '2.0'],
      // 075 tunnel-street-service [line width]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${tunnel} === true)))', '1.2'],
      // 076 tunnel-street-livingstreet [line width]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${tunnel} === true)))', '2.0'],
      // 077 tunnel-street-residential [line width]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${tunnel} === true)))', '2.0'],
      // 078 tunnel-street-unclassified [line width]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${tunnel} === true)))', '2.0'],
      // 079 tunnel-street-busway [line width]
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${tunnel} === true)))', '1.2'],
      // 080 tunnel-street-busguideway [line width]
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${tunnel} === true)))', '1.2'],
      // 082 tunnel-street-pedestrian-bicycle [line width]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bicycle} === "designated") && (${tunnel} === true)))', '2.0'],
      // 084 tunnel-street-livingstreet-bicycle [line width]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bicycle} === "designated") && (${tunnel} === true)))', '2.0'],
      // 085 tunnel-street-residential-bicycle [line width]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bicycle} === "designated") && (${tunnel} === true)))', '2.0'],
      // 086 tunnel-street-unclassified-bicycle [line width]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bicycle} === "designated") && (${tunnel} === true)))', '2.0'],
      // 087 tunnel-street-tertiary-link [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "tertiary")) && (${link} === true)))', '2.0'],
      // 088 tunnel-street-secondary-link [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "secondary")) && (${link} === true)))', '2.5'],
      // 089 tunnel-street-primary-link [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "primary")) && (${link} === true)))', '3.0'],
      // 090 tunnel-street-trunk-link [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "trunk")) && (${link} === true)))', '3.0'],
      // 091 tunnel-street-motorway-link [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "motorway")) && (${link} === true)))', '3.5'],
      // 092 tunnel-street-tertiary [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "tertiary")) && (${link} !== true)))', '2.0'],
      // 093 tunnel-street-secondary [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "secondary")) && (${link} !== true)))', '2.5'],
      // 094 tunnel-street-primary [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "primary")) && (${link} !== true)))', '3.0'],
      // 095 tunnel-street-trunk [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "trunk")) && (${link} !== true)))', '3.0'],
      // 096 tunnel-street-motorway [line width]
      ['((${_layer} === "streets") && ((${tunnel} === true) && ((${kind} === "motorway")) && (${link} !== true)))', '3.5'],
      // 097 tunnel-transport-tram:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${tunnel} === true)))', '2.0'],
      // 098 tunnel-transport-narrowgauge:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${tunnel} === true)))', '2.0'],
      // 099 tunnel-transport-subway:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${tunnel} === true)))', '2.0'],
      // 100 tunnel-transport-lightrail:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${tunnel} === true)))', '2.0'],
      // 101 tunnel-transport-lightrail-service:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${tunnel} === true)))', '2.0'],
      // 102 tunnel-transport-rail:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${tunnel} === true)))', '2.0'],
      // 103 tunnel-transport-rail-service:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${tunnel} === true)))', '2.0'],
      // 104 tunnel-transport-monorail:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "monorail")) && (${tunnel} === true)))', '2.0'],
      // 105 tunnel-transport-funicular:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "funicular")) && (${tunnel} === true)))', '2.0'],
      // 106 tunnel-transport-tram [line width]
      ['((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${tunnel} === true)))', '1.0'],
      // 107 tunnel-transport-narrowgauge [line width]
      ['((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${tunnel} === true)))', '1.0'],
      // 108 tunnel-transport-subway [line width]
      ['((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${tunnel} === true)))', '1.0'],
      // 109 tunnel-transport-lightrail [line width]
      ['((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${tunnel} === true)))', '1.0'],
      // 110 tunnel-transport-lightrail-service [line width]
      ['((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${tunnel} === true)))', '1.0'],
      // 111 tunnel-transport-rail [line width]
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${tunnel} === true)))', '1.0'],
      // 112 tunnel-transport-rail-service [line width]
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${tunnel} === true)))', '1.0'],
      // 113 tunnel-transport-monorail [line width]
      ['((${_layer} === "streets") && (((${kind} === "monorail")) && (${tunnel} === true)))', '1.0'],
      // 114 tunnel-transport-funicular [line width]
      ['((${_layer} === "streets") && (((${kind} === "funicular")) && (${tunnel} === true)))', '1.0'],
      // 117 way-footway:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "footway"))))', '2.0'],
      // 118 way-steps:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "steps"))))', '2.0'],
      // 119 way-path:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "path"))))', '2.0'],
      // 120 way-cycleway:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "cycleway"))))', '2.0'],
      // 121 street-track:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bridge} !== true) && (${tunnel} !== true)))', '2.5'],
      // 122 street-pedestrian:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bridge} !== true) && (${tunnel} !== true)))', '3.0'],
      // 123 street-service:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bridge} !== true) && (${tunnel} !== true)))', '2.2'],
      // 124 street-livingstreet:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bridge} !== true) && (${tunnel} !== true)))', '3.0'],
      // 125 street-residential:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bridge} !== true) && (${tunnel} !== true)))', '3.0'],
      // 126 street-unclassified:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bridge} !== true) && (${tunnel} !== true)))', '3.0'],
      // 127 street-busway:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${bridge} !== true) && (${tunnel} !== true)))', '2.2'],
      // 128 street-busguideway:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${bridge} !== true) && (${tunnel} !== true)))', '2.2'],
      // 129 street-tertiary-link:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "tertiary")) && (${link} === true)))', '3.0'],
      // 130 street-secondary-link:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "secondary")) && (${link} === true)))', '3.5'],
      // 131 street-primary-link:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "primary")) && (${link} === true)))', '4.0'],
      // 132 street-trunk-link:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "trunk")) && (${link} === true)))', '4.0'],
      // 133 street-motorway-link:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "motorway")) && (${link} === true)))', '4.5'],
      // 134 street-tertiary:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "tertiary")) && (${link} !== true)))', '3.0'],
      // 135 street-secondary:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "secondary")) && (${link} !== true)))', '3.5'],
      // 136 street-primary:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "primary")) && (${link} !== true)))', '4.0'],
      // 137 street-trunk:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "trunk")) && (${link} !== true)))', '4.0'],
      // 138 street-motorway:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "motorway")) && (${link} !== true)))', '4.5'],
      // 139 way-footway [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "footway"))))', '1.0'],
      // 140 way-steps [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "steps"))))', '1.0'],
      // 141 way-path [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "path"))))', '1.0'],
      // 142 way-cycleway [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "cycleway"))))', '1.0'],
      // 143 street-track [line width]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bridge} !== true) && (${tunnel} !== true)))', '1.5'],
      // 144 street-pedestrian [line width]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bridge} !== true) && (${tunnel} !== true)))', '2.0'],
      // 145 street-service [line width]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bridge} !== true) && (${tunnel} !== true)))', '1.2'],
      // 146 street-livingstreet [line width]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bridge} !== true) && (${tunnel} !== true)))', '2.0'],
      // 147 street-residential [line width]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bridge} !== true) && (${tunnel} !== true)))', '2.0'],
      // 148 street-unclassified [line width]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bridge} !== true) && (${tunnel} !== true)))', '2.0'],
      // 149 street-busway [line width]
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${bridge} !== true) && (${tunnel} !== true)))', '1.2'],
      // 150 street-busguideway [line width]
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${bridge} !== true) && (${tunnel} !== true)))', '1.2'],
      // 152 street-pedestrian-bicycle [line width]
      [
        '((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bicycle} === "designated") && (${bridge} !== true) && (${tunnel} !== true)))',
        '2.0',
      ],
      // 154 street-livingstreet-bicycle [line width]
      [
        '((${_layer} === "streets") && ((${kind} === "living_street") && (${bicycle} === "designated") && (${bridge} !== true) && (${tunnel} !== true)))',
        '2.0',
      ],
      // 155 street-residential-bicycle [line width]
      [
        '((${_layer} === "streets") && ((${kind} === "residential") && (${bicycle} === "designated") && (${bridge} !== true) && (${tunnel} !== true)))',
        '2.0',
      ],
      // 156 street-unclassified-bicycle [line width]
      [
        '((${_layer} === "streets") && ((${kind} === "unclassified") && (${bicycle} === "designated") && (${bridge} !== true) && (${tunnel} !== true)))',
        '2.0',
      ],
      // 157 street-tertiary-link [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "tertiary")) && (${link} === true)))', '2.0'],
      // 158 street-secondary-link [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "secondary")) && (${link} === true)))', '2.5'],
      // 159 street-primary-link [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "primary")) && (${link} === true)))', '3.0'],
      // 160 street-trunk-link [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "trunk")) && (${link} === true)))', '3.0'],
      // 161 street-motorway-link [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "motorway")) && (${link} === true)))', '3.5'],
      // 162 street-tertiary [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "tertiary")) && (${link} !== true)))', '2.0'],
      // 163 street-secondary [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "secondary")) && (${link} !== true)))', '2.5'],
      // 164 street-primary [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "primary")) && (${link} !== true)))', '3.0'],
      // 165 street-trunk [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "trunk")) && (${link} !== true)))', '3.0'],
      // 166 street-motorway [line width]
      ['((${_layer} === "streets") && ((${bridge} !== true) && (${tunnel} !== true) && ((${kind} === "motorway")) && (${link} !== true)))', '3.5'],
      // 167 transport-tram:outline [line width]
      [
        '((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        '2.0',
      ],
      // 168 transport-narrowgauge:outline [line width]
      [
        '((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        '2.0',
      ],
      // 169 transport-subway:outline [line width]
      [
        '((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        '2.0',
      ],
      // 170 transport-lightrail:outline [line width]
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        '2.0',
      ],
      // 171 transport-lightrail-service:outline [line width]
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        '2.0',
      ],
      // 172 transport-rail:outline [line width]
      [
        '((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        '2.0',
      ],
      // 173 transport-rail-service:outline [line width]
      [
        '((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        '2.0',
      ],
      // 174 transport-monorail:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "monorail")) && (${bridge} !== true) && (${tunnel} !== true)))', '2.0'],
      // 175 transport-funicular:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "funicular")) && (${bridge} !== true) && (${tunnel} !== true)))', '2.0'],
      // 176 transport-tram [line width]
      [
        '((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        '1.0',
      ],
      // 177 transport-narrowgauge [line width]
      [
        '((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        '1.0',
      ],
      // 178 transport-subway [line width]
      [
        '((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        '1.0',
      ],
      // 179 transport-lightrail [line width]
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        '1.0',
      ],
      // 180 transport-lightrail-service [line width]
      [
        '((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        '1.0',
      ],
      // 181 transport-rail [line width]
      [
        '((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        '1.0',
      ],
      // 182 transport-rail-service [line width]
      [
        '((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${bridge} !== true) && (${tunnel} !== true)))',
        '1.0',
      ],
      // 183 transport-monorail [line width]
      ['((${_layer} === "streets") && (((${kind} === "monorail")) && (${bridge} !== true) && (${tunnel} !== true)))', '1.0'],
      // 184 transport-funicular [line width]
      ['((${_layer} === "streets") && (((${kind} === "funicular")) && (${bridge} !== true) && (${tunnel} !== true)))', '1.0'],
      // 185 transport-ferry [line width]
      ['((${_layer} === "ferries") && true)', '2.0'],
      // 186 bridge-way-footway:bridge [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "footway"))))', '1.0'],
      // 187 bridge-way-steps:bridge [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "steps"))))', '1.0'],
      // 188 bridge-way-path:bridge [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "path"))))', '1.0'],
      // 189 bridge-way-cycleway:bridge [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "cycleway"))))', '1.0'],
      // 190 bridge-street-track:bridge [line width]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bridge} === true)))', '1.5'],
      // 191 bridge-street-pedestrian:bridge [line width]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bridge} === true)))', '2.0'],
      // 192 bridge-street-service:bridge [line width]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bridge} === true)))', '1.2'],
      // 193 bridge-street-livingstreet:bridge [line width]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bridge} === true)))', '2.0'],
      // 194 bridge-street-residential:bridge [line width]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bridge} === true)))', '2.0'],
      // 195 bridge-street-unclassified:bridge [line width]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bridge} === true)))', '2.0'],
      // 198 bridge-street-tertiary-link:bridge [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} === true)))', '2.0'],
      // 199 bridge-street-secondary-link:bridge [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} === true)))', '2.5'],
      // 200 bridge-street-primary-link:bridge [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} === true)))', '3.0'],
      // 201 bridge-street-trunk-link:bridge [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} === true)))', '3.0'],
      // 202 bridge-street-motorway-link:bridge [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} === true)))', '3.5'],
      // 203 bridge-street-tertiary:bridge [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} !== true)))', '2.0'],
      // 204 bridge-street-secondary:bridge [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} !== true)))', '2.5'],
      // 205 bridge-street-primary:bridge [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} !== true)))', '3.0'],
      // 206 bridge-street-trunk:bridge [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} !== true)))', '3.0'],
      // 207 bridge-street-motorway:bridge [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} !== true)))', '3.5'],
      // 209 bridge-way-footway:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "footway"))))', '2.0'],
      // 210 bridge-way-steps:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "steps"))))', '2.0'],
      // 211 bridge-way-path:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "path"))))', '2.0'],
      // 212 bridge-way-cycleway:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "cycleway"))))', '2.0'],
      // 213 bridge-street-track:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bridge} === true)))', '2.5'],
      // 214 bridge-street-pedestrian:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bridge} === true)))', '3.0'],
      // 215 bridge-street-service:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bridge} === true)))', '2.2'],
      // 216 bridge-street-livingstreet:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bridge} === true)))', '3.0'],
      // 217 bridge-street-residential:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bridge} === true)))', '3.0'],
      // 218 bridge-street-unclassified:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bridge} === true)))', '3.0'],
      // 219 bridge-street-busway:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${bridge} === true)))', '2.2'],
      // 220 bridge-street-busguideway:outline [line width]
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${bridge} === true)))', '2.2'],
      // 221 bridge-street-tertiary-link:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} === true)))', '3.0'],
      // 222 bridge-street-secondary-link:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} === true)))', '3.5'],
      // 223 bridge-street-primary-link:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} === true)))', '4.0'],
      // 224 bridge-street-trunk-link:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} === true)))', '4.0'],
      // 225 bridge-street-motorway-link:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} === true)))', '4.5'],
      // 226 bridge-street-tertiary:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} !== true)))', '3.0'],
      // 227 bridge-street-secondary:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} !== true)))', '3.5'],
      // 228 bridge-street-primary:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} !== true)))', '4.0'],
      // 229 bridge-street-trunk:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} !== true)))', '4.0'],
      // 230 bridge-street-motorway:outline [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} !== true)))', '4.5'],
      // 231 bridge-way-footway [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "footway"))))', '1.0'],
      // 232 bridge-way-steps [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "steps"))))', '1.0'],
      // 233 bridge-way-path [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "path"))))', '1.0'],
      // 234 bridge-way-cycleway [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "cycleway"))))', '1.0'],
      // 235 bridge-street-track [line width]
      ['((${_layer} === "streets") && ((${kind} === "track") && (${bridge} === true)))', '1.5'],
      // 236 bridge-street-pedestrian [line width]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bridge} === true)))', '2.0'],
      // 237 bridge-street-service [line width]
      ['((${_layer} === "streets") && ((${kind} === "service") && (${bridge} === true)))', '1.2'],
      // 238 bridge-street-livingstreet [line width]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bridge} === true)))', '2.0'],
      // 239 bridge-street-residential [line width]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bridge} === true)))', '2.0'],
      // 240 bridge-street-unclassified [line width]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bridge} === true)))', '2.0'],
      // 241 bridge-street-busway [line width]
      ['((${_layer} === "streets") && ((${kind} === "busway") && (${bridge} === true)))', '1.2'],
      // 242 bridge-street-busguideway [line width]
      ['((${_layer} === "streets") && ((${kind} === "bus_guideway") && (${bridge} === true)))', '1.2'],
      // 244 bridge-street-pedestrian-bicycle [line width]
      ['((${_layer} === "streets") && ((${kind} === "pedestrian") && (${bicycle} === "designated") && (${bridge} === true)))', '2.0'],
      // 246 bridge-street-livingstreet-bicycle [line width]
      ['((${_layer} === "streets") && ((${kind} === "living_street") && (${bicycle} === "designated") && (${bridge} === true)))', '2.0'],
      // 247 bridge-street-residential-bicycle [line width]
      ['((${_layer} === "streets") && ((${kind} === "residential") && (${bicycle} === "designated") && (${bridge} === true)))', '2.0'],
      // 248 bridge-street-unclassified-bicycle [line width]
      ['((${_layer} === "streets") && ((${kind} === "unclassified") && (${bicycle} === "designated") && (${bridge} === true)))', '2.0'],
      // 249 bridge-street-tertiary-link [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} === true)))', '2.0'],
      // 250 bridge-street-secondary-link [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} === true)))', '2.5'],
      // 251 bridge-street-primary-link [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} === true)))', '3.0'],
      // 252 bridge-street-trunk-link [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} === true)))', '3.0'],
      // 253 bridge-street-motorway-link [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} === true)))', '3.5'],
      // 254 bridge-street-tertiary [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "tertiary")) && (${link} !== true)))', '2.0'],
      // 255 bridge-street-secondary [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "secondary")) && (${link} !== true)))', '2.5'],
      // 256 bridge-street-primary [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "primary")) && (${link} !== true)))', '3.0'],
      // 257 bridge-street-trunk [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "trunk")) && (${link} !== true)))', '3.0'],
      // 258 bridge-street-motorway [line width]
      ['((${_layer} === "streets") && ((${bridge} === true) && ((${kind} === "motorway")) && (${link} !== true)))', '3.5'],
      // 259 bridge-transport-tram:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${bridge} === true)))', '2.0'],
      // 260 bridge-transport-narrowgauge:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${bridge} === true)))', '2.0'],
      // 261 bridge-transport-subway:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${bridge} === true)))', '2.0'],
      // 262 bridge-transport-lightrail:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${bridge} === true)))', '2.0'],
      // 263 bridge-transport-lightrail-service:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${bridge} === true)))', '2.0'],
      // 264 bridge-transport-rail:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${bridge} === true)))', '2.0'],
      // 265 bridge-transport-rail-service:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${bridge} === true)))', '2.0'],
      // 266 bridge-transport-monorail:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "monorail")) && (${bridge} === true)))', '2.0'],
      // 267 bridge-transport-funicular:outline [line width]
      ['((${_layer} === "streets") && (((${kind} === "funicular")) && (${bridge} === true)))', '2.0'],
      // 268 bridge-transport-tram [line width]
      ['((${_layer} === "streets") && (((${kind} === "tram")) && (${service} === undefined) && (${bridge} === true)))', '1.0'],
      // 269 bridge-transport-narrowgauge [line width]
      ['((${_layer} === "streets") && (((${kind} === "narrow_gauge")) && (${service} === undefined) && (${bridge} === true)))', '1.0'],
      // 270 bridge-transport-subway [line width]
      ['((${_layer} === "streets") && (((${kind} === "subway")) && (${service} === undefined) && (${bridge} === true)))', '1.0'],
      // 271 bridge-transport-lightrail [line width]
      ['((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} === undefined) && (${bridge} === true)))', '1.0'],
      // 272 bridge-transport-lightrail-service [line width]
      ['((${_layer} === "streets") && (((${kind} === "light_rail")) && (${service} !== undefined) && (${bridge} === true)))', '1.0'],
      // 273 bridge-transport-rail [line width]
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} === undefined) && (${bridge} === true)))', '1.0'],
      // 274 bridge-transport-rail-service [line width]
      ['((${_layer} === "streets") && (((${kind} === "rail")) && (${service} !== undefined) && (${bridge} === true)))', '1.0'],
      // 275 bridge-transport-monorail [line width]
      ['((${_layer} === "streets") && (((${kind} === "monorail")) && (${bridge} === true)))', '1.0'],
      // 276 bridge-transport-funicular [line width]
      ['((${_layer} === "streets") && (((${kind} === "funicular")) && (${bridge} === true)))', '1.0'],
      // 286 boundary-country:outline [line width]
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 2) && (${maritime} !== true) && (${disputed} !== true) && (${coastline} !== true)))',
        '8.0',
      ],
      // 287 boundary-country-disputed:outline [line width]
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 2) && (${disputed} === true) && (${maritime} !== true) && (${coastline} !== true)))',
        '8.0',
      ],
      // 288 boundary-state:outline [line width]
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 4) && (${maritime} !== true) && (${disputed} !== true) && (${coastline} !== true)))',
        '4.0',
      ],
      // 289 boundary-country [line width]
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 2) && (${maritime} !== true) && (${disputed} !== true) && (${coastline} !== true)))',
        '4.0',
      ],
      // 290 boundary-country-disputed [line width]
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 2) && (${disputed} === true) && (${maritime} !== true) && (${coastline} !== true)))',
        '4.0',
      ],
      // 291 boundary-state [line width]
      [
        '((${_layer} === "boundaries") && ((${admin_level} === 4) && (${maritime} !== true) && (${disputed} !== true) && (${coastline} !== true)))',
        '2.0',
      ],
      ['true', '0.0'],
    ],
  },
  pointSize: {
    conditions: [
      // 277 poi-amenity [point size]
      ['((${_layer} === "pois") && (${amenity} !== undefined))', '1.0'],
      // 278 poi-leisure [point size]
      ['((${_layer} === "pois") && (${leisure} !== undefined))', '1.0'],
      // 279 poi-tourism [point size]
      ['((${_layer} === "pois") && (${tourism} !== undefined))', '1.0'],
      // 280 poi-shop [point size]
      ['((${_layer} === "pois") && (${shop} !== undefined))', '1.0'],
      // 281 poi-man_made [point size]
      ['((${_layer} === "pois") && (${man_made} !== undefined))', '1.0'],
      // 282 poi-historic [point size]
      ['((${_layer} === "pois") && (${historic} !== undefined))', '1.0'],
      // 283 poi-emergency [point size]
      ['((${_layer} === "pois") && (${emergency} !== undefined))', '1.0'],
      // 284 poi-highway [point size]
      ['((${_layer} === "pois") && (${highway} !== undefined))', '1.0'],
      // 285 poi-office [point size]
      ['((${_layer} === "pois") && (${office} !== undefined))', '1.0'],
      // 318 symbol-transit-bus [point size]
      ['((${_layer} === "public_transport") && (${kind} === "bus_stop"))', '1.0'],
      // 319 symbol-transit-tram [point size]
      ['((${_layer} === "public_transport") && (${kind} === "tram_stop"))', '1.0'],
      // 320 symbol-transit-subway [point size]
      ['((${_layer} === "public_transport") && (((${kind} === "station") || (${kind} === "halt")) && (${station} === "subway")))', '1.0'],
      // 321 symbol-transit-lightrail [point size]
      ['((${_layer} === "public_transport") && (((${kind} === "station") || (${kind} === "halt")) && (${station} === "light_rail")))', '1.0'],
      // 322 symbol-transit-station [point size]
      [
        '((${_layer} === "public_transport") && (((${kind} === "station") || (${kind} === "halt")) && (!((${station} === "light_rail") || (${station} === "subway")))))',
        '1.0',
      ],
      // 323 symbol-transit-airfield [point size]
      ['((${_layer} === "public_transport") && ((${kind} === "aerodrome") && (${iata} === undefined)))', '1.0'],
      // 324 symbol-transit-airport [point size]
      ['((${_layer} === "public_transport") && ((${kind} === "aerodrome") && (${iata} !== undefined)))', '1.0'],
    ],
  },
  labelText: {
    conditions: [
      // 292 label-address-housenumber [label text]
      ['((${_layer} === "addresses") && (${housenumber} !== undefined))', '"${housenumber}"'],
      // 293 label-motorway-shield [label text]
      ['((${_layer} === "street_labels") && (${kind} === "motorway"))', '"${ref}"'],
    ],
  },
  labelColor: {
    conditions: [
      // 277 poi-amenity [label color]
      ['((${_layer} === "pois") && (${amenity} !== undefined))', 'color("rgba(187,187,187,1)")'],
      // 278 poi-leisure [label color]
      ['((${_layer} === "pois") && (${leisure} !== undefined))', 'color("rgba(187,187,187,1)")'],
      // 279 poi-tourism [label color]
      ['((${_layer} === "pois") && (${tourism} !== undefined))', 'color("rgba(187,187,187,1)")'],
      // 280 poi-shop [label color]
      ['((${_layer} === "pois") && (${shop} !== undefined))', 'color("rgba(187,187,187,1)")'],
      // 281 poi-man_made [label color]
      ['((${_layer} === "pois") && (${man_made} !== undefined))', 'color("rgba(187,187,187,1)")'],
      // 282 poi-historic [label color]
      ['((${_layer} === "pois") && (${historic} !== undefined))', 'color("rgba(187,187,187,1)")'],
      // 283 poi-emergency [label color]
      ['((${_layer} === "pois") && (${emergency} !== undefined))', 'color("rgba(187,187,187,1)")'],
      // 284 poi-highway [label color]
      ['((${_layer} === "pois") && (${highway} !== undefined))', 'color("rgba(187,187,187,1)")'],
      // 285 poi-office [label color]
      ['((${_layer} === "pois") && (${office} !== undefined))', 'color("rgba(187,187,187,1)")'],
      // 292 label-address-housenumber [label color]
      ['((${_layer} === "addresses") && (${housenumber} !== undefined))', 'color("rgba(106,106,106,1)")'],
      // 293 label-motorway-shield [label color]
      ['((${_layer} === "street_labels") && (${kind} === "motorway"))', 'color("rgba(51,51,51,1)")'],
      // 294 label-street-pedestrian [label color]
      ['((${_layer} === "street_labels") && (${kind} === "pedestrian"))', 'color("rgba(207,207,207,1)")'],
      // 295 label-street-livingstreet [label color]
      ['((${_layer} === "street_labels") && (${kind} === "living_street"))', 'color("rgba(207,207,207,1)")'],
      // 296 label-street-residential [label color]
      ['((${_layer} === "street_labels") && (${kind} === "residential"))', 'color("rgba(207,207,207,1)")'],
      // 297 label-street-unclassified [label color]
      ['((${_layer} === "street_labels") && (${kind} === "unclassified"))', 'color("rgba(207,207,207,1)")'],
      // 298 label-street-tertiary [label color]
      ['((${_layer} === "street_labels") && (${kind} === "tertiary"))', 'color("rgba(207,207,207,1)")'],
      // 299 label-street-secondary [label color]
      ['((${_layer} === "street_labels") && (${kind} === "secondary"))', 'color("rgba(207,207,207,1)")'],
      // 300 label-street-primary [label color]
      ['((${_layer} === "street_labels") && (${kind} === "primary"))', 'color("rgba(207,207,207,1)")'],
      // 301 label-street-trunk [label color]
      ['((${_layer} === "street_labels") && (${kind} === "trunk"))', 'color("rgba(207,207,207,1)")'],
      // 302 label-street-track [label color]
      ['((${_layer} === "street_labels") && (${kind} === "track"))', 'color("rgba(207,207,207,1)")'],
      // 303 label-place-neighbourhood [label color]
      ['((${_layer} === "place_labels") && (${kind} === "neighbourhood"))', 'color("rgba(210,210,210,1)")'],
      // 304 label-place-quarter [label color]
      ['((${_layer} === "place_labels") && (${kind} === "quarter"))', 'color("rgba(210,210,210,1)")'],
      // 305 label-place-suburb [label color]
      ['((${_layer} === "place_labels") && (${kind} === "suburb"))', 'color("rgba(210,210,210,1)")'],
      // 306 label-place-hamlet [label color]
      ['((${_layer} === "place_labels") && (${kind} === "hamlet"))', 'color("rgba(210,210,210,1)")'],
      // 307 label-place-village [label color]
      ['((${_layer} === "place_labels") && (${kind} === "village"))', 'color("rgba(210,210,210,1)")'],
      // 308 label-place-town [label color]
      ['((${_layer} === "place_labels") && (${kind} === "town"))', 'color("rgba(210,210,210,1)")'],
      // 309 label-boundary-state [label color]
      ['((${_layer} === "boundary_labels") && ((${admin_level} === 4) || (${admin_level} === "4")))', 'color("rgba(197,197,197,1)")'],
      // 310 label-place-city [label color]
      ['((${_layer} === "place_labels") && (${kind} === "city"))', 'color("rgba(210,210,210,1)")'],
      // 311 label-place-statecapital [label color]
      ['((${_layer} === "place_labels") && (${kind} === "state_capital"))', 'color("rgba(210,210,210,1)")'],
      // 312 label-place-capital [label color]
      ['((${_layer} === "place_labels") && (${kind} === "capital"))', 'color("rgba(210,210,210,1)")'],
      // 313 label-boundary-country-small [label color]
      [
        '((${_layer} === "boundary_labels") && (((${admin_level} === 2) || (${admin_level} === "2")) && (${way_area} <= 10000000)))',
        'color("rgba(207,207,207,1)")',
      ],
      // 314 label-boundary-country-medium [label color]
      [
        '((${_layer} === "boundary_labels") && (((${admin_level} === 2) || (${admin_level} === "2")) && (${way_area} < 90000000) && (${way_area} > 10000000)))',
        'color("rgba(207,207,207,1)")',
      ],
      // 315 label-boundary-country-large [label color]
      [
        '((${_layer} === "boundary_labels") && (((${admin_level} === 2) || (${admin_level} === "2")) && (${way_area} >= 90000000)))',
        'color("rgba(207,207,207,1)")',
      ],
      // 318 symbol-transit-bus [label color]
      ['((${_layer} === "public_transport") && (${kind} === "bus_stop"))', 'color("rgba(173,173,173,1)")'],
      // 319 symbol-transit-tram [label color]
      ['((${_layer} === "public_transport") && (${kind} === "tram_stop"))', 'color("rgba(173,173,173,1)")'],
      // 320 symbol-transit-subway [label color]
      [
        '((${_layer} === "public_transport") && (((${kind} === "station") || (${kind} === "halt")) && (${station} === "subway")))',
        'color("rgba(173,173,173,1)")',
      ],
      // 321 symbol-transit-lightrail [label color]
      [
        '((${_layer} === "public_transport") && (((${kind} === "station") || (${kind} === "halt")) && (${station} === "light_rail")))',
        'color("rgba(173,173,173,1)")',
      ],
      // 322 symbol-transit-station [label color]
      [
        '((${_layer} === "public_transport") && (((${kind} === "station") || (${kind} === "halt")) && (!((${station} === "light_rail") || (${station} === "subway")))))',
        'color("rgba(173,173,173,1)")',
      ],
      // 323 symbol-transit-airfield [label color]
      ['((${_layer} === "public_transport") && ((${kind} === "aerodrome") && (${iata} === undefined)))', 'color("rgba(173,173,173,1)")'],
      // 324 symbol-transit-airport [label color]
      ['((${_layer} === "public_transport") && ((${kind} === "aerodrome") && (${iata} !== undefined)))', 'color("rgba(173,173,173,1)")'],
    ],
  },
  labelOutlineColor: {
    conditions: [
      // 292 label-address-housenumber [label outline color]
      ['((${_layer} === "addresses") && (${housenumber} !== undefined))', 'color("rgba(64,64,64,1)")'],
      // 293 label-motorway-shield [label outline color]
      ['((${_layer} === "street_labels") && (${kind} === "motorway"))', 'color("rgba(99,99,99,1)")'],
      // 294 label-street-pedestrian [label outline color]
      ['((${_layer} === "street_labels") && (${kind} === "pedestrian"))', 'color("rgba(51,51,51,0.8)")'],
      // 295 label-street-livingstreet [label outline color]
      ['((${_layer} === "street_labels") && (${kind} === "living_street"))', 'color("rgba(51,51,51,0.8)")'],
      // 296 label-street-residential [label outline color]
      ['((${_layer} === "street_labels") && (${kind} === "residential"))', 'color("rgba(51,51,51,0.8)")'],
      // 297 label-street-unclassified [label outline color]
      ['((${_layer} === "street_labels") && (${kind} === "unclassified"))', 'color("rgba(51,51,51,0.8)")'],
      // 298 label-street-tertiary [label outline color]
      ['((${_layer} === "street_labels") && (${kind} === "tertiary"))', 'color("rgba(51,51,51,0.8)")'],
      // 299 label-street-secondary [label outline color]
      ['((${_layer} === "street_labels") && (${kind} === "secondary"))', 'color("rgba(51,51,51,0.8)")'],
      // 300 label-street-primary [label outline color]
      ['((${_layer} === "street_labels") && (${kind} === "primary"))', 'color("rgba(51,51,51,0.8)")'],
      // 301 label-street-trunk [label outline color]
      ['((${_layer} === "street_labels") && (${kind} === "trunk"))', 'color("rgba(51,51,51,0.8)")'],
      // 302 label-street-track [label outline color]
      ['((${_layer} === "street_labels") && (${kind} === "track"))', 'color("rgba(51,51,51,0.8)")'],
      // 303 label-place-neighbourhood [label outline color]
      ['((${_layer} === "place_labels") && (${kind} === "neighbourhood"))', 'color("rgba(51,51,51,0.8)")'],
      // 304 label-place-quarter [label outline color]
      ['((${_layer} === "place_labels") && (${kind} === "quarter"))', 'color("rgba(51,51,51,0.8)")'],
      // 305 label-place-suburb [label outline color]
      ['((${_layer} === "place_labels") && (${kind} === "suburb"))', 'color("rgba(51,51,51,0.8)")'],
      // 306 label-place-hamlet [label outline color]
      ['((${_layer} === "place_labels") && (${kind} === "hamlet"))', 'color("rgba(51,51,51,0.8)")'],
      // 307 label-place-village [label outline color]
      ['((${_layer} === "place_labels") && (${kind} === "village"))', 'color("rgba(51,51,51,0.8)")'],
      // 308 label-place-town [label outline color]
      ['((${_layer} === "place_labels") && (${kind} === "town"))', 'color("rgba(51,51,51,0.8)")'],
      // 309 label-boundary-state [label outline color]
      ['((${_layer} === "boundary_labels") && ((${admin_level} === 4) || (${admin_level} === "4")))', 'color("rgba(51,51,51,0.8)")'],
      // 310 label-place-city [label outline color]
      ['((${_layer} === "place_labels") && (${kind} === "city"))', 'color("rgba(51,51,51,0.8)")'],
      // 311 label-place-statecapital [label outline color]
      ['((${_layer} === "place_labels") && (${kind} === "state_capital"))', 'color("rgba(51,51,51,0.8)")'],
      // 312 label-place-capital [label outline color]
      ['((${_layer} === "place_labels") && (${kind} === "capital"))', 'color("rgba(51,51,51,0.8)")'],
      // 313 label-boundary-country-small [label outline color]
      [
        '((${_layer} === "boundary_labels") && (((${admin_level} === 2) || (${admin_level} === "2")) && (${way_area} <= 10000000)))',
        'color("rgba(51,51,51,0.8)")',
      ],
      // 314 label-boundary-country-medium [label outline color]
      [
        '((${_layer} === "boundary_labels") && (((${admin_level} === 2) || (${admin_level} === "2")) && (${way_area} < 90000000) && (${way_area} > 10000000)))',
        'color("rgba(51,51,51,0.8)")',
      ],
      // 315 label-boundary-country-large [label outline color]
      [
        '((${_layer} === "boundary_labels") && (((${admin_level} === 2) || (${admin_level} === "2")) && (${way_area} >= 90000000)))',
        'color("rgba(51,51,51,0.8)")',
      ],
      // 318 symbol-transit-bus [label outline color]
      ['((${_layer} === "public_transport") && (${kind} === "bus_stop"))', 'color("rgba(51,51,51,0.8)")'],
      // 319 symbol-transit-tram [label outline color]
      ['((${_layer} === "public_transport") && (${kind} === "tram_stop"))', 'color("rgba(51,51,51,0.8)")'],
      // 320 symbol-transit-subway [label outline color]
      [
        '((${_layer} === "public_transport") && (((${kind} === "station") || (${kind} === "halt")) && (${station} === "subway")))',
        'color("rgba(51,51,51,0.8)")',
      ],
      // 321 symbol-transit-lightrail [label outline color]
      [
        '((${_layer} === "public_transport") && (((${kind} === "station") || (${kind} === "halt")) && (${station} === "light_rail")))',
        'color("rgba(51,51,51,0.8)")',
      ],
      // 322 symbol-transit-station [label outline color]
      [
        '((${_layer} === "public_transport") && (((${kind} === "station") || (${kind} === "halt")) && (!((${station} === "light_rail") || (${station} === "subway")))))',
        'color("rgba(51,51,51,0.8)")',
      ],
      // 323 symbol-transit-airfield [label outline color]
      ['((${_layer} === "public_transport") && ((${kind} === "aerodrome") && (${iata} === undefined)))', 'color("rgba(51,51,51,0.8)")'],
      // 324 symbol-transit-airport [label outline color]
      ['((${_layer} === "public_transport") && ((${kind} === "aerodrome") && (${iata} !== undefined)))', 'color("rgba(51,51,51,0.8)")'],
    ],
  },
  labelOutlineWidth: {
    conditions: [
      // 292 label-address-housenumber [label outline width]
      ['((${_layer} === "addresses") && (${housenumber} !== undefined))', '2.0'],
      // 293 label-motorway-shield [label outline width]
      ['((${_layer} === "street_labels") && (${kind} === "motorway"))', '0.1'],
      // 294 label-street-pedestrian [label outline width]
      ['((${_layer} === "street_labels") && (${kind} === "pedestrian"))', '2.0'],
      // 295 label-street-livingstreet [label outline width]
      ['((${_layer} === "street_labels") && (${kind} === "living_street"))', '2.0'],
      // 296 label-street-residential [label outline width]
      ['((${_layer} === "street_labels") && (${kind} === "residential"))', '2.0'],
      // 297 label-street-unclassified [label outline width]
      ['((${_layer} === "street_labels") && (${kind} === "unclassified"))', '2.0'],
      // 298 label-street-tertiary [label outline width]
      ['((${_layer} === "street_labels") && (${kind} === "tertiary"))', '2.0'],
      // 299 label-street-secondary [label outline width]
      ['((${_layer} === "street_labels") && (${kind} === "secondary"))', '2.0'],
      // 300 label-street-primary [label outline width]
      ['((${_layer} === "street_labels") && (${kind} === "primary"))', '2.0'],
      // 301 label-street-trunk [label outline width]
      ['((${_layer} === "street_labels") && (${kind} === "trunk"))', '2.0'],
      // 302 label-street-track [label outline width]
      ['((${_layer} === "street_labels") && (${kind} === "track"))', '2.0'],
      // 303 label-place-neighbourhood [label outline width]
      ['((${_layer} === "place_labels") && (${kind} === "neighbourhood"))', '2.0'],
      // 304 label-place-quarter [label outline width]
      ['((${_layer} === "place_labels") && (${kind} === "quarter"))', '2.0'],
      // 305 label-place-suburb [label outline width]
      ['((${_layer} === "place_labels") && (${kind} === "suburb"))', '2.0'],
      // 306 label-place-hamlet [label outline width]
      ['((${_layer} === "place_labels") && (${kind} === "hamlet"))', '2.0'],
      // 307 label-place-village [label outline width]
      ['((${_layer} === "place_labels") && (${kind} === "village"))', '2.0'],
      // 308 label-place-town [label outline width]
      ['((${_layer} === "place_labels") && (${kind} === "town"))', '2.0'],
      // 309 label-boundary-state [label outline width]
      ['((${_layer} === "boundary_labels") && ((${admin_level} === 4) || (${admin_level} === "4")))', '2.0'],
      // 310 label-place-city [label outline width]
      ['((${_layer} === "place_labels") && (${kind} === "city"))', '2.0'],
      // 311 label-place-statecapital [label outline width]
      ['((${_layer} === "place_labels") && (${kind} === "state_capital"))', '2.0'],
      // 312 label-place-capital [label outline width]
      ['((${_layer} === "place_labels") && (${kind} === "capital"))', '2.0'],
      // 313 label-boundary-country-small [label outline width]
      ['((${_layer} === "boundary_labels") && (((${admin_level} === 2) || (${admin_level} === "2")) && (${way_area} <= 10000000)))', '2.0'],
      // 314 label-boundary-country-medium [label outline width]
      [
        '((${_layer} === "boundary_labels") && (((${admin_level} === 2) || (${admin_level} === "2")) && (${way_area} < 90000000) && (${way_area} > 10000000)))',
        '2.0',
      ],
      // 315 label-boundary-country-large [label outline width]
      ['((${_layer} === "boundary_labels") && (((${admin_level} === 2) || (${admin_level} === "2")) && (${way_area} >= 90000000)))', '2.0'],
      // 318 symbol-transit-bus [label outline width]
      ['((${_layer} === "public_transport") && (${kind} === "bus_stop"))', '2.0'],
      // 319 symbol-transit-tram [label outline width]
      ['((${_layer} === "public_transport") && (${kind} === "tram_stop"))', '2.0'],
      // 320 symbol-transit-subway [label outline width]
      ['((${_layer} === "public_transport") && (((${kind} === "station") || (${kind} === "halt")) && (${station} === "subway")))', '2.0'],
      // 321 symbol-transit-lightrail [label outline width]
      ['((${_layer} === "public_transport") && (((${kind} === "station") || (${kind} === "halt")) && (${station} === "light_rail")))', '2.0'],
      // 322 symbol-transit-station [label outline width]
      [
        '((${_layer} === "public_transport") && (((${kind} === "station") || (${kind} === "halt")) && (!((${station} === "light_rail") || (${station} === "subway")))))',
        '2.0',
      ],
      // 323 symbol-transit-airfield [label outline width]
      ['((${_layer} === "public_transport") && ((${kind} === "aerodrome") && (${iata} === undefined)))', '2.0'],
      // 324 symbol-transit-airport [label outline width]
      ['((${_layer} === "public_transport") && ((${kind} === "aerodrome") && (${iata} !== undefined)))', '2.0'],
    ],
  },
  font: {
    conditions: [
      // 277 poi-amenity [font]
      ['((${_layer} === "pois") && (${amenity} !== undefined))', '"noto_sans_regular"'],
      // 278 poi-leisure [font]
      ['((${_layer} === "pois") && (${leisure} !== undefined))', '"noto_sans_regular"'],
      // 279 poi-tourism [font]
      ['((${_layer} === "pois") && (${tourism} !== undefined))', '"noto_sans_regular"'],
      // 280 poi-shop [font]
      ['((${_layer} === "pois") && (${shop} !== undefined))', '"noto_sans_regular"'],
      // 281 poi-man_made [font]
      ['((${_layer} === "pois") && (${man_made} !== undefined))', '"noto_sans_regular"'],
      // 282 poi-historic [font]
      ['((${_layer} === "pois") && (${historic} !== undefined))', '"noto_sans_regular"'],
      // 283 poi-emergency [font]
      ['((${_layer} === "pois") && (${emergency} !== undefined))', '"noto_sans_regular"'],
      // 284 poi-highway [font]
      ['((${_layer} === "pois") && (${highway} !== undefined))', '"noto_sans_regular"'],
      // 285 poi-office [font]
      ['((${_layer} === "pois") && (${office} !== undefined))', '"noto_sans_regular"'],
      // 292 label-address-housenumber [font]
      ['((${_layer} === "addresses") && (${housenumber} !== undefined))', '"noto_sans_regular"'],
      // 293 label-motorway-shield [font]
      ['((${_layer} === "street_labels") && (${kind} === "motorway"))', '"noto_sans_bold"'],
      // 294 label-street-pedestrian [font]
      ['((${_layer} === "street_labels") && (${kind} === "pedestrian"))', '"noto_sans_regular"'],
      // 295 label-street-livingstreet [font]
      ['((${_layer} === "street_labels") && (${kind} === "living_street"))', '"noto_sans_regular"'],
      // 296 label-street-residential [font]
      ['((${_layer} === "street_labels") && (${kind} === "residential"))', '"noto_sans_regular"'],
      // 297 label-street-unclassified [font]
      ['((${_layer} === "street_labels") && (${kind} === "unclassified"))', '"noto_sans_regular"'],
      // 298 label-street-tertiary [font]
      ['((${_layer} === "street_labels") && (${kind} === "tertiary"))', '"noto_sans_regular"'],
      // 299 label-street-secondary [font]
      ['((${_layer} === "street_labels") && (${kind} === "secondary"))', '"noto_sans_regular"'],
      // 300 label-street-primary [font]
      ['((${_layer} === "street_labels") && (${kind} === "primary"))', '"noto_sans_regular"'],
      // 301 label-street-trunk [font]
      ['((${_layer} === "street_labels") && (${kind} === "trunk"))', '"noto_sans_regular"'],
      // 302 label-street-track [font]
      ['((${_layer} === "street_labels") && (${kind} === "track"))', '"noto_sans_regular"'],
      // 303 label-place-neighbourhood [font]
      ['((${_layer} === "place_labels") && (${kind} === "neighbourhood"))', '"noto_sans_regular"'],
      // 304 label-place-quarter [font]
      ['((${_layer} === "place_labels") && (${kind} === "quarter"))', '"noto_sans_regular"'],
      // 305 label-place-suburb [font]
      ['((${_layer} === "place_labels") && (${kind} === "suburb"))', '"noto_sans_regular"'],
      // 306 label-place-hamlet [font]
      ['((${_layer} === "place_labels") && (${kind} === "hamlet"))', '"noto_sans_regular"'],
      // 307 label-place-village [font]
      ['((${_layer} === "place_labels") && (${kind} === "village"))', '"noto_sans_regular"'],
      // 308 label-place-town [font]
      ['((${_layer} === "place_labels") && (${kind} === "town"))', '"noto_sans_regular"'],
      // 309 label-boundary-state [font]
      ['((${_layer} === "boundary_labels") && ((${admin_level} === 4) || (${admin_level} === "4")))', '"noto_sans_regular"'],
      // 310 label-place-city [font]
      ['((${_layer} === "place_labels") && (${kind} === "city"))', '"noto_sans_regular"'],
      // 311 label-place-statecapital [font]
      ['((${_layer} === "place_labels") && (${kind} === "state_capital"))', '"noto_sans_regular"'],
      // 312 label-place-capital [font]
      ['((${_layer} === "place_labels") && (${kind} === "capital"))', '"noto_sans_regular"'],
      // 313 label-boundary-country-small [font]
      [
        '((${_layer} === "boundary_labels") && (((${admin_level} === 2) || (${admin_level} === "2")) && (${way_area} <= 10000000)))',
        '"noto_sans_regular"',
      ],
      // 314 label-boundary-country-medium [font]
      [
        '((${_layer} === "boundary_labels") && (((${admin_level} === 2) || (${admin_level} === "2")) && (${way_area} < 90000000) && (${way_area} > 10000000)))',
        '"noto_sans_regular"',
      ],
      // 315 label-boundary-country-large [font]
      [
        '((${_layer} === "boundary_labels") && (((${admin_level} === 2) || (${admin_level} === "2")) && (${way_area} >= 90000000)))',
        '"noto_sans_regular"',
      ],
      // 316 marking-oneway [font]
      [
        '((${_layer} === "streets") && ((${oneway} === true) && ((${kind} === "trunk") || (${kind} === "primary") || (${kind} === "secondary") || (${kind} === "tertiary") || (${kind} === "unclassified") || (${kind} === "residential") || (${kind} === "living_street"))))',
        '"noto_sans_regular"',
      ],
      // 317 marking-oneway-reverse [font]
      [
        '((${_layer} === "streets") && ((${oneway_reverse} === true) && ((${kind} === "trunk") || (${kind} === "primary") || (${kind} === "secondary") || (${kind} === "tertiary") || (${kind} === "unclassified") || (${kind} === "residential") || (${kind} === "living_street"))))',
        '"noto_sans_regular"',
      ],
      // 318 symbol-transit-bus [font]
      ['((${_layer} === "public_transport") && (${kind} === "bus_stop"))', '"noto_sans_regular"'],
      // 319 symbol-transit-tram [font]
      ['((${_layer} === "public_transport") && (${kind} === "tram_stop"))', '"noto_sans_regular"'],
      // 320 symbol-transit-subway [font]
      [
        '((${_layer} === "public_transport") && (((${kind} === "station") || (${kind} === "halt")) && (${station} === "subway")))',
        '"noto_sans_regular"',
      ],
      // 321 symbol-transit-lightrail [font]
      [
        '((${_layer} === "public_transport") && (((${kind} === "station") || (${kind} === "halt")) && (${station} === "light_rail")))',
        '"noto_sans_regular"',
      ],
      // 322 symbol-transit-station [font]
      [
        '((${_layer} === "public_transport") && (((${kind} === "station") || (${kind} === "halt")) && (!((${station} === "light_rail") || (${station} === "subway")))))',
        '"noto_sans_regular"',
      ],
      // 323 symbol-transit-airfield [font]
      ['((${_layer} === "public_transport") && ((${kind} === "aerodrome") && (${iata} === undefined)))', '"noto_sans_regular"'],
      // 324 symbol-transit-airport [font]
      ['((${_layer} === "public_transport") && ((${kind} === "aerodrome") && (${iata} !== undefined)))', '"noto_sans_regular"'],
    ],
  },
  // UNSUPPORTED / APPROXIMATED RULES (original rule order):
  // 001 background [background] source-layer=<none>
  //   - UNSUPPORTED background layer: Cesium3DTileStyle applies to MVT features, not the scene background.
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
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 60.
  // 020 water-canal [line] source-layer=water_lines
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 50.
  // 021 water-stream [line] source-layer=water_lines
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 30.
  // 022 water-ditch [line] source-layer=water_lines
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 20.
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
  //   - UNSUPPORTED fill-pattern='basics:pattern-warning': no direct Cesium MVT Cesium3DTileStyle equivalent.
  //   - UNSUPPORTED fill-outline-color='rgb(153,153,153)': no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 035 site-prison [fill] source-layer=sites
  //   - UNSUPPORTED fill-pattern='basics:pattern-striped': no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 038 site-construction [fill] source-layer=sites
  //   - UNSUPPORTED fill-pattern='basics:pattern-hatched_thin': no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 040 airport-taxiway:outline [line] source-layer=streets
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 40.
  // 041 airport-runway:outline [line] source-layer=streets
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 300.
  // 042 airport-taxiway [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 14 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 36.
  // 043 airport-runway [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 298.
  // 044 building:outline [fill] source-layer=buildings
  //   - APPROXIMATION fill-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
  // 045 building [fill] source-layer=buildings
  //   - APPROXIMATION fill-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
  //   - UNSUPPORTED fill-translate=[-2, -2]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 046 tunnel-street-pedestrian-zone [fill] source-layer=street_polygons
  //   - APPROXIMATION fill-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  // 047 tunnel-way-footway:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 22.
  // 048 tunnel-way-steps:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 22.
  // 049 tunnel-way-path:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 22.
  // 050 tunnel-way-cycleway:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 22.
  // 051 tunnel-street-track:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 96.
  // 052 tunnel-street-pedestrian:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 128.
  // 053 tunnel-street-service:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 48.
  // 054 tunnel-street-livingstreet:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 128.
  // 055 tunnel-street-residential:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 128.
  // 056 tunnel-street-unclassified:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 128.
  // 057 tunnel-street-busway:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 48.
  // 058 tunnel-street-busguideway:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 48.
  // 059 tunnel-street-tertiary-link:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 128.
  // 060 tunnel-street-secondary-link:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 40.
  //   - UNSUPPORTED line-dasharray=[1, 0.3]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 061 tunnel-street-primary-link:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 40.
  //   - UNSUPPORTED line-dasharray=[1, 0.3]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 062 tunnel-street-trunk-link:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 40.
  //   - UNSUPPORTED line-dasharray=[1, 0.3]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 063 tunnel-street-motorway-link:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=12: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 40.
  //   - UNSUPPORTED line-dasharray=[1, 0.3]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 064 tunnel-street-tertiary:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 128.
  // 065 tunnel-street-secondary:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 138.
  //   - UNSUPPORTED line-dasharray=[1, 0.3]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 066 tunnel-street-primary:outline [line] source-layer=streets
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 144.
  //   - UNSUPPORTED line-dasharray=[1, 0.3]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 067 tunnel-street-trunk:outline [line] source-layer=streets
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 144.
  //   - UNSUPPORTED line-dasharray=[1, 0.3]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 068 tunnel-street-motorway:outline [line] source-layer=streets
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 168.
  //   - UNSUPPORTED line-dasharray=[1, 0.3]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 069 tunnel-way-footway [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 20.
  //   - UNSUPPORTED line-dasharray=[1, 0.2]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 070 tunnel-way-steps [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 20.
  //   - UNSUPPORTED line-dasharray=[1, 0.2]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 071 tunnel-way-path [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 20.
  //   - UNSUPPORTED line-dasharray=[1, 0.2]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 072 tunnel-way-cycleway [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 20.
  //   - UNSUPPORTED line-dasharray=[1, 0.2]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 073 tunnel-street-track [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 88.
  // 074 tunnel-street-pedestrian [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 075 tunnel-street-service [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 40.
  // 076 tunnel-street-livingstreet [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 077 tunnel-street-residential [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 078 tunnel-street-unclassified [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 079 tunnel-street-busway [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 40.
  // 080 tunnel-street-busguideway [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 40.
  // 082 tunnel-street-pedestrian-bicycle [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 084 tunnel-street-livingstreet-bicycle [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 085 tunnel-street-residential-bicycle [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 086 tunnel-street-unclassified-bicycle [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 087 tunnel-street-tertiary-link [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 088 tunnel-street-secondary-link [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 38.
  // 089 tunnel-street-primary-link [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 38.
  // 090 tunnel-street-trunk-link [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 38.
  // 091 tunnel-street-motorway-link [line] source-layer=streets
  //   - UNSUPPORTED minzoom=12: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 38.
  // 092 tunnel-street-tertiary [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 093 tunnel-street-secondary [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 130.
  // 094 tunnel-street-primary [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 9 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 140.
  // 095 tunnel-street-trunk [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 7 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 140.
  // 096 tunnel-street-motorway [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 6 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 160.
  // 097 tunnel-transport-tram:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 20.
  //   - UNSUPPORTED line-dasharray=[0.1, 0.5]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 098 tunnel-transport-narrowgauge:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 20.
  //   - UNSUPPORTED line-dasharray=[0.1, 0.5]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 099 tunnel-transport-subway:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 0.5.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 10.
  // 100 tunnel-transport-lightrail:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=8: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 0.5.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 14.
  // 101 tunnel-transport-lightrail-service:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=14: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 14.
  // 102 tunnel-transport-rail:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=8: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 9 = 0.3.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 14.
  // 103 tunnel-transport-rail-service:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=14: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 14.
  // 104 tunnel-transport-monorail:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 20.
  //   - UNSUPPORTED line-dasharray=[0.1, 0.5]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 105 tunnel-transport-funicular:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 20.
  //   - UNSUPPORTED line-dasharray=[0.1, 0.5]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 106 tunnel-transport-tram [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 5.
  // 107 tunnel-transport-narrowgauge [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 5.
  // 108 tunnel-transport-subway [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 8.
  //   - UNSUPPORTED line-dasharray=[2, 2]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 109 tunnel-transport-lightrail [line] source-layer=streets
  //   - UNSUPPORTED minzoom=14: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 10.
  //   - UNSUPPORTED line-dasharray=[2, 2]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 110 tunnel-transport-lightrail-service [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 10.
  //   - UNSUPPORTED line-dasharray=[2, 2]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 111 tunnel-transport-rail [line] source-layer=streets
  //   - UNSUPPORTED minzoom=14: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 0.3.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 10.
  //   - UNSUPPORTED line-dasharray=[2, 2]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 112 tunnel-transport-rail-service [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 10.
  //   - UNSUPPORTED line-dasharray=[2, 2]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 113 tunnel-transport-monorail [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 5.
  // 114 tunnel-transport-funicular [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 5.
  // 115 bridge [fill] source-layer=bridges
  //   - UNSUPPORTED fill-antialias=True: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 116 street-pedestrian-zone [fill] source-layer=street_polygons
  //   - APPROXIMATION fill-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
  // 117 way-footway:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 22.
  // 118 way-steps:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 22.
  // 119 way-path:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 22.
  // 120 way-cycleway:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 22.
  // 121 street-track:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 96.
  // 122 street-pedestrian:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 128.
  // 123 street-service:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 48.
  // 124 street-livingstreet:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 128.
  // 125 street-residential:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 128.
  // 126 street-unclassified:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 128.
  // 127 street-busway:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 48.
  // 128 street-busguideway:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 48.
  // 129 street-tertiary-link:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 128.
  // 130 street-secondary-link:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 40.
  // 131 street-primary-link:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 40.
  // 132 street-trunk-link:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 40.
  // 133 street-motorway-link:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=12: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 40.
  // 134 street-tertiary:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 128.
  // 135 street-secondary:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 138.
  // 136 street-primary:outline [line] source-layer=streets
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 144.
  // 137 street-trunk:outline [line] source-layer=streets
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 144.
  // 138 street-motorway:outline [line] source-layer=streets
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 168.
  // 139 way-footway [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 20.
  // 140 way-steps [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 20.
  // 141 way-path [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 20.
  // 142 way-cycleway [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 20.
  // 143 street-track [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 88.
  // 144 street-pedestrian [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 14 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 145 street-service [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 40.
  // 146 street-livingstreet [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 147 street-residential [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 148 street-unclassified [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 149 street-busway [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 40.
  // 150 street-busguideway [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 40.
  // 152 street-pedestrian-bicycle [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 154 street-livingstreet-bicycle [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 155 street-residential-bicycle [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 156 street-unclassified-bicycle [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 157 street-tertiary-link [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 158 street-secondary-link [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 38.
  // 159 street-primary-link [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 38.
  // 160 street-trunk-link [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 38.
  // 161 street-motorway-link [line] source-layer=streets
  //   - UNSUPPORTED minzoom=12: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 38.
  // 162 street-tertiary [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 163 street-secondary [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 130.
  // 164 street-primary [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 9 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 140.
  // 165 street-trunk [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 7 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 140.
  // 166 street-motorway [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 6 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 160.
  // 167 transport-tram:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 20.
  //   - UNSUPPORTED line-dasharray=[0.1, 0.5]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 168 transport-narrowgauge:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 20.
  //   - UNSUPPORTED line-dasharray=[0.1, 0.5]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 169 transport-subway:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 10.
  // 170 transport-lightrail:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=8: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 14.
  // 171 transport-lightrail-service:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=14: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 14.
  // 172 transport-rail:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=8: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 9 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 14.
  // 173 transport-rail-service:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=14: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 14.
  // 174 transport-monorail:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 20.
  //   - UNSUPPORTED line-dasharray=[0.1, 0.5]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 175 transport-funicular:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 20.
  //   - UNSUPPORTED line-dasharray=[0.1, 0.5]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 176 transport-tram [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 5.
  // 177 transport-narrowgauge [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 5.
  // 178 transport-subway [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 8.
  //   - UNSUPPORTED line-dasharray=[2, 2]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 179 transport-lightrail [line] source-layer=streets
  //   - UNSUPPORTED minzoom=14: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 10.
  //   - UNSUPPORTED line-dasharray=[2, 2]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 180 transport-lightrail-service [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 10.
  //   - UNSUPPORTED line-dasharray=[2, 2]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 181 transport-rail [line] source-layer=streets
  //   - UNSUPPORTED minzoom=14: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 10.
  //   - UNSUPPORTED line-dasharray=[2, 2]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 182 transport-rail-service [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 10.
  //   - UNSUPPORTED line-dasharray=[2, 2]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 183 transport-monorail [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 5.
  // 184 transport-funicular [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 5.
  // 185 transport-ferry [line] source-layer=ferries
  //   - UNSUPPORTED minzoom=10: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 11 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 17 = 6.
  //   - UNSUPPORTED line-dasharray=[1, 1]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 186 bridge-way-footway:bridge [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 31.
  // 187 bridge-way-steps:bridge [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 31.
  // 188 bridge-way-path:bridge [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 31.
  // 189 bridge-way-cycleway:bridge [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 31.
  // 190 bridge-street-track:bridge [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 134.
  // 191 bridge-street-pedestrian:bridge [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 179.
  // 192 bridge-street-service:bridge [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 134.
  // 193 bridge-street-livingstreet:bridge [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 179.
  // 194 bridge-street-residential:bridge [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 179.
  // 195 bridge-street-unclassified:bridge [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 179.
  // 198 bridge-street-tertiary-link:bridge [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 179.
  // 199 bridge-street-secondary-link:bridge [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 56.
  // 200 bridge-street-primary-link:bridge [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 56.
  // 201 bridge-street-trunk-link:bridge [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 56.
  // 202 bridge-street-motorway-link:bridge [line] source-layer=streets
  //   - UNSUPPORTED minzoom=12: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 56.
  // 203 bridge-street-tertiary:bridge [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 179.
  // 204 bridge-street-secondary:bridge [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 193.
  // 205 bridge-street-primary:bridge [line] source-layer=streets
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 202.
  // 206 bridge-street-trunk:bridge [line] source-layer=streets
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 202.
  // 207 bridge-street-motorway:bridge [line] source-layer=streets
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 235.
  // 208 bridge-street-pedestrian-zone [fill] source-layer=street_polygons
  //   - APPROXIMATION fill-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  // 209 bridge-way-footway:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 22.
  // 210 bridge-way-steps:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 22.
  // 211 bridge-way-path:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 22.
  // 212 bridge-way-cycleway:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 22.
  // 213 bridge-street-track:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 96.
  // 214 bridge-street-pedestrian:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 128.
  // 215 bridge-street-service:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 48.
  // 216 bridge-street-livingstreet:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 128.
  // 217 bridge-street-residential:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 128.
  // 218 bridge-street-unclassified:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 128.
  // 219 bridge-street-busway:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 48.
  // 220 bridge-street-busguideway:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 48.
  // 221 bridge-street-tertiary-link:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 128.
  // 222 bridge-street-secondary-link:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 40.
  // 223 bridge-street-primary-link:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 40.
  // 224 bridge-street-trunk-link:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 40.
  // 225 bridge-street-motorway-link:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=12: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 40.
  // 226 bridge-street-tertiary:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 128.
  // 227 bridge-street-secondary:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 138.
  // 228 bridge-street-primary:outline [line] source-layer=streets
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 144.
  // 229 bridge-street-trunk:outline [line] source-layer=streets
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 144.
  // 230 bridge-street-motorway:outline [line] source-layer=streets
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 168.
  // 231 bridge-way-footway [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 20.
  // 232 bridge-way-steps [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 20.
  // 233 bridge-way-path [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 20.
  // 234 bridge-way-cycleway [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 20.
  // 235 bridge-street-track [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 88.
  // 236 bridge-street-pedestrian [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 237 bridge-street-service [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 40.
  // 238 bridge-street-livingstreet [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 239 bridge-street-residential [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 240 bridge-street-unclassified [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 241 bridge-street-busway [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 40.
  // 242 bridge-street-busguideway [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 40.
  // 244 bridge-street-pedestrian-bicycle [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 246 bridge-street-livingstreet-bicycle [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 247 bridge-street-residential-bicycle [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 248 bridge-street-unclassified-bicycle [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 249 bridge-street-tertiary-link [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 250 bridge-street-secondary-link [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 38.
  // 251 bridge-street-primary-link [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 38.
  // 252 bridge-street-trunk-link [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 38.
  // 253 bridge-street-motorway-link [line] source-layer=streets
  //   - UNSUPPORTED minzoom=12: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 38.
  // 254 bridge-street-tertiary [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 13 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 120.
  // 255 bridge-street-secondary [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 130.
  // 256 bridge-street-primary [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 9 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 140.
  // 257 bridge-street-trunk [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 7 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 140.
  // 258 bridge-street-motorway [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 6 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 160.
  // 259 bridge-transport-tram:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 20.
  //   - UNSUPPORTED line-dasharray=[0.1, 0.5]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 260 bridge-transport-narrowgauge:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 20.
  //   - UNSUPPORTED line-dasharray=[0.1, 0.5]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 261 bridge-transport-subway:outline [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 10.
  // 262 bridge-transport-lightrail:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=8: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 12 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 14.
  // 263 bridge-transport-lightrail-service:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=14: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 14.
  // 264 bridge-transport-rail:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=8: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 9 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 14.
  // 265 bridge-transport-rail-service:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=14: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 14.
  // 266 bridge-transport-monorail:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 20.
  //   - UNSUPPORTED line-dasharray=[0.1, 0.5]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 267 bridge-transport-funicular:outline [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 20.
  //   - UNSUPPORTED line-dasharray=[0.1, 0.5]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 268 bridge-transport-tram [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 5.
  // 269 bridge-transport-narrowgauge [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 5.
  // 270 bridge-transport-subway [line] source-layer=streets
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 8.
  //   - UNSUPPORTED line-dasharray=[2, 2]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 271 bridge-transport-lightrail [line] source-layer=streets
  //   - UNSUPPORTED minzoom=14: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 10.
  //   - UNSUPPORTED line-dasharray=[2, 2]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 272 bridge-transport-lightrail-service [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 10.
  //   - UNSUPPORTED line-dasharray=[2, 2]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 273 bridge-transport-rail [line] source-layer=streets
  //   - UNSUPPORTED minzoom=14: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-opacity: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 10.
  //   - UNSUPPORTED line-dasharray=[2, 2]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 274 bridge-transport-rail-service [line] source-layer=streets
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 10.
  //   - UNSUPPORTED line-dasharray=[2, 2]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 275 bridge-transport-monorail [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 5.
  // 276 bridge-transport-funicular [line] source-layer=streets
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 5.
  // 277 poi-amenity [symbol] source-layer=pois
  //   - UNSUPPORTED minzoom=16: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION filter to-boolean/get: represented as defined(property).
  //   - UNSUPPORTED icon-image=['match', ['get', 'amenity'], 'arts_centre', 'basics:icon-art_gallery', 'atm', 'basics:icon-atm', 'bank', 'basics:icon-bank', 'bar', 'basics:icon-bar', 'bench', 'basics:icon-bench', 'bicycle_rental', 'basics:icon-bicycle_share', 'biergarten', 'basics:icon-beergarden', 'cafe', 'basics:icon-cafe', 'car_rental', 'basics:icon-car_rental', 'car_sharing', 'basics:icon-car_rental', 'car_wash', 'basics:icon-car_wash', 'cinema', 'basics:icon-cinema', 'college', 'basics:icon-college', 'community_centre', 'basics:icon-community', 'dentist', 'basics:icon-dentist', 'doctors', 'basics:icon-doctor', 'dog_park', 'basics:icon-dog_park', 'drinking_water', 'basics:icon-drinking_water', 'embassy', 'basics:icon-embassy', 'fast_food', 'basics:icon-fast_food', 'fire_station', 'basics:icon-fire_station', 'fountain', 'basics:icon-fountain', 'grave_yard', 'basics:icon-cemetery', 'hospital', 'basics:icon-hospital', 'hunting_stand', 'basics:icon-huntingstand', 'library', 'basics:icon-library', 'marketplace', 'basics:icon-marketplace', 'nightclub', 'basics:icon-nightclub', 'nursing_home', 'basics:icon-nursinghome', 'pharmacy', 'basics:icon-pharmacy', 'place_of_worship', 'basics:icon-place_of_worship', 'playground', 'basics:icon-playground', 'police', 'basics:icon-police', 'post_box', 'basics:icon-postbox', 'post_office', 'basics:icon-post', 'prison', 'basics:icon-prison', 'pub', 'basics:icon-beer', 'recycling', 'basics:icon-recycling', 'restaurant', 'basics:icon-restaurant', 'school', 'basics:icon-school', 'shelter', 'basics:icon-shelter', 'telephone', 'basics:icon-telephone', 'theatre', 'basics:icon-theatre', 'toilets', 'basics:icon-toilet', 'townhall', 'basics:icon-town_hall', 'vending_machine', 'basics:icon-vendingmachine', 'veterinary', 'basics:icon-veterinary', 'waste_basket', 'basics:icon-waste_basket', '']: Mapbox sprite/match expressions require separate image assets/translation.
  //   - UNSUPPORTED symbol-placement='point': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED icon-optional=True: no direct equivalent in a single Cesium3DTileStyle.
  //   - APPROXIMATION icon-size: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 1.
  //   - APPROXIMATION icon-opacity={'stops': [[16, 0], [17, 0.4]]}: zoom-dependent opacity not available; opacity is omitted.
  //   - APPROXIMATION text-opacity={'stops': [[16, 0], [17, 0.4]]}: zoom-dependent opacity not available; opacity is omitted.
  // 278 poi-leisure [symbol] source-layer=pois
  //   - UNSUPPORTED minzoom=16: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION filter to-boolean/get: represented as defined(property).
  //   - UNSUPPORTED icon-image=['match', ['get', 'leisure'], 'golf_course', 'basics:icon-golf', 'ice_rink', 'basics:icon-icerink', 'pitch', 'basics:icon-pitch', 'stadium', 'basics:icon-stadium', 'swimming_pool', 'basics:icon-swimming', 'water_park', 'basics:icon-waterpark', 'basics:icon-sports']: Mapbox sprite/match expressions require separate image assets/translation.
  //   - UNSUPPORTED symbol-placement='point': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED icon-optional=True: no direct equivalent in a single Cesium3DTileStyle.
  //   - APPROXIMATION icon-size: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 1.
  //   - APPROXIMATION icon-opacity={'stops': [[16, 0], [17, 0.4]]}: zoom-dependent opacity not available; opacity is omitted.
  //   - APPROXIMATION text-opacity={'stops': [[16, 0], [17, 0.4]]}: zoom-dependent opacity not available; opacity is omitted.
  // 279 poi-tourism [symbol] source-layer=pois
  //   - UNSUPPORTED minzoom=16: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION filter to-boolean/get: represented as defined(property).
  //   - UNSUPPORTED icon-image=['match', ['get', 'tourism'], 'chalet', 'basics:icon-chalet', 'information', 'basics:transport-information', 'picnic_site', 'basics:icon-picnic_site', 'viewpoint', 'basics:icon-viewpoint', 'zoo', 'basics:icon-zoo', '']: Mapbox sprite/match expressions require separate image assets/translation.
  //   - UNSUPPORTED symbol-placement='point': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED icon-optional=True: no direct equivalent in a single Cesium3DTileStyle.
  //   - APPROXIMATION icon-size: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 1.
  //   - APPROXIMATION icon-opacity={'stops': [[16, 0], [17, 0.4]]}: zoom-dependent opacity not available; opacity is omitted.
  //   - APPROXIMATION text-opacity={'stops': [[16, 0], [17, 0.4]]}: zoom-dependent opacity not available; opacity is omitted.
  // 280 poi-shop [symbol] source-layer=pois
  //   - UNSUPPORTED minzoom=16: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION filter to-boolean/get: represented as defined(property).
  //   - UNSUPPORTED icon-image=['match', ['get', 'shop'], 'alcohol', 'basics:icon-alcohol_shop', 'bakery', 'basics:icon-bakery', 'beauty', 'basics:icon-beauty', 'beverages', 'basics:icon-beverages', 'books', 'basics:icon-books', 'butcher', 'basics:icon-butcher', 'chemist', 'basics:icon-chemist', 'clothes', 'basics:icon-clothes', 'doityourself', 'basics:icon-doityourself', 'dry_cleaning', 'basics:icon-drycleaning', 'florist', 'basics:icon-florist', 'furniture', 'basics:icon-furniture', 'garden_centre', 'basics:icon-garden_centre', 'general', 'basics:icon-shop', 'gift', 'basics:icon-gift', 'greengrocer', 'basics:icon-greengrocer', 'hairdresser', 'basics:icon-hairdresser', 'hardware', 'basics:icon-hardware', 'jewelry', 'basics:icon-jewelry_store', 'kiosk', 'basics:icon-kiosk', 'laundry', 'basics:icon-laundry', 'newsagent', 'basics:icon-newsagent', 'optican', 'basics:icon-optician', 'outdoor', 'basics:icon-outdoor', 'shoes', 'basics:icon-shoes', 'sports', 'basics:icon-sports', 'stationery', 'basics:icon-stationery', 'toys', 'basics:icon-toys', 'travel_agency', 'basics:icon-travel_agent', 'video', 'basics:icon-video', 'basics:icon-shop']: Mapbox sprite/match expressions require separate image assets/translation.
  //   - UNSUPPORTED symbol-placement='point': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED icon-optional=True: no direct equivalent in a single Cesium3DTileStyle.
  //   - APPROXIMATION icon-size: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 1.
  //   - APPROXIMATION icon-opacity={'stops': [[16, 0], [17, 0.4]]}: zoom-dependent opacity not available; opacity is omitted.
  //   - APPROXIMATION text-opacity={'stops': [[16, 0], [17, 0.4]]}: zoom-dependent opacity not available; opacity is omitted.
  // 281 poi-man_made [symbol] source-layer=pois
  //   - UNSUPPORTED minzoom=16: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION filter to-boolean/get: represented as defined(property).
  //   - UNSUPPORTED icon-image=['match', ['get', 'man_made'], 'lighthouse', 'basics:icon-lighthouse', 'surveillance', 'basics:icon-surveillance', 'tower', 'basics:icon-observation_tower', 'watermill', 'basics:icon-watermill', 'windmill', 'basics:icon-windmill', '']: Mapbox sprite/match expressions require separate image assets/translation.
  //   - UNSUPPORTED symbol-placement='point': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED icon-optional=True: no direct equivalent in a single Cesium3DTileStyle.
  //   - APPROXIMATION icon-size: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 1.
  //   - APPROXIMATION icon-opacity={'stops': [[16, 0], [17, 0.4]]}: zoom-dependent opacity not available; opacity is omitted.
  //   - APPROXIMATION text-opacity={'stops': [[16, 0], [17, 0.4]]}: zoom-dependent opacity not available; opacity is omitted.
  // 282 poi-historic [symbol] source-layer=pois
  //   - UNSUPPORTED minzoom=16: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION filter to-boolean/get: represented as defined(property).
  //   - UNSUPPORTED icon-image=['match', ['get', 'historic'], 'artwork', 'basics:icon-artwork', 'castle', 'basics:icon-castle', 'monument', 'basics:icon-monument', 'wayside_shrine', 'basics:icon-shrine', 'basics:icon-historic']: Mapbox sprite/match expressions require separate image assets/translation.
  //   - UNSUPPORTED symbol-placement='point': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED icon-optional=True: no direct equivalent in a single Cesium3DTileStyle.
  //   - APPROXIMATION icon-size: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 1.
  //   - APPROXIMATION icon-opacity={'stops': [[16, 0], [17, 0.4]]}: zoom-dependent opacity not available; opacity is omitted.
  //   - APPROXIMATION text-opacity={'stops': [[16, 0], [17, 0.4]]}: zoom-dependent opacity not available; opacity is omitted.
  // 283 poi-emergency [symbol] source-layer=pois
  //   - UNSUPPORTED minzoom=16: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION filter to-boolean/get: represented as defined(property).
  //   - UNSUPPORTED icon-image=['match', ['get', 'emergency'], 'defibrillator', 'basics:icon-defibrillator', 'fire_hydrant', 'basics:icon-hydrant', 'phone', 'basics:icon-emergency_phone', '']: Mapbox sprite/match expressions require separate image assets/translation.
  //   - UNSUPPORTED symbol-placement='point': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED icon-optional=True: no direct equivalent in a single Cesium3DTileStyle.
  //   - APPROXIMATION icon-size: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 1.
  //   - APPROXIMATION icon-opacity={'stops': [[16, 0], [17, 0.4]]}: zoom-dependent opacity not available; opacity is omitted.
  //   - APPROXIMATION text-opacity={'stops': [[16, 0], [17, 0.4]]}: zoom-dependent opacity not available; opacity is omitted.
  // 284 poi-highway [symbol] source-layer=pois
  //   - UNSUPPORTED minzoom=16: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION filter to-boolean/get: represented as defined(property).
  //   - UNSUPPORTED symbol-placement='point': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED icon-optional=True: no direct equivalent in a single Cesium3DTileStyle.
  //   - APPROXIMATION icon-size: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 1.
  //   - APPROXIMATION icon-opacity={'stops': [[16, 0], [17, 0.4]]}: zoom-dependent opacity not available; opacity is omitted.
  //   - APPROXIMATION text-opacity={'stops': [[16, 0], [17, 0.4]]}: zoom-dependent opacity not available; opacity is omitted.
  // 285 poi-office [symbol] source-layer=pois
  //   - UNSUPPORTED minzoom=16: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - APPROXIMATION filter to-boolean/get: represented as defined(property).
  //   - UNSUPPORTED symbol-placement='point': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED icon-optional=True: no direct equivalent in a single Cesium3DTileStyle.
  //   - APPROXIMATION icon-size: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 20 = 1.
  //   - APPROXIMATION icon-opacity={'stops': [[16, 0], [17, 0.4]]}: zoom-dependent opacity not available; opacity is omitted.
  //   - APPROXIMATION text-opacity={'stops': [[16, 0], [17, 0.4]]}: zoom-dependent opacity not available; opacity is omitted.
  // 286 boundary-country:outline [line] source-layer=boundaries
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 10 = 8.
  //   - UNSUPPORTED line-blur=1: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 287 boundary-country-disputed:outline [line] source-layer=boundaries
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 10 = 8.
  // 288 boundary-state:outline [line] source-layer=boundaries
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 10 = 4.
  //   - UNSUPPORTED line-blur=1: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 289 boundary-country [line] source-layer=boundaries
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 10 = 4.
  // 290 boundary-country-disputed [line] source-layer=boundaries
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 10 = 4.
  //   - UNSUPPORTED line-dasharray=[2, 1]: no direct Cesium MVT Cesium3DTileStyle equivalent.
  // 291 boundary-state [line] source-layer=boundaries
  //   - APPROXIMATION line-width: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 10 = 2.
  // 292 label-address-housenumber [symbol] source-layer=addresses
  //   - UNSUPPORTED minzoom=17: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED symbol-placement='point': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-anchor='center': no direct equivalent in a single Cesium3DTileStyle.
  // 293 label-motorway-shield [symbol] source-layer=street_labels
  //   - UNSUPPORTED minzoom=14: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED symbol-placement='line': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-anchor='center': no direct equivalent in a single Cesium3DTileStyle.
  // 294 label-street-pedestrian [symbol] source-layer=street_labels
  //   - UNSUPPORTED minzoom=12: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED symbol-placement='line': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-anchor='center': no direct equivalent in a single Cesium3DTileStyle.
  // 295 label-street-livingstreet [symbol] source-layer=street_labels
  //   - UNSUPPORTED minzoom=12: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED symbol-placement='line': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-anchor='center': no direct equivalent in a single Cesium3DTileStyle.
  // 296 label-street-residential [symbol] source-layer=street_labels
  //   - UNSUPPORTED minzoom=12: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED symbol-placement='line': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-anchor='center': no direct equivalent in a single Cesium3DTileStyle.
  // 297 label-street-unclassified [symbol] source-layer=street_labels
  //   - UNSUPPORTED minzoom=12: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED symbol-placement='line': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-anchor='center': no direct equivalent in a single Cesium3DTileStyle.
  // 298 label-street-tertiary [symbol] source-layer=street_labels
  //   - UNSUPPORTED minzoom=12: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED symbol-placement='line': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-anchor='center': no direct equivalent in a single Cesium3DTileStyle.
  // 299 label-street-secondary [symbol] source-layer=street_labels
  //   - UNSUPPORTED minzoom=12: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED symbol-placement='line': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-anchor='center': no direct equivalent in a single Cesium3DTileStyle.
  // 300 label-street-primary [symbol] source-layer=street_labels
  //   - UNSUPPORTED minzoom=12: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED symbol-placement='line': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-anchor='center': no direct equivalent in a single Cesium3DTileStyle.
  // 301 label-street-trunk [symbol] source-layer=street_labels
  //   - UNSUPPORTED minzoom=12: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED symbol-placement='line': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-anchor='center': no direct equivalent in a single Cesium3DTileStyle.
  // 302 label-street-track [symbol] source-layer=street_labels
  //   - UNSUPPORTED minzoom=12: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED symbol-placement='line': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-anchor='center': no direct equivalent in a single Cesium3DTileStyle.
  // 303 label-place-neighbourhood [symbol] source-layer=place_labels
  //   - UNSUPPORTED minzoom=14: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED symbol-sort-key=['-', ['to-number', ['get', 'population'], 0]]: no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-transform='uppercase': no direct equivalent in a single Cesium3DTileStyle.
  // 304 label-place-quarter [symbol] source-layer=place_labels
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED symbol-sort-key=['-', ['to-number', ['get', 'population'], 0]]: no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-transform='uppercase': no direct equivalent in a single Cesium3DTileStyle.
  // 305 label-place-suburb [symbol] source-layer=place_labels
  //   - UNSUPPORTED minzoom=11: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED symbol-sort-key=['-', ['to-number', ['get', 'population'], 0]]: no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-transform='uppercase': no direct equivalent in a single Cesium3DTileStyle.
  // 306 label-place-hamlet [symbol] source-layer=place_labels
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED symbol-sort-key=['-', ['to-number', ['get', 'population'], 0]]: no direct equivalent in a single Cesium3DTileStyle.
  // 307 label-place-village [symbol] source-layer=place_labels
  //   - UNSUPPORTED minzoom=11: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED symbol-sort-key=['-', ['to-number', ['get', 'population'], 0]]: no direct equivalent in a single Cesium3DTileStyle.
  // 308 label-place-town [symbol] source-layer=place_labels
  //   - UNSUPPORTED minzoom=9: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED symbol-sort-key=['-', ['to-number', ['get', 'population'], 0]]: no direct equivalent in a single Cesium3DTileStyle.
  // 309 label-boundary-state [symbol] source-layer=boundary_labels
  //   - UNSUPPORTED minzoom=5: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED text-anchor='top': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-offset=[0, 0.2]: no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-padding=0: no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-optional=True: no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-transform='uppercase': no direct equivalent in a single Cesium3DTileStyle.
  // 310 label-place-city [symbol] source-layer=place_labels
  //   - UNSUPPORTED minzoom=7: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED symbol-sort-key=['-', ['to-number', ['get', 'population'], 0]]: no direct equivalent in a single Cesium3DTileStyle.
  // 311 label-place-statecapital [symbol] source-layer=place_labels
  //   - UNSUPPORTED minzoom=6: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED symbol-sort-key=['-', ['to-number', ['get', 'population'], 0]]: no direct equivalent in a single Cesium3DTileStyle.
  // 312 label-place-capital [symbol] source-layer=place_labels
  //   - UNSUPPORTED minzoom=5: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED symbol-sort-key=['-', ['to-number', ['get', 'population'], 0]]: no direct equivalent in a single Cesium3DTileStyle.
  // 313 label-boundary-country-small [symbol] source-layer=boundary_labels
  //   - UNSUPPORTED minzoom=4: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED text-anchor='top': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-offset=[0, 0.2]: no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-padding=0: no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-optional=True: no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-transform='uppercase': no direct equivalent in a single Cesium3DTileStyle.
  // 314 label-boundary-country-medium [symbol] source-layer=boundary_labels
  //   - UNSUPPORTED minzoom=3: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED text-anchor='top': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-offset=[0, 0.2]: no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-padding=0: no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-optional=True: no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-transform='uppercase': no direct equivalent in a single Cesium3DTileStyle.
  // 315 label-boundary-country-large [symbol] source-layer=boundary_labels
  //   - UNSUPPORTED minzoom=2: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED text-anchor='top': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-offset=[0, 0.2]: no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-padding=0: no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-optional=True: no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-transform='uppercase': no direct equivalent in a single Cesium3DTileStyle.
  // 316 marking-oneway [symbol] source-layer=streets
  //   - UNSUPPORTED minzoom=16: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED icon-image='basics:marking-arrow': Mapbox sprite/match expressions require separate image assets/translation.
  //   - UNSUPPORTED symbol-placement='line': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED icon-rotate=90: no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED icon-rotation-alignment='map': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED symbol-spacing=175: no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED symbol-avoid-edges=True: no direct equivalent in a single Cesium3DTileStyle.
  //   - APPROXIMATION icon-opacity={'stops': [[16, 0], [17, 0.4], [20, 0.4]]}: zoom-dependent opacity not available; opacity is omitted.
  //   - APPROXIMATION text-opacity={'stops': [[16, 0], [17, 0.4], [20, 0.4]]}: zoom-dependent opacity not available; opacity is omitted.
  // 317 marking-oneway-reverse [symbol] source-layer=streets
  //   - UNSUPPORTED minzoom=16: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED icon-image='basics:marking-arrow': Mapbox sprite/match expressions require separate image assets/translation.
  //   - UNSUPPORTED symbol-placement='line': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED icon-rotate=-90: no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED icon-rotation-alignment='map': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED symbol-spacing=75: no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED symbol-avoid-edges=True: no direct equivalent in a single Cesium3DTileStyle.
  //   - APPROXIMATION icon-opacity={'stops': [[16, 0], [17, 0.4], [20, 0.4]]}: zoom-dependent opacity not available; opacity is omitted.
  //   - APPROXIMATION text-opacity={'stops': [[16, 0], [17, 0.4], [20, 0.4]]}: zoom-dependent opacity not available; opacity is omitted.
  // 318 symbol-transit-bus [symbol] source-layer=public_transport
  //   - UNSUPPORTED minzoom=16: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED icon-image='basics:icon-bus': Mapbox sprite/match expressions require separate image assets/translation.
  //   - UNSUPPORTED symbol-placement='point': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-anchor='top': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED icon-anchor='bottom': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED icon-keep-upright=True: no direct equivalent in a single Cesium3DTileStyle.
  //   - APPROXIMATION icon-size: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 18 = 1.
  //   - APPROXIMATION icon-opacity=0.7: zoom-dependent opacity not available; opacity is omitted.
  // 319 symbol-transit-tram [symbol] source-layer=public_transport
  //   - UNSUPPORTED minzoom=15: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED icon-image='basics:transport-tram': Mapbox sprite/match expressions require separate image assets/translation.
  //   - UNSUPPORTED symbol-placement='point': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-anchor='top': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED icon-anchor='bottom': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED icon-keep-upright=True: no direct equivalent in a single Cesium3DTileStyle.
  //   - APPROXIMATION icon-size: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 17 = 1.
  //   - APPROXIMATION icon-opacity=0.7: zoom-dependent opacity not available; opacity is omitted.
  // 320 symbol-transit-subway [symbol] source-layer=public_transport
  //   - UNSUPPORTED minzoom=14: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED icon-image='basics:icon-rail_metro': Mapbox sprite/match expressions require separate image assets/translation.
  //   - UNSUPPORTED symbol-placement='point': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-anchor='top': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED icon-anchor='bottom': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED icon-keep-upright=True: no direct equivalent in a single Cesium3DTileStyle.
  //   - APPROXIMATION icon-size: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
  //   - APPROXIMATION icon-opacity=0.7: zoom-dependent opacity not available; opacity is omitted.
  // 321 symbol-transit-lightrail [symbol] source-layer=public_transport
  //   - UNSUPPORTED minzoom=14: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED icon-image='basics:icon-rail_light': Mapbox sprite/match expressions require separate image assets/translation.
  //   - UNSUPPORTED symbol-placement='point': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-anchor='top': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED icon-anchor='bottom': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED icon-keep-upright=True: no direct equivalent in a single Cesium3DTileStyle.
  //   - APPROXIMATION icon-size: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 16 = 1.
  //   - APPROXIMATION icon-opacity=0.7: zoom-dependent opacity not available; opacity is omitted.
  // 322 symbol-transit-station [symbol] source-layer=public_transport
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED icon-image='basics:icon-rail': Mapbox sprite/match expressions require separate image assets/translation.
  //   - UNSUPPORTED symbol-placement='point': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-anchor='top': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED icon-anchor='bottom': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED icon-keep-upright=True: no direct equivalent in a single Cesium3DTileStyle.
  //   - APPROXIMATION icon-size: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
  //   - APPROXIMATION icon-opacity=0.7: zoom-dependent opacity not available; opacity is omitted.
  // 323 symbol-transit-airfield [symbol] source-layer=public_transport
  //   - UNSUPPORTED minzoom=13: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED icon-image='basics:icon-airfield': Mapbox sprite/match expressions require separate image assets/translation.
  //   - UNSUPPORTED symbol-placement='point': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-anchor='top': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED icon-anchor='bottom': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED icon-keep-upright=True: no direct equivalent in a single Cesium3DTileStyle.
  //   - APPROXIMATION icon-size: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 15 = 1.
  //   - APPROXIMATION icon-opacity=0.7: zoom-dependent opacity not available; opacity is omitted.
  // 324 symbol-transit-airport [symbol] source-layer=public_transport
  //   - UNSUPPORTED minzoom=12: Cesium3DTileStyle has no Mapbox zoom filter.
  //   - UNSUPPORTED text-field expression=['coalesce', ['get', 'name_he'], ['get', 'name_en'], ['get', 'name']]: complex formatting not translated.
  //   - UNSUPPORTED icon-image='basics:icon-airport': Mapbox sprite/match expressions require separate image assets/translation.
  //   - UNSUPPORTED symbol-placement='point': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED text-anchor='top': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED icon-anchor='bottom': no direct equivalent in a single Cesium3DTileStyle.
  //   - UNSUPPORTED icon-keep-upright=True: no direct equivalent in a single Cesium3DTileStyle.
  //   - APPROXIMATION icon-size: zoom stops are unsupported by Cesium3DTileStyle; using last stop at zoom 14 = 1.
  //   - APPROXIMATION icon-opacity=0.7: zoom-dependent opacity not available; opacity is omitted.
});

export { VECTOR_TILE_STYLE };
