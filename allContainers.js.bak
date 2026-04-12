export const PortalContainer = {
  container_id: "portal",
  states: {
    splash_portal: {
      tone: { theme: "gold_dark", mood: "steady" },
      blocks: [{ type: "lotus_logo" }],
      actions: { primary: null, secondary: null },
    },

    portal: {
      tone: { theme: "gold_dark", mood: "steady" },
      blocks: [
        { type: "lotus_logo" },
        { type: "headline", content: "Your Sanatan Transformation Companion" },
        {
          type: "subtext",
          content: "Build discipline. Cultivate awareness. Transform steadily.",
          variant: "multi_line",
        },
        {
          type: "primary_button",
          label: "Begin My Journey →",
          action: {
            type: "navigate",
            target: {
              container_id: "choice_stack",
              state_id: "discipline_select",
            },
          },
          style: "gold",
        },
        // {
        //   type: "subtext",
        //   content: "Maybe later",
        //   variant: "link",
        //   action: { type: "back" },
        //   position: "footer",
        //   style: { fontSize: "14px", marginTop: "10px" },
        // },
      ],
      actions: { primary: "start_cycle", secondary: null },
    },

    void_state: {
      tone: { theme: "gold_dark", mood: "neutral" },
      blocks: [
        { type: "headline", content: "You have no active cycle." },
        { type: "subtext", content: "Without structure, identity drifts." },
        {
          type: "primary_button",
          label: "Begin New Cycle →",
          action: {
            type: "navigate",
            target: {
              container_id: "choice_stack",
              state_id: "mode_toggle",
            },
          },
          style: "gold",
        },
      ],
      actions: { primary: "begin_new", secondary: null },
    },

    post_completion: {
      tone: { theme: "gold_dark", mood: "reflective" },
      blocks: [
        { type: "headline", content: "You do not need to start over." },
        {
          type: "subtext",
          content: "You can evolve from where you are.",
          variant: "multi_line",
        },
        {
          type: "subtext",
          content: "{{milestone_insight}}",
          variant: "multi_line",
          visibility_condition: "milestone_insight",
          style: { fontSize: "16px", color: "#bfa58a", marginBottom: "16px" },
        },
        {
          type: "choice_card",
          id: "evolution_path",
          selection_mode: "manual",
          options: [
            {
              id: "deepen",
              title: "Deepen",
              description: "Strengthen what is already growing.",
            },
            {
              id: "refine",
              title: "Refine",
              description: "Adjust the path for where you are now.",
            },
            {
              id: "transcend",
              title: "Transcend",
              description: "Move into a new horizon of practice.",
            },
            {
              id: "maintenance",
              title: "Steady Continuity",
              description: "Stay in gentle rhythm without added intensity.",
            },
            {
              id: "pause",
              title: "Pause with Dignity",
              description: "Rest here. KalpX will be ready when you return.",
            },
          ],
        },
        {
          type: "primary_button",
          label: "Continue My Path →",
          validate: "evolution_path",
          action: {
            type: "submit",
            payload: { type: "checkpoint_submit" },
          },
          style: "gold",
        },
      ],
      actions: { primary: "evolve_cycle", secondary: "pause_cycle" },
    },

    re_entry_portal: {
      tone: { theme: "gold_dark", mood: "steady" },
      blocks: [
        { type: "headline", content: "Return to Structure." },
        { type: "subtext", content: "Your previous rhythm awaits." },
        {
          type: "primary_button",
          label: "Resume Cycle →",
          action: {
            type: "navigate",
            target: {
              container_id: "insights_progress", // FIXED
              state_id: "resume_restart_recalibrate",
            },
          },
          style: "gold",
        },
      ],
      actions: { primary: "resume_cycle", secondary: "restart_cycle" },
    },

    reset_portal: {
      tone: { theme: "gold_dark", mood: "grounded" },
      blocks: [
        { type: "headline", content: "Structure has softened." },
        { type: "subtext", content: "Begin again with intention." },
        {
          type: "primary_button",
          label: "Restart Cycle →",
          action: {
            type: "navigate",
            target: {
              container_id: "choice_stack",
              state_id: "mode_toggle",
            },
          },
          style: "gold",
        },
      ],
      actions: { primary: "reset_cycle", secondary: null },
    },
  },
};
export const CompanionDashboardContainer = {
  container_id: "companion_dashboard",

  states: {
    day_active: {
      tone: { theme: "light_sandal", mood: "steady" },

      meta: {
        requires_active_cycle: true,
        reactive_updates: true,
      },

      dashboard_config: {
        status_messages: {
          completed: "Today's practice is sealed",
          start: "A new day of sadhana begins",
          milestone: "Your rhythm is deepening",
          near_end: "The final days of this cycle — stay steady",
          default: "Continue your practice",
        },
        day_label: "Day {{day_number}}",
        journey_summary:
          "Day {{day_number}} of {{total_days}} — same mantra, same practice, same intention. The repetition is the path.",
        seal_button_labels: {
          ready: "Complete Day →",
          not_ready: "Complete your practice first",
        },
        instruction_text:
          "Tap any card to begin. Even one practice today deepens your Samskara.",
      },

      blocks: [
        {
          type: "micro_label",
          content: "DAY {{day_number}} OF {{total_days}}",
          position: "header",
          variant: "identity_label",
        },
        {
          type: "headline",
          content: "{{identity_headline}}",
          position: "header",
          variant: "identity_headline",
        },
        {
          type: "subtext",
          content: "{{identity_guidance}}",
          position: "header",
          variant: "identity_subtext",
        },
        {
          type: "identity_indicator",
          state: "{{identity_state}}",
          position: "header",
        },
        // Practice Access Cards
        {
          type: "practice_card",
          id: "practice_chant",
          title: "Mantra",
          description: "{{card_mantra_title}}",
          meta: "{{practice_chant_meta}}",
          thumbnail: "/assets/dash_mantra.svg",
          dashboard_variant: true,
          icon: "fas fa-om",
          action_label: "Start →",
          // style: {
          //   background: "rgba(201, 168, 76, 0.05)",
          //   boxShadow: "0 10px 30px rgba(201, 168, 76, 0.1)",
          //   borderRadius: "24px",
          //   border: "1px solid rgba(201, 168, 76, 0.3)",
          // },
          info_action: {
            type: "view_info",
            payload: { type: "mantra" },
          },
          action: {
            type: "navigate",
            target: {
              container_id: "practice_runner",
              state_id: "mantra_rep_selection",
              is_core: true,
            },
          },
        },
        {
          type: "practice_card",
          id: "practice_embody",
          title: "Sankalp",
          description: "{{sankalp_text}}",
          thumbnail: "/assets/dash_sankalp.svg",
          dashboard_variant: true,
          icon: "fas fa-fire",
          action_label: "I Embody This →",
          info_action: {
            type: "view_info",
            payload: { type: "sankalp" },
          },
          action: {
            type: "navigate",
            target: {
              container_id: "practice_runner",
              state_id: "sankalp_embody",
              is_core: true,
            },
          },
        },
        {
          type: "practice_card",
          id: "practice_act",
          title: "Mindful Action",
          description: "{{practice_title}}",
          meta: "{{practice_meta}}",
          thumbnail: "/assets/dash_action.svg",
          dashboard_variant: true,
          icon: "fas fa-mountain",
          action_label: "Begin Practice →",
          allow_repeat: true,
          info_action: {
            type: "view_info",
            payload: { type: "practice" },
          },
          action: {
            type: "navigate",
            target: {
              container_id: "practice_runner",
              state_id: "practice_step_runner",
              is_core: true,
            },
          },
        },
        // Bottom Actions
        {
          type: "primary_button",
          label: "I Feel Triggered",
          style: "gold",
          action: {
            type: "initiate_trigger",
          },
          position: "footer_actions",
          variant: "trigger_entry",
        },
        {
          type: "subtext",
          content:
            "Feeling overwhelmed or disturbed? Tap here and KalpX will guide you through a short reset using a mantra, sankalp, or simple practice.",
          variant: "small",
          position: "footer_actions",
        },

        {
          type: "primary_button",
          label: "Quick Check-In",
          style: "outline",
          action: {
            type: "navigate",
            target: {
              container_id: "cycle_transitions",
              state_id: "quick_checkin",
            },
          },
          position: "footer_actions",
        },
        {
          type: "subtext",
          content:
            "Share how you’re feeling anytime during the day. Each check-in helps KalpX track your progress and guide your journey.",
          variant: "small",
          position: "footer_actions",
        },

        // {
        //   type: "subtext",
        //   variant: "small",
        //   content:
        //     "You can update your state anytime. Your cycle reflections are built from these entries.",
        //   action: {
        //     type: "navigate",
        //     target: {
        //       container_id: "cycle_transitions",
        //       state_id: "daily_reflection",
        //     },
        //   },
        //   position: "footer",
        // },
      ],
    },

    // 2️⃣ IDENTITY STATE INDICATOR
    identity_state_view: {
      tone: { theme: "dark_base", mood: "steady" },

      blocks: [
        {
          type: "headline",
          content: "You are {{identity_state}}.",
        },
        {
          type: "subtext",
          content: "{{identity_guidance}}",
        },
        {
          type: "identity_indicator",
          state: "{{identity_state}}",
        },
      ],
    },

    // 3️⃣ LIVE ADAPTATION NOTIFICATION
    adaptation_toast: {
      overlay: true,
      tone: { theme: "dark_overlay", mood: "neutral" },

      meta: {
        auto_dismiss_ms: 4000,
        non_blocking: true,
      },

      blocks: [
        {
          type: "toast_message",
          content: "{{adaptation_message}}",
        },
      ],
    },
  },
};

export const ChoiceStackContainer = {
  container_id: "choice_stack",

  states: {
    // 1️⃣ MODE TOGGLE
    mode_toggle: {
      tone: {
        theme: "light_sandal",
        mood: "steady",
        backgroundPosition: "96% top",
      },

      blocks: [
        {
          type: "headline",
          content: "Your path includes two reflection points",
          position: "header",
        },
        {
          type: "subtext",
          content:
            "A 14-day journey with a gentle midpoint reflection on Day 7 and a deeper evolution reflection on Day 14.",
          position: "header",
        },
        {
          type: "primary_button",
          label: "Begin My 14-Day Journey →",
          action: {
            type: "submit",
            payload: { type: "cycle_initiation", cycle_length: 14 },
            target: {
              container_id: "choice_stack",
              state_id: "discipline_select",
            },
          },
          style: "gold",
        },
      ],
    },

    // 2️⃣ DISCIPLINE SELECT (this replaces scan_focus)
    discipline_select: {
      tone: {
        theme: "light_sandal",
        mood: "steady",
        backgroundPosition: "93% top",
      },

      blocks: [
        {
          type: "headline",
          content: "Where would you like a little support right now?",
          position: "header",
        },
        {
          type: "subtext",
          content:
            "Pick the area that feels most important today. KalpX will gently guide you forward. ",
          position: "header",
        },
        {
          type: "choice_card",
          id: "scan_focus",
          selection_mode: "manual",
          variant: "premium-grid discipline-grid",
          options: [
            {
              id: "career_focus",
              title: "Career & Focus",
              icon: "/assets/career1.svg",
              tags: ["Clarity", "Discipline"],
              description:
                "Career and focus are rooted in Sanatan wisdom through:",
              breakdown: [
                {
                  term: "Buddhi",
                  definition: "clear intellect",
                  icon: "/assets/buddhi.svg",
                },
                {
                  term: "Viveka",
                  definition: "right discernment",
                  icon: "/assets/viveka.svg",
                },
                {
                  term: "Tejas",
                  definition: "confidence and radiance",
                  icon: "/assets/tejas.svg",
                },
                {
                  term: "Shakti",
                  definition: "ability to act",
                  icon: "/assets/shakthi.svg",
                },
                {
                  term: "Ekagrata",
                  definition: "single-pointed focus",
                  icon: "/assets/dharma.svg",
                },
              ],
            },
            {
              id: "health",
              title: "Health & Wellbeing",
              icon: "/assets/health.svg",
              tags: ["Vitality", "Balance"],
              description: "Health in Sanatan Dharma is tied to:",
              breakdown: [
                {
                  term: "Prana",
                  definition: "life force",
                  icon: "/assets/health_1.svg",
                },
                {
                  term: "Ojas",
                  definition: "deep vitality and reserve",
                  icon: "/assets/health_2.svg",
                },
                {
                  term: "Tejas",
                  definition: "metabolic fire and brightness",
                  icon: "/assets/health_3.svg",
                },
                {
                  term: "Sharira dharma",
                  definition: "right relationship with the body",
                  icon: "/assets/health_4.svg",
                },
                {
                  term: "Arogya",
                  definition: "wholeness and healing",
                  icon: "/assets/health_5.svg",
                },
              ],
            },
            {
              id: "relationships",
              title: "Relationships",
              icon: "/assets/relationship.svg",
              tags: ["Connection", "Trust"],
              description:
                "Relationships in Sanatan Dharma are not only social bonds. They are linked to:",
              breakdown: [
                {
                  term: "Prema",
                  definition: "sacred love",
                  icon: "/assets/relation_1.svg",
                },
                {
                  term: "Karuna",
                  definition: "compassion",
                  icon: "/assets/relation_2.svg",
                },
                {
                  term: "Kshama",
                  definition: "forgiveness",
                  icon: "/assets/relation_3.svg",
                },
                {
                  term: "Hridaya shuddhi",
                  definition: "purification of the heart",
                  icon: "/assets/relation_4.svg",
                },
                {
                  term: "Sambandha",
                  definition: "right relationship",
                  icon: "/assets/relation_5.svg",
                },
              ],
            },
            {
              id: "spiritual_growth",
              title: "Spiritual Growth",
              icon: "/assets/spiritual_growth.png",
              tags: ["Devotion", "Awareness"],
              description:
                "Spiritual growth in Sanatan Dharma is the journey toward the Self through:",
              breakdown: [
                {
                  term: "Bhakti",
                  definition: "devotion and love",
                  icon: "/assets/wealth_1.svg",
                },
                {
                  term: "Viveka",
                  definition: "discernment of real and unreal",
                  icon: "/assets/viveka.svg",
                },
                {
                  term: "Vairagya",
                  definition: "detachment from the transient",
                  icon: "/assets/wealth_2.svg",
                },
                {
                  term: "Santosha",
                  definition: "contentment and gratitude",
                  icon: "/assets/wealth_3.svg",
                },
                {
                  term: "Shraddha",
                  definition: "faith rooted in experience",
                  icon: "/assets/wealth_4.svg",
                },
              ],
            },
          ],
        },

        {
          type: "primary_button",
          label: "Let’s Begin →",
          validate: "scan_focus",
          validation_message: "Please select an area to continue.",
          action: {
            type: "navigate",
            target: {
              container_id: "stable_scan",
              state_id: "prana_baseline",
            },
          },
          style: "gold",
          position: "footer",
        },
        {
          type: "subtext",
          content: "Return to start",
          variant: "link",
          action: { type: "return_to_start" },
          position: "footer",
          style: { fontSize: "14px", marginTop: "4px" },
        },
        {
          type: "subtext",
          content:
            "Your choice helps KalpX understand where you are today, so the guidance can be truly personal.",
          variant: "small",
          position: "footer",
        },
      ],
    },

    // 3️⃣ DOMAIN SELECT
    domain_select: {
      tone: {
        theme: "light_sandal",
        mood: "steady",
        backgroundPosition: "93% top",
      },

      blocks: [
        {
          type: "headline",
          content: "Choose your life domain.",
          position: "header",
        },
        {
          type: "subtext",
          content: "Where does this discipline apply?",
          position: "header",
        },
        {
          type: "choice_card",
          id: "domain_select",
          selection_mode: "manual",
          options: [
            {
              id: "wealth",
              title: "Wealth",
              description: "Financial awareness & discipline.",
            },
            {
              id: "relationships",
              title: "Relationships",
              description: "Conscious communication.",
            },
            {
              id: "health",
              title: "Health",
              description: "Energy & physical integrity.",
            },
            {
              id: "work",
              title: "Work",
              description: "Professional steadiness.",
            },
          ],
        },
        {
          type: "primary_button",
          label: "Continue →",
          validate: "domain_select",
          validation_message: "Please select an area to continue.",
          action: {
            type: "navigate",
            target: {
              container_id: "composer",
              state_id: "sankalp_composer",
            },
          },
          style: "gold",
          position: "footer",
        },
      ],
    },
    // 5️⃣ DEPTH SELECTION
    depth_selection: {
      tone: {
        theme: "light_sandal",
        mood: "steady",
        backgroundPosition: "93% top",
      },
      meta: {
        section_label: "CHOOSE YOUR PRACTICE LEVEL",
      },
      blocks: [
        {
          id: "depth_lotus_top",
          type: "image",
          url: "/assets/level_lotus.svg",
          style: {
            width: "212px",
            height: "68px",
            margin: "0 auto -5px",
            display: "block",
            boxShadow: "none",
            border: "none",
            background: "transparent",
            position: "relative",
            zIndex: "2",
          },
          position: "header",
        },

        {
          type: "headline",
          content: "Step into your next level",
          position: "header",
        },
        {
          type: "subtext",
          content: "Choose the practice level that feels right for you today.",
          position: "header",
        },
        {
          type: "choice_card",
          id: "routine_depth",
          selection_mode: "manual",
          options: [
            {
              id: "beginner",
              title: "Beginner",
              label: "Easy",
              description:
                "Simple, gentle practices to help you begin. Perfect for easing into your routine.",
              label_color: "#A2A751",
            },
            {
              id: "intermediate",
              title: "Intermediate",
              label: "Balanced",
              description:
                "A balanced level to build focus and consistency. Ideal when you're ready to go a little deeper.",
              label_color: "#D9A557",
            },
            {
              id: "advanced",
              title: "Advanced",
              label: "Deep",
              description:
                "More immersive practices for deeper transformation. For when you feel ready to commit more fully.",
              label_color: "#C57457",
            },
          ],
        },
        {
          type: "primary_button",
          label: "Continue My Journey →",
          validate: "routine_depth",
          validation_message: "Please select a practice level to continue.",
          action: {
            type: "navigate",
            target: {
              container_id: "lock_ritual_overlay",
              state_id: "hold_to_lock",
            },
          },
          style: "gold",
          position: "footer",
        },
        {
          type: "subtext",
          content:
            "Depth is about fit, not worth. Choose what matches your life right now.",
          variant: "small_centered",
          position: "footer",
        },
      ],
    },
  },
};

export const ComposerContainer = {
  container_id: "composer",

  states: {
    // 1️⃣ MAIN COMPOSER (Fresh Write)
    sankalp_composer: {
      tone: { theme: "light_sandal", mood: "steady" },

      meta: {
        min_length: 12,
        max_length: 120,
        allow_ai_assist: true,
      },

      blocks: [
        {
          type: "headline",
          content: "Write your Sankalp.",
          position: "header",
        },
        {
          type: "subtext",
          content: "Short. Clear. Behavioral.",
          position: "header",
        },
        {
          type: "textarea",
          id: "sankalp_input",
          character_limit: 120,
        },
        {
          type: "chip_list",
          options: [
            { id: "raise_voice", label: "I respond without raising my voice." },
            { id: "complete_begin", label: "I complete what I begin." },
            { id: "before_react", label: "I pause before reacting." },
            { id: "act_financial", label: "I act with financial awareness." },
          ],
        },
        // {
        //   type: "helper_text",
        //   content: "A Sankalp is behavioral. Not aspirational.",
        // },
        {
          type: "subtext",
          content: "Need suggestions?",
          variant: "link",
          action: {
            type: "navigate",
            target: {
              container_id: "composer",
              state_id: "ai_suggestions",
            },
          },
          position: "footer",
        },

        {
          type: "primary_button",
          label: "Continue ",
          action: {
            type: "navigate",
            target: {
              container_id: "routine_builder",
              state_id: "mantra_reps_picker",
            },
          },
          validation: {
            min_length: 12,
          },
          style: "gold",
          position: "footer",
        },
      ],
    },

    // 2️⃣ AI SUGGESTIONS OVERLAY
    ai_suggestions: {
      overlay: true,
      tone: { theme: "dark_overlay", mood: "neutral" },

      blocks: [
        {
          type: "headline",
          content: "Suggested Sankalps",
        },
        {
          type: "choice_card",
          selection_mode: "single",
          options: [
            {
              id: "s1",
              title: "I pause before responding in tension.",
            },
            {
              id: "s2",
              title: "I complete tasks before switching.",
            },
            {
              id: "s3",
              title: "I speak honestly without aggression.",
            },
          ],
        },
        {
          type: "primary_button",
          label: "Proceed",
          action: {
            type: "navigate",
            target: {
              container_id: "choice_stack",
              state_id: "mode_toggle",
            },
          },
          style: "gold",
        },
      ],
    },

    // 3️⃣ VALIDATION WARNING (Too Vague / Too Short)
    validation_warning: {
      tone: { theme: "light_sandal", mood: "neutral" },

      blocks: [
        {
          type: "headline",
          content: "Refine your Sankalp.",
        },
        {
          type: "subtext",
          content: "Make it behavioral and specific.",
        },
        {
          type: "primary_button",
          label: "Edit",
          action: {
            type: "navigate",
            target: {
              container_id: "composer",
              state_id: "sankalp_composer",
            },
          },
        },
      ],
    },

    // 4️⃣ EDIT EXISTING SANKALP (Before Lock)
    edit_sankalp: {
      tone: { theme: "light_sandal", mood: "steady" },

      meta: {
        preload_existing: true,
      },

      blocks: [
        {
          type: "headline",
          content: "Refine your Sankalp.",
        },
        {
          type: "text_input",
          id: "sankalp_input",
          preload_existing: true,
          character_limit: 120,
        },
        {
          type: "primary_button",
          label: "Update",
          action: {
            type: "navigate",
            target: {
              container_id: "routine_locked",
              state_id: "locked_summary",
            },
          },
        },
      ],
    },

    // 5️⃣ LOCKED REDIRECT (If Cycle Already Active)
    locked_redirect: {
      tone: { theme: "light_sandal", mood: "neutral" },

      blocks: [
        {
          type: "headline",
          content: "Your Sankalp is already active.",
        },
        {
          type: "subtext",
          content: "Adjust structure intentionally if needed.",
        },
        {
          type: "primary_button",
          label: "View Structure",
          action: {
            type: "navigate",
            target: {
              container_id: "routine_locked",
              state_id: "locked_summary",
            },
          },
        },
      ],
    },
  },
};

export const LockRitualContainer = {
  container_id: "lock_ritual_overlay",

  states: {
    // 1️⃣ CYCLE LOCK FRICTION STATE
    hold_to_lock: {
      overlay: true,
      tone: { theme: "dark_overlay", mood: "steady" },

      meta: {
        hold_duration_ms: {
          "7_day": 1800,
          "14_day": 2400,
        },
        horizontal_padding: 24,
        block_background_interaction: true,
        cancel_on_release: true,
      },

      blocks: [
        {
          type: "micro_label",
          content: "COMMIT TO YOUR PATH",
          style: "uppercase_subtle",
        },
        {
          type: "headline",
          content: "Hold to seal your sadhana.",
        },
        {
          type: "subtext",
          content:
            "This is your commitment to yourself — for the next {{total_days}} days.",
        },
        {
          type: "hold_button",
          label: "Hold to Commit",
          holding_label: "Committing...",
          interaction: {
            type: "press_and_hold",
            progress_ring: true,
            glow_intensity: "gradual_gold",
            haptic_feedback: {
              mid_point: true,
              completion: true,
            },
          },
          on_complete: {
            type: "generate_companion",
          },
        },
        {
          type: "subtext",
          content:
            "Abhyasa (consistent practice) and Vairagya (letting go) — the two wings of transformation.",
        },
      ],
    },
  },
};

export const RoutineBuilderContainer = {
  container_id: "routine_builder",

  states: {
    // 1️⃣ MANTRA FREQUENCY PICKER
    mantra_reps_picker: {
      tone: { theme: "light_sandal", mood: "structured" },

      blocks: [
        {
          type: "headline",
          content: "Mantra Repetitions",
        },
        {
          type: "subtext",
          content: "Select your daily repetition count.",
        },
        {
          type: "option_picker",
          id: "mantra_reps",
          options: [1, 9, 27, 54, 108],
          selection_mode: "single",
        },
        {
          type: "primary_button",
          label: "Next →",
          action: {
            type: "navigate",
            target: {
              container_id: "routine_builder",
              state_id: "anchor_duration_picker",
            },
          },
        },
      ],
    },

    // 2️⃣ ANCHOR DURATION SLIDER
    anchor_duration_picker: {
      tone: { theme: "light_sandal", mood: "structured" },

      blocks: [
        {
          type: "headline",
          content: "Anchor Duration",
        },
        {
          type: "subtext",
          content: "Select your daily stabilization time.",
        },
        {
          type: "option_picker",
          id: "anchor_duration",
          options: [3, 5, 8, 12],
          selection_mode: "single",
          unit: "minutes",
        },
        {
          type: "primary_button",
          label: "Next →",
          action: {
            type: "navigate",
            target: {
              container_id: "routine_builder",
              state_id: "refinement_layer_menu",
            },
          },
        },
      ],
    },

    // 3️⃣ REFINEMENT LAYER MENU
    refinement_layer_menu: {
      tone: { theme: "light_sandal", mood: "structured" },

      blocks: [
        {
          type: "headline",
          content: "Choose refinement layer",
        },
        {
          type: "choice_card",
          selection_mode: "single",
          options: [
            { id: "observation", title: "Observation" },
            { id: "embodiment", title: "Embodiment" },
            { id: "stability", title: "Stability" },
          ],
        },
        {
          type: "primary_button",
          label: "Review Routine →",
          action: {
            type: "navigate",
            target: {
              container_id: "routine_builder",
              state_id: "routine_review_summary",
            },
          },
        },
      ],
    },

    // 4️⃣ AI SUGGESTION MODAL
    ai_suggestion_modal: {
      overlay: true,
      tone: { theme: "dark_overlay", mood: "neutral" },

      blocks: [
        {
          type: "headline",
          content: "Suggested Adjustments",
        },
        {
          type: "choice_card",
          selection_mode: "single",
          options: [
            {
              id: "reduce_anchor",
              title: "Reduce anchor to maintain consistency",
            },
            {
              id: "increase_reps",
              title: "Increase reps for deeper repetition",
            },
          ],
        },
        {
          type: "primary_button",
          label: "Apply Suggestion",
          action: { type: "apply_adjustment" },
        },
      ],
    },

    // 5️⃣ OVER-STACKING WARNING
    over_stacking_warning: {
      overlay: true,
      tone: { theme: "dark_overlay", mood: "caution" },

      blocks: [
        {
          type: "headline",
          content: "Structure may be too intense.",
        },
        {
          type: "subtext",
          content: "Too much change reduces consistency.",
        },
        {
          type: "choice_card",
          selection_mode: "single",
          options: [
            { id: "simplify", title: "Simplify Structure" },
            { id: "proceed_anyway", title: "Proceed Anyway" },
          ],
        },
      ],
    },

    // 6️⃣ ROUTINE REVIEW SUMMARY
    routine_review_summary: {
      tone: { theme: "light_sandal", mood: "steady" },

      blocks: [
        {
          type: "headline",
          content: "Routine Summary",
        },
        {
          type: "summary_block",
          fields: [
            { label: "Mantra", value_key: "mantra_reps" },
            { label: "Anchor", value_key: "anchor_duration" },
            { label: "Refinement", value_key: "refinement_layer" },
            { label: "Sankalp", value_key: "sankalp_text" },
          ],
        },
        {
          type: "primary_button",
          label: "Lock Structure →",
          action: {
            type: "navigate",
            target: {
              container_id: "lock_ritual_overlay",
              state_id: "hold_to_lock",
            },
          },
          style: "gold",
        },
      ],
    },
  },
};

export const RoutineLockedContainer = {
  container_id: "routine_locked",

  states: {
    // 1️⃣ ROUTINE LOCKED STATE (READ-ONLY)
    locked_summary: {
      tone: { theme: "light_sandal", mood: "steady" },

      blocks: [
        {
          type: "headline",
          content: "Your cycle is locked.",
        },
        {
          type: "subtext",
          content: "Consistency creates identity.",
        },
        {
          type: "summary_block",
          fields: [
            { label: "Sankalp", value_key: "sankalp_text" },
            { label: "Mantra Repetitions", value_key: "mantra_reps" },
            { label: "Anchor Duration", value_key: "anchor_duration" },
            { label: "Refinement Layer", value_key: "refinement_layer" },
          ],
        },
        {
          type: "link_text",
          content: "Adjust with intention",
          action: {
            type: "navigate",
            target: {
              container_id: "routine_locked",
              state_id: "adjust_with_intention",
            },
          },
        },
      ],
    },

    // 2️⃣ ADJUST WITH INTENTION PORTAL
    adjust_with_intention: {
      overlay: true,
      tone: { theme: "dark_overlay", mood: "caution" },

      meta: {
        requires_confirmation: true,
      },

      blocks: [
        {
          type: "headline",
          content: "Adjusting will reset structural consistency.",
        },
        {
          type: "subtext",
          content: "This action should be intentional.",
        },
        {
          type: "choice_card",
          selection_mode: "single",
          options: [
            {
              id: "continue_adjust",
              title: "Continue to Adjust",
            },
            {
              id: "cancel_adjust",
              title: "Cancel",
            },
          ],
        },
      ],

      on_select: {
        continue_adjust: {
          type: "navigate",
          target: {
            container_id: "routine_builder",
            state_id: "mantra_reps_picker",
          },
        },
        cancel_adjust: {
          type: "navigate",
          target: {
            container_id: "routine_locked",
            state_id: "locked_summary",
          },
        },
      },
    },

    // 3️⃣ CONFIRMATION OF ADJUSTED STRUCTURE
    adjusted_confirmation: {
      tone: { theme: "light_sandal", mood: "steady" },

      blocks: [
        {
          type: "headline",
          content: "Structure updated intentionally.",
        },
        {
          type: "subtext",
          content: "Continue your cycle with clarity.",
        },
        {
          type: "subtext",
          variant: "link",
          content: "Return to Mitra Home",
          action: {
            type: "navigate",
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
        },
      ],
    },
  },
};

export const PracticeRunnerContainer = {
  container_id: "practice_runner",

  states: {
    // 0️⃣ MANTRA REP SELECTION
    mantra_rep_selection: {
      tone: { theme: "light_sandal", mood: "reflective" },
      blocks: [
        {
          type: "headline",
          content: "Choose Your Chant Count",
        },
        {
          type: "subtext",
          content: "Set the number of chants for this session.",
        },

        {
          id: "reps_total",
          type: "option_picker",
          options: [1, 9, 27, 54, 108],
          unit: "Chants",
        },

        {
          id: "begin_mantra_practice",
          type: "primary_button",
          label: "Begin Chanting →",
          action: {
            type: "navigate",
            target: {
              container_id: "practice_runner",
              state_id: "mantra_prep",
            },
          },
        },
        {
          type: "subtext",
          content:
            "You can always begin with a smaller count and build gradually.",
        },
        {
          type: "subtext",
          variant: "link",
          content: "Return to Mitra Home",
          action: {
            type: "navigate",
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
          position: "footer",
          style: { fontSize: "14px", marginTop: "10px" },
        },
      ],
    },
    // 0.5️⃣ MANTRA PREPARATION SCREEN
    mantra_prep: {
      variant: "mantra_prep",
      prep_config: {
        header_label: "Audio Guidance Playing",
        headphone_text: "Use headphone for the best experience",
        sentences: [
          "Be still...",
          "Let your mind settle...",
          "Chant with devotion and awareness...",
          "Offer yourself completely...",
          "Let this mantra transform you from within.",
        ],
        audio_src: "/sounds/Audio_Be_still.mp4",
        timings: [0, 2, 4, 6, 9, 14],
      },

      on_complete: {
        type: "navigate",
        target: {
          container_id: "practice_runner",
          state_id: "mantra_runner",
        },
      },
    },
    // 1️⃣ MANTRA PRACTICE SCREEN (21)
    mantra_runner: {
      variant: "mantra_runner",
      tone: { theme: "light_sandal", mood: "immersive" },

      meta: {
        disable_navigation: true,
        persist_progress: true,
      },

      blocks: [
        {
          type: "rep_counter",
          total: "{{reps_total}}",
        },
        {
          type: "mantra_display",
          text_key: "mantra_text",
          devanagari_key: "mantra_devanagari",
        },
        { type: "audio_player" },
      ],

      on_complete: {
        type: "navigate",
        target: {
          container_id: "practice_runner",
          state_id: "mantra_complete",
        },
      },
      mantra_config: {
        tap_label: "TAP",
        sub_tap_label: "HERE",
        hint_text: "TAP THE BEAD AFTER EACH MANTRA.",
      },
    },

    // 2️⃣ MANTRA REP COUNTER FEEDBACK (22)
    mantra_feedback: {
      tone: { theme: "deep_focus", mood: "active" },

      blocks: [
        {
          type: "rep_counter_feedback",
          animation: "subtle_scale",
          haptic: true,
        },
      ],
    },

    // 3️⃣ MANTRA COMPLETION STATE (23)
    mantra_complete: {
      variant: "mantra_complete",
      tone: {
        theme: "light_sandal",
        mood: "grounded",
        backgroundImage: "/assets/mantra3.png",
      },

      feedback_config: {
        slow_threshold: 3.0,
        fast_feedback: {
          title: "A Gentle Reflection",
          message: "Did each mantra truly resonate within you?",
          sub: "True power comes from feeling, not just counting. Let every syllable settle into your being.",
          recommendRepeat: true,
          retry_cta: "Take a breath and chant slowly and mindfully.",
        },
        slow_feedback: {
          title: "Soulful Rhythm",
          message:
            "Beautifully paced. You stayed deeply present with every repetition.",
          sub: "This steady rhythm helps the mantra's energy settle deeply into your soul.",
          recommendRepeat: false,
        },
      },

      completion_config: {
        headline: "Mantra Completed.",
        subtext: "A moment of inner calm strengthens your foundation.",
        reflection_label: "Session Reflection",
        points: ["Mind cleared", "Stability reinforced", "Inner calm expanded"],
        repeat_label: "Repeat it again",
        dashboard_label: "Return to Mitra Home",
      },

      blocks: [
        {
          type: "headline",
          content: "Mantra Completed.",
          style: {
            fontFamily: "'Roboto Serif', serif !important",
            fontSize: "34px",
            fontWeight: "400",
            color: "#432104",
            marginBottom: "16px",
            marginTop: "32px",
            letterSpacing: "-0.02em",
          },
        },
        {
          type: "subtext",
          content: "A moment of inner calm strengthens your foundation.",
          style: {
            fontSize: "17px",
            color: "#8C8881",
            maxWidth: "300px",
            margin: "0 auto 32px auto",
            lineHeight: "1.5",
            fontWeight: "400",
          },
        },
        {
          type: "lotus_logo",
          style: { height: "240px", marginBottom: "20px" },
        },
        {
          type: "subtext",
          variant: "centered",
          content:
            "<div style='display: flex; flex-direction: column; align-items: flex-start; gap: 16px; width: fit-content; margin: 0 auto; color: #615247; padding-top: 20px;'>\n  <div style='display: flex; align-items: center; gap: 16px;'> <span style=\"font-size: 18px; font-weight: 500; letter-spacing: 0.2px;\">Mind cleared</span></div>\n  <div style='display: flex; align-items: center; gap: 16px;'><span style=\"font-size: 18px; font-weight: 500; letter-spacing: 0.2px;\">Stability reinforced</span></div>\n  <div style='display: flex; align-items: center; gap: 16px;'> <span style=\"font-size: 18px; font-weight: 500; letter-spacing: 0.2px;\">Inner calm expanded</span></div>\n</div>",
        },
        {
          type: "primary_button",
          label: "Repeat it again",
          style: "outline",
          action: {
            type: "navigate",
            target: {
              container_id: "practice_runner",
              state_id: "mantra_rep_selection",
              is_core: true,
            },
          },
          position: "footer_actions",
        },
        {
          type: "primary_button",
          label: "Return to Mitra Home",
          style: "gold",
          action: {
            type: "submit",
            payload: { practiceId: "practice_chant", completed: true },
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
          position: "footer_actions",
        },
      ],
    },

    // 4️⃣ SANKALP EMBODIMENT SCREEN (24)
    sankalp_embody: {
      variant: "sankalp_embody",
      tone: { theme: "light_sandal", mood: "reflective" },
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: "100vh",
      },
      on_complete: {
        type: "navigate",
        target: {
          container_id: "practice_runner",
          state_id: "sankalp_confirm",
        },
      },

      embody_config: {
        instruction:
          "Hold here. Breathe once, and let your sankalp anchor within you.",
        action_hint: "Tap the Circle to Embody",
        om_audio_src: "/sounds/Om.mp4",
      },
      blocks: [
        // {
        //   type: "headline",
        //   content: "“",
        //   style: {
        //     fontSize: "60px",
        //     color: "#D4B16A",
        //     opacity: 0.3,
        //     lineHeight: 1,
        //     marginBottom: "-40px",
        //     fontFamily: "'Roboto Serif', serif !important",
        //   },
        // },
        {
          type: "sankalp_display",
          text_key: "sankalp_text",
          variant: "ritual_quote",
          style: {
            fontSize: "26px",
            lineHeight: "1.4",
            textAlign: "center",
            fontWeight: "400",
            fontStyle: "italic",
            color: "#2C2A26",
            maxWidth: "320px",
            padding: "0 10px",
            fontFamily: "'Roboto Serif', serif !important",
          },
        },
        // {
        //   type: "headline",
        //   content: "”",
        //   style: {
        //     fontSize: "60px",
        //     color: "#D4B16A",
        //     opacity: 0.3,
        //     lineHeight: 1,
        //     marginTop: "-20px",
        //     marginBottom: "20px",
        //     fontFamily: "'Roboto Serif', serif !important",
        //   },
        // },
        {
          type: "subtext",
          content:
            "Hold here. Breathe once, and let your sankalp anchor within you.",
          style: {
            textAlign: "center",
            fontSize: "17px",
            color: "#5C5648",

            lineHeight: "1.5",
            opacity: 0.8,
            marginBottom: "20px",
          },
        },
        {
          type: "hold_button",
          label: "HOLD TO EMBODY",
          hold_duration: 3000,
          interaction: {
            type: "press_and_hold_circular",
            progress_ring: true,
            glow_intensity: "sacred_gold_pulse",
            haptic_feedback: {
              mid_point: true,
              completion: true,
            },
          },
          on_complete: {
            type: "navigate",
            target: {
              container_id: "practice_runner",
              state_id: "sankalp_confirm",
            },
          },
        },
        {
          type: "subtext",
          variant: "link",
          content: "Return to Mitra Home",
          action: {
            type: "navigate",
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
          position: "footer",
          style: { fontSize: "14px", marginTop: "10px" },
        },
      ],
    },

    // 5️⃣ SANKALP ACTIVATION CONFIRMATION (25)
    sankalp_confirm: {
      variant: "sankalp_confirm",
      tone: {
        theme: "light_sandal",
        mood: "grounded",
        backgroundImage: "/assets/mantra3.png",
      },
      completion_config: {
        headline: "Your Sankalp is Alive.",
        subtext:
          "Your sankalp is now alive in you. Carry it gently through your day.\nLet it guide your choices, words, and pauses.",
        points: [
          { label: "Mind\nCentered", icon: "/assets/sankalp_centered.svg" },
          { label: "Inner\nPeace", icon: "/assets/sankalp_inner_peace.svg" },
        ],
        repeat_label: "Repeat it again",
        dashboard_label: "Return to Mitra Home",
      },
      blocks: [
        {
          type: "headline",
          content: "Your Sankalp is Alive.",
          style: {
            fontFamily: "'Roboto Serif', serif !important",
            fontSize: "34px",
            fontWeight: "400",
            color: "#432104",
            marginBottom: "16px",
            marginTop: "32px",
            letterSpacing: "-0.02em",
          },
        },
        {
          type: "subtext",
          content:
            "Your sankalp is now alive in you. Carry it gently through your day.\nLet it guide your choices, words, and pauses.",
          style: {
            fontSize: "17px",
            color: "#8C8881",
            maxWidth: "320px",
            margin: "0 auto 32px auto",
            lineHeight: "1.6",
            fontWeight: "400",
            textAlign: "center",
            whiteSpace: "pre-line",
          },
        },
        // How to live this sankalp — PROMINENT after activation
        {
          id: "sankalp_how_to_live_block",
          type: "subtext",
          content: "",
          variant: "sankalp_living",
          label: "How to carry this through your day",
          position: "content",
        },
        {
          type: "lotus_logo",
          style: { height: "200px", marginBottom: "24px" },
        },
        {
          type: "primary_button",
          label: "Repeat it again",
          style: "outline",
          action: {
            type: "navigate",
            target: {
              container_id: "practice_runner",
              state_id: "sankalp_embody",
              is_core: true,
            },
          },
          position: "footer_actions",
        },
        {
          type: "primary_button",
          label: "Return to Mitra Home",
          action: {
            type: "submit",
            payload: { practiceId: "practice_embody", completed: true },
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
          style: "gold",
          position: "footer_actions",
        },
      ],
    },

    // 6️⃣ ANCHOR TIMER SCREEN (26)
    anchor_timer: {
      tone: { theme: "deep_focus", mood: "immersive" },

      meta: {
        persist_timer_background: true,
      },

      blocks: [
        {
          type: "timer_display",
          duration_key: "anchor_duration",
          format: "mm:ss",
        },
        {
          type: "timer_controls",
          options: ["start", "pause", "resume"],
        },
      ],

      on_complete: {
        type: "navigate",
        target: {
          container_id: "practice_runner",
          state_id: "anchor_complete",
        },
      },
    },

    // 7️⃣ ANCHOR COMPLETION STATE (27)
    anchor_complete: {
      tone: {
        theme: "deep_focus",
        mood: "grounded",
        backgroundImage: "/assets/mantra3.png",
      },

      blocks: [
        {
          type: "headline",
          content: "Anchor complete.",
          style: {
            fontFamily: "'Roboto Serif', serif !important",
            fontSize: "34px",
            fontWeight: "400",
            color: "#432104",
            marginBottom: "16px",
            marginTop: "32px",
            letterSpacing: "-0.02em",
          },
        },
        {
          type: "subtext",
          content: "Nervous system stabilized.",
          style: {
            fontSize: "17px",
            color: "#8C8881",
            maxWidth: "300px",
            margin: "0 auto 32px auto",
            lineHeight: "1.5",
            fontWeight: "400",
          },
        },
        {
          type: "lotus_logo",
          style: { height: "240px", marginBottom: "40px" },
        },
        {
          type: "primary_button",
          label: "Repeat it again",
          style: "outline",
          action: {
            type: "navigate",
            target: {
              container_id: "practice_runner",
              state_id: "anchor_timer",
            },
          },
          position: "footer_actions",
        },
        {
          type: "primary_button",
          label: "Return to Mitra Home",
          action: {
            type: "submit",
            payload: { practiceId: "practice_act", completed: true },
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
          style: "gold",
          position: "footer_actions",
        },
      ],
    },

    practice_complete: {
      tone: {
        theme: "light_sandal",
        mood: "grounded",
        backgroundImage: "/assets/mantra3.png",
      },
      blocks: [
        {
          type: "headline",
          content: "Practice Completed.",
          style: {
            fontFamily: "'Roboto Serif', serif !important",
            fontSize: "34px",
            fontWeight: "400",
            color: "#432104",
            marginBottom: "16px",
            marginTop: "32px",
            letterSpacing: "-0.02em",
          },
        },
        {
          type: "subtext",
          content: "You've taken a meaningful step in your journey today.",
          style: {
            fontSize: "17px",
            color: "#8C8881",
            maxWidth: "320px",
            margin: "0 auto 32px auto",
            lineHeight: "1.6",
            fontWeight: "400",
            textAlign: "center",
          },
        },
        {
          type: "lotus_logo",
          style: { height: "240px", marginBottom: "40px" },
        },
        {
          type: "primary_button",
          label: "Repeat it again",
          style: "outline",
          action: {
            type: "navigate",
            target: {
              container_id: "practice_runner",
              state_id: "practice_step_runner",
              is_core: true,
            },
          },
          position: "footer_actions",
        },
        {
          type: "primary_button",
          label: "Return to Mitra Home",
          action: {
            type: "submit",
            payload: { practiceId: "practice_act", completed: true },
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
          style: "gold",
          position: "footer_actions",
        },
      ],
    },

    // 8️⃣ INTERACTIVE PRACTICE STEP RUNNER
    practice_step_runner: {
      variant: "sacred_pause",
      pause_config: {
        title: "Pause",
        subtitle: "The world can wait {{duration}}.",
        orb_label: "Return to the moment",
        selection_title: "How long will you pause?",
        begin_button: "Begin",
        selection_hint: "Choose your duration to begin",
        cancel_button: "End Practice",
        dashboard_button: "Return to Mitra Home",
        default_steps: [
          "Place one hand on the belly",
          "Inhale and let belly rise",
          "Exhale and let belly soften",
          "Repeat slowly",
          "Stay mindful of the rhythm",
        ],
        om_audio_src: "/sounds/Om.mp4",
      },
      tone: { theme: "light_sandal", mood: "calming" },
      style: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
      },
      on_complete: {
        type: "navigate",
        target: {
          container_id: "practice_runner",
          state_id: "practice_complete",
        },
      },
      blocks: [
        {
          type: "headline",
          content: "Pause.",
          position: "header",
          style: { fontSize: "36px", fontWeight: "300", letterSpacing: "1px" },
        },
        {
          type: "subtext",
          content: "The world can wait {{info.duration}}.",
          position: "header",
          style: { opacity: "0.5", fontSize: "16px", marginBottom: "30px" },
        },
        {
          type: "subtext",
          content: "{{info.steps_text}}",
          variant: "centered",
          position: "content",
          style: {
            fontSize: "19px",
            lineHeight: "1.6",
            color: "#5a5448",
            fontStyle: "italic",
            maxWidth: "340px",
            margin: "0 auto",
            opacity: "0.9",
          },
        },
        {
          type: "pause_orb",
          show_breathing_labels: true,
        },
        {
          type: "micro_label",
          content: "{{info.title}}",
          variant: "centered",
          position: "footer",
          style: { opacity: "0.4", marginBottom: "15px" },
        },
        {
          type: "subtext",
          variant: "link",
          content: "Return to Mitra Home",
          action: {
            type: "submit",
            payload: { practiceId: "practice_act", completed: true },
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
          visibility_condition: "show_next_button",
          variant: "gold",
          position: "footer",
        },
        // {
        //   type: "primary_button",
        //   label: "Complete Practice",
        //   action: {
        //     type: "submit",
        //     payload: { practiceId: "practice_act", completed: true },
        //     target: {
        //       container_id: "companion_dashboard",
        //       state_id: "day_active",
        //     },
        //   },
        //   visibility_condition: "show_complete_button",
        //   variant: "gold",
        //   position: "footer",
        // },
        {
          type: "subtext",
          variant: "link",
          content: "End Practice",
          action: { type: "back" },
          position: "footer",
          style: { fontSize: "14px", marginTop: "10px" },
        },
      ],
    },

    // Trigger support practice runner — on_complete goes to trigger_recheck
    trigger_practice_runner: {
      variant: "support_practice",
      tone: { theme: "light_sandal", mood: "calming" },
      blocks: [],
    },

    quick_practice_step_runner: {
      variant: "sacred_pause",
      pause_config: {
        title: "Pause",
        subtitle: "The world can wait {{duration}}.",
        orb_label: "Return to the moment",
        selection_title: "How long will you pause?",
        begin_button: "Begin",
        selection_hint: "Choose your duration to begin",
        cancel_button: "End Practice",
        dashboard_button: "Return to Mitra Home",
        default_steps: [
          "Place one hand on the belly",
          "Inhale and let belly rise",
          "Exhale and let belly soften",
          "Repeat slowly",
          "Stay mindful of the rhythm",
        ],
        om_audio_src: "/sounds/Om.mp4",
      },
      tone: { theme: "light_sandal", mood: "calming" },
      style: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 10px",
      },
      on_complete: {
        type: "navigate",
        target: {
          container_id: "practice_runner",
          state_id: "practice_complete",
        },
      },
      blocks: [
        {
          type: "headline",
          content: "Pause.",
          position: "header",
          style: { fontSize: "36px", fontWeight: "300", letterSpacing: "1px" },
        },
        {
          type: "subtext",
          content: "The world can wait {{info.duration}}.",
          position: "header",
          style: { opacity: "0.5", fontSize: "16px", marginBottom: "30px" },
        },
        {
          type: "subtext",
          content: "{{info.steps_text}}",
          variant: "centered",
          position: "content",
          style: {
            fontSize: "19px",
            lineHeight: "1.6",
            color: "#5a5448",
            fontStyle: "italic",
            maxWidth: "340px",
            margin: "0 auto",
            opacity: "0.9",
          },
        },
        {
          type: "pause_orb",
          show_breathing_labels: true,
        },
        {
          type: "micro_label",
          content: "{{info.title}}",
          variant: "centered",
          position: "footer",
          style: { opacity: "0.4", marginBottom: "15px" },
        },
        {
          type: "subtext",
          variant: "link",
          content: "Return to Mitra Home",
          action: {
            type: "submit",
            payload: { quick_practice_completed: true },
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
          visibility_condition: "show_next_button",
          variant: "gold",
          position: "footer",
        },
        {
          type: "subtext",
          variant: "link",
          content: "End Practice",
          action: { type: "back" },
          position: "footer",
          style: { fontSize: "14px", marginTop: "10px" },
        },
      ],
    },

    free_mantra_chanting: {
      variant: "mantra_runner",
      tone: {
        theme: "light_sandal",
        mood: "steady",
        backgroundImage: "/assets/mantra3.png",
      },
      blocks: [
        // {
        //   type: "headline",
        //   content: "Pause before this grows.",
        //   position: "header",
        //   style: { fontSize: "16px", letterSpacing: "2px", opacity: "0.6" },
        // },
        // {
        //   type: "subtext",
        //   content: "You do not need to solve everything right now. Stay here for a few breaths and let the intensity soften first.",
        //   position: "header",
        //   style: { fontSize: "14px", opacity: "0.8", marginTop: "4px" },
        // },
        {
          type: "rep_counter",
          unlimited: true,
          total: -1,
        },
        {
          type: "mantra_display",
          text_key: "trigger_mantra_text",
          devanagari_key: "trigger_mantra_devanagari",
        },
        { type: "audio_player" },
        {
          type: "primary_button",
          label: "I feel calmer now",
          style: "gold",
          action: {
            type: "submit",
            payload: { type: "trigger_resolved_after_reset" },
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
          position: "footer_actions",
        },
        {
          type: "primary_button",
          label: "Try another way",
          style: "outline",
          action: {
            type: "try_another_way",
          },
          position: "footer_actions",
        },
        {
          type: "subtext",
          variant: "link",
          content: "Return to Mitra Home",
          action: {
            type: "submit",
            payload: { type: "trigger_session_abandoned" },
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
          position: "footer_actions",
        },
      ],
    },

    // ── Pause and Breathe for agitated/drained check-ins ──
    checkin_breath_reset: {
      variant: "mantra_runner",
      tone: {
        theme: "light_sandal",
        mood: "calming",
        backgroundImage: "/assets/mantra3.png",
      },
      blocks: [
        {
          type: "headline",
          content: "Pause and breathe.",
          position: "header",
          style: { fontSize: "16px", letterSpacing: "2px", opacity: "0.6" },
        },
        {
          type: "rep_counter",
          unlimited: true,
          total: -1,
        },
        {
          type: "mantra_display",
          text_key: "checkin_mantra_text",
          devanagari_key: "checkin_mantra_devanagari",
        },
        { type: "audio_player", audio_url: "/sounds/Om.mp4" },
        {
          type: "primary_button",
          label: "I feel calmer now",
          style: "gold",
          action: { type: "trigger_calmer_now" },
          position: "footer",
        },
        {
          type: "primary_button",
          label: "Try another way",
          style: "outline",
          action: { type: "try_another_way" },
          position: "footer",
        },
      ],
    },

    quick_mantra_reset: {
      tone: {
        theme: "light_sandal",
        mood: "steady",
        backgroundImage: "/assets/mantra3.png",
      },

      blocks: [
        {
          type: "rep_counter",
          total: 3,
        },
        {
          type: "mantra_display",
          text_key: "mantra_text",
        },
        { type: "audio_player" },
        {
          type: "subtext",
          variant: "link",
          content: "Try another way",
          action: {
            type: "navigate",
            target: {
              container_id: "awareness_trigger",
              state_id: "trigger_reflection",
            },
          },
          position: "footer",
        },
      ],

      on_complete: {
        type: "navigate",
        target: {
          container_id: "awareness_trigger",
          state_id: "trigger_reflection",
        },
      },
    },

    quick_mantra: {
      tone: {
        theme: "deep_focus",
        mood: "steady",
        backgroundImage: "/assets/mantra3.png",
      },

      blocks: [
        {
          type: "rep_counter",
          total: 9,
        },
        {
          type: "mantra_display",
          text_key: "mantra_text",
        },
        { type: "audio_player" },
      ],

      on_complete: {
        type: "navigate",
        target: {
          container_id: "awareness_trigger",
          state_id: "trigger_reflection",
        },
      },
    },

    // Check-in support mantra runner — dedicated screen for check-in flow
    // Separate from post_trigger_mantra to avoid cross-flow contamination (REG-015)
    checkin_support_mantra: {
      tone: {
        theme: "light_sandal",
        mood: "steady",
        backgroundImage: "/assets/mantra3.png",
      },
      blocks: [
        {
          type: "headline",
          content: "Recite with focus.",
          position: "header",
          style: { fontSize: "16px", letterSpacing: "2px", opacity: "0.6" },
        },
        {
          type: "rep_counter",
          total: 9,
        },
        {
          type: "mantra_display",
          text_key: "checkin_mantra_text",
          devanagari_key: "checkin_mantra_devanagari",
        },
        { type: "audio_player" },
        {
          type: "subtext",
          variant: "link",
          content: "Return to Mitra Home",
          position: "footer",
          action: {
            type: "navigate",
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
          style: { fontSize: "14px", marginTop: "10px" },
        },
      ],
      on_complete: {
        type: "navigate",
        target: {
          container_id: "companion_dashboard",
          state_id: "day_active",
        },
      },
    },

    // Trigger support mantra runner — for trigger flow only
    post_trigger_mantra: {
      variant: "mantra_runner",
      tone: {
        theme: "light_sandal",
        mood: "steady",
        backgroundImage: "/assets/mantra3.png",
      },
      blocks: [
        {
          type: "rep_counter",
          unlimited: true,
          total: -1,
        },
        {
          type: "mantra_display",
          text_key: "trigger_mantra_text",
          devanagari_key: "trigger_mantra_devanagari",
        },
        {
          type: "primary_button",
          label: "I feel calmer now",
          style: "gold",
          action: { type: "trigger_calmer_now" },
          position: "footer_actions",
        },
        {
          type: "primary_button",
          label: "{{_trigger_negative_label}}",
          style: "outline",
          action: { type: "trigger_still_feeling" },
          position: "footer_actions",
        },
      ],
    },
  },
};

export const EmbodimentChallengeRunnerContainer = {
  container_id: "embodiment_challenge_runner",

  states: {
    // 1️⃣ DAILY EMBODIMENT CHALLENGE CARD (28)
    challenge_view: {
      tone: { theme: "dark_base", mood: "grounded" },

      meta: {
        requires_active_cycle: true,
        single_daily_instance: true,
      },

      blocks: [
        {
          type: "micro_label",
          content: "DHARMA IN ACTION",
        },
        {
          type: "headline",
          content: "Today's Embodiment",
        },
        {
          type: "challenge_text",
          text_key: "challenge_text",
        },
        {
          type: "subtext",
          content: "Did this occur today?",
        },
        {
          type: "choice_card",
          id: "embodiment_outcome",
          selection_mode: "single",
          options: [
            { id: "completed", title: "Completed" },
            { id: "avoided", title: "Avoided" },
            { id: "not_tested", title: "Not Tested" },
          ],
        },
      ],

      on_select: {
        completed: {
          type: "navigate",
          target: {
            container_id: "embodiment_challenge_runner",
            state_id: "challenge_confirm",
          },
        },
        avoided: {
          type: "navigate",
          target: {
            container_id: "embodiment_challenge_runner",
            state_id: "challenge_confirm",
          },
        },
        not_tested: {
          type: "navigate",
          target: {
            container_id: "embodiment_challenge_runner",
            state_id: "challenge_confirm",
          },
        },
      },
    },

    // 2️⃣ EMBODIMENT OUTCOME CONFIRMATION (29)
    challenge_confirm: {
      tone: { theme: "dark_base", mood: "neutral" },

      blocks: [
        {
          type: "headline",
          content: "Outcome recorded.",
        },
        {
          type: "subtext",
          content: "Behavior logged for today.",
        },
        {
          type: "primary_button",
          label: "Return to Mitra Home",
          action: {
            type: "navigate",
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
        },
      ],
    },
  },
};

export const AwarenessTriggerContainer = {
  container_id: "awareness_trigger",

  states: {
    // 1️⃣ MID-DAY AWARENESS PROMPT
    midday_prompt: {
      tone: { theme: "dark_base", mood: "reflective" },

      blocks: [
        {
          type: "headline",
          content: "Pause and check in.",
          position: "header",
        },
        {
          type: "subtext",
          content: "What are you experiencing right now?",
          position: "content",
        },
        {
          type: "primary_button",
          label: "Check In",
          position: "footer",
          action: {
            type: "navigate",
            target: {
              container_id: "awareness_trigger",
              state_id: "response_matrix",
            },
          },
        },
      ],
    },

    // 2️⃣ AWARENESS RESPONSE MATRIX
    response_matrix: {
      tone: { theme: "dark_base", mood: "neutral" },

      blocks: [
        {
          type: "choice_card",
          selection_mode: "single",
          options: [
            { id: "irritation", title: "Irritation" },
            { id: "anxiety", title: "Anxiety" },
            { id: "urgency", title: "Urgency" },
            { id: "fatigue", title: "Fatigue" },
            { id: "avoidance", title: "Avoidance" },
          ],
        },
      ],

      on_select: {
        default: {
          type: "navigate",
          target: {
            container_id: "awareness_trigger",
            state_id: "breath_reset",
          },
        },
      },
    },

    // 3️⃣ PERSISTENT “I FEEL TRIGGERED” ENTRY
    trigger_entry: {
      tone: { theme: "dark_base", mood: "alert" },

      blocks: [
        {
          type: "headline",
          content: "You feel triggered.",
        },
        {
          type: "primary_button",
          label: "Begin Reset",
          action: {
            type: "navigate",
            target: {
              container_id: "awareness_trigger",
              state_id: "breath_reset",
            },
          },
        },
      ],
    },

    // 4️⃣ 3-BREATH RESET ANIMATION
    breath_reset: {
      tone: { theme: "light_sandal", mood: "calming" },

      blocks: [
        {
          type: "headline",
          content: "Pause and Breathe",
          position: "header",
          style: {
            fontSize: "28px",
            fontWeight: "300",
            letterSpacing: "1px",
            marginBottom: "5px",
          },
        },
        {
          type: "subtext",
          content: "Connect with your center through the breath.",
          variant: "centered",
          style: { opacity: "0.6", marginBottom: "8px", fontSize: "15px" },
          position: "header",
        },
        {
          type: "breath_animation",
          cycles: 3,
        },
        {
          type: "sankalp_display",
          text_key: "sankalp_text",
          variant: "static",
        },

        {
          type: "subtext",
          variant: "link",
          content: "Try another way",
          action: {
            type: "navigate",
            target: {
              container_id: "practice_runner",
              state_id: "quick_mantra_reset",
            },
          },
          position: "footer",
        },
      ],

      on_complete: {
        type: "navigate",
        target: {
          container_id: "awareness_trigger",
          state_id: "trigger_reflection",
        },
      },
    },

    sensory_grounding: {
      tone: { theme: "light_sandal", mood: "grounded" },

      blocks: [
        {
          type: "headline",
          content: "5-4-3-2-1 Grounding",
          position: "header",
          style: {
            fontSize: "32px",
            fontWeight: "300",
            letterSpacing: "0.5px",
            marginBottom: "8px",
          },
        },
        {
          type: "subtext",
          content: "Notice 5 things you can see.",
          position: "header",
          style: {
            opacity: "0.7",
            marginBottom: "36px",
            fontSize: "17px",
            fontWeight: "400",
          },
        },
        {
          type: "grounding_list",
          items: [
            { icon: "fa-solid fa-eye", text: "Notice 5 things you can see." },
            { icon: "fa-solid fa-hand", text: "4 things you can feel." },
            { icon: "fa-solid fa-ear-listen", text: "3 things you can hear." },
            { icon: "fa-solid fa-leaf", text: "2 things you can smell." },
            { icon: "fa-solid fa-utensils", text: "1 thing you can taste." },
          ],
        },
        {
          type: "primary_button",
          label: "I feel better now",
          style: "gold",
          position: "footer",
          action: {
            type: "navigate",
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
        },
        {
          type: "subtext",
          variant: "link",
          content: "Try OM Chanting",
          position: "footer",
          style: {
            marginTop: "10px",
            textDecoration: "underline",
            opacity: "0.8",
          },
          action: {
            type: "navigate",
            target: {
              container_id: "practice_runner",
              state_id: "free_mantra_chanting",
            },
          },
        },
      ],
      on_complete: {
        type: "navigate",
        target: {
          container_id: "awareness_trigger",
          state_id: "trigger_reflection",
        },
      },
    },

    // 5️⃣ QUICK MANTRA LOOP SCREEN

    trigger_reflection: {
      tone: { theme: "light_sandal", mood: "reflective" },

      blocks: [
        {
          type: "headline",
          content: "How are you feeling now?",
          position: "header",
        },
        {
          id: "trigger_feeling_selection",
          type: "chip_list",
          options: [
            { id: "balanced", label: "More settled" },
            { id: "agitated", label: "Still activated" },
            { id: "uncertain", label: "Not sure yet" },
          ],
          on_select: {
            type: "update_trigger_button",
          },
        },
        {
          type: "subtext",
          content: "OR SHARE YOUR OWN WORDS",
          variant: "micro_label",
        },
        {
          type: "textarea",
          id: "trigger_sentiment_input",
          placeholder: "I feel...",
          position: "content",
        },
        {
          id: "trigger_share_btn",
          type: "primary_button",
          label: "Share →",
          position: "footer",
          disabled_condition: "is_trigger_share_disabled",
          action: {
            type: "process_trigger_feedback",
          },
        },
        {
          type: "subtext",
          variant: "link",
          content: "Return to Mitra Home",
          position: "footer",
          action: {
            type: "navigate",
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
        },
      ],
    },

    trigger_advice_reveal: {
      tone: { theme: "light_sandal", mood: "steady" },

      blocks: [
        {
          type: "headline",
          content: "Take one steadier step.",
          position: "header",
        },
        {
          type: "subtext",
          content:
            "You do not need to push against the moment. Choose one support that feels most possible right now.",
          position: "header",
          style: { fontSize: "14px", opacity: "0.8", marginTop: "4px" },
        },
        // {
        //   type: "subtext",
        //   content: "{{trigger_advice_subtext_1}}",
        //   position: "header",
        //   style: { fontSize: "18px", fontWeight: "500" },
        // },
        {
          type: "diamond_divider",
          position: "content",
        },
        {
          type: "subtext",
          content: "{{trigger_advice_subtext_2}}",
          position: "content",
          style: { opacity: "0.8" },
        },
        {
          type: "subtext",
          content: "{{trigger_advice_subtext_3}}",
          position: "content",
          style: { opacity: "0.8", marginBottom: "32px" },
        },
        {
          type: "subtext",
          content: "Recommended for this moment:",
          variant: "micro_label",
          position: "content",
          style: { color: "#C9A84C", letterSpacing: "3px", fontWeight: "800" },
        },
        {
          type: "card_list",
          items_key: "suggested_trigger_mantras",
          position: "content",
        },

        {
          type: "primary_button",
          id: "start_trigger_mantra",
          label: "Start Practice →",
          position: "footer",
          style: "gold",
          visibility_condition: "show_start_trigger_mantra",
          action: {
            type: "execute_selected_trigger_card",
          },
        },
        {
          type: "subtext",
          variant: "link",
          content: "Return to Mitra Home",
          position: "footer",
          action: {
            type: "submit",
            payload: { type: "trigger_session_abandoned" },
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
        },
      ],
    },

    calm_down_advice: {
      overlay: true,
      tone: { theme: "light_sandal", mood: "steady" },

      blocks: [
        {
          type: "headline",
          content: "You are the observer.",
          position: "header",
        },
        {
          type: "subtext",
          content:
            "I have noticed your feelings. Remember, this emotion is like a cloud passing through your vast sky. Stay centered. You have the power to choose your response.",
          position: "content",
        },
        {
          type: "primary_button",
          label: "Return to Mitra Home",
          position: "footer",
          action: {
            type: "navigate",
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
        },
      ],
    },

    // 7️⃣ DHARMIC RESPONSE SELECTION
    dharmic_response: {
      tone: { theme: "dark_base", mood: "grounded" },

      blocks: [
        {
          type: "headline",
          content: "How will you respond?",
        },
        {
          type: "choice_card",
          selection_mode: "single",
          options_key: "dharmic_response_options",
        },
      ],

      on_select: {
        default: {
          type: "navigate",
          target: {
            container_id: "awareness_trigger",
            state_id: "post_trigger_reinforcement",
          },
        },
      },
    },

    // 8️⃣ POST-TRIGGER REINFORCEMENT MESSAGE
    post_trigger_reinforcement: {
      tone: { theme: "dark_base", mood: "steady" },

      blocks: [
        {
          type: "headline",
          content: "Return steady.",
        },
        {
          type: "subtext",
          content: "You interrupted reaction.",
        },
        {
          type: "primary_button",
          label: "Return to Mitra Home",
          action: {
            type: "navigate",
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
        },
      ],
    },

    // 9️⃣ TRIGGER PATTERN INSIGHT GRAPH
    trigger_pattern_graph: {
      tone: { theme: "dark_base", mood: "analytical" },

      blocks: [
        {
          type: "graph",
          graph_type: "trigger_pattern",
          data_key: "trigger_pattern_data",
        },
      ],
    },

    // 🔟 EMOTIONAL DRIFT SOFT WARNING
    drift_warning: {
      overlay: true,
      tone: { theme: "dark_overlay", mood: "gentle" },

      blocks: [
        {
          type: "headline",
          content: "Emotional drift detected.",
        },
        {
          type: "subtext",
          content: "Return to your anchor.",
        },
      ],
    },

    trigger_recheck: {
      tone: { theme: "light_sandal", mood: "reflective" },

      blocks: [
        {
          type: "headline",
          content: "How are you feeling now?",
          position: "header",
        },
        {
          type: "subtext",
          content: "Notice what has shifted, even slightly.",
          position: "header",
          style: { fontSize: "14px", opacity: "0.8", marginTop: "4px" },
        },
        {
          id: "trigger_recheck_selection",
          type: "chip_list",
          options: [
            { id: "balanced", label: "More settled" },
            { id: "agitated", label: "Still activated" },
          ],
          on_select: {
            type: "update_recheck_button",
          },
        },
        {
          id: "trigger_recheck_btn",
          type: "primary_button",
          label: "Share →",
          position: "footer",
          disabled_condition: "is_recheck_btn_disabled",
          action: {
            type: "process_trigger_recheck",
          },
        },
        {
          type: "subtext",
          variant: "link",
          content: "Return to Mitra Home",
          position: "footer",
          action: {
            type: "submit",
            payload: { type: "trigger_session_abandoned" },
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
        },
      ],
    },

    // 1️⃣1️⃣ NERVOUS SYSTEM STABILIZATION PROMPT
    nervous_stabilization: {
      tone: { theme: "deep_focus", mood: "calming" },

      blocks: [
        {
          type: "headline",
          content: "Stabilize your nervous system.",
        },
        {
          type: "primary_button",
          label: "Begin 3-Minute Anchor",
          action: {
            type: "navigate",
            target: {
              container_id: "practice_runner",
              state_id: "anchor_timer",
            },
          },
        },
      ],
    },
  },
};

export const InsightsProgressContainer = {
  container_id: "insights_progress",

  states: {
    // -------- RESISTANCE & EGO --------

    resistance_detected: {
      tone: { theme: "light_sandal", mood: "neutral" },
      blocks: [
        { type: "headline", content: "Resistance detected." },
        { type: "subtext", content: "Avoidance patterns observed." },
        {
          type: "primary_button",
          label: "Reflect",
          action: {
            type: "navigate",
            target: {
              container_id: "insights_progress",
              state_id: "resistance_reflection",
            },
          },
        },
      ],
    },

    resistance_reflection: {
      tone: { theme: "light_sandal", mood: "reflective" },
      blocks: [
        { type: "headline", content: "What are you avoiding?" },
        { type: "text_input", id: "resistance_input" },
        { type: "primary_button", label: "Submit" },
      ],
    },

    ego_inflation_check: {
      tone: { theme: "light_sandal", mood: "neutral" },
      blocks: [
        { type: "headline", content: "Ego inflation detected." },
        { type: "subtext", content: "Overconfidence reduces awareness." },
      ],
    },

    // -------- ADAPTIVE STATES --------

    plateau_notice: {
      tone: { theme: "light_sandal", mood: "neutral" },
      blocks: [
        { type: "headline", content: "Plateau detected." },
        { type: "subtext", content: "Consistency without depth." },
      ],
    },

    stability_pivot: {
      tone: { theme: "light_sandal", mood: "steady" },
      blocks: [{ type: "headline", content: "Stability Mode Activated." }],
    },

    escalation_suggestion: {
      tone: { theme: "light_sandal", mood: "growth" },
      blocks: [
        { type: "headline", content: "Increase intensity?" },
        {
          type: "primary_button",
          label: "Deepen",
          action: {
            type: "navigate",
            target: { container_id: "choice_stack", state_id: "deepen_select" },
          },
        },
      ],
    },

    inactivity_recovery: {
      tone: { theme: "light_sandal", mood: "neutral" },
      blocks: [
        { type: "headline", content: "Cycle inactive." },
        { type: "subtext", content: "Resume or reset." },
      ],
    },

    resume_restart_recalibrate: {
      tone: { theme: "light_sandal", mood: "steady" },
      blocks: [
        {
          type: "headline",
          content: "Welcome back.",
          position: "header",
        },
        {
          type: "subtext",
          content:
            "We can begin again from here. There is no catching up — only continuing.",
          variant: "multi_line",
          position: "header",
        },
        {
          type: "choice_card",
          id: "return_mode",
          selection_mode: "manual",
          options: [
            {
              id: "resume",
              title: "Resume Gently",
              description: "Continue from where your rhythm last held.",
            },
            {
              id: "soften",
              title: "Soften the Path",
              description: "Begin again with lighter intensity.",
            },
            {
              id: "reflect",
              title: "Reflect First",
              description: "Take a moment to notice what has changed.",
            },
            {
              id: "pause",
              title: "Pause for Now",
              description: "Rest here. KalpX will be ready when you are.",
            },
          ],
        },
        {
          type: "primary_button",
          label: "Continue →",
          validate: "return_mode",
          action: {
            type: "navigate",
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
          style: "gold",
          position: "footer",
        },
      ],
    },

    intentional_pause: {
      tone: { theme: "light_sandal", mood: "neutral" },
      blocks: [{ type: "headline", content: "Pause cycle intentionally?" }],
    },

    gentle_exit: {
      tone: { theme: "light_sandal", mood: "neutral" },
      blocks: [{ type: "headline", content: "Exit confirmed." }],
    },

    continue_confirmation: {
      tone: { theme: "light_sandal", mood: "steady" },
      blocks: [{ type: "headline", content: "Continue your path." }],
    },

    cross_cycle_integrity: {
      tone: { theme: "light_sandal", mood: "neutral" },
      blocks: [
        { type: "headline", content: "Integrity maintained across cycles." },
      ],
    },

    // -------- REFLECTION & HARVEST --------

    reflection_prompt_7day: {
      tone: { theme: "light_sandal", mood: "reflective" },
      blocks: [
        { type: "headline", content: "7-Day Reflection" },
        { type: "text_input", id: "reflection_input" },
      ],
    },

    voice_reflection_prompt: {
      tone: { theme: "light_sandal", mood: "reflective" },
      blocks: [
        { type: "headline", content: "Record your reflection." },
        { type: "voice_recorder" },
      ],
    },

    structured_written_reflection: {
      tone: { theme: "light_sandal", mood: "reflective" },
      blocks: [
        { type: "headline", content: "Structured Reflection" },
        { type: "form_fields", fields_key: "reflection_questions" },
      ],
    },

    insight_summary: {
      container_id: "insight_summary",
      tone: { theme: "light_sandal", mood: "analytical" },
      insight_config: {
        step0: {
          headline: "Understanding your path",
          chosen_label: "You've chosen",
          experience_label: "Within this, you're experiencing:",
          footer_note: "Understanding is the first step of transformation.",
          button_label: "Show My Path →",
        },
        step1: {
          button_label: "See Your Practice path →",
        },
        step2: {
          headline: "Your Personalized Practice is Ready",
          subtext:
            "KalpX has curated a 14-day journey to realign your mind, energy, and intention",
          footer_note: "Explore Sankalp · Mantra · Daily Practice",
          button_label: "Begin the KalpX Journey",
        },
      },
      blocks: [
        {
          type: "practice_card",
          purpose: "Practice",
          title: "{{card_ritual_title}}",
          description: "{{card_ritual_description}}",
          info_action: {
            type: "view_info",
            payload: { type: "practice", read_only: true },
          },
        },
        {
          type: "practice_card",
          purpose: "Sankalp",
          title: "{{card_sankalpa_title}}",
          description: "{{card_sankalpa_description}}",
          info_action: {
            type: "view_info",
            payload: { type: "sankalp", read_only: true },
          },
        },
        {
          type: "practice_card",
          purpose: "Mantra",
          title: "{{card_mantra_title}}",
          description: "{{card_mantra_description}}",
          info_action: {
            type: "view_info",
            payload: { type: "mantra", read_only: true },
          },
        },
      ],
    },

    identity_delta_visualization: {
      tone: { theme: "light_sandal", mood: "analytical" },
      blocks: [{ type: "graph", graph_type: "identity_delta" }],
    },

    legacy_timeline: {
      tone: { theme: "light_sandal", mood: "analytical" },
      blocks: [{ type: "timeline", data_key: "cycle_history" }],
    },
  },
};

export const CycleTransitionsContainer = {
  container_id: "cycle_transitions",

  states: {
    // Legacy Deepen flow states removed. Refined versions are located under 'deepen_sadhana' and 'rep_extension_setup'.

    // 3️⃣ EXTENSION ACTIVATION
    extension_activation: {
      tone: { theme: "light_sandal", mood: "steady" },

      blocks: [
        { type: "headline", content: "Extend this cycle?" },
        {
          type: "primary_button",
          label: "Extend 7 More Days",
          action: { type: "activate_extension" },
        },
      ],
    },

    // 4️⃣ SWITCH FOCUS WARNING
    switch_focus_warning: {
      tone: { theme: "light_sandal", mood: "caution" },

      blocks: [
        { type: "headline", content: "Switching focus resets momentum." },
        {
          type: "choice_card",
          selection_mode: "single",
          options: [
            { id: "continue_switch", title: "Switch Focus" },
            { id: "stay", title: "Stay on Current Path" },
          ],
        },
      ],
    },

    // 5️⃣ NEW FOCUS CONFIRMATION
    new_focus_confirmation: {
      tone: { theme: "light_sandal", mood: "steady" },

      blocks: [
        { type: "headline", content: "New focus activated." },
        {
          type: "primary_button",
          label: "Begin New Cycle",
          action: {
            type: "navigate",
            target: { container_id: "choice_stack", state_id: "mode_toggle" },
          },
        },
      ],
    },

    // 6️⃣ CROSS-CYCLE INTEGRITY MESSAGE
    cross_cycle_integrity: {
      tone: { theme: "light_sandal", mood: "neutral" },

      blocks: [
        {
          type: "headline",
          content: "Your previous cycle remains part of your identity.",
        },
      ],
    },

    // 7️⃣ CONTINUE SAME PATH
    continue_same_path: {
      tone: { theme: "light_sandal", mood: "steady" },

      blocks: [
        {
          type: "headline",
          content: "Continue this path.",
        },
        {
          type: "primary_button",
          label: "Proceed",
          action: {
            type: "navigate",
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
        },
      ],
    },

    // 8️⃣ COMPANION ANALYSIS (REVEAL)
    companion_analysis: {
      container_id: "insight_summary",
      overlay: true,
      tone: { theme: "light_sandal", mood: "steady" },
      insight_config: {
        step0: {
          headline: "Understanding your path",
          chosen_label: "You've chosen",
          experience_label: "Within this, you're experiencing:",
          footer_note: "Understanding is the first step of transformation.",
          button_label: "Show My Path →",
        },
        step1: {
          button_label: "See Your Practice path →",
        },
        step2: {
          headline: "Your Personalized Practice is Ready",
          subtext:
            "KalpX has curated a 14-day journey to realign your mind, energy, and intention",
          footer_note: "Explore Sankalp · Mantra · Daily Practice",
          button_label: "Begin the KalpX Journey",
        },
      },
      blocks: [
        { type: "lotus_logo", position: "header" },
        {
          type: "subtext",
          content: "AI COMPANION ANALYSIS",
          variant: "small",
          position: "header",
        },
        {
          type: "headline",
          content: "The KalpX Way",
          position: "header",
        },
        {
          id: "analysis_intro",
          type: "subtext",
          content:
            "Based on your current state, we've prepared a practice path to help you move forward.",
          position: "content",
        },
        {
          id: "analysis_metrics",
          type: "subtext",
          content: "",
          variant: "small",
          position: "content",
        },
        {
          id: "analysis_insight",
          type: "subtext",
          content: "",
          position: "content",
        },
        {
          id: "card_ritual",
          type: "practice_card",
          purpose: "Practice",
          title: "{{card_ritual_title}}",
          description: "{{card_ritual_description}}",
          meta: "{{practice_meta}}",
          position: "content",
          info_action: {
            type: "view_info",
            payload: { type: "practice", read_only: true },
          },
        },
        {
          id: "card_sankalpa",
          type: "practice_card",
          purpose: "Sankalp",
          title: "{{card_sankalpa_title}}",
          description: "{{card_sankalpa_description}}",
          position: "content",
          info_action: {
            type: "view_info",
            payload: { type: "sankalp", read_only: true },
          },
        },
        {
          id: "card_mantra",
          type: "practice_card",
          purpose: "Mantra",
          title: "{{card_mantra_title}}",
          description: "{{mantra_devanagari}}",
          position: "content",
          info_action: {
            type: "view_info",
            payload: { type: "mantra", read_only: true },
          },
        },
        {
          id: "ai_reasoning",
          type: "subtext",
          content: "",
          variant: "reasoning",
          position: "content",
          label: "Why this was chosen for you",
        },
        {
          type: "primary_button",
          label: "Begin the KalpX Journey →",
          action: {
            type: "navigate",

            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
          style: "gold",
          position: "footer",
        },
        {
          id: "depth_footer_text",
          type: "subtext",
          content:
            "Enter your dashboard to begin your daily practice and grow step by step.",
          variant: "small",
          position: "footer",
        },
        // {
        //   type: "subtext",
        //   content: "Repetition is the mother of transformation.",
        //   position: "footer",
        // },
      ],
    },

    // 9️⃣ HELP ME CHOOSE REVEAL
    help_me_choose_reveal: {
      overlay: true,
      tone: { theme: "light_sandal", mood: "steady" },
      tag: "AI ANALYSIS COMPLETE",
      blocks: [
        { type: "lotus_logo", position: "header" },
        { type: "headline", content: "Your Path Awaits.", position: "header" },
        {
          id: "help_me_choose_intro",
          type: "subtext",
          content: "",
          position: "content",
        },
        {
          id: "help_me_choose_analysis",
          type: "subtext",
          content: "",
          position: "content",
        },
        {
          id: "help_me_choose_button",
          type: "primary_button",
          label: "Begin Path →",
          action: {
            type: "fast_track_baseline",
            payload: { focus: "" }, // Will be filled dynamically by action executor or store
          },
          style: "gold",
          position: "footer",
        },
        {
          type: "subtext",
          content: "I will tailor your 14-day practices to this focus.",
          variant: "small",
          position: "footer",
        },
      ],
    },

    // 🔟 PATH EVOLUTION REVEAL
    path_evolution_reveal: {
      overlay: true,
      tone: { theme: "light_sandal", mood: "steady" },
      tag: "PATH EVOLUTION",
      blocks: [
        { type: "lotus_logo", position: "header" },
        {
          type: "headline",
          content: "The Journey Evolves.",
          position: "header",
        },
        {
          id: "path_evolution_text",
          type: "subtext",
          content: "",
          position: "content",
        },
        {
          type: "primary_button",
          label: "Continue to Baseline →",
          action: {
            type: "navigate",
            target: {
              container_id: "stable_scan",
              state_id: "prana_baseline",
            },
          },
          style: "gold",
          position: "footer",
        },
      ],
    },

    // 1️⃣1️⃣ INFO REVEAL (MODAL)
    info_reveal: {
      overlay: true,
      tone: { theme: "light_sandal", mood: "steady" },
      blocks: [
        {
          type: "headline",
          content: "{{info.title}}",
          position: "header",
        },
        {
          type: "subtext",
          content: "{{info.subtitle}}",
          variant: "italic",
          position: "header",
        },
        {
          type: "subtext",
          content: "{{info.devanagari}}",
          variant: "italic",
          position: "header",
          style: {
            fontFamily: "'Noto Sans Devanagari', serif",
            fontSize: "16px",
            color: "#615247",
            textAlign: "center",
            marginTop: "4px",
            maxHeight: "80px",
            overflowY: "auto",
            lineHeight: "1.5",
          },
        },
        {
          type: "subtext",
          content: "{{info.iast}}",
          variant: "small",
          position: "header",
          style: {
            fontSize: "12px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#615247",
            opacity: "0.6",
            textAlign: "center",
            marginTop: "4px",
            maxHeight: "60px",
            overflowY: "auto",
            lineHeight: "1.5",
          },
        },
        // {
        //   type: "subtext",
        //   content: "{{info.description}}",
        //   variant: "italic_multiline",
        //   position: "content",
        // },
        // {
        //   type: "subtext",
        //   content: "{{info.steps_text}}",
        //   variant: "italic_multiline",
        //   position: "content",
        // },
        {
          type: "subtext",
          content: "{{info.meta}}",
          variant: "small",
          position: "content",
        },

        {
          id: "info_locked_message",
          type: "subtext",
          content:
            "Your practice is complete for today. Come again tomorrow to continue your cycle.",
          variant: "italic_multiline",
          position: "footer",
          visibility_condition: "info_is_locked",
          style: {
            color: "#D4B16A",
            marginBottom: "16px",
            textAlign: "center",
          },
        },
        {
          id: "info_start",
          type: "primary_button",
          label: "{{info_start_label}}",
          action: { type: "info_start_click" },
          style: "gold",
          position: "footer",
          visibility_condition: "show_info_start",
        },
        {
          type: "subtext",
          variant: "link",
          content: "{{info_back_label}}",
          action: { type: "info_back" },
          style: "outline",
          position: "page_bottom",
        },
        {
          type: "subtext",
          content: "Chant slowly and let the meaning settle within.",
          variant: "small",
          position: "footer",
          visibility_condition: "info_is_mantra",
          style: { color: "#000000", fontStyle: "italic", marginTop: "16px" },
        },
        // {
        //   type: "subtext",
        //   content:
        //     "Carry this intention gently into your thoughts and actions.",
        //   variant: "small",
        //   position: "footer",
        //   visibility_condition: "info_is_sankalp",
        //   style: { color: "#000000", fontStyle: "italic", marginTop: "16px" },
        // },
        {
          type: "subtext",
          content: "{{info_start_help_text}}",
          variant: "small",
          position: "footer",
          visibility_condition: "info_is_practice",
          style: { color: "#000000", fontStyle: "italic", marginTop: "16px" },
        },
      ],
    },

    // 1️⃣2️⃣ OFFERING REVEAL (for rituals)
    offering_reveal: {
      overlay: true,
      tone: { theme: "light_sandal", mood: "steady" },
      blocks: [
        {
          type: "headline",
          content: "{{info.title}}",
          position: "header",
        },
        {
          type: "subtext",
          content: "{{info.subtitle}}",
          variant: "italic",
          position: "header",
        },
        {
          type: "subtext",
          content: "{{info.description}}",
          variant: "italic_multiline",
          position: "content",
        },
        // {
        //   type: "subtext",
        //   content:
        //     "Accept this moment as prasadam. By offering your actions, you find peace in the results.",
        //   variant: "italic_multiline",
        //   position: "content",
        // },
        {
          id: "info_locked_message",
          type: "subtext",
          content:
            "Your practice is complete for today. Come again tomorrow to continue your cycle.",
          variant: "italic_multiline",
          position: "footer",
          visibility_condition: "info_is_locked",
          style: {
            color: "#D4B16A",
            marginBottom: "16px",
            textAlign: "center",
          },
        },
        {
          id: "info_start",
          type: "primary_button",
          label: "{{info_start_label}}",
          action: { type: "info_start_click" },
          style: "gold",
          position: "footer",
          visibility_condition: "show_info_start",
        },

        {
          type: "subtext",
          content: "Chant slowly and let the meaning settle within.",
          variant: "small",
          position: "footer",
          visibility_condition: "info_is_mantra",
          style: { color: "#000000", marginTop: "16px", fontStyle: "italic" },
        },
        // {
        //   type: "subtext",
        //   content:
        //     "Carry this intention gently into your thoughts and actions.",
        //   variant: "small",
        //   position: "footer",
        //   visibility_condition: "info_is_sankalp",
        //   style: { color: "#000000", fontStyle: "italic", marginTop: "16px" },
        // },
        {
          type: "subtext",
          content: "{{info_start_help_text}}",
          variant: "small",
          position: "footer",
          visibility_condition: "info_is_practice",
          style: { color: "#000000", fontStyle: "italic", marginTop: "16px" },
        },
        {
          type: "subtext",
          variant: "link",
          content: "{{info_back_label}}",
          action: { type: "info_back" },
          style: "outline",
          position: "page_bottom",
        },
      ],
    },

    quick_checkin: {
      overlay: true,
      tone: { theme: "light_sandal", mood: "steady" },
      blocks: [
        {
          type: "headline",
          content: "How is your energy right now?",
          position: "header",
        },
        {
          type: "choice_grid",
          id: "current_prana",
          auto_advance: false,
          disable_auto_select: true,
          options: [
            {
              id: "energized",
              title: "Energized",
              icon: "/assets/quick_1.svg",
              color: "#EAB308",
            },
            {
              id: "balanced",
              title: "Balanced",
              icon: "/assets/quick_2.svg",
              color: "#10B981",
            },
            {
              id: "agitated",
              title: "Agitated",
              icon: "/assets/quick_4.svg",
              color: "#8B5CF6",
            },
            {
              id: "drained",
              title: "Drained",
              icon: "/assets/quick_3.svg",
              color: "#64748B",
            },
          ],
        },
        {
          type: "subtext",
          content:
            "Share how you’re feeling right now.KalpX will guide you with a practice that fits your current energy",
          variant: "small_centered",
          position: "footer",
        },
        {
          type: "primary_button",
          label: "Proceed →",
          validate: "current_prana",
          validation_message: "Please share how you are feeling to proceed.",
          action: {
            type: "submit",
            payload: { prana_type: "{{current_prana}}" },
            target: {
              container_id: "cycle_transitions",
              state_id: "quick_checkin_ack",
            },
          },
          style: "gold",
          position: "footer",
        },
        {
          type: "subtext",
          variant: "link",
          content: "Return to Mitra Home",
          position: "footer",
          action: {
            type: "navigate",
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
        },
      ],
    },
    quick_checkin_ack: {
      overlay: true,
      tone: { theme: "light_sandal", mood: "steady" },
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh",
        padding: "60px 24px 40px",
        textAlign: "center",
      },
      blocks: [
        {
          type: "image",
          url: "/assets/mantra-lotus-3d.svg",
          alt: "lotus",
          position: "header",
          style: {
            width: "120px",
            maxWidth: "120px",
            margin: "0 auto 32px",
            border: "none",
            boxShadow: "none",
            borderRadius: "0",
            overflow: "visible",
          },
        },
        {
          type: "headline",
          content: "{{checkin_ack_headline}}",
          position: "header",
          style: {
            fontSize: "28px",
            fontWeight: "400",
            letterSpacing: "0.3px",
            lineHeight: "1.3",
            maxWidth: "320px",
            margin: "0 auto",
          },
        },
        {
          type: "subtext",
          content: "{{checkin_ack_body}}",
          variant: "italic_multiline",
          position: "content",
          style: {
            maxWidth: "300px",
            margin: "20px auto 0",
            lineHeight: "1.8",
            fontSize: "16px",
            opacity: "0.8",
            whiteSpace: "pre-line",
          },
        },
        {
          type: "subtext",
          content: "{{checkin_ack_accent}}",
          position: "content",
          visibility_condition: "checkin_ack_accent",
          style: {
            color: "#D4A01B",
            fontSize: "15px",
            fontStyle: "italic",
            margin: "24px auto 0",
            maxWidth: "300px",
            lineHeight: "1.6",
          },
        },
        {
          type: "subtext",
          content: "Recommended for your current state:",
          variant: "micro_label",
          position: "content",
          visibility_condition: "prana_ack_suggestions",
          style: { marginTop: "24px" },
        },
        {
          type: "subtext",
          content: "Tap a card to begin your recommended practice",
          variant: "italic_multiline",
          visibility_condition: "prana_ack_suggestions",
        },
        {
          type: "card_list",
          items_key: "prana_ack_suggestions",
          variant: "minimal",
          position: "content",
          visibility_condition: "prana_ack_suggestions",
        },
        {
          type: "primary_button",
          label: "Return to your path →",
          style: "gold",
          position: "footer",
          action: {
            type: "navigate",
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
        },
      ],
    },

    // 1️⃣3️⃣ PROGRESS SUMMARY

    progress_summary: {
      tone: { theme: "light_sandal", mood: "steady" },
      tag: "PROGRESS SUMMARY",
      blocks: [
        {
          type: "headline",
          content: "Consistency in awareness.",
          position: "header",
        },
        {
          type: "subtext",
          content:
            "You have performed <strong>{{prana_checkin_total}}</strong> check-ins this cycle.",
          position: "header",
        },
        {
          type: "trend_chart",
          title: "Prana State Distribution",
          data_key: "milestone_trend_data",
          footer: "Your energy is stabilizing as you maintain your practice.",
        },
        {
          type: "primary_button",
          label: "Continue Journey →",
          action: {
            type: "navigate",
            target: {
              container_id: "cycle_transitions",
              state_id: "{{next_insight_screen}}",
            },
          },
          style: "gold",
          position: "footer",
        },
        {
          type: "primary_button",
          label: "Explore a new focus",
          style: "outline",
          action: {
            type: "navigate",
            target: {
              container_id: "cycle_transitions",
              state_id: "re_analysis_input",
            },
          },
          position: "footer",
        },
      ],
    },

    daily_insight: {
      tone: { theme: "light_sandal", mood: "steady" },
      tag: "{{milestone_tag}}",
      blocks: [
        {
          type: "headline",
          content: "{{milestone_headline}}",
          position: "header",
        },
        {
          type: "feedback_recap",
          data_key: "milestone_recap",
        },
        {
          type: "subtext",
          content: "{{milestone_insight}}",
          position: "header",
        },
        {
          type: "activity_stats",
          data_key: "milestone_activity_stats",
        },

        {
          type: "trend_chart",
          title: "{{milestone_trend_label}} Trend",
          footer: "{{milestone_pattern_insight}}",
          data_key: "milestone_trend_data",
        },

        {
          type: "headline",
          content: "{{milestone_suggestions_intro.title}}",
          position: "section",
          size: "small",
        },
        {
          type: "subtext",
          content: "{{milestone_suggestions_intro.description}}",
          variant: "muted",
        },
        {
          type: "insight_box",
          data_key: "milestone_insight_items",
        },
        {
          type: "subtext",
          id: "milestone_motivation",
          variant: "bubble",
        },

        {
          type: "primary_button",
          label: "{{milestone_button_a_label}}",
          subtext: "{{milestone_button_a_subtext}}",
          style: "gold",
          action: {
            type: "navigate",
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
        },
        {
          type: "primary_button",
          label: "{{milestone_button_b_label}}",
          subtext: "{{milestone_button_b_subtext}}",
          style: "outline",
          action: {
            type: "navigate",
            target: {
              container_id: "cycle_transitions",
              state_id: "{{milestone_button_b_target}}",
            },
          },
        },

        {
          type: "subtext",
          content: "You are training the mind — not chasing outcomes.",
          variant: "small_centered",
        },
      ],
    },

    checkpoint_results: {
      tone: { theme: "light_sandal", mood: "steady" },
      blocks: [{ type: "cycle_reflection_results" }],
    },

    daily_insight_14: {
      tone: { theme: "dark_gold", mood: "mastery" },
      tag: "{{milestone_tag}}",
      blocks: [
        {
          type: "headline",
          content: "{{milestone_headline}}",
          position: "header",
        },
        {
          type: "subtext",
          content: "{{milestone_insight}}",
          position: "header",
          variant: "insight",
        },
        {
          type: "activity_stats",
          data_key: "milestone_activity_stats",
        },
        {
          type: "trend_chart",
          title: "14-Day Practice Journey",
          footer: "{{milestone_pattern_insight}}",
          data_key: "milestone_trend_data",
        },
        {
          type: "headline",
          content: "{{milestone_suggestions_intro.title}}",
          position: "section",
          size: "small",
        },
        {
          type: "subtext",
          content: "{{milestone_suggestions_intro.description}}",
          variant: "muted",
        },
        {
          type: "insight_box",
          data_key: "milestone_insight_items",
        },
        {
          type: "subtext",
          id: "milestone_motivation",
          variant: "bubble",
        },
        {
          type: "subtext",
          content: "You are training the mind — not chasing outcomes.",
          variant: "small_centered",
        },
      ],
    },

    // 🔄 MANTRA ALTERATION SCREEN (For "Alter My Practices" flow)
    mantra_alteration: {
      tone: { theme: "light_sandal", mood: "steady" },
      tag: "REFINE YOUR PATH",
      blocks: [
        {
          type: "headline",
          content: "Refine Your Practice",
          position: "header",
        },
        {
          type: "subtext",
          content:
            "Choose a new mantra to bring fresh energy to your daily rhythm. These are selected to help you build unshakeable consistency.",
          position: "header",
          variant: "muted",
        },
        {
          type: "mantra_selection_list",
          id: "alter_mantra_selection",
        },
      ],
    },

    // After completing 14-day cycle (non-strong users): choose 7-day or 14-day next cycle
    cycle_length_choice: {
      tone: { theme: "dark_gold", mood: "mastery" },
      tag: "YOUR NEXT COMMITMENT",
      blocks: [
        {
          type: "headline",
          content: "What's your next move? 🗓️",
          position: "header",
        },
        {
          type: "subtext",
          content:
            "You've earned the right to choose. Your practices stay the same — we just reset the energy and the commitment. How long do you want to go for?",
          position: "header",
          variant: "muted",
        },
        { type: "spacer", size: "small" },
        {
          type: "micro_label",
          content: "CHOOSE YOUR COMMITMENT",
          style: {
            opacity: 0.6,
            fontSize: "11px",
            letterSpacing: "1px",
            marginBottom: "8px",
          },
        },
        {
          type: "choice_card",
          id: "cycle_choice",
          selection_mode: "auto",
          options: [
            {
              id: "sprint_7",
              icon: "fas fa-calendar-week",
              title: "7-Day Sprint 🏃",
              description:
                "A focused week with your same practices. Perfect for getting your rhythm back and feeling that first clean shift.",
              action: {
                type: "submit",
                payload: {
                  type: "checkpoint_submit",
                  reset_confirmed: true,
                  direction: "stay",
                  cycle_length: 7,
                },
              },
            },
            {
              id: "mastery_14",
              icon: "fas fa-calendar-days",
              title: "14-Day Mastery Cycle 🔥",
              description:
                "For when you're ready to go all in. Same practices, deeper commitment, bigger transformation.",
              action: {
                type: "submit",
                payload: {
                  type: "checkpoint_submit",
                  reset_confirmed: true,
                  direction: "stay",
                  cycle_length: 14,
                },
              },
            },
          ],
        },
        { type: "spacer", size: "small" },
        {
          type: "micro_label",
          content: "OR REFINE YOUR PATH",
          style: {
            opacity: 0.6,
            fontSize: "11px",
            letterSpacing: "1px",
            marginBottom: "8px",
          },
        },
        {
          type: "primary_button",
          label: "Alter My Practices",
          subtext: "Keep the same focus, get new practices and mantra",
          style: "gold",
          visibility_condition: "can_alter_practices",
          action: {
            type: "alter_practices",
          },
        },
        {
          type: "primary_button",
          label: "I want a fresh start with a new focus",
          subtext: "Switch to a completely different area of growth",
          style: "outline",
          action: {
            type: "submit",
            payload: {
              type: "checkpoint_submit",
              reset_confirmed: true,
              direction: "change",
            },
          },
        },
        {
          type: "subtext",
          content:
            "Your mantra and practices will continue to evolve with you.",
          variant: "small_centered",
        },
      ],
    },

    // After strong improvement on Day 14: change focus (they've mastered this path)
    cycle_change_focus: {
      tone: { theme: "dark_gold", mood: "mastery" },
      tag: "MASTERY COMPLETE",
      blocks: [
        {
          type: "headline",
          content: "You actually did it. 🏆",
          position: "header",
        },
        {
          type: "subtext",
          content:
            "14 days, full consistency, and a strong transformation — that's not a small thing. This shift is now yours. Carry it forward. What comes next is up to you.",
          position: "header",
          variant: "insight",
        },
        {
          type: "primary_button",
          label: "Take me to a new focus →",
          subtext: "You've mastered this one. Time to grow somewhere new.",
          style: "gold",
          action: {
            type: "submit",
            payload: {
              type: "checkpoint_submit",
              reset_confirmed: true,
              direction: "change",
            },
          },
        },
        {
          type: "primary_button",
          label: "Deepen This Focus Further",
          subtext: "Stay on this path and go deeper",
          style: "outline",
          action: {
            type: "navigate",
            target: {
              container_id: "cycle_transitions",
              state_id: "cycle_length_choice",
            },
          },
        },
        {
          type: "subtext",
          content: "You've earned both paths. Trust your instinct.",
          variant: "small_centered",
        },
      ],
    },

    daily_reflection: {
      tone: { theme: "light_sandal", mood: "steady" },
      blocks: [
        { type: "headline", content: "Reflect on Day {{day_number}}" },
        { type: "textarea", placeholder: "What did you learn today?" },
        {
          type: "primary_button",
          label: "Complete Day →",
          action: { type: "seal_day" },
          position: "footer",
        },
      ],
    },

    // 1️⃣3️⃣ CYCLE COMPLETION (Day 7/14)
    cycle_complete_overview: {
      tone: { theme: "light_sandal", mood: "growth" },
      tag: "CYCLE COMPLETE",
      blocks: [
        {
          type: "headline",
          content: "You have completed 7 days.",
          position: "header",
        },
        {
          type: "subtext",
          content: "Consistency builds character. Choice builds mastery.",
          position: "header",
        },

        {
          type: "insight_box",
          variant: "highlight",
          items: [
            {
              text: "You began this cycle feeling anxious. Now your clarity is steadier.",
            },
          ],
        },

        {
          type: "choice_card",
          variant: "grid",
          selection_mode: "single_auto_advance",
          options: [
            {
              id: "continue",
              title: "Continue This Path",
              description:
                "Strengthen your Sankalp. Go deeper into the same practice.",
              meta: "Depth creates transformation.",
              icon: "fas fa-fire",
              button_label: "Extend for 7 More Days →",
              button_style: "gold",
            },
            {
              id: "deepen",
              title: "Deepen Your Practice",
              description:
                "Add one advanced element to refine your discipline.",
              meta: "• Add Breath Regulation\n• Add Leadership Dharma Reflection\n• Add Advanced Karma Sadhana",
              icon: "fas fa-leaf",
              button_label: "Refine My Sadhana →",
              button_style: "outline",
            },
          ],
        },

        {
          type: "subtext",
          content: "Change Focus Area",
          variant: "link",
          action: {
            type: "navigate",
            target: {
              container_id: "cycle_transitions",
              state_id: "re_analysis_input",
            },
          },
        },

        {
          type: "subtext",
          content: "Repetition builds steadiness.\nExpansion builds mastery.",
          variant: "small_centered",
        },
      ],
      on_select: {
        continue: {
          type: "submit",
          target: {
            container_id: "companion_dashboard",
            state_id: "day_active",
          },
        },
        deepen: {
          type: "navigate",
          target: {
            container_id: "cycle_transitions",
            state_id: "deepen_sadhana",
          },
        },
      },
    },

    deepen_sadhana: {
      tone: { theme: "light_sandal", mood: "steady" },
      tag: "DEEPEN YOUR SADHANA",
      blocks: [
        {
          type: "headline",
          content:
            "Refine your mantra as needed.Let your discipline deepen with each step.",

          position: "header",
        },
        {
          type: "insight_box",
          items: [
            {
              text: "<strong>Your Core:</strong>",
              subtext:
                "• Mantra: {{card_mantra_title}}\n• Sankalp: {{sankalp_text}}\n• Anchor: Focused Practice",
            },
          ],
          footer: "The roots remain. Only depth increases.",
        },
        {
          type: "headline",
          variant: "small_centered",
          content: "Choose Your Refinement Layer",
        },
        {
          type: "choice_card",
          id: "refinement_layer",
          variant: "grid_3",
          selection_mode: "single",
          options: [
            {
              id: "level_up",
              title: "Ascend in Level",
              description:
                "Move from your current level to the next stage of sacred sound mastery.",
              meta: "• Next Level Mantra\n• Stronger Resonance",
              icon: "fas fa-arrow-up",
              style: { backgroundColor: "rgba(201, 168, 76, 0.05)" },
            },
            {
              id: "rep_double",
              title: "Deepen via Repetition",
              description:
                "Maintain your current mantra but double the intensity and daily count.",
              meta: "• 27 → 54 reps\n• Extended Focus",
              icon: "fas fa-infinity",
              style: { backgroundColor: "rgba(201, 168, 76, 0.05)" },
            },
            {
              id: "change_chant",
              title: "Explore New Variation",
              description:
                "Choose a different mantra within your current level for a fresh starting point.",
              meta: "• Same Level\n• Different Vibration",
              icon: "fas fa-sync",
              style: { backgroundColor: "rgba(201, 168, 76, 0.05)" },
            },
          ],
        },

        {
          type: "subtext",
          content: "You are not changing your path. You are strengthening it.",
          variant: "small_centered",
        },
        {
          type: "primary_button",
          label: "Confirm Refinement →",
          validate: "refinement_layer",
          validation_message:
            "Please select how you would like to refine your practice.",
          action: { type: "submit" },
          position: "footer",
        },
      ],
    },
    rep_extension_setup: {
      tone: { theme: "light_sandal", mood: "steady" },
      tag: "EXPAND YOUR PRACTICE",
      blocks: [
        {
          type: "headline",
          content: "Set Your Daily Target 🎯",
          position: "header",
        },
        {
          type: "subtext",
          content:
            "How many times would you like to chant your current mantra each day? Choose a target that feels challenging yet sustainable.",
          position: "header",
        },
        {
          type: "choice_card",
          id: "target_rep_selection",
          variant: "list",
          selection_mode: "single",
          options: [
            {
              id: "reps_27",
              title: "27 Repetitions",
              description:
                "Maintain a steady, focused rhythm. Excellent for daily grounding.",
              meta: "1/4 Mala",
              icon: "fas fa-seedling",
            },
            {
              id: "reps_54",
              title: "54 Repetitions",
              description:
                "Deepen your concentration. Ideal for those seeking moderate intensity.",
              meta: "1/2 Mala",
              icon: "fas fa-tree",
            },
            {
              id: "reps_108",
              title: "108 Repetitions",
              description:
                "Full immersion. The gold standard for transformative sacred sound.",
              meta: "Full Mala",
              icon: "fas fa-mountain",
            },
          ],
        },
        {
          type: "primary_button",
          label: "Confirm Extension →",
          validate: "target_rep_selection",
          validation_message: "Please choose your daily repetition target.",
          action: { type: "submit" },
          position: "footer",
        },
      ],
    },

    deepen_confirmation: {
      tone: { theme: "light_sandal", mood: "steady" },
      blocks: [
        { type: "spacer", size: 80 },
        {
          type: "subtext",
          variant: "bubble",
          content:
            "You are choosing steadiness over novelty.\nThat is how depth is formed.",
        },
        {
          type: "subtext",
          variant: "bubble",
          content:
            "The practice remains the same.\nYour attention must become subtler.",
        },
        { type: "spacer", size: 60 },
        {
          type: "primary_button",
          label: "Begin Day 1 of Extension →",
          action: {
            type: "navigate",
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
          style: "gold",
          position: "footer",
        },
      ],
    },

    re_analysis_input: {
      tone: { theme: "light_sandal", mood: "reflective" },
      blocks: [
        {
          type: "headline",
          content: "How are you feeling right now?",
          position: "header",
        },
        {
          type: "subtext",
          content: "Where did you get stuck in the last cycle?",
          position: "header",
        },
        {
          id: "re_analysis_friction",
          type: "textarea",
          placeholder:
            "Describe your current mental state and any obstacles...",
        },
        {
          type: "primary_button",
          label: "Next →",
          action: {
            type: "navigate",
            target: {
              container_id: "cycle_transitions",
              state_id: "re_analysis_category",
            },
          },
          position: "footer",
        },
      ],
    },

    re_analysis_category: {
      overlay: true,
      tone: { theme: "light_sandal", mood: "steady" },
      tag: "AI INTERVENTION",
      blocks: [
        {
          type: "headline",
          content: "Choose your path direction.",
          position: "header",
        },
        {
          type: "subtext",
          content:
            "Do you want to shift your focus area or deepen the current one?",
          position: "header",
        },
        {
          id: "re_analysis_direction",
          type: "choice_card",
          selection_mode: "single",
          options: [
            {
              id: "stay",
              title: "Stay with {{focus_name}}",
              description:
                "Address the specific friction within your current goal.",
              icon: "fas fa-sync",
            },
            {
              id: "change",
              title: "Change Focus Area",
              description:
                "Shift to a completely different domain of your life.",
              icon: "fas fa-compass",
              selected: true,
            },
          ],
        },
        {
          type: "primary_button",
          label: "Next →",
          action: {
            type: "submit",
            payload: { step: "re_analysis_proceed" },
          },
          style: "gold",
          position: "footer",
        },
      ],
    },

    re_analysis_focus_select: {
      tone: { theme: "light_sandal", mood: "steady" },
      blocks: [
        {
          type: "headline",
          content: "In which area do you want to target?",
          position: "header",
        },
        {
          type: "subtext",
          content: "Which area are you feeling like that now?",
          position: "header",
        },
        {
          type: "choice_card",
          id: "scan_focus",
          selection_mode: "manual",
          options: [
            {
              id: "career",
              title: "Career",
              description: "Build clarity, confidence, and steady progress.",
            },
            {
              id: "relationship",
              title: "Relationship",
              description: "Improve understanding and emotional connection.",
            },
            {
              id: "health",
              title: "Health",
              description: "Feel more balanced, active, and energized.",
            },
            {
              id: "wealth",
              title: "Wealth",
              description: "Create stability and mindful financial habits.",
            },
          ],
        },
        {
          type: "primary_button",
          label: "Continue →",
          validate: "scan_focus",
          validation_message: "Please select an area to continue.",
          action: {
            type: "navigate",
            target: { container_id: "stable_scan", state_id: "prana_baseline" },
          },
          style: "gold",
          position: "footer",
        },
      ],
    },

    // 1️⃣1️⃣ RESET WITH AWARENESS
    reset_with_awareness: {
      tone: { theme: "light_sandal", mood: "neutral" },

      blocks: [
        { type: "headline", content: "Reset with awareness." },
        {
          type: "primary_button",
          label: "Return to Portal",
          action: {
            type: "navigate",
            target: { container_id: "portal", state_id: "portal" },
          },
        },
      ],
    },
    low_burden_day: {
      tone: { theme: "light_sandal", mood: "steady" },
      blocks: [
        {
          type: "headline",
          content: "What is still sincere and possible for today?",
          position: "header",
        },
        {
          type: "subtext",
          content: "Even one anchor today preserves your rhythm.",
          variant: "multi_line",
          position: "header",
        },
        {
          type: "choice_card",
          id: "low_burden_choice",
          selection_mode: "manual",
          options: [
            {
              id: "vow_carry",
              title: "Carry the Vow Only",
              description: "Hold your sankalp through the day.",
            },
            {
              id: "one_mantra",
              title: "One Mantra Anchor",
              description: "A short chant to stay connected.",
            },
            {
              id: "one_act",
              title: "One Gentle Act",
              description: "A small practice that fits your day.",
            },
          ],
        },
        {
          type: "subtext",
          content: "Sincere beginning matters more than doing it all.",
          variant: "small_centered",
          position: "footer",
        },
        {
          type: "primary_button",
          label: "Continue Gently →",
          validate: "low_burden_choice",
          action: {
            type: "navigate",
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
          style: "gold",
          position: "footer",
        },
        {
          type: "subtext",
          content: "Return to full path",
          variant: "link",
          action: { type: "back" },
          position: "footer",
          style: { fontSize: "14px", marginTop: "8px" },
        },
      ],
    },

    weekly_checkpoint: {
      tone: { theme: "light_sandal", mood: "reflective" },
      blocks: [
        // {
        //   type: "headline",
        //   content: "What feels different after these days?",
        //   style: { fontSize: "24px", fontWeight: "400", color: "#432104" },
        //   position: "header",
        // },
        // {
        //   type: "subtext",
        //   content: "This is not a test. Just notice what is shifting.",
        //   variant: "multi_line",
        //   style: { fontSize: "16px", color: "#615247" },
        //   position: "header",
        // },
        {
          type: "cycle_reflection",
          data_key: "checkpoint_metrics",
          description_options: [
            { id: "strong", label: "I feel more steady" },
            { id: "slight", label: "I feel some shift" },
            { id: "same", label: "I am still finding my way" },
            { id: "worse", label: "I still feel heaviness" },
          ],
        },
      ],
    },
    low_engagement_reset: {
      tone: { theme: "light_sandal", mood: "calm" },
      blocks: [
        {
          type: "lotus_header",
          icon: "{{reset_guide_icon}}",
          style: { width: "160px", margin: "0 auto 16px", display: "block" },
        },
        {
          type: "headline",
          content: "{{reset_guide_headline}}",
          style: {
            fontSize: "24px",
            textAlign: "center",

            color: "#542a18",
          },
        },
        {
          type: "subtext",
          content: "{{reset_guide_subtext}}",
          style: {
            textAlign: "center",
            marginTop: "16px",
            marginBottom: "16px",
            fontSize: "16px",
            whiteSpace: "pre-line",

            color: "#542a18",
          },
        },
        {
          type: "diamond_divider",
        },
        {
          type: "headline",
          content: "{{reset_guide_midtext}}",
          style: {
            fontSize: "18px",
            textAlign: "center",

            marginBottom: "16px",
            color: "#4d280e",
          },
          visibility_condition: "reset_guide_midtext",
        },
        {
          type: "card_list",
          card_type: "guide",
          items_key: "reset_guide_cards",
        },
        {
          type: "subtext",
          content: "{{reset_guide_bottomtext}}",
          style: {
            textAlign: "center",

            fontSize: "15px",
            fontWeight: "600",
            color: "#432104",
          },
        },
        {
          type: "subtext",
          content: "{{reset_guide_button}}",
          variant: "link",
          action: {
            type: "navigate",
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
          style: {
            textAlign: "center",
            marginTop: "24px",
            marginBottom: "32px",
            fontWeight: "700",
            fontSize: "18px",
            color: "#432104",
          },
        },
      ],
    },

    cycle_reflection: {
      tone: { theme: "light_sandal", mood: "steady" },
      blocks: [
        { type: "spacer", size: 40 },
        {
          type: "headline",
          content: "Let's reflect and recalibrate.",
        },
        {
          type: "headline",
          content: "{{reflection_milestone_headline}}",
          style: { fontSize: "20px", marginTop: "4px" },
        },
        {
          type: "subtext",
          content:
            "Not all change is immediate. Some shifts are subtle. Let's take a closer look at how you're engaging with the practice.",
          style: { marginBottom: "32px" },
        },
        {
          type: "headline",
          content: "Why did specific blocks occur?",
          style: { fontSize: "16px", marginTop: "20px", fontWeight: "600" },
        },
        {
          type: "textarea",
          id: "reflection_why_blocks",
          placeholder: "Reflect on external triggers or internal resistance...",
        },
        {
          type: "headline",
          content: "How did you find your rhythm?",
          style: { fontSize: "16px", marginTop: "20px", fontWeight: "600" },
        },
        {
          type: "textarea",
          id: "reflection_how_rhythm",
          placeholder: "Identify the moments where practice felt natural...",
        },
        {
          type: "headline",
          content: "What could you shift moving forward?",
          style: { fontSize: "16px", marginTop: "20px", fontWeight: "600" },
        },
        {
          type: "textarea",
          id: "reflection_shift",
          placeholder:
            "Think about adjustments to your timing or environment...",
        },
        {
          type: "subtext",
          content: "Reflecting now can help refine your practice.",
          variant: "small_centered",
          style: { marginTop: "32px" },
        },
        {
          type: "primary_button",
          label: "Continue Reflection →",
          style: "gold",
          action: {
            type: "navigate",
            target: {
              container_id: "cycle_transitions",
              state_id: "reset_path_selection",
            },
          },
        },
      ],
    },

    reset_path_selection: {
      tone: { theme: "light_sandal", mood: "steady" },
      blocks: [
        { type: "lotus_logo" },
        {
          type: "headline",
          content: "How would you like to restart?",
          style: { fontSize: "24px", textAlign: "center", fontWeight: "800" },
        },
        {
          type: "subtext",
          content:
            "Restarting on Day 1 will clear your history. Would you like to keep your current focus or choose a new one?",
          style: {
            textAlign: "center",
            marginBottom: "32px",
            fontSize: "16px",
          },
        },
        {
          type: "choice_card",
          id: "reset_direction",
          options: [
            {
              id: "stay",
              icon: "fas fa-arrow-rotate-right",
              title: "Continue with Same Focus",
              description: "Maintain your current mantra and practice targets.",
              selected: true,
            },
            {
              id: "change",
              icon: "fas fa-compass",
              title: "Choose a New Focus",
              description: "Start fresh with a different life area or focus.",
            },
          ],
        },
        {
          type: "primary_button",
          label: "Confirm & Restart",
          style: "gold",
          action: {
            type: "submit",
            payload: {
              type: "checkpoint_submit",
              reset_confirmed: true,
              direction: "{{reset_direction}}",
            },
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
        },
      ],
    },
    cycle_commitment: {
      tone: {
        theme: "light_sandal",
        mood: "growth",
        backgroundImage: "/assets/mantra3.png",
        backgroundPosition: "93% top",
      },
      blocks: [
        {
          type: "headline",
          content: "Choose Your Transformative Journey",
          position: "header",
          style: {
            fontFamily: "'Roboto Serif', serif !important",
            fontSize: "30px",
            color: "#432104",
            marginTop: "45px",
            marginBottom: "8px",
          },
        },
        {
          type: "subtext",
          content: "Select a cycle to align mind, body, and spirit.",
          position: "header",
          style: {
            fontSize: "16px",
            color: "#8C8881",
            marginBottom: "24px",
            maxWidth: "280px",
            margin: "0 auto",
          },
        },
        // {
        //   type: "lotus_logo",
        //   style: { height: "140px", marginBottom: "30px" },
        //   variant: "lotus",
        // },
        {
          type: "choice_card",
          id: "cycle_length_selection",
          variant: "grid",
          options: [
            {
              id: "7",
              title: "7-Day Cycle",
              description: "Align and Refresh",
              icon: "fas fa-heart",
              meta: "Mantra • Sankalp • Practice\n\nRealign in Just One Week",
            },
            {
              id: "14",
              title: "14-Day Cycle",
              description: "Deep Transformation",
              icon: "fas fa-om",
              meta: "Sankalp • Mantra • Practice\n\nTransform in Two Weeks",
              selected: true,
            },
          ],
        },
        {
          type: "primary_button",
          label: "Continue to Dashboard →",
          style: "gold",
          action: {
            type: "submit",
            payload: {
              type: "cycle_initiation",
              cycle_length: "{{cycle_length_selection}}",
            },
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
          position: "footer",
        },
      ],
    },
  },
};
export const StableScanContainer = {
  container_id: "stable_scan",
  states: {
    prana_baseline: {
      tone: {
        theme: "light_sandal",
        mood: "steady",
        backgroundPosition: "93% top",
      },

      dynamicMessages: {
        // New canonical focus keys
        career_focus: {
          headline: "Where do you need the most support right now?",
          subtext:
            "Pick the area that feels most relevant to your career and focus today.",
        },
        spiritual_growth: {
          headline: "Where does your spiritual practice feel most stuck?",
          subtext: "Pick the state that resonates. There is no wrong answer.",
        },
        relationships: {
          headline: "How are your relationships feeling lately?",
          subtext: "Pick the option that feels true for you.",
        },
        // Old keys (backward compat for existing journeys)
        career: {
          headline: "What feels difficult in your career right now?",
          subtext:
            "You're not alone in feeling this way. Let's understand where you are today.",
        },
        relationship: {
          headline: "How are your relationships feeling lately?",
          subtext: "Pick the option that feels true for you.",
        },
        health: {
          headline: "How has your energy been feeling lately?",
          subtext: "Select what best describes your state.",
        },
        wealth: {
          headline: "How is your financial balance feeling lately?",
          subtext: "Choose the option that feels closest to you.",
        },
        default: {
          headline: "How are you feeling right now?",
          subtext: "Select the option that feels closest to you.",
        },
      },

      blocks: [
        {
          id: "dynamic_prana_text",
          type: "headline",
          content: "How are you feeling right now?",
          position: "header",
        },
        {
          id: "dynamic_prana_subtext",
          type: "subtext",
          content: "Select the option that feels closest to you.",
          position: "header",
        },
        {
          id: "prana_baseline_selection",
          type: "choice_grid",
          section_title: "YOUR CURRENT STATE",
          options: [],
        },
        {
          type: "subtext",
          content: "Tap on what you're feeling to adjust the sliders below.",
          style: {
            fontSize: "14px",
            color: "#8c8881",
            fontStyle: "italic",
            marginTop: "-8px",
            marginBottom: "-16px",
          },
        },
        {
          type: "primary_button",
          label: "Continue →",
          action: {
            type: "submit",
            payload: { type: "set_baseline" },
            target: {
              container_id: "choice_stack",
              state_id: "depth_selection",
            },
          },
          style: "gold",
          position: "footer",
        },
        {
          type: "subtext",
          content:
            "This helps KalpX guide you based on how you’re feeling today",

          variant: "small",
          position: "footer",
        },
      ],

      optionsMap: {
        career: [
          {
            id: "Feeling Stuck",
            label: "Feeling Stuck",
            icon: "fas fa-spinner",
            explanation:
              "<b>Feeling Stuck</b> is <b>Stambha</b>—a freeze in movement where your talents feel jammed.\n\nYou don't need a map; you need a 'hammer.' We use the most aggressive <b>Ganesha</b> and <b>Skanda</b> mantras to shatter inertia and restore the flow of momentum.",
          },
          {
            id: "Not Feeling Valued",
            label: "Not Feeling Valued",
            icon: "fas fa-heart-broken",
            explanation:
              "This wound arises when your <b>inner worth</b> isn't mirrored by your office environment.\n\nWe invoke <b>Lakshmi</b> for dignity and <b>Vishnu</b> for stable identity. You shift from seeking validation to radiating <b>Aishvarya</b>—the sovereignty of a soul that knows its worth.",
          },
          {
            id: "Low Confidence",
            label: "Low Confidence",
            icon: "fas fa-user-slash",
            explanation:
              "<b>Low Confidence</b> is a shrinking of your <b>Tejas</b> (radiance).\n\nTo stand your ground in a meeting or negotiation, you need to ignite your <b>inner fire</b> and build a 'Fortress of Fearlessness' using the power of <b>Durga</b> and <b>Hanuman</b>.",
          },
          {
            id: "No Direction",
            label: "No Direction",
            icon: "fas fa-signs-post",
            explanation:
              "When you face <b>No Direction</b>, your <b>Buddhi</b> (intellect) is clouded by too many voices.\n\nYou need to cut through the fog to find your true <b>Svadharma</b>.\n\nWe invoke the absolute clarity of the <b>Guru</b> and the solar radiance of <b>Saraswati</b> to awaken your inner compass.",
          },
          {
            id: "Too Much Pressure",
            label: "Too Much Pressure",
            icon: "fas fa-tachometer-alt",
            fullWidth: true,
            explanation:
              "<b>Pressure</b> is <b>Ati-Bhāra</b>—carrying more than your pranic system can hold. This leads to burnout.\n\nWe use cooling, grounding mantras like <b>Shiva</b> and <b>Narasimha</b> to release the mental fire and restore your system to a state of calm containment.",
          },
        ],
        relationship: [
          {
            id: "Heart Feels Heavy",
            label: "Heart Feels Heavy",
            icon: "fas fa-heart",
            explanation:
              "When the heart feels heavy, the deeper state is often <b>Shoka</b>—grief, weight, or sorrow held in the emotional body.\n\nThis is not just sadness; it is a heart that needs softening, nourishment, and a return to <b>tenderness</b>. We invoke the mothering presence of <b>Parvati</b> and the steady devotion of <b>Rama</b> to lift the weight.",
          },
          {
            id: "Holding Anger",
            label: "Holding Anger",
            icon: "fas fa-fire",
            explanation:
              "<b>Holding Anger</b> is a state of <b>Krodha</b> trapped in the heart. The fire is not moving; it becomes friction and separation.\n\nSanatan Dharma addresses this through cooling, purification, and the transformation of reactive heat into the 'Cool Fire' of <b>wisdom</b> and <b>protection</b>.",
          },
          {
            id: "Feeling Lonely",
            label: "Feeling Lonely",
            icon: "fas fa-cloud",
            explanation:
              "<b>Loneliness</b> is <b>Viraha</b>—felt separation.\n\nThis state is healed not just by physical company, but by awakening <b>Divine Nearness</b>. We invoke <b>Krishna</b> as the 'Companion of the Heart' to shift from the pain of absence to the joy of presence.",
          },
          {
            id: "Feeling Distant",
            label: "Feeling Distant",
            icon: "fas fa-link-slash",
            explanation:
              "<b>Feeling Distant</b> reflects a withdrawal and a fading of emotional presence (<b>Bheda</b>).\n\nThis state calls for 'Bridge' mantras that reconnect hearts, restore tenderness, and bring back the sacred remembrance of the <b>'Other.'</b>",
          },
          {
            id: "Emotional Pain",
            label: "Emotional Pain",
            icon: "fas fa-tint",
            fullWidth: true,
            explanation:
              "<b>Emotional Pain</b> is <b>Hridaya-Vedana</b>—pain lodged in the heart-field.\n\nIt needs more than just a 'fix'; it needs <b>Mothering</b> and <b>Restoration</b>. We use the most protective <b>Durga</b> mantras and the healing frequency of <b>Shiva</b> to release the pain without hardening the heart.",
          },
        ],
        // Alias: new B.3 key "relationships" maps to same options as "relationship"
        relationships: [
          {
            id: "heavy_heart",
            label: "Heavy Heart",
            icon: "fas fa-heart-broken",
            explanation:
              "<b>Shoka</b> — weight of grief or sadness. We use heart-opening practices to gently restore lightness.",
          },
          {
            id: "resentful",
            label: "Holding Anger",
            icon: "fas fa-fire",
            explanation:
              "<b>Krodha</b> — trapped heat in the heart. We use cooling and purification practices to release what is held.",
          },
          {
            id: "lonely",
            label: "Feeling Lonely",
            icon: "fas fa-user",
            explanation:
              "<b>Viraha</b> — felt separation. We use connection practices to remember that belonging begins within.",
          },
          {
            id: "disconnected",
            label: "Feeling Distant",
            icon: "fas fa-unlink",
            explanation:
              "<b>Bheda</b> — emotional withdrawal. We use awareness practices to bridge the gap between self and others.",
          },
          {
            id: "grieving",
            label: "Emotional Pain",
            icon: "fas fa-tint",
            fullWidth: true,
            explanation:
              "<b>Hridaya-Vedana</b> — deep heart ache. We use protective and compassionate traditions to hold the pain gently.",
          },
        ],
        health: [
          {
            id: "low_vitality",
            label: "Low Energy",
            icon: "fas fa-battery-quarter",
            explanation:
              "Depleted <b>Prana</b>. We use solar and activating traditions to restore life force and dynamic vitality.",
          },
          {
            id: "burned_out",
            label: "Burned Out",
            icon: "fas fa-bed",
            explanation:
              "Reduced <b>Ojas</b> — deep reserves are low. We use restorative and cooling traditions to rebuild from within.",
          },
          {
            id: "physically_tense",
            label: "Body Tension",
            icon: "fas fa-compress-arrows-alt",
            explanation:
              "Constricted <b>Prana</b> — flow is blocked. We use releasing breath and gentle movement to restore ease.",
          },
          {
            id: "sluggish",
            label: "Feeling Sluggish",
            icon: "fas fa-walking",
            explanation:
              "Increased <b>Tamas</b> — heaviness dominates. We use awakening practices to restore rhythm and lightness.",
          },
          {
            id: "neglectful",
            label: "Neglecting Body",
            icon: "fas fa-pills",
            fullWidth: true,
            explanation:
              "Disconnection from the sacred vessel. We use body-honoring traditions to rebuild the relationship with your physical self.",
          },
        ],
        wealth: [
          {
            id: "Feeling Financial Pressure",
            label: "Feeling Financial Pressure",
            icon: "fas fa-money-bill-wave",
            explanation:
              "<b>Financial Pressure</b> is not simply a budgeting problem. It often reflects <b>fear</b>, <b>contraction</b>, and <b>survival strain</b>.\n\nIn Sanatan terms, this state needs protection, stability, and the strength to hold responsibility without collapsing.",
          },
          {
            id: "Fear of Not Having Enough",
            label: "Fear of Not Having Enough",
            icon: "fas fa-hand-holding-usd",
            explanation:
              "<b>Fear of Not Having Enough</b> is a state of <b>scarcity consciousness</b>.\n\nThe deeper wound is a weakened trust in the <b>cosmic flow</b>. This state is addressed by shifting the vibration from 'lack' to 'sufficiency.'",
          },
          {
            id: "Income Feels Unsteady",
            label: "Income Feels Unsteady",
            icon: "fas fa-chart-line",
            explanation:
              "When <b>income feels unsteady</b>, the issue is often interrupted <b>flow</b>.\n\nIn Sanatan understanding, wealth must not only arrive — it must move with <b>rhythm</b> and supporting order. We address this through <b>Lakshmi</b>, <b>Surya</b>, and <b>Kubera</b>.",
          },
          {
            id: "Carrying Financial Burden",
            label: "Carrying Financial Burden",
            icon: "fas fa-piggy-bank",
            explanation:
              "<b>Carrying Financial Burden</b> is the state of bearing heavy responsibility for others.\n\nThis requires <b>Shakti</b> to carry and <b>Abhaya</b> to not break. We invoke the strength of <b>Hanuman</b> and <b>Durga</b> to support the bearer.",
          },
          {
            id: "Stable but Not Satisfied",
            label: "Stable but Not Satisfied",
            icon: "fas fa-coins",
            fullWidth: true,
            explanation:
              "This is the state of missing <b>Rasa</b> (sweetness) and <b>Santosha</b> (contentment).\n\nWe use <b>heart-opening energy</b> to turn possession into true fulfillment.",
          },
        ],
        // ── New merged focus: Career & Focus ──
        career_focus: [
          {
            id: "stagnant",
            label: "Feeling Stuck",
            icon: "fas fa-spinner",
            explanation:
              "<b>Stambha</b> — frozen momentum. We use sacred sound and intention to dissolve inertia and restore forward movement.",
          },
          {
            id: "work_overwhelm",
            label: "Overwhelmed",
            icon: "fas fa-cloud",
            explanation:
              "<b>Ati-Bhara</b> — carrying too much. We use cooling practices and grounding breath to restore inner steadiness.",
          },
          {
            id: "imposter",
            label: "Low Confidence",
            icon: "fas fa-user-secret",
            explanation:
              "Dimmed <b>Tejas</b> — inner radiance has quieted. We use practices that reignite self-trust and courageous action.",
          },
          {
            id: "scattered",
            label: "Can't Focus",
            icon: "fas fa-random",
            explanation:
              "<b>Vikshipta</b> — the scattered mind. We use clarity practices and focused awareness to train single-pointed attention.",
          },
          {
            id: "financial_stress",
            label: "Financial Stress",
            icon: "fas fa-money-bill-wave",
            fullWidth: true,
            explanation:
              "<b>Artha-Chinta</b> — concern for material stability. We use abundance traditions and trust-building practices to restore ease.",
          },
        ],

        // ── New merged focus: Spiritual Growth ──
        spiritual_growth: [
          {
            id: "practice_discipline",
            label: "Unsteady Practice",
            icon: "fas fa-praying-hands",
            explanation:
              "<b>Abhyasa</b> is the foundation. We use daily rhythms and vows to build the steadiness your practice needs.",
          },
          {
            id: "spiritual_dryness",
            label: "Spiritually Dry",
            icon: "fas fa-tint-slash",
            explanation:
              "Rasa has gone quiet. We use devotional and heart-opening practices to restore the felt sense of the sacred.",
          },
          {
            id: "seeking_surrender",
            label: "Seeking Surrender",
            icon: "fas fa-hand-holding-heart",
            explanation:
              "<b>Ishvara Pranidhana</b> — the path of offering. We use surrender traditions to deepen trust and release control.",
          },
          {
            id: "ungrateful_pattern",
            label: "Losing Gratitude",
            icon: "fas fa-eye-slash",
            explanation:
              "<b>Pramada</b> — the blessings have become invisible. We use gratitude rituals and awareness practices to see again.",
          },
          {
            id: "seeking_depth",
            label: "Seeking Depth",
            icon: "fas fa-om",
            fullWidth: true,
            explanation:
              "<b>Mumukshutva</b> — the longing for more. We use contemplative and self-inquiry traditions to deepen your connection.",
          },
        ],
      },

      subCategorySliders: {
        // Career & Focus
        "Feeling Stuck": [
          { label: "Momentum", value: 3 },
          { label: "Fresh Ideas", value: 3 },
        ],
        stagnant: [
          { label: "Momentum", value: 3 },
          { label: "Fresh Ideas", value: 3 },
        ],
        Overwhelmed: [
          { label: "Calm", value: 3 },
          { label: "Control", value: 3 },
        ],
        work_overwhelm: [
          { label: "Calm", value: 3 },
          { label: "Control", value: 3 },
        ],
        "Low Confidence": [
          { label: "Self-Belief", value: 2 },
          { label: "Courage", value: 4 },
        ],
        imposter: [
          { label: "Self-Belief", value: 2 },
          { label: "Courage", value: 4 },
        ],
        "No Direction": [
          { label: "Clear Goals", value: 3 },
          { label: "Motivation", value: 3 },
        ],
        "Too Much Pressure": [
          { label: "Free Time", value: 2 },
          { label: "Peace of Mind", value: 3 },
        ],

        "Heart Feels Heavy": [
          { label: "Lightness", value: 2 },
          { label: "Forgiveness", value: 3 },
        ],
        "Holding Anger": [
          { label: "Letting Go", value: 3 },
          { label: "Compassion", value: 2 },
        ],
        "Feeling Lonely": [
          { label: "Connection", value: 3 },
          { label: "Self-Love", value: 4 },
        ],
        "Feeling Distant": [
          { label: "Self-Connection", value: 3 },
          { label: "Awareness", value: 3 },
        ],
        "Emotional Pain": [
          { label: "Softness", value: 3 },
          { label: "Acceptance", value: 4 },
        ],

        // Relationship ID-based sliders (for new B.3 "relationships" key)
        heavy_heart: [
          { label: "Lightness", value: 2 },
          { label: "Forgiveness", value: 3 },
        ],
        "Heavy Heart": [
          { label: "Lightness", value: 2 },
          { label: "Forgiveness", value: 3 },
        ],
        resentful: [
          { label: "Letting Go", value: 3 },
          { label: "Compassion", value: 2 },
        ],
        lonely: [
          { label: "Connection", value: 3 },
          { label: "Self-Love", value: 4 },
        ],
        disconnected: [
          { label: "Connection", value: 3 },
          { label: "Presence", value: 3 },
        ],
        grieving: [
          { label: "Softness", value: 3 },
          { label: "Acceptance", value: 4 },
        ],

        "Low Energy": [
          { label: "Energy Level", value: 3 },
          { label: "Vitality", value: 2 },
        ],
        "Very Tired": [
          { label: "Nourishment", value: 2 },
          { label: "Restoration", value: 3 },
        ],
        "Body Tightness": [
          { label: "Relaxation", value: 3 },
          { label: "Physical Ease", value: 4 },
        ],
        "Slow Feeling": [
          { label: "Metabolism", value: 3 },
          { label: "Vigor", value: 2 },
        ],
        "Not Caring for Health": [
          { label: "Body Care", value: 3 },
          { label: "Self-Care", value: 2 },
        ],

        // Health ID-based sliders (for updated health optionsMap)
        low_vitality: [
          { label: "Energy", value: 3 },
          { label: "Vitality", value: 2 },
        ],
        burned_out: [
          { label: "Rest", value: 3 },
          { label: "Recovery", value: 2 },
        ],
        physically_tense: [
          { label: "Relaxation", value: 3 },
          { label: "Ease", value: 3 },
        ],
        sluggish: [
          { label: "Vigor", value: 3 },
          { label: "Lightness", value: 3 },
        ],
        neglectful: [
          { label: "Body Care", value: 3 },
          { label: "Self-Care", value: 2 },
        ],

        "Feeling Financial Pressure": [
          { label: "Peace of Mind", value: 2 },
          { label: "Stability", value: 3 },
        ],
        "Fear of Not Having Enough": [
          { label: "Abundance", value: 2 },
          { label: "Gratitude", value: 3 },
        ],
        "Income Feels Unsteady": [
          { label: "Security", value: 2 },
          { label: "Confidence", value: 3 },
        ],
        "Carrying Financial Burden": [
          { label: "Relief", value: 2 },
          { label: "Control", value: 3 },
        ],
        "Stable but Not Satisfied": [
          { label: "Purpose", value: 2 },
          { label: "Joy", value: 3 },
        ],

        // New: Career & Focus
        scattered: [
          { label: "Clarity", value: 3 },
          { label: "Focus", value: 3 },
        ],
        "Can't Focus": [
          { label: "Clarity", value: 3 },
          { label: "Focus", value: 3 },
        ],
        financial_stress: [
          { label: "Stability", value: 3 },
          { label: "Trust", value: 3 },
        ],
        "Financial Stress": [
          { label: "Stability", value: 3 },
          { label: "Trust", value: 3 },
        ],

        // New: Spiritual Growth
        practice_discipline: [
          { label: "Consistency", value: 3 },
          { label: "Devotion", value: 3 },
        ],
        "Unsteady Practice": [
          { label: "Consistency", value: 3 },
          { label: "Devotion", value: 3 },
        ],
        spiritual_dryness: [
          { label: "Aliveness", value: 3 },
          { label: "Inspiration", value: 3 },
        ],
        "Spiritually Dry": [
          { label: "Aliveness", value: 3 },
          { label: "Inspiration", value: 3 },
        ],
        seeking_surrender: [
          { label: "Trust", value: 3 },
          { label: "Letting Go", value: 3 },
        ],
        "Seeking Surrender": [
          { label: "Trust", value: 3 },
          { label: "Letting Go", value: 3 },
        ],
        ungrateful_pattern: [
          { label: "Appreciation", value: 3 },
          { label: "Wonder", value: 3 },
        ],
        "Losing Gratitude": [
          { label: "Appreciation", value: 3 },
          { label: "Wonder", value: 3 },
        ],
        seeking_depth: [
          { label: "Depth", value: 3 },
          { label: "Surrender", value: 3 },
        ],
        "Seeking Depth": [
          { label: "Depth", value: 3 },
          { label: "Surrender", value: 3 },
        ],
      },
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PORTAL SPLASH CONTAINER
// Shown immediately on app open. Auto-navigates to dashboard after 2s.
// ─────────────────────────────────────────────────────────────────────────────
export const PortalSplashContainer = {
  container_id: "portal_splash",
  states: {
    loading: {
      tone: { theme: "dark_base", mood: "neutral" },
      meta: {
        display_duration_ms: 2000,
        fade_out_duration_ms: 1000,
        auto_navigate: true,
      },
      on_complete: {
        type: "navigate",
        target: { container_id: "companion_dashboard", state_id: "day_active" },
      },
      blocks: [{ type: "lotus_logo" }],
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// INSIGHT SUMMARY CONTAINER
// 3-step insight flow shown after initial path selection.
// ─────────────────────────────────────────────────────────────────────────────
export const InsightSummaryContainer = {
  container_id: "insight_summary",
  states: {
    path_reveal: {
      tone: { theme: "light_sandal", mood: "reflective" },
      insight_config: {
        step0: {
          headline: "Understanding your path",
          subtext: "",
          chosen_label: "You've chosen",
          experience_label: "WITHIN THIS, YOU'RE EXPERIENCING:",
          button_label: "Show My Path →",
          footer_note: "Understanding is the first step of transformation.",
        },
        step1: {
          // Transition animation — no text needed
        },
        step2: {
          headline: "Your Personalized Practice is Ready",
          subtext:
            "KalpX has curated a 14-day journey to realign your mind, energy, and intention",
          footer_note: "Explore Sankalp · Mantra · Daily Practice",
          button_label: "Begin the KalpX Journey",
        },
      },
      blocks: [
        {
          type: "practice_card",
          purpose: "Practice",
          title: "{{card_ritual_title}}",
          description: "{{card_ritual_description}}",
          info_action: {
            type: "view_info",
            payload: { type: "practice", read_only: true },
          },
        },
        {
          type: "practice_card",
          purpose: "Sankalp",
          title: "{{card_sankalpa_title}}",
          description: "{{card_sankalpa_description}}",
          info_action: {
            type: "view_info",
            payload: { type: "sankalp", read_only: true },
          },
        },
        {
          type: "practice_card",
          purpose: "Mantra",
          title: "{{card_mantra_title}}",
          description: "{{card_mantra_description}}",
          info_action: {
            type: "view_info",
            payload: { type: "mantra", read_only: true },
          },
        },
      ],
      on_complete: {
        type: "navigate",
        target: {
          container_id: "companion_dashboard",
          state_id: "day_active",
        },
      },
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SADHANA DEEPEN CONTAINER
// "Deepen My Practice" and "Alter" refinement screens.
// ─────────────────────────────────────────────────────────────────────────────
export const SadhanaDeepenContainer = {
  container_id: "sadhana_deepen",
  states: {
    deepen_choice: {
      tone: { theme: "light_sandal", mood: "steady" },
      blocks: [
        {
          type: "subtext",
          content: "STRENGTHEN WHAT YOU HAVE BEGUN",
          variant: "small-text",
          position: "header",
        },
        {
          type: "headline",
          content: "Deepen My Practice",
          position: "header",
        },
        {
          type: "subtext",
          content: "Choose a direction for today.",
          position: "header",
        },
        {
          type: "choice_card",
          options: [
            {
              id: "add_reps",
              title: "Extend My Mantra",
              description:
                "Add one more round of repetitions to today's session.",
              icon: "fas fa-plus-circle",
              action: {
                type: "submit",
                payload: { deepen_type: "add_reps" },
                target: {
                  container_id: "practice_runner",
                  state_id: "mantra_rep_selection",
                  is_core: true,
                },
              },
            },
            {
              id: "alter_practice",
              title: "Alter My Practices",
              description:
                "Let the system select a fresh mantra and practices aligned to your path.",
              icon: "fas fa-arrows-rotate",
              action: {
                type: "submit",
                payload: { deepen_type: "alter" },
                target: {
                  container_id: "companion_dashboard",
                  state_id: "day_active",
                },
              },
            },
          ],
          position: "content",
        },
        {
          type: "subtext",
          content: "Return when you are ready.",
          variant: "link-text",
          action: {
            type: "navigate",
            target: {
              container_id: "companion_dashboard",
              state_id: "day_active",
            },
          },
          position: "footer",
        },
      ],
    },
  },
};

export const MASTER_UI_TEXT = {
  info: {
    start_labels: {
      practice_action: "Begin Practice",
      practice_offering: "I embrace this today",
      mantra: "Begin Chanting →",
      sankalpa: "I Embody This →",
      generic: "Begin",
      done: "Practice Complete",
    },
    back_labels: {
      dashboard: "Return to Mitra Home",
      generic: "Back",
    },
    help_text: {
      practice:
        "Begin when you feel ready. This takes {{duration}}. There is no rush.",
      offering:
        "Every step you take is noticed and honored. Your focus and dedication are building something real.",
    },
  },
  journey: {
    alter_practices_headline: "New Practices, Deepened Path.",
    path_set_headline: "Your Sadhana is Set.",
    checkpoint_7_tag: "MIDPOINT REFLECTION",
    checkpoint_14_tag: "CYCLE REFLECTION",
    low_engagement: {
      midtext: "A gentler approach:",
      bottomtext:
        "The path is patient. Even one mindful breath today is a step forward.",
      button: "Find My Rhythm →",
    },
  },
  trigger: {
    rhythmic: {
      headline: "This is the rhythm of growth.",
      subtext1:
        "Regaining balance is not a one-time event — it is a cyclic return to your center.",
      subtext2: "Every return to awareness strengthens your foundation.",
      subtext3: "Stay with it. The practice is working beneath the surface.",
    },
    balanced: {
      headline: "Rest in this stillness.",
      subtext1: "You have found your center again.",
      subtext2:
        "Carry this steady presence gently through the rest of your day.",
      subtext3: "Your awareness is your shield and your strength.",
    },
    uncertain: {
      headline: "The witness within you is steady.",
      subtext1:
        "It is natural to feel uncertain — the mind moves, but the Sakshi (witness) does not.",
      subtext2:
        "Observe your inner state without judgment. Let the feeling pass like a cloud.",
      subtext3: "Your center has not moved. Only your attention wandered.",
    },
  },
};

export const ContainerRegistry = {
  portal: PortalContainer,
  portal_splash: PortalSplashContainer,
  choice_stack: ChoiceStackContainer,
  composer: ComposerContainer,
  lock_ritual_overlay: LockRitualContainer,
  lock_ritual: LockRitualContainer,
  routine_builder: RoutineBuilderContainer,
  routine_locked: RoutineLockedContainer,
  companion_dashboard: CompanionDashboardContainer,
  dashboard: CompanionDashboardContainer,
  practice_runner: PracticeRunnerContainer,
  embodiment_challenge_runner: EmbodimentChallengeRunnerContainer,
  embodiment_runner: EmbodimentChallengeRunnerContainer,
  awareness_trigger: AwarenessTriggerContainer,
  insights_progress: InsightsProgressContainer,
  insight_summary: InsightSummaryContainer,
  sadhana_deepen: SadhanaDeepenContainer,
  cycle_transitions: CycleTransitionsContainer,
  stable_scan: StableScanContainer,
  demo_container: {
    container_id: "demo_container",
    states: {
      server_style_demo: {
        style: {
          padding: "40px 20px",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        },
        blocks: [
          {
            type: "headline",
            content: "THE SUPREME ARCHITECT",
            style: {
              color: "#facc15",
              fontSize: "42px",
              fontWeight: "900",
              letterSpacing: "8px",
              textShadow: "0 0 20px rgba(250, 204, 21, 0.5)",
              marginBottom: "40px",
              textAlign: "center",
            },
          },
          {
            type: "subtext",
            content: "THIS SCREEN IS DESIGNED ENTIRELY BY THE BACKEND.",
            style: {
              color: "#94a3b8",
              fontSize: "14px",
              letterSpacing: "2px",
              marginBottom: "60px",
              opacity: "0.8",
            },
          },
          {
            type: "choice_card",
            style: {
              gap: "24px",
            },
            options: [
              {
                id: "blue_pill",
                title: "VIBRANT PATH",
                description: "Neon aesthetics and rapid growth.",
                style: {
                  background: "rgba(37, 99, 235, 0.1)",
                  border: "1px solid #2563eb",
                  borderRadius: "20px",
                },
              },
              {
                id: "gold_pill",
                title: "STALWART PATH",
                description: "Deep gold and structural integrity.",
                style: {
                  background: "rgba(201, 168, 76, 0.1)",
                  border: "1px solid #c9a84c",
                  borderRadius: "20px",
                },
              },
            ],
          },
          {
            type: "primary_button",
            label: "RETURN TO REALITY →",
            style: {
              marginTop: "40px",
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "white",
              borderRadius: "50px",
              fontSize: "12px",
            },
            action: { type: "navigate", target: "portal" },
          },
        ],
      },
      day_15_recap: {
        container_id: "spiritual_recalibration", // This container doesn't exist!
        blocks: [
          {
            type: "micro_label",
            content: "PROGRESS REPORT",
            position: "header",
          },
          {
            type: "headline",
            content: "Day 15: The New You",
            position: "header",
          },
          {
            type: "subtext",
            content: "After two cycles, your neural pathways have shifted.",
            position: "header",
          },
          {
            type: "insight_box",
            items: [
              { text: "Consistency: 96%", subtext: "You missed 0 days." },
              { text: "Awareness: +42%", subtext: "You recorded 15 pauses." },
            ],
          },
          { type: "spacer" },
          {
            type: "primary_button",
            label: "Begin Next Cycle →",
            style_variant: "gold",
            action: { type: "navigate", target: "discipline_select" },
            position: "footer",
          },
        ],
      },
    },
  },
};
