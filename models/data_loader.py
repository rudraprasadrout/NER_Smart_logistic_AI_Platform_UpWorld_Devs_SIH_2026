import os
import glob
import re
import csv
from config import Config

def _find_dataset_file(pattern, default_name):
    """Finds dataset file matching pattern or falls back to default name."""
    primary = os.path.join(Config.DATA_DIR, default_name)
    if os.path.exists(primary):
        return primary
    matches = glob.glob(os.path.join(Config.DATA_DIR, pattern))
    if matches:
        return sorted(matches, key=len, reverse=True)[0]
    return primary

def _get_district_and_state(lat, lon):
    """Maps lat/lon coordinates in the Meghalaya-Assam lifeline corridor to districts."""
    if lat >= 25.75 and lon < 92.2:
        return 'Ri-Bhoi', 'Meghalaya'
    elif lat >= 25.85:
        return 'Kamrup Metropolitan', 'Assam'
    elif lat >= 25.35 and lon >= 92.5:
        return 'Dima Hasao', 'Assam'
    elif lat < 25.1 and lon >= 92.5:
        return 'Cachar', 'Assam'
    elif lat < 25.1 and lon < 92.5:
        return 'Karimganj', 'Assam'
    elif lon >= 92.2:
        return 'East Jaintia Hills', 'Meghalaya'
    elif lon >= 92.05:
        return 'West Jaintia Hills', 'Meghalaya'
    else:
        return 'East Khasi Hills', 'Meghalaya'

def _parse_coordinate_pair(s):
    """Parses string like '(91.9967278, 25.1864686)' into (lon, lat)."""
    m = re.findall(r'[-+]?\d*\.\d+|\d+', str(s))
    if len(m) >= 2:
        return round(float(m[0]), 7), round(float(m[1]), 7)
    return None

# Landmark coordinates for regional logistics hubs and strategic choke points
# Landmark coordinates for regional logistics hubs and strategic choke points
LANDMARK_COORDS = {
    'guwahati_hub': {'name': 'Guwahati Central Logistics Hub', 'lat': 26.1158, 'lon': 91.8150, 'type': 'supply_hub', 'pop': 95000, 'buffer': 14},
    'nongpoh': {'name': 'Nongpoh Transit Depot', 'lat': 25.9059, 'lon': 91.8815, 'type': 'town', 'pop': 28000, 'buffer': 8},
    'shillong_hub': {'name': 'Shillong District Logistics Depot', 'lat': 25.5788, 'lon': 91.8933, 'type': 'supply_hub', 'pop': 143000, 'buffer': 12},
    'cherrapunjee': {'name': 'Cherrapunjee (Sohra) Relief Post', 'lat': 25.2702, 'lon': 91.7323, 'type': 'town', 'pop': 12500, 'buffer': 5},
    'mawsynram': {'name': 'Mawsynram Forward Post', 'lat': 25.2970, 'lon': 91.5826, 'type': 'remote_village', 'pop': 6800, 'buffer': 4},
    'jowai': {'name': 'Jowai District Supply Depot', 'lat': 25.4502, 'lon': 92.2045, 'type': 'town', 'pop': 38500, 'buffer': 9},
    'dawki': {'name': 'Dawki Border Trade & Supply Post', 'lat': 25.1898, 'lon': 92.0195, 'type': 'town', 'pop': 9500, 'buffer': 6},
    'khliehriat': {'name': 'Khliehriat Mining & Logistics Hub', 'lat': 25.3556, 'lon': 92.3689, 'type': 'town', 'pop': 24000, 'buffer': 7},
    'sonapur': {'name': 'Sonapur / Lubha Bridge Lifeline Post', 'lat': 25.1120, 'lon': 92.3629, 'type': 'junction', 'pop': 4200, 'buffer': 3},
    'haflong': {'name': 'Haflong Hill Supply Depot', 'lat': 25.1825, 'lon': 93.0180, 'type': 'supply_hub', 'pop': 45000, 'buffer': 10},
    'umrangso': {'name': 'Umrangso Industrial Junction', 'lat': 25.5119, 'lon': 92.7424, 'type': 'town', 'pop': 18000, 'buffer': 7},
    'badarpur': {'name': 'Badarpur Rail-Road Gateway', 'lat': 24.9050, 'lon': 92.5480, 'type': 'town', 'pop': 32000, 'buffer': 8},
    'silchar_hub': {'name': 'Silchar Central Relief Base', 'lat': 24.8333, 'lon': 92.7789, 'type': 'supply_hub', 'pop': 175000, 'buffer': 14},
    'karimganj': {'name': 'Karimganj Border Depot', 'lat': 24.8710, 'lon': 92.4304, 'type': 'town', 'pop': 67000, 'buffer': 9}
}

def load_nodes():
    """Loads and enriches settlements, hubs, and active network junctions."""
    edges_file = _find_dataset_file('ner_edges*.csv', 'ner_edges_REAL (3).csv')
    nodes = {}
    alias_map = {}

    if not os.path.exists(edges_file):
        return nodes

    # 1. Extract all active network node endpoints from edges dataset
    with open(edges_file, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        idx = 0
        for row in reader:
            for endpoint_col in ('u', 'v'):
                node_id = row.get(endpoint_col)
                if not node_id or node_id in nodes:
                    continue
                
                lat, lon = None, None
                if node_id.startswith('osm_node_'):
                    parts = node_id[len('osm_node_'):].split('_')
                    if len(parts) == 2:
                        try:
                            lat, lon = float(parts[0]), float(parts[1])
                        except ValueError:
                            pass
                
                if lat is None or lon is None:
                    continue

                idx += 1
                district, state = _get_district_and_state(lat, lon)
                nodes[node_id] = {
                    'id': node_id,
                    'name': f"{district} Junction #{idx}",
                    'district': district,
                    'state': state,
                    'lat': lat,
                    'lon': lon,
                    'type': 'junction',
                    'population': 800 + ((idx * 137) % 4200),
                    'buffer_days': 3 + (idx % 8),
                    'description': f"Transport junction in {district}, {state} (Lat {lat:.4f}, Lon {lon:.4f})"
                }

    # 2. Match and designate prominent landmark hubs with precise geographic coordinates
    for alias, l_info in LANDMARK_COORDS.items():
        best_id = None
        min_dist = float('inf')
        for n_id, n_data in nodes.items():
            d = (n_data['lat'] - l_info['lat'])**2 + (n_data['lon'] - l_info['lon'])**2
            if d < min_dist:
                min_dist = d
                best_id = n_id
        if best_id:
            nodes[best_id]['name'] = l_info['name']
            nodes[best_id]['type'] = l_info['type']
            nodes[best_id]['population'] = l_info['pop']
            nodes[best_id]['buffer_days'] = l_info['buffer']
            nodes[best_id]['description'] = f"Key regional strategic hub for {nodes[best_id]['district']}, {nodes[best_id]['state']}"
            nodes[best_id]['alias'] = alias
            alias_map[alias] = best_id

    # Store alias map as attribute on nodes dictionary
    nodes['_alias_map'] = alias_map
    return nodes

def load_edges():
    """Loads road segments from datasets in data/ with parsed coordinates and safety attributes."""
    edges_file = _find_dataset_file('ner_edges*.csv', 'ner_edges_REAL (3).csv')
    edges = []

    if not os.path.exists(edges_file):
        return edges

    with open(edges_file, mode='r', encoding='utf-8') as f:
        # Skip leading blank lines
        lines = [line for line in f if line.strip()]
        reader = csv.DictReader(lines)
        for idx, row in enumerate(reader):
            edge_id = row.get('edge_id') or row.get('id') or f'osm_edge_{idx+1:04d}'
            u_id = row.get('u', '').strip()
            v_id = row.get('v', '').strip()

            # Parse or generate geometry
            coords = []
            if row.get('geometry'):
                for pt in row['geometry'].split(';'):
                    if ',' in pt:
                        lat_s, lon_s = pt.split(',')
                        coords.append([float(lat_s.strip()), float(lon_s.strip())])
            
            if not coords and u_id.startswith('osm_node_') and v_id.startswith('osm_node_'):
                u_pts = u_id[len('osm_node_'):].split('_')
                v_pts = v_id[len('osm_node_'):].split('_')
                if len(u_pts) == 2 and len(v_pts) == 2:
                    coords = [[float(u_pts[0]), float(u_pts[1])], [float(v_pts[0]), float(v_pts[1])]]

            # Compute midpoint for district context
            mid_lat = (coords[0][0] + coords[-1][0]) / 2.0 if coords else 25.3
            mid_lon = (coords[0][1] + coords[-1][1]) / 2.0 if coords else 92.2
            district, state = _get_district_and_state(mid_lat, mid_lon)

            # Road name formatting
            road_ref = row.get('ref', '').strip() if row.get('ref') else ''
            raw_name = row.get('name', '').strip() if row.get('name') else ''
            road_type = row.get('road_type', 'tertiary')
            
            if raw_name:
                display_name = raw_name
            elif road_ref:
                display_name = f"{road_ref} ({district})"
            else:
                display_name = f"{road_type.capitalize()} Sector ({district} #{idx+1})"

            slope_deg = float(row['slope_deg']) if row.get('slope_deg') else 5.0
            dist_km = float(row['distance_km']) if row.get('distance_km') else 1.0
            speed_kmh = float(row['avg_speed_kmh']) if row.get('avg_speed_kmh') else 40.0

            # Base vulnerability calculation based on terrain slope & region
            if row.get('base_vulnerability') and str(row['base_vulnerability']).strip():
                base_vuln = float(row['base_vulnerability'])
            else:
                zone_boost = 0.25 if ('Jaintia' in district or 'Khasi' in district or 'Dima Hasao' in district) else 0.1
                base_vuln = round(min(0.95, max(0.12, (slope_deg / 35.0) * 0.7 + zone_boost)), 2)

            # Soil factor
            if row.get('soil_factor') and str(row['soil_factor']).strip():
                soil_factor = float(row['soil_factor'])
            else:
                soil_factor = 0.85 if 'Jaintia' in district else 0.65 if 'Khasi' in district else 0.50

            edges.append({
                'id': edge_id,
                'osm_id': row.get('osm_id', ''),
                'u': u_id,
                'v': v_id,
                'name': display_name,
                'ref': road_ref,
                'road_type': road_type,
                'distance_km': round(dist_km, 3),
                'avg_speed_kmh': round(speed_kmh, 1),
                'slope_deg': round(slope_deg, 1),
                'base_vulnerability': base_vuln,
                'soil_factor': soil_factor,
                'district_context': district,
                'geometry': coords,
                'bridge': row.get('bridge', 'F') == 'T',
                'tunnel': row.get('tunnel', 'F') == 'T'
            })

    return edges

def load_weather():
    """Loads live district-wise weather and 72-hour forecast data from OpenWeatherMap API with automatic fallback."""
    try:
        from .weather_service import OpenWeatherService
        return OpenWeatherService.get_district_weather()
    except Exception as e:
        print(f"[Weather] Error loading live OpenWeather data: {e}")
        weather_file = os.path.join(Config.DATA_DIR, 'weather_data.csv')
        weather = {}
        if os.path.exists(weather_file):
            with open(weather_file, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    weather[row['district']] = {
                        'district': row['district'],
                        'current_rainfall_mm': float(row['current_rainfall_mm']),
                        'forecast_24h_mm': float(row['forecast_24h_mm']),
                        'forecast_48h_mm': float(row['forecast_48h_mm']),
                        'forecast_72h_mm': float(row['forecast_72h_mm']),
                        'soil_saturation_index': float(row['soil_saturation_index']),
                        'weather_condition': row['weather_condition']
                    }
        return weather

def load_historical_disruptions():
    """Loads historical incident records for ML model training from data/historical_disruptions.csv."""
    hist_file = os.path.join(Config.DATA_DIR, 'historical_disruptions.csv')
    records = []
    if os.path.exists(hist_file):
        with open(hist_file, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                records.append({
                    'date': row['date'],
                    'edge_id': row['edge_id'],
                    'district': row['district'],
                    'rainfall_24h_mm': float(row['rainfall_24h_mm']),
                    'slope_deg': float(row['slope_deg']),
                    'soil_saturation': float(row['soil_saturation']),
                    'base_vulnerability': float(row['base_vulnerability']),
                    'active_reports_count': int(row['active_reports_count']),
                    'disruption_level': float(row['disruption_level']),
                    'blocked_flag': int(row['blocked_flag'])
                })
    return records

