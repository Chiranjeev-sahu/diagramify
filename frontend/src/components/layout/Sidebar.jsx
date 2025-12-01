import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, LogOut, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useDiagramStore } from '@/store/useDiagramStore';
import { useChatStore } from '@/store/useChatStore';
import { Spinner } from '@/components/ui/LoadingStates';

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { latestDiagrams, fetchLatestDiagrams, setCurrentDiagram, deleteDiagram, isLoading } = useDiagramStore();
  const { fetchChatHistory } = useChatStore();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    fetchLatestDiagrams();
  }, [fetchLatestDiagrams]);

  const handleDiagramClick = async (diagram) => {
    setCurrentDiagram(diagram);

    if (diagram.chatId) {
      await fetchChatHistory(diagram.chatId);
    }
  };

  const handleDeleteDiagram = async (e, diagramId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this diagram? This action cannot be undone.')) {
      await deleteDiagram(diagramId);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const handleNewDiagram = () => {
    setCurrentDiagram(null);
  };

  return (
    <aside
      onClick={(e) => {
        if (!isOpen) {
          setIsOpen(true);
        }
      }}
      className={`bg-slate-900 min-h-screen flex flex-col transition-all relative duration-300 ${isOpen ? 'w-64' : 'w-16'}`}
    >
      <div className="h-16 flex items-center px-4 border-b border-slate-700">
        <img src="/logo.svg" alt="D" className="w-10 h-10 shrink-0" />
        {isOpen && (
          <span className="font-bold text-white ml-2">Diagramify</span>
        )}
      </div>

      <div className="p-2 border-b border-slate-700 flex justify-center">
        <button
          onClick={handleNewDiagram}
          className="w-full flex items-center px-3.5 py-2.5 rounded-lg border gap-6 border-slate-700 hover:bg-slate-800 text-white transition-colors"
        >
          <Plus className="w-5 h-5 shrink-0" />
          {isOpen && (
            <span className="text-sm font-medium text-nowrap">
              New Diagram
            </span>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-auto py-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size="sm" />
          </div>
        ) : isOpen ? (
          <div className="px-2 space-y-1">
            {latestDiagrams.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <p className="text-sm text-slate-500">No diagrams yet</p>
                <p className="text-xs text-slate-600 mt-1">Create your first diagram!</p>
              </div>
            ) : (
              latestDiagrams.map((diagram) => (
                <div
                  key={diagram._id}
                  className="group relative"
                >
                  <button
                    onClick={() => handleDiagramClick(diagram)}
                    className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors text-left text-slate-400 hover:bg-slate-800 hover:text-white pr-8"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{diagram.title}</p>
                      <p className="text-xs text-slate-500 truncate">
                        v{diagram.version} • {new Date(diagram.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={(e) => handleDeleteDiagram(e, diagram._id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete diagram"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center pt-4">
            <button
              onClick={() => setIsOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title="View diagram history"
            >
              <History className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800">
        {isOpen ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
              <span className="text-white font-medium text-sm">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.username || 'User'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute right-0 translate-x-1/2 top-16 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-10"      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

    </aside>
  );
}
