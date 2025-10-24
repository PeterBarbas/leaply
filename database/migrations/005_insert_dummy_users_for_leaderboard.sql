-- Insert dummy users and simulation attempts for testing the leaderboard
-- This script creates realistic test data with varying scores and completion rates

-- First, let's create some dummy users in the auth.users table and corresponding profiles
-- Note: We'll use UUIDs that look realistic but won't conflict with real auth users

-- Insert dummy users into auth.users (this requires service role permissions)
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES 
-- User 1: High performer
(
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'alex.chen@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NULL,
  NOW() - INTERVAL '2 days',
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Alex Chen", "avatar_url": null}',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '2 days',
  '',
  '',
  '',
  ''
),
-- User 2: Medium performer
(
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sarah.johnson@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NULL,
  NOW() - INTERVAL '1 day',
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Sarah Johnson", "avatar_url": null}',
  NOW() - INTERVAL '25 days',
  NOW() - INTERVAL '1 day',
  '',
  '',
  '',
  ''
),
-- User 3: Top performer
(
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'mike.rodriguez@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NULL,
  NOW() - INTERVAL '3 hours',
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Mike Rodriguez", "avatar_url": null}',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '3 hours',
  '',
  '',
  '',
  ''
),
-- User 4: Beginner
(
  '44444444-4444-4444-4444-444444444444',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'emma.wilson@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NULL,
  NOW() - INTERVAL '5 hours',
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Emma Wilson", "avatar_url": null}',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '5 hours',
  '',
  '',
  '',
  ''
),
-- User 5: Consistent performer
(
  '55555555-5555-5555-5555-555555555555',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'david.kim@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NULL,
  NOW() - INTERVAL '1 day',
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "David Kim", "avatar_url": null}',
  NOW() - INTERVAL '28 days',
  NOW() - INTERVAL '1 day',
  '',
  '',
  '',
  ''
),
-- User 6: Rising star
(
  '66666666-6666-6666-6666-666666666666',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'lisa.patel@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NULL,
  NOW() - INTERVAL '2 hours',
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Lisa Patel", "avatar_url": null}',
  NOW() - INTERVAL '12 days',
  NOW() - INTERVAL '2 hours',
  '',
  '',
  '',
  ''
),
-- User 7: Veteran
(
  '77777777-7777-7777-7777-777777777777',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'james.brown@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NULL,
  NOW() - INTERVAL '4 days',
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "James Brown", "avatar_url": null}',
  NOW() - INTERVAL '35 days',
  NOW() - INTERVAL '4 days',
  '',
  '',
  '',
  ''
),
-- User 8: Newcomer
(
  '88888888-8888-8888-8888-888888888888',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sophie.martinez@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NULL,
  NOW() - INTERVAL '6 hours',
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Sophie Martinez", "avatar_url": null}',
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '6 hours',
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO NOTHING;

-- Insert corresponding user profiles
INSERT INTO users (
  id,
  email,
  name,
  provider,
  photo_url,
  country,
  location,
  website,
  avatar,
  interests,
  bio,
  created_at,
  updated_at
) VALUES 
-- Alex Chen - High performer
(
  '11111111-1111-1111-1111-111111111111',
  'alex.chen@example.com',
  'Alex Chen',
  'email',
  NULL,
  'United States',
  'San Francisco, CA',
  'https://alexchen.dev',
  'avatar1',
  ARRAY['Technology', 'Marketing', 'Leadership'],
  'Senior Marketing Manager with 8+ years of experience in tech startups. Passionate about data-driven marketing and team leadership.',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '2 days'
),
-- Sarah Johnson - Medium performer
(
  '22222222-2222-2222-2222-222222222222',
  'sarah.johnson@example.com',
  'Sarah Johnson',
  'email',
  NULL,
  'Canada',
  'Toronto, ON',
  'https://sarahjohnson.ca',
  'avatar2',
  ARRAY['Design', 'User Experience', 'Creative'],
  'UX Designer focused on creating intuitive and beautiful user experiences. Love working with cross-functional teams.',
  NOW() - INTERVAL '25 days',
  NOW() - INTERVAL '1 day'
),
-- Mike Rodriguez - Top performer
(
  '33333333-3333-3333-3333-333333333333',
  'mike.rodriguez@example.com',
  'Mike Rodriguez',
  'email',
  NULL,
  'United States',
  'Austin, TX',
  'https://mikerodriguez.com',
  'avatar3',
  ARRAY['Business', 'Strategy', 'Analytics'],
  'Business Strategy Consultant helping companies scale and optimize their operations. MBA from Stanford.',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '3 hours'
),
-- Emma Wilson - Beginner
(
  '44444444-4444-4444-4444-444444444444',
  'emma.wilson@example.com',
  'Emma Wilson',
  'email',
  NULL,
  'United Kingdom',
  'London, UK',
  NULL,
  'avatar4',
  ARRAY['Science', 'Research', 'Innovation'],
  'Recent graduate in Computer Science, excited to start my career in tech. Love learning new technologies and solving complex problems.',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '5 hours'
),
-- David Kim - Consistent performer
(
  '55555555-5555-5555-5555-555555555555',
  'david.kim@example.com',
  'David Kim',
  'email',
  NULL,
  'South Korea',
  'Seoul, South Korea',
  'https://davidkim.kr',
  'avatar5',
  ARRAY['Technology', 'Engineering', 'Product'],
  'Full-stack developer with expertise in React and Node.js. Passionate about building scalable web applications.',
  NOW() - INTERVAL '28 days',
  NOW() - INTERVAL '1 day'
),
-- Lisa Patel - Rising star
(
  '66666666-6666-6666-6666-666666666666',
  'lisa.patel@example.com',
  'Lisa Patel',
  'email',
  NULL,
  'India',
  'Mumbai, India',
  'https://lisapatel.in',
  'avatar1',
  ARRAY['Marketing', 'Digital', 'Growth'],
  'Digital Marketing Specialist with a focus on growth hacking and social media strategy. Always learning and experimenting.',
  NOW() - INTERVAL '12 days',
  NOW() - INTERVAL '2 hours'
),
-- James Brown - Veteran
(
  '77777777-7777-7777-7777-777777777777',
  'james.brown@example.com',
  'James Brown',
  'email',
  NULL,
  'Australia',
  'Sydney, Australia',
  'https://jamesbrown.au',
  'avatar2',
  ARRAY['Leadership', 'Management', 'Strategy'],
  'Senior Executive with 15+ years of experience in corporate strategy and team management. Mentor to many young professionals.',
  NOW() - INTERVAL '35 days',
  NOW() - INTERVAL '4 days'
),
-- Sophie Martinez - Newcomer
(
  '88888888-8888-8888-8888-888888888888',
  'sophie.martinez@example.com',
  'Sophie Martinez',
  'email',
  NULL,
  'Spain',
  'Barcelona, Spain',
  NULL,
  'avatar3',
  ARRAY['Art', 'Design', 'Creative'],
  'Graphic Designer and illustrator. Love creating visual stories and working on creative projects that make a difference.',
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '6 hours'
)
ON CONFLICT (id) DO NOTHING;

-- Now let's get some simulation IDs to create attempts
-- We'll assume there are some simulations in the database, but if not, we'll create some basic ones
DO $$
DECLARE
  sim1_id UUID;
  sim2_id UUID;
  sim3_id UUID;
  sim4_id UUID;
  sim5_id UUID;
BEGIN
  -- Try to get existing simulations first
  SELECT id INTO sim1_id FROM simulations WHERE slug = 'marketing-manager' LIMIT 1;
  SELECT id INTO sim2_id FROM simulations WHERE slug = 'product-manager' LIMIT 1;
  SELECT id INTO sim3_id FROM simulations WHERE slug = 'data-analyst' LIMIT 1;
  SELECT id INTO sim4_id FROM simulations WHERE slug = 'ux-designer' LIMIT 1;
  SELECT id INTO sim5_id FROM simulations WHERE slug = 'business-analyst' LIMIT 1;
  
  -- If simulations don't exist, create them
  IF sim1_id IS NULL THEN
    INSERT INTO simulations (slug, title, steps, rubric, role_info, active) VALUES 
    ('marketing-manager', 'Marketing Manager', 
     '[{"label": "Campaign Strategy", "type": "text", "placeholder": "Describe your campaign strategy..."}, {"label": "Target Audience", "type": "text", "placeholder": "Who is your target audience?"}, {"label": "Budget Allocation", "type": "text", "placeholder": "How would you allocate your budget?"}]',
     '["Strategic thinking", "Audience understanding", "Budget management", "Creativity"]',
     '{"description": "Lead marketing campaigns and drive brand awareness", "skills": ["Marketing Strategy", "Campaign Management", "Analytics"]}',
     true)
    RETURNING id INTO sim1_id;
  END IF;
  
  IF sim2_id IS NULL THEN
    INSERT INTO simulations (slug, title, steps, rubric, role_info, active) VALUES 
    ('product-manager', 'Product Manager', 
     '[{"label": "Product Vision", "type": "text", "placeholder": "What is your product vision?"}, {"label": "User Research", "type": "text", "placeholder": "How would you conduct user research?"}, {"label": "Feature Prioritization", "type": "text", "placeholder": "How would you prioritize features?"}]',
     '["Product vision", "User empathy", "Prioritization", "Communication"]',
     '{"description": "Define product strategy and work with cross-functional teams", "skills": ["Product Strategy", "User Research", "Roadmapping"]}',
     true)
    RETURNING id INTO sim2_id;
  END IF;
  
  IF sim3_id IS NULL THEN
    INSERT INTO simulations (slug, title, steps, rubric, role_info, active) VALUES 
    ('data-analyst', 'Data Analyst', 
     '[{"label": "Data Collection", "type": "text", "placeholder": "How would you collect relevant data?"}, {"label": "Analysis Approach", "type": "text", "placeholder": "Describe your analysis approach..."}, {"label": "Insights & Recommendations", "type": "text", "placeholder": "What insights would you provide?"}]',
     '["Data collection", "Analytical thinking", "Insights generation", "Communication"]',
     '{"description": "Analyze data to provide actionable business insights", "skills": ["Data Analysis", "Statistics", "Visualization"]}',
     true)
    RETURNING id INTO sim3_id;
  END IF;
  
  IF sim4_id IS NULL THEN
    INSERT INTO simulations (slug, title, steps, rubric, role_info, active) VALUES 
    ('ux-designer', 'UX Designer', 
     '[{"label": "User Research", "type": "text", "placeholder": "How would you research user needs?"}, {"label": "Design Process", "type": "text", "placeholder": "Describe your design process..."}, {"label": "Usability Testing", "type": "text", "placeholder": "How would you test usability?"}]',
     '["User empathy", "Design thinking", "Usability", "Creativity"]',
     '{"description": "Design user-centered digital experiences", "skills": ["User Research", "Wireframing", "Prototyping"]}',
     true)
    RETURNING id INTO sim4_id;
  END IF;
  
  IF sim5_id IS NULL THEN
    INSERT INTO simulations (slug, title, steps, rubric, role_info, active) VALUES 
    ('business-analyst', 'Business Analyst', 
     '[{"label": "Requirements Gathering", "type": "text", "placeholder": "How would you gather requirements?"}, {"label": "Process Analysis", "type": "text", "placeholder": "Describe your analysis approach..."}, {"label": "Solution Design", "type": "text", "placeholder": "What solution would you propose?"}]',
     '["Requirements analysis", "Process improvement", "Solution design", "Stakeholder management"]',
     '{"description": "Analyze business processes and recommend improvements", "skills": ["Business Analysis", "Process Mapping", "Requirements"]}',
     true)
    RETURNING id INTO sim5_id;
  END IF;

  -- Now create simulation attempts with varying scores and completion rates
  -- First, clean up any existing attempts and related data for our dummy users to avoid conflicts
  DELETE FROM attempt_steps WHERE attempt_id IN (
    SELECT id FROM attempts WHERE user_id IN (
      '11111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222',
      '33333333-3333-3333-3333-333333333333',
      '44444444-4444-4444-4444-444444444444',
      '55555555-5555-5555-5555-555555555555',
      '66666666-6666-6666-6666-666666666666',
      '77777777-7777-7777-7777-777777777777',
      '88888888-8888-8888-8888-888888888888'
    )
  );
  
  DELETE FROM attempts WHERE user_id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666',
    '77777777-7777-7777-7777-777777777777',
    '88888888-8888-8888-8888-888888888888'
  );
  
  -- Alex Chen - High performer (5 completed simulations, high scores)
  INSERT INTO attempts (id, simulation_id, user_id, status, score, result_summary, completed_at, created_at) VALUES
  (gen_random_uuid(), sim1_id, '11111111-1111-1111-1111-111111111111', 'completed', 8.7, '{"strengths": ["Excellent strategic thinking", "Strong audience understanding"], "improvements": ["Could improve budget allocation details"]}', NOW() - INTERVAL '25 days', NOW() - INTERVAL '26 days'),
  (gen_random_uuid(), sim2_id, '11111111-1111-1111-1111-111111111111', 'completed', 9.2, '{"strengths": ["Clear product vision", "Strong user empathy"], "improvements": ["Could provide more specific metrics"]}', NOW() - INTERVAL '20 days', NOW() - INTERVAL '21 days'),
  (gen_random_uuid(), sim3_id, '11111111-1111-1111-1111-111111111111', 'completed', 8.9, '{"strengths": ["Comprehensive data approach", "Clear insights"], "improvements": ["Could include more visualization examples"]}', NOW() - INTERVAL '15 days', NOW() - INTERVAL '16 days'),
  (gen_random_uuid(), sim4_id, '11111111-1111-1111-1111-111111111111', 'completed', 8.5, '{"strengths": ["Good user research methods", "Solid design process"], "improvements": ["Could expand on testing methodologies"]}', NOW() - INTERVAL '10 days', NOW() - INTERVAL '11 days'),
  (gen_random_uuid(), sim5_id, '11111111-1111-1111-1111-111111111111', 'completed', 9.0, '{"strengths": ["Thorough requirements analysis", "Clear solution design"], "improvements": ["Could include more stakeholder considerations"]}', NOW() - INTERVAL '5 days', NOW() - INTERVAL '6 days');

  -- Sarah Johnson - Medium performer (4 completed simulations, medium scores)
  INSERT INTO attempts (id, simulation_id, user_id, status, score, result_summary, completed_at, created_at) VALUES
  (gen_random_uuid(), sim1_id, '22222222-2222-2222-2222-222222222222', 'completed', 7.3, '{"strengths": ["Good strategic approach", "Reasonable audience targeting"], "improvements": ["Could be more specific about tactics"]}', NOW() - INTERVAL '22 days', NOW() - INTERVAL '23 days'),
  (gen_random_uuid(), sim2_id, '22222222-2222-2222-2222-222222222222', 'completed', 7.8, '{"strengths": ["Clear product thinking", "Good user focus"], "improvements": ["Could provide more detailed roadmaps"]}', NOW() - INTERVAL '18 days', NOW() - INTERVAL '19 days'),
  (gen_random_uuid(), sim3_id, '22222222-2222-2222-2222-222222222222', 'completed', 7.1, '{"strengths": ["Solid analytical approach", "Good data collection methods"], "improvements": ["Could improve insight depth"]}', NOW() - INTERVAL '14 days', NOW() - INTERVAL '15 days'),
  (gen_random_uuid(), sim4_id, '22222222-2222-2222-2222-222222222222', 'completed', 7.9, '{"strengths": ["Strong UX knowledge", "Good research methods"], "improvements": ["Could expand on testing approaches"]}', NOW() - INTERVAL '8 days', NOW() - INTERVAL '9 days');

  -- Mike Rodriguez - Top performer (6 completed simulations, highest scores)
  INSERT INTO attempts (id, simulation_id, user_id, status, score, result_summary, completed_at, created_at) VALUES
  (gen_random_uuid(), sim1_id, '33333333-3333-3333-3333-333333333333', 'completed', 9.5, '{"strengths": ["Exceptional strategic thinking", "Deep audience insights", "Innovative approaches"], "improvements": ["Consider more budget optimization strategies"]}', NOW() - INTERVAL '18 days', NOW() - INTERVAL '19 days'),
  (gen_random_uuid(), sim2_id, '33333333-3333-3333-3333-333333333333', 'completed', 9.8, '{"strengths": ["Outstanding product vision", "Excellent user empathy", "Clear prioritization"], "improvements": ["Could include more competitive analysis"]}', NOW() - INTERVAL '15 days', NOW() - INTERVAL '16 days'),
  (gen_random_uuid(), sim3_id, '33333333-3333-3333-3333-333333333333', 'completed', 9.3, '{"strengths": ["Comprehensive data strategy", "Excellent insights", "Clear recommendations"], "improvements": ["Could include more advanced analytics"]}', NOW() - INTERVAL '12 days', NOW() - INTERVAL '13 days'),
  (gen_random_uuid(), sim4_id, '33333333-3333-3333-3333-333333333333', 'completed', 9.1, '{"strengths": ["Deep user understanding", "Innovative design approach", "Thorough testing plan"], "improvements": ["Could include accessibility considerations"]}', NOW() - INTERVAL '9 days', NOW() - INTERVAL '10 days'),
  (gen_random_uuid(), sim5_id, '33333333-3333-3333-3333-333333333333', 'completed', 9.6, '{"strengths": ["Exceptional analysis skills", "Clear solution design", "Strong stakeholder focus"], "improvements": ["Could include more risk assessment"]}', NOW() - INTERVAL '6 days', NOW() - INTERVAL '7 days'),
  (gen_random_uuid(), sim1_id, '33333333-3333-3333-3333-333333333333', 'completed', 9.4, '{"strengths": ["Advanced strategic thinking", "Data-driven approach", "Innovative tactics"], "improvements": ["Could include more measurement frameworks"]}', NOW() - INTERVAL '3 days', NOW() - INTERVAL '4 days');

  -- Emma Wilson - Beginner (2 completed simulations, lower scores)
  INSERT INTO attempts (id, simulation_id, user_id, status, score, result_summary, completed_at, created_at) VALUES
  (gen_random_uuid(), sim1_id, '44444444-4444-4444-4444-444444444444', 'completed', 6.2, '{"strengths": ["Good effort and enthusiasm", "Basic understanding of concepts"], "improvements": ["Need more strategic depth", "Improve audience targeting"]}', NOW() - INTERVAL '12 days', NOW() - INTERVAL '13 days'),
  (gen_random_uuid(), sim2_id, '44444444-4444-4444-4444-444444444444', 'completed', 6.8, '{"strengths": ["Clear thinking process", "Good user consideration"], "improvements": ["Need more product experience", "Improve prioritization skills"]}', NOW() - INTERVAL '8 days', NOW() - INTERVAL '9 days');

  -- David Kim - Consistent performer (5 completed simulations, consistent scores)
  INSERT INTO attempts (id, simulation_id, user_id, status, score, result_summary, completed_at, created_at) VALUES
  (gen_random_uuid(), sim1_id, '55555555-5555-5555-5555-555555555555', 'completed', 7.8, '{"strengths": ["Solid strategic approach", "Good audience understanding"], "improvements": ["Could improve creative elements"]}', NOW() - INTERVAL '24 days', NOW() - INTERVAL '25 days'),
  (gen_random_uuid(), sim2_id, '55555555-5555-5555-5555-555555555555', 'completed', 7.9, '{"strengths": ["Clear product vision", "Good user focus"], "improvements": ["Could provide more detailed roadmaps"]}', NOW() - INTERVAL '20 days', NOW() - INTERVAL '21 days'),
  (gen_random_uuid(), sim3_id, '55555555-5555-5555-5555-555555555555', 'completed', 7.7, '{"strengths": ["Good analytical approach", "Clear data collection"], "improvements": ["Could improve insight depth"]}', NOW() - INTERVAL '16 days', NOW() - INTERVAL '17 days'),
  (gen_random_uuid(), sim4_id, '55555555-5555-5555-5555-555555555555', 'completed', 7.6, '{"strengths": ["Solid UX knowledge", "Good research approach"], "improvements": ["Could expand on testing methods"]}', NOW() - INTERVAL '12 days', NOW() - INTERVAL '13 days'),
  (gen_random_uuid(), sim5_id, '55555555-5555-5555-5555-555555555555', 'completed', 7.8, '{"strengths": ["Good analysis skills", "Clear solution approach"], "improvements": ["Could include more stakeholder considerations"]}', NOW() - INTERVAL '8 days', NOW() - INTERVAL '9 days');

  -- Lisa Patel - Rising star (3 completed simulations, improving scores)
  INSERT INTO attempts (id, simulation_id, user_id, status, score, result_summary, completed_at, created_at) VALUES
  (gen_random_uuid(), sim1_id, '66666666-6666-6666-6666-666666666666', 'completed', 7.1, '{"strengths": ["Good strategic thinking", "Reasonable approach"], "improvements": ["Could improve audience targeting"]}', NOW() - INTERVAL '10 days', NOW() - INTERVAL '11 days'),
  (gen_random_uuid(), sim2_id, '66666666-6666-6666-6666-666666666666', 'completed', 7.8, '{"strengths": ["Improved product thinking", "Better user focus"], "improvements": ["Could provide more detailed analysis"]}', NOW() - INTERVAL '7 days', NOW() - INTERVAL '8 days'),
  (gen_random_uuid(), sim3_id, '66666666-6666-6666-6666-666666666666', 'completed', 8.2, '{"strengths": ["Strong analytical approach", "Good insights", "Clear recommendations"], "improvements": ["Could include more visualization examples"]}', NOW() - INTERVAL '4 days', NOW() - INTERVAL '5 days');

  -- James Brown - Veteran (4 completed simulations, solid scores)
  INSERT INTO attempts (id, simulation_id, user_id, status, score, result_summary, completed_at, created_at) VALUES
  (gen_random_uuid(), sim1_id, '77777777-7777-7777-7777-777777777777', 'completed', 8.1, '{"strengths": ["Strong strategic thinking", "Good leadership perspective"], "improvements": ["Could include more modern tactics"]}', NOW() - INTERVAL '30 days', NOW() - INTERVAL '31 days'),
  (gen_random_uuid(), sim2_id, '77777777-7777-7777-7777-777777777777', 'completed', 8.3, '{"strengths": ["Clear product vision", "Strong stakeholder management"], "improvements": ["Could include more user research methods"]}', NOW() - INTERVAL '26 days', NOW() - INTERVAL '27 days'),
  (gen_random_uuid(), sim3_id, '77777777-7777-7777-7777-777777777777', 'completed', 8.0, '{"strengths": ["Solid analytical approach", "Good business insights"], "improvements": ["Could improve data visualization"]}', NOW() - INTERVAL '22 days', NOW() - INTERVAL '23 days'),
  (gen_random_uuid(), sim5_id, '77777777-7777-7777-7777-777777777777', 'completed', 8.4, '{"strengths": ["Excellent analysis skills", "Strong solution design", "Good stakeholder focus"], "improvements": ["Could include more change management"]}', NOW() - INTERVAL '18 days', NOW() - INTERVAL '19 days');

  -- Sophie Martinez - Newcomer (1 completed simulation, learning)
  INSERT INTO attempts (id, simulation_id, user_id, status, score, result_summary, completed_at, created_at) VALUES
  (gen_random_uuid(), sim4_id, '88888888-8888-8888-8888-888888888888', 'completed', 6.5, '{"strengths": ["Good creative thinking", "Basic UX understanding"], "improvements": ["Need more user research experience", "Improve design process knowledge"]}', NOW() - INTERVAL '5 days', NOW() - INTERVAL '6 days');

END $$;

-- Clean up any existing user activity for our dummy users
DELETE FROM user_activity WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888'
);

-- Insert some user activity records for streak calculation
INSERT INTO user_activity (user_id, activity_type, activity_date, metadata) VALUES
-- Alex Chen - Active user with good streak
('11111111-1111-1111-1111-111111111111', 'simulation_completed', NOW() - INTERVAL '5 days', '{"simulation_id": "marketing-manager"}'),
('11111111-1111-1111-1111-111111111111', 'simulation_completed', NOW() - INTERVAL '10 days', '{"simulation_id": "ux-designer"}'),
('11111111-1111-1111-1111-111111111111', 'simulation_completed', NOW() - INTERVAL '15 days', '{"simulation_id": "data-analyst"}'),
('11111111-1111-1111-1111-111111111111', 'simulation_completed', NOW() - INTERVAL '20 days', '{"simulation_id": "product-manager"}'),
('11111111-1111-1111-1111-111111111111', 'simulation_completed', NOW() - INTERVAL '25 days', '{"simulation_id": "marketing-manager"}'),
('11111111-1111-1111-1111-111111111111', 'login', NOW() - INTERVAL '2 days', '{}'),

-- Mike Rodriguez - Very active user with long streak
('33333333-3333-3333-3333-333333333333', 'simulation_completed', NOW() - INTERVAL '3 days', '{"simulation_id": "marketing-manager"}'),
('33333333-3333-3333-3333-333333333333', 'simulation_completed', NOW() - INTERVAL '6 days', '{"simulation_id": "business-analyst"}'),
('33333333-3333-3333-3333-333333333333', 'simulation_completed', NOW() - INTERVAL '9 days', '{"simulation_id": "ux-designer"}'),
('33333333-3333-3333-3333-333333333333', 'simulation_completed', NOW() - INTERVAL '12 days', '{"simulation_id": "data-analyst"}'),
('33333333-3333-3333-3333-333333333333', 'simulation_completed', NOW() - INTERVAL '15 days', '{"simulation_id": "product-manager"}'),
('33333333-3333-3333-3333-333333333333', 'simulation_completed', NOW() - INTERVAL '18 days', '{"simulation_id": "marketing-manager"}'),
('33333333-3333-3333-3333-333333333333', 'login', NOW() - INTERVAL '3 hours', '{}'),

-- Sarah Johnson - Regular user
('22222222-2222-2222-2222-222222222222', 'simulation_completed', NOW() - INTERVAL '8 days', '{"simulation_id": "ux-designer"}'),
('22222222-2222-2222-2222-222222222222', 'simulation_completed', NOW() - INTERVAL '14 days', '{"simulation_id": "data-analyst"}'),
('22222222-2222-2222-2222-222222222222', 'simulation_completed', NOW() - INTERVAL '18 days', '{"simulation_id": "product-manager"}'),
('22222222-2222-2222-2222-222222222222', 'simulation_completed', NOW() - INTERVAL '22 days', '{"simulation_id": "marketing-manager"}'),
('22222222-2222-2222-2222-222222222222', 'login', NOW() - INTERVAL '1 day', '{}'),

-- David Kim - Consistent user
('55555555-5555-5555-5555-555555555555', 'simulation_completed', NOW() - INTERVAL '8 days', '{"simulation_id": "business-analyst"}'),
('55555555-5555-5555-5555-555555555555', 'simulation_completed', NOW() - INTERVAL '12 days', '{"simulation_id": "ux-designer"}'),
('55555555-5555-5555-5555-555555555555', 'simulation_completed', NOW() - INTERVAL '16 days', '{"simulation_id": "data-analyst"}'),
('55555555-5555-5555-5555-555555555555', 'simulation_completed', NOW() - INTERVAL '20 days', '{"simulation_id": "product-manager"}'),
('55555555-5555-5555-5555-555555555555', 'simulation_completed', NOW() - INTERVAL '24 days', '{"simulation_id": "marketing-manager"}'),
('55555555-5555-5555-5555-555555555555', 'login', NOW() - INTERVAL '1 day', '{}'),

-- Lisa Patel - Rising user
('66666666-6666-6666-6666-666666666666', 'simulation_completed', NOW() - INTERVAL '4 days', '{"simulation_id": "data-analyst"}'),
('66666666-6666-6666-6666-666666666666', 'simulation_completed', NOW() - INTERVAL '7 days', '{"simulation_id": "product-manager"}'),
('66666666-6666-6666-6666-666666666666', 'simulation_completed', NOW() - INTERVAL '10 days', '{"simulation_id": "marketing-manager"}'),
('66666666-6666-6666-6666-666666666666', 'login', NOW() - INTERVAL '2 hours', '{}'),

-- James Brown - Veteran user
('77777777-7777-7777-7777-777777777777', 'simulation_completed', NOW() - INTERVAL '18 days', '{"simulation_id": "business-analyst"}'),
('77777777-7777-7777-7777-777777777777', 'simulation_completed', NOW() - INTERVAL '22 days', '{"simulation_id": "data-analyst"}'),
('77777777-7777-7777-7777-777777777777', 'simulation_completed', NOW() - INTERVAL '26 days', '{"simulation_id": "product-manager"}'),
('77777777-7777-7777-7777-777777777777', 'simulation_completed', NOW() - INTERVAL '30 days', '{"simulation_id": "marketing-manager"}'),
('77777777-7777-7777-7777-777777777777', 'login', NOW() - INTERVAL '4 days', '{}'),

-- Emma Wilson - New user
('44444444-4444-4444-4444-444444444444', 'simulation_completed', NOW() - INTERVAL '8 days', '{"simulation_id": "product-manager"}'),
('44444444-4444-4444-4444-444444444444', 'simulation_completed', NOW() - INTERVAL '12 days', '{"simulation_id": "marketing-manager"}'),
('44444444-4444-4444-4444-444444444444', 'login', NOW() - INTERVAL '5 hours', '{}'),

-- Sophie Martinez - Very new user
('88888888-8888-8888-8888-888888888888', 'simulation_completed', NOW() - INTERVAL '5 days', '{"simulation_id": "ux-designer"}'),
('88888888-8888-8888-8888-888888888888', 'login', NOW() - INTERVAL '6 hours', '{}')
ON CONFLICT (user_id, activity_type, activity_date) DO NOTHING;

-- Add some attempt steps for a few attempts to make them more realistic
-- We'll add steps for some of the completed attempts
DO $$
DECLARE
  attempt_record RECORD;
  step_count INTEGER;
  i INTEGER;
BEGIN
  -- Get some completed attempts and add steps for them
  FOR attempt_record IN 
    SELECT a.id, a.simulation_id, s.steps 
    FROM attempts a 
    JOIN simulations s ON a.simulation_id = s.id 
    WHERE a.status = 'completed' 
    LIMIT 10
  LOOP
    -- Get the number of steps for this simulation
    step_count := json_array_length(attempt_record.steps::json);
    
    -- Add steps for this attempt
    FOR i IN 0..(step_count-1) LOOP
      INSERT INTO attempt_steps (attempt_id, step_index, input, ai_feedback) VALUES
      (
        attempt_record.id,
        i,
        json_build_object('text', 'This is a sample response for step ' || (i+1) || ' of the simulation. The user provided thoughtful answers that demonstrate good understanding of the role and requirements.'),
        json_build_object('text', 'Good response! You show solid understanding of the key concepts. Consider adding more specific examples and metrics to strengthen your answer.')
      )
      ON CONFLICT (attempt_id, step_index) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Display summary of what was created
SELECT 
  'Users created' as category,
  COUNT(*) as count
FROM users 
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888'
)

UNION ALL

SELECT 
  'Simulations created' as category,
  COUNT(*) as count
FROM simulations 
WHERE slug IN ('marketing-manager', 'product-manager', 'data-analyst', 'ux-designer', 'business-analyst')

UNION ALL

SELECT 
  'Attempts created' as category,
  COUNT(*) as count
FROM attempts 
WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888'
)

UNION ALL

SELECT 
  'Activity records created' as category,
  COUNT(*) as count
FROM user_activity 
WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888'
);
