-- =============================================
-- PHASE 1: CODE-YAAR PLATFORM DATABASE FOUNDATION
-- =============================================

-- =============================================
-- 1. USER PREFERENCES (Onboarding Answers)
-- =============================================
CREATE TABLE public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    experience_level TEXT, -- 'beginner', 'basics', 'intermediate', 'advanced'
    user_type TEXT, -- 'school_student', 'college_student', 'self_learner', 'job_seeker'
    learning_goal TEXT, -- 'web_dev', 'app_dev', 'ai_ml', 'game_dev', 'cybersecurity', 'unsure'
    daily_time_minutes INTEGER DEFAULT 60,
    learning_preference TEXT, -- 'projects', 'problems', 'theory', 'mixed'
    content_format TEXT, -- 'guided', 'challenges', 'video', 'reading'
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- 2. USER GAMIFICATION (XP, Level, Streak)
-- =============================================
CREATE TABLE public.user_gamification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    xp_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    total_lessons_completed INTEGER DEFAULT 0,
    total_courses_completed INTEGER DEFAULT 0,
    total_algorithms_studied INTEGER DEFAULT 0,
    total_doubts_answered INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own gamification" ON public.user_gamification
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gamification" ON public.user_gamification
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gamification" ON public.user_gamification
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view leaderboard data" ON public.user_gamification
    FOR SELECT USING (true);

-- =============================================
-- 3. ALGORITHM CATEGORIES
-- =============================================
CREATE TABLE public.algorithm_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.algorithm_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published categories" ON public.algorithm_categories
    FOR SELECT USING (is_published = true OR is_admin());

CREATE POLICY "Admins can manage categories" ON public.algorithm_categories
    FOR ALL USING (is_admin());

-- =============================================
-- 4. ALGORITHMS
-- =============================================
CREATE TABLE public.algorithms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.algorithm_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    difficulty TEXT DEFAULT 'medium', -- 'easy', 'medium', 'hard'
    time_complexity TEXT,
    space_complexity TEXT,
    explanation TEXT, -- Markdown content
    code_python TEXT,
    code_cpp TEXT,
    code_javascript TEXT,
    practice_links JSONB DEFAULT '[]',
    view_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.algorithms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published algorithms" ON public.algorithms
    FOR SELECT USING (is_published = true OR is_admin());

CREATE POLICY "Admins can manage algorithms" ON public.algorithms
    FOR ALL USING (is_admin());

-- =============================================
-- 5. COURSES
-- =============================================
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT DEFAULT 'general', -- 'web', 'python', 'ai_ml', 'dsa', 'devops', 'databases'
    difficulty TEXT DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
    thumbnail_url TEXT,
    estimated_hours INTEGER DEFAULT 10,
    total_lessons INTEGER DEFAULT 0,
    xp_reward INTEGER DEFAULT 500,
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published courses" ON public.courses
    FOR SELECT USING (is_published = true OR is_admin());

CREATE POLICY "Admins can manage courses" ON public.courses
    FOR ALL USING (is_admin());

-- =============================================
-- 6. COURSE LESSONS
-- =============================================
CREATE TABLE public.course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT, -- Markdown content
    video_url TEXT,
    lesson_type TEXT DEFAULT 'theory', -- 'theory', 'code_along', 'quiz', 'project'
    lesson_order INTEGER NOT NULL,
    estimated_minutes INTEGER DEFAULT 15,
    xp_reward INTEGER DEFAULT 50,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(course_id, slug)
);

ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published lessons" ON public.course_lessons
    FOR SELECT USING (is_published = true OR is_admin());

CREATE POLICY "Admins can manage lessons" ON public.course_lessons
    FOR ALL USING (is_admin());

-- =============================================
-- 7. LESSON PROGRESS
-- =============================================
CREATE TABLE public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    time_spent_seconds INTEGER DEFAULT 0,
    quiz_score INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress" ON public.lesson_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON public.lesson_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.lesson_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress" ON public.lesson_progress
    FOR SELECT USING (is_admin());

-- =============================================
-- 8. DOUBTS (Questions)
-- =============================================
CREATE TABLE public.doubts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    topic TEXT DEFAULT 'general', -- 'algorithms', 'courses', 'roadmap', 'general_cs', 'career'
    tags TEXT[] DEFAULT '{}',
    vote_count INTEGER DEFAULT 0,
    answer_count INTEGER DEFAULT 0,
    is_resolved BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.doubts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible doubts" ON public.doubts
    FOR SELECT USING (is_hidden = false OR auth.uid() = user_id OR is_admin());

CREATE POLICY "Authenticated users can create doubts" ON public.doubts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own doubts" ON public.doubts
    FOR UPDATE USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins can delete doubts" ON public.doubts
    FOR DELETE USING (is_admin());

-- =============================================
-- 9. DOUBT RESPONSES (Answers)
-- =============================================
CREATE TABLE public.doubt_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doubt_id UUID NOT NULL REFERENCES public.doubts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    vote_count INTEGER DEFAULT 0,
    is_accepted BOOLEAN DEFAULT false,
    is_admin_response BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.doubt_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible responses" ON public.doubt_responses
    FOR SELECT USING (is_hidden = false OR auth.uid() = user_id OR is_admin());

CREATE POLICY "Authenticated users can create responses" ON public.doubt_responses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own responses" ON public.doubt_responses
    FOR UPDATE USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins can delete responses" ON public.doubt_responses
    FOR DELETE USING (is_admin());

-- =============================================
-- 10. DOUBT VOTES
-- =============================================
CREATE TABLE public.doubt_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    target_id UUID NOT NULL, -- doubt_id or response_id
    target_type TEXT NOT NULL, -- 'doubt' or 'response'
    vote_value INTEGER NOT NULL CHECK (vote_value IN (-1, 1)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, target_id, target_type)
);

ALTER TABLE public.doubt_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view votes" ON public.doubt_votes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON public.doubt_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON public.doubt_votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON public.doubt_votes
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 11. SAVED ROADMAPS
-- =============================================
CREATE TABLE public.saved_roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    goal TEXT NOT NULL, -- 'web_dev', 'ai_ml', etc.
    difficulty TEXT DEFAULT 'beginner',
    daily_time_minutes INTEGER DEFAULT 60,
    roadmap_data JSONB NOT NULL, -- Full roadmap structure
    total_steps INTEGER DEFAULT 0,
    completed_steps INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roadmaps" ON public.saved_roadmaps
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roadmaps" ON public.saved_roadmaps
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roadmaps" ON public.saved_roadmaps
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roadmaps" ON public.saved_roadmaps
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 12. ROADMAP PROGRESS
-- =============================================
CREATE TABLE public.roadmap_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    roadmap_id UUID NOT NULL REFERENCES public.saved_roadmaps(id) ON DELETE CASCADE,
    step_index INTEGER NOT NULL,
    step_title TEXT,
    is_completed BOOLEAN DEFAULT false,
    is_unlocked BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(roadmap_id, step_index)
);

ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roadmap progress" ON public.roadmap_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON public.roadmap_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.roadmap_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- 13. BADGES (Definitions)
-- =============================================
CREATE TABLE public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    category TEXT DEFAULT 'achievement', -- 'achievement', 'streak', 'milestone', 'special'
    requirement_type TEXT, -- 'lessons_completed', 'courses_completed', 'streak_days', etc.
    requirement_value INTEGER DEFAULT 1,
    xp_reward INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active badges" ON public.badges
    FOR SELECT USING (is_active = true OR is_admin());

CREATE POLICY "Admins can manage badges" ON public.badges
    FOR ALL USING (is_admin());

-- =============================================
-- 14. USER BADGES (Earned)
-- =============================================
CREATE TABLE public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view user badges" ON public.user_badges
    FOR SELECT USING (true);

CREATE POLICY "System can insert badges" ON public.user_badges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 15. DAILY CHALLENGES
-- =============================================
CREATE TABLE public.daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    challenge_type TEXT DEFAULT 'coding', -- 'coding', 'quiz', 'reading'
    difficulty TEXT DEFAULT 'medium',
    xp_reward INTEGER DEFAULT 50,
    challenge_date DATE NOT NULL UNIQUE,
    problem_link TEXT,
    solution TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active challenges" ON public.daily_challenges
    FOR SELECT USING (is_active = true OR is_admin());

CREATE POLICY "Admins can manage challenges" ON public.daily_challenges
    FOR ALL USING (is_admin());

-- =============================================
-- 16. LEADERBOARD ENTRIES
-- =============================================
CREATE TABLE public.leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    period_type TEXT NOT NULL, -- 'weekly', 'monthly', 'all_time'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    xp_earned INTEGER DEFAULT 0,
    rank_position INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, period_type, period_start)
);

ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard_entries
    FOR SELECT USING (true);

CREATE POLICY "System can manage leaderboard" ON public.leaderboard_entries
    FOR ALL USING (is_admin());

-- =============================================
-- 17. ALGORITHM BOOKMARKS
-- =============================================
CREATE TABLE public.algorithm_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    algorithm_id UUID NOT NULL REFERENCES public.algorithms(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, algorithm_id)
);

ALTER TABLE public.algorithm_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks" ON public.algorithm_bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks" ON public.algorithm_bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON public.algorithm_bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_user_gamification_updated_at
    BEFORE UPDATE ON public.user_gamification
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_algorithms_updated_at
    BEFORE UPDATE ON public.algorithms
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_course_lessons_updated_at
    BEFORE UPDATE ON public.course_lessons
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_lesson_progress_updated_at
    BEFORE UPDATE ON public.lesson_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_doubts_updated_at
    BEFORE UPDATE ON public.doubts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_doubt_responses_updated_at
    BEFORE UPDATE ON public.doubt_responses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_saved_roadmaps_updated_at
    BEFORE UPDATE ON public.saved_roadmaps
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_roadmap_progress_updated_at
    BEFORE UPDATE ON public.roadmap_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- INSERT DEFAULT BADGES
-- =============================================
INSERT INTO public.badges (name, slug, description, icon, category, requirement_type, requirement_value, xp_reward) VALUES
('First Step', 'first-step', 'Complete your first lesson', '🎯', 'milestone', 'lessons_completed', 1, 50),
('Algorithm Ace', 'algorithm-ace', 'Study 10 algorithms', '🧮', 'achievement', 'algorithms_studied', 10, 200),
('Roadmap Runner', 'roadmap-runner', 'Complete a learning roadmap', '🗺️', 'milestone', 'roadmaps_completed', 1, 500),
('Helper', 'helper', 'Answer 5 community doubts', '🤝', 'achievement', 'doubts_answered', 5, 150),
('Streak Master', 'streak-master', 'Maintain a 7-day learning streak', '🔥', 'streak', 'streak_days', 7, 300),
('Course Champion', 'course-champion', 'Complete your first course', '🏆', 'milestone', 'courses_completed', 1, 500),
('Knowledge Seeker', 'knowledge-seeker', 'Complete 50 lessons', '📚', 'achievement', 'lessons_completed', 50, 400),
('Dedicated Learner', 'dedicated-learner', 'Maintain a 30-day streak', '⭐', 'streak', 'streak_days', 30, 1000);

-- =============================================
-- INSERT DEFAULT ALGORITHM CATEGORIES
-- =============================================
INSERT INTO public.algorithm_categories (name, slug, description, icon, sort_order) VALUES
('Sorting Algorithms', 'sorting', 'Algorithms for arranging elements in order', '📊', 1),
('Searching Algorithms', 'searching', 'Algorithms for finding elements', '🔍', 2),
('Recursion & Backtracking', 'recursion', 'Solving problems by breaking them down', '🔄', 3),
('Dynamic Programming', 'dynamic-programming', 'Optimization by storing subproblem solutions', '💡', 4),
('Graph Algorithms', 'graphs', 'Algorithms for graph data structures', '🕸️', 5),
('Trees & Linked Lists', 'trees-lists', 'Hierarchical and linear data structures', '🌳', 6),
('Greedy Algorithms', 'greedy', 'Making locally optimal choices', '⚡', 7),
('String Algorithms', 'strings', 'Pattern matching and text processing', '📝', 8);