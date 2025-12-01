import { CheckCircle2 } from "lucide-react";

export function Features() {
  const features = [
    {
      title: "AI-Powered Generation",
      description: "Create professional diagrams in seconds using natural language",
    },
    {
      title: "Multiple Diagram Types",
      description: "Flowcharts, Sequence, ER Diagrams, Gantt Charts, and more",
    },
    {
      title: "Export & Share",
      description: "Download as PNG or SVG and share with your team",
    },
    {
      title: "Interactive Editing",
      description: "Refine diagrams with AI chat and live code editor",
    },
  ];

  return (
    <section className="w-[95%] border-x border-gray-300 py-16 sm:py-20 bg-[#fefcf9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">
          Why Choose Diagramify?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white border-2 border-blue-100 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}