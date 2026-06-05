/**
 * CarryCaptureModal — web equivalent of RN carry capture flow (Phase 13.5).
 * Handles in_room_carry actions that require text input + sacred POST.
 *
 * Keep the authored fallback copy in sync with:
 * apps/mobile/src/blocks/room/actions/RoomActionCarryPill.tsx
 */
import { useEffect, useState } from "react";
import { useTranslation } from "../../../lib/i18n";
import { postRoomSacred } from "../../../engine/mitraApi";

const MAX_TEXT = 1000;

type CarryModalCopy = {
  title?: string;
  prompt: string;
  placeholder: string;
  primary_label: string;
  sanatan_context?: string;
  why_we_ask?: string;
  confirmation?: string;
  add_another_label?: string;
};

// Generic fallback copy for carry types (RN source: CARRY_MEMORY_MODAL)
const CARRY_MEMORY_MODAL_HI: Record<string, CarryModalCopy> = {
  joy_carry: {
    prompt: "इस पल से आप क्या अपने साथ ले जाना चाहते हैं?",
    placeholder: "जो आपने देखा, महसूस किया, या थामना चाहते हैं...",
    primary_label: "इसे थाम लें",
    sanatan_context: "जागरूकता के साथ थामा गया आनंद प्रकाश का स्रोत बन जाता है।",
  },
  release_capture: {
    prompt: "अभी आप क्या रख जा रहे हैं?",
    placeholder: "जो आप छोड़ रहे हैं उसे नाम दें...",
    primary_label: "इसे रख दें",
  },
  growth_reflect: {
    prompt: "कौन सी अंतर्दृष्टि या संकल्प आप अपने साथ ले जाना चाहते हैं?",
    placeholder: "आपका मनन...",
    primary_label: "इसे थाम लें",
  },
  clarity_note: {
    prompt: "आपके लिए क्या स्पष्ट हो गया?",
    placeholder: "स्पष्टता का नोट...",
    primary_label: "इसे याद रखें",
  },
  stillness_note: {
    title: "जो शांत हुआ उसे लिखें",
    prompt: "आज स्थिरता ने आपको क्या दिया?",
    placeholder: "मौन में जो उभरा...",
    primary_label: "इसे रखें",
  },
  stillness_named: {
    title: "जो शांत हुआ उसे लिखें",
    sanatan_context: "जब ध्यान एक स्थिर आधार पर लौटता है तब स्थिरता शुरू होती है।",
    why_we_ask: "जो स्थिर हुआ उसे नाम देने से शोर के नीचे की ज़मीन पहचानी जाती है।",
    prompt: "अभी क्या शांत लग रहा है?",
    placeholder: "एक शब्द या कुछ पंक्तियाँ लिखें...",
    primary_label: "इस स्थिरता को सहेजें",
    confirmation: "सहेजा गया।",
    add_another_label: "और लिखें",
  },
  clarity_journal: {
    title: "एक ईमानदार प्रश्न लिखें",
    sanatan_context: "स्पष्टता तब आती है जब हम भ्रम का अनुसरण करना बंद कर देते हैं और जो वास्तव में यहाँ है उसे देखते हैं।",
    why_we_ask: "प्रश्न लिखना वास्तविक निर्णय को उसके चारों ओर के शोर से अलग कर देता है।",
    prompt: "वह प्रश्न क्या है जिसके साथ आप वास्तव में बैठे हैं?",
    placeholder: "अपना ईमानदार प्रश्न लिखें...",
    primary_label: "यह प्रश्न सहेजें",
    confirmation: "सहेजा गया। आप और लिख सकते हैं।",
    add_another_label: "और लिखें",
  },
  connection_named: {
    title: "किसी अपने का नाम लें",
    sanatan_context: "किसी का नाम लेने से आप अकेलेपन से उस एक धागे की ओर लौटते हैं जो आपकी परवाह करता है।",
    why_we_ask: "संबंध हमें याद दिलाता है कि एक सच्चा बंधन भी हमें थाम सकता है।",
    prompt: "अभी आपके दिल के करीब कौन है?",
    placeholder: "नाम, रिश्ता, या कुछ शब्द लिखें...",
    primary_label: "यह संबंध सहेजें",
    confirmation: "सहेजा गया। आप और नाम ले सकते हैं।",
    add_another_label: "और नाम लें",
  },
  joy_named: {
    title: "अभी जो अच्छा है वो लिखें",
    sanatan_context: "संतोष वहाँ से शुरू होता है जहाँ हम देखते हैं कि क्या पहले से पर्याप्त है।",
    why_we_ask: "एक अच्छी बात लिखने से मन उसके साथ रुकता है, आगे दौड़ने की बजाय।",
    prompt: "अभी क्या अच्छा, स्थिर, या चुपचाप पर्याप्त लगता है?",
    placeholder: "एक अच्छी बात लिखें...",
    primary_label: "यह आनंद सहेजें",
    confirmation: "सहेजा गया। आप और लिख सकते हैं।",
    add_another_label: "और लिखें",
  },
  growth_journal: {
    title: "जो आपने देखा वो लिखें",
    sanatan_context: "विकास गति से नहीं, एक सही कर्म की जागरूकता से पकता है।",
    why_we_ask: "जो आपने देखा उसे नाम देना अवलोकन को अगले कदम का बीज बना देता है।",
    prompt: "आपने क्या देखा, या क्या आकार ले रहा है?",
    placeholder: "जो उभरा वो लिखें...",
    primary_label: "इसे सहेजें",
    confirmation: "सहेजा गया। आप और लिख सकते हैं।",
    add_another_label: "और लिखें",
  },
  connection_reach_out: {
    title: "किसी एक व्यक्ति तक पहुँचें",
    sanatan_context: "पहुँचने का एक छोटा कर्म स्वयं ही संबंध का अभ्यास है।",
    why_we_ask: "संदेश लिखना — भेजे बिना भी — संबंध को करीब लाता है।",
    prompt: "किसी अपने को एक छोटा संदेश लिखें।",
    placeholder: "आपका संदेश...",
    primary_label: "सहेजें और संदेश कॉपी करें",
    confirmation: "सहेजा गया। आप और जोड़ सकते हैं।",
    add_another_label: "और जोड़ें",
  },
  release_named: {
    title: "जो आप रख जा रहे हैं उसे नाम दें",
    sanatan_context: "भार का नाम लेने से आप उससे अलग हो पाते हैं जिसे आप ढो रहे हैं।",
    why_we_ask: "छोड़ना हार नहीं है। यह पकड़ ढीली करना है ताकि जीवन फिर से बह सके।",
    prompt: "अभी के लिए क्या रखने के लिए तैयार है?",
    placeholder: "एक शब्द या कुछ पंक्तियाँ लिखें...",
    primary_label: "यह विसर्जन सहेजें",
    confirmation: "सहेजा गया। आपने इसे रख दिया।",
    add_another_label: "और नाम लें",
  },
  connection_note: {
    prompt: "इस जुड़ाव की भावना से आप क्या अपने साथ ले जाना चाहते हैं?",
    placeholder: "आपका नोट...",
    primary_label: "इसे सहेजें",
  },
  generic: {
    prompt: "इससे आप क्या याद रखना चाहते हैं?",
    placeholder: "आपका मनन...",
    primary_label: "सहेजें",
  },
};

const CARRY_MODAL_BY_CONTEXT_HI: Record<string, Record<string, CarryModalCopy>> = {
  clarity_journal: {
    money_security: {
      title: "पैसे का प्रश्न स्पष्ट रूप से लिखें",
      sanatan_context: "प्रश्न का नाम लेना स्वयं ही स्पष्टता का पहला कदम है।",
      why_we_ask: "पैसे की उलझन अक्सर एक साथ बहुत सारे प्रश्नों से आती है। एक लिखना बाकी से अलग कर देता है।",
      prompt: "जो पैसे का प्रश्न आप थामे हैं वो वास्तव में क्या है?",
      placeholder: "एक स्पष्ट प्रश्न लिखें...",
      primary_label: "यह प्रश्न सहेजें",
      confirmation: "सहेजा गया। आप और लिख सकते हैं।",
      add_another_label: "और लिखें",
    },
    work_career: {
      title: "लिखें कि आपका काम वास्तव में क्या माँग रहा है",
      sanatan_context: "जब कर्म और धर्म एक हो जाते हैं तो स्पष्टता आती है। पहले देखें कि वास्तव में क्या माँगा जा रहा है।",
      why_we_ask: "काम में अक्सर शोर के नीचे एक असली प्रश्न होता है। उसे लिखना दिखाता है कि वास्तव में क्या उत्तर चाहिए।",
      prompt: "अभी आपका काम आपसे वास्तव में क्या माँग रहा है?",
      placeholder: "असली प्रश्न लिखें...",
      primary_label: "इसे सहेजें",
      confirmation: "सहेजा गया। आप और लिख सकते हैं।",
      add_another_label: "और लिखें",
    },
  },
  release_named: {
    money_security: {
      title: "नाम दें जो आप अभी के लिए रख जा रहे हैं",
      sanatan_context: "भार तभी भारी होता है जब हम भूल जाते हैं कि हम उसे रख सकते हैं।",
      why_we_ask: "पैसे की चिंता शरीर में बंध जाती है। जो आप रख जा रहे हैं उसे नाम देना, थोड़े समय के लिए भी, पकड़ ढीली करता है।",
      prompt: "कौन सी पैसे की चिंता अभी के लिए रखने के लिए तैयार है?",
      placeholder: "एक शब्द या कुछ पंक्तियाँ लिखें...",
      primary_label: "यह विसर्जन सहेजें",
      confirmation: "सहेजा गया। आपने इसे रख दिया।",
      add_another_label: "और नाम लें",
    },
    relationships: {
      title: "नाम दें जो आप इस रिश्ते में छोड़ रहे हैं",
      sanatan_context: "संबंध हमें याद दिलाता है कि एक सच्चा बंधन भी हमें थाम सकता है।",
      why_we_ask: "किसी का नाम लेना आपको अकेलेपन से उस देखभाल के एक धागे की ओर वापस लाता है।",
      prompt: "इस रिश्ते में आप अभी के लिए क्या छोड़ने के लिए तैयार हैं?",
      placeholder: "एक शब्द या कुछ पंक्तियाँ लिखें...",
      primary_label: "यह विसर्जन सहेजें",
      confirmation: "सहेजा गया। आपने इसे रख दिया।",
      add_another_label: "और नाम लें",
    },
  },
  growth_journal: {
    work_career: {
      title: "काम का अगला कदम लिखें",
      sanatan_context: "गति से नहीं, ध्यान से किया कर्म असली विकास में पकता है।",
      why_we_ask: "काम में अगला सही कदम अक्सर हम सोचते हैं उससे छोटा होता है। लिखना उसे वास्तविक बना देता है।",
      prompt: "आपका काम एक अगले कदम के लिए क्या माँग रहा है?",
      placeholder: "एक स्पष्ट कदम लिखें...",
      primary_label: "यह कदम सहेजें",
      confirmation: "सहेजा गया। आप और लिख सकते हैं।",
      add_another_label: "और लिखें",
    },
    purpose_direction: {
      title: "लिखें जो आपको आगे करना है",
      sanatan_context: "धर्म जीवन की योजना नहीं है — यह अगला सही कर्म है, श्रद्धा से किया गया।",
      why_we_ask: "जब मार्ग अस्पष्ट हो तब जो आपका लगता है वो लिखना सुनने का कर्म है।",
      prompt: "क्या आपका लगता है जो आपको करना है, भले ही पूरा मार्ग अभी स्पष्ट न हो?",
      placeholder: "जो आए वो लिखें...",
      primary_label: "इसे सहेजें",
      confirmation: "सहेजा गया। आप और लिख सकते हैं।",
      add_another_label: "और लिखें",
    },
  },
  joy_named: {
    health_energy: {
      title: "आज के शरीर से एक अच्छी बात लिखें",
      sanatan_context: "शरीर एक उपहार है। उसके लिए कृतज्ञता, चाहे छोटी सी हो, कुछ वापस करती है।",
      why_we_ask: "जब शरीर कठिन लगे तब उसमें एक अच्छी चीज़ खोजना देखभाल का एक कोमल कर्म है।",
      prompt: "अभी आपका शरीर क्या अच्छे से कर रहा है या कैसा महसूस कर रहा है?",
      placeholder: "एक अच्छी बात लिखें...",
      primary_label: "यह आनंद सहेजें",
      confirmation: "सहेजा गया। आप और लिख सकते हैं।",
      add_another_label: "और लिखें",
    },
  },
  connection_named: {
    relationships: {
      title: "उस व्यक्ति का नाम लें जिसके पास लौटना है",
      sanatan_context: "संबंध कहता है — स्मृति में थामा बंधन देखभाल करता रहता है।",
      why_we_ask: "जब कोई रिश्ता दूर या तनावपूर्ण लगे, नाम लेना उस धागे को जीवित रखता है।",
      prompt: "वह कौन है जिसके करीब आप रहना चाहते हैं?",
      placeholder: "नाम या कुछ शब्द लिखें...",
      primary_label: "यह संबंध सहेजें",
      confirmation: "सहेजा गया। आप और नाम ले सकते हैं।",
      add_another_label: "और नाम लें",
    },
    health_energy: {
      title: "किसी अपने का नाम लें जो अभी करीब है",
      sanatan_context: "देखभाल करने वाली संगत स्वयं एक औषधि है। करीब के व्यक्ति का नाम लेना भी कुछ बदल देता है।",
      why_we_ask: "जब शरीर संघर्ष कर रहा हो तब जो करीब है उसका नाम लेना असली सांत्वना लाता है।",
      prompt: "इसमें आपके साथ कौन है, दूरी से भी?",
      placeholder: "नाम या कुछ शब्द लिखें...",
      primary_label: "यह संबंध सहेजें",
      confirmation: "सहेजा गया। आप और नाम ले सकते हैं।",
      add_another_label: "और नाम लें",
    },
  },
  stillness_named: {
    money_security: {
      title: "चिंता के नीचे जो शांत हुआ उसे लिखें",
      sanatan_context: "शोर के नीचे जो है वो हमेशा से शांत रहा है। वो अभी भी है।",
      why_we_ask: "पैसे का दबाव तेज़ होता है। उसके नीचे जो शांत रहा उसे लिखने से आपकी स्थिरता मिलती है।",
      prompt: "पैसे की चिंता के नीचे क्या शांत या स्थिर लगता है, थोड़ा भी?",
      placeholder: "एक शब्द या कुछ पंक्तियाँ लिखें...",
      primary_label: "यह स्थिरता सहेजें",
      confirmation: "सहेजा गया।",
      add_another_label: "और लिखें",
    },
  },
};

const CARRY_MEMORY_MODAL_TE: Record<string, CarryModalCopy> = {
  joy_carry: {
    prompt: "ఈ క్షణం నుండి మీరు ఏమి మీతో తీసుకెళ్ళాలనుకుంటున్నారు?",
    placeholder: "మీరు గమనించింది, అనుభవించింది, లేదా పట్టుకోవాలనుకున్నది...",
    primary_label: "దీన్ని తీసుకెళ్ళండి",
    sanatan_context: "జాగరూకతగా నిలుపుకున్న ఆనందం వెలుతురు మూలం అవుతుంది.",
  },
  release_capture: {
    prompt: "మీరు ఇప్పుడు ఏమి వదులుకుంటున్నారు?",
    placeholder: "మీరు విడిచిపెడుతున్నదాన్ని పేర్కొనండి...",
    primary_label: "దీన్ని వదిలివేయండి",
  },
  growth_reflect: {
    prompt: "ఏ అంతర్దృష్టి లేదా సంకల్పం మీతో తీసుకెళ్ళాలనుకుంటున్నారు?",
    placeholder: "మీ ధ్యానం...",
    primary_label: "దీన్ని పట్టుకోండి",
  },
  clarity_note: {
    prompt: "మీకు ఏమి స్పష్టమైంది?",
    placeholder: "మీ స్పష్టత నోట్...",
    primary_label: "దీన్ని గుర్తుంచుకోండి",
  },
  stillness_note: {
    title: "ఏమి శాంతించిందో రాయండి",
    prompt: "ఈరోజు శాంతి మీకు ఏమి ఇచ్చింది?",
    placeholder: "నిశ్శబ్దంలో ఏమి వచ్చిందో...",
    primary_label: "దీన్ని ఉంచండి",
  },
  stillness_named: {
    title: "ఏమి శాంతించిందో రాయండి",
    sanatan_context: "ధ్యానం ఒక స్థిరమైన ఆధారానికి తిరిగి వచ్చినప్పుడు శాంతి మొదలవుతుంది.",
    why_we_ask: "ఏమి స్థిరపడిందో పేర్కొనడం వల్ల శబ్దానికి అడుగున ఉన్న నేలను గుర్తించగలం.",
    prompt: "ఇప్పుడు ఏమి శాంతంగా అనిపిస్తోంది?",
    placeholder: "ఒక మాట లేదా కొన్ని వాక్యాలు రాయండి...",
    primary_label: "ఈ శాంతిని సేవ్ చేయండి",
    confirmation: "సేవ్ అయింది.",
    add_another_label: "మరొకటి రాయండి",
  },
  clarity_journal: {
    title: "ఒక నిజాయితీ ప్రశ్న రాయండి",
    sanatan_context: "గందరగోళాన్ని అనుసరించడం ఆపి నిజంగా ఇక్కడ ఏమి ఉందో చూసినప్పుడు స్పష్టత వస్తుంది.",
    why_we_ask: "ప్రశ్న రాయడం వల్ల నిజమైన నిర్ణయం దాని చుట్టూ ఉన్న శబ్దం నుండి వేరవుతుంది.",
    prompt: "మీరు నిజంగా ఏ ప్రశ్నతో కూర్చున్నారు?",
    placeholder: "మీ నిజాయితీ ప్రశ్న రాయండి...",
    primary_label: "ఈ ప్రశ్నను సేవ్ చేయండి",
    confirmation: "సేవ్ అయింది. మీరు మరొకటి రాయవచ్చు.",
    add_another_label: "మరొకటి రాయండి",
  },
  connection_named: {
    title: "మీకు ముఖ్యమైన వ్యక్తి పేరు చెప్పండి",
    sanatan_context: "పేరు చెప్పడం వల్ల మీరు ఒంటరితనం నుండి సంరక్షణ దారానికి తిరిగి వస్తారు.",
    why_we_ask: "సంబంధం మనకు గుర్తు చేస్తుంది — ఒక నిజమైన బంధం కూడా మనల్ని నిలబెట్టగలదు.",
    prompt: "ఇప్పుడు మీ హృదయానికి సమీపంగా ఎవరు ఉన్నారు?",
    placeholder: "పేరు, సంబంధం, లేదా కొన్ని మాటలు రాయండి...",
    primary_label: "ఈ అనుబంధాన్ని సేవ్ చేయండి",
    confirmation: "సేవ్ అయింది. మీరు మరొకరి పేరు చెప్పవచ్చు.",
    add_another_label: "మరొకరి పేరు చెప్పండి",
  },
  joy_named: {
    title: "ఇప్పుడు ఏమి మంచిగా ఉందో రాయండి",
    sanatan_context: "సంతోషం అక్కడ నుండి మొదలవుతుంది — ఏమి ఇప్పటికే సరిపోతుందో గమనించడం నుండి.",
    why_we_ask: "ఒక మంచి విషయం రాయడం వల్ల మనసు దాని వద్ద ఆగుతుంది, ముందుకు పరిగెత్తే బదులు.",
    prompt: "ఇప్పుడు ఏమి మంచిగా, స్థిరంగా, లేదా నిశ్శబ్దంగా సరిపోతున్నట్లు అనిపిస్తోంది?",
    placeholder: "ఒక మంచి విషయం రాయండి...",
    primary_label: "ఈ ఆనందాన్ని సేవ్ చేయండి",
    confirmation: "సేవ్ అయింది. మీరు మరొకటి రాయవచ్చు.",
    add_another_label: "మరొకటి రాయండి",
  },
  growth_journal: {
    title: "మీరు గమనించింది రాయండి",
    sanatan_context: "వేగంతో కాదు — జాగ్రత్తగా చేసిన ఒక సరైన కర్మ నిజమైన వికాసంగా పండుతుంది.",
    why_we_ask: "మీరు గమనించింది పేర్కొనడం పరిశీలనను తదుపరి అడుగుకు విత్తనంగా మారుస్తుంది.",
    prompt: "మీరు ఏమి గమనించారు, లేదా ఏమి రూపుదిద్దుకుంటోంది?",
    placeholder: "వచ్చింది రాయండి...",
    primary_label: "దీన్ని సేవ్ చేయండి",
    confirmation: "సేవ్ అయింది. మీరు మరొకటి రాయవచ్చు.",
    add_another_label: "మరొకటి రాయండి",
  },
  connection_reach_out: {
    title: "ఒక వ్యక్తికి చేరండి",
    sanatan_context: "చేరడానికి ఒక చిన్న కర్మ స్వయంగా సంబంధం యొక్క అభ్యాసం.",
    why_we_ask: "సందేశం రాయడం — పంపకుండా అయినా — అనుబంధాన్ని దగ్గరగా తెస్తుంది.",
    prompt: "మీకు ముఖ్యమైన వ్యక్తికి ఒక చిన్న సందేశం రాయండి.",
    placeholder: "మీ సందేశం...",
    primary_label: "సేవ్ చేసి సందేశం కాపీ చేయండి",
    confirmation: "సేవ్ అయింది. మీరు మరొకటి జోడించవచ్చు.",
    add_another_label: "మరొకటి జోడించండి",
  },
  release_named: {
    title: "మీరు ఏమి వదులుతున్నారో పేర్కొనండి",
    sanatan_context: "భారానికి పేరు పెట్టడం వల్ల మీరు మీరు మోస్తున్నదాని నుండి వేరవుతారు.",
    why_we_ask: "వదులుకోవడం ఓటమి కాదు. జీవితం మళ్ళీ కదలడానికి పట్టు వదలడం.",
    prompt: "ఇప్పుడు ఏమి వదులుకోవడానికి సిద్ధంగా ఉంది?",
    placeholder: "ఒక మాట లేదా కొన్ని వాక్యాలు రాయండి...",
    primary_label: "ఈ విడుదలను సేవ్ చేయండి",
    confirmation: "సేవ్ అయింది. మీరు దాన్ని వదిలారు.",
    add_another_label: "మరొకటి పేర్కొనండి",
  },
  connection_note: {
    prompt: "ఈ అనుబంధ భావన నుండి మీరు ఏమి తీసుకెళ్ళాలనుకుంటున్నారు?",
    placeholder: "మీ నోట్...",
    primary_label: "దీన్ని సేవ్ చేయండి",
  },
  generic: {
    prompt: "దీని నుండి మీరు ఏమి గుర్తుంచుకోవాలనుకుంటున్నారు?",
    placeholder: "మీ ధ్యానం...",
    primary_label: "సేవ్ చేయండి",
  },
};

const CARRY_MODAL_BY_CONTEXT_TE: Record<string, Record<string, CarryModalCopy>> = {
  clarity_journal: {
    money_security: {
      title: "డబ్బు ప్రశ్నను స్పష్టంగా రాయండి",
      sanatan_context: "ప్రశ్నను పేర్కొనడం స్వయంగా స్పష్టత యొక్క మొదటి అడుగు.",
      why_we_ask: "డబ్బు గందరగోళం తరచుగా చాలా ప్రశ్నలు కలిసిపోవడం వల్ల వస్తుంది. ఒకటి రాయడం మిగతా వాటి నుండి వేరుచేస్తుంది.",
      prompt: "మీరు నిలుపుకున్న డబ్బు ప్రశ్న నిజంగా ఏమిటి?",
      placeholder: "ఒక స్పష్టమైన ప్రశ్న రాయండి...",
      primary_label: "ఈ ప్రశ్నను సేవ్ చేయండి",
      confirmation: "సేవ్ అయింది. మీరు మరొకటి రాయవచ్చు.",
      add_another_label: "మరొకటి రాయండి",
    },
    work_career: {
      title: "మీ పని నిజంగా ఏమి అడుగుతుందో రాయండి",
      sanatan_context: "కర్మ మరియు ధర్మం ఒక్కటైనప్పుడు స్పష్టత వస్తుంది. ముందుగా నిజంగా ఏమి అడుగుతుందో చూడండి.",
      why_we_ask: "పనిలో తరచుగా శబ్దానికి అడుగున ఒక నిజమైన ప్రశ్న ఉంటుంది. రాయడం వల్ల నిజంగా ఏమి జవాబు కావాలో తెలుస్తుంది.",
      prompt: "ఇప్పుడు మీ పని మీ నుండి నిజంగా ఏమి అడుగుతోంది?",
      placeholder: "నిజమైన ప్రశ్న రాయండి...",
      primary_label: "దీన్ని సేవ్ చేయండి",
      confirmation: "సేవ్ అయింది. మీరు మరొకటి రాయవచ్చు.",
      add_another_label: "మరొకటి రాయండి",
    },
  },
  release_named: {
    money_security: {
      title: "మీరు ఇప్పుడు ఏమి వదులుతున్నారో పేర్కొనండి",
      sanatan_context: "మనం దాన్ని వదలగలమని మర్చిపోయినప్పుడే భారం భారంగా అవుతుంది.",
      why_we_ask: "డబ్బు ఆందోళన శరీరంలో బంధమవుతుంది. మీరు వదులుతున్నదాన్ని పేర్కొనడం, కొంత సమయానికైనా, పట్టు వదులుస్తుంది.",
      prompt: "ఏ డబ్బు ఆందోళన ఇప్పుడు వదులుకోవడానికి సిద్ధంగా ఉంది?",
      placeholder: "ఒక మాట లేదా కొన్ని వాక్యాలు రాయండి...",
      primary_label: "ఈ విడుదలను సేవ్ చేయండి",
      confirmation: "సేవ్ అయింది. మీరు దాన్ని వదిలారు.",
      add_another_label: "మరొకటి పేర్కొనండి",
    },
    relationships: {
      title: "ఈ సంబంధంలో మీరు ఏమి వదిలిపెడుతున్నారో పేర్కొనండి",
      sanatan_context: "సంబంధం మనకు గుర్తు చేస్తుంది — ఒక నిజమైన బంధం కూడా మనల్ని నిలబెట్టగలదు.",
      why_we_ask: "పేరు చెప్పడం వల్ల మీరు ఒంటరితనం నుండి సంరక్షణ దారానికి తిరిగి వస్తారు.",
      prompt: "ఈ సంబంధంలో మీరు ఇప్పుడు ఏమి వదులుకోవడానికి సిద్ధంగా ఉన్నారు?",
      placeholder: "ఒక మాట లేదా కొన్ని వాక్యాలు రాయండి...",
      primary_label: "ఈ విడుదలను సేవ్ చేయండి",
      confirmation: "సేవ్ అయింది. మీరు దాన్ని వదిలారు.",
      add_another_label: "మరొకటి పేర్కొనండి",
    },
  },
  growth_journal: {
    work_career: {
      title: "పని యొక్క తదుపరి అడుగు రాయండి",
      sanatan_context: "వేగంతో కాదు — జాగ్రత్తగా చేసిన కర్మ నిజమైన వికాసంగా పండుతుంది.",
      why_we_ask: "పనిలో తదుపరి సరైన అడుగు తరచుగా మనం అనుకున్నదానికంటే చిన్నది. రాయడం వల్ల అది నిజమవుతుంది.",
      prompt: "మీ పని ఒక తదుపరి అడుగు కోసం ఏమి అడుగుతోంది?",
      placeholder: "ఒక స్పష్టమైన అడుగు రాయండి...",
      primary_label: "ఈ అడుగును సేవ్ చేయండి",
      confirmation: "సేవ్ అయింది. మీరు మరొకటి రాయవచ్చు.",
      add_another_label: "మరొకటి రాయండి",
    },
    purpose_direction: {
      title: "మీరు తదుపరి ఏమి చేయాలో రాయండి",
      sanatan_context: "ధర్మం జీవిత ప్రణాళిక కాదు — ఇది తదుపరి సరైన కర్మ, విశ్వాసంతో చేయబడింది.",
      why_we_ask: "మార్గం అస్పష్టంగా ఉన్నప్పుడు, మీకు చేయాలని అనిపించేది రాయడం వినడానికి చేసే కర్మ.",
      prompt: "మీకు చేయాలని అనిపించేది ఏమిటి, పూర్తి మార్గం ఇంకా స్పష్టంగా లేకపోయినా?",
      placeholder: "వచ్చింది రాయండి...",
      primary_label: "దీన్ని సేవ్ చేయండి",
      confirmation: "సేవ్ అయింది. మీరు మరొకటి రాయవచ్చు.",
      add_another_label: "మరొకటి రాయండి",
    },
  },
  joy_named: {
    health_energy: {
      title: "ఈరోజు శరీరం నుండి ఒక మంచి విషయం రాయండి",
      sanatan_context: "శరీరం ఒక బహుమతి. దానికి కృతజ్ఞత, చిన్నదైనా, ఏదో ఒకటి తిరిగి ఇస్తుంది.",
      why_we_ask: "శరీరం కష్టంగా అనిపించినప్పుడు, దానిలో ఒక మంచి విషయం కనుగొనడం సంరక్షణ యొక్క కోమలమైన కర్మ.",
      prompt: "ఇప్పుడు మీ శరీరం ఏమి బాగా చేస్తోంది లేదా ఎలా అనిపిస్తోంది?",
      placeholder: "ఒక మంచి విషయం రాయండి...",
      primary_label: "ఈ ఆనందాన్ని సేవ్ చేయండి",
      confirmation: "సేవ్ అయింది. మీరు మరొకటి రాయవచ్చు.",
      add_another_label: "మరొకటి రాయండి",
    },
  },
  connection_named: {
    relationships: {
      title: "తిరిగి చేరుకోవాలనుకుంటున్న వ్యక్తి పేరు చెప్పండి",
      sanatan_context: "సంబంధం చెప్తుంది — జ్ఞాపకంలో నిలుపుకున్న బంధం సంరక్షణ కొనసాగిస్తుంది.",
      why_we_ask: "సంబంధం దూరంగా లేదా ఒత్తిడిగా అనిపించినప్పుడు, పేరు చెప్పడం ఆ దారాన్ని సజీవంగా ఉంచుతుంది.",
      prompt: "మీరు దగ్గరగా ఉండాలనుకుంటున్న వ్యక్తి ఎవరు?",
      placeholder: "పేరు లేదా కొన్ని మాటలు రాయండి...",
      primary_label: "ఈ అనుబంధాన్ని సేవ్ చేయండి",
      confirmation: "సేవ్ అయింది. మీరు మరొకరి పేరు చెప్పవచ్చు.",
      add_another_label: "మరొకరి పేరు చెప్పండి",
    },
    health_energy: {
      title: "ఇప్పుడు దగ్గరగా ఉన్న వ్యక్తి పేరు చెప్పండి",
      sanatan_context: "సంరక్షించే సంగతి స్వయంగా ఒక ఔషధం. దగ్గరలో ఉన్న వ్యక్తి పేరు చెప్పడమే ఏదో మారుస్తుంది.",
      why_we_ask: "శరీరం కష్టపడుతున్నప్పుడు, దగ్గరలో ఉన్నవారి పేరు చెప్పడం నిజమైన ఓదార్పు ఇస్తుంది.",
      prompt: "దూరం నుండైనా ఇందులో మీతో ఎవరు ఉన్నారు?",
      placeholder: "పేరు లేదా కొన్ని మాటలు రాయండి...",
      primary_label: "ఈ అనుబంధాన్ని సేవ్ చేయండి",
      confirmation: "సేవ్ అయింది. మీరు మరొకరి పేరు చెప్పవచ్చు.",
      add_another_label: "మరొకరి పేరు చెప్పండి",
    },
  },
  stillness_named: {
    money_security: {
      title: "ఆందోళన కింద ఏమి శాంతించిందో రాయండి",
      sanatan_context: "శబ్దానికి అడుగున ఉన్నది ఎప్పుడూ శాంతంగా ఉంది. అది ఇంకా ఉంది.",
      why_we_ask: "డబ్బు ఒత్తిడి గట్టిగా ఉంటుంది. దాని కింద శాంతంగా ఉన్నది రాయడం మీ స్థిరత్వాన్ని కనుగొనడంలో సహాయపడుతుంది.",
      prompt: "డబ్బు ఆందోళన కింద ఏమి శాంతంగా లేదా స్థిరంగా అనిపిస్తోంది, కొంచెమైనా?",
      placeholder: "ఒక మాట లేదా కొన్ని వాక్యాలు రాయండి...",
      primary_label: "ఈ శాంతిని సేవ్ చేయండి",
      confirmation: "సేవ్ అయింది.",
      add_another_label: "మరొకటి రాయండి",
    },
  },
};

const CARRY_MEMORY_MODAL: Record<string, CarryModalCopy> = {
  joy_carry: {
    prompt: "What do you want to carry with you from this moment?",
    placeholder: "What you noticed, felt, or want to hold onto...",
    primary_label: "Carry this",
    sanatan_context: "Joy held with awareness becomes a source of light.",
  },
  release_capture: {
    prompt: "What are you setting down right now?",
    placeholder: "Name what you are releasing...",
    primary_label: "Release it",
  },
  growth_reflect: {
    prompt: "What insight or intention do you want to take with you?",
    placeholder: "Your reflection...",
    primary_label: "Hold this",
  },
  clarity_note: {
    prompt: "What has become clearer for you?",
    placeholder: "Your clarity note...",
    primary_label: "Remember this",
  },
  stillness_note: {
    title: "Write what became still",
    prompt: "What did stillness offer you today?",
    placeholder: "What arose in the quiet...",
    primary_label: "Keep this",
  },
  stillness_named: {
    title: "Write what became still",
    sanatan_context:
      "Stillness begins when attention returns to one steady anchor.",
    why_we_ask:
      "Naming what settled helps you recognize the ground beneath the noise.",
    prompt: "What feels quieter now?",
    placeholder: "Write one word or a few lines…",
    primary_label: "Save this stillness",
    confirmation: "Saved.",
    add_another_label: "Write another",
  },
  clarity_journal: {
    title: "Write one honest question",
    sanatan_context:
      "Clarity comes when we stop obeying confusion and look at what is actually here.",
    why_we_ask:
      "Writing the question separates the real decision from the noise around it.",
    prompt: "What is the question you are actually sitting with?",
    placeholder: "Write your honest question…",
    primary_label: "Save this question",
    confirmation: "Saved. You can write another.",
    add_another_label: "Write another",
  },
  connection_named: {
    title: "Name someone who matters",
    sanatan_context:
      "Naming someone helps you return from feeling alone to one thread of care.",
    why_we_ask: "Sambandha reminds us that even one true bond can hold us.",
    prompt: "Who is close to your heart right now?",
    placeholder: "Write a name, relationship, or a few words…",
    primary_label: "Save this connection",
    confirmation: "Saved. You can name another.",
    add_another_label: "Name another",
  },
  joy_named: {
    title: "Write what’s good right now",
    sanatan_context: "Santosha begins by noticing what is already enough.",
    why_we_ask:
      "Writing one good thing helps the mind stay with it instead of rushing past it.",
    prompt: "What feels good, steady, or quietly enough right now?",
    placeholder: "Write one good thing…",
    primary_label: "Save this joy",
    confirmation: "Saved. You can write another.",
    add_another_label: "Write another",
  },
  growth_journal: {
    title: "Write what you noticed",
    sanatan_context: "Growth ripens through one right action, not speed.",
    why_we_ask:
      "Naming what you noticed turns observation into the seed of a next step.",
    prompt: "What did you notice, or what is forming?",
    placeholder: "Write what came up…",
    primary_label: "Save this",
    confirmation: "Saved. You can write another.",
    add_another_label: "Write another",
  },
  connection_reach_out: {
    title: "Reach out to one person",
    sanatan_context:
      "A short act of reaching is itself the practice of sambandha.",
    why_we_ask:
      "Writing the message — even without sending — brings the connection closer.",
    prompt: "Write a short message to someone who matters.",
    placeholder: "Your message…",
    primary_label: "Save and copy message",
    confirmation: "Saved. You can add another.",
    add_another_label: "Add another",
  },
  release_named: {
    title: "Name what you’re setting down",
    sanatan_context:
      "Naming the weight helps you separate yourself from what you are carrying.",
    why_we_ask:
      "Letting go is not giving up. It is loosening the grip so life can move again.",

    prompt: "What is ready to be set down for now?",
    placeholder: "Write one word or a few lines…",
    primary_label: "Save this release",
    confirmation: "Saved. You set it down.",
    add_another_label: "Name another",
  },
  connection_note: {
    prompt: "What do you want to carry from this sense of connection?",
    placeholder: "Your note...",
    primary_label: "Save this",
  },
  generic: {
    prompt: "What do you want to remember from this?",
    placeholder: "Your reflection...",
    primary_label: "Save",
  },
};

const CARRY_MODAL_BY_CONTEXT: Record<string, Record<string, CarryModalCopy>> = {
  clarity_journal: {
    money_security: {
      title: "Write the money question clearly",
      sanatan_context:
        "Naming the question is itself the first act of clarity.",
      why_we_ask:
        "Money confusion often comes from too many questions tangled together. Writing one separates it from the rest.",
      prompt: "What is the actual money question you are holding?",
      placeholder: "Write one clear question…",
      primary_label: "Save this question",
      confirmation: "Saved. You can write another.",
      add_another_label: "Write another",
    },
    work_career: {
      title: "Write what your work is actually asking",
      sanatan_context:
        "When action and dharma align, clarity follows. First, see what is actually being asked.",
      why_we_ask:
        "Work often has one real question underneath the noise. Writing it down reveals what actually needs answering.",
      prompt: "What is your work actually asking of you right now?",
      placeholder: "Write the real question…",
      primary_label: "Save this",
      confirmation: "Saved. You can write another.",
      add_another_label: "Write another",
    },
  },
  release_named: {
    money_security: {
      title: "Name what you are setting down for now",
      sanatan_context:
        "The weight grows heavier only when we forget we can set it down.",
      why_we_ask:
        "Money worry often locks in the body. Naming what you are setting down, even for a moment, loosens the grip.",
      prompt: "What money worry is ready to be set down for now?",
      placeholder: "Write one word or a few lines…",
      primary_label: "Save this release",
      confirmation: "Saved. You set it down.",
      add_another_label: "Name another",
    },
    relationships: {
      title: "Name what you are releasing in this relationship",
      sanatan_context:
        "Sambandha reminds us that even one true bond can hold us.",
      why_we_ask:
        "Naming someone helps you return from feeling alone to one thread of care.",
      prompt: "What are you ready to release in this relationship for now?",
      placeholder: "Write one word or a few lines…",
      primary_label: "Save this release",
      confirmation: "Saved. You set it down.",
      add_another_label: "Name another",
    },
  },
  growth_journal: {
    work_career: {
      title: "Write the next work step",
      sanatan_context:
        "Action done with attention, not speed, is what ripens into real growth.",
      why_we_ask:
        "At work, the next right step is often smaller than we think. Writing it makes it real.",
      prompt: "What is the one next step your work is asking for?",
      placeholder: "Write one clear step…",
      primary_label: "Save this step",
      confirmation: "Saved. You can write another.",
      add_another_label: "Write another",
    },
    purpose_direction: {
      title: "Write what is yours to do next",
      sanatan_context:
        "Dharma is not a life plan — it is the next right action, done faithfully.",
      why_we_ask:
        "When the path is unclear, writing what feels yours to do next is the act of listening.",
      prompt:
        "What feels like yours to do, even if the whole path is not yet clear?",
      placeholder: "Write what comes…",
      primary_label: "Save this",
      confirmation: "Saved. You can write another.",
      add_another_label: "Write another",
    },
  },
  joy_named: {
    health_energy: {
      title: "Write one good thing from today's body",
      sanatan_context:
        "The body is a gift. Gratitude for it, even small, returns something.",
      why_we_ask:
        "When the body feels difficult, finding one good thing in it is a gentle act of care.",
      prompt: "What is one thing your body is doing well or feeling right now?",
      placeholder: "Write one good thing…",
      primary_label: "Save this joy",
      confirmation: "Saved. You can write another.",
      add_another_label: "Write another",
    },
  },
  connection_named: {
    relationships: {
      title: "Name the person you want to return to",
      sanatan_context:
        "Sambandha says a bond held in memory is a bond that continues to care.",
      why_we_ask:
        "When a relationship feels far or strained, naming the person keeps the thread alive.",
      prompt: "Who is the person you want to stay close to?",
      placeholder: "Write a name or a few words…",
      primary_label: "Save this connection",
      confirmation: "Saved. You can name another.",
      add_another_label: "Name another",
    },
    health_energy: {
      title: "Name someone who is close to you now",
      sanatan_context:
        "Caring company is itself a form of medicine. Even naming who is close changes something.",
      why_we_ask:
        "When the body is struggling, naming who is close to you brings real comfort.",
      prompt: "Who is with you in this, even from a distance?",
      placeholder: "Write a name or a few words…",
      primary_label: "Save this connection",
      confirmation: "Saved. You can name another.",
      add_another_label: "Name another",
    },
  },
  stillness_named: {
    money_security: {
      title: "Write what became quiet beneath the worry",
      sanatan_context:
        "What is underneath the noise has always been quiet. It is still there.",
      why_we_ask:
        "Money pressure is loud. Writing what stayed quiet beneath it helps you locate your steadiness.",
      prompt:
        "Beneath the money worry, what feels quiet or steady, even a little?",
      placeholder: "Write one word or a few lines…",
      primary_label: "Save this stillness",
      confirmation: "Saved.",
      add_another_label: "Write another",
    },
  },
};

function getCarryCopy(
  writesEvent?: string | null,
  carryPayload?: any,
  lifeContext?: string | null,
  locale?: string,
) {
  const mm = carryPayload?.memory_modal;
  if (mm) {
    return {
      title: mm.title,
      prompt: mm.prompt,
      placeholder: mm.placeholder || "Type what you feel..",
      primary_label: mm.primary_label || "Save",
      sanatan_context: mm.sanatan_context,
      why_we_ask: mm.why_we_ask,
      confirmation: mm.confirmation,
      add_another_label: mm.add_another_label,
    };
  }
  const modalMap = locale === 'hi' ? CARRY_MEMORY_MODAL_HI : locale === 'te' ? CARRY_MEMORY_MODAL_TE : CARRY_MEMORY_MODAL;
  const ctxMap = locale === 'hi' ? CARRY_MODAL_BY_CONTEXT_HI : locale === 'te' ? CARRY_MODAL_BY_CONTEXT_TE : CARRY_MODAL_BY_CONTEXT;
  if (lifeContext) {
    const ctxCopy = ctxMap[writesEvent || ""]?.[lifeContext];
    if (ctxCopy) return ctxCopy;
  }
  const key = writesEvent || "generic";
  return modalMap[key] ?? modalMap.generic;
}

interface ConfirmationState {
  visible: boolean;
}

interface Props {
  visible: boolean;
  label: string;
  roomId: string;
  actionId: string;
  analyticsKey?: string | null;
  writesEvent?: string | null;
  carryPayload?: any;
  lifeContext?: string | null;
  journeyId?: string | null;
  dayNumber?: number | null;
  onSave: (text: string, sacredWriteOk: boolean) => void;
  onCancel: () => void;
  onAddAnother?: () => void;
  onReturnHome?: () => void;
  isJoyCarry?: boolean;
  showConfirmationTray?: boolean;
  presentation?: "modal" | "screen";
}

export function CarryCaptureModal({
  visible,
  label,
  roomId,
  actionId,
  analyticsKey,
  writesEvent,
  carryPayload,
  lifeContext,
  journeyId,
  dayNumber,
  onSave,
  onCancel,
  onAddAnother,
  onReturnHome,
  isJoyCarry = false,
  showConfirmationTray = true,
  presentation = "modal",
}: Props) {
  const { t, locale } = useTranslation();
  const [text, setText] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    visible: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = getCarryCopy(writesEvent, carryPayload, lifeContext, locale);
  const trimmed = text.trim();
  const enabled = trimmed.length >= 1 && !isSubmitting;
  const isScreen = presentation === "screen";

  useEffect(() => {
    if (!visible) {
      setText("");
      setConfirmation({ visible: false });
      setIsSubmitting(false);
      setError(null);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !confirmation.visible) onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [visible, onCancel, confirmation.visible]);

  if (!visible) return null;

  const handleSave = async () => {
    if (!enabled) return;
    setIsSubmitting(true);
    setError(null);
    // postRoomSacred catches internally — returns data or null; never throws
    const sacredResult = await postRoomSacred(roomId, {
      writes_event: writesEvent,
      label,
      action_id: actionId,
      analytics_key: analyticsKey,
      captured_at: Date.now(),
      text: trimmed,
      life_context: lifeContext ?? null,
      journey_id: journeyId ?? null,
      day_number: dayNumber ?? null,
      source_surface: "carry_pill",
    });
    setIsSubmitting(false);
    const sacredWriteOk = sacredResult !== null;
    onSave(trimmed, sacredWriteOk);
    // R2d: joy_carry auto-navigates to dashboard (matches RN) — skip confirmation screen
    if (isJoyCarry) {
      onReturnHome?.();
    } else if (showConfirmationTray) {
      setConfirmation({ visible: true });
    }
  };

  return (
    <div
      style={{
        position: isScreen ? "relative" : "fixed",
        inset: isScreen ? undefined : 0,
        background: isScreen ? "transparent" : "rgba(0,0,0,0.35)",
        zIndex: isScreen ? undefined : 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: isScreen ? "100%" : undefined,
      }}
      onClick={(e) =>
        !isScreen &&
        e.target === e.currentTarget &&
        !confirmation.visible &&
        onCancel()
      }
      data-testid="carry-capture-modal-backdrop"
    >
      <div
        data-testid="carry-capture-modal"
        style={{
          width: "100%",
          maxWidth: 780,
          background: isScreen ? "transparent" : "#fdf8ef",
          backgroundImage: isScreen ? "none" : "url(/beige_bg.png)",
          backgroundSize: isScreen ? undefined : "cover",
          backgroundPosition: isScreen ? undefined : "center",
          minHeight: isScreen ? "100%" : undefined,
          padding: "0 0 32px",
          maxHeight: isScreen ? "100dvh" : "calc(100dvh - 40px)",
          overflowY: "auto",
          boxShadow: isScreen ? "none" : "0 18px 50px rgba(48, 28, 6, 0.16)",
        }}
      >
        {!isScreen && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "12px 0 4px",
            }}
          >
            <div
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                background: "#E0E0E2",
              }}
            />
          </div>
        )}

        {confirmation.visible ? (
          /* Confirmation state */
          <div
            style={{ padding: "36px 34px 20px", textAlign: "center" }}
            data-testid="carry-capture-confirmation"
          >
            <p style={{ fontSize: 12, color: "#D4A017", margin: "0 0 4px" }}>
              {t('common.carryWithYou')}
            </p>
            <p
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#2C2A26",
                margin: "0 0 18px",
              }}
            >
              {copy.confirmation || t('common.saved')}
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {onAddAnother && !isJoyCarry && (
                <button
                  data-testid="carry-confirm-add-another"
                  onClick={() => {
                    setText("");
                    setConfirmation({ visible: false });
                    onAddAnother?.();
                  }}
                  style={{
                    minWidth: 150,
                    padding: "12px 18px",
                    borderRadius: 999,
                    border: "1px solid rgba(60,60,67,0.45)",
                    background: "rgba(255,255,255,0.5)",
                    fontSize: 15,
                    color: "#432104",
                    cursor: "pointer",
                  }}
                >
                  {copy.add_another_label || t('common.writeAnother')}
                </button>
              )}
              {onReturnHome && (
                <button
                  data-testid="carry-confirm-return-home"
                  onClick={() => {
                    setConfirmation({ visible: false });
                    onReturnHome();
                  }}
                  style={{
                    minWidth: 150,
                    padding: "12px 18px",
                    borderRadius: 999,
                    border: "1px solid rgba(212, 183, 132, 0.9)",
                    background: "rgba(255,255,255,0.5)",
                    fontSize: 15,
                    color: "#432104",
                    cursor: "pointer",
                  }}
                >
                  {t('common.returnHome')}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Input state */
          <div style={{ padding: "0 18px 0" }}>
            {/* Header */}
            <div style={{ padding: "5px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <button
                  onClick={onCancel}
                  aria-label="Back"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 999,
                    border: "1.2px solid rgba(191, 151, 84, 0.75)",
                    background: "rgba(255,255,255,0.52)",
                    color: "#A7792E",
                    fontSize: 28,
                    lineHeight: 1,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  ‹
                </button>
                <button
                  data-testid="carry-capture-cancel"
                  onClick={onCancel}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 16,
                    color: "#45403A",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {t('common.cancel')}
                </button>
              </div>

              <div
                style={{
                  textAlign: "center",
                  maxWidth: 620,
                  margin: "0 auto",
                }}
              >
                <img
                  src="/lotus_icon.png"
                  alt=""
                  width={34}
                  height={26}
                  style={{ display: "block", margin: "0 auto 18px" }}
                />
                <h2
                  style={{
                    margin: 0,
                    color: "#2C1C11",
                    fontFamily: "var(--kalpx-font-serif)",
                    fontSize: "clamp(30px, 4.8vw, 30px)",

                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {copy.title || label}
                </h2>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 14,
                    margin: "18px 0 0",
                    color: "#B88632",
                  }}
                >
                  <span
                    style={{
                      width: 48,
                      height: 1,
                      background: "rgba(184, 134, 50, 0.42)",
                    }}
                  />
                  <span style={{ fontSize: 16, lineHeight: 1 }}>◆</span>
                  <span
                    style={{
                      width: 48,
                      height: 1,
                      background: "rgba(184, 134, 50, 0.42)",
                    }}
                  />
                </div>
              </div>
            </div>

            {copy.why_we_ask && (
              <p
                style={{
                  fontSize: 14,
                  color: "#A97817",
                  fontStyle: "italic",
                  textAlign: "center",
                  margin: "0 auto 18px",
                  lineHeight: 1.45,
                  maxWidth: 560,
                }}
              >
                {copy.why_we_ask}
              </p>
            )}
            {copy.sanatan_context && (
              <p
                style={{
                  fontSize: 14,
                  color: "#35302B",
                  textAlign: "center",
                  margin: "0 auto 30px",
                  lineHeight: 1.55,
                  maxWidth: 640,
                }}
              >
                {copy.sanatan_context}
              </p>
            )}
            <p
              style={{
                fontSize: 16,
                color: "#2E241B",
                margin: "0 auto 18px",
                lineHeight: 1.3,
                textAlign: "center",
                fontFamily: "var(--kalpx-font-serif)",
                maxWidth: 560,
                fontWeight: 700,
              }}
            >
              {copy.prompt}
            </p>

            <div style={{ position: "relative", marginBottom: 24 }}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT))}
                placeholder={copy.placeholder}
                data-testid="carry-capture-input"
                maxLength={MAX_TEXT}
                style={{
                  width: "100%",
                  minHeight: 250,
                  border: "1px solid rgba(196, 181, 161, 0.92)",
                  borderRadius: 28,
                  padding: "28px 28px 54px",
                  fontSize: 18,
                  color: "#1C1C1E",
                  background: "rgba(255,255,255,0.72)",
                  resize: "none",
                  boxSizing: "border-box",
                  outline: "none",
                  lineHeight: 1.5,
                  boxShadow: "0 6px 16px rgba(72, 46, 13, 0.12)",
                }}
              />
              <p
                style={{
                  position: "absolute",
                  right: 22,
                  bottom: 18,
                  margin: 0,
                  fontSize: 13,
                  color: "#75706A",
                  pointerEvents: "none",
                }}
              >
                {text.length} / {MAX_TEXT}
              </p>
            </div>

            {error && (
              <p
                data-testid="carry-capture-error"
                style={{
                  color: "#C0392B",
                  fontSize: 13,
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                {error}
              </p>
            )}

            <button
              data-testid="carry-capture-save"
              disabled={!enabled}
              onClick={handleSave}
              style={{
                width: "100%",
                maxWidth: 560,
                display: "block",
                margin: "0 auto",
                padding: "10px",
                // height: 64,
                borderRadius: 999,
                border: "1px solid rgba(85, 42, 11, 0.22)",
                background: "linear-gradient(180deg, #6D3A10 0%, #4D2408 100%)",
                boxShadow: "0 10px 22px rgba(94, 51, 15, 0.2)",
                fontSize: 18,
                fontWeight: 600,
                color: "#FFF7EF",
                cursor: enabled ? "pointer" : "default",
                opacity: enabled ? 1 : 0.45,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                <img src="/lotus_icon.png" alt="" width={22} height={18} />
                {isSubmitting ? t('common.saving') : copy.primary_label}
              </span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              style={{
                display: "block",
                margin: "18px auto 0",
                background: "none",
                border: "none",
                borderBottom: "1px solid rgba(72, 57, 41, 0.45)",
                padding: "0 0 3px",
                fontSize: 14,
                color: "#4A433C",
                cursor: "pointer",
              }}
            >
              {t('mitra.room.illGoNow')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
