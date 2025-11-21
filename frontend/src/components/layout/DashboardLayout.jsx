import React, { useState, useEffect } from 'react';
import { Menu, X, Home, Settings, LogOut, Plus, MessageSquare } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Outlet } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ZoomableCanvas from '../ZoomableCanvas';
// export default function DashboardLayout({ children }) {
export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isSmall = window.innerWidth < 768;
      if (isSmall) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex relative">

      <aside
        className={cn(
          // "bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out z-40",
          // "fixed inset-y-0 left-0 h-full shadow-2xl md:shadow-none",
          // isMobile && !isSidebarOpen ? "-translate-x-full" : "translate-x-0",

          // // DESKTOP BEHAVIOR (>= md):
          // // - Relative position (pushes content)
          // // - Width changes based on state
          // "md:relative md:translate-x-0",
          // !isMobile && (isSidebarOpen ? "w-64" : "w-[0px] overflow-hidden border-none")
          "bg-slate-300 min-h-screen flex flex-col relative",
          isSidebarOpen ? "w-[13%]" : "w-16",
          "transition-all duration-300 ease-in-out"
        )}
      >
        <h1 className={cn('text-center',
          isSidebarOpen ? "w-71" : "w-16 text-ellipsis overflow-hidden"
        )}>Hi I'm sidebar</h1>
        <button className='bg-red-500 cursor-pointer p-2 rounded-full absolute top-16 -translate-y-1/2 right-0 translate-x-1/2 z-50' onClick={() => setIsSidebarOpen(!isSidebarOpen)}>{isSidebarOpen ? "Close" : "Open"}</button>
      </aside>


      {/* 
        --- MOBILE OVERLAY BACKDROP ---
        Only shows on mobile when sidebar is open to darken the background
      */}

      {/* {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )} */}


      {/* 
        --- MAIN CONTENT AREA --- 
        This grows to fill the remaining space
      */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Page Content */}
        {/* <div className="flex-1 border overflow-auto top-0 relative"> */}
        {/* Top Header  */}
        {/* <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300"></div>
            </div>
          </header>
        </div> */}
        <PanelGroup direction="horizontal"> {/* 1. Outer Split */}

          {/* LEFT SIDE: Diagram */}
          <Panel defaultSize={50} minSize={25}>
            <ZoomableCanvas>
              {/* This is just a placeholder diagram for now */}
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full bg-purple-100 border-4 border-purple-500 flex items-center justify-center text-purple-700 font-bold">
                  Start
                </div>
                <div className="w-1 h-16 bg-slate-300"></div>
                <div className="w-48 h-24 rounded-lg bg-white border-2 border-slate-300 shadow-sm flex items-center justify-center text-slate-600">
                  Process
                </div>
              </div>
            </ZoomableCanvas>
          </Panel>

          <PanelResizeHandle className="w-1 bg-slate-200 hover:bg-purple-100 transition-colors" />
          {/* RIGHT SIDE: The "Container" for the next split */}
          <Panel defaultSize={40}>

            {/* 2. Inner Split (Vertical) */}
            <PanelGroup direction="vertical">

              {/* TOP: Code */}
              <Panel defaultSize={49}>
                {/* <CodeEditor /> */}
                <div>I will be the code editor</div>
              </Panel>

              <PanelResizeHandle className="h-1 bg-slate-200 hover:bg-purple-500 transition-colors z-50" />

              {/* BOTTOM: AI Chat */}
              <Panel defaultSize={49}>
                {/* <AIChat /> */}
                <div>I will be the AI Chat</div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </main>

    </div>
  );
}
