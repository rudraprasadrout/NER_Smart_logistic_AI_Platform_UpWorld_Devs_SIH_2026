import os
import csv
from config import Config

def load_nodes():
    """Loads settlements and hubs from data/ner_nodes.csv."""
    nodes_file = os.path.join(Config.DATA_DIR, 'ner_nodes.csv')
    nodes = {}
    with open(nodes_file, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            nodes[row['id']] = {
                'id': row['id'],
                'name': row['name'],
                'district': row['district'],
                'state': row['state'],
                'lat': float(row['lat']),
                'lon': float(row['lon']),
                'type': row['type'],  # supply_hub, town, remote_village, junction
                'population': int(row['population']),
                'buffer_days': int(row['buffer_days']),
                'description': row['description']
            }
    return nodes

def load_edges():
    """Loads road segments from data/ner_edges.csv with parsed geometry waypoints."""
    edges_file = os.path.join(Config.DATA_DIR, 'ner_edges.csv')
    edges = []
    with open(edges_file, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Parse geometry string: "lat1,lon1;lat2,lon2;..."
            coords = []
            if row.get('geometry'):
                for pt in row['geometry'].split(';'):
                    if ',' in pt:
                        lat_s, lon_s = pt.split(',')
                        coords.append([float(lat_s.strip()), float(lon_s.strip())])
            
            edges.append({
                'id': row['id'],
                'u': row['u'],
                'v': row['v'],
                'name': row['name'],
                'road_type': row['road_type'],
                'distance_km': float(row['distance_km']),
                'avg_speed_kmh': float(row['avg_speed_kmh']),
                'slope_deg': float(row['slope_deg']),
                'base_vulnerability': float(row['base_vulnerability']),
                'soil_factor': float(row['soil_factor']),
                'district_context': row['district_context'],
                'geometry': coords
            })
    return edges

def load_weather():
    """Loads district-wise weather and 72-hour forecast data from data/weather_data.csv."""
    weather_file = os.path.join(Config.DATA_DIR, 'weather_data.csv')
    weather = {}
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
