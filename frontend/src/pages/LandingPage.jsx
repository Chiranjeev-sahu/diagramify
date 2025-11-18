import { Features } from "@/components/layout/Features";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/layout/Hero";
import { Navbar } from "@/components/layout/Navbar";
import { cn } from "@/utils/cn";

export default function LandingPage() {

  return (
    //   <div
    // className={cn(
    //   "min-h-screen w-screen flex flex-col items-center justify-start my-0.5",
    //   "bg-[repeating-linear-gradient(315deg,rgba(0,0,0,0.2)_0,rgba(0,0,0,0.2)_0.5px,transparent_0.5px,transparent_6px)]"
    // )}
    //   >
    //     {/* <Navbar/>
    //     
    //     
    //      */}
    //     {/* <h1 className="text-4xl font-bold">Diagramify</h1>
    //      <textarea
    //       value={code}
    //       onChange={(e) => setCode(e.target.value)}
    //       className="w-2xs h-32 border p-2"
    //     />
    //     <button className="px-4 py-2 bg-black text-white rounded" onClick={()=>setVisibility(prev =>!prev)}>
    //       Generate Free Diagram
    //     </button>

    //     {showDiagram&&<DiagramPreview code={code}/>}
    //     <button className="px-4 py-2 border rounded">
    //       Login
    //     </button>

    //     <button className="px-4 py-2 border rounded">
    //       Signup
    //     </button> */}
    //   </div>
    <div
      className={cn(
        "w-full min-h-screen",
        "bg-[repeating-linear-gradient(-45deg,#e6e6e6_0,#e6e6e6_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed",
        "flex flex-col items-center"
      )}
    >
      <Navbar />
      <main className="flex-1 flex flex-col items-center w-full">
        <Hero/>
        <div className="w-full border-y border-gray-300 h-4" aria-hidden = "true"></div>
        <Features/>
        <div className="w-full border-y border-gray-300 h-4" aria-hidden = "true"></div>
      </main>
      <Footer/>
    </div>
  );
}
