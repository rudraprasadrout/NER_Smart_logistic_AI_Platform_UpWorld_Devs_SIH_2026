/**
 * Multilingual Alert & Notification System
 * Supports English, Assamese (অসমীয়া), Hindi (हिन्दी), Bengali (বাংলা)
 */

const translations = {
  en: {
    dashboard_title: "PathNER Intelligence OCC",
    isolated_pop: "Stranded Population",
    isolated_count: "Severed Hamlets",
    at_risk_pop: "At-Risk Population",
    severed_roads: "Blocked Corridors",
    forecast_timeline: "72-Hour Accessibility Projection",
    isolation_panel_title: "Settlement Isolation Index",
    active_alerts_title: "Emergency Broadcast Alerts"
  },
  as: {
    dashboard_title: "পাথ-এনইআৰ নিয়ন্ত্ৰণ কক্ষ",
    isolated_pop: "বিচ্ছিন্ন জনসংখ্যা",
    isolated_count: "বিচ্ছিন্ন গাঁও",
    at_risk_pop: "বিপদসংকুল জনসংখ্যা",
    severed_roads: "অৱৰুদ্ধ পথ",
    forecast_timeline: "৭২-ঘণ্টাৰ পথ সম্ভাৱনা পূৰ্বানুমান",
    isolation_panel_title: "বসতি বিচ্ছিন্নতা সূচক",
    active_alerts_title: "জৰুৰীকালীন জাননী"
  },
  hi: {
    dashboard_title: "पाथ-एनईआर नियंत्रण कक्ष",
    isolated_pop: "संपर्कविहीन आबादी",
    isolated_count: "कटे हुए गांव",
    at_risk_pop: "जोखिम में आबादी",
    severed_roads: "अवरुद्ध मार्ग",
    forecast_timeline: "72-घंटे का पहुंच पूर्वानुमान",
    isolation_panel_title: "बस्ती पृथक्करण सूचकांक",
    active_alerts_title: "आपातकालीन चेतावनी"
  },
  bn: {
    dashboard_title: "পাথ-এনইআর কন্ট্রোল রুম",
    isolated_pop: "বিচ্ছিন্ন জনসংখ্যা",
    isolated_count: "বিচ্ছিন্ন গ্রাম",
    at_risk_pop: "ঝুঁকিপূর্ণ জনসংখ্যা",
    severed_roads: "অবরুদ্ধ করিডোর",
    forecast_timeline: "৭২-ঘণ্টার প্রবেশযোগ্যতা পূর্বাভাস",
    isolation_panel_title: "জনপদ বিচ্ছিন্নতা সূচক",
    active_alerts_title: "জরুরী সম্প্রচার সতর্কতা"
  }
};

class I18nManager {
  constructor() {
    this.currentLang = 'en';
  }

  setLanguage(lang) {
    if (!translations[lang]) return;
    this.currentLang = lang;
    this.applyTranslations();
  }

  applyTranslations() {
    const t = translations[this.currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) el.innerText = t[key];
    });
  }
}

window.i18n = new I18nManager();
