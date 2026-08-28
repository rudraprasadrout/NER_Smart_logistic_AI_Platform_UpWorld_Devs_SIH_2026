from flask import Blueprint, jsonify
from models.vehicle_simulator import vehicle_simulator

api_vehicles_bp = Blueprint('api_vehicles', __name__, url_prefix='/api/v1')

@api_vehicles_bp.route('/vehicles', methods=['GET'])
def get_all_vehicles():
    """Returns telemetry of all essential commodity vehicles."""
    vehicles = vehicle_simulator.get_all_vehicles()
    return jsonify({
        'status': 'success',
        'count': len(vehicles),
        'vehicles': vehicles
    })

@api_vehicles_bp.route('/vehicles/<vehicle_id>/location', methods=['GET'])
def get_vehicle_location(vehicle_id):
    """Returns live GPS location and status of a specific vehicle."""
    v = vehicle_simulator.get_vehicle(vehicle_id)
    if not v:
        return jsonify({'status': 'error', 'message': f'Vehicle {vehicle_id} not found'}), 404
        
    return jsonify({
        'status': 'success',
        'vehicle': v
    })
