-- Migration: Import Talent Acquisition Specialist simulation
-- Description: Adds the Talent Acquisition Specialist simulation with steps, rubric, and role_info

DO $$
DECLARE
  existing_slug TEXT := 'talent-acquisition-specialist-hiring-fit';
  sim_id UUID;
BEGIN
  -- Check if simulation already exists
  SELECT id INTO sim_id FROM simulations WHERE slug = existing_slug;

  IF sim_id IS NULL THEN
    -- Insert the new simulation
    INSERT INTO simulations (slug, title, steps, rubric, role_info, active) VALUES (
      existing_slug,
      'Talent Acquisition Specialist: Hiring the right fit',
      $json_steps$[
        {
          "index": 0,
          "kind": "task",
          "role": "Talent Acquisition Specialist",
          "title": "Define the hiring need",
          "summary_md": "Your task: Identify what's missing in the job brief\n\nGoal: Clarify requirements before sourcing\n\nContext: The hiring manager provides a vague job description for a Data Analyst\n\nConstraints: Choose what to do first\n\nDeliverable: Best next action",
          "hint_md": "Good intake reduces rework and mis-hires.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "What should you do first?",
            "options": [
              "Start sourcing based on job title",
              "Ask for recent similar hires, KPIs, and must-have skills",
              "Post the role online immediately",
              "Request an external recruiter"
            ],
            "correct_answer": 1,
            "explanation": "Clarifying must-haves and success metrics ensures better candidate targeting."
          },
          "stage": 1
        },
        {
          "index": 1,
          "kind": "task",
          "role": "Talent Acquisition Specialist",
          "title": "Match sourcing channel to role type",
          "summary_md": "Your task: Match each sourcing channel to the ideal use case\n\nGoal: Optimize sourcing strategy\n\nContext: You're hiring across diverse roles\n\nConstraints: Drag role → sourcing channel",
          "hint_md": "Passive vs active candidates matter.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match role → best sourcing channel:",
            "pairs": [
              { "left": "Software Engineer", "right": "LinkedIn & GitHub" },
              { "left": "Marketing Specialist", "right": "LinkedIn & industry Slack groups" },
              { "left": "Sales Executive", "right": "Referrals & job boards" },
              { "left": "Intern / Graduate", "right": "University career portals" },
              { "left": "Designer", "right": "Behance & Dribbble" }
            ],
            "explanation": "Different roles thrive on different sourcing platforms."
          },
          "stage": 1
        },
        {
          "index": 2,
          "kind": "task",
          "role": "Talent Acquisition Specialist",
          "title": "Screen for key skills",
          "summary_md": "Your task: Choose the best screening question\n\nGoal: Assess candidate fit early\n\nContext: Screening for a Product Manager role\n\nConstraints: Pick the question most predictive of success",
          "hint_md": "Behavioral questions reveal impact and decision-making.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Which question is best?",
            "options": [
              "\"Tell me about yourself\"",
              "\"What's your salary expectation?\"",
              "\"Describe a time you prioritized conflicting stakeholder requests.\"",
              "\"Where do you see yourself in 5 years?\""
            ],
            "correct_answer": 2,
            "explanation": "Behavioral examples showcase actual PM skills and thought process."
          },
          "stage": 1
        },
        {
          "index": 3,
          "kind": "task",
          "role": "Talent Acquisition Specialist",
          "title": "Match metric to recruitment stage",
          "summary_md": "Your task: Connect hiring metrics to funnel stages\n\nGoal: Understand pipeline efficiency\n\nContext: You're reviewing monthly reports\n\nConstraints: Drag metric → stage",
          "hint_md": "Metrics diagnose bottlenecks.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match metric → stage:",
            "pairs": [
              { "left": "Time-to-hire", "right": "Overall cycle efficiency" },
              { "left": "Source-to-interview rate", "right": "Sourcing quality" },
              { "left": "Interview-to-offer rate", "right": "Screening quality" },
              { "left": "Offer acceptance rate", "right": "Candidate experience" },
              { "left": "First-year retention", "right": "Long-term hiring quality" }
            ],
            "explanation": "Metrics pinpoint weak spots in your recruiting funnel."
          },
          "stage": 1
        },
        {
          "index": 4,
          "kind": "task",
          "role": "Talent Acquisition Specialist",
          "title": "Craft the right job post",
          "summary_md": "Your task: Choose the best tone for a job post\n\nGoal: Attract the right talent\n\nContext: You're writing for a startup company culture\n\nConstraints: Pick the most effective tone",
          "hint_md": "Avoid clichés; highlight purpose and growth.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Which description fits best?",
            "options": [
              "\"We're a family and work hard/play hard.\"",
              "\"Join our agile team shaping the future of fintech innovation.\"",
              "\"We expect long hours but great results.\"",
              "\"Generic job template\""
            ],
            "correct_answer": 1,
            "explanation": "Professional yet inspiring tone attracts serious, motivated candidates."
          },
          "stage": 1
        },
        {
          "index": 5,
          "kind": "task",
          "role": "Talent Acquisition Specialist",
          "title": "Manage hiring manager expectations",
          "summary_md": "Your task: Choose the best communication approach\n\nGoal: Align stakeholders early\n\nContext: Manager demands unrealistic candidate profile\n\nConstraints: Pick your next move",
          "hint_md": "Data-driven collaboration builds trust.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "What should you do?",
            "options": [
              "Push back immediately",
              "Provide market data and real-time sourcing insights before re-aligning expectations",
              "Agree to everything to keep harmony",
              "Escalate to HR Director"
            ],
            "correct_answer": 1,
            "explanation": "Market data supports constructive discussion and realignment."
          },
          "stage": 2
        },
        {
          "index": 6,
          "kind": "task",
          "role": "Talent Acquisition Specialist",
          "title": "Match interview type to goal",
          "summary_md": "Your task: Pair interview format with purpose\n\nGoal: Build structured hiring processes\n\nContext: Designing a new hiring process\n\nConstraints: Drag type → goal",
          "hint_md": "Structured interviews improve fairness.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match interview type → goal:",
            "pairs": [
              { "left": "Technical interview", "right": "Assess job-specific hard skills" },
              { "left": "Behavioral interview", "right": "Evaluate past performance and soft skills" },
              { "left": "Culture-fit chat", "right": "Assess alignment with company values" },
              { "left": "Panel interview", "right": "Gather diverse perspectives" },
              { "left": "Case study", "right": "Simulate real-world problem-solving" }
            ],
            "explanation": "Different formats validate different competencies."
          },
          "stage": 2
        },
        {
          "index": 7,
          "kind": "task",
          "role": "Talent Acquisition Specialist",
          "title": "Candidate experience improvement",
          "summary_md": "Your task: Choose how to improve candidate experience\n\nGoal: Reduce drop-offs and improve brand perception\n\nContext: Feedback shows slow communication\n\nConstraints: Pick best solution",
          "hint_md": "Speed and transparency matter most.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "What's the most impactful fix?",
            "options": [
              "Add weekly automated updates",
              "Shorten response times to under 48 hours and communicate status clearly",
              "Ignore the feedback for now",
              "Add more interview rounds"
            ],
            "correct_answer": 1,
            "explanation": "Timely, transparent updates directly enhance candidate experience."
          },
          "stage": 2
        },
        {
          "index": 8,
          "kind": "task",
          "role": "Talent Acquisition Specialist",
          "title": "Employer branding alignment",
          "summary_md": "Your task: Match branding channel to content\n\nGoal: Strengthen employer reputation\n\nContext: Updating online presence\n\nConstraints: Drag platform → best content type",
          "hint_md": "Different audiences live on different platforms.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match platform → content type:",
            "pairs": [
              { "left": "LinkedIn", "right": "Employee stories & leadership posts" },
              { "left": "Instagram", "right": "Office culture visuals & events" },
              { "left": "Glassdoor", "right": "Employee reviews & responses" },
              { "left": "YouTube", "right": "Behind-the-scenes company videos" },
              { "left": "Company blog", "right": "In-depth career development articles" }
            ],
            "explanation": "Each channel caters to a unique stage of candidate perception."
          },
          "stage": 2
        },
        {
          "index": 9,
          "kind": "task",
          "role": "Talent Acquisition Specialist",
          "title": "Diversity hiring practice",
          "summary_md": "Your task: Choose the best inclusive hiring step\n\nGoal: Increase representation fairly\n\nContext: Company wants more diverse hiring\n\nConstraints: Pick the best initiative",
          "hint_md": "Equity starts with process design.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Which step drives impact?",
            "options": [
              "Set diversity quotas only",
              "Use structured interviews, diverse panels, and anonymized resume reviews",
              "Rely on referrals only",
              "Skip demographic questions entirely"
            ],
            "correct_answer": 1,
            "explanation": "Structured, bias-reduced practices improve fairness sustainably."
          },
          "stage": 2
        },
        {
          "index": 10,
          "kind": "task",
          "role": "Talent Acquisition Specialist",
          "title": "Data-driven hiring decisions",
          "summary_md": "Your task: Pick the most valuable metric for scaling recruitment\n\nGoal: Use analytics for decision-making\n\nContext: Hiring volume doubles next quarter\n\nConstraints: Select the right focus metric",
          "hint_md": "Think efficiency and quality together.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Which metric helps most?",
            "options": [
              "Total applicants",
              "Time-to-fill and quality-of-hire combined",
              "Number of LinkedIn posts",
              "Average recruiter age"
            ],
            "correct_answer": 1,
            "explanation": "Balancing speed and quality ensures sustainable scaling."
          },
          "stage": 3
        },
        {
          "index": 11,
          "kind": "task",
          "role": "Talent Acquisition Specialist",
          "title": "Match recruiting tech to workflow",
          "summary_md": "Your task: Connect tools with their best function\n\nGoal: Optimize tech stack",
          "hint_md": "Think automation, sourcing, and analytics.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match tool → purpose:",
            "pairs": [
              { "left": "LinkedIn Recruiter", "right": "Candidate sourcing" },
              { "left": "Greenhouse", "right": "Applicant tracking" },
              { "left": "Calendly", "right": "Interview scheduling" },
              { "left": "Gem", "right": "Pipeline analytics & outreach automation" },
              { "left": "ChatGPT / AI Assistants", "right": "Job description drafting / candidate messaging" }
            ],
            "explanation": "Modern recruiting uses integrated automation and analytics tools."
          },
          "stage": 3
        },
        {
          "index": 12,
          "kind": "task",
          "role": "Talent Acquisition Specialist",
          "title": "Negotiation strategy",
          "summary_md": "Your task: Choose best approach to closing a candidate\n\nGoal: Secure top talent ethically\n\nContext: Candidate has a competing offer\n\nConstraints: Pick best response",
          "hint_md": "Transparency builds trust and long-term success.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "What's the best approach?",
            "options": [
              "Pressure the candidate to decide immediately",
              "Highlight non-monetary benefits and clarify decision timeline transparently",
              "Ignore the competing offer",
              "Withdraw the offer"
            ],
            "correct_answer": 1,
            "explanation": "Transparent communication keeps credibility while reinforcing value."
          },
          "stage": 3
        },
        {
          "index": 13,
          "kind": "task",
          "role": "Talent Acquisition Specialist",
          "title": "Match candidate feedback to improvement area",
          "summary_md": "Your task: Interpret survey feedback to optimize recruitment",
          "hint_md": "Use feedback loops for continuous improvement.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match feedback → improvement:",
            "pairs": [
              { "left": "\"Too many interview rounds\"", "right": "Simplify process / consolidate stages" },
              { "left": "\"Never heard back\"", "right": "Implement automated status updates" },
              { "left": "\"Confusing job title\"", "right": "Clarify postings and career paths" },
              { "left": "\"Unclear feedback\"", "right": "Train hiring managers for debrief quality" },
              { "left": "\"Took too long to get offer\"", "right": "Streamline approvals" }
            ],
            "explanation": "Mapping feedback to actions drives measurable improvements."
          },
          "stage": 3
        },
        {
          "index": 14,
          "kind": "task",
          "role": "Talent Acquisition Specialist",
          "title": "Future of recruiting",
          "summary_md": "Your task: Predict emerging recruiting trends\n\nGoal: Anticipate the next wave of talent strategies\n\nContext: Planning next year's hiring roadmap\n\nConstraints: Choose the most realistic upcoming trend",
          "hint_md": "AI + human empathy = the future.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Which trend will define recruiting in 2026?",
            "options": [
              "Full automation without recruiters",
              "AI-assisted sourcing with personalized human outreach",
              "Eliminating interviews",
              "Hiring based only on academic degrees"
            ],
            "correct_answer": 1,
            "explanation": "AI tools enhance efficiency, but human judgment remains essential."
          },
          "stage": 3
        }
      ]$json_steps$::jsonb,
      $json_rubric$[
        "Sources and screens candidates effectively",
        "Uses data and tools to optimize hiring funnels",
        "Communicates employer value clearly",
        "Balances speed, quality, and candidate experience",
        "Builds trust with hiring managers and candidates"
      ]$json_rubric$::jsonb,
      $json_role_info${
        "overview": "Talent Acquisition Specialists identify, attract, and hire top talent that aligns with organizational goals. In 2025, they leverage AI sourcing tools, employer branding, and data-driven recruitment strategies to fill roles faster and improve candidate experience in a competitive market.",
        "careerPath": [
          "Recruitment Coordinator → Talent Acquisition Specialist (1–2 years)",
          "Talent Acquisition Specialist → Senior Recruiter (2–3 years)",
          "Senior Recruiter → Talent Acquisition Manager (2–4 years)",
          "Manager → Head of Talent / People Partner / HR Director (4–6+ years)"
        ],
        "salaryRange": "Entry EU: €35k–€50k; US: $55k–$75k.\nMid EU: €50k–€80k; US: $75k–$110k.\nSenior EU: €80k–€120k+; US: $110k–$150k+.\nCommission and bonuses often add 10–30%.",
        "industries": [
          "Technology & SaaS",
          "Finance & Banking",
          "Consulting",
          "Healthcare",
          "Manufacturing",
          "Retail",
          "Education",
          "Government & Nonprofits"
        ],
        "growthOutlook": "Recruiting remains vital even as AI automates screening and outreach. Specialists who excel at relationship-building, storytelling, and data literacy are in high demand as talent competition intensifies globally.",
        "education": "Commonly BA/BS in Human Resources, Business, or Psychology. Alternative paths: recruiting bootcamps, LinkedIn Talent certifications, agency experience, or HR apprenticeships.",
        "personalityTraits": [
          "Empathetic communicator",
          "Organized multitasker",
          "Goal-oriented",
          "Persuasive and resilient",
          "Data-informed decision-maker"
        ]
      }$json_role_info$::jsonb,
      true
    );

    RAISE NOTICE 'Successfully created Talent Acquisition Specialist simulation with slug: %', existing_slug;
  ELSE
    RAISE NOTICE 'Simulation with slug "%" already exists. Skipping insertion.', existing_slug;
  END IF;
END $$;

