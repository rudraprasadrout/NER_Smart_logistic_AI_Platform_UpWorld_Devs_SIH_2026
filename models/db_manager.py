import sqlite3
import os
import uuid
import datetime
from config import Config

def get_db():
    conn = sqlite3.connect(Config.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    os.makedirs(os.path.dirname(Config.DATABASE_PATH), exist_ok=True)
    conn = get_db()
    cursor = conn.cursor()
    
    # Field Incident Reports
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS field_reports (
            id TEXT PRIMARY KEY,
            client_report_id TEXT UNIQUE,
            edge_id TEXT,
            reporter_name TEXT,
            hazard_type TEXT,
            severity TEXT,
            description TEXT,
            lat REAL,
            lon REAL,
            photo_url TEXT,
            timestamp TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Alerts & Notifications with Multilingual templates
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS alerts (
            id TEXT PRIMARY KEY,
            category TEXT,
            severity TEXT,
            edge_id TEXT,
            title_en TEXT,
            title_as TEXT,
            title_hi TEXT,
            title_bn TEXT,
            message_en TEXT,
            message_as TEXT,
            message_hi TEXT,
            message_bn TEXT,
            timestamp TEXT
        )
    ''')

    # Seed initial emergency alerts if empty
    cursor.execute('SELECT COUNT(*) FROM alerts')
    if cursor.fetchone()[0] == 0:
        # Use real edge IDs from the dataset (highest-risk trunk roads)
        # osm_edge_0021: NH6 East Jaintia Hills (slope=22.3°, highly vulnerable)
        # osm_edge_0701: NH627 Dima Hasao (slope=14.5°, long dangerous corridor)
        seed_alerts = [
            (
                str(uuid.uuid4()),
                'ROAD_BLOCKED',
                'CRITICAL',
                'osm_edge_0021',
                'NH-6 East Jaintia Hills Sector Blocked by Massive Landslide',
                'NH-6 পূব জয়ন্তীয়া পাহাৰ অংশত প্ৰচণ্ড ভূমিস্খলনৰ বাবে পথ বন্ধ',
                'NH-6 पूर्व जयंतिया हिल्स खंड भारी भूस्खलन के कारण पूरी तरह बंद',
                'NH-6 পূর্ব জয়ন্তিয়া হিলস সেকশন ভারী ভূমিধসের কারণে সম্পূর্ণ বন্ধ',
                'Heavy debris flow on NH-6 near Jaintia Hills corridor. All vehicular traffic to Barak Valley halted. Rerouting via Dima Hasao recommended.',
                'জয়ন্তীয়া পাহাৰত বৃহৎ ভূমিস্খলন। বৰাক উপত্যকালৈ যান-বাহন চলাচল বন্ধ। ডিমা হাছাও হৈ বিকল্প পথ ব্যৱহাৰ কৰক।',
                'जयंतिया हिल्स में भारी मलबा जमा होने से बराक घाटी का यातायात बाधित है। डिमा हसाओ वैकल्पिक मार्ग का उपयोग करें।',
                'জয়ন্তিয়া হিলসে ভারী ধ্বংসস্তূপ জমে বরাক উপত্যকা যোগাযোগ বিচ্ছিন্ন। ডিমা হাসাও বিকল্প রুট ব্যবহারের পরামর্শ দেওয়া হচ্ছে।',
                datetime.datetime.now(datetime.timezone.utc).isoformat()
            ),
            (
                str(uuid.uuid4()),
                'ISOLATION_WARNING',
                'HIGH',
                'osm_edge_0701',
                'NH-627 Dima Hasao Corridor at Imminent Cut-off Risk',
                'NH-627 ডিমা হাছাও পথ বিচ্ছিন্ন হোৱাৰ প্ৰবল সম্ভাৱনা',
                'NH-627 डिमा हसाओ संपर्क मार्ग कटने के कगार पर',
                'NH-627 ডিমা হাসাও সংযোগ সড়ক বিচ্ছিন্ন হওয়ার ঝুঁকিতে',
                'Precipitation exceeded 85mm. Soil saturation index critical (88%). Essential supply convoys advised immediate transit before dusk.',
                'বৃষ্টিপাত ৮৫ মিমি অতিক্ৰম কৰিলে। মাটিৰ জলপৃক্ততা সংকটজনক (৮৮%)। অত্যাৱশ্যকীয় যোগান তৎকালে স্থানান্তৰ কৰক।',
                'वर्षा 85 मिमी से अधिक हुई। मिट्टी की जल-संतृप्ति 88% पहुंची। आवश्यक सामग्री जल्द से जल्द सुरक्षित क्षेत्रों में पहुंचाएं।',
                'বৃষ্টিপাত ৮৫ মিমি অতিক্রম করেছে। মাটির জল-সম্পৃক্তি অত্যন্ত ঝুঁকিপূর্ণ। অবিলম্বে প্রয়োজনীয় খাদ্য ও ওষুধ সরবরাহ সম্পন্ন করুন।',
                datetime.datetime.now(datetime.timezone.utc).isoformat()
            )
        ]
        cursor.executemany('''
            INSERT INTO alerts (id, category, severity, edge_id, title_en, title_as, title_hi, title_bn, message_en, message_as, message_hi, message_bn, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', seed_alerts)

    conn.commit()
    conn.close()

# Auto-initialize on import
init_db()
