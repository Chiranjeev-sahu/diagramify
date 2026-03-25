import { Sparkles, LayoutTemplate, Share2, Pencil } from "lucide-react";
import { cn } from "@/utils/cn";

export function Features() {
  const features = [
    {
      title: "AI-Powered Generation",
      description: "Create professional diagrams in seconds using natural language. Just describe what you need, and watch our advanced AI instantly build it for you.",
      icon: <Sparkles className="w-8 h-8 text-blue-500" />
    },
    {
      title: "Multiple Diagram Types",
      description: "From structural Flowcharts and ER Diagrams to behavioral Sequence and State machines, we support the most critical visualization formats for your project.",
      icon: <LayoutTemplate className="w-8 h-8 text-blue-500" />
    },
    {
      title: "Interactive Editing",
      description: "Don't settle for static generation. Refine and tweak your diagrams iteratively using our AI chat manipulator and live side-by-side code editor.",
      icon: <Pencil className="w-8 h-8 text-blue-500" />
    },
    {
      title: "Export & Share",
      description: "Download your masterpieces down to the pixel as high-resolution PNG or crisp SVG formats to include seamlessly in your documentation or presentations.",
      icon: <Share2 className="w-8 h-8 text-blue-500" />
    },
  ];

  return (
    <section className="w-[97%] mx-auto relative border-x border-gray-300 py-16 sm:py-20 bg-[#eff5fe] overflow-hidden">
      <div className="absolute inset-0 z-0" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16 text-gray-900">
          Why Choose Diagramify?
        </h2>

        {/* Unified Table-Style Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 bg-white  overflow-hidden shadow-xl ring-1 ring-gray-200">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "p-10 lg:p-14 transition-colors duration-300 hover:bg-blue-50/50",
                "border-gray-200",
                index % 2 === 0 ? "md:border-r" : "",
                index < 2 ? "border-b" : "max-md:border-b last:border-b-0"
              )}
            >
              <div className="flex flex-col gap-5">
                <div className="p-4 bg-blue-50 rounded-2xl w-fit">
                  {feature.icon}
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-lg lg:text-xl text-gray-600 leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}