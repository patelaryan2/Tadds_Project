import { useState, useEffect } from "react";

const slides = [
  {
    id: "summer",
    badge: {
      text: "NEW SEASON STYLES",
      style: "bg-orange-500/15 text-orange-600 border border-orange-500/30",
    },
    titlePrefix: "Summer ",
    titleHighlight: "Collection",
    titleGradient: "from-orange-600 to-amber-500",
    subtitle: "Light fabrics. Fresh styles. Perfect for you.",
    cta: "Shop Now",
    ctaStyle: "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-orange-500/30",
    bgGradient: "from-[#FFF6EE] via-[#FDEEE0] to-[#FCE3D0]",
    textColor: "text-surface-900",
    subtextColor: "text-surface-600",
    targetCategory: "clothing",
    glowClass: "bg-orange-500/15",
    products: [
      {
        name: "Linen Shirt",
        img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=450&auto=format&fit=crop&q=85",
        className: "w-36 sm:w-48 lg:w-56 h-44 sm:h-56 lg:h-64 object-cover rounded-2xl shadow-xl -rotate-3 border-2 border-white",
      },
      {
        name: "Summer Sneakers",
        img: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=350&auto=format&fit=crop&q=85",
        className: "w-28 sm:w-36 lg:w-44 h-32 sm:h-44 lg:h-52 object-cover rounded-2xl shadow-2xl rotate-6 border-2 border-white -ml-8 sm:-ml-12 mt-8 sm:mt-12",
      },
      {
        name: "Sun Hat & Shades",
        img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300&auto=format&fit=crop&q=85",
        className: "hidden md:block w-24 lg:w-32 h-28 lg:h-36 object-cover rounded-xl shadow-lg -rotate-12 border-2 border-white -ml-6 mt-2",
      },
    ],
  },
  {
    id: "electronics",
    badge: {
      text: "LIMITED TIME OFFER",
      style: "bg-brand-500/20 text-brand-300 border border-brand-400/30",
    },
    titlePrefix: "Electronics ",
    titleHighlight: "Mega Sale",
    titleGradient: "from-blue-400 via-indigo-300 to-cyan-300",
    subtitle: "Top gadgets. Best brands. Unbeatable deals.",
    cta: "Shop Now",
    ctaStyle: "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 shadow-blue-500/40",
    bgGradient: "from-[#040D21] via-[#081B4B] to-[#0A1128]",
    textColor: "text-white",
    subtextColor: "text-white/70",
    targetCategory: "electronics",
    glowClass: "bg-blue-500/25",
    products: [
      {
        name: "ANC Headphones",
        img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=450&auto=format&fit=crop&q=85",
        className: "w-36 sm:w-48 lg:w-60 h-44 sm:h-56 lg:h-64 object-cover rounded-2xl shadow-2xl border-2 border-white/20 -rotate-6",
      },
      {
        name: "Smart Watch",
        img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=350&auto=format&fit=crop&q=85",
        className: "w-28 sm:w-36 lg:w-44 h-32 sm:h-44 lg:h-52 object-cover rounded-2xl shadow-2xl border-2 border-white/20 rotate-12 -ml-8 sm:-ml-12 mt-8 sm:mt-10",
      },
      {
        name: "RGB Mechanical Keyboard",
        img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=85",
        className: "hidden md:block w-28 lg:w-36 h-28 lg:h-36 object-cover rounded-xl shadow-xl border border-white/10 -rotate-12 -ml-6 -mt-4",
      },
    ],
  },
  {
    id: "beauty",
    badge: {
      text: "LIMITED TIME OFFER",
      style: "bg-rose-500/20 text-rose-200 border border-rose-400/30",
    },
    titlePrefix: "Beauty & ",
    titleHighlight: "Wellness",
    titleGradient: "from-rose-300 via-pink-200 to-amber-200",
    subtitle: "Premium skincare & cosmetics starting ₹99",
    cta: "Discover",
    ctaStyle: "bg-white text-surface-900 hover:bg-rose-50 shadow-white/30",
    bgGradient: "from-[#5B0830] via-[#850D45] to-[#B8175F]",
    textColor: "text-white",
    subtextColor: "text-rose-100/80",
    targetCategory: "home",
    glowClass: "bg-rose-500/25",
    products: [
      {
        name: "Hydrating Face Serum",
        img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=450&auto=format&fit=crop&q=85",
        className: "w-36 sm:w-48 lg:w-56 h-44 sm:h-56 lg:h-64 object-cover rounded-2xl shadow-2xl border-2 border-white/20 -rotate-3",
      },
      {
        name: "Soy Scented Candle",
        img: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=350&auto=format&fit=crop&q=85",
        className: "w-28 sm:w-36 lg:w-44 h-32 sm:h-44 lg:h-52 object-cover rounded-2xl shadow-2xl border-2 border-white/20 rotate-6 -ml-8 sm:-ml-12 mt-8 sm:mt-10",
      },
      {
        name: "Aroma Diffuser",
        img: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=300&auto=format&fit=crop&q=85",
        className: "hidden md:block w-24 lg:w-32 h-28 lg:h-36 object-cover rounded-xl shadow-lg border border-white/10 -rotate-6 -ml-4 mt-2",
      },
    ],
  },
];

export default function HeroBanner({ onSelectCategory }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handleCtaClick = () => {
    const slide = slides[current];
    if (onSelectCategory && slide.targetCategory) {
      onSelectCategory(slide.targetCategory);
    } else {
      const element = document.getElementById("category-navigation");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[current];

  return (
    <div
      className="relative w-full bg-surface-100 overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div
          onClick={handleCtaClick}
          className={`relative w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl transition-all duration-700 bg-gradient-to-r ${currentSlide.bgGradient} cursor-pointer group`}
        >
          {/* Ambient Glows */}
          <div
            className={`absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${currentSlide.glowClass}`}
          />
          <div
            className={`absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${currentSlide.glowClass}`}
          />

          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Content Layout */}
          <div className="relative z-10 px-6 sm:px-10 lg:px-16 py-8 sm:py-12 lg:py-16 flex flex-col md:flex-row items-center justify-between gap-8 min-h-[300px] sm:min-h-[360px] lg:min-h-[400px]">
            {/* Left Text Column */}
            <div key={current} className="flex-1 text-center md:text-left space-y-4 max-w-xl animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase backdrop-blur-md shadow-sm">
                <span className={currentSlide.badge.style + " px-3 py-1 rounded-full flex items-center"}>
                  <span>{currentSlide.badge.text}</span>
                </span>
              </div>

              {/* Title */}
              <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] ${currentSlide.textColor}`}>
                {currentSlide.titlePrefix}
                <span className={`bg-gradient-to-r ${currentSlide.titleGradient} bg-clip-text text-transparent`}>
                  {currentSlide.titleHighlight}
                </span>
              </h1>

              {/* Subtitle */}
              <p className={`text-sm sm:text-base lg:text-lg font-medium ${currentSlide.subtextColor}`}>
                {currentSlide.subtitle}
              </p>

              {/* Action Button */}
              <div className="pt-2 flex justify-center md:justify-start">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCtaClick();
                  }}
                  className={`px-7 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg active:scale-95 flex items-center gap-2 group/btn hover:scale-105 ${currentSlide.ctaStyle}`}
                >
                  <span>{currentSlide.cta}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Right Product Imagery Collage (Crystal Clear High-Res) */}
            <div key={`img-${current}`} className="flex-1 flex items-center justify-center relative w-full max-w-md md:max-w-none animate-fade-in">
              <div className="relative flex items-center justify-center py-4">
                {currentSlide.products.map((p) => (
                  <div
                    key={p.name}
                    className={`transition-all duration-500 transform hover:scale-105 hover:z-30 relative ${p.className}`}
                  >
                    <img
                      src={p.img}
                      alt={p.name}
                      className="w-full h-full object-cover rounded-[inherit]"
                      loading={current === 0 ? "eager" : "lazy"}
                    />
                    <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Left / Right Nav Arrows */}
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Bottom Pagination Dots */}
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/25 backdrop-blur-md">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent(idx);
                }}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  idx === current
                    ? "w-7 sm:w-8 h-2 bg-white shadow-md"
                    : "w-2 h-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
