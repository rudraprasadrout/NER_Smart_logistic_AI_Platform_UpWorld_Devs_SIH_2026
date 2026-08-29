from flask import Blueprint, jsonify, request
from models.db_manager import get_db

api_alerts_bp = Blueprint('api_alerts', __name__, url_prefix='/api/v1')

@api_alerts_bp.route('/alerts', methods=['GET'])
def get_alerts():
    """
    Returns active emergency alerts with multilingual translations.
    Supports ?lang=..., ?district=..., and ?severity=... filters.
    """
    lang = request.args.get('lang', 'en').lower()
    district = request.args.get('district', '').strip().lower()
    severity = request.args.get('severity', '').strip().upper()
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM alerts ORDER BY timestamp DESC')
    rows = cursor.fetchall()
    conn.close()

    alerts_list = []
    for r in rows:
        title_key = f'title_{lang}' if f'title_{lang}' in r.keys() else 'title_en'
        msg_key = f'message_{lang}' if f'message_{lang}' in r.keys() else 'message_en'
        
        # Check filters
        r_sev = (r['severity'] or '').upper()
        if severity and r_sev != severity:
            continue

        r_title = r[title_key] or r['title_en'] or ''
        r_msg = r[msg_key] or r['message_en'] or ''
        
        if district and (district not in r_title.lower() and district not in r_msg.lower() and district not in (r['edge_id'] or '').lower()):
            continue
        
        alerts_list.append({
            'id': r['id'],
            'category': r['category'],
            'severity': r['severity'],
            'edge_id': r['edge_id'],
            'title': r_title,
            'message': r_msg,
            'timestamp': r['timestamp'],
            'translations': {
                'en': {'title': r['title_en'], 'message': r['message_en']},
                'as': {'title': r['title_as'], 'message': r['message_as']},
                'hi': {'title': r['title_hi'], 'message': r['message_hi']},
                'bn': {'title': r['title_bn'], 'message': r['message_bn']}
            }
        })

    return jsonify({
        'status': 'success',
        'lang': lang,
        'count': len(alerts_list),
        'alerts': alerts_list
    })

@api_alerts_bp.route('/alerts/subscribe', methods=['POST'])
def subscribe_alerts():
    data = request.get_json(force=True) if request.is_json else request.form
    return jsonify({
        'status': 'success',
        'message': f"Subscribed {data.get('stakeholder_name', 'User')} for {data.get('language', 'en')} priority alerts."
    })

@api_alerts_bp.route('/ai/advisory', methods=['GET', 'POST'])
def get_ai_advisory():
    """Generates tactical logistics intelligence advisory using Mistral AI or fallback engine."""
    from models.mistral_service import mistral_service
    from models.isolation_engine import IsolationEngine
    
    lang = request.args.get('lang', 'en').lower()
    iso_data = IsolationEngine.compute_isolation_index()
    summary = iso_data.get('summary', {})
    
    district_status = {
        'isolated_count': summary.get('isolated_count', 0),
        'at_risk_count': summary.get('at_risk_count', 0),
        'severed_corridors': summary.get('severed_corridors_count', 0)
    }
    
    advisory_res = mistral_service.generate_advisory(
        district_status=district_status,
        isolated_count=summary.get('isolated_count', 0),
        isolated_pop=summary.get('total_isolated_population', 0),
        language=lang
    )
    
    return jsonify(advisory_res)

