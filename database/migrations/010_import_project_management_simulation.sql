-- Import Project Management Simulation
-- This script imports the project-management-simulation.json into the database
-- Run this script with: psql -h [host] -U [user] -d [database] -f 010_import_project_management_simulation.sql
-- Or copy and paste into Supabase SQL Editor

-- Check if simulation already exists
DO $$
DECLARE
  existing_slug TEXT := 'project-management-simulation';
  sim_exists BOOLEAN;
BEGIN
  -- Check if simulation with this slug already exists
  SELECT EXISTS(SELECT 1 FROM simulations WHERE slug = existing_slug) INTO sim_exists;
  
  IF sim_exists THEN
    RAISE NOTICE 'Simulation with slug "%" already exists. Skipping insertion.', existing_slug;
    RAISE NOTICE 'To update it, use: UPDATE simulations SET ... WHERE slug = ''%'';', existing_slug;
  ELSE
    -- Insert the Project Management simulation
    -- Using dollar-quoted strings to avoid quote escaping issues
    INSERT INTO simulations (slug, title, steps, rubric, active) VALUES (
      'project-management-simulation',
      'Project Management',
      $json_steps$[
        {
          "index": 0,
          "kind": "task",
          "role": "Project Manager",
          "title": "Identify the project constraint triangle components",
          "summary_md": "**Your task:** Answer this Project Manager question\n\n**Goal:** Test your knowledge of project management fundamentals\n\n**Context:** You're mentoring a new team member about core project constraints\n\n**Constraints:** Select the most accurate set of components\n\n**Deliverable:** Your selected answer\n\n**Tips:** Think about what factors a Project Manager must always balance",
          "hint_md": "Focus on what every project must manage in relation to each other.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Which of the following represents the classic project constraint triangle?",
            "options": [
              "Scope, Cost, and Time",
              "Quality, Budget, and Communication",
              "Resources, Risks, and Stakeholders",
              "Schedule, People, and Procurement"
            ],
            "correct_answer": 0,
            "explanation": "Scope, Cost, and Time form the classic 'Iron Triangle' — altering one affects the others."
          },
          "stage": 1
        },
        {
          "index": 1,
          "kind": "task",
          "role": "Project Manager",
          "title": "Match key project documents with their purpose",
          "summary_md": "**Your task:** Match each Project Management document with its correct purpose\n\n**Goal:** Demonstrate understanding of key project artifacts\n\n**Context:** You're organizing your project documentation for a kickoff\n\n**Constraints:** Drag each item to its correct match\n\n**Deliverable:** All pairs correctly matched\n\n**Tips:** Recall what each document is primarily used for",
          "hint_md": "Think about which document defines, tracks, or reports progress.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match each document with its purpose:",
            "pairs": [
              {"left": "Project Charter", "right": "Authorizes the project and names the project manager"},
              {"left": "Risk Register", "right": "Lists identified risks with their impact and mitigation plan"},
              {"left": "Project Plan", "right": "Outlines how the project will be executed and monitored"},
              {"left": "Stakeholder Register", "right": "Identifies stakeholders and their interests"},
              {"left": "Issue Log", "right": "Tracks ongoing project problems requiring resolution"}
            ],
            "explanation": "Each document serves a distinct purpose in managing scope, risk, and communication."
          },
          "stage": 1
        },
        {
          "index": 2,
          "kind": "task",
          "role": "Project Manager",
          "title": "Select the best communication approach",
          "summary_md": "**Your task:** Choose the most effective communication approach\n\n**Goal:** Test your understanding of communication planning\n\n**Context:** You're managing a distributed Agile team across three time zones\n\n**Constraints:** Select the most suitable communication method\n\n**Deliverable:** Your selected answer\n\n**Tips:** Consider efficiency and accessibility",
          "hint_md": "Think about asynchronous tools and minimizing meeting fatigue.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Which communication approach works best for a distributed Agile team?",
            "options": [
              "Daily 2-hour video calls for all members",
              "Weekly all-hands meetings and long reports",
              "Async updates via shared tools with short daily standups",
              "Relying on one team lead to summarize progress weekly"
            ],
            "correct_answer": 2,
            "explanation": "Async updates with short standups maintain alignment and flexibility across time zones."
          },
          "stage": 1
        },
        {
          "index": 3,
          "kind": "task",
          "role": "Project Manager",
          "title": "Match PMBOK process groups with activities",
          "summary_md": "**Your task:** Match each process group with the related activity\n\n**Goal:** Understand PMBOK process alignment\n\n**Context:** You're preparing for a client's audit of your project management process\n\n**Constraints:** Drag and match correctly\n\n**Deliverable:** All matches accurate\n\n**Tips:** Think about the project life cycle flow",
          "hint_md": "Link each group to what happens during that phase.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match PMBOK process groups to typical activities:",
            "pairs": [
              {"left": "Initiating", "right": "Defining the project and getting approval"},
              {"left": "Planning", "right": "Developing the project management plan"},
              {"left": "Executing", "right": "Coordinating people and resources"},
              {"left": "Monitoring & Controlling", "right": "Tracking and managing project performance"},
              {"left": "Closing", "right": "Formalizing acceptance and ending the project"}
            ],
            "explanation": "These process groups define the structure for managing projects under PMBOK."
          },
          "stage": 1
        },
        {
          "index": 4,
          "kind": "task",
          "role": "Project Manager",
          "title": "Choose the correct project phase sequence",
          "summary_md": "**Your task:** Identify the correct project lifecycle order\n\n**Goal:** Validate your understanding of project flow\n\n**Context:** You're planning to brief stakeholders on project progress\n\n**Constraints:** Select the correct chronological order\n\n**Deliverable:** Your selected answer",
          "hint_md": "Think of how projects evolve from concept to delivery.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "What is the correct order of standard project phases?",
            "options": [
              "Initiation → Execution → Planning → Closing",
              "Planning → Initiation → Execution → Closing",
              "Initiation → Planning → Execution → Closing",
              "Execution → Initiation → Planning → Closing"
            ],
            "correct_answer": 2,
            "explanation": "Projects begin with Initiation, followed by Planning, Execution, and finally Closing."
          },
          "stage": 1
        },
        {
          "index": 5,
          "kind": "task",
          "role": "Project Manager",
          "title": "Determine stakeholder priority",
          "summary_md": "**Your task:** Choose how to manage different stakeholder interests\n\n**Goal:** Evaluate prioritization and communication strategy\n\n**Context:** A powerful executive demands weekly updates, while your key user asks for more frequent demos\n\n**Constraints:** Pick the best stakeholder management action\n\n**Deliverable:** Your selected answer",
          "hint_md": "Balance influence and interest carefully.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "How should you prioritize stakeholders?",
            "options": [
              "Focus equally on all stakeholders",
              "Engage most with high-influence, high-interest stakeholders",
              "Ignore stakeholders with conflicting requests",
              "Prioritize by whoever contacts you most often"
            ],
            "correct_answer": 1,
            "explanation": "High-influence, high-interest stakeholders require proactive engagement to ensure project success."
          },
          "stage": 2
        },
        {
          "index": 6,
          "kind": "task",
          "role": "Project Manager",
          "title": "Match Agile ceremonies with their goals",
          "summary_md": "**Your task:** Match each Agile ceremony with its purpose\n\n**Goal:** Demonstrate understanding of Scrum events\n\n**Context:** You're guiding a new Scrum Master through sprint planning\n\n**Constraints:** Drag and match all correctly\n\n**Deliverable:** Complete matches",
          "hint_md": "Think about what each meeting achieves in Scrum.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match each Agile ceremony to its primary goal:",
            "pairs": [
              {"left": "Sprint Planning", "right": "Define what will be delivered in the sprint"},
              {"left": "Daily Standup", "right": "Synchronize the team's work and identify blockers"},
              {"left": "Sprint Review", "right": "Show completed work to stakeholders"},
              {"left": "Sprint Retrospective", "right": "Reflect on process and plan improvements"},
              {"left": "Backlog Refinement", "right": "Clarify and estimate upcoming work items"}
            ],
            "explanation": "Each ceremony supports transparency and continuous improvement in Agile delivery."
          },
          "stage": 2
        },
        {
          "index": 7,
          "kind": "task",
          "role": "Project Manager",
          "title": "Select the correct risk response strategy",
          "summary_md": "**Your task:** Identify the correct risk management strategy\n\n**Goal:** Test your ability to respond to project risks\n\n**Context:** Your vendor may delay delivery by two weeks\n\n**Constraints:** Select the most appropriate response\n\n**Deliverable:** Your selected answer",
          "hint_md": "Consider actions that reduce the likelihood or impact.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "What is the best response to a likely vendor delay?",
            "options": [
              "Ignore it and hope the vendor recovers",
              "Develop a backup vendor and adjust the schedule",
              "Cancel the contract immediately",
              "Reduce scope to match vendor's pace without communication"
            ],
            "correct_answer": 1,
            "explanation": "Developing contingency plans and adjusting timelines minimizes project impact."
          },
          "stage": 2
        },
        {
          "index": 8,
          "kind": "task",
          "role": "Project Manager",
          "title": "Match tools to project monitoring functions",
          "summary_md": "**Your task:** Match common PM tools to their primary use\n\n**Goal:** Demonstrate familiarity with tool categories\n\n**Context:** You're setting up dashboards for project tracking\n\n**Constraints:** Drag and match correctly\n\n**Deliverable:** All pairs correct",
          "hint_md": "Think of what data each tool is best suited for.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match each tool to its project monitoring function:",
            "pairs": [
              {"left": "JIRA", "right": "Track sprint progress and issues"},
              {"left": "Trello", "right": "Visualize workflow using Kanban"},
              {"left": "Microsoft Project", "right": "Manage timelines and dependencies"},
              {"left": "Asana", "right": "Assign and monitor team tasks"},
              {"left": "Power BI", "right": "Visualize performance metrics and KPIs"}
            ],
            "explanation": "Each tool supports a unique part of project planning and performance tracking."
          },
          "stage": 2
        },
        {
          "index": 9,
          "kind": "task",
          "role": "Project Manager",
          "title": "Identify the critical path adjustment",
          "summary_md": "**Your task:** Choose the correct way to shorten project duration\n\n**Goal:** Test your knowledge of schedule optimization\n\n**Context:** You need to finish the project earlier without increasing cost\n\n**Constraints:** Select the correct method\n\n**Deliverable:** Your selected answer",
          "hint_md": "Focus on tasks that affect the critical path directly.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Which technique helps reduce project duration without increasing cost?",
            "options": [
              "Fast tracking tasks on the critical path",
              "Adding more resources to every task",
              "Delaying non-critical tasks",
              "Eliminating quality assurance steps"
            ],
            "correct_answer": 0,
            "explanation": "Fast tracking allows overlapping critical tasks to reduce duration without extra cost."
          },
          "stage": 2
        },
        {
          "index": 10,
          "kind": "task",
          "role": "Project Manager",
          "title": "Select the best conflict resolution approach",
          "summary_md": "**Your task:** Choose the most effective conflict resolution method\n\n**Goal:** Evaluate leadership and communication under pressure\n\n**Context:** Two senior developers disagree on implementation approach\n\n**Constraints:** Pick the best leadership action\n\n**Deliverable:** Your selected answer",
          "hint_md": "Aim for a collaborative outcome, not authority-based control.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "How should you handle a technical conflict between senior developers?",
            "options": [
              "Impose your decision as the PM",
              "Facilitate discussion to reach a consensus",
              "Escalate to the client",
              "Ask another team for their vote"
            ],
            "correct_answer": 1,
            "explanation": "Facilitating a consensus builds trust and leverages expertise for optimal results."
          },
          "stage": 3
        },
        {
          "index": 11,
          "kind": "task",
          "role": "Project Manager",
          "title": "Match project closure activities with deliverables",
          "summary_md": "**Your task:** Match closure steps to their outcomes\n\n**Goal:** Understand project closure requirements\n\n**Context:** You're wrapping up a major project and need to ensure nothing is missed\n\n**Constraints:** Drag and match correctly\n\n**Deliverable:** Complete and accurate matches",
          "hint_md": "Focus on administrative and learning outcomes.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match closure activity with its expected deliverable:",
            "pairs": [
              {"left": "Obtain formal acceptance", "right": "Client sign-off on final deliverables"},
              {"left": "Release resources", "right": "Team members assigned to new projects"},
              {"left": "Archive documents", "right": "All project records stored for reference"},
              {"left": "Conduct lessons learned", "right": "Documented best practices and insights"},
              {"left": "Finalize contracts", "right": "All vendor obligations closed out"}
            ],
            "explanation": "Closure ensures all project obligations are met and lessons captured for future projects."
          },
          "stage": 3
        },
        {
          "index": 12,
          "kind": "task",
          "role": "Project Manager",
          "title": "Choose the best risk mitigation strategy for scope creep",
          "summary_md": "**Your task:** Select the optimal response to prevent scope creep\n\n**Goal:** Test your control and change management skills\n\n**Context:** A stakeholder keeps suggesting small, unapproved changes\n\n**Constraints:** Pick the best preventive measure\n\n**Deliverable:** Your selected answer",
          "hint_md": "Think of structured processes for handling change.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "What is the best way to prevent scope creep?",
            "options": [
              "Accept all changes to please stakeholders",
              "Implement a formal change control process",
              "Ignore change requests to maintain focus",
              "Track changes informally in chat messages"
            ],
            "correct_answer": 1,
            "explanation": "A formal change control process ensures alignment, documentation, and impact assessment."
          },
          "stage": 3
        },
        {
          "index": 13,
          "kind": "task",
          "role": "Project Manager",
          "title": "Match project performance metrics with their purpose",
          "summary_md": "**Your task:** Match each KPI to what it measures\n\n**Goal:** Demonstrate ability to interpret performance metrics\n\n**Context:** You're preparing an executive status report\n\n**Constraints:** Drag and match accurately\n\n**Deliverable:** All matches correct",
          "hint_md": "Consider what each metric tells you about project health.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match each metric with what it measures:",
            "pairs": [
              {"left": "Earned Value (EV)", "right": "Value of work actually completed"},
              {"left": "Planned Value (PV)", "right": "Value of work scheduled to be completed"},
              {"left": "Cost Variance (CV)", "right": "Difference between EV and Actual Cost"},
              {"left": "Schedule Variance (SV)", "right": "Difference between EV and PV"},
              {"left": "Cost Performance Index (CPI)", "right": "Efficiency of resource spending"}
            ],
            "explanation": "Understanding these metrics enables accurate project performance assessment."
          },
          "stage": 3
        },
        {
          "index": 14,
          "kind": "task",
          "role": "Project Manager",
          "title": "Select the best action when project budget overruns",
          "summary_md": "**Your task:** Choose the most effective corrective action\n\n**Goal:** Evaluate decision-making under budget pressure\n\n**Context:** Your project is 10% over budget midway through execution\n\n**Constraints:** Select the best corrective response\n\n**Deliverable:** Your selected answer",
          "hint_md": "Consider balancing cost control with project value.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "What should you do when your project is 10% over budget?",
            "options": [
              "Ignore the variance and continue as planned",
              "Reduce project quality immediately",
              "Analyze causes, reforecast budget, and communicate adjustments",
              "Request double funding from the sponsor"
            ],
            "correct_answer": 2,
            "explanation": "Reassessing the budget and communicating early ensures informed corrective action."
          },
          "stage": 3
        }
      ]$json_steps$::jsonb,
      $json_rubric$[
        "Effectively apply PMBOK and Agile frameworks to plan and execute projects",
        "Identify and mitigate project risks across lifecycle stages",
        "Prioritize tasks and resources for maximum delivery impact",
        "Communicate decisions and changes clearly to stakeholders",
        "Balance scope, time, cost, and quality trade-offs under constraints"
      ]$json_rubric$::jsonb,
      true
    );
    
    RAISE NOTICE 'Successfully imported Project Management simulation with slug: project-management-simulation';
  END IF;
END $$;
