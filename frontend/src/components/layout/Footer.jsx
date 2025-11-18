// export function Footer() {
//   return (
//     <footer className="w-full border-t bg-gray-700 h-[10%]">
//       <div className="mx-auto max-w-6xl flex items-center text-white  justify-between text-sm ">
//         <p>© 2025 Diagramify</p>

//         <nav className="flex gap-6">
//           <a href="#" target="_blank" rel="noopener noreferrer">
//             Github
//           </a>

//           <a href="#" target="_blank" rel="noopener noreferrer">
//             LinkedIn
//           </a>

//           <a href="#" target="_blank" rel="noopener noreferrer">
//               Twitter
//           </a>
//         </nav>
//       </div>
//     </footer>
//   )
// }


export function Footer() {
  return (
    // ✅ Semantic <footer>
    <footer className="w-[95%] justify-self-auto bg-gray-600 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-gray-300">
            © 2025 Diagramify. All rights reserved.
          </p>
          {/* Social Links */}
          <nav className="flex gap-6" aria-label="Social media links">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Twitter
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}