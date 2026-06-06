/**
 * Static Hindi translations for onboarding screen schemas loaded from @kalpx/contracts.
 * Since these screens are contract-local (not API-driven), locale cannot be sent as
 * a request param. Instead, we post-process the loaded schema and replace every known
 * English string with its Hindi equivalent.
 *
 * Source: apps/mobile/src/config/locales/hi/hi.json — mitraPathSelect, room.lifeContext,
 * mitraStart, onboarding, and turn-level copy confirmed against allContainers.js.
 */

export const SCREEN_STRINGS_HI: Record<string, string> = {
  // ── turn_1 ──────────────────────────────────────────────────────────────────
  "I'm Mitra.\nI'm here with you.":
    "मैं मित्र हूँ।\nमैं आपके साथ हूँ।",
  "Hi. I am Mitra.":
    "नमस्ते। मैं मित्र हूँ।",
  "I am here to help you feel more calm, steady, and clear — on hard days and good days.":
    "मैं यहाँ हूँ ताकि आप कठिन और अच्छे — दोनों दिनों में अधिक शांत, स्थिर और स्पष्ट महसूस करें।",
  "I notice small things, like your mood and the shape of your day.":
    "मैं छोटी-छोटी चीज़ें देखता हूँ, जैसे आपका मूड और आपके दिन की बनावट।",
  "Yes,let's begin":
    "हाँ, शुरू करते हैं →",
  "I'm returning":
    "मैं वापस आया हूँ",

  // ── turn_2 ──────────────────────────────────────────────────────────────────
  "Do you need support in some area of life right now?":
    "क्या आपको अभी जीवन के किसी क्षेत्र में सहारे की ज़रूरत है?",
  "Or are you feeling balanced and ready to grow?":
    "या आप संतुलित हैं और आगे बढ़ने के लिए तैयार हैं?",
  "I need help with something in life right now":
    "मुझे अभी जीवन में कुछ सहारा चाहिए",
  "I feel balanced and want to grow":
    "मैं संतुलित हूँ और आगे बढ़ना चाहता हूँ",

  // ── turn_3_life_context / turn_5_life_context ────────────────────────────────
  "What part of life is this touching?":
    "जीवन का कौन-सा पहलू इसे छू रहा है?",
  "Pick one that feels most alive right now.":
    "अभी जो सबसे ज़्यादा जीवंत लगे वह चुनें।",
  "Work & Career": "काम और करियर",
  "Relationships": "रिश्ते",
  "Myself": "मैं स्वयं",
  "Health & Energy": "स्वास्थ्य और ऊर्जा",
  "Money & Security": "पैसा और सुरक्षा",
  "Purpose & Direction": "उद्देश्य और दिशा",
  "Studies & Exams": "पढ़ाई और परीक्षाएँ",
  "Daily Life": "दैनिक जीवन",

  // ── turn_3_life_context_support ─────────────────────────────────────────────
  "What part of life feels heaviest right now?":
    "अभी जीवन का कौन-सा पहलू सबसे भारी लग रहा है?",
  "Pick what feels closest.":
    "जो सबसे करीब लगे वह चुनें।",
  "Work feels heavy": "काम भारी लग रहा है",
  "Relationships feel heavy": "रिश्ते भारी लग रहे हैं",
  "I feel unsettled within myself": "मैं अपने भीतर अस्थिर महसूस कर रहा/रही हूँ",
  "Health or energy feels difficult": "स्वास्थ्य या ऊर्जा कठिन लग रही है",
  "Money or security feels stressful": "पैसा या सुरक्षा तनावपूर्ण लग रही है",
  "I feel unclear about direction": "दिशा स्पष्ट नहीं लग रही",
  "Studies or exams feel stressful": "पढ़ाई या परीक्षाएँ तनावपूर्ण लग रही हैं",
  "Daily life feels hard": "दैनिक जीवन कठिन लग रहा है",
  "Spiritual life feels distant": "आध्यात्मिक जीवन दूर लग रहा है",

  // ── turn_3_life_context_growth ─────────────────────────────────────────────
  "What do you want to strengthen?": "आप क्या मजबूत करना चाहते हैं?",
  "Pick what feels most alive right now.": "अभी जो सबसे ज़्यादा जीवंत लगे वह चुनें।",
  "Work with purpose": "उद्देश्य के साथ काम",
  "Deepen connection at home": "घर में जुड़ाव गहरा करें",
  "See more clearly": "अधिक स्पष्टता से देखें",
  "Carry steadiness outward": "स्थिरता को बाहर ले जाएं",
  "Deepen gratitude": "कृतज्ञता गहरी करें",
  "Move through what's changing": "जो बदल रहा है उससे गुज़रें",
  "Grow through studies": "पढ़ाई के माध्यम से बढ़ें",
  "Strengthen myself": "स्वयं को मजबूत करें",
  "Care for my energy": "अपनी ऊर्जा की देखभाल करें",
  "Build trust around money": "धन के प्रति विश्वास बनाएं",
  "Steadiness in daily life": "दैनिक जीवन में स्थिरता",
  "Return to devotion": "भक्ति में वापस लौटें",

  // ── turn_3_support ──────────────────────────────────────────────────────────
  "What feels strongest right now?": "अभी सबसे ज़्यादा क्या महसूस हो रहा है?",
  "Pick where you feel it most.": "जहाँ सबसे ज़्यादा महसूस हो वह चुनें।",
  "My body feels tight": "मेरा शरीर जकड़ा हुआ महसूस होता है",
  "My breathing feels off": "मेरी साँसें ठीक नहीं लग रहीं",
  "My mind won't settle": "मेरा मन स्थिर नहीं हो रहा",
  "I don't know what to do": "मुझे नहीं पता क्या करूँ",
  "Something feels heavy inside": "अंदर कुछ भारी लग रहा है",

  // ── turn_3_growth ───────────────────────────────────────────────────────────
  "What feels present right now?": "अभी मन में क्या है?",
  "Pick whichever fits today.": "जो आज ठीक लगे वह चुनें।",
  "I feel steady": "मैं स्थिर महसूस कर रहा/रही हूँ",
  "I feel thankful": "मैं शुक्रगुज़ार हूँ",
  "Something is changing": "कुछ बदल रहा है",
  "I feel better today": "मैं आज बेहतर महसूस कर रहा/रही हूँ",
  "I want to grow": "मैं बढ़ना चाहता/चाहती हूँ",
  "I want more meaning": "मुझे ज़िंदगी में कुछ मायने चाहिए",

  // ── turn_4_support ──────────────────────────────────────────────────────────
  "What is your mind doing?": "आपका मन क्या कर रहा है?",
  "This helps me see the movement.": "इससे मुझे गति देखने में मदद मिलती है।",
  "It keeps replaying": "वह बार-बार दोहराता है",
  "It keeps worrying ahead": "वह आगे की चिंता करता रहता है",
  "It keeps comparing": "वह तुलना करता रहता है",
  "It keeps arguing inside": "वह अंदर से बहस करता रहता है",
  "It goes blank": "वह खाली हो जाता है",
  "It keeps holding on": "वह पकड़े रहता है",
  "It keeps pushing away": "वह धकेलता रहता है",

  // ── turn_4_growth ───────────────────────────────────────────────────────────
  "What do you want more of right now?": "अभी आपको और क्या चाहिए?",
  "The one that pulls you most.": "जो सबसे ज़्यादा खींचे।",
  "More clarity": "और साफ़ होना है",
  "More peace": "और शांति चाहिए",
  "More strength": "और ताकत चाहिए",
  "More devotion": "और भक्ति चाहिए",
  "More purpose": "एक मकसद चाहिए",
  "More steadiness": "और स्थिरता चाहिए",

  // ── turn_5_support ──────────────────────────────────────────────────────────
  "What feels underneath it most?": "इसके नीचे सबसे ज़्यादा क्या है?",
  "Pick what feels truest, even if small.": "जो सबसे सच्चा लगे वह चुनें, भले ही छोटा हो।",
  "Fear": "डर",
  "Holding on too tightly": "बहुत कसकर पकड़े रहना",
  "Not wanting this at all": "यह बिल्कुल नहीं चाहना",
  "Feeling hurt": "आहत महसूस करना",
  "Confusion": "भ्रम",
  "I'm not sure": "मुझे यकीन नहीं",

  // ── turn_5_growth ───────────────────────────────────────────────────────────
  "What would help most today?": "आज क्या सबसे अधिक मदद करेगा?",
  "Pick whichever feels right.": "जो सही लगे वह चुनें।",
  "Something quiet": "कुछ शांत",
  "Something practical": "कुछ जो काम का हो",
  "Something uplifting": "कुछ जो मन उठाए",
  "Something devotional": "कुछ भक्ति का",
  "Something grounding": "कुछ स्थिर करने वाला",
  "Something to think through": "कुछ जिस पर सोच सकें",

  // ── turn_6 (guidance mode) ──────────────────────────────────────────────────
  "How would you like this guidance to sound?":
    "आप यह मार्गदर्शन किस रूप में सुनना चाहेंगे?",
  "Some people prefer simple, modern language. Some like a blend. Some want the deeper roots visible.":
    "कुछ लोग सरल, आधुनिक भाषा पसंद करते हैं। कुछ मिश्रण चाहते हैं। कुछ गहरी जड़ें दिखाना चाहते हैं।",

  // ── turn_7 ──────────────────────────────────────────────────────────────────
  "RECOGNITION": "पहचान",
  "Show me my path": "मुझे मेरा पथ दिखाएं",

  // ── turn_8 ──────────────────────────────────────────────────────────────────
  "This is what I'm holding for you today:":
    "आज मैं यह आपके लिए लेकर आया हूँ:",
  "Begin my journey": "मेरी यात्रा शुरू करें",

  // ── turn_3 (dynamic friction / legacy) ─────────────────────────────────────
  "Or describe it...": "या इसे बताएं...",
  "Racing — mind moving too fast": "दौड़ता हुआ — मन बहुत तेज़ चल रहा है",
  "Drained — low energy, nothing left": "थका हुआ — ऊर्जा कम, कुछ नहीं बचा",
  "Foggy — can't see clearly": "धुंधला — स्पष्ट नहीं दिख रहा",
  "Heavy — everything weighs": "भारी — सब कुछ बोझिल लग रहा है",
  "Restless — moving but going nowhere": "बेचैन — चल रहा हूँ पर कहीं नहीं पहुँच रहा",
  "Actually clear — but there's a lot to hold": "वास्तव में स्पष्ट — पर बहुत कुछ संभालना है",

  // ── turn_2_legacy ───────────────────────────────────────────────────────────
  "Where would you like support right now?": "अभी आप कहाँ सहायता चाहते हैं?",
  "Choose what feels closest. We can take it from there.":
    "जो सबसे करीब लगे वह चुनें। हम वहाँ से आगे बढ़ेंगे।",
  "Work feels unclear": "काम अस्पष्ट लग रहा है",
  "A relationship needs care": "एक रिश्ते को देखभाल की ज़रूरत है",
  "My mind needs quiet": "मेरे मन को शांति चाहिए",
  "I'm moving through uncertainty": "मैं अनिश्चितता से गुज़र रहा/रही हूँ",
  "My energy feels low": "मेरी ऊर्जा कम लग रही है",
  "I'm trying to understand myself": "मैं स्वयं को समझने की कोशिश कर रहा/रही हूँ",
  "I want to grow spiritually": "मैं आध्यात्मिक रूप से बढ़ना चाहता/चाहती हूँ",
  "Or tell me in your own words...": "या अपने शब्दों में बताएं...",

  // ── turn_4 voice / text ──────────────────────────────────────────────────────
  "How would you like me to be with you?":
    "आप मुझे किस रूप में अपने साथ चाहते हैं?",
  "I can speak with you, or keep things quiet and written.":
    "मैं आपसे बात कर सकता हूँ, या चीज़ें शांत और लिखित रख सकता हूँ।",

  // ── misc placeholders ───────────────────────────────────────────────────────
  "Or share in your own words": "या अपने शब्दों में साझा करें",
  "Share your reflection": "अपना मनन साझा करें",

  // ── PathEmergesBlock (turn_8) ────────────────────────────────────────────────
  "Your Mantra": "आपका मंत्र",
  "Your Intention": "आपका संकल्प",
  "Your Practice": "आपका अभ्यास",
  "Why these were chosen": "इन्हें क्यों चुना गया",
  "Understand why Mitra selected this mantra, sankalp, and practice.":
    "समझें कि मित्र ने यह मंत्र, संकल्प और अभ्यास क्यों चुना।",
  "Chosen with care": "ध्यान से चुना गया",
  "Why this supports today": "यह आज क्यों सहायक है",
  "Essence": "सार",
  "Shift": "बदलाव",
  "Useful for": "उपयोगी है",
  "Rooted in": "आधारित है",
  "This isn't homework. It's sadhana — a daily practice that builds something real over time.":
    "यह होमवर्क नहीं है। यह साधना है — एक रोज़ का अभ्यास जो वक्त के साथ कुछ असली बनाता है।",
};

export const SCREEN_STRINGS_TE: Record<string, string> = {
  // ── turn_1 ──────────────────────────────────────────────────────────────────
  "I'm Mitra.\nI'm here with you.":
    "నేను మిత్ర.\nనేను మీతో ఉన్నాను.",
  "Hi. I am Mitra.":
    "నమస్కారం. నేను మిత్ర.",
  "I am here to help you feel more calm, steady, and clear — on hard days and good days.":
    "కష్టమైన మరియు మంచి — రెండు రోజులలో మీరు మరింత శాంతంగా, స్థిరంగా మరియు స్పష్టంగా అనిపించడానికి నేను ఇక్కడ ఉన్నాను.",
  "I notice small things, like your mood and the shape of your day.":
    "మీ మూడ్ మరియు మీ రోజు నిర్మాణం వంటి చిన్న విషయాలను నేను గమనిస్తాను.",
  "Yes,let's begin":
    "అవును, మొదలుపెట్టాం →",
  "I'm returning":
    "నేను తిరిగి వచ్చాను",

  // ── turn_2 ──────────────────────────────────────────────────────────────────
  "Do you need support in some area of life right now?":
    "మీకు ఇప్పుడు జీవితంలో ఏదైనా మద్దతు అవసరమా?",
  "Or are you feeling balanced and ready to grow?":
    "లేదా మీరు సమతుల్యంగా ఉన్నారా మరియు ముందుకు వెళ్ళడానికి సిద్ధంగా ఉన్నారా?",
  "I need help with something in life right now":
    "నాకు ఇప్పుడు జీవితంలో కొంత మద్దతు కావాలి",
  "I feel balanced and want to grow":
    "నేను సమతుల్యంగా ఉన్నాను మరియు ముందుకు వెళ్ళాలనుకుంటున్నాను",

  // ── turn_3_life_context / turn_5_life_context ────────────────────────────────
  "What part of life is this touching?":
    "జీవితంలో ఏ భాగాన్ని ఇది తాకుతోంది?",
  "Pick one that feels most alive right now.":
    "ఇప్పుడు అత్యంత జీవంతంగా అనిపించేదాన్ని ఎంచుకోండి.",
  "Work & Career": "పని & వృత్తి",
  "Relationships": "సంబంధాలు",
  "Myself": "నేను",
  "Health & Energy": "ఆరోగ్యం & శక్తి",
  "Money & Security": "డబ్బు & భద్రత",
  "Purpose & Direction": "లక్ష్యం & దిశ",
  "Studies & Exams": "చదువులు & పరీక్షలు",
  "Daily Life": "రోజువారీ జీవితం",

  // ── turn_3_life_context_support ─────────────────────────────────────────────
  "What part of life feels heaviest right now?":
    "ఇప్పుడు జీవితంలో ఏ భాగం అత్యంత భారంగా అనిపిస్తోంది?",
  "Pick what feels closest.":
    "అత్యంత దగ్గరగా అనిపించేది ఎంచుకోండి.",
  "Work feels heavy": "పని భారంగా అనిపిస్తోంది",
  "Relationships feel heavy": "సంబంధాలు భారంగా అనిపిస్తున్నాయి",
  "I feel unsettled within myself": "నేను నా లోపల అస్థిరంగా అనిపిస్తున్నాను",
  "Health or energy feels difficult": "ఆరోగ్యం లేదా శక్తి కష్టంగా అనిపిస్తోంది",
  "Money or security feels stressful": "డబ్బు లేదా భద్రత ఒత్తిడిగా అనిపిస్తోంది",
  "I feel unclear about direction": "దిశ గురించి అస్పష్టంగా అనిపిస్తోంది",
  "Studies or exams feel stressful": "చదువులు లేదా పరీక్షలు ఒత్తిడిగా అనిపిస్తున్నాయి",
  "Daily life feels hard": "రోజువారీ జీవితం కష్టంగా అనిపిస్తోంది",
  "Spiritual life feels distant": "ఆధ్యాత్మిక జీవితం దూరంగా అనిపిస్తోంది",

  // ── turn_3_life_context_growth ─────────────────────────────────────────────
  "What do you want to strengthen?": "మీరు ఏమి బలపరచుకోవాలనుకుంటున్నారు?",
  "Pick what feels most alive right now.": "ఇప్పుడు అత్యంత జీవంతంగా అనిపించేది ఎంచుకోండి.",
  "Work with purpose": "లక్ష్యంతో పని",
  "Deepen connection at home": "ఇంట్లో అనుబంధాన్ని లోతుగా చేయండి",
  "See more clearly": "మరింత స్పష్టంగా చూడండి",
  "Carry steadiness outward": "స్థిరత్వాన్ని బాహ్యంగా తీసుకెళ్ళండి",
  "Deepen gratitude": "కృతజ్ఞతను లోతుగా చేయండి",
  "Move through what's changing": "మారుతున్న దాన్ని దాటి వెళ్ళండి",
  "Grow through studies": "చదువుల ద్వారా ఎదగండి",
  "Strengthen myself": "నన్ను నేను బలపరచుకోండి",
  "Care for my energy": "నా శక్తిని జాగ్రత్తగా ఉంచుకోండి",
  "Build trust around money": "డబ్బు చుట్టూ నమ్మకం పెంచుకోండి",
  "Steadiness in daily life": "రోజువారీ జీవితంలో స్థిరత్వం",
  "Return to devotion": "భక్తికి తిరిగి వెళ్ళండి",

  // ── turn_3_support ──────────────────────────────────────────────────────────
  "What feels strongest right now?": "ఇప్పుడు అత్యంత బలంగా ఏది అనిపిస్తోంది?",
  "Pick where you feel it most.": "ఎక్కడ అత్యంత తీవ్రంగా అనిపిస్తోందో ఎంచుకోండి.",
  "My body feels tight": "నా శరీరం బిగుసుకుపోయినట్లు అనిపిస్తోంది",
  "My breathing feels off": "నా శ్వాస సరిగా అనిపించడం లేదు",
  "My mind won't settle": "నా మనసు స్థిరపడడం లేదు",
  "I don't know what to do": "నాకు ఏమి చేయాలో తెలియడం లేదు",
  "Something feels heavy inside": "లోపల ఏదో భారంగా అనిపిస్తోంది",

  // ── turn_3_growth ───────────────────────────────────────────────────────────
  "What feels present right now?": "ఇప్పుడు ఏది ఉన్నట్లు అనిపిస్తోంది?",
  "Pick whichever fits today.": "ఈ రోజు ఏది సరిగా అనిపిస్తుందో ఎంచుకోండి.",
  "I feel steady": "నేను స్థిరంగా అనిపిస్తున్నాను",
  "I feel thankful": "నేను కృతజ్ఞంగా అనిపిస్తున్నాను",
  "Something is changing": "ఏదో మారుతోంది",
  "I feel better today": "ఈ రోజు నేను మెరుగ్గా అనిపిస్తున్నాను",
  "I want to grow": "నేను ఎదగాలనుకుంటున్నాను",
  "I want more meaning": "నాకు మరింత అర్థం కావాలి",

  // ── turn_4_support ──────────────────────────────────────────────────────────
  "What is your mind doing?": "మీ మనసు ఏమి చేస్తోంది?",
  "This helps me see the movement.": "ఇది నాకు కదలికను చూడడంలో సహాయపడుతుంది.",
  "It keeps replaying": "అది పదే పదే పునరావృతమవుతూ ఉంది",
  "It keeps worrying ahead": "అది ముందు గురించి ఆందోళన పడుతూ ఉంది",
  "It keeps comparing": "అది పోల్చుతూ ఉంది",
  "It keeps arguing inside": "అది లోపల వాదిస్తూ ఉంది",
  "It goes blank": "అది నిర్లిప్తంగా అయిపోతోంది",
  "It keeps holding on": "అది పట్టుకుంటూ ఉంది",
  "It keeps pushing away": "అది వెళ్ళగొడుతూ ఉంది",

  // ── turn_4_growth ───────────────────────────────────────────────────────────
  "What do you want more of right now?": "ఇప్పుడు మీకు మరింత ఏమి కావాలి?",
  "The one that pulls you most.": "మిమ్మల్ని అత్యంత ఆకర్షించేది.",
  "More clarity": "మరింత స్పష్టత",
  "More peace": "మరింత శాంతి",
  "More strength": "మరింత శక్తి",
  "More devotion": "మరింత భక్తి",
  "More purpose": "మరింత లక్ష్యం",
  "More steadiness": "మరింత స్థిరత్వం",

  // ── turn_5_support ──────────────────────────────────────────────────────────
  "What feels underneath it most?": "దాని కింద అత్యంత ఏముంది?",
  "Pick what feels truest, even if small.": "చిన్నదైనా సరే, అత్యంత నిజమైనదాన్ని ఎంచుకోండి.",
  "Fear": "భయం",
  "Holding on too tightly": "చాలా గట్టిగా పట్టుకోవడం",
  "Not wanting this at all": "ఇది అస్సలు వద్దని అనిపించడం",
  "Feeling hurt": "గాయపడినట్లు అనిపించడం",
  "Confusion": "గందరగోళం",
  "I'm not sure": "నాకు తెలియడం లేదు",

  // ── turn_5_growth ───────────────────────────────────────────────────────────
  "What would help most today?": "ఈ రోజు అత్యంత ఏది సహాయపడుతుంది?",
  "Pick whichever feels right.": "సరిగా అనిపించేది ఎంచుకోండి.",
  "Something quiet": "ఏదో నిశ్శబ్దంగా",
  "Something practical": "ఏదో ఆచరణాత్మకంగా",
  "Something uplifting": "ఏదో ఉత్తేజకరంగా",
  "Something devotional": "ఏదో భక్తిపూర్వకంగా",
  "Something grounding": "ఏదో స్థిరంగా",
  "Something to think through": "ఏదో ఆలోచించడానికి",

  // ── turn_6 (guidance mode) ──────────────────────────────────────────────────
  "How would you like this guidance to sound?":
    "ఈ మార్గదర్శనం ఎలా వినాలని అనిపిస్తోంది?",
  "Some people prefer simple, modern language. Some like a blend. Some want the deeper roots visible.":
    "కొంతమంది సరళమైన, ఆధునిక భాషను ఇష్టపడతారు. కొంతమంది మిశ్రమాన్ని ఇష్టపడతారు. కొంతమంది లోతైన వేర్లు కనిపించాలనుకుంటారు.",

  // ── turn_7 ──────────────────────────────────────────────────────────────────
  "RECOGNITION": "గుర్తింపు",
  "Show me my path": "నాకు నా మార్గం చూపించండి",

  // ── turn_8 ──────────────────────────────────────────────────────────────────
  "This is what I'm holding for you today:":
    "ఈ రోజు నేను మీ కోసం ఇది తీసుకొచ్చాను:",
  "Begin my journey": "నా ప్రయాణం మొదలుపెట్టండి",

  // ── turn_3 (dynamic friction / legacy) ─────────────────────────────────────
  "Or describe it...": "లేదా వివరించండి...",
  "Racing — mind moving too fast": "పరుగెడుతోంది — మనసు చాలా వేగంగా కదులుతోంది",
  "Drained — low energy, nothing left": "అలసిపోయింది — శక్తి తక్కువగా, ఏమీ మిగలలేదు",
  "Foggy — can't see clearly": "మబ్బుగా ఉంది — స్పష్టంగా కనిపించడం లేదు",
  "Heavy — everything weighs": "భారంగా ఉంది — అంతా బరువుగా అనిపిస్తోంది",
  "Restless — moving but going nowhere": "అశాంతిగా ఉంది — కదులుతున్నాను కానీ ఎక్కడికీ చేరడం లేదు",
  "Actually clear — but there's a lot to hold": "నిజంగా స్పష్టంగా ఉంది — కానీ చాలా నిలువ ఉంది",

  // ── turn_2_legacy ───────────────────────────────────────────────────────────
  "Where would you like support right now?": "ఇప్పుడు మీకు ఎక్కడ సహాయం కావాలి?",
  "Choose what feels closest. We can take it from there.":
    "అత్యంత దగ్గరగా అనిపించేది ఎంచుకోండి. మేము అక్కడ నుండి తీసుకెళ్తాం.",
  "Work feels unclear": "పని అస్పష్టంగా అనిపిస్తోంది",
  "A relationship needs care": "ఒక సంబంధానికి శ్రద్ధ అవసరం",
  "My mind needs quiet": "నా మనసుకు నిశ్శబ్దం కావాలి",
  "I'm moving through uncertainty": "నేను అనిశ్చితత్వం గుండా వెళ్తున్నాను",
  "My energy feels low": "నా శక్తి తక్కువగా అనిపిస్తోంది",
  "I'm trying to understand myself": "నేను నన్ను నేను అర్థం చేసుకోవడానికి ప్రయత్నిస్తున్నాను",
  "I want to grow spiritually": "నేను ఆధ్యాత్మికంగా ఎదగాలనుకుంటున్నాను",
  "Or tell me in your own words...": "లేదా మీ మాటల్లో చెప్పండి...",

  // ── turn_4 voice / text ──────────────────────────────────────────────────────
  "How would you like me to be with you?":
    "మీరు నన్ను ఎలా మీతో ఉండాలనుకుంటున్నారు?",
  "I can speak with you, or keep things quiet and written.":
    "నేను మీతో మాట్లాడగలను, లేదా అన్నీ నిశ్శబ్దంగా మరియు రాతపూర్వకంగా ఉంచగలను.",

  // ── misc placeholders ───────────────────────────────────────────────────────
  "Or share in your own words": "లేదా మీ మాటల్లో పంచుకోండి",
  "Share your reflection": "మీ మననం పంచుకోండి",

  // ── PathEmergesBlock (turn_8) ────────────────────────────────────────────────
  "Your Mantra": "మీ మంత్రం",
  "Your Intention": "మీ సంకల్పం",
  "Your Practice": "మీ అభ్యాసం",
  "Why these were chosen": "ఇవి ఎందుకు ఎంచుకోబడ్డాయి",
  "Understand why Mitra selected this mantra, sankalp, and practice.":
    "మిత్ర ఈ మంత్రం, సంకల్పం మరియు అభ్యాసం ఎందుకు ఎంచుకున్నారో అర్థం చేసుకోండి.",
  "Chosen with care": "జాగ్రత్తగా ఎంచుకోబడింది",
  "Why this supports today": "ఇది ఈ రోజు ఎందుకు సహాయపడుతుంది",
  "Essence": "సారాంశం",
  "Shift": "మార్పు",
  "Useful for": "ఉపయోగపడుతుంది",
  "Rooted in": "ఆధారితమైంది",
  "This isn't homework. It's sadhana — a daily practice that builds something real over time.":
    "ఇది హోంవర్క్ కాదు. ఇది సాధన — కాలక్రమేణా నిజమైనది నిర్మించే రోజువారీ అభ్యాసం.",
};

/** Recursively walk a plain object/array and replace known English strings. */
function walkAndTranslate(map: Record<string, string>, node: unknown): unknown {
  if (typeof node === "string") {
    return map[node] ?? node;
  }
  if (Array.isArray(node)) {
    return node.map((item) => walkAndTranslate(map, item));
  }
  if (node !== null && typeof node === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(node as Record<string, unknown>)) {
      result[key] = walkAndTranslate(map, val);
    }
    return result;
  }
  return node;
}

/**
 * Return a deep copy of `schema` with all known strings replaced by the
 * target-locale equivalent. Returns schema unchanged for 'en'.
 */
export function localizeScreenSchema(schema: unknown, locale: string): unknown {
  if (locale === "hi") return walkAndTranslate(SCREEN_STRINGS_HI, schema);
  if (locale === "te") return walkAndTranslate(SCREEN_STRINGS_TE, schema);
  return schema;
}
