import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { BrowserRouter as Router, Route, Routes, useParams, useNavigate, Navigate } from "react-router-dom";

/**
 * DATA
 * (Only Furniture is active. Projects/Drawings removed.)
 * For captions, we auto-generate "«Name» – Bilde N" if no explicit caption list exists.
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

// --- Page transition context ---
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

// --- Responsive + a11y helpers ---
const useIsTouch = () => {
  const [isTouch, setIsTouch] = useState(() =>
    (typeof window !== 'undefined'
      ? window.matchMedia('(hover: none) and (pointer: coarse)').matches
      : false)
  );
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(hover: none) and (pointer: coarse)');
    const handler = (e) => setIsTouch(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);
  return isTouch;
};

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setReduced(e.matches);
    setReduced(mq.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);
  return reduced;
};

// --- Visibility ratios (0..1) for each tile (continuous; no thresholds) ---
const buildThresholds = (steps = 24) =>
  Array.from({ length: steps + 1 }, (_, i) => i / steps);

const useVisibilityRatios = (itemRefs) => {
  const [ratiosState, setRatiosState] = useState([]);
  const rafLock = useRef(false);
  const ratios = useRef([]);

  useEffect(() => {
    ratios.current = new Array(itemRefs.current.length).fill(0);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target.getAttribute("data-idx"));
          ratios.current[idx] = entry.intersectionRatio;
        });
        if (!rafLock.current) {
          rafLock.current = true;
          requestAnimationFrame(() => {
            rafLock.current = false;
            setRatiosState(ratios.current.slice());
          });
        }
      },
      { threshold: buildThresholds(24) }
    );

    itemRefs.current.forEach((el, idx) => {
      if (!el) return;
      el.setAttribute("data-idx", String(idx));
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [itemRefs]);

  return ratiosState;
};

// --- Layout wrapper ---
const LayoutWrapper = ({ children, isHomePage = false }) => (
  <div className={`min-h-screen flex flex-col font-['Courier_New',_monospace] text-left items-start w-full overflow-x-hidden ${isHomePage ? "" : "px-4 sm:px-6 md:px-8"}`}>
    <div className="flex-grow w-full">{children}</div>
    {!isHomePage && <Footer />}
  </div>
);

// --- Navigation with optional glass layer on scroll ---
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

// --- Home Page (no Navigation on top now) ---
const Home = () => {
  const { navigateWithTransition } = React.useContext(PageTransitionContext);
  return (
    <LayoutWrapper isHomePage={true}>
      {/* Navigation hidden on Home */}
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

/* --------- Furniture Index (list) --------- */

// Continuous overlay/label based on ratio (touch); desktop keeps hover reveal
const GalleryTile = React.memo(function GalleryTile({ src, label, ratio, isTouch, reducedMotion }) {
  // Smooth mapping: ignore tiny intersections and ease out near 1
  // t in [0,1], where t=0 before ~20% visible, t=1 at full visibility
  const t = Math.max(0, Math.min(1, (ratio - 0.2) / 0.6));
  const eased = reducedMotion ? t : Math.pow(t, 1.6);

  // Touch: overlay fades out with visibility; Desktop: hover controls overlay
  const overlayOpacity = isTouch ? (1 - eased) : 1;

  // Touch: label fades in with visibility; Desktop: label on hover
  const labelOpacity = isTouch ? eased : 0;

  return (
    <div className="relative w-72 sm:w-80 will-change-transform mx-auto">
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-b from-white/90 to-white/30 transition-opacity duration-200 ${!isTouch ? 'group-hover:opacity-0' : ''}`}
        style={isTouch ? { opacity: overlayOpacity } : undefined}
      />
      {/* Image */}
      <img
        src={src}
        alt={label}
        className="w-full h-auto object-cover block mx-auto"
        loading="lazy"
        decoding="async"
        // subtle image brightening as it becomes visible on touch
        style={isTouch && !reducedMotion ? { opacity: 0.9 + 0.1 * eased } : undefined}
      />
      {/* Label */}
      <div
        className={`mt-2 text-left transition-opacity duration-200 ${!isTouch ? 'opacity-0 group-hover:opacity-100' : ''}`}
        style={isTouch ? { opacity: labelOpacity } : undefined}
      >
        <h2 className="text-center sm:text-left text-sm font-light text-gray-600">{label}</h2>
      </div>
    </div>
  );
});

function ListWithContinuousReveal({ items, basePath }) {
  const isTouch = useIsTouch();
  const reducedMotion = usePrefersReducedMotion();

  // Item refs for IO
  const itemRefs = useRef([]);
  itemRefs.current = useMemo(() => new Array(items.length).fill(null), [items.length]);

  // Continuous visibility ratios (0..1)
  const ratios = useVisibilityRatios(itemRefs);

  return (
    <div className="w-full flex justify-center pt-28">
      <div className="w-full max-w-xl flex flex-col items-center gap-14 sm:gap-16 pb-20">
        {items.map((item, idx) => (
          <TransitionLink to={`${basePath}/${item.id}`} key={item.id}>
            <div
              ref={(el) => (itemRefs.current[idx] = el)}
              style={{ scrollMarginTop: "6rem", scrollMarginBottom: "6rem" }}
              className="group"
            >
              <GalleryTile
                src={item.images[0]}
                label={item.name}
                ratio={ratios?.[idx] ?? 0}
                isTouch={isTouch}
                reducedMotion={reducedMotion}
              />
            </div>
          </TransitionLink>
        ))}
      </div>
    </div>
  );
}

// Renamed to avoid redeclaration conflicts
const FurnitureIndexPage = React.memo(function FurnitureIndexPage() {
  const [scrolled, setScrolled] = useState(false);

  // Glass nav after small scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <LayoutWrapper>
      <Navigation glass glassActive={scrolled} />
      <ListWithContinuousReveal items={furnitureList} basePath="/furniture" />
    </LayoutWrapper>
  );
});

/* --------- Furniture Detail (carousel) --------- */

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
    // allow vertical scroll
    if (Math.abs(dy) > Math.abs(dx) * 1.2) {
      tracking.current = false;
    }
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
  const [fit, setFit] = useState("contain"); // 'contain' | 'cover'
  const total = images.length;

  const go = useCallback((n) => {
    setIdx((cur) => (cur + n + total) % total);
  }, [total]);

  const goTo = (i) => setIdx(i);

  // Captions: use defaults if none provided
  const captions = useMemo(
    () => images.map((_, i) => `${name} – Bilde ${i + 1}`),
    [images, name]
  );

  // Keyboard left/right on container
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
      {/* Controls row */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-600">{idx + 1} / {total}</div>
        <button
          type="button"
          onClick={() => setFit((f) => (f === "contain" ? "cover" : "contain"))}
          className="text-sm px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50"
          aria-pressed={fit === "cover"}
          aria-label={fit === "cover" ? "Bytt til tilpass" : "Bytt til fyll"}
          title={fit === "cover" ? "Tilpass" : "Fyll"}
        >
          {fit === "cover" ? "Tilpass" : "Fyll"}
        </button>
      </div>

      {/* Stage */}
      <div
        className="relative w-full aspect-[4/3] bg-white border border-gray-200 rounded-xl overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        aria-roledescription="karusell"
      >
        {/* Slides */}
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
                className={`max-w-full max-h-full block ${fit === "contain" ? "object-contain" : "object-cover w-full h-full"}`}
                loading={i === idx ? "eager" : "lazy"}
                decoding="async"
              />
            </div>
          ))}
        </div>

        {/* Arrows */}
        <button
          type="button"
          aria-label="Forrige"
          onClick={() => go(-1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full w-10 h-10 flex items-center justify-center shadow"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Neste"
          onClick={() => go(1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full w-10 h-10 flex items-center justify-center shadow"
        >
          ›
        </button>

        {/* Caption overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/90 to-white/0 p-3">
          <div className="text-center text-sm text-gray-800">{captions[idx]}</div>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {images.map((src, i) => (
          <button
            type="button"
            key={i}
            aria-label={`Bilde ${i + 1}`}
            onClick={() => goTo(i)}
            className={`shrink-0 border ${i === idx ? 'border-gray-700' : 'border-gray-300'} rounded-md p-0.5`}
            title={captions[i]}
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
            className="self-start inline-block bg-gray-700 text-white px-5 py-3 rounded-md hover:bg-gray-800 transition font-light text-sm sm:text-base"
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
