/**
 * PathNER Drishti AI (দৃষ্টি / दृष्टि) - Multilingual Conversational Copilot Client
 */

(function () {
  let chatHistory = [];
  let isSending = false;
  let currentLang = 'en';

  const translations = {
    en: {
      greeting: "👋 **Namaste! I am Drishti AI (দৃষ্টি / दृष्टि)** — your PathNER Logistics & Disaster Copilot.\nI monitor real-time road conditions, landslides on **NH-6**, and compute safe bypass routes for emergency supply convoys.\n\nHow can I assist your logistics mission today?",
      chips: [
        { id: 'chip-nh6', label: 'NH-6 Passability', prompt: 'Is NH-6 open for heavy supply trucks?' },
        { id: 'chip-route', label: 'Silchar Safe Bypass', prompt: 'What is the safest bypass route from Guwahati to Silchar?' },
        { id: 'chip-isolated', label: 'Severed Hamlets', prompt: 'Which settlements are isolated right now?' },
        { id: 'chip-offline', label: 'Offline Field Sync', prompt: 'How do I submit an incident report offline?' }
      ],
      placeholder: 'Ask Drishti AI about routes, NH-6, landslides...'
    },
    as: {
      greeting: "👋 **নমস্কাৰ! মই দৃষ্টি AI (Drishti AI)** — আপোনাৰ PathNER লজিষ্টিক ক'পাইলট।\nমই **NH-6** পথৰ অৱস্থা, ভূমিস্খলনৰ তথ্য আৰু জৰুৰী সাহায্য কনভয়ৰ বাবে সুৰক্ষিত বিকল্প পথৰ নিৰ্দেশনা প্ৰদান কৰোঁ।\n\nমই আপোনাক কেনেদৰে সহায় কৰিব পাৰোঁ?",
      chips: [
        { id: 'chip-nh6', label: 'NH-6 পথৰ স্থিতি', prompt: 'NH-6 পথ এতিয়া ট্ৰাকৰ বাবে খোলা আছে নেকি?' },
        { id: 'chip-route', label: 'শিলচৰ সুৰক্ষিত বাইপাছ', prompt: 'গুৱাহাটীৰ পৰা শিলচৰলৈ আটাইতকৈ সুৰক্ষিত পথ কি?' },
        { id: 'chip-isolated', label: 'বিচ্ছিন্ন অঞ্চলসমূহ', prompt: 'বৰ্তমান কোনবোৰ অঞ্চল বিচ্ছিন্ন হৈ আছে?' },
        { id: 'chip-offline', label: 'অফলাইন ৰিপৰ্ট', prompt: 'নেটৱৰ্ক নোহোৱাকৈ ৰিপৰ্ট কেনেকৈ পঠাম?' }
      ],
      placeholder: 'NH-6 স্থিতি, ভূমিস্খলন আৰু পথৰ বিষয়ে সোধক...'
    },
    bn: {
      greeting: "👋 **নমস্কার! আমি দৃষ্টি AI (Drishti AI)** — আপনার PathNER লজিস্টিক সহকারী।\nআমি **NH-6** পথের অবস্থা, ভূমিধসের ঝুঁকি এবং জরুরি ত্রাণ কনভয়ের জন্য নিরাপদ বাইপাস রুটের তথ্য সরবরাহ করি।\n\nআপনাকে কীভাবে সাহায্য করতে পারি?",
      chips: [
        { id: 'chip-nh6', label: 'NH-6 পথের অবস্থা', prompt: 'NH-6 রাস্তা কি এখন খোলা আছে?' },
        { id: 'chip-route', label: 'শিলচর নিরাপদ বাইপাস', prompt: 'গুয়াহাটি থেকে শিলচর যাওয়ার নিরাপদ রুট কোনটি?' },
        { id: 'chip-isolated', label: 'বিচ্ছিন্ন জনপদ', prompt: 'কোন কোন জনপদ এখন বিচ্ছিন্ন?' },
        { id: 'chip-offline', label: 'অফলাইন রিপোর্ট', prompt: 'ইন্টারনেট ছাড়া রিপোর্ট কীভাবে জমা দেব?' }
      ],
      placeholder: 'NH-6 অবস্থা, ভূমিধস ও রুট সম্পর্কে জিজ্ঞাসা করুন...'
    },
    hi: {
      greeting: "👋 **नमस्ते! मैं दृष्टि AI (Drishti AI)** हूँ — आपका PathNER लॉजिस्टिक्स एवं आपदा राहत सहायक।\nमैं **NH-6** की स्थिति, भूस्खलन जोखिम एवं राहत सामग्री के सुरक्षित परिवहन हेतु बाईपास मार्गों की जानकारी प्रदान करता हूँ।\n\nमैं आपकी क्या सहायता कर सकता हूँ?",
      chips: [
        { id: 'chip-nh6', label: 'NH-6 मार्ग स्थिति', prompt: 'क्या NH-6 अभी भारी ट्रकों के लिए खुला है?' },
        { id: 'chip-route', label: 'सिलचर सुरक्षित बाईपास', prompt: 'गुवाहाटी से सिलचर के लिए सबसे सुरक्षित मार्ग कौन सा है?' },
        { id: 'chip-isolated', label: 'अलग-थलग बस्तियां', prompt: 'वर्तमान में कौन सी बस्तियां कटी हुई हैं?' },
        { id: 'chip-offline', label: 'ऑफलाइन रिपोर्ट', prompt: 'बिना नेटवर्क के रिपोर्ट कैसे दर्ज करें?' }
      ],
      placeholder: 'NH-6 स्थिति, भूस्खलन और सुरक्षित मार्ग के बारे में पूछें...'
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    initChatbot();
  });

  function initChatbot() {
    const launcher = document.getElementById('ai-chat-launcher');
    const windowEl = document.getElementById('ai-chat-window');
    const closeBtn = document.getElementById('ai-chat-close-btn');
    const input = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('ai-chat-send-btn');
    const langTabs = document.querySelectorAll('.drishti-lang-tab');

    if (!launcher || !windowEl) return;

    // Toggle drawer
    launcher.addEventListener('click', () => {
      const isOpen = windowEl.classList.contains('open');
      if (isOpen) {
        windowEl.classList.remove('open');
      } else {
        windowEl.classList.add('open');
        if (input) input.focus();
        scrollToBottom();
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        windowEl.classList.remove('open');
      });
    }

    // Send button & Enter key
    if (sendBtn && input) {
      sendBtn.addEventListener('click', () => handleSend());
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      });
    }

    // Language switcher tabs
    langTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const lang = tab.dataset.lang || 'en';
        if (lang === currentLang) return;
        langTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        switchLanguage(lang);
      });
    });

    // Attach click listeners to chips
    attachChipListeners();

    // Initial greeting in default language
    switchLanguage('en', false);
  }

  function switchLanguage(lang, announce = true) {
    currentLang = lang;
    const config = translations[lang] || translations['en'];
    const input = document.getElementById('ai-chat-input');

    if (input) {
      input.placeholder = config.placeholder;
    }

    // Update chips
    const chipsContainer = document.getElementById('ai-chat-chips');
    if (chipsContainer && config.chips) {
      chipsContainer.innerHTML = config.chips.map(c => `
        <button class="ai-chip" data-prompt="${escapeHtml(c.prompt)}" id="${c.id}">${c.label}</button>
      `).join('');
      attachChipListeners();
    }

    // Clear and announce greeting in chosen language
    const msgStream = document.getElementById('ai-chat-messages');
    if (msgStream) {
      msgStream.innerHTML = '';
      appendBotMessage(config.greeting);
    }
  }

  function attachChipListeners() {
    const chips = document.querySelectorAll('.ai-chip');
    const input = document.getElementById('ai-chat-input');
    chips.forEach((chip) => {
      chip.onclick = () => {
        const prompt = chip.dataset.prompt || chip.textContent;
        if (input) input.value = prompt;
        handleSend();
      };
    });
  }

  async function handleSend() {
    const input = document.getElementById('ai-chat-input');
    if (!input || isSending) return;

    const query = input.value.trim();
    if (!query) return;

    input.value = '';
    appendUserMessage(query);
    showTypingIndicator();
    isSending = true;

    try {
      const res = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          chat_history: chatHistory,
          language: currentLang
        })
      });
      const data = await res.json();
      hideTypingIndicator();

      if (data.status === 'success') {
        appendBotMessage(data.reply);
        chatHistory.push({ role: 'user', content: query });
        chatHistory.push({ role: 'assistant', content: data.reply });
      } else {
        appendBotMessage("⚠️ " + (data.message || "Failed to reach Drishti AI service."));
      }
    } catch (err) {
      hideTypingIndicator();
      appendBotMessage("⚠️ Network error communicating with Drishti AI.");
    } finally {
      isSending = false;
      scrollToBottom();
    }
  }

  function appendUserMessage(text) {
    const stream = document.getElementById('ai-chat-messages');
    if (!stream) return;

    const div = document.createElement('div');
    div.className = 'ai-msg user';
    div.innerHTML = `<div class="ai-msg-bubble">${escapeHtml(text)}</div>`;
    stream.appendChild(div);
    scrollToBottom();
  }

  function appendBotMessage(raw) {
    const stream = document.getElementById('ai-chat-messages');
    if (!stream) return;

    const formatted = renderChatMarkdown(raw);
    const div = document.createElement('div');
    div.className = 'ai-msg bot';
    div.innerHTML = `<div class="ai-msg-bubble">${formatted}</div>`;
    stream.appendChild(div);
    scrollToBottom();
  }

  function showTypingIndicator() {
    const stream = document.getElementById('ai-chat-messages');
    if (!stream) return;
    let indicator = document.getElementById('ai-typing-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'ai-typing-indicator';
      indicator.className = 'ai-typing-indicator';
      indicator.innerHTML = `
        <span class="ai-typing-dot"></span>
        <span class="ai-typing-dot"></span>
        <span class="ai-typing-dot"></span>
      `;
      stream.appendChild(indicator);
      scrollToBottom();
    }
  }

  function hideTypingIndicator() {
    const indicator = document.getElementById('ai-typing-indicator');
    if (indicator) indicator.remove();
  }

  function scrollToBottom() {
    const stream = document.getElementById('ai-chat-messages');
    if (stream) {
      stream.scrollTop = stream.scrollHeight;
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function renderChatMarkdown(raw) {
    if (!raw) return '';
    let text = escapeHtml(raw);

    // Bold **text**
    text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

    // Bullet points * or -
    text = text.replace(/(?:^|\n)[*-]\s+(.*?)(?=\n|$)/g, '<br>• $1');

    // Line breaks
    text = text.replace(/\n/g, '<br>');

    return text;
  }

  // Global helper for triggering Drishti AI copilot from external widgets
  window.openDrishtiWithPrompt = function(promptText) {
    const windowEl = document.getElementById('ai-chat-window');
    const input = document.getElementById('ai-chat-input');
    if (windowEl) {
      windowEl.classList.add('open');
      if (input && promptText) {
        input.value = promptText;
        handleSend();
      } else if (input) {
        input.focus();
      }
    }
  };
})();
