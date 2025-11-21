import { cn } from "@/utils/cn";
import ShimmerButton from "@/components/ShimmerButton";

export function Navbar() {
  return (
    <>
      <header className="w-full bg-white border-b border-gray-300">
        <div className="max-w-[95%] border-x border-gray-300 mx-auto px-4 sm:px-6 lg:px-8">
          <nav
            className="flex items-center justify-between h-16"
            aria-label="Main navigation"
          >
            {/* Logo */}
            <div className="flex items-center">
              <span className="bg-blue-200 rounded-full text-neutral-800 text-sm font-medium px-4 py-2">
                LOGO
              </span>
            </div>

            {/* CTA Button */}
            <ShimmerButton
              shimmerColor="#ffffff"
              shimmerSize="0.05em"
              shimmerDuration="3s"
              borderRadius="100px"
              background="rgba(0, 0, 0, 1)"
              onClick={() => alert('Clicked!')}
            >
              Get Started
            </ShimmerButton>

          </nav>
        </div>
      </header>
    </>
  )
}