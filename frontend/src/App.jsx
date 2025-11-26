import LandingPage from "@/pages/LandingPage";
import Auth from "./pages/Auth";
import DashboardLayout from "./components/layout/DashboardLayout";
import {
  ButtonLoader,
  DiagramGeneratingLoader,
  DiagramSkeleton,
  FullPageLoader,
  InlineLoader,
  ProgressBar,
  Spinner,
} from "./components/ui/LoadingStates";
import EmptyState from "./components/features/diagram/EmptyState";
import CodeEditor from "./components/ui/CodeEditor";
import AIChat from "./components/features/chat/AIChat";
import Sidebar from "./components/layout/Sidebar";
import { useState } from "react";

export default function App() {
  const [code, setCode] = useState(`graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> Bsaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
    C --> E[End]`);

  const handleSendMessage = (message) => {
    console.log('User sent:', message);
  };

  return (
    // <LandingPage />
    // <Auth/>
    // <DashboardLayout />
    // <div className="flex flex-wrap gap-4 p-8 justify-center bg-gray-100 min-h-screen">
    //   {/* Component 1: Spinner */}
    //   <div className="w-96 h-96 flex flex-none items-center justify-center border border-gray-300 bg-white rounded-xl shadow-sm">
    //     <Spinner size="lg" />
    //   </div>

    //   {/* Component 2: DiagramGeneratingLoader */}
    //   <div className="w-96 h-96 flex flex-none items-center justify-center border border-gray-300 bg-white rounded-xl shadow-sm overflow-hidden">
    //     <DiagramGeneratingLoader />
    //   </div>

    //   {/* Component 3: DiagramSkeleton */}
    //   <div className="w-96 h-96 flex flex-none items-center justify-center border border-gray-300 bg-white rounded-xl shadow-sm overflow-hidden">
    //     <DiagramSkeleton />
    //   </div>

    //   {/* Component 4: ButtonLoader */}
    //   <div className="w-96 h-96 flex flex-none items-center justify-center border border-gray-300 bg-white rounded-xl shadow-sm">
    //     <ButtonLoader />
    //   </div>

    //   {/* Component 5: InlineLoader */}
    //   <div className="w-96 h-96 flex flex-none items-center justify-center border border-gray-300 bg-white rounded-xl shadow-sm">
    //     <InlineLoader text="Saving..." />
    //   </div>

    //   {/* Component 6: ProgressBar */}
    //   <div className="w-96 h-96 flex flex-none items-center justify-center border border-gray-300 bg-white rounded-xl shadow-sm p-8">
    //     <ProgressBar progress={65} label="Processing..." />
    //   </div>

    //   {/* Component 7: FullPageLoader */}
    //   {/* Added 'transform' to parent to contain the 'fixed' child within this box for demo purposes */}
    //   <div className="w-96 h-96 flex flex-none items-center justify-center border border-gray-300 bg-white rounded-xl shadow-sm overflow-hidden transform scale-100 relative">
    //     <FullPageLoader />
    //   </div>
    // </div>
    // <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    //     <ShineBorder
    //       className="relative flex h-[500px] w-full max-w-[600px] flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl border-gray-200 dark:border-gray-800"
    //       color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
    //     >
    //       <span className="pointer-events-none whitespace-pre-wrap bg-linear-to-b from-black to-gray-300/80 bg-clip-text text-center text-8xl font-semibold leading-none text-transparent">
    //         Shine Border
    //       </span>
    //     </ShineBorder>
    //   </div>
    // <div className="h-screen w-full bg-slate-50 p-8">
    //   <div className="h-full max-w-2xl mx-auto">
    //     <AIChat onSendMessage={handleSendMessage} />
    //   </div>
    // </div>
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 bg-slate-50 p-8">
        <h1 className="text-2xl font-bold">Main Content Area</h1>
        <p>Click the toggle button on the sidebar to collapse/expand it!</p>
      </div>
    </div>
  );
}

// import React from "react";
// import { ShineBorder } from "@/components/ShineBorder";

// function App() {
//   return (
//     <div className="min-h-screen bg-slate-950 p-8">
//       <div className="mt-16 max-w-2xl mx-auto">
//         <h2 className="text-white mb-6 font-semibold text-2xl text-center">
//           Large Demo
//         </h2>
//         <ShineBorder 
//           colors={["#A07CFE", "#FE8FB5", "#FFBE7B"]} 
//           borderWidth={2}
//           borderRadius={12}
//           duration={15}
//           className="min-h-[300px] flex items-center justify-center"
//         >
//           <div className="text-center">
//             <h1 className="text-6xl font-bold bg-gradient-to-b from-black to-gray-400 dark:from-white dark:to-gray-500 bg-clip-text text-transparent">
//               Shine Border
//             </h1>
//             <p className="mt-4 text-lg opacity-70">
//               Built step-by-step with modular components
//             </p>
//           </div>
//         </ShineBorder>
//       </div>
//     </div>
//   );
// }

// export default App