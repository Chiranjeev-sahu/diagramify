import { Features } from "@/components/layout/Features";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/layout/Hero";
import { Navbar } from "@/components/layout/Navbar";
import { cn } from "@/utils/cn";

export default function LandingPage() {

  return (
    <div className="min-h-screen w-full flex items-center justify-center ">
      <div
        className={cn(
          "w-full max-w-6xl",
          "bg-[repeating-linear-gradient(-45deg,#e6e6e6_0,#e6e6e6_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed",
          "flex flex-col items-center",
          "bg-[#fdfdfd] border border-slate-300"
        )}
      >
        <Navbar />
        <main className="flex-1 flex flex-col items-center w-full">
          <Hero />
          <div className="w-full border-y border-gray-300 h-4" aria-hidden="true"></div>
          <Features />
          <div className="w-full border-y border-gray-300 h-4" aria-hidden="true"></div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
