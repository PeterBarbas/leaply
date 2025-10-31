-- Migration: Import Digital Marketing Specialist simulation
-- Description: Adds the Digital Marketing Specialist simulation with steps, rubric, and role_info

DO $$
DECLARE
  existing_slug TEXT := 'digital-marketing-specialist-campaigns';
  sim_id UUID;
BEGIN
  -- Check if simulation already exists
  SELECT id INTO sim_id FROM simulations WHERE slug = existing_slug;

  IF sim_id IS NULL THEN
    -- Insert the new simulation
    INSERT INTO simulations (slug, title, steps, rubric, role_info, active) VALUES (
      existing_slug,
      'Digital Marketing Specialist: Campaigns that convert',
      $json_steps$[
        {
          "index": 0,
          "kind": "task",
          "role": "Digital Marketing Specialist",
          "title": "Define your campaign objective",
          "summary_md": "Your task: Choose the right goal for your campaign\n\nGoal: Identify the most fitting objective for a client's business aim\n\nContext: A new SaaS startup wants brand awareness before product launch\n\nConstraints: Pick the campaign objective aligning with this goal\n\nDeliverable: Selected campaign objective\n\nTips: Match the funnel stage and KPI",
          "hint_md": "Awareness ≠ Conversions. Start where your audience is.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Which campaign objective is best?",
            "options": [
              "Conversions",
              "Brand awareness",
              "Lead generation",
              "App installs"
            ],
            "correct_answer": 1,
            "explanation": "For pre-launch SaaS, brand awareness builds top-of-funnel visibility."
          },
          "stage": 1
        },
        {
          "index": 1,
          "kind": "task",
          "role": "Digital Marketing Specialist",
          "title": "Match metrics to campaign goals",
          "summary_md": "Your task: Match each KPI to its best-fitting campaign goal\n\nGoal: Understand how performance is measured\n\nContext: Your manager asks for relevant metrics by funnel stage\n\nConstraints: Drag each KPI to the correct goal\n\nDeliverable: Correct matches",
          "hint_md": "Top funnel = reach; bottom funnel = conversion.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match KPI → Goal:",
            "pairs": [
              { "left": "CTR", "right": "Engagement" },
              { "left": "CPM", "right": "Awareness" },
              { "left": "ROAS", "right": "Conversion" },
              { "left": "CPL", "right": "Lead generation" },
              { "left": "Engagement rate", "right": "Consideration" }
            ],
            "explanation": "Each KPI measures success at a specific funnel stage."
          },
          "stage": 1
        },
        {
          "index": 2,
          "kind": "task",
          "role": "Digital Marketing Specialist",
          "title": "Audience targeting basics",
          "summary_md": "Your task: Choose the best audience segmentation approach\n\nGoal: Optimize for reach and relevance\n\nContext: You have limited budget and 3 audience options\n\nConstraints: Pick the highest ROI target\n\nDeliverable: Your selected audience",
          "hint_md": "Specific, high-intent audiences usually outperform broad cold ones.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Which audience should you target first?",
            "options": [
              "Broad interests: 'Technology enthusiasts'",
              "Custom audience from newsletter signups",
              "Lookalike of competitors' followers",
              "Random age 18–65 audience"
            ],
            "correct_answer": 1,
            "explanation": "First-party data provides better conversion efficiency and personalization."
          },
          "stage": 1
        },
        {
          "index": 3,
          "kind": "task",
          "role": "Digital Marketing Specialist",
          "title": "Match channel to content format",
          "summary_md": "Your task: Match platforms with optimal content types\n\nGoal: Understand which content performs best where\n\nContext: You plan a multi-channel campaign\n\nConstraints: Drag each platform to its ideal content type\n\nDeliverable: All pairs matched",
          "hint_md": "Think user intent and format fit.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match platform → format:",
            "pairs": [
              { "left": "LinkedIn", "right": "Thought leadership post" },
              { "left": "Instagram", "right": "Reel or carousel" },
              { "left": "YouTube", "right": "Explainer video" },
              { "left": "X (Twitter)", "right": "Short thread or announcement" },
              { "left": "Google Search Ads", "right": "Text ad with strong CTA" }
            ],
            "explanation": "Content must fit the context and consumption pattern of each platform."
          },
          "stage": 1
        },
        {
          "index": 4,
          "kind": "task",
          "role": "Digital Marketing Specialist",
          "title": "Budget allocation 101",
          "summary_md": "Your task: Decide how to allocate a $10k campaign budget\n\nGoal: Balance spend across funnel stages\n\nContext: Awareness and conversion campaigns are both needed\n\nConstraints: Choose the most effective split\n\nDeliverable: Allocation choice",
          "hint_md": "Awareness fuels future conversion, but test allocation iteratively.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "What's the best budget split?",
            "options": [
              "100% awareness",
              "50% awareness / 50% conversion",
              "70% awareness / 30% conversion",
              "20% awareness / 80% conversion"
            ],
            "correct_answer": 2,
            "explanation": "A 70/30 split builds visibility while ensuring bottom-funnel performance."
          },
          "stage": 1
        },
        {
          "index": 5,
          "kind": "task",
          "role": "Digital Marketing Specialist",
          "title": "Craft an effective ad copy",
          "summary_md": "Your task: Choose the best-performing ad copy variant\n\nGoal: Apply persuasive copywriting\n\nContext: A/B testing headlines for a fitness app\n\nConstraints: Pick the copy most likely to convert\n\nDeliverable: Chosen ad copy",
          "hint_md": "Focus on benefit + emotion + CTA.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Which headline performs best?",
            "options": [
              "\"Track workouts easily\"",
              "\"Join 10,000 users transforming their health today\"",
              "\"Free workout tracker\"",
              "\"Download now!\""
            ],
            "correct_answer": 1,
            "explanation": "Social proof and transformation-focused benefit drive engagement."
          },
          "stage": 2
        },
        {
          "index": 6,
          "kind": "task",
          "role": "Digital Marketing Specialist",
          "title": "Match funnel stage to strategy",
          "summary_md": "Your task: Match marketing strategy to funnel stage\n\nGoal: Build full-funnel thinking\n\nContext: You're planning next quarter's roadmap\n\nConstraints: Drag each strategy to its funnel stage\n\nDeliverable: Correct matches",
          "hint_md": "Top = awareness; middle = nurture; bottom = convert.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match strategy → funnel stage:",
            "pairs": [
              { "left": "SEO blog posts", "right": "Awareness" },
              { "left": "Email drip campaign", "right": "Consideration" },
              { "left": "Free trial CTA", "right": "Conversion" },
              { "left": "Retargeting ads", "right": "Conversion" },
              { "left": "Customer testimonial video", "right": "Consideration" }
            ],
            "explanation": "Mapping activities ensures full funnel coverage."
          },
          "stage": 2
        },
        {
          "index": 7,
          "kind": "task",
          "role": "Digital Marketing Specialist",
          "title": "Analyze campaign data",
          "summary_md": "Your task: Identify which metric signals poor performance\n\nGoal: Interpret performance analytics\n\nContext: CPC dropped, CTR rose, but conversions fell\n\nConstraints: Pick the right insight\n\nDeliverable: Correct diagnosis",
          "hint_md": "High CTR but low CVR = landing page or intent mismatch.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "What's most likely happening?",
            "options": [
              "Your ad creative is underperforming",
              "Your landing page is not converting visitors",
              "Your audience targeting is too narrow",
              "Budget is too low"
            ],
            "correct_answer": 1,
            "explanation": "Improved CTR but poor conversion suggests a post-click experience issue."
          },
          "stage": 2
        },
        {
          "index": 8,
          "kind": "task",
          "role": "Digital Marketing Specialist",
          "title": "Automation tool matching",
          "summary_md": "Your task: Match marketing task to automation tool\n\nGoal: Use the right platform efficiently\n\nContext: You're setting up workflows\n\nConstraints: Drag each to its matching tool\n\nDeliverable: Correct matches",
          "hint_md": "Think automation domain (email, ads, CRM, analytics).",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match task → tool:",
            "pairs": [
              { "left": "Email nurture sequence", "right": "HubSpot" },
              { "left": "Ad retargeting automation", "right": "Meta Ads Manager" },
              { "left": "Conversion tracking", "right": "Google Analytics 4" },
              { "left": "Lead scoring", "right": "Salesforce" },
              { "left": "Keyword optimization", "right": "SEMrush" }
            ],
            "explanation": "Each tool specializes in a different stage of the marketing stack."
          },
          "stage": 2
        },
        {
          "index": 9,
          "kind": "task",
          "role": "Digital Marketing Specialist",
          "title": "Crisis management",
          "summary_md": "Your task: Choose the best response to negative social buzz\n\nGoal: Handle reputation risk fast\n\nContext: A campaign slogan is criticized online\n\nConstraints: Pick your best next step\n\nDeliverable: Crisis response plan",
          "hint_md": "Transparency and speed matter.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "What's your move?",
            "options": [
              "Ignore until it fades",
              "Delete all comments",
              "Acknowledge concerns, issue clarification, and monitor sentiment",
              "Run a giveaway to distract"
            ],
            "correct_answer": 2,
            "explanation": "Authentic acknowledgment preserves trust during backlash."
          },
          "stage": 2
        },
        {
          "index": 10,
          "kind": "task",
          "role": "Digital Marketing Specialist",
          "title": "AI campaign optimization",
          "summary_md": "Your task: Choose the best way to use AI tools\n\nGoal: Enhance performance with automation\n\nContext: You use AI to write ad variations\n\nConstraints: Pick the most effective workflow\n\nDeliverable: AI usage plan",
          "hint_md": "AI helps ideation; validation still human.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "What's the optimal approach?",
            "options": [
              "Let AI fully manage targeting and copy",
              "Use AI to generate variants, then test and refine based on CTR/CVR data",
              "Avoid AI entirely",
              "Only use AI for reporting"
            ],
            "correct_answer": 1,
            "explanation": "Human-guided optimization ensures contextual accuracy and compliance."
          },
          "stage": 3
        },
        {
          "index": 11,
          "kind": "task",
          "role": "Digital Marketing Specialist",
          "title": "Match campaign type to platform strength",
          "summary_md": "Your task: Match advanced ad formats to platforms\n\nGoal: Deploy the right creative for ROI\n\nContext: Scaling ad spend\n\nConstraints: Drag each campaign type to best platform\n\nDeliverable: Correct mapping",
          "hint_md": "Match format to audience behavior.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match ad type → platform:",
            "pairs": [
              { "left": "Shopping Ads", "right": "Google" },
              { "left": "Short-form video ads", "right": "TikTok" },
              { "left": "Sponsored InMail", "right": "LinkedIn" },
              { "left": "Carousel retargeting", "right": "Meta" },
              { "left": "Display banners", "right": "Google Display Network" }
            ],
            "explanation": "Different platforms favor different user intents and ad formats."
          },
          "stage": 3
        },
        {
          "index": 12,
          "kind": "task",
          "role": "Digital Marketing Specialist",
          "title": "Attribution modeling challenge",
          "summary_md": "Your task: Choose the best attribution model\n\nGoal: Evaluate campaign effectiveness accurately\n\nContext: Multi-channel campaigns with long cycles\n\nConstraints: Pick the best model\n\nDeliverable: Attribution model choice",
          "hint_md": "Think buyer journey complexity.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Which model fits best?",
            "options": [
              "First click",
              "Last click",
              "Data-driven attribution",
              "Linear"
            ],
            "correct_answer": 2,
            "explanation": "Data-driven attribution weighs real contribution across touchpoints."
          },
          "stage": 3
        },
        {
          "index": 13,
          "kind": "task",
          "role": "Digital Marketing Specialist",
          "title": "ROI analysis",
          "summary_md": "Your task: Match metric improvement to likely cause\n\nGoal: Interpret data causality\n\nContext: ROAS improved 25%\n\nConstraints: Drag each metric improvement to explanation\n\nDeliverable: Correct matches",
          "hint_md": "Consider both efficiency and intent shifts.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match metric → cause:",
            "pairs": [
              { "left": "Higher CTR", "right": "Better creative targeting audience pain" },
              { "left": "Lower CPL", "right": "Optimized form and landing speed" },
              { "left": "Higher ROAS", "right": "Budget shifted to high-performing segments" },
              { "left": "Longer session time", "right": "Improved site content relevance" },
              { "left": "Higher bounce rate", "right": "Mismatched ad messaging" }
            ],
            "explanation": "Data patterns reveal optimization impact across touchpoints."
          },
          "stage": 3
        },
        {
          "index": 14,
          "kind": "task",
          "role": "Digital Marketing Specialist",
          "title": "Reporting to stakeholders",
          "summary_md": "Your task: Choose the right insight framing\n\nGoal: Communicate campaign outcomes clearly\n\nContext: Presenting Q4 results to leadership\n\nConstraints: Pick the best reporting focus\n\nDeliverable: Presentation outline",
          "hint_md": "Tie data to business outcomes, not vanity metrics.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "What's best to highlight?",
            "options": [
              "Impressions and reach only",
              "CTR, CVR, and revenue impact relative to last quarter",
              "All ad creatives used",
              "Total number of posts published"
            ],
            "correct_answer": 1,
            "explanation": "Decision-makers value ROI and improvement metrics, not activity volume."
          },
          "stage": 3
        }
      ]$json_steps$::jsonb,
      $json_rubric$[
        "Understands key digital channels and metrics",
        "Optimizes targeting and conversion funnels",
        "Uses data and automation tools effectively",
        "Creates cohesive multi-channel strategies",
        "Measures ROI and iterates campaigns"
      ]$json_rubric$::jsonb,
      $json_role_info${
        "overview": "Digital Marketing Specialists design and execute online campaigns that attract, engage, and convert audiences across channels. In 2025, they blend creativity with analytics and AI tools to automate targeting, personalize messaging, and optimize ROI in real time.",
        "careerPath": [
          "Marketing Assistant → Digital Marketing Specialist (1–2 years)",
          "Digital Marketing Specialist → Senior Digital Marketer (2–3 years)",
          "Senior Digital Marketer → Digital Marketing Manager (2–3 years)",
          "Manager → Head of Growth / Performance / Marketing Director (3–5+ years)"
        ],
        "salaryRange": "Entry EU: €35k–€50k; US: $50k–$70k.\nMid EU: €50k–€75k; US: $70k–$100k.\nSenior EU: €75k–€110k+; US: $100k–$140k+.\nFreelance and performance-based roles vary widely.",
        "industries": [
          "E-commerce",
          "Technology & SaaS",
          "Media & Entertainment",
          "Education & EdTech",
          "Healthcare",
          "Finance / Fintech",
          "Travel & Hospitality",
          "Consumer Goods"
        ],
        "growthOutlook": "Strong global demand as AI transforms campaign optimization, personalization, and analytics. Specialists who can combine creativity with technical literacy (automation, data, prompt design) remain highly sought after.",
        "education": "Commonly BA/BS in Marketing, Communications, or Business; valuable certifications: Google Ads, Meta Blueprint, HubSpot, GA4 Analytics. Alternative paths: self-taught through courses, internships, and performance portfolios.",
        "personalityTraits": [
          "Analytical yet creative",
          "Data-driven decision-maker",
          "Adaptable to fast-changing tools",
          "Strong communicator",
          "Curious and experiment-oriented"
        ]
      }$json_role_info$::jsonb,
      true
    );

    RAISE NOTICE 'Successfully created Digital Marketing Specialist simulation with slug: %', existing_slug;
  ELSE
    RAISE NOTICE 'Simulation with slug "%" already exists. Skipping insertion.', existing_slug;
  END IF;
END $$;

