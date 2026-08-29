import time
import requests
import json
from config import Config

class MistralAIService:
    def __init__(self):
        self.api_key = Config.MISTRAL_API_KEY
        self.model = Config.MISTRAL_MODEL
        self.api_url = "https://api.mistral.ai/v1/chat/completions"
        self._cache = {}  # lang -> (timestamp, data)

    def is_available(self):
        """Returns True if a Mistral API key is configured."""
        return bool(self.api_key and self.api_key.strip())

    def generate_advisory(self, district_status, isolated_count=0, isolated_pop=0, language='en'):
        """
        Generates tactical logistics intelligence advisory for disaster management
        and relief supply convoys in the selected language.
        """
        now = time.time()
        if language in self._cache:
            cache_time, cached_res = self._cache[language]
            if now - cache_time < 600.0:
                return cached_res
        prompt = (
            f"You are PathNER AI, an authoritative disaster logistics decision-support assistant for Northeast India.\n"
            f"Current Assessment:\n"
            f"- Cut-off Settlements: {isolated_count} ({isolated_pop:,} citizens stranded)\n"
            f"- High Hazard Sectors: {json.dumps(district_status)}\n"
            f"Provide a concise, military-grade 3-point emergency logistics directive:\n"
            f"1. Priority Corridor Clearance (PWD/BRO focus)\n"
            f"2. Relief Convoy Staging & Medical/Food Dispatch\n"
            f"3. Air-Drop & Emergency Evacuation Protocol\n"
            f"Target Language: {language.upper()} (English, Assamese, Bengali, or Hindi).\n"
            f"Keep it strictly tactical, clear, and without unnecessary filler."
        )

        if self.is_available():
            try:
                headers = {
                    "Authorization": f"Bearer {self.api_key.strip()}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": "You are PathNER AI, an authoritative disaster logistics decision-support assistant for Northeast India."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.3,
                    "max_tokens": 400
                }
                response = requests.post(self.api_url, headers=headers, json=payload, timeout=8)
                if response.status_code == 200:
                    data = response.json()
                    content = data['choices'][0]['message']['content'].strip()
                    res = {
                        'status': 'success',
                        'source': 'mistral_ai',
                        'model': self.model,
                        'language': language,
                        'advisory': content
                    }
                    self._cache[language] = (now, res)
                    return res
            except Exception as e:
                print(f"Mistral AI API call failed: {e}")

        # Intelligent local fallback advisory generator
        res = {
            'status': 'success',
            'source': 'local_rule_engine',
            'language': language,
            'advisory': self._get_fallback_advisory(isolated_count, isolated_pop, language)
        }
        self._cache[language] = (now, res)
        return res

    def _get_fallback_advisory(self, isolated_count, isolated_pop, language):
        """Generates domain-specific fallback advisory when API key is not configured."""
        if language == 'as':
            return (
                f"১. জৰুৰীকালীন নিৰ্দেশ: {isolated_count} টা বিচ্ছিন্ন অঞ্চলৰ বাবে বিকল্প সুৰক্ষিত পথ ব্যৱহাৰ কৰক।\n"
                f"২. সাৱধানবাণী: পূব জয়ন্তীয়া পাহাৰ আৰু সোনাপুৰ অংশত অতিপাত বৰষুণৰ ফলত পথ বন্ধ হোৱাৰ আশংকা।\n"
                f"৩. সাহায্য যোগান: শিলচৰ আৰু ডিমা হাছাওৰ বাবে NH-27 বাইপাছ ব্যৱহাৰ কৰিবলৈ পৰামৰ্শ দিয়া হ'ল।"
            )
        elif language == 'bn':
            return (
                f"১. জরুরি নির্দেশিকা: {isolated_count} টি বিচ্ছিন্ন অঞ্চলের ({isolated_pop:,} নাগরিক) জন্য বিকল্প নিরাপদ রুট ব্যবহার করুন।\n"
                f"২. সতর্কতা: পূর্ব জয়ন্তিয়া হিলস ও সোনাপুর সেক্টরে ভারী ভূমিধসের উচ্চ ঝুঁকি রয়েছে।\n"
                f"৩. ত্রাণ সরবরাহ: শিলচর ও বরাক উপত্যকার জন্য NH-27 বাইপাস ব্যবহারের পরামর্শ দেওয়া হচ্ছে।"
            )
        elif language == 'hi':
            return (
                f"1. आपातकालीन निर्देश: {isolated_count} अलग-थलग बस्तियों ({isolated_pop:,} नागरिक) के लिए सुरक्षित वैकल्पिक मार्ग अपनाएं।\n"
                f"2. भूस्खलन चेतावनी: पूर्वी जयंतिया हिल्स एवं सोनापुर खंड में भारी वर्षा से भूस्खलन का उच्च जोखिम।\n"
                f"3. राहत रसद: सिलचर और बराक घाटी के लिए NH-27 हाफलोंग बाईपास मार्ग का उपयोग करें।"
            )
        else:
            return (
                f"1. CONVOY ROUTING: Divert heavy relief convoys heading to Barak Valley via NH-27 Haflong bypass to avoid active NH-6 choke points.\n"
                f"2. ISOLATION BUFFER: Prioritize emergency medical air-drops and ration staging for {isolated_count} cut-off settlements ({isolated_pop:,} population affected).\n"
                f"3. INFRASTRUCTURE ALERT: BRO & PWD quick-response excavators pre-positioned at Sonapur tunnel and Jowai canyon."
            )

    def chat(self, user_message, chat_history=None, context=None, language='en'):
        """
        Conversational Copilot for PathNER AI.
        Provides real-time tactical answers, routing suggestions, and disaster explanations in the selected language.
        """
        if chat_history is None:
            chat_history = []

        ctx_summary = "All systems operational."
        if context:
            ctx_summary = (
                f"- Isolated Settlements: {context.get('isolated_count', 4)} ({context.get('isolated_pop', 13453):,} population)\n"
                f"- Blocked Corridors: {context.get('blocked_count', 10)} (NH-6 East Jaintia Hills, Sonapur Tunnel)\n"
                f"- Safe Bypass: NH-27 Guwahati -> Haflong -> Silchar (Active & Passable)\n"
                f"- Active Relief Convoys: 4 deployed"
            )

        lang_instructions = {
            'as': 'Reply in Assamese language (অসমীয়া).',
            'bn': 'Reply in Bengali language (বাংলা).',
            'hi': 'Reply in Hindi language (हिन्दी).',
            'en': 'Reply in English.'
        }
        lang_directive = lang_instructions.get(language, 'Reply in English.')

        system_prompt = (
            "You are Drishti AI (दृष्टि / দৃষ্টি), the intelligent tactical logistics and disaster response copilot for PathNER in Northeast India.\n"
            "You assist emergency dispatchers, BRO/PWD road engineers, and district disaster authorities.\n"
            f"Current Live Platform State:\n{ctx_summary}\n\n"
            f"Language Directive: {lang_directive}\n"
            "Guidelines:\n"
            "- Be concise, authoritative, and helpful.\n"
            "- If asked about routes, recommend the safest pass and explain why.\n"
            "- Keep answers under 3-4 bullet points or concise paragraphs."
        )

        if self.is_available():
            try:
                headers = {
                    "Authorization": f"Bearer {self.api_key.strip()}",
                    "Content-Type": "application/json"
                }
                api_messages = [{"role": "system", "content": system_prompt}]
                for m in chat_history[-4:]:
                    api_messages.append({"role": m.get("role", "user"), "content": m.get("content", "")})
                api_messages.append({"role": "user", "content": user_message})

                payload = {
                    "model": self.model,
                    "messages": api_messages,
                    "temperature": 0.4,
                    "max_tokens": 350
                }
                response = requests.post(self.api_url, headers=headers, json=payload, timeout=8)
                if response.status_code == 200:
                    data = response.json()
                    content = data['choices'][0]['message']['content'].strip()
                    return {
                        'status': 'success',
                        'source': 'mistral_ai',
                        'language': language,
                        'reply': content
                    }
            except Exception as e:
                print(f"Mistral chat API call error: {e}")

        # Intelligent Local Multilingual NLP Fallback Engine
        reply = self._get_chat_nlp_fallback(user_message, language=language)
        return {
            'status': 'success',
            'source': 'local_copilot_engine',
            'language': language,
            'reply': reply
        }

    def _get_chat_nlp_fallback(self, query, language='en'):
        q = query.lower()
        if language == 'as':
            if 'nh-6' in q or 'nh6' in q or 'sonapur' in q or 'lumshnong' in q or 'পথ' in q or 'স্থিতি' in q:
                return (
                    "⚠️ **NH-6 পথৰ স্থিতি**: লুমশ্নং–সোনাপুৰ অংশত তীব্ৰ মাটিৰ আৰ্দ্ৰতা (৮৮%) আৰু শিল খহি পৰাৰ বাবে পথ **বন্ধ** হৈ আছে। "
                    "শিলচৰ আৰু বৰাক উপত্যকালৈ সাহায্য যোগানৰ বাবে **NH-27 হাফলং বাইপাছ** ব্যৱহাৰ কৰক।"
                )
            elif 'route' in q or 'silchar' in q or 'বাইপাছ' in q or 'শিলচৰ' in q:
                return (
                    "🛡️ **সুৰক্ষিত পথৰ পৰামৰ্শ**:\n"
                    "• **গুৱাহাটী → শিলচৰ**: **NH-27 হাফলং কৰিডৰ** ব্যৱহাৰ কৰক। ই অতিৰিক্ত ৪২ কিমি যোগ কৰে যদিও বিপদৰ মাত্ৰা ৭৪% ৰ পৰা ১৮% লৈ হ্ৰাস কৰে।"
                )
            elif 'isolated' in q or 'বিচ্ছিন্ন' in q or 'settlement' in q:
                return (
                    "📦 **বিচ্ছিন্ন অঞ্চলসমূহৰ স্থিতি**: পূব জয়ন্তীয়া পাহাৰত **৪ টা অঞ্চল** (১৩,৪৫৩ জনবসতি) পথ সংযোগৰ পৰা বিচ্ছিন্ন হৈ আছে। ৰেচন বাফাৰ **৩-৫ দিন** বাকী আছে।"
                )
            else:
                return (
                    "নমস্কাৰ! মই **দৃষ্টি AI (Drishti AI)** — আপোনাৰ PathNER লজিষ্টিক ক'পাইলট। আপুনি NH-6 স্থিতি, সুৰক্ষিত পথ আৰু সাহায্য যোগানৰ বিষয়ে মোক সুধিব পাৰে।"
                )
        elif language == 'bn':
            if 'nh-6' in q or 'nh6' in q or 'sonapur' in q or 'lumshnong' in q or 'অবস্থা' in q:
                return (
                    "⚠️ **NH-6 পথের অবস্থা**: সোনাপুর টানেল ও লুমশ্নং সেক্টরে ভারী ভূমিধসের কারণে রাস্তা **বন্ধ** রয়েছে। "
                    "বরাক উপত্যকায় ত্রাণ পাঠানোর জন্য **NH-27 হাফলং বাইপাস** ব্যবহার করার পরামর্শ দেওয়া হচ্ছে।"
                )
            elif 'route' in q or 'silchar' in q or 'বাইপাস' in q or 'শিলচর' in q:
                return (
                    "🛡️ **নিরাপদ রুট সুপারিশ**:\n"
                    "• **গুয়াহাটি → শিলচর**: **NH-27 হাফলং করিডোর** বেছে নিন। এতে ঝুঁকি ৭৪% থেকে কমে মাত্র ১৮% এ নেমে আসে।"
                )
            elif 'isolated' in q or 'বিচ্ছিন্ন' in q or 'settlement' in q:
                return (
                    "📦 **বিচ্ছিন্ন জনপদ**: পূর্ব জয়ন্তিয়া হিলসে **৪ টি জনপদ** (১৩,৪৫৩ নাগরিক) বিচ্ছিন্ন রয়েছে। জরুরি রেশন বাফার অবশিষ্ট **৩ থেকে ৫ দিন**।"
                )
            else:
                return (
                    "নমস্কার! আমি **দৃষ্টি AI (Drishti AI)** — আপনার PathNER লজিস্টিক সহকারী। পথ ও ত্রাণ সংক্রান্ত যে কোনো তথ্য জানতে আমাকে প্রশ্ন করুন।"
                )
        elif language == 'hi':
            if 'nh-6' in q or 'nh6' in q or 'sonapur' in q or 'lumshnong' in q or 'स्थिति' in q or 'मार्ग' in q:
                return (
                    "⚠️ **NH-6 मार्ग स्थिति**: लुमशनॉन्ग-सोनापुर खंड में अत्यधिक मिट्टी संतृप्ति (88%) और मलबे के कारण मार्ग **अवरुद्ध (BLOCKED)** है। "
                    "सिलचर एवं बराक घाटी हेतु **NH-27 हाफलोंग बाईपास** का उपयोग करें।"
                )
            elif 'route' in q or 'silchar' in q or 'बाईपास' in q or 'सिलचर' in q:
                return (
                    "🛡️ **सुरक्षित मार्ग अनुशंसा**:\n"
                    "• **गुवाहाटी → सिलचर**: **NH-27 हाफलोंग कॉरिडोर** अपनाएं। यह 42 किमी अतिरिक्त दूरी तय करता है परंतु मिशन जोखिम को 74% से घटाकर 18% कर देता है।"
                )
            elif 'isolated' in q or 'बस्तियां' in q or 'settlement' in q:
                return (
                    "📦 **अलग-थलग बस्तियां**: पूर्वी जयंतिया हिल्स में **4 बस्तियां** (13,453 नागरिक) कटी हुई हैं। राशन एवं दवा बफर **3 से 5 दिन** शेष है।"
                )
            else:
                return (
                    "नमस्ते! मैं **दृष्टि AI (Drishti AI)** हूँ — आपका PathNER लॉजिस्टिक्स एवं आपदा राहत सहायक। आप मुझसे मार्ग सुरक्षा व NH-6 स्थिति के बारे में पूछ सकते हैं।"
                )
        else:
            if 'nh-6' in q or 'nh6' in q or 'sonapur' in q or 'lumshnong' in q or 'status' in q:
                return (
                    "⚠️ **NH-6 Corridor Status**: The Lumshnong–Sonapur sector is currently **BLOCKED** due to high soil saturation (88%) and active boulder debris near the Lubha bridge. "
                    "All heavy traffic is advised to divert via the **NH-27 Haflong Bypass** to reach Silchar and the Barak Valley safely."
                )
            elif 'route' in q or 'silchar' in q or 'guwahati' in q or 'shillong' in q or 'bypass' in q:
                return (
                    "🛡️ **Safe Route Recommendation**:\n"
                    "• **Guwahati → Silchar**: Use the **NH-27 / NH-627 Haflong Corridor**. While it adds ~42km (+0.9h), it reduces overall risk from 74% to 18% and avoids all active landslide choke points.\n"
                    "• **Guwahati → Shillong**: The four-lane expressway is fully **Passable & Open** (<20% risk)."
                )
            elif 'isolated' in q or 'stranded' in q or 'population' in q or 'settlement' in q or 'food' in q or 'buffer' in q:
                return (
                    "📦 **Severed Settlements Status**: Currently **4 hamlets** (13,453 citizens) in East Jaintia Hills have 0% road reachability. "
                    "Their remaining food and medicine buffer is **3 to 5 days**. Air-drop sorties and forward staging at Williamnagar are recommended."
                )
            elif 'offline' in q or 'report' in q or 'field' in q or 'signal' in q:
                return (
                    "📡 **Offline Field Reporting**: In zero-connectivity hill valleys, open the **Field Report** tab. Reports submitted offline are buffered in browser storage and will automatically transmit to Central Command as soon as network signal is restored."
                )
            elif 'weather' in q or 'rain' in q or 'forecast' in q:
                return (
                    "🌧️ **Weather & Hazard Forecast**: Monsoon precipitation is exceeding **85mm** across the southern Meghalaya slope and Dima Hasao. "
                    "Soil saturation is critical (&ge;80%). Landslide risks are projected to peak over the next 24 to 48 hours."
                )
            else:
                return (
                    "Namaste! I am **Drishti AI (দৃষ্টি / दृष्टि)**, your PathNER Logistics Copilot. I can help you with:\n"
                    "• Checking corridor passability (e.g. *\"Is NH-6 open?\"*)\n"
                    "• Finding safest bypass routes (e.g. *\"Best route Guwahati to Silchar\"*)\n"
                    "• Reviewing stranded settlements & buffer days\n"
                    "• Guiding offline field reporting in zero-signal areas."
                )

# Global singleton Mistral AI service instance
mistral_service = MistralAIService()

