-- Migration: Import Product Manager simulation
-- Description: Adds the Product Manager simulation with steps, rubric, and role_info

DO $$
DECLARE
  existing_slug TEXT := 'product-manager-ship-value';
  sim_id UUID;
BEGIN
  -- Check if simulation already exists
  SELECT id INTO sim_id FROM simulations WHERE slug = existing_slug;

  IF sim_id IS NULL THEN
    -- Insert the new simulation
    INSERT INTO simulations (slug, title, steps, rubric, role_info, active) VALUES (
      existing_slug,
      'Product Manager: From signal to shipped value',
      $json_steps$[
        {
          "index": 0,
          "kind": "task",
          "role": "Product Manager",
          "title": "Define the problem, not the solution",
          "summary_md": "Your task: Answer this Product Manager question\n\nGoal: Distinguish user problem vs. feature request\n\nContext: A sales lead asks for a \"dashboard\" to reduce churn\n\nConstraints: Select the most appropriate answer\n\nDeliverable: Your selected answer\n\nTips: Tie to an underlying metric and user need",
          "hint_md": "Probe for who, what job-to-be-done, and measurable impact.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "What should you do first?",
            "options": [
              "Approve the dashboard and create tickets",
              "Ask engineering for a spike estimate",
              "Validate the churn drivers and user jobs before scoping features",
              "Schedule a design sprint next month"
            ],
            "correct_answer": 2,
            "explanation": "Validate the problem and metrics first; features follow problem clarity."
          },
          "stage": 1
        },
        {
          "index": 1,
          "kind": "task",
          "role": "Product Manager",
          "title": "Match research methods to goals",
          "summary_md": "Your task: Match each Product Manager concept with its correct definition\n\nGoal: Demonstrate understanding of key terms\n\nContext: You're planning discovery under a 2-week timeline\n\nConstraints: Drag each item to its correct match\n\nDeliverable: All pairs correctly matched\n\nTips: Consider time-to-insight and bias risks",
          "hint_md": "Quant for what/where; qual for why/how.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match method → best use:",
            "pairs": [
              { "left": "Usability test", "right": "Evaluate task success and friction on prototypes" },
              { "left": "Survey", "right": "Quantify attitudes/behaviors at scale" },
              { "left": "Customer interview", "right": "Explore motivations and unmet needs" },
              { "left": "Event analytics funnel", "right": "Locate drop-offs in key flows" },
              { "left": "A/B test", "right": "Causally compare two alternatives on a KPI" }
            ],
            "explanation": "Each method aligns to speed, fidelity, and evidence needs in discovery."
          },
          "stage": 1
        },
        {
          "index": 2,
          "kind": "task",
          "role": "Product Manager",
          "title": "Prioritize with constraints",
          "summary_md": "Your task: Answer this Product Manager question\n\nGoal: Apply prioritization frameworks\n\nContext: Three features compete for a single squad this quarter\n\nConstraints: Choose the most defensible approach\n\nDeliverable: Your selected answer\n\nTips: Balance impact, effort, risk, and strategic fit",
          "hint_md": "Use a simple, explainable model (e.g., RICE) and reveal assumptions.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Which is the best next step?",
            "options": [
              "Vote with the team and pick the winner",
              "Use RICE scoring with shared assumptions and sensitivity check",
              "Choose the lowest effort item to show quick wins",
              "Ask leadership to decide"
            ],
            "correct_answer": 1,
            "explanation": "RICE with explicit assumptions creates transparency and alignment."
          },
          "stage": 1
        },
        {
          "index": 3,
          "kind": "task",
          "role": "Product Manager",
          "title": "Match KPI to product area",
          "summary_md": "Your task: Match Product KPIs to domains\n\nGoal: Recognize leading vs lagging indicators\n\nContext: You're drafting OKRs\n\nConstraints: Drag each KPI to area\n\nDeliverable: All pairs matched\n\nTips: Prefer actionable, leading indicators",
          "hint_md": "Acquisition vs activation vs retention vs revenue vs quality.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match KPI → area:",
            "pairs": [
              { "left": "Signup conversion", "right": "Acquisition" },
              { "left": "Time-to-value (TTV)", "right": "Activation" },
              { "left": "WAU/MAU", "right": "Engagement" },
              { "left": "Net revenue retention", "right": "Revenue/Monetization" },
              { "left": "Crash-free sessions", "right": "Quality/Platform" }
            ],
            "explanation": "Each KPI maps to a lifecycle stage to focus experiments."
          },
          "stage": 1
        },
        {
          "index": 4,
          "kind": "task",
          "role": "Product Manager",
          "title": "Acceptance criteria basics",
          "summary_md": "Your task: Answer this Product Manager question\n\nGoal: Write testable acceptance criteria\n\nContext: You're finalizing a small enhancement ticket\n\nConstraints: Pick the best criteria style\n\nDeliverable: Your selected answer\n\nTips: Think Given/When/Then",
          "hint_md": "Behavioral, observable, testable.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Which acceptance criteria are best?",
            "options": [
              "High-level goals only",
              "Given/When/Then scenarios tied to edge cases",
              "Design screenshots alone",
              "Engineering notes about libraries"
            ],
            "correct_answer": 1,
            "explanation": "Gherkin-style criteria make behavior clear and testable."
          },
          "stage": 1
        },
        {
          "index": 5,
          "kind": "task",
          "role": "Product Manager",
          "title": "Roadmap trade-offs",
          "summary_md": "Your task: Answer this Product Manager question\n\nGoal: Handle stakeholder pressure\n\nContext: Sales requests a custom feature for a large prospect\n\nConstraints: Choose the best response\n\nDeliverable: Your selected answer\n\nTips: Consider opportunity cost and scalability",
          "hint_md": "Quantify revenue risk vs roadmap impact.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "What do you do?",
            "options": [
              "Commit immediately to close the deal",
              "Decline all custom work categorically",
              "Evaluate via a scoring rubric (ARR impact, repeatability, effort) and propose a configurable variant if aligned",
              "Ask design to mock it and decide later"
            ],
            "correct_answer": 2,
            "explanation": "A rubric and configurable solution protect roadmap integrity while exploring value."
          },
          "stage": 2
        },
        {
          "index": 6,
          "kind": "task",
          "role": "Product Manager",
          "title": "Match experiment to risk",
          "summary_md": "Your task: Match risk type to the right experiment\n\nGoal: Reduce product risk systematically\n\nContext: You identified four risks: value, usability, feasibility, viability\n\nConstraints: Drag each to its test\n\nDeliverable: Correct mapping\n\nTips: Smallest test of truth first",
          "hint_md": "Value≠usability; feasibility≠viability.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match risk → experiment:",
            "pairs": [
              { "left": "Value risk", "right": "Fake-door/painted-door CTR" },
              { "left": "Usability risk", "right": "Task-based usability test" },
              { "left": "Feasibility risk", "right": "Tech spike/prototype with constraints" },
              { "left": "Viability risk", "right": "Unit economics sensitivity model" },
              { "left": "Compliance risk", "right": "Privacy/Sec review checklist" }
            ],
            "explanation": "Each experiment targets the specific uncertainty efficiently."
          },
          "stage": 2
        },
        {
          "index": 7,
          "kind": "task",
          "role": "Product Manager",
          "title": "PRD: scope the MVP",
          "summary_md": "Your task: Answer this Product Manager question\n\nGoal: Define MVP scope under deadline\n\nContext: 8-week window, one squad\n\nConstraints: Select the best MVP framing\n\nDeliverable: Your selected answer\n\nTips: Focus on core job-to-be-done and success metrics",
          "hint_md": "Defer nice-to-haves to v2.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Which MVP scope is strongest?",
            "options": [
              "Build the full vision to avoid rework",
              "Deliver a thin slice of the end-to-end JTBD with one key metric and manual backoffice",
              "Ship only backend services now",
              "Ship only UI to gather feedback"
            ],
            "correct_answer": 1,
            "explanation": "A thin, end-to-end slice validates value with minimal investment."
          },
          "stage": 2
        },
        {
          "index": 8,
          "kind": "task",
          "role": "Product Manager",
          "title": "Map metrics to OKRs",
          "summary_md": "Your task: Match outcomes to key results\n\nGoal: Compose measurable KRs\n\nContext: Company O: Improve retention\n\nConstraints: Drag each KR to the right objective area\n\nDeliverable: All pairs matched\n\nTips: Leading indicators beat vanity metrics",
          "hint_md": "Tie KRs to behavior changes.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match KR → objective area:",
            "pairs": [
              { "left": "Reduce TTV from 3 days to 24h", "right": "Activation" },
              { "left": "Increase weekly actives by 15%", "right": "Engagement" },
              { "left": "Cut churn from 3.2% to 2.4%", "right": "Retention" },
              { "left": "Lift NPS by +6pts", "right": "Satisfaction" },
              { "left": "Improve P95 latency by 30%", "right": "Quality/Platform" }
            ],
            "explanation": "Each KR is specific, time-bound, and tied to a behavior/outcome."
          },
          "stage": 2
        },
        {
          "index": 9,
          "kind": "task",
          "role": "Product Manager",
          "title": "Stakeholder alignment under conflict",
          "summary_md": "Your task: Answer this Product Manager question\n\nGoal: Handle conflicting exec inputs\n\nContext: Design wants craft; Sales wants speed\n\nConstraints: Pick the alignment move\n\nDeliverable: Your selected answer\n\nTips: Make trade-offs explicit",
          "hint_md": "Create visibility and decision criteria.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Best next step?",
            "options": [
              "Escalate immediately to CEO",
              "Run a decision memo with options, trade-offs, data, and a recommendation; review in a 30-min forum",
              "Let Sales decide because revenue wins",
              "Build both paths in parallel"
            ],
            "correct_answer": 1,
            "explanation": "A written decision memo with data clarifies trade-offs and enables informed buy-in."
          },
          "stage": 2
        },
        {
          "index": 10,
          "kind": "task",
          "role": "Product Manager",
          "title": "AI feature: risk & ethics",
          "summary_md": "Your task: Answer this Product Manager question\n\nGoal: Manage AI risks\n\nContext: Proposing an AI summarizer for user data\n\nConstraints: Choose the strongest mitigation set\n\nDeliverable: Your selected answer\n\nTips: Consider privacy, evaluation, and fallback UX",
          "hint_md": "Guardrails + measurement + consent.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Which plan is best?",
            "options": [
              "Ship quickly, fix later",
              "Collect broad user data without consent for better models",
              "Add explicit consent, on-device redaction, offline eval set, quality gates, and manual fallback for low confidence",
              "Limit to enterprise tier only"
            ],
            "correct_answer": 2,
            "explanation": "Responsible AI requires consent, evaluations, guardrails, and graceful degradation."
          },
          "stage": 3
        },
        {
          "index": 11,
          "kind": "task",
          "role": "Product Manager",
          "title": "Complex roadmap dependencies",
          "summary_md": "Your task: Match dependency to mitigation\n\nGoal: Manage cross-team risks\n\nContext: Platform, Billing, and Data teams are prerequisites\n\nConstraints: Drag to best mitigation\n\nDeliverable: Correct mapping\n\nTips: Sequence critical path and add buffers",
          "hint_md": "Contracts, SLAs, and integration test plans matter.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match dependency → mitigation:",
            "pairs": [
              { "left": "Billing API reliability risk", "right": "SLA + synthetic monitoring + rollback plan" },
              { "left": "Data schema changes", "right": "Versioned contracts + contract tests" },
              { "left": "Platform deployment window", "right": "Milestone alignment + feature flags" },
              { "left": "ML model latency variance", "right": "Cache strategy + circuit breaker" },
              { "left": "Third-party rate limits", "right": "Backoff + queueing + usage caps" }
            ],
            "explanation": "Each mitigation targets the specific failure mode to protect delivery."
          },
          "stage": 3
        },
        {
          "index": 12,
          "kind": "task",
          "role": "Product Manager",
          "title": "Pricing/packaging decision",
          "summary_md": "Your task: Answer this Product Manager question\n\nGoal: Choose pricing research approach\n\nContext: Launching a premium analytics add-on\n\nConstraints: Pick best research mix\n\nDeliverable: Your selected answer\n\nTips: Combine stated and revealed preference",
          "hint_md": "Use Van Westendorp + conjoint + live tests.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Best path?",
            "options": [
              "Ask customers what they would pay",
              "Copy a competitor's price",
              "Combine Van Westendorp, conjoint on value drivers, and a limited geo price test",
              "Wait until after launch to decide"
            ],
            "correct_answer": 2,
            "explanation": "Mixed methods reduce bias and validate willingness to pay."
          },
          "stage": 3
        },
        {
          "index": 13,
          "kind": "task",
          "role": "Product Manager",
          "title": "Advanced analytics literacy",
          "summary_md": "Your task: Match metric pitfall to fix\n\nGoal: Avoid bad decisions from data\n\nContext: Your dashboard shows conflicting trends\n\nConstraints: Drag to the remedy\n\nDeliverable: Correct mapping\n\nTips: Think cohorts, seasonality, and Simpson's paradox",
          "hint_md": "Drill into segments and time windows.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match pitfall → remedy:",
            "pairs": [
              { "left": "Simpson's paradox", "right": "Segment by cohort/attribute before aggregating" },
              { "left": "Seasonality effects", "right": "Use YoY and deseasonalized views" },
              { "left": "Metric lag", "right": "Track leading indicators and proxy metrics" },
              { "left": "Attribution noise", "right": "Controlled experiments / MMM cross-checks" },
              { "left": "P-hacking risk", "right": "Pre-register hypotheses and stopping rules" }
            ],
            "explanation": "Robust analysis prevents spurious conclusions."
          },
          "stage": 3
        },
        {
          "index": 14,
          "kind": "task",
          "role": "Product Manager",
          "title": "Post-launch learning loop",
          "summary_md": "Your task: Answer this Product Manager question\n\nGoal: Close the loop after launch\n\nContext: Feature shipped; early adoption is below target\n\nConstraints: Pick the highest-leverage response\n\nDeliverable: Your selected answer\n\nTips: Instrument, learn, iterate",
          "hint_md": "Pair quant (funnels) with qual (sessions/interviews).",
          "expected_input": {
            "type": "multiple_choice",
            "question": "What do you do first?",
            "options": [
              "Roll back the feature immediately",
              "Launch a new feature on top",
              "Analyze funnel + session replays, run 5–7 interviews, then iterate on highest drop-off step",
              "Send a marketing email blast"
            ],
            "correct_answer": 2,
            "explanation": "Targeted diagnostics before iteration maximizes impact and avoids churn."
          },
          "stage": 3
        }
      ]$json_steps$::jsonb,
      $json_rubric$[
        "Clarifies problem statements and success metrics",
        "Prioritizes with data and constraints",
        "Writes crisp PRDs/acceptance criteria",
        "Aligns stakeholders and manages risk",
        "Measures outcomes and iterates"
      ]$json_rubric$::jsonb,
      $json_role_info${
        "overview": "Product Managers (PMs) align user needs, business goals, and engineering/design to ship products that matter. In 2025, PMs increasingly orchestrate AI-enabled features, data-informed roadmaps, and cross-functional delivery under tight constraints.",
        "careerPath": [
          "Associate Product Manager → Product Manager (1–2 years)",
          "Product Manager → Senior Product Manager (2–3 years)",
          "Senior PM → Group/Lead PM (2–3 years)",
          "Group PM → Director/Head of Product → VP Product (3–5+ years)"
        ],
        "salaryRange": "Entry EU: €45k–€70k; US: $80k–$115k.\nMid EU: €70k–€100k; US: $115k–$160k.\nSenior EU: €100k–€150k+; US: $160k–$230k+.\nTop-tier/Big Tech and hot AI startups may exceed these bands.",
        "industries": [
          "Software/SaaS",
          "Fintech",
          "E-commerce",
          "Healthtech",
          "Media/Streaming",
          "Telecom",
          "Industrial/IoT",
          "AI/ML Platforms"
        ],
        "growthOutlook": "Steady demand as companies professionalize product strategy and integrate AI. Automation augments research and execution, but cross-functional leadership and judgment keep PM roles resilient.",
        "education": "Commonly BA/BS in business, CS, engineering, or design; MBA optional. Alternative paths: internal transfers from engineering/UX/CS, product bootcamps, shipping side projects, analytics certificates.",
        "personalityTraits": [
          "User-obsessed",
          "Structured thinker",
          "Data-literate",
          "Collaborative communicator",
          "Bias to action"
        ]
      }$json_role_info$::jsonb,
      true
    );

    RAISE NOTICE 'Successfully created Product Manager simulation with slug: %', existing_slug;
  ELSE
    RAISE NOTICE 'Simulation with slug "%" already exists. Skipping insertion.', existing_slug;
  END IF;
END $$;

