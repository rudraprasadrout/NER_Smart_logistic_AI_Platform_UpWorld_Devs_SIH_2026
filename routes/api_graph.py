from flask import Blueprint, jsonify, request
from models.graph_engine import graph_engine
from models.forecast_engine import ForecastEngine

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
    """Returns risk projections across 24h, 48h, 72h horizons."""
    timeline = ForecastEngine.get_forecast_timeline()
    return jsonify({
        'status': 'success',
        'timeline': timeline
    })

@api_graph_bp.route('/district/<district_code>/status', methods=['GET'])
def get_district_status(district_code):
    """Returns district-wise connectivity summary."""
    edges = [e for e in graph_engine.rebuild_graph() if district_code.lower() in e.get('district_context', '').lower()]
    blocked_count = sum(1 for e in edges if e.get('is_blocked'))
    high_risk_count = sum(1 for e in edges if e.get('risk_score', 0) >= 50 and not e.get('is_blocked'))
    
    return jsonify({
        'district': district_code,
        'total_segments': len(edges),
        'blocked_segments': blocked_count,
        'high_risk_segments': high_risk_count,
        'accessible_segments': len(edges) - blocked_count - high_risk_count
    })
