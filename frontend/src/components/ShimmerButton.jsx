import { cn } from "@/utils/cn";
import React, { forwardRef } from "react";

export default forwardRef(function ShimmerButton(
  {
    shimmerColor = "#ffffff",
    shimmerSize = "0.05em",
    shimmerDuration = "3s",
    borderRadius = "100px",
    background = "rgba(0, 0, 0, 1)",
    className,
    children,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      {...props}
      className={cn(
        "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap",
        "border border-white/10 px-6 py-3",
        "text-white",
        "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px",
        className
      )}
      style={{
        ...props.style,
        "--spread": "90deg",
        "--shimmer-color": shimmerColor,
        "--radius": borderRadius,
        "--speed": shimmerDuration,
        "--cut": shimmerSize,
        "--bg": background,
        borderRadius: `var(--radius)`,
        background: `var(--bg)`,
      }}
    >
      {/* spark contaier */}
      <div
        className="absolute inset-0 overflow-visible -z-30 blur-[2px] @container-[size]"
      >
        <div 
          className="absolute inset-0 aspect-square h-[100cqh] rounded-none"
          style={{
            animation: `shimmerSlide var(--speed) ease-in-out infinite alternate`,
          }}
        >
          <div 
            className="absolute -inset-full w-auto rotate-0"
            style={{
              background: `conic-gradient(from calc(270deg - (var(--spread) * 0.5)), transparent 0, var(--shimmer-color) var(--spread), transparent var(--spread))`,
              animation: `spinAround calc(var(--speed) * 2) infinite linear`,
            }}
          />
        </div>
      </div>

      {children}

      {/* Highlight */}
      <div
        className={cn(
          "absolute inset-0 size-full rounded-2xl px-4 py-1.5 text-sm font-medium",
          "transform-gpu transition-all duration-300 ease-in-out",
          
          "shadow-[inset_0_-8px_10px_#ffffff1f]",
          "group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]",
          "group-active:shadow-[inset_0_-10px_10px_#ffffff3f]"
        )}
      />

      <div
        className="absolute -z-20"
        style={{
          inset: `var(--cut)`,
          borderRadius: `var(--radius)`,
          background: `var(--bg)`,
        }}
      />
    </button>
  );
});