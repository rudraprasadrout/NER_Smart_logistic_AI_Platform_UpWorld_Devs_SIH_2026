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
        seed_alerts = [
            (
                str(uuid.uuid4()),
                'ROAD_BLOCKED',
                'CRITICAL',
                'e_lumshnong_sonapur',
                'NH-6 Lumshnong-Sonapur Sector Blocked by Massive Landslide',
                'NH-6 লুমশনং-সোনাপুৰ অংশত প্ৰচণ্ড ভূমিস্খলনৰ বাবে পথ বন্ধ',
                'NH-6 लुमशनॉन्ग-सोनापुर खंड भारी भूस्खलन के कारण पूरी तरह बंद',
                'NH-6 লুমশনং-সোনাপুর সেকশন ভারী ভূমিধসের কারণে সম্পূর্ণ বন্ধ',
                'Heavy debris flow at Sonapur bottleneck. All vehicular traffic to Silchar/Barak Valley halted. Rerouting via Haflong recommended.',
                'সোনাপুৰত বৃহৎ ভূমিস্খলন। শিলচৰ/বৰাক উপত্যকালৈ যান-বাহন চলাচল বন্ধ। হাফলং হৈ বিকল্প পথ ব্যৱহাৰ কৰক।',
                'सोनापुर में भारी मलबा जमा होने से सिलचर/बराक घाटी का यातायात बाधित है। हाफलोंग वैकल्पिक मार्ग का उपयोग करें।',
                'সোনাপুরে ভারী ধ্বংসস্তূপ জমে শিলচর/বরাক উপত্যকা যোগাযোগ বিচ্ছিন্ন। হাফলং বিকল্প রুট ব্যবহারের পরামর্শ দেওয়া হচ্ছে।',
                datetime.datetime.now(datetime.timezone.utc).isoformat()
            ),
            (
                str(uuid.uuid4()),
                'ISOLATION_WARNING',
                'HIGH',
                'e_shillong_cherra',
                'Cherrapunjee & Mawsynram Spurs at Imminent Cut-off Risk',
                'চেৰাপুঞ্জী আৰু মৌচিনৰাম পথ বিচ্ছিন্ন হোৱাৰ প্ৰবল সম্ভাৱনা',
                'चेरापूंजी और मौसिनराम संपर्क मार्ग कटने के कगार पर',
                'চেরাপুঞ্জি ও মৌসিনরাম সংযোগ সড়ক বিচ্ছিন্ন হওয়ার ঝুঁকিতে',
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
