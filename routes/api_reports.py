import uuid
import datetime
from flask import Blueprint, jsonify, request
from models.db_manager import get_db
from models.graph_engine import graph_engine

api_reports_bp = Blueprint('api_reports', __name__, url_prefix='/api/v1')

@api_reports_bp.route('/reports/incident', methods=['POST'])
def submit_incident_report():
    """
    Accepts geo-tagged field report.
    Supports idempotent sync via client_report_id.
    """
    data = request.get_json(force=True) if request.is_json else request.form
    
    client_report_id = data.get('client_report_id') or str(uuid.uuid4())
    edge_id = data.get('edge_id')
    reporter_name = data.get('reporter_name', 'Field Officer')
    hazard_type = data.get('hazard_type', 'Landslide')
    severity = data.get('severity', 'High')
    description = data.get('description', '')
    lat = float(data.get('lat', 25.5))
    lon = float(data.get('lon', 91.8))
    photo_url = data.get('photo_url', '')
    timestamp = data.get('timestamp') or datetime.datetime.now(datetime.timezone.utc).isoformat()

    conn = get_db()
    cursor = conn.cursor()

    # Check for duplicate client_report_id (idempotency)
    cursor.execute('SELECT id FROM field_reports WHERE client_report_id = ?', (client_report_id,))
    existing = cursor.fetchone()
    
    if existing:
        conn.close()
        return jsonify({
            'status': 'already_synced',
            'report_id': existing['id'],
            'message': 'Report already processed.'
        }), 200

    report_id = str(uuid.uuid4())
    cursor.execute('''
        INSERT INTO field_reports (id, client_report_id, edge_id, reporter_name, hazard_type, severity, description, lat, lon, photo_url, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (report_id, client_report_id, edge_id, reporter_name, hazard_type, severity, description, lat, lon, photo_url, timestamp))
    
    # Generate dynamic alert in database
    alert_id = str(uuid.uuid4())
    alert_title = f"{hazard_type} Reported on {edge_id or 'Corridor'}"
    alert_msg = description or f"{severity} severity incident reported by {reporter_name}. Exercise extreme caution."
    cursor.execute('''
        INSERT INTO alerts (id, category, severity, edge_id, title_en, title_as, title_hi, title_bn, message_en, message_as, message_hi, message_bn, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        alert_id,
        'ROAD_HAZARD',
        severity.upper(),
        edge_id or 'general',
        alert_title,
        f"{edge_id or 'পথত'} {hazard_type}ৰ প্ৰতিবেদন দাখিল",
        f"{edge_id or 'मार्ग पर'} {hazard_type} की सूचना",
        f"{edge_id or 'রুটে'} {hazard_type} রিপোর্ট করা হয়েছে",
        alert_msg,
        f"{reporter_name} দ্বাৰা প্ৰতিবেদন দাখিল: {alert_msg}",
        f"{reporter_name} द्वारा सूचित: {alert_msg}",
        f"{reporter_name} দ্বারা রিপোর্ট করা হয়েছে: {alert_msg}",
        timestamp
    ))

    conn.commit()
    conn.close()

    # Feed report into live graph engine
    report_obj = {
        'id': report_id,
        'edge_id': edge_id,
        'hazard_type': hazard_type,
        'severity': severity,
        'description': description,
        'lat': lat,
        'lon': lon,
        'timestamp': timestamp
    }
    graph_engine.add_field_report(report_obj)

    return jsonify({
        'status': 'success',
        'report_id': report_id,
        'client_report_id': client_report_id,
        'message': 'Field report received and live accessibility graph updated.'
    }), 201

@api_reports_bp.route('/reports', methods=['GET'])
def get_reports():
    """Returns all verified field reports."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM field_reports ORDER BY created_at DESC LIMIT 50')
    rows = cursor.fetchall()
    conn.close()
    
    reports = [dict(r) for r in rows]
    return jsonify({
        'status': 'success',
        'count': len(reports),
        'reports': reports
    })
