import React, { useState, useEffect, useRef, useCallback } from "react";
import { BrowserRouter as Router, Route, Routes, useParams, useNavigate, Navigate } from "react-router-dom";

/**
 * DATA
 * (Only Furniture is active. Projects/Drawings removed.)
 */
const furnitureList = [
  { id: "table1", name: "Skarpt Bord", images: [
    `${import.meta.env.BASE_URL}images/table/table-1.JPEG`,
    `${import.meta.env.BASE_URL}images/table/table-2.JPEG`,
    `${import.meta.env.BASE_URL}images/table/table-3.JPEG`,
  ]},
  { id: "chair1", name: "Skarp Stol", images: [
    `${import.meta.env.BASE_URL}images/chair/chair-1.JPEG`,
    `${import.meta.env.BASE_URL}images/chair/chair-2.JPEG`,
    `${import.meta.env.BASE_URL}images/chair/chair-3.JPEG`,
  ]},
  { id: "shelf1", name: "Skarp Hylle", images: [
    `${import.meta.env.BASE_URL}images/hylle_a/Hylle_A_1.jpg`,
    `${import.meta.env.BASE_URL}images/hylle_a/Hylle_A_2.jpg`,
    `${import.meta.env.BASE_URL}images/hylle_a/Hylle_A_3.jpg`,
    `${import.meta.env.BASE_URL}images/hylle_a/Hylle_A_4.jpg`,
    `${import.meta.env.BASE_URL}images/hylle_a/Hylle_A_5.jpg`,
    `${import.meta.env.BASE_URL}images/hylle_a/Hylle_A_6.jpg`,
    `${import.meta.env.BASE_URL}images/hylle_a/Hylle_A_7.jpg`,
  ]},
  { id: "table2", name: "Skarpt Bord II", images: [
    `${import.meta.env.BASE_URL}images/table/table-2.JPEG`,
    `${import.meta.env.BASE_URL}images/table/table-1.JPEG`,
    `${import.meta.env.BASE_URL}images/table/table-3.JPEG`,
  ]},
  { id: "chair2", name: "Skarp Stol II", images: [
    `${import.meta.env.BASE_URL}images/chair/chair-2.JPEG`,
    `${import.meta.env.BASE_URL}images/chair/chair-1.JPEG`,
    `${import.meta.env.BASE_URL}images/chair/chair-3.JPEG`,
  ]},
  { id: "shelf2", name: "Skarp Hylle II", images: [
    `${import.meta.env.BASE_URL}images/shelf/shelf-2.JPEG`,
    `${import.meta.env.BASE_URL}images/shelf/shelf-1.JPEG`,
    `${import.meta.env.BASE_URL}images/shelf/shelf-3.JPEG`,
  ]},
  { id: "table3", name: "Skarpt Bord III", images: [
    `${import.meta.env.BASE_URL}images/table/table-3.JPEG`,
    `${import.meta.env.BASE_URL}images/table/table-1.JPEG`,
    `${import.meta.env.BASE_URL}images/table/table-2.JPEG`,
  ]},
  { id: "chair3", name: "Skarp Stol III", images: [
    `${import.meta.env.BASE_URL}images/chair/chair-3.JPEG`,
    `${import.meta.env.BASE_URL}images/chair/chair-1.JPEG`,
    `${import.meta.env.BASE_URL}images/chair/chair-2.JPEG`,
  ]},
  { id: "shelf3", name: "Skarp Hylle III", images: [
    `${import.meta.env.BASE_URL}images/shelf/shelf-3.JPEG`,
    `${import.meta.env.BASE_URL}images/shelf/shelf-1.JPEG`,
    `${import.meta.env.BASE_URL}images/shelf/shelf-2.JPEG`,
  ]},
];

// --- Page transition context (kept minimal) ---
const PageTransitionContext = React.createContext();
const transitionDuration = 600;

const PageTransitionProvider = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextPage, setNextPage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (nextPage && isTransitioning) {
      const timer = setTimeout(() => {
        navigate(nextPage);
        setIsTransitioning(false);
        setNextPage(null);
      }, transitionDuration);
      return () => clearTimeout(timer);
    }
  }, [nextPage, isTransitioning, navigate]);

  const navigateWithTransition = (to) => {
    setIsTransitioning(true);
    setNextPage(to);
  };

  return (
    <PageTransitionContext.Provider value={{ isTransitioning, navigateWithTransition }}>
      <div
        className="transition-opacity ease-in-out"
        style={{ opacity: isTransitioning ? 0 : 1, transitionDuration: `${transitionDuration}ms` }}
      >
        {children}
      </div>
    </PageTransitionContext.Provider>
  );
};

const TransitionLink = ({ to, children, className = "" }) => {
  const { navigateWithTransition } = React.useContext(PageTransitionContext);
  return (
    <a
      href={to}
      onClick={(e) => { e.preventDefault(); navigateWithTransition(to); }}
      className={`group block ${className}`}
    >
      {children}
    </a>
  );
};

// --- Layout wrapper ---
const LayoutWrapper = ({ children, isHomePage = false }) => (
  <div className={`min-h-screen flex flex-col font-['Courier_New',_monospace] text-left items-start w-full overflow-x-hidden ${isHomePage ? "" : "px-4 sm:px-6 md:px-8"}`}>
    <div className="flex-grow w-full">{children}</div>
    {!isHomePage && <Footer />}
  </div>
);

// --- Navigation (glass on scroll for furniture pages) ---
const Navigation = ({ hideOnHome = false, glass = false, glassActive = false }) => {
  const { navigateWithTransition } = React.useContext(PageTransitionContext);
  if (hideOnHome) return null;

  const containerBase = "fixed top-0 left-0 w-full flex flex-col items-start z-40 font-['Courier_New',_monospace] text-gray-600 px-4 sm:px-6 md:px-8 transition-colors duration-300";
  const spacing = "py-3 sm:py-4";
  const bgClass = glass && glassActive ? "bg-white/60 backdrop-blur-md" : "bg-transparent";

  return (
    <div className={`${containerBase} ${spacing} ${bgClass}`}>
      <a
        href="/"
        onClick={(e) => { e.preventDefault(); navigateWithTransition('/'); }}
        className="text-2xl sm:text-3xl md:text-4xl font-light mb-1 select-none uppercase"
      >
        Studio Glazebrook
      </a>
      <span className="text-xs sm:text-sm font-light break-words pr-2">Contact: edvard@glazebrook.com | +47 123 45 678</span>
      <nav className="flex justify-start w-full max-w-md text-base sm:text-lg font-light mt-2 gap-4 sm:gap-6">
        <TransitionLink to="/" className="hover:underline text-left">Hjem</TransitionLink>
        <TransitionLink to="/furniture" className="hover:underline text-left">Møbler</TransitionLink>
      </nav>
    </div>
  );
};

const Footer = () => (
  <footer className="w-full py-12 px-4 sm:px-6 md:px-8 text-left mt-16 font-['Courier_New',_monospace] text-gray-600" />
);

// --- Home Page (kept as before) ---
const Home = () => {
  const { navigateWithTransition } = React.useContext(PageTransitionContext);
  return (
    <LayoutWrapper isHomePage={true}>
      <div className="relative w-full h-screen">
        <img
          src={`${import.meta.env.BASE_URL}images/frontpage_images/all-1.JPEG`}
          alt="Industrial Furniture"
          className="w-full h-full object-cover block"
        />
        <div className="absolute top-0 left-0 w-full pt-4 sm:pt-8 px-4 sm:px-6 md:px-8 text-left">
          <a href="/" className="block text-3xl sm:text-4xl md:text-5xl font-light mb-1 text-white uppercase font-['Courier_New',_monospace]">Studio Glazebrook</a>
          <span className="text-xs sm:text-sm font-light text-white">Contact: edvard@glazebrook.com | +47 123 45 678</span>
          <div className="mt-4 sm:mt-6 flex gap-4 sm:gap-6">
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); navigateWithTransition('/'); }}
              className="hover:underline text-white text-base sm:text-xl font-light"
            >
              Hjem
            </a>
            <a
              href="/furniture"
              onClick={(e) => { e.preventDefault(); navigateWithTransition('/furniture'); }}
              className="hover:underline text-white text-base sm:text-xl font-light"
            >
              Møbler
            </a>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
};

/* --------- Furniture Index (simple, flicker-free) --------- */
// Minimal: native page scroll only. Overlay fades on desktop hover; on mobile it stays steady.
// Rectangular corners everywhere.

const GalleryTile = React.memo(function GalleryTile({ src, label }) {
  return (
    <div className="relative w-72 sm:w-80 mx-auto group">
      {/* Overlay (steady by default; fades out on desktop hover). No rounded corners. */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 to-white/20 opacity-100 transition-opacity duration-200 group-hover:opacity-0" />
      <img
        src={src}
        alt={label}
        className="w-full h-auto object-cover block mx-auto"
        loading="lazy"
        decoding="async"
      />
      {/* Label (appears on desktop hover). */}
      <div className="mt-2 text-left opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <h2 className="text-center sm:text-left text-sm font-light text-gray-600">{label}</h2>
      </div>
    </div>
  );
});

const FurnitureIndexPage = React.memo(function FurnitureIndexPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <LayoutWrapper>
      <Navigation glass glassActive={scrolled} />
      <div className="w-full flex justify-center pt-28">
        <div className="w-full max-w-xl flex flex-col items-center gap-14 sm:gap-16 pb-20">
          {furnitureList.map((item) => (
            <TransitionLink to={`/furniture/${item.id}`} key={item.id}>
              <GalleryTile src={item.images[0]} label={item.name} />
            </TransitionLink>
          ))}
        </div>
      </div>
    </LayoutWrapper>
  );
});

/* --------- Furniture Detail (carousel: rectangular, no captions, no 'Fyll') --------- */

function useSwipe(onLeft, onRight) {
  const startX = useRef(0);
  const startY = useRef(0);
  const tracking = useRef(false);

  const onTouchStart = (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    tracking.current = true;
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e) => {
    if (!tracking.current) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;
    if (Math.abs(dy) > Math.abs(dx) * 1.2) tracking.current = false; // allow natural vertical scroll
  };
  const onTouchEnd = (e) => {
    if (!tracking.current) return;
    tracking.current = false;
    const touch = e.changedTouches && e.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - startX.current;
    const threshold = 40;
    if (dx <= -threshold) onLeft?.();
    else if (dx >= threshold) onRight?.();
  };
  return { onTouchStart, onTouchMove, onTouchEnd };
}

const Carousel = ({ images, name }) => {
  const [idx, setIdx] = useState(0);
  const total = images.length;

  const go = useCallback((n) => {
    setIdx((cur) => (cur + n + total) % total);
  }, [total]);

  const goTo = (i) => setIdx(i);

  // Keyboard left/right
  const wrapRef = useRef(null);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [go]);

  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe(() => go(1), () => go(-1));

  return (
    <div ref={wrapRef} tabIndex={0} className="w-full max-w-3xl mx-auto outline-none select-none">
      {/* Stage: rectangular, no rounded corners, no captions, object-contain */}
      <div
        className="relative w-full aspect-[4/3] bg-white border border-gray-200 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        aria-roledescription="karusell"
      >
        <div
          className="w-full h-full flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${idx * 100}%)` }}
          aria-live="polite"
        >
          {images.map((src, i) => (
            <div key={i} className="w-full h-full shrink-0 flex items-center justify-center p-2">
              <img
                src={src}
                alt={`${name} – bilde ${i + 1}`}
                className="max-w-full max-h-full object-contain block"
                loading={i === idx ? "eager" : "lazy"}
                decoding="async"
              />
            </div>
          ))}
        </div>

        {/* Arrows: rectangular (no circles, no rounded corners) */}
        <button
          type="button"
          aria-label="Forrige"
          onClick={() => go(-1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 w-10 h-10 flex items-center justify-center border border-gray-300"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Neste"
          onClick={() => go(1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 w-10 h-10 flex items-center justify-center border border-gray-300"
        >
          ›
        </button>
      </div>

      {/* Thumbnails: rectangular, no rounded corners */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {images.map((src, i) => (
          <button
            type="button"
            key={i}
            aria-label={`Bilde ${i + 1}`}
            onClick={() => goTo(i)}
            className={`shrink-0 border ${i === idx ? 'border-gray-900' : 'border-gray-300'} p-0.5`}
            title={`${name} – bilde ${i + 1}`}
          >
            <img
              src={src}
              alt=""
              className="block h-16 w-24 object-cover"
              loading="lazy"
              decoding="async"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

const FurnitureDetail = () => {
  const { id } = useParams();
  const item = furnitureList.find((f) => f.id === id);
  if (!item) return <div className="p-6 text-left font-light text-gray-600">Furniture not found</div>;

  return (
    <LayoutWrapper>
      <Navigation glass glassActive />
      <div className="mx-auto w-full pt-28 px-4 sm:px-6 md:px-8 max-w-3xl">
        <div className="flex flex-col items-center">
          <Carousel images={item.images} name={item.name} />

          <h1 className="text-2xl sm:text-3xl font-light mt-6 mb-2 text-gray-600 text-left w-full">{item.name}</h1>
          <p className="mb-4 font-light text-gray-600 text-left w-full text-sm sm:text-base">
            Ønsker du mer informasjon eller å gå videre? Trykk under:
          </p>
          <a
            href={`mailto:hannahjelmeland@gmail.com?subject=Interesse for ${encodeURIComponent(item.name)}`}
            className="self-start inline-block bg-gray-700 text-white px-5 py-3 hover:bg-gray-800 transition font-light text-sm sm:text-base"
          >
            Vis interesse
          </a>
        </div>
      </div>
    </LayoutWrapper>
  );
};

// --- Routes ---
const AppContent = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/furniture" element={<FurnitureIndexPage />} />
    <Route path="/furniture/:id" element={<FurnitureDetail />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AppWithTransition />
    </Router>
  );
}

function AppWithTransition() {
  return (
    <PageTransitionProvider>
      <AppContent />
    </PageTransitionProvider>
  );
}
