import { useState } from "react";
import { cn } from "@/utils/cn";
import { FileText, GitBranch, Zap, Sparkles } from "lucide-react";
import { useDiagramStore } from "@/store/useDiagramStore";
import { useChatStore } from "@/store/useChatStore";

export default function EmptyState() {
  const { generateDiagram, isGenerating } = useDiagramStore();
  const { fetchChatHistory } = useChatStore();

  const suggestions = [
    {
      icon: GitBranch,
      title: "User authentication flow",
      prompt: "Create a flowchart for user login and signup process"
    },
    {
      icon: FileText,
      title: "Database schema",
      prompt: "Design an ER diagram for a blog application with users, posts, and comments"
    },
    {
      icon: Zap,
      title: "API architecture",
      prompt: "Show a sequence diagram for REST API request-response cycle"
    },
  ];

  const [prompt, setPrompt] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const diagram = await generateDiagram(prompt.trim());
    if (diagram?.chatId) {
      // Fetch chat history for the new diagram only if chatId exists
      await fetchChatHistory(diagram.chatId);
    }
    setPrompt("");
  };

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="flex flex-col gap-16 max-w-3xl items-center w-full">
        <div className="text-center space-y-4">
          <Sparkles className="w-12 h-12 mx-auto text-blue-500" />
          <h1 className="text-4xl font-bold text-gray-900">Create Your Diagram</h1>
          <p className="text-gray-600 text-lg">Describe what you want to visualize, and we'll generate it for you</p>
        </div>

        <div className="relative w-full">
          <textarea
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe the diagram you want to create... (e.g., 'Create a flowchart showing the user registration process')"
            value={prompt}
            disabled={isGenerating}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleGenerate();
              }
            }}
            className={cn(
              "w-full min-h-[120px] max-h-[200px] p-4 pb-12",
              "border-2 border-gray-300 rounded-lg",
              "resize-none overflow-y-auto",
              "focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all"
            )} />
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className={cn(
              "absolute bottom-3 right-3",
              "px-6 py-2",
              "bg-blue-500 text-white rounded-lg font-medium",
              "hover:bg-blue-600",
              "disabled:bg-gray-300 disabled:cursor-not-allowed",
              "transition-colors"
            )}
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>

        <p className="hidden md:block text-xs text-gray-500 -mt-2">
          Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Enter</kbd> to generate
        </p>

        <div className="w-full">
          <p className="text-sm font-medium text-gray-700 mb-3">Try these examples:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.title}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setPrompt(suggestion.prompt)}
                disabled={isGenerating}
                className={cn(
                  "flex flex-col items-start gap-3 p-4",
                  "border-2 border-gray-200 rounded-lg",
                  "hover:border-blue-500 hover:bg-blue-50",
                  "transition-all cursor-pointer",
                  "text-left group",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "animate-fade-in"
                )}
              >
                <suggestion.icon className="w-5 h-5 text-gray-600 group-hover:text-blue-500 transition-colors" />
                <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {suggestion.title}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}