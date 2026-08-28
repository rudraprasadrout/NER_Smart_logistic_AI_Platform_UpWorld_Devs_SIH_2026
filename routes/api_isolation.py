from flask import Blueprint, jsonify, request
from models.isolation_engine import IsolationEngine

api_isolation_bp = Blueprint('api_isolation', __name__, url_prefix='/api/v1')

@api_isolation_bp.route('/isolation-index', methods=['GET'])
def get_isolation_index():
    """Returns settlement reachability, isolation duration, and affected populations."""
    horizon = request.args.get('horizon', None)
    if horizon == 'current':
        horizon = None
    results = IsolationEngine.compute_isolation_index(horizon=horizon)
    return jsonify({
        'status': 'success',
        **results
    })
