import { cn } from "@/utils/cn";
import { useNavigate } from "react-router-dom";
import ShimmerButton from "@/components/ui/ShimmerButton";
import { useEffect } from "react";
import { useState } from "react";
import { motion } from "motion/react"
export function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <>
      <header className="w-dvw bg-white border-b border-gray-300 flex justify-center items-center">
        <motion.div
          animate={{
            width: scrolled ? "50%" : "100%",
            top: scrolled ? 20 : 0,
            borderRadius: scrolled ? 9999 : 0
          }}
          className={cn(
            "mx-auto max-w-5xl z-50  px-4 sm:px-6 lg:px-8 transition-all duration-200",

            scrolled
              ? "fixed top-4 backdrop-blur shadow-lg "
              : "relative"
          )}
        >
          <nav
            className="flex items-center justify-between h-18"
            aria-label="Main navigation"
          >
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Diagramify" className="w-10 h-10" />
              <span className="text-xl font-bold text-gray-900">Diagramify</span>
            </div>

            {/* CTA Button */}
            <ShimmerButton
              shimmerColor="#ffffff"
              shimmerSize="0.05em"
              shimmerDuration="3s"
              borderRadius="100px"
              background="rgb(0 12 255)"
              innerBackground="rgb(0 7 167)"
              onClick={() => navigate('/auth')}
            >
              Get Started
            </ShimmerButton>

          </nav>
        </motion.div>
      </header>
    </>
  )
}