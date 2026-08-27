/**
 * RailPulse — Pure Vanilla JS Architecture
 * Connects directly to Python Flask REST & Telemetry APIs
 */

const i18n = {
  en: {
    app_subtitle: "Dynamic ETA & Decision Support Platform",
    passenger_view: "Passenger View",
    admin_view: "OCC Admin / Control Room",
    telemetry_label: "GNN Telemetry:",
    hero_title: "Live Train Tracking & Multimodal Companion",
    hero_desc: "Dynamic ETA calibrated via Graph Neural Networks (GNN) and Conformal Confidence bands. Know your exact arrival time before reaching the station.",
    active_trains_title: "Active Corridor Coaching Trains",
    on_time: "Running On Time",
    delayed: "Delayed by ~",
    mins: "min",
    current_speed: "Current Speed",
    current_track: "Current Track",
    corridor_pos: "Corridor Pos",
    approaching_station: "Approaching Station",
    expected_eta: "Expected Dynamic ETA",
    confidence_window: "Window:",
    timeline_title: "Station Progression Timeline",
    calibrated_bounds: "Calibrated Conformal Bounds",
    sched: "Sched:",
    train_here: "Train Here",
    why_eta: "Why is this ETA predicted?",
    xai_desc: "Graph Neural Network (GNN) Delay Factor Attribution",
    factor_headway: "Cascading Headway Contention (Train Ahead):",
    factor_tsr: "Cautionary Speed Restrictions (TSR):",
    factor_dwell: "Junction Platform Queuing:",
    multimodal_title: "Multimodal Feeder & Last-Mile Auto-Dispatch",
    multimodal_desc: "When your train enters the final approach zone and the confidence arrival window tightens to ±5 mins, we automatically dispatch your selected cab (Ola/Uber) or notify family.",
    enable_dispatch: "Enable Last-Mile Auto Dispatch",
    station_board_title: "Live Station Board",
    occ_title: "Operations Control Center (OCC) — Northern & North Central Railway",
    occ_desc: "Real-Time Network GNN Inference, Block Occupancy & Decision-Support System",
    tab_corridor: "Corridor Network Map",
    tab_whatif: "What-If Dispatch Sandbox",
    tab_benchmarks: "Model Benchmarks & GNN",
    whatif_title: "OCC Decision Support — 'What-If' Cascading Simulator",
    whatif_desc: "Test hypothetical dispatch disruptions, station holds, or track closures to forecast network-wide propagation in real time.",
    simulate_btn: "Simulate Cascading Impact",
    simulating_btn: "Simulating GNN Propagation...",
    impacted_trains: "Impacted Trains",
    total_cascade: "Total Cascaded Delay",
    health_score: "Network Health Score",
    recommendations_title: "Proactive OCC Dispatcher Recommendations",
    ai_memo_title: "AI Chief Controller Dispatch Memo (Mistral AI)",
    gen_memo_btn: "Generate Dispatch Memo",
    copilot_title: "RailPulse AI Copilot",
    copilot_desc: "Grounded on live GNN telemetry",
    copilot_input_placeholder: "Ask anything about this train...",
    ask_why_delayed: "Why is train delayed?",
    ask_connection: "Connection on time?",
    ask_window: "Explain ETA window"
  },
  hi: {
    app_subtitle: "गतिशील ईटीए एवं निर्णय सहायता मंच",
    passenger_view: "यात्री दृश्य",
    admin_view: "नियंत्रण कक्ष (एडमिन)",
    telemetry_label: "जीएनएन टेलीमेट्री:",
    hero_title: "लाइव ट्रेन ट्रैकिंग और मल्टीमॉडल साथी",
    hero_desc: "ग्राफ़ न्यूरल नेटवर्क (GNN) और कॉन्फॉर्मल प्रिडिक्शन द्वारा सटीक आगमन समय। स्टेशन पहुँचने से पहले जानें ट्रेन का सही समय।",
    active_trains_title: "सक्रिय कॉरिडोर एक्सप्रेस ट्रेनें",
    on_time: "समय पर चल रही है",
    delayed: "विलंबित लगभग",
    mins: "मिनट",
    current_speed: "वर्तमान गति",
    current_track: "वर्तमान ट्रैक",
    corridor_pos: "कॉरिडोर स्थिति",
    approaching_station: "अगला स्टेशन",
    expected_eta: "अनुमानित लाइव आगमन समय (ETA)",
    confidence_window: "संभावित समय सीमा:",
    timeline_title: "स्टेशन प्रगति टाइमलाइन",
    calibrated_bounds: "सटीक कॉन्फॉर्मल सीमाएं",
    sched: "निर्धारित:",
    train_here: "ट्रेन यहाँ है",
    why_eta: "यह ईटीए क्यों अनुमानित है?",
    xai_desc: "ग्राफ न्यूरल नेटवर्क (GNN) विलंब कारक विश्लेषण",
    factor_headway: "आगे वाली ट्रेन से दूरी की रुकावट:",
    factor_tsr: "सावधानी गति प्रतिबंध (TSR):",
    factor_dwell: "जंक्शन प्लेटफॉर्म प्रतीक्षा:",
    multimodal_title: "अंतिम मील ऑटो-कैब एवं फीडर डिस्पैच",
    multimodal_desc: "जब आपकी ट्रेन अंतिम चरण में आती है और समय सीमा ±5 मिनट के अंदर तय होती है, हम स्वतः ओला/उबर कैब या परिजनों को सूचित करते हैं।",
    enable_dispatch: "अंतिम मील ऑटो अलर्ट सक्षम करें",
    station_board_title: "लाइव स्टेशन आगमन पट्ट",
    occ_title: "परिचालन नियंत्रण कक्ष (OCC) — उत्तर व उत्तर मध्य रेलवे",
    occ_desc: "वास्तविक समय नेटवर्क जीएनएन अनुमान, ब्लॉक अधिभोग एवं निर्णय प्रणाली",
    tab_corridor: "कॉरिडोर नेटवर्क मानचित्र",
    tab_whatif: "व्हाट-इफ डिस्पैच सैंडबॉक्स",
    tab_benchmarks: "मॉडल बेंचमार्क एवं जीएनएन",
    whatif_title: "ओसीसी निर्णय सहायता — 'व्हाट-इफ' विलंब सिम्युलेटर",
    whatif_desc: "नेटवर्क-व्यापी विलंब का पूर्वानुमान लगाने के लिए काल्पनिक स्टॉपेज या ब्लॉक का परीक्षण करें।",
    simulate_btn: "प्रसार प्रभाव का अनुकरण करें",
    simulating_btn: "जीएनएन सिमुलेशन जारी...",
    impacted_trains: "प्रभावित ट्रेनें",
    total_cascade: "कुल संचित विलंब",
    health_score: "नेटवर्क स्वास्थ्य स्कोर",
    recommendations_title: "सक्रिय नियंत्रक सिफारिशें",
    ai_memo_title: "एआई मुख्य नियंत्रक डिस्पैच मेमो (मिस्ट्रल एआई)",
    gen_memo_btn: "डिस्पैच मेमो तैयार करें",
    copilot_title: "रेलपल्स एआई कोपायलट",
    copilot_desc: "लाइव जीएनएन टेलीमेट्री पर आधारित",
    copilot_input_placeholder: "इस ट्रेन के बारे में कुछ भी पूछें...",
    ask_why_delayed: "ट्रेन लेट क्यों है?",
    ask_connection: "क्या कनेक्टिंग ट्रेन मिलेगी?",
    ask_window: "आगमन समय सीमा समझाइए"
  },
  bn: {
    app_subtitle: "ডায়নামিক ইটিএ এবং অপারেশনাল সিদ্ধান্ত প্ল্যাটফর্ম",
    passenger_view: "যাত্রী ভিউ",
    admin_view: "নিয়ন্ত্রণ কক্ষ (অ্যাডমিন)",
    telemetry_label: "জিএনএন টেলিমেট্রি:",
    hero_title: "লাইভ ট্রেন ট্র্যাকিং এবং মাল্টিমোডাল সহায়ক",
    hero_desc: "গ্রাফ নিউরাল নেটওয়ার্ক (GNN) দ্বারা চালিত সঠিক আগমন সময়। স্টেশনে পৌঁছানোর আগেই জানুন সঠিক সময়।",
    active_trains_title: "সক্রিয় করিডোর ট্রেনসমূহ",
    on_time: "সময়ে চলছে",
    delayed: "দেরি প্রায়",
    mins: "মিনিট",
    current_speed: "বর্তমান গতি",
    current_track: "বর্তমান ট্র্যাক",
    corridor_pos: "করিডোর অবস্থান",
    approaching_station: "আসন্ন স্টেশন",
    expected_eta: "প্রত্যাশিত ডায়নামিক আগমন (ETA)",
    confidence_window: "সময়সীমা:",
    timeline_title: "স্টেশন টাইমলাইন",
    calibrated_bounds: "ক্যালিব্রেটেড সময়সীমা",
    sched: "নির্ধারিত:",
    train_here: "ট্রেন এখানে",
    why_eta: "এই ইটিএ কেন পূর্বাভাস করা হয়েছে?",
    xai_desc: "গ্রাফ নিউরাল নেটওয়ার্ক বিলম্ব ফ্যাক্টর বিশ্লেষণ",
    factor_headway: "আগের ট্রেনের দূরত্ব বিলম্ব:",
    factor_tsr: "সতর্কতামূলক গতি সীমাবদ্ধতা (TSR):",
    factor_dwell: "জংশন প্ল্যাটফর্ম অপেক্ষা:",
    multimodal_title: "লাস্ট-মাইল অটো ক্যাব বুকিং ও সংযোগ",
    multimodal_desc: "ট্রেন কাছাকাছি পৌঁছালে এবং আগমন সময় ±৫ মিনিটের মধ্যে নিশ্চিত হলে স্বয়ংক্রিয়ভাবে ক্যাব বা মেসেজ পাঠানো হয়।",
    enable_dispatch: "অটো ডিসপ্যাচ চালু করুন",
    station_board_title: "লাইভ স্টেশন বোর্ড",
    occ_title: "অপারেশন কন্ট্রোল সেন্টার (OCC) — ভারতীয় রেল",
    occ_desc: "রিয়েল-টাইম নেটওয়ার্ক জিএনএন সিদ্ধান্ত সমর্থন ব্যবস্থা",
    tab_corridor: "করিডোর নেটওয়ার্ক মানচিত্র",
    tab_whatif: "হোয়াট-ইফ ডিসপ্যাচ স্যান্ডবক্স",
    tab_benchmarks: "মডেল পারফরম্যান্স বেঞ্চমার্ক",
    whatif_title: "ওসিসি সিদ্ধান্ত সমর্থন — সিমুলেটর",
    whatif_desc: "নেটওয়ার্ক বিলম্বের পূর্বাভাস পেতে কাল্পনিক স্টপেজ পরীক্ষা করুন।",
    simulate_btn: "বিলম্ব সিমুলেট করুন",
    simulating_btn: "সিমুলেশন চলছে...",
    impacted_trains: "প্রভাবিত ট্রেন",
    total_cascade: "মোট নেটওয়ার্ক বিলম্ব",
    health_score: "নেটওয়ার্ক হেলথ স্কোর",
    recommendations_title: "নিয়ন্ত্রক সুপারিশ",
    ai_memo_title: "এআই ডিসপ্যাচ মেমো (মিস্ট্রাল এআই)",
    gen_memo_btn: "মেমো তৈরি করুন",
    copilot_title: "রেলপালস এআই কোপাইলট",
    copilot_desc: "লাইভ টেলিমেট্রি চালিত",
    copilot_input_placeholder: "এই ট্রেন সম্পর্কে জিজ্ঞাসা করুন...",
    ask_why_delayed: "ট্রেন দেরি কেন?",
    ask_connection: "কানেকশন পাব কি?",
    ask_window: "সময়সীমা ব্যাখ্যা করুন"
  },
  mr: {
    app_subtitle: "डायनॅमिक ईटीए आणि नियंत्रण मंच",
    passenger_view: "प्रवासी दृश्य",
    admin_view: "नियंत्रण कक्ष (अ‍ॅडमिन)",
    telemetry_label: "जीएनएन टेलिमेट्री:",
    hero_title: "थेट ट्रेन ट्रॅकिंग आणि मल्टीमॉडल सोबती",
    hero_desc: "ग्राफ न्यूरल नेटवर्क (GNN) द्वारे अचूक आगमन वेळ. स्थानकावर पोहोचण्यापूर्वी जाणून घ्या अचूक वेळ.",
    active_trains_title: "सक्रिय कॉरिडोअर एक्सप्रेस गाड्या",
    on_time: "वेळेवर धावत आहे",
    delayed: "उशीर सुमारे",
    mins: "मि",
    current_speed: "सध्याचा वेग",
    current_track: "सध्याचा ट्रॅक",
    corridor_pos: "कॉरिडोअर स्थिती",
    approaching_station: "पुढील स्थानक",
    expected_eta: "अपेक्षित आगमन वेळ (ETA)",
    confidence_window: "वेळ मर्यादा:",
    timeline_title: "स्थानक प्रगती टाइमलाइन",
    calibrated_bounds: "अचूक कॉन्फॉर्मल मर्यादा",
    sched: "नियोजित:",
    train_here: "गाडी येथे आहे",
    why_eta: "हा ईटीए अंदाज का लावला गेला?",
    xai_desc: "ग्राफ न्यूरल नेटवर्क विलंब घटक विश्लेषण",
    factor_headway: "पुढील गाडीमुळे विलंब:",
    factor_tsr: "सावधानता गती मर्यादा (TSR):",
    factor_dwell: "जंक्शन प्लॅटफॉर्म प्रतीक्षा:",
    multimodal_title: "शेवटच्या टप्प्यातील ऑटो-कॅब डिस्पॅच",
    multimodal_desc: "ट्रेन जवळ आल्यावर आणि वेळ ±५ मिनिटांच्या आत निश्चित झाल्यावर स्वयंचलित कॅब किंवा संदेश पाठवला जातो.",
    enable_dispatch: "ऑटो अलर्ट सक्षम करा",
    station_board_title: "थेट स्थानक आगमन फलक",
    occ_title: "ऑपरेशन्स कंट्रोल सेंटर (OCC)",
    occ_desc: "रिअल-टाइम नेटवर्क जीएनएन इन्फरन्स व निर्णय प्रणाली",
    tab_corridor: "कॉरिडोअर नेटवर्क नकाशा",
    tab_whatif: "व्हॉट-इफ डिस्पॅच सँडबॉक्स",
    tab_benchmarks: "मॉडेल बेंचमार्क",
    whatif_title: "ओसीसी निर्णय सहाय्य — सिम्युलेटर",
    whatif_desc: "नेटवर्क विलंबाचा अंदाज घेण्यासाठी काल्पनिक हॉल्ट तपासा.",
    simulate_btn: "सिम्युलेशन सुरू करा",
    simulating_btn: "सिम्युलेशन सुरू आहे...",
    impacted_trains: "बाधित गाड्या",
    total_cascade: "एकूण विलंब",
    health_score: "नेटवर्क आरोग्य स्कोर",
    recommendations_title: "नियंत्रक शिफारसी",
    ai_memo_title: "एआय डिस्पॅच मेमो (मिस्ट्रल एआय)",
    gen_memo_btn: "डिस्पॅच मेमो तयार करा",
    copilot_title: "रेलपल्स एआय कोपायलट",
    copilot_desc: "थेट टेलिमेट्रीवर आधारित",
    copilot_input_placeholder: "या गाडीबद्दल काहीही विचारा...",
    ask_why_delayed: "गाडी उशिरा का आहे?",
    ask_connection: "कनेक्टिंग गाडी मिळेल का?",
    ask_window: "वेळेची मर्यादा समजावून सांगा"
  },
  ta: {
    app_subtitle: "இயக்கவியல் ஈடிஏ மற்றும் செயல்பாட்டு தளம்",
    passenger_view: "பயணிகள் பார்வை",
    admin_view: "கட்டுப்பாட்டு அறை (அட்மின்)",
    telemetry_label: "GNN டெலிமெட்ரி:",
    hero_title: "நேரடி ரயில் கண்காணிப்பு & துணை",
    hero_desc: "வரைபட நியூரல் நெட்வொர்க் (GNN) மூலம் துல்லியமான வருகை நேரம்.",
    active_trains_title: "செயலில் உள்ள ரயில்கள்",
    on_time: "சரியான நேரத்தில்",
    delayed: "தாமதம் சுமார்",
    mins: "நிமிடம்",
    current_speed: "தற்போதைய வேகம்",
    current_track: "தற்போதைய பாதை",
    corridor_pos: "தொலைவு நிலை",
    approaching_station: "அடுத்த நிலையம்",
    expected_eta: "எதிர்பார்க்கப்படும் வருகை நேரம் (ETA)",
    confidence_window: "நேர வரம்பு:",
    timeline_title: "நிலைய காலவரிசை",
    calibrated_bounds: "துல்லிய வரம்புகள்",
    sched: "திட்டமிடப்பட்டது:",
    train_here: "ரயில் இங்கே உள்ளது",
    why_eta: "இந்த வருகை நேரம் ஏன் கணிக்கப்பட்டது?",
    xai_desc: "GNN தாமத காரணிகள்",
    factor_headway: "முந்தைய ரயில் இடைவெளி தாமதம்:",
    factor_tsr: "வேகக் கட்டுப்பாடு (TSR):",
    factor_dwell: "தளமேடை காத்திருப்பு:",
    multimodal_title: "தானியங்கி கார் முன்பதிவு & எச்சரிக்கை",
    multimodal_desc: "ரயில் நிலையத்தை நெருங்கும்போது தானாகவே டாக்ஸி முன்பதிவு செய்யப்படுகிறது.",
    enable_dispatch: "தானியங்கி சேவையை இயக்கு",
    station_board_title: "நிலைய வருகை பலகை",
    occ_title: "செயல்பாட்டு கட்டுப்பாட்டு மையம் (OCC)",
    occ_desc: "நிகழ்நேர நெட்வொர்க் GNN கணிப்பு முறைமை",
    tab_corridor: "பாதை வரைபடம்",
    tab_whatif: "சிமுலேஷன் மணல்தொட்டி",
    tab_benchmarks: "மாதிரி மதிப்பீடு",
    whatif_title: "OCC முடிவெடுக்கும் உதவி சிமுலேட்டர்",
    whatif_desc: "தாமதங்களை முன்கூட்டியே கணிக்கவும்.",
    simulate_btn: "சிமுலேட் செய்",
    simulating_btn: "சிமுலேஷன் நடக்கிறது...",
    impacted_trains: "பாதிக்கப்பட்ட ரயில்கள்",
    total_cascade: "மொத்த தாமதம்",
    health_score: "நெட்வொர்க் நிலை",
    recommendations_title: "பரிந்துரைகள்",
    ai_memo_title: "AI கட்டுப்பாட்டாளர் குறிப்பு (Mistral AI)",
    gen_memo_btn: "குறிப்பை உருவாக்கு",
    copilot_title: "RailPulse AI உதவியாளர்",
    copilot_desc: "நேரடி தகவல் அடிப்படையில்",
    copilot_input_placeholder: "ரயில் பற்றிய கேள்விகளைக் கேளுங்கள்...",
    ask_why_delayed: "ரயில் ஏன் தாமதமாகிறது?",
    ask_connection: "இணைப்பு ரயிலைப் பிடிக்க முடியுமா?",
    ask_window: "நேர வரம்பை விளக்குங்கள்"
  },
  te: {
    app_subtitle: "డైనమిక్ ఈటీఏ మరియు కార్యకలాపాల వ్యవస్థ",
    passenger_view: "ప్రయాణీకుల వీక్షణ",
    admin_view: "కంట్రోల్ రూమ్ (అడ్మిన్)",
    telemetry_label: "GNN టెలిమెట్రీ:",
    hero_title: "లైవ్ రైలు ట్రాకింగ్ మరియు ప్రయాణ సహాయకుడు",
    hero_desc: "గ్రాఫ్ న్యూరల్ నెట్‌వర్క్ (GNN) ద్వారా ఖచ్చితమైన రైలు రాక సమయ సమాచారం.",
    active_trains_title: "నడుస్తున్న ఎక్స్‌ప్రెస్ రైళ్లు",
    on_time: "సమయానికి నడుస్తోంది",
    delayed: "ఆలస్యం సుమారు",
    mins: "నిమిషాలు",
    current_speed: "ప్రస్తుత వేగం",
    current_track: "ప్రస్తుత ట్రాక్",
    corridor_pos: "కారిడార్ స్థానం",
    approaching_station: "చేరుకుంటున్న స్టేషన్",
    expected_eta: "అంచనా రాక సమయం (ETA)",
    confidence_window: "సమయ పరిధి:",
    timeline_title: "స్టేషన్ టైమ్‌లైన్",
    calibrated_bounds: "ఖచ్చితమైన పరిమితులు",
    sched: "షెడ్యూల్:",
    train_here: "రైలు ఇక్కడే ఉంది",
    why_eta: "ఈ ETA ఎందుకు అంచనా వేయబడింది?",
    xai_desc: "GNN ఆలస్య కారకాల విశ్లేషణ",
    factor_headway: "ముందు రైలు కారణంగా ఆలస్యం:",
    factor_tsr: "వేగ పరిమితులు (TSR):",
    factor_dwell: "ప్లాట్‌ఫారమ్ నిరీక్షణ:",
    multimodal_title: "చివరి మైలు ఆటో క్యాబ్ బుకింగ్",
    multimodal_desc: "రైలు చేరువలోకి వచ్చినప్పుడు ఆటోమేటిక్‌గా క్యాబ్ బుకింగ్ లేదా మెసేజ్ అందుతుంది.",
    enable_dispatch: "ఆటో అలర్ట్ ప్రారంభించండి",
    station_board_title: "లైవ్ స్టేషన్ బోర్డు",
    occ_title: "ఆపరేషన్స్ కంట్రోల్ సెంటర్ (OCC)",
    occ_desc: "రియల్-టైమ్ నెట్‌వర్క్ GNN విశ్లేషణ",
    tab_corridor: "కారిడార్ మ్యాప్",
    tab_whatif: "వాట్-ఇఫ్ సిమ్యులేటర్",
    tab_benchmarks: "మోడల్ పనితీరు",
    whatif_title: "OCC నిర్ణయ మద్దతు సిమ్యులేటర్",
    whatif_desc: "నెట్‌వర్క్ అంతటా ఆలస్యాలను అంచనా వేయండి.",
    simulate_btn: "సిమ్యులేట్ చేయండి",
    simulating_btn: "సిమ్యులేషన్ నడుస్తోంది...",
    impacted_trains: "ప్రభావిత రైళ్లు",
    total_cascade: "మొత్తం ఆలస్యం",
    health_score: "నెట్‌వర్క్ ఆరోగ్యం",
    recommendations_title: "కంట్రోలర్ సిఫార్సులు",
    ai_memo_title: "AI డిస్పాచ్ మెమో (Mistral AI)",
    gen_memo_btn: "మెమో రూపొందించండి",
    copilot_title: "రైల్‌పల్స్ AI కోపైలట్",
    copilot_desc: "లైవ్ టెలిమెట్రీ ఆధారం",
    copilot_input_placeholder: "రైలు గురించి ఏదైనా అడగండి...",
    ask_why_delayed: "రైలు ఎందుకు ఆలస్యమైంది?",
    ask_connection: "కనెక్టింగ్ రైలు దొరుకుతుందా?",
    ask_window: "సమయ పరిధిని వివరించండి"
  }
};

const state = {
  currentRole: 'passenger', // 'passenger' | 'admin'
  adminTab: 'corridor',     // 'corridor' | 'whatif' | 'injector' | 'benchmark' | 'feeder'
  currentLang: 'en',        // 'en' | 'hi' | 'bn' | 'mr' | 'ta' | 'te'
  currentTheme: 'dark',     // 'dark' | 'light'
  trains: [],
  stations: [],
  selectedTrainNo: '12301',
  selectedStationCode: 'CNB',
  etaData: null,
  explainData: null,
  simulatorState: null,
  whatifResult: null,
  copilotMessages: [
    {
      sender: 'bot',
      text: 'Hello! I am **RailPulse AI Copilot**, powered by **Mistral AI** & Indian Railways live GNN telemetry. Ask me anything about your journey!',
      source: 'MISTRAL_AI'
    }
  ]
};

// API Helpers
async function apiGet(endpoint) {
  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error(`API GET error on ${endpoint}:`, e);
    return null;
  }
}

async function apiPost(endpoint, body) {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error(`API POST error on ${endpoint}:`, e);
    return null;
  }
}

// Initialization
async function initApp() {
  // Load stations & trains
  const [stList, trList] = await Promise.all([
    apiGet('/api/v1/stations'),
    apiGet('/api/v1/trains')
  ]);

  if (stList) state.stations = stList;
  if (trList) state.trains = trList;

  renderStationSelectDropdowns();
  renderTrainChips();
  renderCorridorMap();
  await loadTrainEtaAndExplain();

  // Start continuous simulation poll
  setInterval(pollTelemetry, 1800);
  setInterval(loadTrainEtaAndExplain, 3000);
}

// Telemetry Polling
async function pollTelemetry() {
  const sim = await apiGet('/api/v1/simulator/state');
  if (sim) {
    state.simulatorState = sim;
    if (sim.trains) {
      state.trains = sim.trains;
      renderTrainChips();
      renderHeroStatusCard();
      if (state.currentRole === 'admin') {
        renderCorridorMap();
      }
    }
    // Update live clock
    const clockEl = document.getElementById('sim-clock');
    if (clockEl) {
      const mins = Math.floor(sim.simulation_time_sec / 60);
      const secs = Math.floor(sim.simulation_time_sec % 60);
      clockEl.textContent = `${mins}m ${secs}s`;
    }
  }
}

// Load dynamic ETA and explainability for current train
async function loadTrainEtaAndExplain() {
  if (!state.selectedTrainNo) return;
  const [eta, explain] = await Promise.all([
    apiGet(`/api/v1/train/${state.selectedTrainNo}/eta?model_type=CORE_GNN_SPATIAL`),
    apiGet(`/api/v1/train/${state.selectedTrainNo}/eta/explain`)
  ]);

  if (eta) {
    state.etaData = eta;
    renderHeroStatusCard();
    renderVerticalTimeline();
  }
  if (explain) {
    state.explainData = explain;
    renderExplainabilityCard();
  }
}

// Role Switcher (Passenger vs OCC Admin)
function setRole(role) {
  state.currentRole = role;
  const btnPassenger = document.getElementById('btn-role-passenger');
  const btnAdmin = document.getElementById('btn-role-admin');
  const viewPassenger = document.getElementById('passenger-view');
  const viewAdmin = document.getElementById('admin-view');

  if (role === 'passenger') {
    btnPassenger.className = 'role-btn active-passenger';
    btnAdmin.className = 'role-btn';
    viewPassenger.style.display = 'block';
    viewAdmin.style.display = 'none';
  } else {
    btnPassenger.className = 'role-btn';
    btnAdmin.className = 'role-btn active-admin';
    viewPassenger.style.display = 'none';
    viewAdmin.style.display = 'block';
    renderCorridorMap();
  }
}

// Admin Sub-Tab Switcher
function setAdminTab(tab) {
  state.adminTab = tab;
  document.querySelectorAll('.admin-tab-btn').forEach(b => {
    b.className = 'btn btn-secondary admin-tab-btn';
  });
  const activeBtn = document.getElementById(`tab-btn-${tab}`);
  if (activeBtn) activeBtn.className = 'btn btn-indigo admin-tab-btn';

  document.querySelectorAll('.admin-pane').forEach(p => p.style.display = 'none');
  const activePane = document.getElementById(`pane-${tab}`);
  if (activePane) activePane.style.display = 'block';

  if (tab === 'corridor') renderCorridorMap();
}

// Render Popular Train Selection Chips
function renderTrainChips() {
  const container = document.getElementById('train-chips-container');
  if (!container) return;

  container.innerHTML = state.trains.map(t => {
    const isSelected = t.train_no === state.selectedTrainNo;
    const delay = Math.round(t.delay_minutes || 0);
    const isLate = delay > 5;
    return `
      <div onclick="selectTrain('${t.train_no}')" class="rp-card rp-card-interactive ${isSelected ? 'rp-card-selected' : ''}" style="padding: 7px 12px; flex-shrink: 0; display: inline-flex; align-items: center; gap: 8px;">
        <div>
          <div class="row" style="gap: 5px;">
            <span class="font-mono" style="font-weight: 700; font-size: 0.85rem; color: ${isSelected ? 'var(--brand-primary-light)' : 'var(--text-primary)'};">${t.train_no}</span>
            <span class="badge ${isLate ? 'badge-yellow' : 'badge-green'}">${isLate ? `+${delay}m` : 'OK'}</span>
          </div>
          <div style="font-size: 0.68rem; color: var(--text-muted);">${t.train_name ? t.train_name.split(' ')[0] : 'Express'}</div>
        </div>
      </div>
    `;
  }).join('');
}

function selectTrain(trainNo) {
  state.selectedTrainNo = trainNo;
  renderTrainChips();
  loadTrainEtaAndExplain();
}

// Render Hero Live Status Card
function renderHeroStatusCard() {
  const train = state.trains.find(t => t.train_no === state.selectedTrainNo) || state.trains[0];
  if (!train) return;

  const delay = Math.round(train.delay_minutes || 0);
  const isLate = delay > 5;

  document.getElementById('hero-train-no').textContent = train.train_no;
  document.getElementById('hero-train-name').textContent = train.train_name || `Train ${train.train_no}`;
  document.getElementById('hero-train-route').innerHTML = `${train.source || 'NDLS'} → ${train.destination || 'HWH'} • ${train.type || 'Express'}`;
  
  const statusBadge = document.getElementById('hero-status-badge');
  statusBadge.className = `badge ${isLate ? 'badge-yellow' : 'badge-green'}`;
  statusBadge.textContent = isLate ? `Delayed ~${delay} min` : 'On Time';

  document.getElementById('hero-speed').textContent = Math.round(train.speed_kmph || 0);
  document.getElementById('hero-section').textContent = train.current_section || 'Mainline Track';
  document.getElementById('hero-distance').textContent = Math.round(train.current_distance_km || 0);

  // Next Stop Spotlight
  const stops = state.etaData?.stops_timeline || [];
  const nextStop = stops.find(s => s.status === 'UPCOMING') || stops[stops.length - 1];
  if (nextStop) {
    document.getElementById('spotlight-station-name').textContent = `${nextStop.station_name} (${nextStop.station_code})`;
    document.getElementById('spotlight-station-meta').textContent = `${nextStop.dist_remaining_km} km away • Sched: ${nextStop.sched_arrival}`;
    document.getElementById('spotlight-eta').textContent = nextStop.expected_eta;
    document.getElementById('spotlight-eta').style.color = isLate ? 'var(--status-amber)' : 'var(--status-green)';
    document.getElementById('spotlight-window').textContent = `Window: ${nextStop.eta_window}`;
  }
}

// Render Where Is My Train-Style Vertical Timeline
function renderVerticalTimeline() {
  const timelineEl = document.getElementById('vertical-timeline');
  if (!timelineEl) return;

  const stops = state.etaData?.stops_timeline || [];
  timelineEl.innerHTML = stops.map(stop => {
    const isPassed = stop.status === 'PASSED';
    const isCurrent = stop.status === 'CURRENT';
    const isUpcoming = stop.status === 'UPCOMING';
    const isLate = (stop.predicted_delay_min || 0) > 5;

    return `
      <div class="journey-step">
        <div class="journey-dot ${isPassed ? 'passed' : (isCurrent ? 'current' : 'upcoming')}"></div>
        <div class="timeline-row ${isCurrent ? 'current' : (isPassed ? 'passed' : '')}">
          <div>
            <div class="row" style="gap:6px;">
              <span class="font-mono" style="font-weight:700; font-size:0.88rem; color:${isCurrent ? 'var(--brand-primary-light)' : 'var(--text-primary)'};">${stop.station_code}</span>
              <span style="font-size:0.82rem; font-weight:600;">${stop.station_name}</span>
              ${isCurrent ? '<span class="badge badge-blue">Here</span>' : ''}
            </div>
            <div style="font-size:0.68rem; color:var(--text-muted); margin-top:1px;">
              ${stop.distance_km} km${isUpcoming ? ` (${stop.dist_remaining_km} km left)` : ''}
            </div>
          </div>
          <div style="text-align:right;">
            <div class="row" style="gap:6px; justify-content:flex-end;">
              <span style="font-size:0.68rem; color:var(--text-muted);"><span class="font-mono">${stop.sched_arrival}</span></span>
              <span class="font-mono" style="font-size:0.92rem; font-weight:700; color:${isLate ? 'var(--status-amber)' : 'var(--status-green)'};">${stop.expected_eta}</span>
            </div>
            ${isUpcoming ? `<div style="font-size:0.65rem; color:var(--text-muted); margin-top:1px;">${stop.eta_window}</div>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Render Explainability Breakdown Card
function renderExplainabilityCard() {
  const summaryEl = document.getElementById('explain-summary');
  if (summaryEl && state.explainData) {
    summaryEl.textContent = state.explainData.executive_summary || "Train is progressing smoothly with clear signal blocks ahead.";
  }

  const pcts = state.explainData?.factor_percentages;
  if (pcts) {
    const headwayEl = document.getElementById('pct-headway');
    const tsrEl = document.getElementById('pct-tsr');
    const dwellEl = document.getElementById('pct-dwell');
    
    if (headwayEl) {
      headwayEl.textContent = `${pcts.cascading_headway_pct}%`;
      document.getElementById('bar-headway').style.width = `${pcts.cascading_headway_pct}%`;
    }
    if (tsrEl) {
      tsrEl.textContent = `${pcts.speed_restrictions_pct}%`;
      document.getElementById('bar-tsr').style.width = `${pcts.speed_restrictions_pct}%`;
    }
    if (dwellEl) {
      dwellEl.textContent = `${pcts.platform_dwell_pct}%`;
      document.getElementById('bar-dwell').style.width = `${pcts.platform_dwell_pct}%`;
    }
  }
}

// Render Corridor SVG Track Map (OCC Admin)
function renderCorridorMap() {
  const mapSvg = document.getElementById('corridor-svg-track');
  if (!mapSvg) return;

  const sorted = (state.stations && state.stations.length > 0)
    ? [...state.stations].sort((a, b) => a.corridor_km - b.corridor_km)
    : [
        { station_code: 'NDLS', station_name: 'New Delhi', corridor_km: 0.0, platforms: 16 },
        { station_code: 'GZB', station_name: 'Ghaziabad', corridor_km: 25.4, platforms: 6 },
        { station_code: 'ALJN', station_name: 'Aligarh', corridor_km: 131.0, platforms: 7 },
        { station_code: 'TDL', station_name: 'Tundla', corridor_km: 209.0, platforms: 7 },
        { station_code: 'ETW', station_name: 'Etawah', corridor_km: 300.7, platforms: 5 },
        { station_code: 'CNB', station_name: 'Kanpur Central', corridor_km: 440.0, platforms: 10 },
        { station_code: 'FTP', station_name: 'Fatehpur', corridor_km: 518.0, platforms: 4 },
        { station_code: 'PRYJ', station_name: 'Prayagraj', corridor_km: 634.0, platforms: 10 },
        { station_code: 'MZP', station_name: 'Mirzapur', corridor_km: 723.0, platforms: 4 },
        { station_code: 'DDU', station_name: 'Pt. Deen Dayal Upadhyaya', corridor_km: 792.0, platforms: 8 },
        { station_code: 'BXR', station_name: 'Buxar', corridor_km: 886.0, platforms: 3 },
        { station_code: 'ARA', station_name: 'Ara Jn', corridor_km: 954.0, platforms: 4 },
        { station_code: 'DNR', station_name: 'Danapur', corridor_km: 994.0, platforms: 5 },
        { station_code: 'PNBE', station_name: 'Patna Jn', corridor_km: 1004.0, platforms: 10 },
        { station_code: 'MKA', station_name: 'Mokama', corridor_km: 1093.0, platforms: 4 },
        { station_code: 'KIUL', station_name: 'Kiul Jn', corridor_km: 1127.0, platforms: 5 },
        { station_code: 'JSME', station_name: 'Jasidih Jn', corridor_km: 1225.0, platforms: 5 },
        { station_code: 'ASN', station_name: 'Asansol Jn', corridor_km: 1336.0, platforms: 7 },
        { station_code: 'HWH', station_name: 'Howrah', corridor_km: 1532.0, platforms: 23 }
      ];

  const maxKm = sorted[sorted.length - 1].corridor_km || 1532.0;
  const width = 1200;
  const paddingX = 70;
  const trackY = 135;

  const getX = (km) => paddingX + ((km / maxKm) * (width - 2 * paddingX));

  // Signal blocks between stations
  let signalsSvg = '';
  for (let i = 0; i < sorted.length - 1; i++) {
    const x1 = getX(sorted[i].corridor_km);
    const x2 = getX(sorted[i + 1].corridor_km);
    const midX = (x1 + x2) / 2;
    // Check if any train is currently in this section
    const hasOccupant = (state.trains || []).some(tr => {
      const d = tr.current_distance_km || 0;
      return d >= sorted[i].corridor_km && d < sorted[i + 1].corridor_km;
    });
    const sigColor = hasOccupant ? '#f59e0b' : '#10b981';

    signalsSvg += `
      <g transform="translate(${midX}, ${trackY - 26})">
        <circle r="3.5" fill="${sigColor}" stroke="#0b1120" stroke-width="1" />
        <line x1="0" y1="3.5" x2="0" y2="8" stroke="#475569" stroke-width="1" />
      </g>
    `;
  }

  // Station Nodes
  const stationsSvg = sorted.map((st, i) => {
    const cx = getX(st.corridor_km);
    const isMajor = (st.platforms || 4) >= 7 || ['NDLS', 'CNB', 'PRYJ', 'DDU', 'PNBE', 'HWH'].includes(st.station_code);
    const isSelected = st.station_code === state.selectedStationCode;

    return `
      <g style="cursor: pointer;" onclick="selectStation('${st.station_code}')">
        <!-- Station Drop Line -->
        <line x1="${cx}" y1="${trackY - 35}" x2="${cx}" y2="${trackY + 35}" stroke="${isSelected ? '#38bdf8' : (isMajor ? '#0284c7' : '#334155')}" stroke-width="${isSelected ? '2' : (isMajor ? '1.5' : '1')}" opacity="${isMajor ? '0.8' : '0.4'}" stroke-dasharray="${isMajor ? 'none' : '2 2'}" />
        
        <!-- Outer Halo for Major / Selected -->
        ${(isMajor || isSelected) ? `<circle cx="${cx}" cy="${trackY}" r="${isSelected ? '11' : '8'}" fill="none" stroke="${isSelected ? '#38bdf8' : '#0ea5e9'}" stroke-width="2" opacity="0.6" />` : ''}
        
        <!-- Core Node -->
        <circle cx="${cx}" cy="${trackY}" r="${isMajor ? '6' : '4'}" fill="${isSelected ? '#38bdf8' : (isMajor ? '#0284c7' : '#1e293b')}" stroke="${isMajor ? '#e2e8f0' : '#64748b'}" stroke-width="1.5" />
        
        <!-- Station Code Label -->
        <text x="${cx}" y="${i % 2 === 0 ? trackY - 44 : trackY + 54}" text-anchor="middle" fill="${isSelected ? '#38bdf8' : (isMajor ? '#ffffff' : '#94a3b8')}" font-size="${isMajor ? '11px' : '9px'}" font-weight="${isMajor ? '800' : '600'}" font-family="var(--font-mono)">
          ${st.station_code}
        </text>

        <!-- Distance label -->
        <text x="${cx}" y="${i % 2 === 0 ? trackY - 56 : trackY + 66}" text-anchor="middle" fill="#64748b" font-size="7.5px" font-family="var(--font-mono)">
          ${Math.round(st.corridor_km)}k
        </text>
      </g>
    `;
  }).join('');

  // Active Moving Train Markers
  const trainsSvg = (state.trains || []).map(tr => {
    const km = tr.current_distance_km || 0;
    const tx = Math.min(Math.max(getX(km), paddingX), width - paddingX);
    const isDown = tr.direction === 'DOWN';
    const ty = isDown ? trackY - 14 : trackY + 14;
    const isSelected = tr.train_no === state.selectedTrainNo;
    const isLate = (tr.delay_minutes || 0) > 15;
    const color = isSelected ? '#3aa0f7' : (isLate ? '#ef4444' : '#22c55e');
    const speed = Math.round(tr.speed_kmph || 0);

    return `
      <g transform="translate(${tx}, ${ty})" style="cursor: pointer;" onclick="selectTrain('${tr.train_no}')">
        <!-- Glowing Pulse for Selected Train -->
        ${isSelected ? `<circle r="18" fill="rgba(14, 165, 233, 0.25)" stroke="#0ea5e9" stroke-width="2" />` : ''}
        
        <!-- Train Body Capsule -->
        <rect x="-14" y="-8" width="28" height="16" rx="5" fill="#0b1120" stroke="${color}" stroke-width="${isSelected ? '2.5' : '1.5'}" />
        
        <!-- Direction Arrow -->
        <path d="${isDown ? 'M -4 -3 L 4 0 L -4 3 Z' : 'M 4 -3 L -4 0 L 4 3 Z'}" fill="${color}" />
        
        <!-- Floating HUD Tag -->
        <g transform="translate(0, ${isDown ? -20 : 22})">
          <rect x="-24" y="-9" width="48" height="15" rx="6" fill="rgba(15, 23, 42, 0.95)" stroke="${color}" stroke-width="1" />
          <text x="0" y="2" text-anchor="middle" fill="#ffffff" font-size="8.5px" font-weight="800" font-family="var(--font-mono)">${tr.train_no} (${speed}k)</text>
        </g>
      </g>
    `;
  }).join('');

  mapSvg.innerHTML = `
    <!-- Decorative Grid & Ballast -->
    <rect x="${paddingX - 20}" y="${trackY - 24}" width="${width - 2 * paddingX + 40}" height="48" rx="8" fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
    
    <!-- Sleepers (Ties) -->
    ${Array.from({ length: 45 }).map((_, idx) => {
      const sx = paddingX + (idx / 44) * (width - 2 * paddingX);
      return `<line x1="${sx}" y1="${trackY - 18}" x2="${sx}" y2="${trackY + 18}" stroke="#1e293b" stroke-width="1.5" opacity="0.6" />`;
    }).join('')}

    <!-- Mainline Track 1 (DOWN - NDLS to HWH) -->
    <line x1="${paddingX}" y1="${trackY - 14}" x2="${width - paddingX}" y2="${trackY - 14}" stroke="#0078d4" stroke-width="2.5" />
    
    <!-- Mainline Track 2 (UP - HWH to NDLS) -->
    <line x1="${paddingX}" y1="${trackY + 14}" x2="${width - paddingX}" y2="${trackY + 14}" stroke="#64748b" stroke-width="2" stroke-dasharray="6 3" />
    
    <!-- Overhead Electrification (Catenary Wire) -->
    <line x1="${paddingX}" y1="${trackY - 28}" x2="${width - paddingX}" y2="${trackY - 28}" stroke="#3aa0f7" stroke-width="0.8" stroke-dasharray="3 3" opacity="0.3" />

    <!-- Signal Blocks -->
    ${signalsSvg}

    <!-- Station Nodes & Labels -->
    ${stationsSvg}

    <!-- Active Trains -->
    ${trainsSvg}
  `;
}

// Station Selection & Arrivals Board
function renderStationSelectDropdowns() {
  const selects = document.querySelectorAll('.station-select-dropdown');
  selects.forEach(sel => {
    sel.innerHTML = state.stations.map(s => `
      <option value="${s.station_code}" ${s.station_code === state.selectedStationCode ? 'selected' : ''}>
        ${s.station_code} — ${s.station_name}
      </option>
    `).join('');
  });
}

async function selectStation(stCode) {
  state.selectedStationCode = stCode;
  renderStationSelectDropdowns();
  const arrivalsData = await apiGet(`/api/v1/station/${stCode}/arrivals`);
  renderStationArrivalsList(arrivalsData);
}

function renderStationArrivalsList(data) {
  const container = document.getElementById('station-arrivals-list');
  if (!container || !data) return;

  document.getElementById('station-board-name').textContent = data.station_name || state.selectedStationCode;
  document.getElementById('station-board-meta').textContent = `Total Platforms: ${data.total_platforms || 10} • Approaching: ${data.active_arrivals_count || 0}`;

  if (data.arrivals && data.arrivals.length > 0) {
    container.innerHTML = data.arrivals.map(arr => `
      <div class="rp-card" style="padding:8px 12px;">
        <div class="row-between" style="flex-wrap:wrap; gap:6px;">
          <div class="row" style="gap:8px;">
            <span class="font-mono" style="font-weight:700; color:var(--brand-primary-light);">${arr.train_no}</span>
            <span class="badge badge-purple">${arr.platform}</span>
            <span style="font-size:0.8rem; font-weight:600;">${arr.train_name}</span>
          </div>
          <div class="row" style="gap:10px;">
            <span style="font-size:0.7rem; color:var(--text-muted);"><span class="font-mono">${arr.scheduled_arrival}</span></span>
            <span class="font-mono" style="font-size:0.88rem; font-weight:700; color:${arr.predicted_delay_min > 5 ? 'var(--status-amber)' : 'var(--status-green)'};">${arr.expected_eta}</span>
            <span class="badge badge-blue">${arr.status}</span>
          </div>
        </div>
      </div>
    `).join('');
  } else {
    container.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-muted);">No arrivals scheduled right now.</div>`;
  }
}

// What-If Simulation Trigger
async function runWhatIf() {
  const trainNo = document.getElementById('whatif-train').value;
  const stationCode = document.getElementById('whatif-station').value;
  const holdMin = parseFloat(document.getElementById('whatif-hold').value || 20);

  const btn = document.getElementById('btn-run-whatif');
  btn.textContent = 'Simulating GNN Propagation...';
  btn.disabled = true;

  const result = await apiPost('/api/v1/whatif', {
    target_train_no: trainNo || null,
    target_station_code: stationCode,
    additional_hold_min: holdMin
  });

  btn.textContent = 'Simulate Cascading Impact';
  btn.disabled = false;

  if (result) {
    state.whatifResult = result;
    renderWhatIfResults(result);
  }
}

function renderWhatIfResults(res) {
  const container = document.getElementById('whatif-results-container');
  if (!container) return;

  container.style.display = 'block';
  document.getElementById('whatif-impacted-count').textContent = `${res.impact_summary.total_trains_impacted} Trains`;
  document.getElementById('whatif-delay-total').textContent = `+${res.impact_summary.total_network_delay_minutes} min`;
  document.getElementById('whatif-health-score').textContent = `${res.impact_summary.network_health_score} / 100`;

  // Mitigations
  const recList = document.getElementById('whatif-mitigations-list');
  recList.innerHTML = res.recommended_mitigations.map(m => `<li>${m}</li>`).join('');

  // Table
  const table = document.getElementById('whatif-trains-table');
  table.innerHTML = res.impacted_trains.map(tr => `
    <div style="display: grid; grid-template-columns: 110px 1fr 120px 120px 90px; align-items: center; padding: 10px 14px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.82rem;">
      <span class="font-mono" style="font-weight: 700; color: var(--brand-primary-light);">${tr.train_no}</span>
      <div><strong>${tr.train_name}</strong> <span style="font-size: 0.7rem; color: var(--text-muted);">(${tr.impact_type})</span></div>
      <div>Orig: <span class="font-mono">${tr.original_delay_min}m</span></div>
      <div style="font-weight: 700; color: #fbbf24;">Sim: <span class="font-mono">${tr.simulated_delay_min}m</span></div>
      <div style="text-align: right;"><span class="badge ${tr.risk_level === 'CRITICAL' ? 'badge-red' : 'badge-yellow'}">+${tr.delay_delta_min}m</span></div>
    </div>
  `).join('');
}

// Generate Mistral AI Dispatch Memo
async function generateAiDispatchMemo() {
  if (!state.whatifResult) return;
  const btn = document.getElementById('btn-gen-memo');
  btn.textContent = 'Mistral AI Generating Memo...';
  btn.disabled = true;

  const res = await apiPost('/api/v1/copilot/dispatch-memo', {
    whatif_scenario: state.whatifResult
  });

  btn.textContent = 'Generate Dispatch Memo';
  btn.disabled = false;

  if (res && res.memo) {
    const memoBox = document.getElementById('whatif-memo-box');
    memoBox.style.display = 'block';
    memoBox.textContent = res.memo;
  }
}

// AI Copilot Chat Controls
function toggleCopilot(open) {
  const drawer = document.getElementById('copilot-drawer');
  const launcher = document.getElementById('copilot-launcher');
  if (open) {
    drawer.style.display = 'flex';
    launcher.style.display = 'none';
  } else {
    drawer.style.display = 'none';
    launcher.style.display = 'flex';
  }
}

async function sendCopilotMessage(customText = null) {
  const input = document.getElementById('copilot-input');
  const text = customText || input.value;
  if (!text || !text.trim()) return;

  appendCopilotMessage('user', text);
  if (!customText) input.value = '';

  const typingEl = document.getElementById('copilot-typing');
  typingEl.style.display = 'flex';

  const res = await apiPost('/api/v1/copilot/chat', {
    message: text,
    train_no: state.selectedTrainNo
  });

  typingEl.style.display = 'none';

  if (res && res.response) {
    appendCopilotMessage('bot', res.response, res.source);
  } else {
    appendCopilotMessage('bot', 'Train is progressing safely on schedule with clear signals.');
  }
}

function appendCopilotMessage(sender, text, source) {
  const container = document.getElementById('copilot-messages');
  const isUser = sender === 'user';

  const html = `
    <div style="display: flex; flex-direction: column; align-items: ${isUser ? 'flex-end' : 'flex-start'};">
      <div style="max-width: 85%; padding: 10px 14px; border-radius: ${isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px'}; background: ${isUser ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : 'var(--bg-card)'}; color: #fff; font-size: 0.82rem; line-height: 1.5; border: ${isUser ? 'none' : '1px solid var(--border-color)'};">
        ${text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
      </div>
      ${source ? `<span style="font-size: 0.62rem; color: var(--text-muted); margin-top: 2px;">${source === 'MISTRAL_AI_LLM' ? '⚡ Mistral AI LLM' : '🛡️ Live GNN Grounded'}</span>` : ''}
    </div>
  `;

  container.insertAdjacentHTML('beforeend', html);
  container.scrollTop = container.scrollHeight;
}

// Feeder Alert Modal
function openFeederModal() {
  document.getElementById('feeder-modal').style.display = 'flex';
}

function closeFeederModal() {
  document.getElementById('feeder-modal').style.display = 'none';
}

async function submitFeederForm(e) {
  e.preventDefault();
  const name = document.getElementById('feeder-name').value;
  const phone = document.getElementById('feeder-phone').value;
  const mode = document.getElementById('feeder-mode').value;

  await apiPost('/api/v1/feeder/subscribe', {
    train_no: state.selectedTrainNo,
    destination_station: state.selectedStationCode || 'CNB',
    passenger_name: name,
    contact_or_webhook: phone,
    transport_mode: mode,
    threshold_window_min: 8
  });

  closeFeederModal();
  alert('Last-Mile Auto Alert successfully registered! You will receive a dispatch notification when your train is within 8 mins.');
}

// Multilingual i18n & Theme Switcher
function setLanguage(lang) {
  state.currentLang = lang;
  localStorage.setItem('railpulse_lang', lang);
  applyTranslations();
}

function applyTranslations() {
  const dict = i18n[state.currentLang] || i18n.en;
  
  // Update all [data-i18n] text
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  // Update input placeholders
  const copilotInput = document.getElementById('copilot-input');
  if (copilotInput && dict.copilot_input_placeholder) {
    copilotInput.placeholder = dict.copilot_input_placeholder;
  }

  // Update language select dropdown
  const langSelect = document.getElementById('lang-select');
  if (langSelect) {
    langSelect.value = state.currentLang;
  }

  // Re-render status cards with new language
  renderHeroStatusCard();
}

function toggleTheme() {
  const newTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
  state.currentTheme = newTheme;
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('railpulse_theme', newTheme);

  const themeIcon = document.getElementById('theme-toggle-icon');
  const themeText = document.getElementById('theme-toggle-text');
  if (themeIcon) {
    themeIcon.setAttribute('data-lucide', newTheme === 'dark' ? 'sun' : 'moon');
    if (window.lucide) lucide.createIcons();
  }
  if (themeText) {
    themeText.textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
  }
  renderCorridorMap();
}

function initThemeAndLang() {
  const savedTheme = localStorage.getItem('railpulse_theme') || 'dark';
  const savedLang = localStorage.getItem('railpulse_lang') || 'en';
  
  state.currentTheme = savedTheme;
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  state.currentLang = savedLang;
  applyTranslations();

  const themeText = document.getElementById('theme-toggle-text');
  if (themeText) {
    themeText.textContent = savedTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
  }
}

// Global window event bindings
window.onload = () => {
  initThemeAndLang();
  initApp();
};
window.setRole = setRole;
window.setAdminTab = setAdminTab;
window.setLanguage = setLanguage;
window.toggleTheme = toggleTheme;
window.selectTrain = selectTrain;
window.selectStation = selectStation;
window.runWhatIf = runWhatIf;
window.generateAiDispatchMemo = generateAiDispatchMemo;
window.toggleCopilot = toggleCopilot;
window.sendCopilotMessage = sendCopilotMessage;
window.openFeederModal = openFeederModal;
window.closeFeederModal = closeFeederModal;
window.submitFeederForm = submitFeederForm;

