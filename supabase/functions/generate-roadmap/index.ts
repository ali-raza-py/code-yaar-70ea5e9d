import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const levelStepCounts: Record<string, number> = {
  beginner: 20,
  intermediate: 15,
  advanced: 12,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { language, level, stepsCount } = await req.json();

    if (!language || !level) {
      return new Response(
        JSON.stringify({ error: "Missing language or level" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const totalSteps = Math.min(stepsCount || levelStepCounts[level] || 15, 20);

    const systemPrompt = `You are an expert programming instructor. Generate a ${totalSteps}-step learning roadmap for ${language} at the ${level} level.

CRITICAL: Return ONLY a valid JSON array. No markdown, no code blocks, no explanation - just the raw JSON array.

Each step must have this exact structure:
{
  "id": number,
  "title": "Short title (3-6 words)",
  "concept": "One sentence description",
  "tutorial": "2-3 paragraphs explaining the concept with examples",
  "code": "Runnable code example (5-15 lines) with comments",
  "task": "A practice exercise",
  "whatToLearn": ["Point 1", "Point 2", "Point 3"]
}

For ${level} level:
- Beginner: Start from basics (variables, types), progress to functions, loops, basic OOP
- Intermediate: Cover OOP, data structures, algorithms, error handling
- Advanced: Design patterns, optimization, system design, advanced features

Return exactly ${totalSteps} steps in a JSON array.`;

    console.log(`Generating ${totalSteps}-step roadmap for ${language} (${level})`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate a ${totalSteps}-step ${language} learning roadmap for ${level} level. Return ONLY the JSON array, nothing else.` },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Service busy. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service quota exceeded." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Return fallback roadmap on API errors
      return new Response(
        JSON.stringify({ roadmap: generateFallbackRoadmap(language, level, totalSteps) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    console.log("AI response received, parsing...");

    let roadmap: any[];
    try {
      // Clean the content - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();

      // Try to extract JSON array
      const jsonMatch = cleanContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        roadmap = JSON.parse(jsonMatch[0]);
      } else {
        roadmap = JSON.parse(cleanContent);
      }

      // Validate roadmap structure
      if (!Array.isArray(roadmap) || roadmap.length === 0) {
        throw new Error("Invalid roadmap format");
      }

      // Ensure each step has required fields
      roadmap = roadmap.map((step, idx) => ({
        id: step.id || idx + 1,
        title: step.title || `Step ${idx + 1}`,
        concept: step.concept || `Learn ${language} concept`,
        tutorial: step.tutorial || `This step covers an important ${language} concept.`,
        code: step.code || `// ${language} example\nconsole.log("Step ${idx + 1}");`,
        task: step.task || `Practice this concept`,
        whatToLearn: Array.isArray(step.whatToLearn) ? step.whatToLearn : ["Key concept", "Practice coding", "Apply knowledge"],
      }));

    } catch (parseError) {
      console.error("Failed to parse roadmap JSON:", parseError);
      roadmap = generateFallbackRoadmap(language, level, totalSteps);
    }

    console.log(`Successfully generated ${roadmap.length}-step roadmap for user ${user.id}`);

    return new Response(
      JSON.stringify({ roadmap: roadmap.slice(0, totalSteps) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Roadmap generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate roadmap" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateFallbackRoadmap(language: string, level: string, steps: number) {
  const topics = getFallbackTopics(language, level);
  
  return Array.from({ length: steps }, (_, i) => {
    const topic = topics[i % topics.length];
    return {
      id: i + 1,
      title: topic.title,
      concept: topic.concept,
      tutorial: `In this step, you'll learn about ${topic.title.toLowerCase()} in ${language}. ${topic.description} This is an essential skill for any ${language} developer.`,
      code: topic.code,
      task: `Practice: ${topic.task}`,
      whatToLearn: topic.points,
    };
  });
}

function getFallbackTopics(language: string, level: string) {
  const langLower = language.toLowerCase();
  
  const beginnerTopics = [
    {
      title: "Variables and Data Types",
      concept: "Understanding how to store and work with data",
      description: "Variables are containers for storing data values. Understanding data types is fundamental to programming.",
      code: langLower === "python" 
        ? `# Variables in Python\nname = "Alice"\nage = 25\nheight = 5.6\nis_student = True\n\nprint(f"{name} is {age} years old")`
        : `// Variables in ${language}\nlet name = "Alice";\nlet age = 25;\nlet height = 5.6;\nlet isStudent = true;\n\nconsole.log(\`\${name} is \${age} years old\`);`,
      task: "Create variables to store your personal information",
      points: ["Variable declaration", "Data types", "Type conversion"],
    },
    {
      title: "Control Flow - Conditionals",
      concept: "Making decisions in your code with if/else",
      description: "Conditional statements allow your program to make decisions based on conditions.",
      code: langLower === "python"
        ? `# If-else in Python\nage = 18\n\nif age >= 18:\n    print("You are an adult")\nelif age >= 13:\n    print("You are a teenager")\nelse:\n    print("You are a child")`
        : `// If-else in ${language}\nlet age = 18;\n\nif (age >= 18) {\n  console.log("You are an adult");\n} else if (age >= 13) {\n  console.log("You are a teenager");\n} else {\n  console.log("You are a child");\n}`,
      task: "Write a program that grades a test score",
      points: ["If statements", "Else clauses", "Comparison operators"],
    },
    {
      title: "Loops",
      concept: "Repeating actions with for and while loops",
      description: "Loops allow you to repeat code multiple times without writing it out each time.",
      code: langLower === "python"
        ? `# Loops in Python\nfor i in range(5):\n    print(f"Count: {i}")\n\nfruits = ["apple", "banana", "orange"]\nfor fruit in fruits:\n    print(fruit)`
        : `// Loops in ${language}\nfor (let i = 0; i < 5; i++) {\n  console.log(\`Count: \${i}\`);\n}\n\nconst fruits = ["apple", "banana", "orange"];\nfor (const fruit of fruits) {\n  console.log(fruit);\n}`,
      task: "Create a loop that prints numbers 1 to 10",
      points: ["For loops", "While loops", "Loop control"],
    },
    {
      title: "Functions",
      concept: "Creating reusable blocks of code",
      description: "Functions help organize code into reusable pieces and make programs easier to understand.",
      code: langLower === "python"
        ? `# Functions in Python\ndef greet(name):\n    return f"Hello, {name}!"\n\ndef add(a, b):\n    return a + b\n\nprint(greet("World"))\nprint(add(5, 3))`
        : `// Functions in ${language}\nfunction greet(name) {\n  return \`Hello, \${name}!\`;\n}\n\nfunction add(a, b) {\n  return a + b;\n}\n\nconsole.log(greet("World"));\nconsole.log(add(5, 3));`,
      task: "Write a function that calculates the area of a rectangle",
      points: ["Function definition", "Parameters", "Return values"],
    },
    {
      title: "Arrays and Lists",
      concept: "Working with collections of data",
      description: "Arrays (or lists) allow you to store multiple values in a single variable.",
      code: langLower === "python"
        ? `# Lists in Python\nnumbers = [1, 2, 3, 4, 5]\n\n# Add element\nnumbers.append(6)\n\n# Access elements\nfirst = numbers[0]\nlast = numbers[-1]\n\nprint(f"Sum: {sum(numbers)}")`
        : `// Arrays in ${language}\nconst numbers = [1, 2, 3, 4, 5];\n\n// Add element\nnumbers.push(6);\n\n// Access elements\nconst first = numbers[0];\nconst last = numbers[numbers.length - 1];\n\nconsole.log(\`Sum: \${numbers.reduce((a, b) => a + b)}\`);`,
      task: "Create an array and find the maximum value",
      points: ["Array creation", "Indexing", "Array methods"],
    },
  ];

  const intermediateTopics = [
    {
      title: "Object-Oriented Programming",
      concept: "Organizing code with classes and objects",
      description: "OOP helps structure code by grouping related data and functions together.",
      code: langLower === "python"
        ? `# Classes in Python\nclass Dog:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n    \n    def bark(self):\n        return f"{self.name} says woof!"\n\nmy_dog = Dog("Buddy", 3)\nprint(my_dog.bark())`
        : `// Classes in ${language}\nclass Dog {\n  constructor(name, age) {\n    this.name = name;\n    this.age = age;\n  }\n  \n  bark() {\n    return \`\${this.name} says woof!\`;\n  }\n}\n\nconst myDog = new Dog("Buddy", 3);\nconsole.log(myDog.bark());`,
      task: "Create a class representing a bank account",
      points: ["Classes", "Constructors", "Methods"],
    },
    {
      title: "Error Handling",
      concept: "Gracefully handling errors in your code",
      description: "Error handling prevents your program from crashing when something goes wrong.",
      code: langLower === "python"
        ? `# Error handling in Python\ntry:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print("Cannot divide by zero!")\nexcept Exception as e:\n    print(f"Error: {e}")\nfinally:\n    print("Cleanup done")`
        : `// Error handling in ${language}\ntry {\n  const result = JSON.parse("invalid json");\n} catch (error) {\n  console.error("Parse error:", error.message);\n} finally {\n  console.log("Cleanup done");\n}`,
      task: "Add error handling to a file reading function",
      points: ["Try-catch blocks", "Exception types", "Finally clause"],
    },
  ];

  return level === "beginner" ? beginnerTopics : 
         level === "intermediate" ? [...beginnerTopics, ...intermediateTopics] : 
         [...intermediateTopics, ...beginnerTopics];
}
