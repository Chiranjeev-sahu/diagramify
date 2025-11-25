import { useState } from 'react';
import { History, LogOut, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function Sidebar() {
  const [diagrams] = useState([
    { id: 1, name: 'Login Flow', date: 'Today' },
    { id: 2, name: 'Payment Process', date: 'Yesterday' },
    { id: 3, name: 'User Registration', date: '2 days ago' },
  ]);
  const [isOpen, setIsOpen] = useState(true);
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
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">D</span>
        </div>
        {isOpen && (
          <span className="font-bold text-white ml-2">Diagramify</span>
        )}
      </div>

      <div className="p-2 border-b border-slate-700 flex justify-center">
        <button className="w-full flex items-center px-3.5 py-2.5 rounded-lg border gap-6 border-slate-700 hover:bg-slate-800 text-white transition-colors">
          <Plus className="w-5 h-5 shrink-0" />
          {isOpen && (
            <span className="text-sm font-medium text-nowrap">
              New Diagram
            </span>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-auto py-2">
        {isOpen ? (
          <div className="px-2 space-y-1">
            {diagrams.map((diagram) => (
              <button
                key={diagram.id}
                className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors text-left text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                {/* <span className="text-lg mt-0.5">📄</span> */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{diagram.name}</p>
                  <p className="text-xs text-slate-500 truncate">{diagram.date}</p>
                </div>
              </button>
            ))}
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
              <span className="text-white font-medium text-sm">CS</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Chiranjeev Sahu</p>
            </div>
            <button className="text-slate-400 hover:text-white transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <button className="text-slate-400 hover:text-white transition-colors" title="Logout">
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
