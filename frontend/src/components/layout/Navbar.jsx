import { cn } from "@/utils/cn";
import { useNavigate } from "react-router-dom";
import ShimmerButton from "@/components/ui/ShimmerButton";

export function Navbar() {
  const navigate = useNavigate();

  return (
    <>
      <header className="w-full bg-white border-b border-gray-300">
        <div className="max-w-[95%] border-x border-gray-300 mx-auto px-4 sm:px-6 lg:px-8">
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
              background="rgba(0, 0, 0, 1)"
              onClick={() => navigate('/auth')}
            >
              Get Started
            </ShimmerButton>

          </nav>
        </div>
      </header>
    </>
  )
}