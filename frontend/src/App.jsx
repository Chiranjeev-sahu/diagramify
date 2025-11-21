import LandingPage from "@/pages/LandingPage";
import Auth from "./pages/Auth";
import DashboardLayout from "./components/layout/DashboardLayout";
export default function App() {
  return (
    // <LandingPage />
    // <Auth/>
    <DashboardLayout />
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