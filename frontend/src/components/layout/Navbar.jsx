import { cn } from "@/utils/cn";

export function Navbar() {
  return (
    <>
      {/* <header className="border bg-white w-full h-1/12 border-gray-300 flex items-center justify-center">
        <div className={cn(
          "w-full flex items-center justify-between p-3.5 h-8"
        )
        }>
          <div className="bg-blue-200 rounded-full text-neutral-800 text-sm p-2">LOGO</div>
          <button className="bg-zinc-800 text-white p-3 rounded-2xl">Get Started</button>
        </div>
      </header> */}
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
            <button
              className={cn(
                "bg-zinc-800 text-white",
                "px-6 py-2.5 rounded-xl",
                "hover:bg-zinc-700 transition-colors",
                "text-sm font-medium"
              )}
            >
              Get Started
            </button>
          </nav>
        </div>
      </header>
    </>
  )
}