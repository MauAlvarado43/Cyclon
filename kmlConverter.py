import json
import re

GEOTYPES = [
  'Polygon',
  'LineString',
  'Point',
  'Track',
  'gx:Track',
]

#: Supported style types
STYLE_TYPES = [
  'svg',
  'leaflet',
]

SPACE = re.compile(r'\s+')

def disambiguate(names, mark='1'):
    names_seen = set()
    new_names = []
    for name in names:
        new_name = name
        while new_name in names_seen:
            new_name += mark
        new_names.append(new_name)
        names_seen.add(new_name)

    return new_names

def build_layers(node, disambiguate_names=True):
    layers = []
    names = []
    for i, folder in enumerate(get(node, 'Folder')):
        name = val(get1(folder, 'name'))
        geojson = build_feature_collection(folder, name)
        if geojson['features']:
            layers.append(geojson)
            names.append(name)

    if not layers:
        # No folders, so use the root node
        name = val(get1(node, 'name'))
        geojson = build_feature_collection(node, name)
        if geojson['features']:
            layers.append(geojson)
            names.append(name)

    if disambiguate_names:
        new_names = disambiguate(names)
        new_layers = []
        for i, layer in enumerate(layers):
            layer['name'] = new_names[i]
            new_layers.append(layer)
        layers = new_layers

    return layers
    
def get(node, name):
    return node.getElementsByTagName(name)

def get1(node, name):
    s = get(node, name)
    if s:
        return s[0]
    else:
        return None

def attr(node, name):
    return node.getAttribute(name)

def val(node):
    try:
        node.normalize()
        return node.firstChild.wholeText.strip()  # Handles CDATASection too
    except AttributeError:
        return ''

def valf(node):
    try:
        return float(val(node))
    except ValueError:
        return None

def numarray(a):
    return [float(aa) for aa in a]

def coords1(s):
    return numarray(re.sub(SPACE, '', s).split(','))

def coords(s):
    s = s.split() #sub(TRIM_SPACE, '', v).split()
    return [coords1(ss) for ss in s]

def build_feature_collection(node, name=None):
    # Initialize
    geojson = {
      'type': 'FeatureCollection',
      'features': [],
    }

    # Build features
    for placemark in get(node, 'Placemark'):
        feature = build_feature(placemark)
        if feature is not None:
            geojson['features'].append(feature)

    # Give the collection a name if requested
    if name is not None:
        geojson['name'] = name

    return geojson

def build_feature(node):
    geoms_and_times = build_geometry(node)
    if not geoms_and_times['geoms']:
        return None

    props = {}
    for x in get(node, 'name')[:1]:
        name = val(x)
        if name:
            props['name'] = val(x)
    for x in get(node, 'description')[:1]:
        desc = val(x)
        if desc:
            props['description'] = desc
    for x in get(node, 'styleUrl')[:1]:
        style_url = val(x)
        if style_url[0] != '#':
            style_url = '#' + style_url
        props['styleUrl'] = style_url
    for x in get(node, 'PolyStyle')[:1]:
        color = val(get1(x, 'color'))
        if color:
            rgb, opacity = build_rgb_and_opacity(color)
            props['fill'] = rgb
            props['fill-opacity'] = opacity
            # Set default border style
            props['stroke'] = rgb
            props['stroke-opacity'] = opacity
            props['stroke-width'] = 1
        fill = valf(get1(x, 'fill'))
        if fill == 0:
            props['fill-opacity'] = fill
        elif fill == 1 and 'fill-opacity' not in props:
            props['fill-opacity'] = fill
        outline = valf(get1(x, 'outline'))
        if outline == 0:
            props['stroke-opacity'] = outline
        elif outline == 1 and 'stroke-opacity' not in props:
            props['stroke-opacity'] = outline
    for x in get(node, 'LineStyle')[:1]:
        color = val(get1(x, 'color'))
        if color:
            rgb, opacity = build_rgb_and_opacity(color)
            props['stroke'] = rgb
            props['stroke-opacity'] = opacity
        width = valf(get1(x, 'width'))
        if width:
            props['stroke-width'] = width
    for x in get(node, 'ExtendedData')[:1]:
        datas = get(x, 'Data')
        for data in datas:
            props[attr(data, 'name')] = val(get1(data, 'value'))
        simple_datas = get(x, 'SimpleData')
        for simple_data in simple_datas:
            props[attr(simple_data, 'name')] = val(simple_data)
    for x in get(node, 'TimeSpan')[:1]:
        begin = val(get1(x, 'begin'))
        end = val(get1(x, 'end'))
        props['timeSpan'] = {'begin': begin, 'end': end}
    if geoms_and_times['times']:
        times = geoms_and_times['times']
        if len(times) == 1:
            props['times'] = times[0]
        else:
            props['times'] = times

    feature = {
      'type': 'Feature',
      'properties': props,
    }

    geoms = geoms_and_times['geoms']
    if len(geoms) == 1:
        feature['geometry'] = geoms[0]
    else:
        feature['geometry'] = {
          'type': 'GeometryCollection',
          'geometries': geoms,
        }

    if attr(node, 'id'):
        feature['id'] = attr(node, 'id')

    return feature

def build_geometry(node):
    geoms = []
    times = []
    if get1(node, 'MultiGeometry'):
        return build_geometry(get1(node, 'MultiGeometry'))
    if get1(node, 'MultiTrack'):
        return build_geometry(get1(node, 'MultiTrack'))
    if get1(node, 'gx:MultiTrack'):
        return build_geometry(get1(node, 'gx:MultiTrack'))
    for geotype in GEOTYPES:
        geonodes = get(node, geotype)
        if not geonodes:
            continue
        for geonode in geonodes:
            if geotype == 'Point':
                geoms.append({
                  'type': 'Point',
                  'coordinates': coords1(val(get1(
                    geonode, 'coordinates')))
                })
            elif geotype == 'LineString':
                geoms.append({
                  'type': 'LineString',
                  'coordinates': coords(val(get1(
                    geonode, 'coordinates')))
                })
            elif geotype == 'Polygon':
                rings = get(geonode, 'LinearRing')
                coordinates = [coords(val(get1(ring, 'coordinates')))
                  for ring in rings]
                geoms.append({
                  'type': 'Polygon',
                  'coordinates': coordinates,
                })
            elif geotype in ['Track', 'gx:Track']:
                track = gx_coords(geonode)
                geoms.append({
                  'type': 'LineString',
                  'coordinates': track['coordinates'],
                })
                if track['times']:
                    times.append(track['times'])

    return {'geoms': geoms, 'times': times}