import { Spinner } from "@/components/ui/LoadingStates";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { useDiagramStore } from "@/store/useDiagramStore";
import { useUIStore } from "@/store/useUIstore";
import { cn } from "@/utils/cn";
import {
  ArrowRightLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Database,
  GitBranch,
  History,
  LogOut,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const TYPE_CONFIG = {
  Flowchart: { icon: GitBranch, color: "text-blue-500", bg: "bg-blue-50" },
  Sequence: {
    icon: ArrowRightLeft,
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  ER: { icon: Database, color: "text-green-500", bg: "bg-green-50" },
  Gantt: { icon: CalendarDays, color: "text-orange-500", bg: "bg-orange-50" },
};

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    latestDiagrams,
    fetchLatestDiagrams,
    setCurrentDiagram,
    deleteDiagram,
    isLoading,
    currentDiagram,
  } = useDiagramStore();
  const { fetchChatHistory } = useChatStore();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLatestDiagrams();
  }, [fetchLatestDiagrams]);

  // Derived state — no store needed, just filter in place
  const filteredDiagrams = latestDiagrams.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDiagramClick = async (diagram) => {
    setCurrentDiagram(diagram);
    if (diagram.chatId) {
      await fetchChatHistory(diagram.chatId);
    }
  };

  const handleDeleteDiagram = async (e, diagramId) => {
    e.stopPropagation();
    if (
      window.confirm(
        "Are you sure you want to delete this diagram? This action cannot be undone.",
      )
    ) {
      await deleteDiagram(diagramId);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const handleNewDiagram = () => {
    setCurrentDiagram(null);
    useChatStore.getState().reset();
  };

  return (
    <aside
      onClick={() => {
        if (sidebarCollapsed) setSidebarCollapsed(false);
      }}
      className={cn(
        "bg-[#0f172a] min-h-screen flex flex-col transition-all relative duration-500",
        "border-r border-slate-800 shadow-[20px_0_40px_rgba(0,0,0,0.1)]",
        sidebarCollapsed ? "w-20" : "w-64",
      )}
    >
      {/* ── Logo ── */}
      <div
        className="h-24 flex items-center px-6 border-b border-white/5 cursor-pointer hover:bg-white/2 transition-colors group"
        onClick={(e) => {
          e.stopPropagation();
          navigate("/");
        }}
      >
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 group-hover:scale-110 transition-all duration-500 shadow-xl">
          <img
            src="/logo.svg"
            alt="Logo"
            className="w-7 h-7  opacity-90 group-hover:opacity-100"
          />
        </div>
        {!sidebarCollapsed && (
          <span className="font-instrument-serif text-2xl font-semibold text-white ml-3 tracking-tight">
            Diagramify
          </span>
        )}
      </div>

      {/* ── New Diagram button ── */}
      <div className="p-4 border-b border-white/5 flex justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNewDiagram();
          }}
          className="w-full flex items-center px-4 py-3 rounded-xl bg-[#1e293b] text-white gap-3 hover:bg-[#0f172a] transition-all border border-white/5 active:scale-[0.98] mt-2 shadow-lg shadow-blue-950/20"
        >
          <Plus className="w-5 h-5 shrink-0" />
          {!sidebarCollapsed && (
            <span className="text-sm font-bold tracking-wide">New Diagram</span>
          )}
        </button>
      </div>

      {/* ── Diagram list ── */}
      <div className="flex-1 overflow-auto py-4 px-2 custom-scrollbar no-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="sm" className="border-slate-500" />
          </div>
        ) : !sidebarCollapsed ? (
          <div className="space-y-1">
            {/* Section label */}
            <div className="px-3 mb-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Latest History
              </p>
            </div>

            {/* Search input */}
            {latestDiagrams.length > 0 && (
              <div className="px-1 mb-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5 focus-within:border-blue-500/50 focus-within:bg-white/10 transition-all">
                  <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Find diagram..."
                    className="flex-1 bg-transparent text-xs text-slate-300 placeholder:text-slate-500 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-slate-500 hover:text-slate-300 transition-colors text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Empty states */}
            {latestDiagrams.length === 0 ? (
              <div className="px-3 py-10 text-center border border-dashed border-white/10 rounded-2xl mx-1">
                <p className="text-xs font-semibold text-slate-500">
                  No diagrams yet
                </p>
              </div>
            ) : filteredDiagrams.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <p className="text-xs font-semibold text-slate-500">
                  No results
                </p>
              </div>
            ) : (
              filteredDiagrams.map((diagram) => {
                const config = TYPE_CONFIG[diagram.diagramType] ?? {
                  icon: GitBranch,
                  color: "text-slate-400",
                  bg: "bg-white/5",
                };
                const TypeIcon = config.icon;
                const isActive = currentDiagram?._id === diagram._id;

                return (
                  <div key={diagram._id} className="group relative px-1">
                    <button
                      onClick={() => handleDiagramClick(diagram)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left",
                        isActive
                          ? "bg-white/10 text-white shadow-lg"
                          : "text-slate-400 hover:bg-white/4 hover:text-slate-200",
                      )}
                    >
                      {/* Type icon badge */}
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-white/5",
                          isActive ? "bg-white/10" : "bg-white/5",
                        )}
                      >
                        <TypeIcon className={cn("w-3.5 h-3.5", isActive ? "text-white" : "text-slate-500")} />
                      </div>

                      {/* Title + meta */}
                      <div className="flex-1 min-w-0 pr-6">
                        <p className="text-sm font-semibold truncate tracking-tight">
                          {diagram.title}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                          v{diagram.version} •{" "}
                          {new Date(diagram.updatedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDeleteDiagram(e, diagram._id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/10"
                      title="Delete diagram"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* Collapsed: show history icon */
          <div className="flex flex-col items-center gap-4 pt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSidebarCollapsed(false);
              }}
              className="w-12 h-12 flex items-center justify-center rounded-xl text-slate-500 hover:bg-white/5 hover:text-slate-200 transition-all border border-transparent hover:border-white/10"
              title="View History"
            >
              <History className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {/* ── User footer ── */}
      <div className="p-4 border-t border-white/5">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/3 border border-white/5">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg">
              <span className="text-white font-bold text-sm">
                {user?.username?.charAt(0).toUpperCase() ?? "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate tracking-tight">
                {user?.username ?? "User"}
              </p>
              <p className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-widest">
                Pro Plan
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center py-2">
            <button
              onClick={handleLogout}
              className="w-12 h-12 flex items-center justify-center rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-white/10"
              title="Logout"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {/* ── Collapse toggle button ── */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSidebarCollapsed(!sidebarCollapsed);
        }}
        className="absolute right-0 translate-x-1/2 top-20 -translate-y-1/2 w-8 h-8 rounded-xl bg-[#0f172a] border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-all shadow-xl z-20 group"
      >
        {!sidebarCollapsed ? (
          <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
        ) : (
          <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
        )}
      </button>
    </aside>
  );
}
