import AIChat from "@/components/features/chat/AIChat";
import DiagramPreview from "@/components/features/diagram/DiagramPreview";
import EmptyState from "@/components/features/diagram/EmptyState";
import ZoomableCanvas from "@/components/features/diagram/ZoomableCanvas";
import Sidebar from "@/components/layout/Sidebar";
import CodeEditor from "@/components/ui/CodeEditor";
import { DiagramGeneratingLoader } from "@/components/ui/LoadingStates";
import { useDebounce } from "@/hooks/useDebounce";
import { useDiagramStore } from "@/store/useDiagramStore";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export default function DashboardLayout() {
  const {
    currentDiagram,
    updateDiagramCode,
    updateCurrentDiagramCodeLocally,
    isGenerating,
  } = useDiagramStore();

  // Debounced auto-save for code editor
  const debouncedSave = useDebounce((diagramId, code) => {
    updateDiagramCode(diagramId, code);
  }, 300); // 300ms - faster updates

  const handleCodeChange = (newCode) => {
    if (!currentDiagram) return;

    // Instant UI update
    updateCurrentDiagramCodeLocally(newCode);

    // Debounced backend save
    debouncedSave(currentDiagram._id, newCode);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex relative">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Show EmptyState when no diagram is selected */}
        {!currentDiagram ? (
          <EmptyState />
        ) : (
          /* Show PanelGroup when diagram exists */
          <PanelGroup direction="horizontal">
            {/* LEFT SIDE: Diagram Preview */}
            <Panel defaultSize={50} minSize={25}>
              <div className="h-full bg-white border-r border-slate-200">
                {isGenerating ? (
                  <DiagramGeneratingLoader />
                ) : (
                  <ZoomableCanvas diagramTitle={currentDiagram?.title}>
                    <DiagramPreview code={currentDiagram?.diagramCode || ""} />
                  </ZoomableCanvas>
                )}
              </div>
            </Panel>

            <PanelResizeHandle className="w-1 bg-slate-200 hover:bg-blue-400 transition-colors" />

            {/* RIGHT SIDE: Code + Chat */}
            <Panel defaultSize={50}>
              <PanelGroup direction="vertical">
                {/* TOP: Code Editor */}
                <Panel defaultSize={50} minSize={20}>
                  <div className="h-full bg-[#0f172a]">
                    <CodeEditor
                      code={currentDiagram?.diagramCode || ""}
                      onChange={handleCodeChange}
                    />
                  </div>
                </Panel>

                <PanelResizeHandle className="h-1 bg-slate-200 hover:bg-blue-400 transition-colors z-50" />

                {/* BOTTOM: AI Chat */}
                <Panel defaultSize={50} minSize={20}>
                  <AIChat />
                </Panel>
              </PanelGroup>
            </Panel>
          </PanelGroup>
        )}
      </main>
    </div>
  );
}
