import apiClient from "@/api/apiClient";
import { renderInto } from "@/lib/mermaid";
import { useRef, useState } from "react"
import { toast } from "sonner";
import { cn } from "@/utils/cn";
export function Hero() {
  const [code, setCode] = useState("");
  const containerRef = useRef(null);

  const fetchCode = async () => {
    try {
      const response = await apiClient.post('/api', { prompt: code });

      // Check if response.data and response.data.data are defined
      if (response.data && response.data.data && response.data.data.length > 0) {
        const diagramCode = response.data.data[0].toString();
        console.log("Diagram Code:", diagramCode);

        try {
          await renderInto(containerRef.current, diagramCode);
        } catch (mermaidError) {
          console.error("Mermaid rendering error:", mermaidError);
          toast.error("Error rendering diagram");
        }
      } else {
        console.warn("Invalid response format:", response.data);
        toast.warn("No diagram data received");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error fetching data");
    }
  };

  return (
    <section className="w-[95%] border-x border-gray-300 bg-white py-16 sm:py-20 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-24">
          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-950">
            Generate Diagrams with AI
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl">
            Transform your ideas into beautiful diagrams instantly
          </p>

          {/* Input */}
          <div className="w-full max-w-xl">
            <input
              type="text"
              placeholder="Describe your diagram..."
              className={cn(
                "w-full px-4 py-3 sm:px-6 sm:py-4",
                "border border-gray-300 rounded-2xl",
                "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent",
                "text-base sm:text-lg"
              )}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchCode()}
            />
          </div>

          <button
            onClick={fetchCode}
            // disabled={isLoading}
            className={cn(
              "px-8 py-3 bg-black text-white rounded-xl",
              "text-base font-medium",
              "hover:bg-zinc-800 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {/* {isLoading ? "Generating..." : "Generate Free Diagram"} */}
            Generate Free Diagram
          </button>

          {/* Diagram Container (when needed) */}
          <div
            ref={containerRef}
            className="w-full mt-8 p-6 border border-gray-200 rounded-xl bg-white"
          />
        </div>
      </div>
    </section>
  );
}