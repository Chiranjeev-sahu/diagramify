import { cn } from "@/utils/cn";

export function Spinner({ size = 'md', className }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className={cn(
      'animate-spin rounded-full border-blue-500 border-t-transparent',
      sizes[size], className)}>
    </div>
  )
}

export function DiagramGeneratingLoader() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-slate-50">
      <div className="text-center">
        {/* Animated Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 mx-auto">
            {/* Outer ring */}
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-ping" />
            {/* Middle ring */}
            <div className="absolute inset-2 border-4 border-blue-400 rounded-full animate-pulse" />
            {/* Inner dot */}
            <div className="absolute inset-8 bg-blue-600 rounded-full animate-bounce" />
          </div>
        </div>

        {/* Text */}
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          Generating your diagram...
        </h3>
        <p className="text-slate-600">
          AI is analyzing your prompt
        </p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}


export function DiagramSkeleton() {
  return (
    <div className="h-full w-full bg-white p-8 animate-pulse">
      <div className="flex flex-col items-center gap-4">
        <div className="w-32 h-32 rounded-full bg-slate-200" />
        <div className="w-1 h-16 bg-slate-200" />
        <div className="w-48 h-24 rounded-lg bg-slate-200" />
        <div className="w-1 h-16 bg-slate-200" />
        <div className="w-32 h-32 rounded-full bg-slate-200" />
      </div>
    </div>
  );
}

export function ButtonLoader() {
  return (
    <div className="flex items-center gap-2">
      <Spinner size="sm" />
      <span>Loading...</span>
    </div>
  );
}

/**
 * FullPageLoader - For initial app load
 */
export function FullPageLoader() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Diagramify</h2>
        <p className="text-slate-600">Loading your workspace...</p>
      </div>
    </div>
  );
}

/**
 * InlineLoader - Small loader for inline content
 */
export function InlineLoader({ text = 'Loading...' }) {
  return (
    <div className="flex items-center gap-2 text-slate-600">
      <Spinner size="sm" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

/**
 * ProgressBar - For showing upload/export progress
 */
export function ProgressBar({ progress = 0, label }) {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-sm text-slate-600 mb-2">
          <span>{label}</span>
          <span>{progress}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
