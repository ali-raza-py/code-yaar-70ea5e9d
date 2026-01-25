import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cpu } from "lucide-react";

export type AIModel = "gemini-3-flash-preview" | "gemini-3-pro-preview" | "gemini-2.5-flash" | "gemini-2.5-pro" | "gpt-5" | "gpt-5-mini" | "gpt-5.2";

interface AIModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
}

const models: { id: AIModel; name: string; description: string }[] = [
  { 
    id: "gemini-3-flash-preview", 
    name: "Gemini 3 Flash", 
    description: "Fast next-gen (Default)" 
  },
  { 
    id: "gemini-3-pro-preview", 
    name: "Gemini 3 Pro", 
    description: "Advanced next-gen" 
  },
  { 
    id: "gemini-2.5-flash", 
    name: "Gemini 2.5 Flash", 
    description: "Fast & balanced" 
  },
  { 
    id: "gemini-2.5-pro", 
    name: "Gemini 2.5 Pro", 
    description: "Complex reasoning" 
  },
  { 
    id: "gpt-5", 
    name: "GPT-5", 
    description: "Powerful all-rounder" 
  },
  { 
    id: "gpt-5-mini", 
    name: "GPT-5 Mini", 
    description: "Fast & efficient" 
  },
  { 
    id: "gpt-5.2", 
    name: "GPT-5.2", 
    description: "Latest OpenAI model" 
  },
];

export function AIModelSelector({ selectedModel, onModelChange }: AIModelSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Cpu className="w-4 h-4 text-muted-foreground" />
      <Select value={selectedModel} onValueChange={(value) => onModelChange(value as AIModel)}>
        <SelectTrigger className="w-[180px] h-9 text-xs bg-secondary/50">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent className="bg-popover border border-border z-50">
          {models.map((model) => (
            <SelectItem 
              key={model.id} 
              value={model.id}
              className="text-xs cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="font-medium">{model.name}</span>
                <span className="text-muted-foreground text-[10px]">{model.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
