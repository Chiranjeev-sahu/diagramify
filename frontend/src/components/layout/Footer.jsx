export function Footer() {
  return (
    <footer className="w-[95%] bg-slate-900 border-x border-gray-300 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <div className="text-center sm:text-left">
            <p className="text-sm text-slate-400">
              © 2025 Diagramify. All rights reserved.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Powered by Google Gemini AI
            </p>
          </div>

          {/* Social Links */}
          <nav className="flex gap-6" aria-label="Social media links">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
            >
              Twitter
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}