from flask import Blueprint, jsonify, request
from models.graph_engine import graph_engine
from models.forecast_engine import ForecastEngine
from models.isolation_engine import IsolationEngine

api_graph_bp = Blueprint('api_graph', __name__, url_prefix='/api/v1')

@api_graph_bp.route('/graph/accessibility', methods=['GET'])
def get_accessibility_graph():
    """Returns road network graph with live risk scores per edge."""
    horizon = request.args.get('horizon', None)
    if horizon == 'current':
        horizon = None
    data = graph_engine.get_accessibility_graph(horizon=horizon)
    return jsonify({
        'status': 'success',
        'horizon': horizon or 'current',
        'nodes': data['nodes'],
        'edges': data['edges']
    })

@api_graph_bp.route('/graph/forecast', methods=['GET'])
def get_graph_forecast():
    """
    Returns risk projections across 24h, 48h, 72h horizons.
    Supports optional ?horizon=24h/48h/72h query parameter.
    """
    horizon = request.args.get('horizon', None)
    timeline = ForecastEngine.get_forecast_timeline()
    
    response_data = {
        'status': 'success',
        'timeline': timeline
    }
    if horizon and horizon in timeline:
        response_data['horizon'] = horizon
        response_data['edges'] = timeline[horizon]
        
    return jsonify(response_data)

@api_graph_bp.route('/district/<district_code>/status', methods=['GET'])
def get_district_status(district_code):
    """Returns district-wise connectivity summary and isolation impact."""
    d_clean = district_code.replace('_', ' ').replace('-', ' ').strip().lower()
    
    # Filter edges in this district
    all_edges = graph_engine.rebuild_graph()
    edges = [e for e in all_edges if d_clean in e.get('district_context', '').lower()]
    
    blocked_count = sum(1 for e in edges if e.get('is_blocked'))
    high_risk_count = sum(1 for e in edges if e.get('risk_score', 0) >= 50 and not e.get('is_blocked'))
    accessible_count = max(0, len(edges) - blocked_count - high_risk_count)

    # Compute isolated settlements in this district
    iso_data = IsolationEngine.compute_isolation_index()
    district_settlements = [s for s in iso_data.get('settlements', []) if d_clean in s.get('district', '').lower()]
    isolated_settlement_count = sum(1 for s in district_settlements if s.get('status') == 'ISOLATED')
    at_risk_settlement_count = sum(1 for s in district_settlements if s.get('status') == 'AT_RISK')

    return jsonify({
        'status': 'success',
        'district': district_code,
        'total_segments': len(edges),
        'accessible_segments': accessible_count,
        'high_risk_segments': high_risk_count,
        'blocked_segments': blocked_count,
        'total_settlements': len(district_settlements),
        'isolated_settlement_count': isolated_settlement_count,
        'at_risk_settlement_count': at_risk_settlement_count
    })

@api_graph_bp.route('/graph/nodes', methods=['GET'])
def get_graph_nodes():
    """Returns list of named nodes (hubs and key towns) for route planner dropdowns."""
    node_type_filter = request.args.get('type', None)  # e.g. 'supply_hub', 'town'
    nodes = graph_engine.nodes
    alias_map = graph_engine.alias_map

    # Build reverse alias map: node_id -> alias
    reverse_alias = {v: k for k, v in alias_map.items()}

    results = []
    for n_id, data in nodes.items():
        if n_id.startswith('_'):
            continue
        if node_type_filter and data.get('type') != node_type_filter:
            continue
        alias = reverse_alias.get(n_id)
        results.append({
            'id': n_id,
            'alias': alias,
            'name': data.get('name', n_id),
            'district': data.get('district', ''),
            'state': data.get('state', ''),
            'type': data.get('type', 'junction'),
            'lat': data.get('lat'),
            'lon': data.get('lon'),
            'population': data.get('population', 0),
            'buffer_days': data.get('buffer_days', 5)
        })

    # Prioritize supply hubs, then towns by population, then other nodes
    type_order = {'supply_hub': 0, 'town': 1, 'junction': 2, 'remote_village': 3}
    results.sort(key=lambda x: (type_order.get(x['type'], 9), -x['population']))

    return jsonify({'status': 'success', 'count': len(results), 'nodes': results})

@api_graph_bp.route('/graph/edges', methods=['GET'])
def get_graph_edges_list():
    """Returns list of road edges for field reporting dropdowns."""
    road_type_filter = request.args.get('road_type', None)  # e.g. 'trunk', 'primary'
    district_filter = request.args.get('district', None)
    edges = graph_engine.edges

    results = []
    for e in edges:
        if road_type_filter and e.get('road_type') != road_type_filter:
            continue
        if district_filter and district_filter.lower() not in e.get('district_context', '').lower():
            continue
        results.append({
            'id': e['id'],
            'name': e.get('name', e['id']),
            'road_type': e.get('road_type', 'tertiary'),
            'district': e.get('district_context', ''),
            'distance_km': e.get('distance_km', 0),
            'slope_deg': e.get('slope_deg', 0)
        })

    # Sort by road importance (trunk > primary > secondary > tertiary) then by distance
    road_order = {'trunk': 0, 'primary': 1, 'secondary': 2, 'tertiary': 3}
    results.sort(key=lambda x: (road_order.get(x['road_type'], 9), -x['distance_km']))

    return jsonify({'status': 'success', 'count': len(results), 'edges': results})

