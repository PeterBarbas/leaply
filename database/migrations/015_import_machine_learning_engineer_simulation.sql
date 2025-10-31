-- Migration: Import Machine Learning Engineer simulation
-- Description: Adds the Machine Learning Engineer simulation with steps, rubric, and role_info

DO $$
DECLARE
  existing_slug TEXT := 'machine-learning-engineer-production';
  sim_id UUID;
BEGIN
  -- Check if simulation already exists
  SELECT id INTO sim_id FROM simulations WHERE slug = existing_slug;

  IF sim_id IS NULL THEN
    -- Insert the new simulation
    INSERT INTO simulations (slug, title, steps, rubric, role_info, active) VALUES (
      existing_slug,
      'Machine Learning Engineer: From model to production',
      $json_steps$[
        {
          "index": 0,
          "kind": "task",
          "role": "Machine Learning Engineer",
          "title": "Identify the right ML pipeline stage",
          "summary_md": "Your task: Choose where the issue occurs in your ML pipeline\n\nGoal: Understand end-to-end ML workflows\n\nContext: Model accuracy dropped after deployment\n\nConstraints: Select which pipeline stage to investigate first\n\nDeliverable: Correct stage selection",
          "hint_md": "Model drift usually starts with data changes.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Which stage should you inspect first?",
            "options": [
              "Model architecture design",
              "Training hyperparameters",
              "Input data distribution and preprocessing",
              "Serving API latency"
            ],
            "correct_answer": 2,
            "explanation": "Changes in data distributions are the most common cause of drift."
          },
          "stage": 1
        },
        {
          "index": 1,
          "kind": "task",
          "role": "Machine Learning Engineer",
          "title": "Match task to ML technique",
          "summary_md": "Your task: Match common ML problems to their best approaches\n\nGoal: Apply the right model type\n\nContext: You're advising a product team\n\nConstraints: Drag each task to its model type",
          "hint_md": "Classification vs regression vs clustering vs RL.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match problem → approach:",
            "pairs": [
              { "left": "Spam detection", "right": "Binary classification" },
              { "left": "Sales forecasting", "right": "Regression" },
              { "left": "Customer segmentation", "right": "Clustering" },
              { "left": "Ad bidding optimization", "right": "Reinforcement learning" },
              { "left": "Product recommendations", "right": "Collaborative filtering" }
            ],
            "explanation": "Each ML task type requires a different modeling paradigm."
          },
          "stage": 1
        },
        {
          "index": 2,
          "kind": "task",
          "role": "Machine Learning Engineer",
          "title": "Feature engineering fundamentals",
          "summary_md": "Your task: Choose the most impactful feature engineering method\n\nGoal: Improve model input quality\n\nContext: You're building a price prediction model\n\nConstraints: Select the best technique",
          "hint_md": "Feature interactions often drive predictive power.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "What's the best next step?",
            "options": [
              "Use raw data as-is",
              "Create derived features like price per category or time since last purchase",
              "Increase model complexity",
              "Remove half of features randomly"
            ],
            "correct_answer": 1,
            "explanation": "Derived features capture deeper relationships improving accuracy."
          },
          "stage": 1
        },
        {
          "index": 3,
          "kind": "task",
          "role": "Machine Learning Engineer",
          "title": "Match ML framework to purpose",
          "summary_md": "Your task: Match frameworks with their primary uses\n\nGoal: Know your tools\n\nContext: You're setting up a new ML project\n\nConstraints: Drag framework → purpose",
          "hint_md": "Deep learning vs deployment vs experimentation.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match framework → purpose:",
            "pairs": [
              { "left": "TensorFlow", "right": "Deep learning / production-scale training" },
              { "left": "PyTorch", "right": "Research and rapid prototyping" },
              { "left": "scikit-learn", "right": "Classical ML / small datasets" },
              { "left": "MLflow", "right": "Experiment tracking / model registry" },
              { "left": "ONNX", "right": "Model portability / inference optimization" }
            ],
            "explanation": "Each library targets different workflow stages."
          },
          "stage": 1
        },
        {
          "index": 4,
          "kind": "task",
          "role": "Machine Learning Engineer",
          "title": "Choosing evaluation metrics",
          "summary_md": "Your task: Pick the right metric for the goal\n\nGoal: Align model performance with business value\n\nContext: Fraud detection with heavy class imbalance\n\nConstraints: Choose the best evaluation metric",
          "hint_md": "Accuracy can mislead in imbalanced datasets.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Which metric should you prioritize?",
            "options": [
              "Accuracy",
              "Precision and Recall",
              "Mean Squared Error",
              "R² Score"
            ],
            "correct_answer": 1,
            "explanation": "Precision and recall balance false positives and false negatives in imbalanced data."
          },
          "stage": 1
        },
        {
          "index": 5,
          "kind": "task",
          "role": "Machine Learning Engineer",
          "title": "Model deployment pattern",
          "summary_md": "Your task: Choose deployment strategy\n\nGoal: Ensure reliability at scale\n\nContext: Releasing a real-time recommendation model\n\nConstraints: Select the best deployment pattern",
          "hint_md": "Batch vs online depends on latency needs.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "What should you implement?",
            "options": [
              "Batch scoring overnight",
              "Online API inference with caching",
              "Manual CSV uploads",
              "Run model locally per user"
            ],
            "correct_answer": 1,
            "explanation": "Online API inference meets real-time user interaction needs."
          },
          "stage": 2
        },
        {
          "index": 6,
          "kind": "task",
          "role": "Machine Learning Engineer",
          "title": "Match MLOps component to function",
          "summary_md": "Your task: Connect MLOps tool to pipeline stage\n\nGoal: Understand modern AI infrastructure\n\nContext: You're automating ML delivery\n\nConstraints: Drag each tool to function",
          "hint_md": "Think: CI/CD for ML.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match tool → purpose:",
            "pairs": [
              { "left": "Kubeflow", "right": "Pipeline orchestration" },
              { "left": "DVC", "right": "Data version control" },
              { "left": "Seldon Core", "right": "Model serving and monitoring" },
              { "left": "Great Expectations", "right": "Data validation tests" },
              { "left": "Airflow", "right": "Workflow scheduling" }
            ],
            "explanation": "Each tool plays a role in reproducible ML pipelines."
          },
          "stage": 2
        },
        {
          "index": 7,
          "kind": "task",
          "role": "Machine Learning Engineer",
          "title": "Hyperparameter tuning",
          "summary_md": "Your task: Pick the best tuning approach\n\nGoal: Optimize performance efficiently\n\nContext: Your model underfits slightly\n\nConstraints: Choose optimal tuning method",
          "hint_md": "Think efficiency vs exploration.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Which tuning method works best?",
            "options": [
              "Grid search",
              "Random search",
              "Bayesian optimization",
              "Manual guesswork"
            ],
            "correct_answer": 2,
            "explanation": "Bayesian optimization balances exploration and performance efficiently."
          },
          "stage": 2
        },
        {
          "index": 8,
          "kind": "task",
          "role": "Machine Learning Engineer",
          "title": "Model versioning workflow",
          "summary_md": "Your task: Match artifact type to versioning method\n\nGoal: Keep reproducibility\n\nContext: You maintain multiple experiments\n\nConstraints: Drag artifact → versioning approach",
          "hint_md": "Code, data, and models all evolve separately.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match artifact → versioning method:",
            "pairs": [
              { "left": "Code", "right": "Git" },
              { "left": "Data", "right": "DVC / LakeFS" },
              { "left": "Model weights", "right": "MLflow registry" },
              { "left": "Experiments", "right": "Weights & Biases" },
              { "left": "APIs", "right": "Semantic versioning" }
            ],
            "explanation": "Proper version control ensures traceability across the pipeline."
          },
          "stage": 2
        },
        {
          "index": 9,
          "kind": "task",
          "role": "Machine Learning Engineer",
          "title": "Real-time monitoring",
          "summary_md": "Your task: Identify the best metric to monitor post-deployment\n\nGoal: Detect issues early\n\nContext: Your model is in production\n\nConstraints: Choose the key metric",
          "hint_md": "Latency, drift, and error metrics all matter.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Which metric matters most initially?",
            "options": [
              "Data drift and prediction distribution changes",
              "GPU temperature",
              "Training accuracy",
              "Developer count"
            ],
            "correct_answer": 0,
            "explanation": "Monitoring for drift ensures ongoing prediction validity."
          },
          "stage": 2
        },
        {
          "index": 10,
          "kind": "task",
          "role": "Machine Learning Engineer",
          "title": "Ethical AI considerations",
          "summary_md": "Your task: Identify a best practice for ethical ML\n\nGoal: Build responsible systems\n\nContext: Deploying an HR resume screening model\n\nConstraints: Choose the most ethical design step",
          "hint_md": "Fairness begins with data and transparency.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "What's the right action?",
            "options": [
              "Use demographic features to increase accuracy",
              "Run fairness audits and remove bias-correlated features",
              "Ignore bias for faster training",
              "Add random noise to outputs"
            ],
            "correct_answer": 1,
            "explanation": "Fairness audits reduce unintentional discrimination and improve trust."
          },
          "stage": 3
        },
        {
          "index": 11,
          "kind": "task",
          "role": "Machine Learning Engineer",
          "title": "Match deployment environment to requirement",
          "summary_md": "Your task: Pair environment with use case\n\nGoal: Optimize deployment performance",
          "hint_md": "Latency, cost, and scale guide environment choice.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match environment → use case:",
            "pairs": [
              { "left": "Edge device", "right": "Low-latency, offline inference" },
              { "left": "Cloud serverless", "right": "Event-driven workloads" },
              { "left": "GPU cluster", "right": "Heavy deep learning inference" },
              { "left": "On-prem", "right": "Strict data compliance" },
              { "left": "Browser", "right": "Client-side personalization" }
            ],
            "explanation": "Choosing the right environment ensures efficiency and compliance."
          },
          "stage": 3
        },
        {
          "index": 12,
          "kind": "task",
          "role": "Machine Learning Engineer",
          "title": "Model compression",
          "summary_md": "Your task: Select an optimization for deployment\n\nGoal: Reduce model latency and size\n\nContext: Running model on mobile\n\nConstraints: Pick best technique",
          "hint_md": "Tradeoff between accuracy and speed.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Which method helps most?",
            "options": [
              "Train a larger model",
              "Quantization or pruning",
              "Remove input validation",
              "Increase batch size infinitely"
            ],
            "correct_answer": 1,
            "explanation": "Quantization and pruning shrink models while maintaining performance."
          },
          "stage": 3
        },
        {
          "index": 13,
          "kind": "task",
          "role": "Machine Learning Engineer",
          "title": "Monitoring drift types",
          "summary_md": "Your task: Match drift type with example\n\nGoal: Detect model degradation early",
          "hint_md": "Input vs output vs concept drift.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match drift type → example:",
            "pairs": [
              { "left": "Data drift", "right": "Input feature distribution changes" },
              { "left": "Concept drift", "right": "Label relationship changes over time" },
              { "left": "Model drift", "right": "Degraded performance metric" },
              { "left": "Feature drift", "right": "New unseen categories in categorical column" },
              { "left": "Sensor drift", "right": "Hardware calibration affecting input values" }
            ],
            "explanation": "Different drift types require distinct monitoring strategies."
          },
          "stage": 3
        },
        {
          "index": 14,
          "kind": "task",
          "role": "Machine Learning Engineer",
          "title": "Post-deployment A/B testing",
          "summary_md": "Your task: Choose the best evaluation method post-launch\n\nGoal: Measure model uplift accurately\n\nContext: Comparing new vs old recommendation models\n\nConstraints: Pick the optimal test design",
          "hint_md": "Randomization and statistical power matter.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Which design is best?",
            "options": [
              "Shadow deployment with offline metrics only",
              "A/B test with randomized users and predefined success metric",
              "Switch all traffic to new model instantly",
              "Manual comparison by engineers"
            ],
            "correct_answer": 1,
            "explanation": "Controlled A/B tests quantify causal performance improvements safely."
          },
          "stage": 3
        }
      ]$json_steps$::jsonb,
      $json_rubric$[
        "Builds and optimizes ML models efficiently",
        "Implements scalable data pipelines and APIs",
        "Understands MLOps workflows",
        "Monitors models for drift and performance",
        "Applies ethical and secure AI practices"
      ]$json_rubric$::jsonb,
      $json_role_info${
        "overview": "Machine Learning Engineers (MLEs) design, build, and deploy AI systems that learn from data to make predictions or automate decisions. In 2025, they bridge research and production—turning models into scalable, reliable, and ethical applications powering every modern product.",
        "careerPath": [
          "Data Scientist → Junior ML Engineer (1–2 years)",
          "ML Engineer → Senior ML Engineer (2–4 years)",
          "Senior ML Engineer → Lead/Applied AI Engineer (3–5 years)",
          "Lead → ML Architect / Head of AI / Director of ML (5–8+ years)"
        ],
        "salaryRange": "Entry EU: €60k–€85k; US: $100k–$140k.\nMid EU: €85k–€120k; US: $140k–$190k.\nSenior EU: €120k–€170k+; US: $190k–$260k+.\nComp grows faster in top AI and Big Tech firms.",
        "industries": [
          "Technology & SaaS",
          "Autonomous Systems",
          "Healthcare & Biotech",
          "Finance & Fintech",
          "Manufacturing & Robotics",
          "Retail & E-commerce",
          "Energy & Climate Tech",
          "Media & Gaming"
        ],
        "growthOutlook": "Demand skyrockets with GenAI, MLOps, and on-device AI. While low-code AI tools rise, skilled engineers who optimize models for performance, cost, and ethics remain irreplaceable.",
        "education": "Typically MSc/PhD in Computer Science, Data Science, or AI/Robotics. Alternatives: ML bootcamps, open-source contributions, Kaggle projects, and practical deployment experience (TensorFlow/PyTorch).",
        "personalityTraits": [
          "Systematic problem-solver",
          "Experimental mindset",
          "Strong in math and coding",
          "Collaborative with researchers and engineers",
          "Ethically conscious"
        ]
      }$json_role_info$::jsonb,
      true
    );

    RAISE NOTICE 'Successfully created Machine Learning Engineer simulation with slug: %', existing_slug;
  ELSE
    RAISE NOTICE 'Simulation with slug "%" already exists. Skipping insertion.', existing_slug;
  END IF;
END $$;

