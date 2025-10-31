-- Migration: Import Data Scientist simulation
-- Description: Adds the Data Scientist simulation with steps, rubric, and role_info

DO $$
DECLARE
  existing_slug TEXT := 'data-scientist-data-decisions';
  sim_id UUID;
BEGIN
  -- Check if simulation already exists
  SELECT id INTO sim_id FROM simulations WHERE slug = existing_slug;

  IF sim_id IS NULL THEN
    -- Insert the new simulation
    INSERT INTO simulations (slug, title, steps, rubric, role_info, active) VALUES (
      existing_slug,
      'Data Scientist: From data to decisions',
      $json_steps$[
        {
          "index": 0,
          "kind": "task",
          "role": "Data Scientist",
          "title": "Define the problem correctly",
          "summary_md": "Your task: Identify the correct analytical goal\n\nGoal: Translate a business problem into a data question\n\nContext: Marketing wants to \"analyze churn\"\n\nConstraints: Choose the best framing\n\nDeliverable: Problem definition",
          "hint_md": "Clarify the prediction target and metric before modeling.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Which question defines the problem best?",
            "options": [
              "\"Why do people cancel?\"",
              "\"Can we predict which customers are likely to churn next month?\"",
              "\"How many users do we have?\"",
              "\"How to increase downloads?\""
            ],
            "correct_answer": 1,
            "explanation": "A predictive question specifies a measurable target variable and time horizon."
          },
          "stage": 1
        },
        {
          "index": 1,
          "kind": "task",
          "role": "Data Scientist",
          "title": "Match data type to storage format",
          "summary_md": "Your task: Match data type with the optimal storage\n\nGoal: Demonstrate understanding of data engineering basics\n\nContext: You're designing a dataset pipeline\n\nConstraints: Drag data type to best storage option",
          "hint_md": "Think structure, query pattern, and scale.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match data type → storage:",
            "pairs": [
              { "left": "User logs", "right": "Data lake (Parquet/JSON)" },
              { "left": "Transactional data", "right": "Relational DB (PostgreSQL/MySQL)" },
              { "left": "Images", "right": "Object storage (S3/GCS)" },
              { "left": "Stream events", "right": "Kafka topic" },
              { "left": "Aggregated KPIs", "right": "Data warehouse (BigQuery/Snowflake)" }
            ],
            "explanation": "Each storage system suits specific structure and access patterns."
          },
          "stage": 1
        },
        {
          "index": 2,
          "kind": "task",
          "role": "Data Scientist",
          "title": "Handle missing data",
          "summary_md": "Your task: Choose the correct strategy for missing data\n\nGoal: Maintain data integrity\n\nContext: 10% of user ages are missing\n\nConstraints: Pick the best approach\n\nDeliverable: Chosen imputation method",
          "hint_md": "Balance accuracy vs. bias.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "What should you do?",
            "options": [
              "Drop all missing rows",
              "Replace missing ages with mean value",
              "Impute using median or predictive model based on correlated features",
              "Leave missing values untouched"
            ],
            "correct_answer": 2,
            "explanation": "Predictive or median imputation minimizes bias while preserving data volume."
          },
          "stage": 1
        },
        {
          "index": 3,
          "kind": "task",
          "role": "Data Scientist",
          "title": "Match feature type to transformation",
          "summary_md": "Your task: Match feature type with its preprocessing method\n\nGoal: Prepare data for ML models\n\nContext: You're preprocessing input variables\n\nConstraints: Drag type → transformation",
          "hint_md": "Numerical ≠ categorical; scaling matters.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match feature → transformation:",
            "pairs": [
              { "left": "Numeric (age, income)", "right": "Normalization / StandardScaler" },
              { "left": "Categorical (city)", "right": "One-hot encoding" },
              { "left": "Date/time", "right": "Extract components (day, month)" },
              { "left": "Text", "right": "TF-IDF / embeddings" },
              { "left": "Boolean", "right": "Binary encoding" }
            ],
            "explanation": "Proper encoding ensures compatibility with ML algorithms."
          },
          "stage": 1
        },
        {
          "index": 4,
          "kind": "task",
          "role": "Data Scientist",
          "title": "Exploratory Data Analysis (EDA)",
          "summary_md": "Your task: Identify the best visualization for numeric distributions\n\nGoal: Reveal patterns and outliers\n\nContext: Analyzing continuous variables\n\nConstraints: Choose the visualization type",
          "hint_md": "Histograms show distributions; scatter plots show relationships.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Which plot best fits?",
            "options": [
              "Bar chart",
              "Histogram",
              "Pie chart",
              "Boxplot"
            ],
            "correct_answer": 1,
            "explanation": "Histograms show frequency distribution of continuous variables."
          },
          "stage": 1
        },
        {
          "index": 5,
          "kind": "task",
          "role": "Data Scientist",
          "title": "Model selection basics",
          "summary_md": "Your task: Choose the right model type\n\nGoal: Match problem type to algorithm\n\nContext: Predicting customer churn (yes/no)\n\nConstraints: Select the correct model family",
          "hint_md": "Binary classification problem.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Which algorithm fits best?",
            "options": [
              "Linear Regression",
              "Logistic Regression",
              "K-Means Clustering",
              "PCA"
            ],
            "correct_answer": 1,
            "explanation": "Logistic regression handles binary classification tasks."
          },
          "stage": 2
        },
        {
          "index": 6,
          "kind": "task",
          "role": "Data Scientist",
          "title": "Match metric to model type",
          "summary_md": "Your task: Connect evaluation metrics to ML problems\n\nGoal: Choose the right metric\n\nContext: You're comparing models\n\nConstraints: Drag each metric to use case",
          "hint_md": "Classification ≠ Regression.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match metric → problem:",
            "pairs": [
              { "left": "Accuracy", "right": "Classification" },
              { "left": "Precision/Recall", "right": "Imbalanced classification" },
              { "left": "RMSE", "right": "Regression" },
              { "left": "AUC", "right": "Binary classification ranking" },
              { "left": "Silhouette score", "right": "Clustering" }
            ],
            "explanation": "Metrics must align with model output and business goal."
          },
          "stage": 2
        },
        {
          "index": 7,
          "kind": "task",
          "role": "Data Scientist",
          "title": "Cross-validation choices",
          "summary_md": "Your task: Select the best validation technique\n\nGoal: Avoid overfitting\n\nContext: Dataset has 10,000 samples\n\nConstraints: Choose the correct validation method",
          "hint_md": "Balance bias and variance.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Which method is best?",
            "options": [
              "Train/test split 50/50",
              "K-Fold cross-validation",
              "Use all data for training",
              "Random sampling without validation"
            ],
            "correct_answer": 1,
            "explanation": "K-Fold gives robust estimates of model performance."
          },
          "stage": 2
        },
        {
          "index": 8,
          "kind": "task",
          "role": "Data Scientist",
          "title": "Feature importance interpretation",
          "summary_md": "Your task: Match model to correct feature importance method\n\nGoal: Explain model behavior\n\nContext: Comparing interpretability tools\n\nConstraints: Drag each method to model type",
          "hint_md": "Tree-based vs linear vs black-box.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match model → interpretation:",
            "pairs": [
              { "left": "Linear Regression", "right": "Coefficient weights" },
              { "left": "Random Forest", "right": "Gini importance / permutation importance" },
              { "left": "Neural Network", "right": "SHAP / LIME explanations" },
              { "left": "Gradient Boosting", "right": "Gain-based importance" },
              { "left": "KNN", "right": "Feature distance sensitivity analysis" }
            ],
            "explanation": "Each interpretability method depends on the model structure."
          },
          "stage": 2
        },
        {
          "index": 9,
          "kind": "task",
          "role": "Data Scientist",
          "title": "Communicating insights",
          "summary_md": "Your task: Choose the clearest communication method\n\nGoal: Translate analytics for executives\n\nContext: Stakeholders ask 'So what?'\n\nConstraints: Pick the best approach",
          "hint_md": "Clarity > complexity.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "What should you deliver?",
            "options": [
              "Full Python notebook",
              "Slide deck with key insights, visuals, and business implications",
              "Raw CSV data",
              "Detailed regression outputs only"
            ],
            "correct_answer": 1,
            "explanation": "Effective storytelling connects data to decisions, not code."
          },
          "stage": 2
        },
        {
          "index": 10,
          "kind": "task",
          "role": "Data Scientist",
          "title": "Bias and fairness audit",
          "summary_md": "Your task: Identify bias mitigation method\n\nGoal: Build ethical, robust models\n\nContext: Loan approval model favors one demographic\n\nConstraints: Choose best response",
          "hint_md": "Address bias during both data prep and evaluation.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "What should you do?",
            "options": [
              "Ignore it, model is accurate",
              "Collect more balanced data and reweight training samples",
              "Hide the biased feature only",
              "Add noise to results"
            ],
            "correct_answer": 1,
            "explanation": "Rebalancing and fairness-aware metrics address bias effectively."
          },
          "stage": 3
        },
        {
          "index": 11,
          "kind": "task",
          "role": "Data Scientist",
          "title": "Match ML task to technique",
          "summary_md": "Your task: Match problem to the right ML approach\n\nGoal: Demonstrate advanced model selection",
          "hint_md": "Supervised vs unsupervised vs reinforcement.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match problem → technique:",
            "pairs": [
              { "left": "Anomaly detection", "right": "Unsupervised learning (Isolation Forest)" },
              { "left": "Product recommendations", "right": "Collaborative filtering" },
              { "left": "Fraud prediction", "right": "Supervised classification" },
              { "left": "Customer segmentation", "right": "Clustering (K-Means)" },
              { "left": "Ad spend optimization", "right": "Reinforcement learning" }
            ],
            "explanation": "Each ML approach aligns with data labeling and objective type."
          },
          "stage": 3
        },
        {
          "index": 12,
          "kind": "task",
          "role": "Data Scientist",
          "title": "Experiment tracking",
          "summary_md": "Your task: Choose the best tool for reproducibility\n\nGoal: Track ML experiments\n\nContext: Multiple models under test\n\nConstraints: Pick best tool",
          "hint_md": "Version control extends beyond code.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Which tool helps most?",
            "options": [
              "Git only",
              "MLflow / Weights & Biases",
              "Google Sheets",
              "Email updates"
            ],
            "correct_answer": 1,
            "explanation": "MLflow/W&B manage parameters, metrics, and artifacts."
          },
          "stage": 3
        },
        {
          "index": 13,
          "kind": "task",
          "role": "Data Scientist",
          "title": "Match visualization to insight type",
          "summary_md": "Your task: Match data insight to visualization type\n\nGoal: Present advanced insights clearly",
          "hint_md": "Use storytelling visuals.",
          "expected_input": {
            "type": "drag_drop",
            "question": "Match insight → visualization:",
            "pairs": [
              { "left": "Correlation matrix", "right": "Heatmap" },
              { "left": "Feature importance", "right": "Bar chart" },
              { "left": "Trend over time", "right": "Line chart" },
              { "left": "Class distribution", "right": "Histogram" },
              { "left": "Model comparison", "right": "Boxplot or ROC curve" }
            ],
            "explanation": "Effective visualization depends on data relationship and audience."
          },
          "stage": 3
        },
        {
          "index": 14,
          "kind": "task",
          "role": "Data Scientist",
          "title": "Deploying models to production",
          "summary_md": "Your task: Select the correct deployment strategy\n\nGoal: Ensure stability and monitoring\n\nContext: Your churn model is ready to go live\n\nConstraints: Choose the best path",
          "hint_md": "Think versioning, latency, and monitoring.",
          "expected_input": {
            "type": "multiple_choice",
            "question": "Which deployment plan is best?",
            "options": [
              "Manual API calls via notebooks",
              "Deploy as REST API with model registry, versioning, and monitoring for drift",
              "Send model file to engineering team",
              "Run predictions locally every week"
            ],
            "correct_answer": 1,
            "explanation": "Productionized models require reliable APIs and continuous monitoring."
          },
          "stage": 3
        }
      ]$json_steps$::jsonb,
      $json_rubric$[
        "Cleans and structures data effectively",
        "Builds and validates predictive models",
        "Interprets results into business insight",
        "Understands metrics, bias, and causality",
        "Communicates findings clearly to stakeholders"
      ]$json_rubric$::jsonb,
      $json_role_info${
        "overview": "Data Scientists transform raw data into insights that guide strategic and operational decisions. In 2025, they play a pivotal role in shaping AI systems, predictive models, and data-driven products that fuel growth and innovation across industries.",
        "careerPath": [
          "Data Analyst → Junior Data Scientist (1–2 years)",
          "Data Scientist → Senior Data Scientist (2–3 years)",
          "Senior Data Scientist → Lead Data Scientist / ML Engineer (3–5 years)",
          "Lead → Head of Data / Director of AI (5–8+ years)"
        ],
        "salaryRange": "Entry EU: €50k–€75k; US: $85k–$115k.\nMid EU: €75k–€110k; US: $115k–$160k.\nSenior EU: €110k–€160k+; US: $160k–$220k+.\nCompensation rises further in AI-focused sectors.",
        "industries": [
          "Technology & SaaS",
          "Finance & Fintech",
          "Healthcare & Biotech",
          "Retail & E-commerce",
          "Energy & Sustainability",
          "Manufacturing",
          "Telecommunications",
          "Media & Entertainment"
        ],
        "growthOutlook": "Explosive demand continues through 2030 as AI adoption accelerates. Automation supports rather than replaces data scientists—those combining technical depth with domain intuition remain in short supply.",
        "education": "Typically MSc or PhD in Data Science, Statistics, Computer Science, or Engineering. Alternatives: data bootcamps, Kaggle projects, open-source contributions, and strong Python/SQL/ML portfolios.",
        "personalityTraits": [
          "Curious and analytical",
          "Detail-oriented",
          "Strong communicator",
          "Problem-solver",
          "Comfortable with ambiguity"
        ]
      }$json_role_info$::jsonb,
      true
    );

    RAISE NOTICE 'Successfully created Data Scientist simulation with slug: %', existing_slug;
  ELSE
    RAISE NOTICE 'Simulation with slug "%" already exists. Skipping insertion.', existing_slug;
  END IF;
END $$;

