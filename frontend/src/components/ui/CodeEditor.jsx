import { useState } from "react";

export default function CodeEditor({ code, onChange, readOnly = false }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => {
      setCopied(false)
    }, 2000);
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.mmd';
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="h-full flex flex-col bg-slate-900">

      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-800">
        <span className="text-sm font-medium text-slate-300">diagram.mmd</span>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-sm bg-slate-700 text-slate-200 rounded hover:bg-slate-600 transition-colors"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 text-sm bg-slate-700 text-slate-200 rounded hover:bg-slate-600 transition-colors"
          >Download</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex code-editor-scroll">
        <div className="shrink-0 px-4 py-4 text-right text-slate-500 select-none bg-slate-800 font-mono text-sm">
          {code.split('\n').map((_, index) => (
            <div key={index} className="leading-6">
              {index + 1}
            </div>
          ))}
        </div>

        <textarea
          value={code}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          placeholder="// Your diagram code will appear here..."
          className="flex-1 px-4 py-4 bg-transparent text-slate-100 font-mono text-sm leading-6 whitespace-pre focus:outline-none resize-none overflow-hidden  placeholder:text-slate-500"
        ></textarea>
      </div>
    </div >
  )
}