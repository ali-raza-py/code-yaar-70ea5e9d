
# Platform Enhancement Plan - Programiz-Style Learning System

## Current State Analysis

Your project already has a solid foundation:
- **Authentication**: Complete signup/login with password validation, Google OAuth, and JWT
- **User Management**: Roles system (admin/user), profiles, and preferences
- **Courses Table**: 12 sample courses already exist (Python, JavaScript, React, HTML/CSS, etc.)
- **Welcome Popup**: Animated glassmorphism popup for new/returning users
- **Dashboard**: XP, levels, streaks, badges tracking
- **Admin Panel**: User management, AI tools, resources, FAQ management

## What's Missing

The main gap is **real lesson content** - the `course_lessons` table exists but is empty. We need to populate it with structured lessons like Programiz (explanation, code examples, outputs, practice tasks).

---

## Phase 1: Database - Populate Course Lessons

### Insert Real Lesson Content

For each of the 12 existing courses, add structured lessons with:
- Title and slug
- Lesson content (markdown with explanations)
- Code examples embedded in content
- Lesson order and XP rewards
- Lesson type (theory, code-along, project)

**Example structure for Python course** (18 lessons):
1. Introduction to Python
2. Variables and Data Types
3. Python Operators
4. Input and Output
5. Control Flow: if-else
6. Loops: for and while
7. Functions
8. Lists and Tuples
9. Dictionaries
10. String Methods
11. File Handling
12. Error Handling
13. Object-Oriented Programming
14. Classes and Objects
15. Inheritance
16. Modules and Packages
17. Working with JSON
18. Final Project

Each lesson will include:
- Clear explanation text
- Multiple code examples with expected output
- Practice problem suggestions

---

## Phase 2: Course Viewer Page

### New Component: `CourseViewer.tsx`

Create a full course experience page at `/courses/:slug`:

**Features:**
- Sidebar navigation with lesson list
- Lesson progress indicators (completed/current/locked)
- Main content area with markdown rendering
- Code blocks with syntax highlighting (using highlight.js)
- Language tabs for multi-language examples
- "Mark Complete" button awarding XP
- "Next Lesson" navigation
- Progress percentage display

### New Component: `LessonContent.tsx`

Renders individual lesson with:
- Theory sections with formatted markdown
- Code examples with copy button
- Output/result display
- Practice problem links
- Estimated reading time

---

## Phase 3: Admin Course Management

### New Admin Tab: `CoursesAdmin.tsx`

Add a "Courses" tab to the admin panel:
- List all courses with edit/delete
- Add new course form
- Manage lessons within each course
- Rich text editor for lesson content
- Reorder lessons via drag-and-drop (UI placeholder)
- Toggle publish status

### New Component: `LessonEditor.tsx`

Form for creating/editing lessons:
- Title and slug
- Markdown content editor
- Code example fields with language selector
- XP reward setting
- Order position

---

## Phase 4: Progress Tracking Integration

### Update `lesson_progress` table usage

When user completes a lesson:
1. Insert/update `lesson_progress` record
2. Award XP to `user_gamification`
3. Update `total_lessons_completed` count
4. Check for badge unlocks
5. Update course completion percentage

### New Hook: `useCourseProgress.ts`

Manages:
- Fetching user's progress for a course
- Marking lessons complete
- Calculating completion percentage
- Determining next unlocked lesson

---

## Phase 5: Enhanced Dashboard

### Show Enrolled Courses

Update Dashboard to display:
- Currently enrolled courses with progress bars
- "Resume Learning" button linking to last lesson
- Recently completed lessons
- Recommended next courses based on preferences

---

## Phase 6: UI Refinements

### Code Display Component: `CodeBlock.tsx`

Features:
- Syntax highlighting via highlight.js
- Language badge
- Copy to clipboard button
- Line numbers option
- Dark theme matching app

### Output Display Component: `OutputBlock.tsx`

Shows expected output:
- Terminal-style appearance
- Collapsible for long outputs

---

## Technical Implementation Details

### Database Operations

**Insert approximately 200+ lessons** across 12 courses:
- Python: 18 lessons
- JavaScript: 20 lessons
- HTML/CSS: 15 lessons
- React: 30 lessons
- Node.js: 22 lessons
- TypeScript: 14 lessons
- Data Structures: 25 lessons
- Algorithms: 28 lessons
- ML Basics: 35 lessons
- Docker: 20 lessons
- SQL: 16 lessons
- Cybersecurity: 12 lessons

### New Files to Create

```text
src/pages/CourseViewer.tsx         # Full course page
src/components/courses/
  ├── LessonContent.tsx            # Lesson display
  ├── LessonSidebar.tsx            # Navigation sidebar
  ├── CodeBlock.tsx                # Syntax-highlighted code
  ├── OutputBlock.tsx              # Output display
  └── ProgressIndicator.tsx        # Lesson progress dots

src/components/admin/
  └── CoursesAdmin.tsx             # Admin course management

src/hooks/
  └── useCourseProgress.ts         # Progress tracking hook
```

### Route Updates

Add to `App.tsx`:
```
/courses/:slug  →  CourseViewer
```

### Navbar Update

Ensure "Courses" link is prominent in navigation.

---

## Implementation Order

1. **Seed lesson data** - Insert 50 initial lessons (Python + JavaScript courses) for testing
2. **Create CourseViewer page** - Main learning interface
3. **Add code display components** - Syntax highlighting, copy, output
4. **Implement progress tracking** - Mark complete, XP awards
5. **Update Dashboard** - Show enrolled courses
6. **Add admin management** - CRUD for courses and lessons
7. **Seed remaining lessons** - Complete all 12 courses
8. **Polish and test** - Ensure smooth learning experience

---

## Result

After implementation, users will be able to:
- Browse 12 structured programming courses
- Read lessons with explanations and code examples
- See syntax-highlighted code with copy functionality
- Track their progress with XP and completion percentage
- Resume from where they left off
- Earn badges for course completions

The platform will function like Programiz with a dark, modern, professional design - all powered by the existing database and backend.
