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
  "What feels strongest right now?": "अभी क्या सबसे प्रबल लग रहा है?",
  "Pick where you feel it most.": "जहाँ सबसे ज़्यादा महसूस हो वह चुनें।",
  "My body feels tight": "मेरा शरीर तनावग्रस्त महसूस होता है",
  "My breathing feels off": "मेरी साँसें ठीक नहीं लग रहीं",
  "My mind won't settle": "मेरा मन स्थिर नहीं हो रहा",
  "I don't know what to do": "मुझे नहीं पता क्या करूँ",
  "Something feels heavy inside": "अंदर कुछ भारी लग रहा है",

  // ── turn_3_growth ───────────────────────────────────────────────────────────
  "What feels present right now?": "अभी क्या उपस्थित लग रहा है?",
  "Pick whichever fits today.": "जो आज ठीक लगे वह चुनें।",
  "I feel steady": "मैं स्थिर महसूस कर रहा/रही हूँ",
  "I feel thankful": "मैं कृतज्ञ महसूस कर रहा/रही हूँ",
  "Something is changing": "कुछ बदल रहा है",
  "I feel better today": "मैं आज बेहतर महसूस कर रहा/रही हूँ",
  "I want to grow": "मैं बढ़ना चाहता/चाहती हूँ",
  "I want more meaning": "मुझे अधिक अर्थ चाहिए",

  // ── turn_4_support ──────────────────────────────────────────────────────────
  "What is your mind doing?": "आपका मन क्या कर रहा है?",
  "This helps me see the movement.": "इससे मुझे गति देखने में मदद मिलती है।",
  "It keeps replaying": "वह बार-बार दोहराता है",
  "It keeps worrying ahead": "वह आगे की चिंता करता रहता है",
  "It keeps comparing": "वह तुलना करता रहता है",
  "It keeps arguing inside": "वह अंदर से बहस करता रहता है",
  "It goes blank": "वह रिक्त हो जाता है",
  "It keeps holding on": "वह पकड़े रहता है",
  "It keeps pushing away": "वह धकेलता रहता है",

  // ── turn_4_growth ───────────────────────────────────────────────────────────
  "What do you want more of right now?": "अभी आप क्या अधिक चाहते हैं?",
  "The one that pulls you most.": "जो सबसे ज़्यादा खींचे।",
  "More clarity": "अधिक स्पष्टता",
  "More peace": "अधिक शांति",
  "More strength": "अधिक शक्ति",
  "More devotion": "अधिक भक्ति",
  "More purpose": "अधिक उद्देश्य",
  "More steadiness": "अधिक स्थिरता",

  // ── turn_5_support ──────────────────────────────────────────────────────────
  "What feels underneath it most?": "इसके नीचे सबसे ज़्यादा क्या है?",
  "Pick what feels truest, even if small.": "जो सबसे सच्चा लगे वह चुनें, भले ही छोटा हो।",
  "Fear": "भय",
  "Holding on too tightly": "बहुत कसकर पकड़े रहना",
  "Not wanting this at all": "यह बिल्कुल नहीं चाहना",
  "Feeling hurt": "आहत महसूस करना",
  "Confusion": "भ्रम",
  "I'm not sure": "मुझे यकीन नहीं",

  // ── turn_5_growth ───────────────────────────────────────────────────────────
  "What would help most today?": "आज क्या सबसे अधिक मदद करेगा?",
  "Pick whichever feels right.": "जो सही लगे वह चुनें।",
  "Something quiet": "कुछ शांत",
  "Something practical": "कुछ व्यावहारिक",
  "Something uplifting": "कुछ उत्साहवर्धक",
  "Something devotional": "कुछ भक्तिपूर्ण",
  "Something grounding": "कुछ स्थिर करने वाला",
  "Something to think through": "कुछ विचार करने के लिए",

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
  "Or describe it...": "या इसे वर्णित करें...",
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
    "यह गृहकार्य नहीं है। यह साधना है — एक दैनिक अभ्यास जो समय के साथ कुछ वास्तविक बनाता है।",
};

/** Recursively walk a plain object/array and replace known English strings with Hindi. */
function walkAndTranslate(node: unknown): unknown {
  if (typeof node === "string") {
    return SCREEN_STRINGS_HI[node] ?? node;
  }
  if (Array.isArray(node)) {
    return node.map(walkAndTranslate);
  }
  if (node !== null && typeof node === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(node as Record<string, unknown>)) {
      result[key] = walkAndTranslate(val);
    }
    return result;
  }
  return node;
}

/**
 * Return a deep copy of `schema` with all known strings replaced by Hindi.
 * If locale is 'en', returns the schema unchanged.
 */
export function localizeScreenSchema(schema: unknown, locale: string): unknown {
  if (locale !== "hi") return schema;
  return walkAndTranslate(schema);
}
