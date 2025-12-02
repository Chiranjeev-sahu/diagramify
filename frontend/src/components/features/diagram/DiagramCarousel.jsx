import { useState, useEffect } from 'react';

const diagrams = [
  {
    src: '/diagrams/user-login-process-with-email-verification-and-2fa-1764776063979.svg',
    title: 'User Authentication Flow',
  },
  {
    src: '/diagrams/customer-order-placement-and-confirmation-1764775548704.svg',
    title: 'Order Processing System',
  },
  {
    src: '/diagrams/blog-platform-er-diagram-1764775584493.svg',
    title: 'Blog Platform Schema',
  }
];

export default function DiagramCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % diagrams.length);
        setIsTransitioning(false);
      }, 500); // Half of transition duration
    }, 5000); // Auto-rotate every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      {/* Diagram Display - 95% of space */}
      <div className="w-[95%] h-[95%] flex items-center justify-center">
        <img
          src={diagrams[currentIndex].src}
          alt={diagrams[currentIndex].title}
          className={`w-full h-full object-contain transition-all duration-1000 ${isTransitioning
              ? 'opacity-0 scale-95'
              : 'opacity-100 scale-100'
            }`}
          style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.1))' }}
        />
      </div>
    </div>
  );
}
