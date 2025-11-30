import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/utils/cn";
import { useTrialStore } from "@/store/useTrialStore";
import apiClient from "@/api/apiClient";
import ZoomableCanvas from "@/components/features/diagram/ZoomableCanvas";
import DiagramPreview from "@/components/features/diagram/DiagramPreview";

export function Hero() {
  const [prompt, setPrompt] = useState("");
  const [diagramCode, setDiagramCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { incrementTrial, hasTrialsLeft, getRemainingTrials } = useTrialStore();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a diagram description");
      return;
    }

    if (!hasTrialsLeft()) {
      toast.error("Free trial limit reached! Please sign up to continue.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiClient.post('/api', {
        prompt: prompt.trim()
      });

      if (response.data?.data && response.data.data.length > 0) {
        const code = response.data.data[0];
        setDiagramCode(code);
        incrementTrial();
        toast.success("Diagram generated successfully!");
      } else {
        toast.warning("No diagram could be generated from your prompt");
      }
    } catch (error) {
      console.error("Error generating diagram:", error);

      // Handle 429 rate limit error from backend
      if (error.response?.status === 429) {
        toast.error("Free trial limit reached! Please sign up to continue.");
      } else {
        toast.error(error.response?.data?.message || "Failed to generate diagram");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const remainingCredits = getRemainingTrials();

  return (
    <section className="w-[95%] border-x border-gray-300 bg-[#fefcf9] py-16 sm:py-20 lg:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-10">
          <div
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-50 border border-blue-200 rounded-full"
            style={{
              animation: 'slide-in-left 0.8s ease-out forwards',
              animationDelay: '0.5s',
              opacity: 0
            }}
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Powered by Google Gemini AI</span>
          </div>

          <h1
            className="text-7xl sm:text-6xl lg:text-7xl text-zinc-950 font-instrument-serif tracking-tight"
            style={{
              animation: 'slide-in-left 0.8s ease-out forwards',
              animationDelay: '0.1s',
              opacity: 0
            }}
          >
            Convert Ideas to Diagrams with AI in <br />Seconds
          </h1>

          <p
            className="text-lg sm:text-xl text-gray-600 whitespace-nowrap"
            style={{
              animation: 'slide-in-left 0.8s ease-out forwards',
              animationDelay: '0.3s',
              opacity: 0
            }}
          >
            Instantly transform your thoughts into professional diagrams using advanced AI
          </p>

          <div className="h-14" />

          <div
            className="w-full max-w-3xl"
            style={{
              animation: 'slide-in-bottom 0.8s ease-out forwards',
              animationDelay: '0.7s',
              opacity: 0
            }}
          >
            <div className="flex justify-end mb-2">
              <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                <span className="font-semibold text-gray-700">{remainingCredits}</span> free {remainingCredits === 1 ? 'diagram' : 'diagrams'} remaining
              </div>
            </div>

            <div className="relative">
              <textarea
                placeholder="Describe your diagram... (e.g., 'Create a flowchart for user authentication')"
                className={cn(
                  "w-full min-h-[140px] p-4 pb-14",
                  "border-2 rounded-2xl resize-none",
                  "text-base sm:text-lg",
                  "glow-input",
                  "transition-all duration-300",
                  "focus:outline-none",
                  "bg-white"
                )}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    handleGenerate();
                  }
                }}
              />

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !hasTrialsLeft() || !prompt.trim()}
                className={cn(
                  "absolute bottom-3 right-3",
                  "px-6 py-2",
                  "bg-blue-500 text-white rounded-lg font-medium",
                  "hover:bg-blue-600",
                  "disabled:bg-gray-300 disabled:cursor-not-allowed",
                  "transition-colors"
                )}
              >
                {isGenerating ? "Generating..." : "Generate"}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-2">
              Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Enter</kbd> to generate
            </p>
          </div>

          {diagramCode && (
            <div className="w-full max-w-5xl mt-12 animate-in fade-in zoom-in-95 duration-500">
              <div className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-white shadow-lg">
                <div className="h-[600px]">
                  <ZoomableCanvas diagramTitle="generated-diagram">
                    <DiagramPreview code={diagramCode} />
                  </ZoomableCanvas>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}