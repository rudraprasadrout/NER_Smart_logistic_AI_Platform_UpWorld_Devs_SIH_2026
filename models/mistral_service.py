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

# Global singleton Mistral AI service instance
mistral_service = MistralAIService()
