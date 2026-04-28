// /data/sankalps.js
export const DAILY_SANKALPS = [
  // Mind & Speech
  {
    id: "truth_speech",
    type: "sankalp",
    category: "Mind & Speech",
    short_text: "I will speak truth today.",
    icon: "🗣️",
    root: "Satya (Truth) • Austerity of Speech",
    source: "Yoga Sutra 2.30; Gita 17.15",
    tooltip: "Truth that’s kind and beneficial purifies speech.",
    suggested_practice: "Before speaking, ask: Is it true, kind, necessary?",
    i18n: {
      short: "sankalps.truth_speech.short",
      tooltip: "sankalps.truth_speech.tooltip",
      suggested: "sankalps.truth_speech.suggested",
    },
    meta: {
      timeOfDay: ["any"],
      effort: "light",
      context: ["office", "family"],
      vibe: ["ahimsa", "equanimity"],
      recommendSlots: ["day"],
    },
  },
  {
    id: "no_gossip",
    type: "sankalp",
    category: "Mind & Speech",
    short_text: "I will not gossip today.",
    icon: "🤐",
    root: "Mauna • Priya-hitam Vākya",
    source: "Gita 17.15",
    tooltip: "Silence is better than words that divide.",
    suggested_practice:
      "If gossip starts, change topic or stay silent for 10 seconds.",
    i18n: {
      short: "sankalps.no_gossip.short",
      tooltip: "sankalps.no_gossip.tooltip",
      suggested: "sankalps.no_gossip.suggested",
    },
    meta: {
      timeOfDay: ["any"],
      effort: "light",
      context: ["office", "family"],
      vibe: ["ahimsa", "santosha"],
      recommendSlots: ["day"],
      maxTimesPerWeek: 5,
    },
  },
  {
    id: "pause_before_react",
    type: "sankalp",
    category: "Mind & Speech",
    short_text: "I will pause before reacting.",
    icon: "⏸️",
    root: "Kṣamā • Pratipakṣa-bhāvanā",
    source: "Gita 16.3; Yoga Sutra 2.33",
    tooltip: "A breath between trigger and response is freedom.",
    suggested_practice:
      "Take 3 slow breaths before replying to anything heated.",
    i18n: {
      short: "sankalps.pause_before_react.short",
      tooltip: "sankalps.pause_before_react.tooltip",
      suggested: "sankalps.pause_before_react.suggested",
    },
    meta: {
      timeOfDay: ["any", "commute"],
      effort: "light",
      context: ["office", "family", "travel"],
      vibe: ["equanimity", "raja"],
      recommendSlots: ["day", "evening"],
    },
  },
  {
    id: "listen_more",
    type: "sankalp",
    category: "Mind & Speech",
    short_text: "I will listen more than I speak.",
    icon: "👂",
    root: "Śravaṇa • Mauna",
    source: "Vedāntic method (śravaṇa–manana–nididhyāsana)",
    tooltip: "Listening with care is seva to the heart.",
    suggested_practice: "After they finish, wait 5 seconds before you speak.",
    i18n: {
      short: "sankalps.listen_more.short",
      tooltip: "sankalps.listen_more.tooltip",
      suggested: "sankalps.listen_more.suggested",
    },
    meta: {
      timeOfDay: ["any"],
      effort: "light",
      context: ["office", "family"],
      vibe: ["ahimsa", "karma", "equanimity"],
      recommendSlots: ["day"],
    },
  },
  {
    id: "speak_kindly",
    type: "sankalp",
    category: "Mind & Speech",
    short_text: "I will speak kindly to everyone.",
    icon: "🌸",
    root: "Priya-vākya",
    source: "Gita 17.15",
    tooltip: "Choose words that soothe, not scorch.",
    suggested_practice:
      "Replace one criticism today with a sincere compliment.",
    i18n: {
      short: "sankalps.speak_kindly.short",
      tooltip: "sankalps.speak_kindly.tooltip",
      suggested: "sankalps.speak_kindly.suggested",
    },
    meta: {
      timeOfDay: ["any"],
      effort: "light",
      context: ["office", "family", "home"],
      vibe: ["ahimsa", "santosha"],
      recommendSlots: ["day"],
    },
  },
  {
    id: "think_before_speak",
    type: "sankalp",
    category: "Mind & Speech",
    short_text: "I will think before I speak.",
    icon: "💭",
    root: "Sāttvika Speech",
    source: "Gita 17.15",
    tooltip: "A mindful pause makes speech sacred.",
    suggested_practice: "Count ‘one–two’ in your mind before each reply.",
    i18n: {
      short: "sankalps.think_before_speak.short",
      tooltip: "sankalps.think_before_speak.tooltip",
      suggested: "sankalps.think_before_speak.suggested",
    },
    meta: {
      timeOfDay: ["any"],
      effort: "light",
      context: ["office", "family"],
      vibe: ["equanimity", "raja"],
    },
  },
  {
    id: "no_complaints",
    type: "sankalp",
    category: "Mind & Speech",
    short_text: "I will avoid complaining today.",
    icon: "🚫",
    root: "Santoṣa (Contentment)",
    source: "Yoga Sutra 2.42",
    tooltip: "Contentment begins where complaint ends.",
    suggested_practice:
      "Catch the first complaint; convert it into 1 gratitude.",
    i18n: {
      short: "sankalps.no_complaints.short",
      tooltip: "sankalps.no_complaints.tooltip",
      suggested: "sankalps.no_complaints.suggested",
    },
    meta: {
      timeOfDay: ["any"],
      effort: "light",
      context: ["office", "home"],
      vibe: ["santosha", "equanimity"],
      mutuallyExclusiveWith: ["thank_three"], // soft variety
    },
  },
  {
    id: "words_that_heal",
    type: "sankalp",
    category: "Mind & Speech",
    short_text: "I will choose words that heal, not hurt.",
    icon: "🕊️",
    root: "Ahimsā in speech",
    source: "Gita 17.15",
    tooltip: "Speak as if every word is a prayer.",
    suggested_practice: "Send one healing message to someone today.",
    i18n: {
      short: "sankalps.words_that_heal.short",
      tooltip: "sankalps.words_that_heal.tooltip",
      suggested: "sankalps.words_that_heal.suggested",
    },
    meta: {
      timeOfDay: ["any", "evening"],
      effort: "light",
      context: ["family", "office"],
      vibe: ["ahimsa", "bhakti"],
      recommendSlots: ["evening"],
    },
  },

  // Emotions
  {
    id: "no_anger",
    type: "sankalp",
    category: "Emotions",
    short_text: "I will not get angry today.",
    icon: "🕊️",
    root: "Akrodha",
    source: "Gita 2.62–63; 16.1–3",
    tooltip: "Anger fades when awareness enters.",
    suggested_practice:
      "When anger rises, sip water and step away for 60 seconds.",
    i18n: {
      short: "sankalps.no_anger.short",
      tooltip: "sankalps.no_anger.tooltip",
      suggested: "sankalps.no_anger.suggested",
    },
    meta: {
      timeOfDay: ["any", "commute"],
      effort: "medium",
      context: ["office", "family", "travel"],
      vibe: ["equanimity", "raja"],
    },
  },
  {
    id: "choose_patience",
    type: "sankalp",
    category: "Emotions",
    short_text: "I will choose patience over irritation.",
    icon: "🌿",
    root: "Kṣamā",
    source: "Gita 16.3; 10.4–5",
    tooltip: "Patience is strength held softly.",
    suggested_practice: "If delayed, breathe box-style: 4-4-4-4 for 4 cycles.",
    i18n: {
      short: "sankalps.choose_patience.short",
      tooltip: "sankalps.choose_patience.tooltip",
      suggested: "sankalps.choose_patience.suggested",
    },
    meta: {
      timeOfDay: ["any", "commute"],
      effort: "light",
      context: ["travel", "office", "family"],
      vibe: ["equanimity", "santosha"],
    },
  },
  {
    id: "forgive_one",
    type: "sankalp",
    category: "Emotions",
    short_text: "I will forgive one person today.",
    icon: "🤝",
    root: "Kṣamā",
    source: "Gita 12.13–14; 16.3",
    tooltip: "Forgiveness frees you first.",
    suggested_practice: "Whisper: “I release you; I choose peace.”",
    i18n: {
      short: "sankalps.forgive_one.short",
      tooltip: "sankalps.forgive_one.tooltip",
      suggested: "sankalps.forgive_one.suggested",
    },
    meta: {
      timeOfDay: ["evening"],
      effort: "medium",
      context: ["family", "home"],
      vibe: ["santosha", "bhakti", "equanimity"],
      recommendSlots: ["evening"],
      maxTimesPerWeek: 3,
    },
  },
  {
    id: "not_personal",
    type: "sankalp",
    category: "Emotions",
    short_text: "I will not take things personally.",
    icon: "🫶",
    root: "Sākṣī-bhāva • Samatva",
    source: "Gita 2.14; 2.38",
    tooltip: "Be the witness, not the wound.",
    suggested_practice: "Repeat: “This is about their state, not my Self.”",
    i18n: {
      short: "sankalps.not_personal.short",
      tooltip: "sankalps.not_personal.tooltip",
      suggested: "sankalps.not_personal.suggested",
    },
    meta: {
      timeOfDay: ["any"],
      effort: "light",
      context: ["office", "family"],
      vibe: ["equanimity", "jnana"],
    },
  },
  {
    id: "accept_change",
    type: "sankalp",
    category: "Emotions",
    short_text: "I will accept what I cannot change.",
    icon: "🌊",
    root: "Titikṣā • Anitya-bhāva",
    source: "Gita 2.14",
    tooltip: "Waves pass; the ocean remains.",
    suggested_practice: "Label it ‘uncontrollable’; act only on your part.",
    i18n: {
      short: "sankalps.accept_change.short",
      tooltip: "sankalps.accept_change.tooltip",
      suggested: "sankalps.accept_change.suggested",
    },
    meta: {
      timeOfDay: ["any", "evening"],
      effort: "light",
      context: ["office", "family"],
      vibe: ["equanimity", "jnana"],
    },
  },
  {
    id: "smile_in_difficulty",
    type: "sankalp",
    category: "Emotions",
    short_text: "I will smile even in difficulty.",
    icon: "😊",
    root: "Sthitaprajña • Prasāda-buddhi",
    source: "Gita 2.56–57",
    tooltip: "A gentle smile steadies the mind.",
    suggested_practice: "Soften face, relax jaw, half-smile for 30 seconds.",
    i18n: {
      short: "sankalps.smile_in_difficulty.short",
      tooltip: "sankalps.smile_in_difficulty.tooltip",
      suggested: "sankalps.smile_in_difficulty.suggested",
    },
    meta: {
      timeOfDay: ["day"],
      effort: "light",
      context: ["office", "travel"],
      vibe: ["santosha", "equanimity"],
    },
  },
  {
    id: "reduce_fear",
    type: "sankalp",
    category: "Emotions",
    short_text: "I will act despite fear.",
    icon: "🦁",
    root: "Abhayam",
    source: "Gita 16.1",
    tooltip: "Courage is fear walked through.",
    suggested_practice: "Take one tiny step toward what you fear—today.",
    i18n: {
      short: "sankalps.reduce_fear.short",
      tooltip: "sankalps.reduce_fear.tooltip",
      suggested: "sankalps.reduce_fear.suggested",
    },
    meta: {
      timeOfDay: ["day"],
      effort: "medium",
      context: ["office", "health"],
      vibe: ["raja", "equanimity"],
      maxTimesPerWeek: 4,
    },
  },
  {
    id: "no_envy",
    type: "sankalp",
    category: "Emotions",
    short_text: "I will not compare or envy today.",
    icon: "🧘",
    root: "Adveṣṭā • Anasūyā",
    source: "Gita 12.13–14",
    tooltip: "Your path is sacred because it’s yours.",
    suggested_practice: "Bless one person you usually compare yourself to.",
    i18n: {
      short: "sankalps.no_envy.short",
      tooltip: "sankalps.no_envy.tooltip",
      suggested: "sankalps.no_envy.suggested",
    },
    meta: {
      timeOfDay: ["any"],
      effort: "light",
      context: ["office", "social"],
      vibe: ["santosha", "equanimity"],
    },
  },

  // Attitude & Perspective
  {
    id: "effort_over_result",
    type: "sankalp",
    category: "Attitude & Perspective",
    short_text: "I will put my best effort without worrying about results.",
    icon: "🎯",
    root: "Niṣkāma Karma",
    source: "Gita 2.47",
    tooltip: "Do your dharma; let go of the fruits.",
    suggested_practice: "Define the next right action; release the outcome.",
    i18n: {
      short: "sankalps.effort_over_result.short",
      tooltip: "sankalps.effort_over_result.tooltip",
      suggested: "sankalps.effort_over_result.suggested",
    },
    meta: {
      timeOfDay: ["morning"],
      effort: "medium",
      context: ["office", "home"],
      vibe: ["karma", "equanimity"],
      recommendSlots: ["morning"],
    },
  },
  {
    id: "see_divine_in_all",
    type: "sankalp",
    category: "Attitude & Perspective",
    short_text: "I will see the Divine in everyone I meet.",
    icon: "🙌",
    root: "Īśāvāsya • Sarva-bhūta Ātma-bhāva",
    source: "Isha Up. 1; Gita 6.29",
    tooltip: "Honor the same Self in all beings.",
    suggested_practice:
      "Silently greet: “Namaste—the Divine in me honors you.”",
    i18n: {
      short: "sankalps.see_divine_in_all.short",
      tooltip: "sankalps.see_divine_in_all.tooltip",
      suggested: "sankalps.see_divine_in_all.suggested",
    },
    meta: {
      timeOfDay: ["day"],
      effort: "light",
      context: ["office", "family"],
      vibe: ["bhakti", "jnana", "equanimity"],
    },
  },
  {
    id: "solution_focus",
    type: "sankalp",
    category: "Attitude & Perspective",
    short_text: "I will focus on solutions, not problems.",
    icon: "🔍",
    root: "Yogah Karmasu Kauśalam",
    source: "Gita 2.50",
    tooltip: "Skillful action grows where attention goes.",
    suggested_practice: "For one problem, write 2 actionable options now.",
    i18n: {
      short: "sankalps.solution_focus.short",
      tooltip: "sankalps.solution_focus.tooltip",
      suggested: "sankalps.solution_focus.suggested",
    },
    meta: {
      timeOfDay: ["day"],
      effort: "light",
      context: ["office"],
      vibe: ["karma", "raja"],
    },
  },
  {
    id: "stay_calm",
    type: "sankalp",
    category: "Attitude & Perspective",
    short_text: "I will stay calm in all situations.",
    icon: "🌅",
    root: "Samatvam",
    source: "Gita 2.48; 2.56",
    tooltip: "Equanimity is yoga.",
    suggested_practice:
      "Anchor breath to a mantra: ‘So’ on inhale, ‘Ham’ on exhale (1 min).",
    i18n: {
      short: "sankalps.stay_calm.short",
      tooltip: "sankalps.stay_calm.tooltip",
      suggested: "sankalps.stay_calm.suggested",
    },
    meta: {
      timeOfDay: ["any", "commute"],
      effort: "light",
      context: ["office", "family", "travel"],
      vibe: ["equanimity", "raja"],
    },
  },
  {
    id: "challenge_opportunity",
    type: "sankalp",
    category: "Attitude & Perspective",
    short_text: "I will treat challenges as opportunities.",
    icon: "🌱",
    root: "Tapas • Dhṛti",
    source: "Gita 18.33; 2.50",
    tooltip: "Heat of effort forges virtue.",
    suggested_practice:
      "Reframe one setback: write the single lesson in 1 line.",
    i18n: {
      short: "sankalps.challenge_opportunity.short",
      tooltip: "sankalps.challenge_opportunity.tooltip",
      suggested: "sankalps.challenge_opportunity.suggested",
    },
    meta: {
      timeOfDay: ["day"],
      effort: "medium",
      context: ["office", "health"],
      vibe: ["raja", "equanimity"],
    },
  },
  {
    id: "let_go_be_right",
    type: "sankalp",
    category: "Attitude & Perspective",
    short_text: "I will let go of the need to be right.",
    icon: "🪶",
    root: "Amanitvam • Ego-lightness",
    source: "Gita 13.8–12",
    tooltip: "Choose harmony over ego wins.",
    suggested_practice:
      "In one debate, say: “You may be right—let me reflect.”",
    i18n: {
      short: "sankalps.let_go_be_right.short",
      tooltip: "sankalps.let_go_be_right.tooltip",
      suggested: "sankalps.let_go_be_right.suggested",
    },
    meta: {
      timeOfDay: ["day", "evening"],
      effort: "light",
      context: ["family", "office"],
      vibe: ["equanimity", "santosha"],
    },
  },
  {
    id: "begin_again",
    type: "sankalp",
    category: "Attitude & Perspective",
    short_text: "If I slip, I will begin again without guilt.",
    icon: "🔁",
    root: "Abhyāsa • Utsāha",
    source: "Gita 6.26; 6.35",
    tooltip: "Begin again is a sacred mantra.",
    suggested_practice: "Notice the slip, smile, and restart—no self-blame.",
    i18n: {
      short: "sankalps.begin_again.short",
      tooltip: "sankalps.begin_again.tooltip",
      suggested: "sankalps.begin_again.suggested",
    },
    meta: {
      timeOfDay: ["any", "evening"],
      effort: "light",
      context: ["health", "home"],
      vibe: ["santosha", "equanimity"],
      recommendSlots: ["evening"],
    },
  },
  {
    id: "learn_daily",
    type: "sankalp",
    category: "Attitude & Perspective",
    short_text: "I will learn one new thing today.",
    icon: "📘",
    root: "Svādhyāya",
    source: "Yoga Sutra 2.44",
    tooltip: "A learning mind stays young and soft.",
    suggested_practice: "Read one śloka/line and note 1 takeaway.",
    i18n: {
      short: "sankalps.learn_daily.short",
      tooltip: "sankalps.learn_daily.tooltip",
      suggested: "sankalps.learn_daily.suggested",
    },
    meta: {
      timeOfDay: ["day", "evening"],
      effort: "light",
      context: ["office", "home"],
      vibe: ["jnana", "santosha"],
      maxTimesPerWeek: 6,
    },
  },

  // Service & Compassion
  {
    id: "help_one_person",
    type: "sankalp",
    category: "Service & Compassion",
    short_text: "I will help at least one person today.",
    icon: "🤲",
    root: "Sevā • Karma-Yoga",
    source: "Gita 3.19–20",
    tooltip: "Serve the Divine through the needy.",
    suggested_practice:
      "Offer one concrete help: a task, ride, meal, or intro.",
    i18n: {
      short: "sankalps.help_one_person.short",
      tooltip: "sankalps.help_one_person.tooltip",
      suggested: "sankalps.help_one_person.suggested",
    },
    meta: {
      timeOfDay: ["day"],
      effort: "medium",
      context: ["office", "family", "home"],
      vibe: ["karma", "bhakti"],
      maxTimesPerWeek: 5,
    },
  },
  {
    id: "smile_at_all",
    type: "sankalp",
    category: "Service & Compassion",
    short_text: "I will smile at everyone I meet.",
    icon: "😊",
    root: "Maitrī",
    source: "Yoga Sutra 1.33",
    tooltip: "Your smile is prasad for the world.",
    suggested_practice: "Meet 3 people today with a genuine smile.",
    i18n: {
      short: "sankalps.smile_at_all.short",
      tooltip: "sankalps.smile_at_all.tooltip",
      suggested: "sankalps.smile_at_all.suggested",
    },
    meta: {
      timeOfDay: ["day"],
      effort: "light",
      context: ["office", "travel", "family"],
      vibe: ["santosha", "bhakti"],
    },
  },
  {
    id: "feed_being",
    type: "sankalp",
    category: "Service & Compassion",
    short_text: "I will feed a being today (person, bird, animal).",
    icon: "🍲",
    root: "Dāna • Dayā",
    source: "Gita 17.20; 12.13",
    tooltip: "Feeding another feeds your own heart.",
    suggested_practice: "Keep a fruit or grain to share before sunset.",
    i18n: {
      short: "sankalps.feed_being.short",
      tooltip: "sankalps.feed_being.tooltip",
      suggested: "sankalps.feed_being.suggested",
    },
    meta: {
      timeOfDay: ["day", "evening"],
      effort: "light",
      context: ["home", "family"],
      vibe: ["karma", "bhakti"],
      recommendSlots: ["evening"],
    },
  },
  {
    id: "check_on_someone",
    type: "sankalp",
    category: "Service & Compassion",
    short_text: "I will check on someone who needs support.",
    icon: "📞",
    root: "Karunā",
    source: "Yoga Sutra 1.33",
    tooltip: "A check-in call can heal more than advice.",
    suggested_practice:
      "Call or voice-note one person who’s been quiet lately.",
    i18n: {
      short: "sankalps.check_on_someone.short",
      tooltip: "sankalps.check_on_someone.tooltip",
      suggested: "sankalps.check_on_someone.suggested",
    },
    meta: {
      timeOfDay: ["evening"],
      effort: "light",
      context: ["family", "home"],
      vibe: ["bhakti", "santosha"],
      recommendSlots: ["evening"],
    },
  },
  {
    id: "share_knowledge",
    type: "sankalp",
    category: "Service & Compassion",
    short_text: "I will share knowledge without expectation.",
    icon: "📚",
    root: "Dāna (Jñāna-dāna) • Tyāga",
    source: "Gita 18.5–6; 17.20–22",
    tooltip: "Teach as worship, not transaction.",
    suggested_practice: "Offer one helpful tip/resource to someone today.",
    i18n: {
      short: "sankalps.share_knowledge.short",
      tooltip: "sankalps.share_knowledge.tooltip",
      suggested: "sankalps.share_knowledge.suggested",
    },
    meta: {
      timeOfDay: ["day"],
      effort: "light",
      context: ["office"],
      vibe: ["karma", "jnana"],
    },
  },
  {
    id: "secret_kindness",
    type: "sankalp",
    category: "Service & Compassion",
    short_text: "I will do one act of kindness in secret.",
    icon: "🕯️",
    root: "Sāttvika dāna",
    source: "Gita 17.20",
    tooltip: "Invisible kindness builds invisible strength.",
    suggested_practice: "Help anonymously—no mention, no hints.",
    i18n: {
      short: "sankalps.secret_kindness.short",
      tooltip: "sankalps.secret_kindness.tooltip",
      suggested: "sankalps.secret_kindness.suggested",
    },
    meta: {
      timeOfDay: ["day", "evening"],
      effort: "light",
      context: ["home", "office"],
      vibe: ["karma", "bhakti"],
    },
  },
  {
    id: "speak_uplift",
    type: "sankalp",
    category: "Service & Compassion",
    short_text: "I will speak to uplift someone’s day.",
    icon: "🌈",
    root: "Priya-hitam",
    source: "Gita 17.15",
    tooltip: "One kind word can change a day.",
    suggested_practice: "Send a 2-line appreciation to one person now.",
    i18n: {
      short: "sankalps.speak_uplift.short",
      tooltip: "sankalps.speak_uplift.tooltip",
      suggested: "sankalps.speak_uplift.suggested",
    },
    meta: {
      timeOfDay: ["day"],
      effort: "light",
      context: ["office", "family"],
      vibe: ["ahimsa", "santosha"],
    },
  },
  {
    id: "be_present",
    type: "sankalp",
    category: "Service & Compassion",
    short_text: "I will listen fully when someone speaks.",
    icon: "👂",
    root: "Śraddhā • Maitrī",
    source: "Yoga Sutra 1.33",
    tooltip: "Presence is the purest gift.",
    suggested_practice:
      "During one chat, no interruptions, no phone, full eye contact.",
    i18n: {
      short: "sankalps.be_present.short",
      tooltip: "sankalps.be_present.tooltip",
      suggested: "sankalps.be_present.suggested",
    },
    meta: {
      timeOfDay: ["any"],
      effort: "light",
      context: ["family", "office"],
      vibe: ["ahimsa", "equanimity"],
    },
  },

  // Gratitude & Contentment
  {
    id: "thank_three",
    type: "sankalp",
    category: "Gratitude & Contentment",
    short_text: "I will thank the Divine for three things today.",
    icon: "🙏",
    root: "Prasāda-buddhi",
    source: "Gita 2.57; 3.11–13",
    tooltip: "Gratitude turns enough into abundance.",
    suggested_practice: "List 3 blessings aloud after lunch.",
    i18n: {
      short: "sankalps.thank_three.short",
      tooltip: "sankalps.thank_three.tooltip",
      suggested: "sankalps.thank_three.suggested",
    },
    meta: {
      timeOfDay: ["day", "evening"],
      effort: "light",
      context: ["home", "family"],
      vibe: ["santosha", "bhakti"],
      recommendSlots: ["evening"],
    },
  },
  {
    id: "be_content",
    type: "sankalp",
    category: "Gratitude & Contentment",
    short_text: "I will be content with what I have.",
    icon: "🌸",
    root: "Santoṣa",
    source: "Yoga Sutra 2.42",
    tooltip: "Contentment is inner wealth.",
    suggested_practice: "Repeat softly: “I have enough. I am enough.”",
    i18n: {
      short: "sankalps.be_content.short",
      tooltip: "sankalps.be_content.tooltip",
      suggested: "sankalps.be_content.suggested",
    },
    meta: {
      timeOfDay: ["any"],
      effort: "light",
      context: ["home", "office"],
      vibe: ["santosha", "equanimity"],
    },
  },
  {
    id: "notice_blessings",
    type: "sankalp",
    category: "Gratitude & Contentment",
    short_text: "I will notice blessings, not shortcomings.",
    icon: "🌞",
    root: "Sattva-dṛṣṭi",
    source: "Gita 2.55–57",
    tooltip: "Train the eye to find grace.",
    suggested_practice:
      "Catch one complaint; replace with one blessing noticed.",
    i18n: {
      short: "sankalps.notice_blessings.short",
      tooltip: "sankalps.notice_blessings.tooltip",
      suggested: "sankalps.notice_blessings.suggested",
    },
    meta: {
      timeOfDay: ["day"],
      effort: "light",
      context: ["office", "home"],
      vibe: ["santosha", "equanimity"],
    },
  },
  {
    id: "appreciate_small",
    type: "sankalp",
    category: "Gratitude & Contentment",
    short_text: "I will appreciate one small thing I overlook.",
    icon: "🍃",
    root: "Ārjava • Santoṣa",
    source: "Gita 16.1–3; YS 2.42",
    tooltip: "Reverence the ordinary; it’s not ordinary.",
    suggested_practice:
      "Name aloud one small overlooked joy (breeze, tea, smile).",
    i18n: {
      short: "sankalps.appreciate_small.short",
      tooltip: "sankalps.appreciate_small.tooltip",
      suggested: "sankalps.appreciate_small.suggested",
    },
    meta: {
      timeOfDay: ["day"],
      effort: "light",
      context: ["home", "office"],
      vibe: ["santosha"],
    },
  },
  {
    id: "write_gratitude",
    type: "sankalp",
    category: "Gratitude & Contentment",
    short_text: "I will write down three things I’m grateful for.",
    icon: "📝",
    root: "Smaraṇa • Svādhyāya",
    source: "YS 2.44",
    tooltip: "Written gratitude imprints the heart.",
    suggested_practice: "Jot 3 lines before sleep—keep a tiny notepad by bed.",
    i18n: {
      short: "sankalps.write_gratitude.short",
      tooltip: "sankalps.write_gratitude.tooltip",
      suggested: "sankalps.write_gratitude.suggested",
    },
    meta: {
      timeOfDay: ["evening"],
      effort: "light",
      context: ["home"],
      vibe: ["santosha", "bhakti"],
      recommendSlots: ["evening"],
      maxTimesPerWeek: 6,
    },
  },
  {
    id: "thank_someone",
    type: "sankalp",
    category: "Gratitude & Contentment",
    short_text: "I will thank someone directly today.",
    icon: "💌",
    root: "Maitrī • Dānya",
    source: "YS 1.33",
    tooltip: "Gratitude spoken completes the circle.",
    suggested_practice: "Send a 20-word thank-you to one person now.",
    i18n: {
      short: "sankalps.thank_someone.short",
      tooltip: "sankalps.thank_someone.tooltip",
      suggested: "sankalps.thank_someone.suggested",
    },
    meta: {
      timeOfDay: ["day"],
      effort: "light",
      context: ["office", "family"],
      vibe: ["santosha", "bhakti"],
    },
  },
  {
    id: "no_wanting",
    type: "sankalp",
    category: "Gratitude & Contentment",
    short_text: "I will not chase what I don’t need today.",
    icon: "🛑",
    root: "Aparigraha",
    source: "Yoga Sutra 2.39",
    tooltip: "Let go to feel light.",
    suggested_practice: "Skip one impulse buy; note the freedom you feel.",
    i18n: {
      short: "sankalps.no_wanting.short",
      tooltip: "sankalps.no_wanting.tooltip",
      suggested: "sankalps.no_wanting.suggested",
    },
    meta: {
      timeOfDay: ["day", "evening"],
      effort: "medium",
      context: ["home"],
      vibe: ["santosha", "equanimity"],
    },
  },
  {
    id: "accept_self",
    type: "sankalp",
    category: "Gratitude & Contentment",
    short_text: "I will accept myself as I am today.",
    icon: "🫶",
    root: "Ātma-sammāna • Santoṣa",
    source: "Gita 6.5–6; YS 2.42",
    tooltip: "Self-acceptance is sattva for the soul.",
    suggested_practice:
      "Look in the mirror; say one kind sentence to yourself.",
    i18n: {
      short: "sankalps.accept_self.short",
      tooltip: "sankalps.accept_self.tooltip",
      suggested: "sankalps.accept_self.suggested",
    },
    meta: {
      timeOfDay: ["morning", "evening"],
      effort: "light",
      context: ["home"],
      vibe: ["santosha", "equanimity"],
      recommendSlots: ["morning"],
    },
  },

  // Self-Discipline
  {
    id: "avoid_junk",
    type: "sankalp",
    category: "Self-Discipline",
    short_text: "I will avoid junk food today.",
    icon: "🥗",
    root: "Mitāhāra",
    source: "HYP 1.58",
    tooltip: "Sattvic fuel, sattvic mind.",
    suggested_practice: "Swap one processed snack for fruit or nuts.",
    i18n: {
      short: "sankalps.avoid_junk.short",
      tooltip: "sankalps.avoid_junk.tooltip",
      suggested: "sankalps.avoid_junk.suggested",
    },
    meta: {
      timeOfDay: ["day", "evening"],
      effort: "medium",
      context: ["health", "home"],
      vibe: ["santosha", "raja"],
    },
  },
  {
    id: "wake_early",
    type: "sankalp",
    category: "Self-Discipline",
    short_text: "I will wake up before sunrise.",
    icon: "🌅",
    root: "Brahma-muhūrta",
    source: "Aṣṭāṅga Hṛdayam Su.2",
    tooltip: "Pre-dawn stillness primes clarity.",
    suggested_practice: "Set alarm 20 minutes earlier than usual—tonight.",
    i18n: {
      short: "sankalps.wake_early.short",
      tooltip: "sankalps.wake_early.tooltip",
      suggested: "sankalps.wake_early.suggested",
    },
    meta: {
      timeOfDay: ["morning"],
      effort: "deep",
      context: ["health", "home"],
      vibe: ["raja", "equanimity"],
      recommendSlots: ["morning"],
      maxTimesPerWeek: 5,
    },
  },
  {
    id: "ten_min_silence",
    type: "sankalp",
    category: "Self-Discipline",
    short_text: "I will spend ten minutes in silence.",
    icon: "🤫",
    root: "Mauna",
    source: "Dharmic observance",
    tooltip: "Silence resets scattered energy.",
    suggested_practice: "Timer 10 min: sit, back straight, no phone.",
    i18n: {
      short: "sankalps.ten_min_silence.short",
      tooltip: "sankalps.ten_min_silence.tooltip",
      suggested: "sankalps.ten_min_silence.suggested",
    },
    meta: {
      timeOfDay: ["morning", "evening"],
      effort: "medium",
      context: ["home"],
      vibe: ["raja", "equanimity"],
      recommendSlots: ["evening"],
    },
  },
  {
    id: "no_phone_first_hour",
    type: "sankalp",
    category: "Self-Discipline",
    short_text: "I will avoid my phone for the first hour.",
    icon: "📵",
    root: "Indriya-nigraha",
    source: "Gita 2.58–61",
    tooltip: "Guard your dawn—guard your mind.",
    suggested_practice: "Keep phone outside bedroom; read a śloka instead.",
    i18n: {
      short: "sankalps.no_phone_first_hour.short",
      tooltip: "sankalps.no_phone_first_hour.tooltip",
      suggested: "sankalps.no_phone_first_hour.suggested",
    },
    meta: {
      timeOfDay: ["morning"],
      effort: "medium",
      context: ["digital_detox", "home"],
      vibe: ["raja", "equanimity"],
      recommendSlots: ["morning"],
      mutuallyExclusiveWith: ["om_three_times"], // avoid stacking too many morning rituals
    },
  },
  {
    id: "good_posture",
    type: "sankalp",
    category: "Self-Discipline",
    short_text: "I will maintain good posture today.",
    icon: "🧍",
    root: "Āsana (sthira-sukha)",
    source: "Yoga Sutra 2.46",
    tooltip: "Posture shapes prāṇa and thought.",
    suggested_practice: "Set 2 posture reminders; lengthen spine each time.",
    i18n: {
      short: "sankalps.good_posture.short",
      tooltip: "sankalps.good_posture.tooltip",
      suggested: "sankalps.good_posture.suggested",
    },
    meta: {
      timeOfDay: ["day"],
      effort: "light",
      context: ["office", "home"],
      vibe: ["raja"],
    },
  },
  {
    id: "finish_what_start",
    type: "sankalp",
    category: "Self-Discipline",
    short_text: "I will finish what I start.",
    icon: "✅",
    root: "Dhṛti • Śraddhā",
    source: "Gita 18.33; 17.3",
    tooltip: "Completion is quiet power.",
    suggested_practice: "Pick one half-done task; finish it before noon.",
    i18n: {
      short: "sankalps.finish_what_start.short",
      tooltip: "sankalps.finish_what_start.tooltip",
      suggested: "sankalps.finish_what_start.suggested",
    },
    meta: {
      timeOfDay: ["day"],
      effort: "medium",
      context: ["office", "home"],
      vibe: ["raja", "karma"],
    },
  },
  {
    id: "no_sugar",
    type: "sankalp",
    category: "Self-Discipline",
    short_text: "I will avoid added sugar today.",
    icon: "🍏",
    root: "Mitāhāra • Sattva",
    source: "HYP 1.58",
    tooltip: "Less sugar, more stillness.",
    suggested_practice: "Choose unsweetened tea/coffee once today.",
    i18n: {
      short: "sankalps.no_sugar.short",
      tooltip: "sankalps.no_sugar.tooltip",
      suggested: "sankalps.no_sugar.suggested",
    },
    meta: {
      timeOfDay: ["day"],
      effort: "medium",
      context: ["health"],
      vibe: ["santosha", "raja"],
      maxTimesPerWeek: 6,
    },
  },
  {
    id: "no_unnecessary_spend",
    type: "sankalp",
    category: "Self-Discipline",
    short_text: "I will not spend on non-essentials today.",
    icon: "💸",
    root: "Aparigraha",
    source: "Yoga Sutra 2.39",
    tooltip: "Own less; be owned less.",
    suggested_practice: "Delay one purchase by 24 hours.",
    i18n: {
      short: "sankalps.no_unnecessary_spend.short",
      tooltip: "sankalps.no_unnecessary_spend.tooltip",
      suggested: "sankalps.no_unnecessary_spend.suggested",
    },
    meta: {
      timeOfDay: ["day", "evening"],
      effort: "light",
      context: ["home"],
      vibe: ["santosha", "equanimity"],
    },
  },

  // Spiritual Connection
  {
    id: "remember_name_meals",
    type: "sankalp",
    category: "Spiritual Connection",
    short_text: "I will remember God’s name before each meal.",
    icon: "🍽️",
    root: "Prasāda-buddhi • Nāma-smaraṇa",
    source: "Gita 4.24; 3.13",
    tooltip: "Sanctify food; sanctify mind.",
    suggested_practice: "Chant ‘ॐ’ once silently before first bite.",
    i18n: {
      short: "sankalps.remember_name_meals.short",
      tooltip: "sankalps.remember_name_meals.tooltip",
      suggested: "sankalps.remember_name_meals.suggested",
    },
    meta: {
      timeOfDay: ["meals"],
      effort: "light",
      context: ["home", "family"],
      vibe: ["bhakti", "santosha"],
      recommendSlots: ["meals"],
      maxTimesPerWeek: 7,
    },
  },
  {
    id: "mantra_11",
    type: "sankalp",
    category: "Spiritual Connection",
    short_text: "I will chant a mantra 11 times today.",
    icon: "📿",
    root: "Japa",
    source: "Bhāgavata Purāṇa 12.3.51",
    tooltip: "Small japa, steady grace.",
    suggested_practice:
      "Pick one name (Ram/Krishna/Shiva) and chant 11 counts.",
    i18n: {
      short: "sankalps.mantra_11.short",
      tooltip: "sankalps.mantra_11.tooltip",
      suggested: "sankalps.mantra_11.suggested",
    },
    meta: {
      timeOfDay: ["morning", "evening"],
      effort: "light",
      context: ["home", "family"],
      vibe: ["bhakti"],
      recommendSlots: ["evening"],
      maxTimesPerWeek: 7,
    },
  },
  {
    id: "read_one_verse",
    type: "sankalp",
    category: "Spiritual Connection",
    short_text: "I will read one verse from a scripture.",
    icon: "📜",
    root: "Svādhyāya",
    source: "Yoga Sutra 2.44",
    tooltip: "One verse can recalibrate a day.",
    suggested_practice: "Read one Gita śloka; note one line that moves you.",
    i18n: {
      short: "sankalps.read_one_verse.short",
      tooltip: "sankalps.read_one_verse.tooltip",
      suggested: "sankalps.read_one_verse.suggested",
    },
    meta: {
      timeOfDay: ["morning", "evening"],
      effort: "light",
      context: ["home"],
      vibe: ["jnana", "bhakti"],
      recommendSlots: ["morning"],
      maxTimesPerWeek: 7,
    },
  },
  {
    id: "inner_bow",
    type: "sankalp",
    category: "Spiritual Connection",
    short_text: "I will bow inwardly before beginning work.",
    icon: "🙏",
    root: "Īśvara-praṇidhāna",
    source: "Yoga Sutra 2.45",
    tooltip: "Offer the deed before you do it.",
    suggested_practice: "Close eyes 5 seconds; inwardly say “For You.”",
    i18n: {
      short: "sankalps.inner_bow.short",
      tooltip: "sankalps.inner_bow.tooltip",
      suggested: "sankalps.inner_bow.suggested",
    },
    meta: {
      timeOfDay: ["morning", "day"],
      effort: "light",
      context: ["office", "home"],
      vibe: ["bhakti", "karma"],
      recommendSlots: ["morning"],
    },
  },
  {
    id: "five_min_prayer",
    type: "sankalp",
    category: "Spiritual Connection",
    short_text: "I will spend five minutes in prayer.",
    icon: "🕯️",
    root: "Bhakti",
    source: "Nārada Bhakti Sūtra (tradition)",
    tooltip: "Prayer is heart-talk with the Divine.",
    suggested_practice:
      "Set a 5-min timer; speak to your Ishta simply, honestly.",
    i18n: {
      short: "sankalps.five_min_prayer.short",
      tooltip: "sankalps.five_min_prayer.tooltip",
      suggested: "sankalps.five_min_prayer.suggested",
    },
    meta: {
      timeOfDay: ["evening", "morning"],
      effort: "light",
      context: ["home", "family"],
      vibe: ["bhakti"],
      recommendSlots: ["evening"],
      maxTimesPerWeek: 7,
    },
  },
  {
    id: "work_as_offering",
    type: "sankalp",
    category: "Spiritual Connection",
    short_text: "I will see my work as an offering.",
    icon: "🛐",
    root: "Yajña-bhāva • Karma-Yoga",
    source: "Gita 3.9",
    tooltip: "Make your task a temple.",
    suggested_practice: "Begin one task with ‘This is my offering today.’",
    i18n: {
      short: "sankalps.work_as_offering.short",
      tooltip: "sankalps.work_as_offering.tooltip",
      suggested: "sankalps.work_as_offering.suggested",
    },
    meta: {
      timeOfDay: ["day"],
      effort: "light",
      context: ["office", "home"],
      vibe: ["karma", "bhakti"],
    },
  },
  {
    id: "om_three_times",
    type: "sankalp",
    category: "Spiritual Connection",
    short_text: "I will chant Om three times before tasks.",
    icon: "🅾️",
    root: "Praṇava upāsanā",
    source: "Māṇḍūkya Up. 1–2",
    tooltip: "OM tunes mind to the One.",
    suggested_practice: "Chant OM ×3 softly before one key task.",
    i18n: {
      short: "sankalps.om_three_times.short",
      tooltip: "sankalps.om_three_times.tooltip",
      suggested: "sankalps.om_three_times.suggested",
    },
    meta: {
      timeOfDay: ["morning", "day"],
      effort: "light",
      context: ["office", "home"],
      vibe: ["bhakti", "jnana"],
      recommendSlots: ["morning"],
    },
  },
  {
    id: "remember_guru",
    type: "sankalp",
    category: "Spiritual Connection",
    short_text: "I will remember my Guru’s guidance today.",
    icon: "👣",
    root: "Guru-smaraṇa",
    source: "Guru Gītā (trad.)",
    tooltip: "Walk today as your Guru taught.",
    suggested_practice: "Recall one instruction; live it in one action today.",
    i18n: {
      short: "sankalps.remember_guru.short",
      tooltip: "sankalps.remember_guru.tooltip",
      suggested: "sankalps.remember_guru.suggested",
    },
    meta: {
      timeOfDay: ["morning", "evening"],
      effort: "light",
      context: ["home"],
      vibe: ["bhakti", "jnana"],
      recommendSlots: ["morning"],
    },
  },

  // Nature & Environment
  {
    id: "no_waste_water",
    type: "sankalp",
    category: "Nature & Environment",
    short_text: "I will not waste water today.",
    icon: "💧",
    root: "Bhūta-dayā • River reverence",
    source: "Ganga-stotra & tīrtha tradition",
    tooltip: "Honor water; honor life.",
    suggested_practice: "Close tap while soaping; save one bucket today.",
    i18n: {
      short: "sankalps.no_waste_water.short",
      tooltip: "sankalps.no_waste_water.tooltip",
      suggested: "sankalps.no_waste_water.suggested",
    },
    meta: {
      timeOfDay: ["day", "evening"],
      effort: "light",
      context: ["home", "family"],
      vibe: ["ahimsa", "karma"],
    },
  },
  {
    id: "feed_bird_animal",
    type: "sankalp",
    category: "Nature & Environment",
    short_text: "I will feed a bird or animal today.",
    icon: "🐦",
    root: "Dayā • Sarva-bhūta-hita",
    source: "Gita 12.4; 12.13",
    tooltip: "All beings are family in Dharma.",
    suggested_practice: "Keep grains/water outside in morning/evening.",
    i18n: {
      short: "sankalps.feed_bird_animal.short",
      tooltip: "sankalps.feed_bird_animal.tooltip",
      suggested: "sankalps.feed_bird_animal.suggested",
    },
    meta: {
      timeOfDay: ["morning", "evening"],
      effort: "light",
      context: ["home", "family"],
      vibe: ["ahimsa", "karma", "bhakti"],
      recommendSlots: ["morning", "evening"],
    },
  },
  {
    id: "care_for_plant",
    type: "sankalp",
    category: "Nature & Environment",
    short_text: "I will water or care for a plant.",
    icon: "🌱",
    root: "Vṛkṣa-sevā • Pṛthvī-pūjā",
    source: "Dharmic custom",
    tooltip: "Caring for green is caring for prāṇa.",
    suggested_practice:
      "Water one plant mindfully, chanting a name of the Divine.",
    i18n: {
      short: "sankalps.care_for_plant.short",
      tooltip: "sankalps.care_for_plant.tooltip",
      suggested: "sankalps.care_for_plant.suggested",
    },
    meta: {
      timeOfDay: ["morning", "evening"],
      effort: "light",
      context: ["home"],
      vibe: ["ahimsa", "bhakti"],
    },
  },
  {
    id: "no_plastic_bag",
    type: "sankalp",
    category: "Nature & Environment",
    short_text: "I will avoid plastic bags today.",
    icon: "♻️",
    root: "Aparigraha • Ahimsā (ecology)",
    source: "YS 2.30–32 (applied)",
    tooltip: "Choose re-usable; choose ahimsā.",
    suggested_practice: "Carry a cloth bag in your vehicle/backpack.",
    i18n: {
      short: "sankalps.no_plastic_bag.short",
      tooltip: "sankalps.no_plastic_bag.tooltip",
      suggested: "sankalps.no_plastic_bag.suggested",
    },
    meta: {
      timeOfDay: ["day"],
      effort: "light",
      context: ["travel", "home"],
      vibe: ["ahimsa", "karma"],
    },
  },
  {
    id: "keep_surroundings_clean",
    type: "sankalp",
    category: "Nature & Environment",
    short_text: "I will keep my surroundings clean.",
    icon: "🧹",
    root: "Śauca",
    source: "Yoga Sutra 2.32",
    tooltip: "Clean space, clear mind.",
    suggested_practice: "Declutter one surface (desk/shelf) for 3 minutes.",
    i18n: {
      short: "sankalps.keep_surroundings_clean.short",
      tooltip: "sankalps.keep_surroundings_clean.tooltip",
      suggested: "sankalps.keep_surroundings_clean.suggested",
    },
    meta: {
      timeOfDay: ["day"],
      effort: "light",
      context: ["home", "office"],
      vibe: ["raja", "equanimity"],
    },
  },
  {
    id: "walk_short_trips",
    type: "sankalp",
    category: "Nature & Environment",
    short_text: "I will walk short trips instead of driving.",
    icon: "🚶‍♀️",
    root: "Tapas • Ahimsā footprint",
    source: "YS 2.30; 2.43",
    tooltip: "Walk light on Earth; feel lighter within.",
    suggested_practice: "For one errand <1 km, walk mindfully.",
    i18n: {
      short: "sankalps.walk_short_trips.short",
      tooltip: "sankalps.walk_short_trips.tooltip",
      suggested: "sankalps.walk_short_trips.suggested",
    },
    meta: {
      timeOfDay: ["day", "commute"],
      effort: "medium",
      context: ["health", "travel"],
      vibe: ["raja", "ahimsa"],
    },
  },
  {
    id: "mindful_energy",
    type: "sankalp",
    category: "Nature & Environment",
    short_text: "I will switch off lights and save energy.",
    icon: "💡",
    root: "Stewardship • Ṛta",
    source: "Vedic ethos of Ṛta",
    tooltip: "Align with Ṛta—waste less, worship more.",
    suggested_practice: "Turn off 2 idle lights/devices right now.",
    i18n: {
      short: "sankalps.mindful_energy.short",
      tooltip: "sankalps.mindful_energy.tooltip",
      suggested: "sankalps.mindful_energy.suggested",
    },
    meta: {
      timeOfDay: ["day", "evening"],
      effort: "light",
      context: ["home", "office"],
      vibe: ["karma"],
    },
  },
  {
    id: "respect_food",
    type: "sankalp",
    category: "Nature & Environment",
    short_text: "I will not waste food today.",
    icon: "🍚",
    root: "Anna-devatā reverence",
    source: "Taittirīya Up. 3.7–3.10",
    tooltip: "Food is sacred; treat it so.",
    suggested_practice: "Serve smaller portions; finish before taking more.",
    i18n: {
      short: "sankalps.respect_food.short",
      tooltip: "sankalps.respect_food.tooltip",
      suggested: "sankalps.respect_food.suggested",
    },
    meta: {
      timeOfDay: ["meals"],
      effort: "light",
      context: ["home", "family"],
      vibe: ["bhakti", "santosha", "ahimsa"],
      recommendSlots: ["meals"],
    },
  },
];

export function pickSankalp({
  count = 3,
  slot = "any",
  weekday = new Date().getDay(),
  recentlyShownIds = [],
  history = {},
  perCategoryLimit = 1,
  preferVibes = [],
  preferContexts = [],
  wisdom = { tags: [], strategy: "synergy" },
} = {}) {
  const WEEKDAY_CATEGORY_PRIORITY = {
    0: ["Spiritual Connection", "Gratitude & Contentment", "Mind & Speech"], // Sun
    1: ["Self-Discipline", "Mind & Speech", "Attitude & Perspective"], // Mon
    2: ["Service & Compassion", "Emotions", "Mind & Speech"], // Tue
    3: ["Attitude & Perspective", "Gratitude & Contentment", "Emotions"], // Wed
    4: ["Spiritual Connection", "Attitude & Perspective", "Mind & Speech"], // Thu
    5: ["Gratitude & Contentment", "Service & Compassion", "Emotions"], // Fri
    6: ["Nature & Environment", "Self-Discipline", "Attitude & Perspective"], // Sat
  };

  const AVOID_REPEAT_DAYS = 5; // soft default; your data can override per-id

  // ---- utilities ----
  const getMeta = (it) => {
    const m = it.meta || {};
    return {
      timeOfDay: m.timeOfDay || ["any"],
      effort: m.effort || "light",
      context: m.context || [],
      vibe: m.vibe || [],
      recommendSlots: m.recommendSlots || [],
      maxTimesPerWeek: m.maxTimesPerWeek || Infinity,
      mutuallyExclusiveWith: m.mutuallyExclusiveWith || [],
    };
  };

  const isAllowedByHistory = (id) => {
    const h = history[id] || {};
    const lastSeen = Number.isFinite(h.lastSeenDaysAgo)
      ? h.lastSeenDaysAgo
      : Infinity;
    if (lastSeen < AVOID_REPEAT_DAYS) return false;
    if (
      (h.timesInLast7Days || 0) >= (getMetaById(id).maxTimesPerWeek || Infinity)
    )
      return false;
    return true;
  };

  const getMetaById = (id) => {
    if (!metaCache.has(id)) metaCache.set(id, getMeta(byId.get(id)));
    return metaCache.get(id);
  };

  const score = (it) => {
    const m = getMeta(it);
    let s = 0;

    // Slot fit
    if (slot && m.recommendSlots.includes(slot)) s += 4;
    if (slot && m.timeOfDay.includes(slot)) s += 2;

    // User preferences
    if (preferContexts.length) {
      const overlap = m.context.filter((c) =>
        preferContexts.includes(c),
      ).length;
      s += overlap * 2;
    }
    if (preferVibes.length) {
      const overlap = m.vibe.filter((v) => preferVibes.includes(v)).length;
      s += overlap;
    }

    // Wisdom synergy / dedupe
    const wTags = wisdom?.tags || [];
    if (wTags.length && wisdom?.strategy !== "ignore") {
      const overlap =
        overlapCount(m.vibe, wTags) + overlapCount(m.context, wTags);
      if (wisdom.strategy === "synergy") s += overlap * 2.5;
      if (wisdom.strategy === "dedupe") s -= overlap * 2.5;
    }

    // Weekday tilt
    const pri = WEEKDAY_CATEGORY_PRIORITY[weekday] || [];
    if (pri.includes(it.category)) s += 3 - pri.indexOf(it.category); // earlier = bigger bonus

    // Readability micro-bonus (shorter lines feel more approachable)
    if ((it.short_text || "").length <= 38) s += 0.5;

    return s;
  };

  const overlapCount = (a = [], b = []) =>
    a.filter((x) => b.includes(x)).length;

  // ---- index once ----
  const byId = new Map();
  const metaCache = new Map();
  for (const it of DAILY_SANKALPS) byId.set(it.id, it);

  // ---- pool & filters ----
  let pool = DAILY_SANKALPS.filter((it) => {
    if (recentlyShownIds.includes(it.id)) return false;
    if (!isAllowedByHistory(it.id)) return false;
    return true;
  });

  // Order by weekday category priority first, then by score
  const pri = WEEKDAY_CATEGORY_PRIORITY[weekday] || [];
  pool.sort((a, b) => {
    const ai = pri.indexOf(a.category);
    const bi = pri.indexOf(b.category);
    const ap = ai === -1 ? 999 : ai;
    const bp = bi === -1 ? 999 : bi;
    if (ap !== bp) return ap - bp;
    // tie-break by dynamic score
    return score(b) - score(a);
  });

  // ---- pick with per-category limit and conflict guard ----
  const chosen = [];
  const usedCats = new Map(); // cat -> count

  for (const it of pool) {
    if (chosen.length >= count) break;
    const m = getMeta(it);

    // per-category variety
    const used = usedCats.get(it.category) || 0;
    if (used >= perCategoryLimit) continue;

    // conflict check against already chosen
    const conflict = chosen.some((c) => {
      const cm = getMeta(c);
      return (
        m.mutuallyExclusiveWith.includes(c.id) ||
        cm.mutuallyExclusiveWith.includes(it.id)
      );
    });
    if (conflict) continue;

    chosen.push(it);
    usedCats.set(it.category, used + 1);
  }

  // Fill if underfilled (relax category cap but keep conflicts out)
  if (chosen.length < count) {
    for (const it of pool) {
      if (chosen.length >= count) break;
      if (chosen.find((c) => c.id === it.id)) continue;
      const m = getMeta(it);
      const conflict = chosen.some((c) => {
        const cm = getMeta(c);
        return (
          m.mutuallyExclusiveWith.includes(c.id) ||
          cm.mutuallyExclusiveWith.includes(it.id)
        );
      });
      if (conflict) continue;
      chosen.push(it);
    }
  }

  return chosen;
}
