import { useState, useCallback } from "react";
import { Helmet } from "react-helmet";
import { 
  Sparkles, 
  Play, 
  Download, 
  Copy, 
  Check, 
  Palette,
  Layers,
  Zap,
  RotateCcw,
  Code2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface EffectConfig {
  type: "glow" | "gradient" | "shadow" | "neon" | "glass";
  color1: string;
  color2: string;
  intensity: number;
  blur: number;
  animation: "none" | "pulse" | "wave" | "shimmer";
  animationSpeed: number;
}

const defaultConfig: EffectConfig = {
  type: "glow",
  color1: "#8b5cf6",
  color2: "#06b6d4",
  intensity: 50,
  blur: 20,
  animation: "none",
  animationSpeed: 2,
};

const effectPresets = [
  { name: "Purple Glow", type: "glow", color1: "#8b5cf6", color2: "#a855f7" },
  { name: "Cyber Neon", type: "neon", color1: "#06b6d4", color2: "#22d3ee" },
  { name: "Sunset Gradient", type: "gradient", color1: "#f97316", color2: "#ec4899" },
  { name: "Glass Morphism", type: "glass", color1: "#ffffff", color2: "#e5e7eb" },
  { name: "Deep Shadow", type: "shadow", color1: "#1e293b", color2: "#0f172a" },
] as const;

export default function FXCreator() {
  const { toast } = useToast();
  const [config, setConfig] = useState<EffectConfig>(defaultConfig);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const generateCSS = useCallback(() => {
    const { type, color1, color2, intensity, blur, animation, animationSpeed } = config;
    
    let css = "";
    const intensityFactor = intensity / 100;
    
    switch (type) {
      case "glow":
        css = `/* Glow Effect */
.fx-glow {
  box-shadow: 
    0 0 ${blur * intensityFactor}px ${color1},
    0 0 ${blur * 2 * intensityFactor}px ${color1}40,
    0 0 ${blur * 3 * intensityFactor}px ${color2}20;
  border: 1px solid ${color1}40;
}`;
        break;
      case "gradient":
        css = `/* Gradient Effect */
.fx-gradient {
  background: linear-gradient(
    135deg, 
    ${color1} 0%, 
    ${color2} 100%
  );
  background-size: ${200 + intensity}% ${200 + intensity}%;
}`;
        break;
      case "shadow":
        css = `/* Shadow Effect */
.fx-shadow {
  box-shadow: 
    0 ${4 + intensity / 10}px ${blur}px -${blur / 4}px ${color1}60,
    0 ${8 + intensity / 5}px ${blur * 2}px -${blur / 2}px ${color2}40;
}`;
        break;
      case "neon":
        css = `/* Neon Effect */
.fx-neon {
  text-shadow: 
    0 0 ${blur / 4}px ${color1},
    0 0 ${blur / 2}px ${color1},
    0 0 ${blur}px ${color1},
    0 0 ${blur * 1.5}px ${color2};
  color: #fff;
}`;
        break;
      case "glass":
        css = `/* Glass Morphism Effect */
.fx-glass {
  background: ${color1}10;
  backdrop-filter: blur(${blur}px);
  -webkit-backdrop-filter: blur(${blur}px);
  border: 1px solid ${color1}20;
  box-shadow: 0 8px 32px 0 ${color2}20;
}`;
        break;
    }
    
    if (animation !== "none") {
      const keyframes = getAnimationKeyframes(animation, type, color1, color2);
      css += `\n\n${keyframes}\n\n.fx-${type} {\n  animation: fx-${animation} ${animationSpeed}s ease-in-out infinite;\n}`;
    }
    
    return css;
  }, [config]);

  const getAnimationKeyframes = (animation: string, type: string, color1: string, color2: string) => {
    switch (animation) {
      case "pulse":
        return `@keyframes fx-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.02); }
}`;
      case "wave":
        return `@keyframes fx-wave {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}`;
      case "shimmer":
        return `@keyframes fx-shimmer {
  0% { filter: brightness(1); }
  50% { filter: brightness(1.2); }
  100% { filter: brightness(1); }
}`;
      default:
        return "";
    }
  };

  const getPreviewStyles = (): React.CSSProperties => {
    const { type, color1, color2, intensity, blur, animation, animationSpeed } = config;
    const intensityFactor = intensity / 100;
    
    const baseStyles: React.CSSProperties = {
      transition: "all 0.3s ease",
    };
    
    if (isPlaying && animation !== "none") {
      baseStyles.animation = `fx-${animation} ${animationSpeed}s ease-in-out infinite`;
    }
    
    switch (type) {
      case "glow":
        return {
          ...baseStyles,
          boxShadow: `
            0 0 ${blur * intensityFactor}px ${color1},
            0 0 ${blur * 2 * intensityFactor}px ${color1}40,
            0 0 ${blur * 3 * intensityFactor}px ${color2}20
          `,
          border: `1px solid ${color1}40`,
        };
      case "gradient":
        return {
          ...baseStyles,
          background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
          backgroundSize: `${200 + intensity}% ${200 + intensity}%`,
        };
      case "shadow":
        return {
          ...baseStyles,
          boxShadow: `
            0 ${4 + intensity / 10}px ${blur}px -${blur / 4}px ${color1}60,
            0 ${8 + intensity / 5}px ${blur * 2}px -${blur / 2}px ${color2}40
          `,
        };
      case "neon":
        return {
          ...baseStyles,
          textShadow: `
            0 0 ${blur / 4}px ${color1},
            0 0 ${blur / 2}px ${color1},
            0 0 ${blur}px ${color1},
            0 0 ${blur * 1.5}px ${color2}
          `,
          color: "#fff",
        };
      case "glass":
        return {
          ...baseStyles,
          background: `${color1}10`,
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          border: `1px solid ${color1}20`,
          boxShadow: `0 8px 32px 0 ${color2}20`,
        };
      default:
        return baseStyles;
    }
  };

  const handleCopyCSS = async () => {
    const css = generateCSS();
    await navigator.clipboard.writeText(css);
    setCopied(true);
    toast({
      title: "CSS Copied!",
      description: "The effect CSS has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const css = generateCSS();
    const blob = new Blob([css], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fx-${config.type}-effect.css`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Effect Exported!",
      description: "Your CSS effect file has been downloaded.",
    });
  };

  const handleReset = () => {
    setConfig(defaultConfig);
    setIsPlaying(false);
  };

  const applyPreset = (preset: typeof effectPresets[number]) => {
    setConfig((prev) => ({
      ...prev,
      type: preset.type as EffectConfig["type"],
      color1: preset.color1,
      color2: preset.color2,
    }));
  };

  return (
    <>
      <Helmet>
        <title>FX Creator | Code-Yaar</title>
        <meta
          name="description"
          content="Create, preview, and export stunning CSS effects for your coding projects with FX Creator."
        />
      </Helmet>

      <style>{`
        @keyframes fx-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
        @keyframes fx-wave {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fx-shimmer {
          0% { filter: brightness(1); }
          50% { filter: brightness(1.2); }
          100% { filter: brightness(1); }
        }
      `}</style>

      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              FX Creator
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Create Stunning <span className="text-gradient">Code Effects</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Design, preview, and export beautiful CSS effects for your projects. No coding required.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Preview Panel */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  Live Preview
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="gap-2"
                  >
                    <Play className={`w-4 h-4 ${isPlaying ? "text-primary" : ""}`} />
                    {isPlaying ? "Stop" : "Play"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Preview Area */}
              <div className="relative min-h-[300px] rounded-xl bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center p-8 overflow-hidden">
                <div className="absolute inset-0 grid-pattern opacity-20" />
                <div
                  className="relative z-10 w-48 h-48 rounded-2xl flex items-center justify-center bg-card"
                  style={getPreviewStyles()}
                >
                  {config.type === "neon" ? (
                    <span className="text-2xl font-bold" style={getPreviewStyles()}>
                      NEON
                    </span>
                  ) : (
                    <Code2 className="w-16 h-16 text-foreground/80" />
                  )}
                </div>
              </div>

              {/* Quick Presets */}
              <div className="mt-6">
                <Label className="text-sm font-medium mb-3 block">Quick Presets</Label>
                <div className="flex flex-wrap gap-2">
                  {effectPresets.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset(preset)}
                      className="gap-2"
                      style={{
                        borderColor: preset.color1,
                        background: `linear-gradient(135deg, ${preset.color1}20, ${preset.color2}20)`,
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ background: preset.color1 }}
                      />
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Controls Panel */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <Tabs defaultValue="effect" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="effect" className="gap-2">
                    <Zap className="w-4 h-4" />
                    Effect
                  </TabsTrigger>
                  <TabsTrigger value="colors" className="gap-2">
                    <Palette className="w-4 h-4" />
                    Colors
                  </TabsTrigger>
                  <TabsTrigger value="animation" className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Animation
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="effect" className="space-y-6">
                  {/* Effect Type */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Effect Type</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(["glow", "gradient", "shadow", "neon", "glass"] as const).map((type) => (
                        <Button
                          key={type}
                          variant={config.type === type ? "default" : "outline"}
                          size="sm"
                          onClick={() => setConfig((prev) => ({ ...prev, type }))}
                          className="capitalize"
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Intensity */}
                  <div>
                    <div className="flex justify-between mb-3">
                      <Label className="text-sm font-medium">Intensity</Label>
                      <span className="text-sm text-muted-foreground">{config.intensity}%</span>
                    </div>
                    <Slider
                      value={[config.intensity]}
                      onValueChange={([v]) => setConfig((prev) => ({ ...prev, intensity: v }))}
                      max={100}
                      step={1}
                    />
                  </div>

                  {/* Blur */}
                  <div>
                    <div className="flex justify-between mb-3">
                      <Label className="text-sm font-medium">Blur</Label>
                      <span className="text-sm text-muted-foreground">{config.blur}px</span>
                    </div>
                    <Slider
                      value={[config.blur]}
                      onValueChange={([v]) => setConfig((prev) => ({ ...prev, blur: v }))}
                      max={50}
                      step={1}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="colors" className="space-y-6">
                  {/* Primary Color */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Primary Color</Label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={config.color1}
                        onChange={(e) => setConfig((prev) => ({ ...prev, color1: e.target.value }))}
                        className="w-12 h-12 rounded-lg border border-border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.color1}
                        onChange={(e) => setConfig((prev) => ({ ...prev, color1: e.target.value }))}
                        className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm font-mono"
                      />
                    </div>
                  </div>

                  {/* Secondary Color */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Secondary Color</Label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={config.color2}
                        onChange={(e) => setConfig((prev) => ({ ...prev, color2: e.target.value }))}
                        className="w-12 h-12 rounded-lg border border-border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.color2}
                        onChange={(e) => setConfig((prev) => ({ ...prev, color2: e.target.value }))}
                        className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm font-mono"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="animation" className="space-y-6">
                  {/* Animation Type */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Animation Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["none", "pulse", "wave", "shimmer"] as const).map((anim) => (
                        <Button
                          key={anim}
                          variant={config.animation === anim ? "default" : "outline"}
                          size="sm"
                          onClick={() => setConfig((prev) => ({ ...prev, animation: anim }))}
                          className="capitalize"
                        >
                          {anim}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Animation Speed */}
                  <div>
                    <div className="flex justify-between mb-3">
                      <Label className="text-sm font-medium">Speed</Label>
                      <span className="text-sm text-muted-foreground">{config.animationSpeed}s</span>
                    </div>
                    <Slider
                      value={[config.animationSpeed]}
                      onValueChange={([v]) => setConfig((prev) => ({ ...prev, animationSpeed: v }))}
                      min={0.5}
                      max={5}
                      step={0.5}
                      disabled={config.animation === "none"}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-border">
                <Button onClick={handleCopyCSS} className="flex-1 gap-2">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy CSS"}
                </Button>
                <Button onClick={handleExport} variant="outline" className="flex-1 gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>

              {/* Generated CSS Preview */}
              <div className="mt-6">
                <Label className="text-sm font-medium mb-3 block">Generated CSS</Label>
                <pre className="p-4 rounded-lg bg-secondary/50 border border-border text-xs font-mono overflow-x-auto max-h-48 text-muted-foreground">
                  {generateCSS()}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
