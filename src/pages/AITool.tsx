import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { useRoadmapGenerator } from "@/hooks/useRoadmapGenerator";
import { useLearningAssistant } from "@/hooks/useLearningAssistant";
import { LanguageSelector, type Language } from "@/components/learning/LanguageSelector";
import { LevelSelector, type Level } from "@/components/learning/LevelSelector";
import { RoadmapStep, type StepContent } from "@/components/learning/RoadmapStep";
import { CodeCanvas } from "@/components/learning/CodeCanvas";
import { LearningAssistant } from "@/components/learning/LearningAssistant";
import { ProgressBar } from "@/components/learning/ProgressBar";
import { Button } from "@/components/ui/button";
import { Lock, Loader2, ArrowRight, ArrowLeft, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

type Step = "language" | "level" | "roadmap";

export default function AITool() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentWizardStep, setCurrentWizardStep] = useState<Step>("language");
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [canvasCode, setCanvasCode] = useState("");

  const { isGenerating, roadmap, generateRoadmap, clearRoadmap } = useRoadmapGenerator({
    onError: (error) => toast({ title: "Error", description: error, variant: "destructive" }),
  });

  const { isLoading: isAILoading, output, processRequest, clearOutput } = useAIAssistant({
    onError: (error) => toast({ title: "Error", description: error, variant: "destructive" }),
  });

  const { isLoading: isAssistantLoading, sendMessage } = useLearningAssistant({
    onError: (error) => toast({ title: "Error", description: error, variant: "destructive" }),
  });

  const currentStep = roadmap[currentStepIndex] || null;

  const handleLanguageSelect = (lang: Language) => {
    setSelectedLanguage(lang);
  };

  const handleLevelSelect = (level: Level) => {
    setSelectedLevel(level);
  };

  const handleGenerateRoadmap = async () => {
    if (selectedLanguage && selectedLevel) {
      await generateRoadmap(selectedLanguage, selectedLevel);
      setCurrentWizardStep("roadmap");
    }
  };

  const handleOpenInCanvas = (code: string) => {
    setCanvasCode(code);
  };

  const handleCanvasAction = (code: string, action: "run" | "debug" | "explain") => {
    if (!selectedLanguage) return;
    const mode = action === "run" ? "explain" : action;
    processRequest(mode, code, selectedLanguage, "gemini-3-flash-preview");
  };

  const handleAssistantMessage = async (message: string) => {
    if (!selectedLanguage) throw new Error("No language selected");
    return sendMessage(message, selectedLanguage, currentStep, canvasCode);
  };

  const handleCompleteStep = () => {
    if (currentStep && !completedSteps.includes(currentStep.id)) {
      setCompletedSteps([...completedSteps, currentStep.id]);
      if (currentStepIndex < roadmap.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      }
      toast({ title: "Step Completed! 🎉", description: "Keep up the great work!" });
    }
  };

  const handleReset = () => {
    setCurrentWizardStep("language");
    setSelectedLanguage(null);
    setSelectedLevel(null);
    setCompletedSteps([]);
    setCurrentStepIndex(0);
    setCanvasCode("");
    clearRoadmap();
    clearOutput();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Lock className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h1 className="font-display text-3xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">Access Code-Yaar's learning platform by signing in.</p>
          <Link to="/auth"><Button variant="default" size="lg">Sign In</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">
            Code<span className="text-gradient">-Yaar</span>
          </h1>
          <p className="text-muted-foreground">Choose a language. Follow the path. Become job-ready.</p>
        </div>

        {/* Wizard Steps */}
        {currentWizardStep === "language" && (
          <div className="max-w-5xl mx-auto">
            <LanguageSelector selectedLanguage={selectedLanguage} onSelect={handleLanguageSelect} />
            {selectedLanguage && (
              <div className="flex justify-center mt-8">
                <Button onClick={() => setCurrentWizardStep("level")} size="lg">
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}

        {currentWizardStep === "level" && (
          <div className="max-w-4xl mx-auto">
            <LevelSelector selectedLevel={selectedLevel} onSelect={handleLevelSelect} />
            <div className="flex justify-center gap-4 mt-8">
              <Button variant="outline" onClick={() => setCurrentWizardStep("language")}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button onClick={handleGenerateRoadmap} disabled={!selectedLevel || isGenerating} size="lg">
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Generate Roadmap <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {currentWizardStep === "roadmap" && roadmap.length > 0 && selectedLanguage && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Progress + Roadmap */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold">Your Learning Path</h2>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-2" /> Start Over
                </Button>
              </div>
              
              <ProgressBar currentStep={currentStepIndex + 1} totalSteps={roadmap.length} completedSteps={completedSteps} />

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {roadmap.slice(0, 10).map((step, idx) => (
                  <RoadmapStep
                    key={step.id}
                    step={step}
                    isCompleted={completedSteps.includes(step.id)}
                    isCurrent={idx === currentStepIndex}
                    onComplete={handleCompleteStep}
                    onOpenInCanvas={handleOpenInCanvas}
                  />
                ))}
              </div>

              {/* Code Canvas */}
              <div className="mt-6">
                <CodeCanvas
                  initialCode={canvasCode}
                  language={selectedLanguage}
                  onAskAssistant={handleCanvasAction}
                  isLoading={isAILoading}
                  output={output}
                />
              </div>
            </div>

            {/* Right: Learning Assistant */}
            <div className="lg:col-span-1">
              <LearningAssistant
                language={selectedLanguage}
                currentStep={currentStep}
                userCode={canvasCode}
                onSendMessage={handleAssistantMessage}
                isLoading={isAssistantLoading}
              />
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Generating your personalized roadmap...</p>
          </div>
        )}
      </div>
    </div>
  );
}
