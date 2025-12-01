import React from "react";
import { cn } from "@/utils/cn";

export const ShineBorder = ({
  colors = ["#A07CFE", "#FE8FB5", "#FFBE7B"],
  borderWidth = 1,
  borderRadius = 8,
  duration = 20,
  className = "",
  children
}) => {
  const gradientColors = colors.join(", ");

  return (
    <div
      className={cn(
        "relative bg-white dark:bg-black text-black dark:text-white p-3",
        className
      )}
      style={{ borderRadius: `${borderRadius}px` }}
    >
      <div
        className="absolute inset-0 pointer-events-none animate-shine-pulse"
        style={{
          padding: `${borderWidth}px`,
          borderRadius: `${borderRadius}px`,
          background: `radial-gradient(circle, transparent 0%, transparent 20%, ${gradientColors} 50%, transparent 80%, transparent 100%)`,
          backgroundSize: "300% 300%",
          animationDuration: `${duration}s`,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
        }}
      />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};