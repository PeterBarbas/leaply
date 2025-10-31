DO $$
DECLARE
  target_slug TEXT := 'project-management-simulation';
  sim_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM simulations WHERE slug = target_slug) INTO sim_exists;

  IF NOT sim_exists THEN
    RAISE NOTICE 'Simulation with slug "%" not found. Skipping update.', target_slug;
    RETURN;
  END IF;

  UPDATE simulations
  SET role_info = $json$
  {
    "overview": "Project Managers oversee the planning, execution, and delivery of projects to ensure they meet goals within scope, time, and budget. In 2025, they remain vital as organizations juggle hybrid work, digital transformation, and sustainability initiatives requiring strong coordination and leadership across distributed teams.",
    "careerPath": [
      "Project Coordinator → Project Manager (2–3 years)",
      "Project Manager → Senior Project Manager (3–5 years)",
      "Senior Project Manager → Program Manager (4–6 years)",
      "Program Manager → Portfolio Director or PMO Lead (5+ years)"
    ],
    "salaryRange": "Entry EU: €45K–€65K\nMid EU: €65K–€90K\nSenior EU: €90K–€120K+\nUS entry: $65K–$85K\nUS mid: $90K–$120K\nUS senior: $130K–$160K+\n\nSalaries vary by industry (IT and finance pay more) and certification (PMP, PRINCE2).",
    "industries": [
      "Information Technology & Software",
      "Construction & Engineering",
      "Finance & Banking",
      "Healthcare & Pharmaceuticals",
      "Telecommunications",
      "Marketing & Advertising",
      "Energy & Utilities",
      "Public Sector & Nonprofit"
    ],
    "growthOutlook": "Global demand for skilled Project Managers continues to grow due to digital transformation and infrastructure investments. Automation supports tracking and reporting but strengthens—not replaces—the need for human leadership and stakeholder alignment.",
    "education": "Typically a bachelor’s degree in business, engineering, or IT. Many professionals advance through certifications such as PMP, PRINCE2, or Scrum Master. Alternatives include hands-on experience managing smaller projects, online PM bootcamps, or Agile-focused credentials.",
    "personalityTraits": [
      "Organized and detail-oriented",
      "Strong communicator",
      "Analytical problem-solver",
      "Adaptable under pressure",
      "Empathetic team leader"
    ]
  }
  $json$::jsonb
  WHERE slug = target_slug;

  RAISE NOTICE 'Updated role_info for simulation slug: %', target_slug;
END $$;
