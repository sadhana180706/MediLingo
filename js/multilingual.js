/* ========================================================
   MEDI LINGO - MULTILINGUAL ENGINE & SPEECH TO TEXT
   Supported Languages: English, Tamil, Hindi, Telugu, Malayalam, Kannada
   ======================================================== */

const MULTILINGUAL_DATA = {
    languages: [
        { code: "en-IN", name: "English", nativeName: "English", flag: "🇬🇧", sample: "I have fever, headache and throat pain for 2 days." },
        { code: "ta-IN", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳", sample: "எனக்கு இரண்டு நாட்களாக கடுமையான காய்ச்சல் மற்றும் தலைவலி உள்ளது." },
        { code: "hi-IN", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", sample: "मुझे दो दिनों से तेज बुखार, सिरदर्द और सर्दी की समस्या है।" },
        { code: "te-IN", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳", sample: "నాకు రెండు రోజులుగా జ్వరం మరియు తలనొప్పి ఉంది." },
        { code: "ml-IN", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳", sample: "എനിക്ക് രണ്ടു ദിവസമായി പനിയും തലവേദനയും തൊണ്ടവേദനയും ഉണ്ട്." },
        { code: "kn-IN", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳", sample: "ನನಗೆ ಎರಡು ದಿನಗಳಿಂದ ಜ್ವರ ಮತ್ತು ತಲೆನೋವು ಇದೆ." }
    ],

    translations: {
        "en-IN": {
            heroTitle: "Consult a doctor easily from anywhere",
            heroSub: "Voice-enabled • Multilingual AI Triage • Smart Vending Dispensing",
            speakNow: "Speak Symptoms",
            listening: "Listening... Speak your symptoms clearly",
            speakDone: "Speech captured successfully!",
            analyzing: "AI is analyzing clinical symptoms...",
            consultCTA: "Start Consultation Now",
            vendingCard: "Smart Medicine Vending",
            doctorsCard: "Verified Available Doctors",
            placeholderSymptom: "Describe your symptoms or click the microphone to speak in your language..."
        },
        "ta-IN": {
            heroTitle: "எங்கிருந்தும் மருத்துவ ஆலோசனையைப் பெறுங்கள்",
            heroSub: "குரல் வழி ஆலோசனை • பல்மொழி AI பரிந்துரை • உடனடி மருந்து விநியோகம்",
            speakNow: "குரலில் பேசுங்கள்",
            listening: "கேட்கிறது... உங்கள் அறிகுறிகளை தெளிவாகக் கூறுங்கள்",
            speakDone: "குரல் பதிவு வெற்றிகரமாக பெறப்பட்டது!",
            analyzing: "AI அறிகுறிகளை ஆய்வு செய்கிறது...",
            consultCTA: "ஆலோசனையைத் தொடங்குங்கள்",
            vendingCard: "தானியங்கி மருந்து வழங்கும் இயந்திரம்",
            doctorsCard: "சரிபார்க்கப்பட்ட மருத்துவர்கள்",
            placeholderSymptom: "உங்கள் உடல்நல பிரச்சனைகளை இங்கே தட்டச்சு செய்யவும் அல்லது மைக்ரோஃபோனை அழுத்தவும்..."
        },
        "hi-IN": {
            heroTitle: "कहीं से भी आसानी से डॉक्टर से परामर्श लें",
            heroSub: "आवाज सक्षम • बहुभाषी एआई परामर्श • स्मार्ट मेडिसिन वेंडिंग",
            speakNow: "बोलकर बताएं",
            listening: "सुन रहे हैं... अपने लक्षणों को स्पष्ट रूप से बोलें",
            speakDone: "आवाज सफलतापूर्वक दर्ज की गई!",
            analyzing: "एआई लक्षणों का विश्लेषण कर रहा है...",
            consultCTA: "अभी परामर्श शुरू करें",
            vendingCard: "स्मार्ट दवा वेंडिंग मशीन",
            doctorsCard: "सत्यापित उपलब्ध डॉक्टर्स",
            placeholderSymptom: "अपने लक्षणों को लिखें या अपनी भाषा में बोलने के लिए माइक दबाएं..."
        },
        "te-IN": {
            heroTitle: "ఎక్కడి నుంచైనా సులభంగా డాక్టర్‌ను సంప్రదించండి",
            heroSub: "వాయిస్ సదుపాయం • బహుభాషా AI సలహాలు • స్మార్ట్ ఔషధాల యంత్రం",
            speakNow: "మాట్లాడండి",
            listening: "వింటున్నాము... మీ సమస్యలను స్పష్టంగా చెప్పండి",
            speakDone: "స్పీచ్ రికార్డ్ చేయబడింది!",
            analyzing: "AI విశ్లేషిస్తోంది...",
            consultCTA: "ఇప్పుడే సంప్రదించండి",
            vendingCard: "మందుల వెండింగ్ మెషిన్",
            doctorsCard: "అందుబాటులో ఉన్న వైద్యులు",
            placeholderSymptom: "మీ లక్షణాలను ఇక్కడ టైప్ చేయండి లేదా మైక్ నొక్కండి..."
        },
        "ml-IN": {
            heroTitle: "എവിടെ നിന്നും എളുപ്പത്തിൽ ഡോക്ടറെ കാണുക",
            heroSub: "വോയ്‌സ് അധിഷ്ഠിതം • ബഹുഭാഷാ AI • സ്മാർട്ട് മെഡിസിൻ വെൻഡിംഗ്",
            speakNow: "സംസാരിക്കുക",
            listening: "ശ്രദ്ധിക്കുന്നു... നിങ്ങളുടെ ലക്ഷണങ്ങൾ വ്യക്തമായി പറയുക",
            speakDone: "വോയ്‌സ് റെക്കോർഡ് ചെയ്തു!",
            analyzing: "AI പരിശോധിക്കുന്നു...",
            consultCTA: "കൺസൾട്ടേഷൻ ആരംഭിക്കുക",
            vendingCard: "മെഡിസിൻ വെൻഡിംഗ് മെഷീൻ",
            doctorsCard: "പരിശോധിച്ച ഡോക്ടർമാർ",
            placeholderSymptom: "നിങ്ങളുടെ ലക്ഷണങ്ങൾ ഇവിടെ ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ മൈക്ക് അമർത്തുക..."
        },
        "kn-IN": {
            heroTitle: "ಎಲ್ಲಿಂದಲಾದರೂ ಸುಲಭವಾಗಿ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ",
            heroSub: "ಧ್ವನಿ ಸಕ್ರಿಯಗೊಳಿಸಿದ • ಬಹುಭಾಷಾ AI • ಸ್ಮಾರ್ಟ್ ಮೆಡಿಸಿನ್ ವೆಂಡಿಂಗ್",
            speakNow: "ಮಾತನಾಡಿ",
            listening: "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ... ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಹೇಳಿ",
            speakDone: "ಧ್ವನಿ ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ!",
            analyzing: "AI ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...",
            consultCTA: "ಈಗಲೇ ಸಮಾಲೋಚನೆ ಪ್ರಾರಂಭಿಸಿ",
            vendingCard: "ಔಷಧ ವಿತರಣಾ ಯಂತ್ರ",
            doctorsCard: "ಲಭ್ಯವಿರುವ ವೈದ್ಯರು",
            placeholderSymptom: "ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳನ್ನು ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಧ್ವನಿ ಬಳಸಿ..."
        }
    }
};

class MediLingoSpeech {
    constructor() {
        this.currentLang = "en-IN";
        this.recognition = null;
        this.isRecording = false;
        this.initRecognition();
    }

    initRecognition() {
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (window.SpeechRecognition) {
            this.recognition = new window.SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = this.currentLang;
        } else {
            console.warn("Web Speech API is not supported in this browser.");
        }
    }

    setLanguage(langCode) {
        this.currentLang = langCode;
        if (this.recognition) {
            this.recognition.lang = langCode;
        }
    }

    startListening(onResult, onStatusChange, onError) {
        if (!this.recognition) {
            if (onError) onError("Voice recognition is not supported in your current browser. Please type symptoms manually.");
            return;
        }

        try {
            this.recognition.lang = this.currentLang;
            this.recognition.start();
            this.isRecording = true;
            if (onStatusChange) onStatusChange("listening");

            this.recognition.onresult = (event) => {
                let finalTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript && onResult) {
                    onResult(finalTranscript);
                }
            };

            this.recognition.onerror = (event) => {
                this.isRecording = false;
                if (onStatusChange) onStatusChange("idle");
                if (onError) onError("Speech recognition notice: " + (event.error || "Please try again or type symptoms"));
            };

            this.recognition.onend = () => {
                this.isRecording = false;
                if (onStatusChange) onStatusChange("idle");
            };
        } catch (e) {
            this.isRecording = false;
            if (onStatusChange) onStatusChange("idle");
            console.error("Speech start error:", e);
        }
    }

    stopListening() {
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
            this.isRecording = false;
        }
    }
}
