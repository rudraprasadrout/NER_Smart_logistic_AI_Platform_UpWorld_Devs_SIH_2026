from flask import Blueprint, jsonify, request
from models.graph_engine import graph_engine

api_routes_bp = Blueprint('api_routes', __name__, url_prefix='/api/v1')

@api_routes_bp.route('/route/<from_node>/<to_node>', methods=['GET'])
def get_safe_route(from_node, to_node):
    """Returns shortest route vs AI-recommended safest risk-weighted route."""
    route_result = graph_engine.compute_route(from_node, to_node)
    if 'error' in route_result:
        return jsonify({'status': 'error', 'message': route_result['error']}), 400
    
    return jsonify({
        'status': 'success',
        **route_result
    })
