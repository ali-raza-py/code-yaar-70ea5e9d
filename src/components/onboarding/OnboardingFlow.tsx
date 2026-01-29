import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, SkipForward, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingProgress } from "./OnboardingProgress";
import { OnboardingQuestion } from "./OnboardingQuestion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const QUESTIONS = [
  {
    id: "experience_level",
    question: "How much coding experience do you have?",
    subtitle: "Be honest — we'll tailor your learning path accordingly",
    options: [
      { value: "beginner", label: "Complete Beginner", icon: "🌱", description: "I'm just starting out" },
      { value: "basics", label: "Know the Basics", icon: "📚", description: "I understand fundamentals" },
      { value: "intermediate", label: "Intermediate", icon: "💻", description: "I can build small projects" },
      { value: "advanced", label: "Advanced", icon: "🚀", description: "I'm quite experienced" },
    ],
  },
  {
    id: "user_type",
    question: "What describes you best?",
    subtitle: "This helps us understand your learning context",
    options: [
      { value: "school_student", label: "School Student", icon: "🎒", description: "Learning in school" },
      { value: "college_student", label: "College Student", icon: "🎓", description: "Pursuing higher education" },
      { value: "self_learner", label: "Self Learner", icon: "📖", description: "Learning independently" },
      { value: "job_seeker", label: "Job Seeker", icon: "💼", description: "Preparing for interviews" },
    ],
  },
  {
    id: "learning_goal",
    question: "What's your main learning goal?",
    subtitle: "We'll customize your roadmap based on this",
    options: [
      { value: "web_dev", label: "Web Development", icon: "🌐", description: "Build websites & web apps" },
      { value: "app_dev", label: "App Development", icon: "📱", description: "Create mobile apps" },
      { value: "ai_ml", label: "AI / Machine Learning", icon: "🤖", description: "Explore artificial intelligence" },
      { value: "game_dev", label: "Game Development", icon: "🎮", description: "Design and build games" },
      { value: "cybersecurity", label: "Cybersecurity", icon: "🔒", description: "Secure systems & networks" },
      { value: "unsure", label: "Not Sure Yet", icon: "🤔", description: "I'm exploring options" },
    ],
  },
  {
    id: "daily_time",
    question: "How much time can you dedicate daily?",
    subtitle: "We'll pace your learning accordingly",
    options: [
      { value: "30", label: "30 Minutes", icon: "⏱️", description: "Quick daily sessions" },
      { value: "60", label: "1 Hour", icon: "🕐", description: "Balanced learning" },
      { value: "120", label: "2 Hours", icon: "🕑", description: "Intensive practice" },
      { value: "180", label: "3+ Hours", icon: "🔥", description: "Full commitment" },
    ],
  },
  {
    id: "learning_preference",
    question: "What do you enjoy most?",
    subtitle: "This shapes your learning experience",
    options: [
      { value: "projects", label: "Building Projects", icon: "🛠️", description: "Learn by creating" },
      { value: "problems", label: "Solving Problems", icon: "🧩", description: "Challenge your mind" },
      { value: "theory", label: "Learning Theory", icon: "📝", description: "Understand concepts deeply" },
      { value: "mixed", label: "Mix of Everything", icon: "🎯", description: "Balanced approach" },
    ],
  },
  {
    id: "content_format",
    question: "How do you prefer to learn?",
    subtitle: "We'll prioritize content in your preferred format",
    options: [
      { value: "guided", label: "Step-by-Step Guidance", icon: "🗺️", description: "Clear structured paths" },
      { value: "challenges", label: "Challenges First", icon: "⚡", description: "Jump into problems" },
      { value: "video", label: "Video Learning", icon: "🎬", description: "Watch and follow along" },
      { value: "reading", label: "Reading Content", icon: "📄", description: "Text-based learning" },
    ],
  },
];

export function OnboardingFlow() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = QUESTIONS[currentStep - 1];
  const isLastStep = currentStep === QUESTIONS.length;
  const canProceed = answers[currentQuestion?.id];

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = () => {
    if (!isLastStep && canProceed) {
      setCurrentStep((prev) => prev + 1);
    } else if (isLastStep) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to save your preferences");
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);
    try {
      const preferences = {
        user_id: user.id,
        experience_level: answers.experience_level || null,
        user_type: answers.user_type || null,
        learning_goal: answers.learning_goal || null,
        daily_time_minutes: answers.daily_time ? parseInt(answers.daily_time) : 60,
        learning_preference: answers.learning_preference || null,
        content_format: answers.content_format || null,
        onboarding_completed: true,
      };

      const { error } = await supabase
        .from("user_preferences")
        .upsert(preferences, { onConflict: "user_id" });

      if (error) throw error;

      // Also create gamification entry
      await supabase
        .from("user_gamification")
        .upsert({ user_id: user.id }, { onConflict: "user_id" });

      toast.success("Welcome to Code Yaar! 🎉");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Let's personalize your experience</span>
          </motion.div>
        </div>

        {/* Progress */}
        <OnboardingProgress currentStep={currentStep} totalSteps={QUESTIONS.length} />

        {/* Question */}
        <div className="flex-1 flex items-center justify-center py-8">
          <AnimatePresence mode="wait">
            <OnboardingQuestion
              key={currentStep}
              question={currentQuestion.question}
              subtitle={currentQuestion.subtitle}
              options={currentQuestion.options}
              selectedValue={answers[currentQuestion.id] || null}
              onSelect={handleSelect}
            />
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between max-w-2xl mx-auto w-full pt-8"
        >
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground"
          >
            Skip
            <SkipForward className="w-4 h-4 ml-2" />
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed || isSubmitting}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            {isLastStep ? (
              isSubmitting ? "Saving..." : "Get Started"
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
