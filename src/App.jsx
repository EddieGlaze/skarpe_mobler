import React, { useState, useEffect, useRef, useMemo } from "react";
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
        className={`transition-opacity ease-in-out`}
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

// --- Intersection ratios (0..1) for each tile ---
const buildThresholds = (steps = 20) =>
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
      { threshold: buildThresholds(16) }
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

// --- Rock-solid focus: EMA + debounce + margin (touch only) ---
const useStableFocus = (ratios, itemCount) => {
  const isTouch = useIsTouch();
  const [focusIndex, setFocusIndex] = useState(-1);

  const scoresRef = useRef([]);
  const lastSwitchRef = useRef(0);

  useEffect(() => {
    if (!isTouch || !ratios || ratios.length === 0) return;

    // init scores
    if (scoresRef.current.length !== itemCount) {
      scoresRef.current = new Array(itemCount).fill(0);
      setFocusIndex((prev) => (prev === -1 ? 0 : prev));
      lastSwitchRef.current = performance.now();
    }

    const alpha = 0.22;          // smoothing strength (higher = more reactive)
    const margin = 0.10;         // candidate must beat current by 10%
    const minInterval = 180;     // ms between switches

    // update EMA scores
    for (let i = 0; i < itemCount; i++) {
      const r = ratios[i] ?? 0;
      scoresRef.current[i] = (1 - alpha) * scoresRef.current[i] + alpha * r;
    }

    // find best score
    let bestIdx = 0;
    let best = -1;
    for (let i = 0; i < itemCount; i++) {
      if (scoresRef.current[i] > best) {
        best = scoresRef.current[i];
        bestIdx = i;
      }
    }

    // decide switch
    const now = performance.now();
    if (focusIndex === -1) {
      setFocusIndex(bestIdx);
      lastSwitchRef.current = now;
    } else if (
      now - lastSwitchRef.current > minInterval &&
      scoresRef.current[bestIdx] > scoresRef.current[focusIndex] + margin
    ) {
      setFocusIndex(bestIdx);
      lastSwitchRef.current = now;
    }
  }, [ratios, itemCount, isTouch, focusIndex]);

  return isTouch ? focusIndex : -1;
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

// --- Furniture pages (single page scroll + soft snap + stable focus + crossfade) ---
const GalleryTile = React.memo(function GalleryTile({ src, label, inFocus, visibilityRatio, isTouch, reducedMotion }) {
  // Subtle crossfade on touch: 0.90 -> 1.0
  const imgOpacity = reducedMotion
    ? 1
    : isTouch
      ? Math.min(1, 0.90 + 0.10 * (visibilityRatio || 0))
      : 1;

  // Overlay & label behavior:
  // - Touch: reveal on focus (no hover)
  // - Desktop: reveal on hover (group-hover)
  const overlayBase = "absolute inset-0 bg-gradient-to-b from-white/90 to-white/30 transition-opacity duration-300";
  const labelBase = "mt-2 text-left transition-opacity duration-300";

  const overlayClass = isTouch
    ? `${overlayBase} ${inFocus ? 'opacity-0' : 'opacity-100'}`
    : `${overlayBase} opacity-100 group-hover:opacity-0`;

  const labelClass = isTouch
    ? `${labelBase} ${inFocus ? 'opacity-100' : 'opacity-0'}`
    : `${labelBase} opacity-0 group-hover:opacity-100`;

  return (
    <div className="relative w-72 sm:w-80 will-change-transform mx-auto">
      <div className={overlayClass}></div>
      <img
        src={src}
        alt={label}
        className="w-full h-auto object-cover block mx-auto"
        loading="lazy"
        decoding="async"
        style={{ opacity: imgOpacity }}
      />
      <div className={labelClass}>
        <h2 className="text-center sm:text-left text-sm font-light text-gray-600">{label}</h2>
      </div>
    </div>
  );
});

function ListWithFocus({ items, basePath }) {
  const isTouch = useIsTouch();
  const reducedMotion = usePrefersReducedMotion();

  // Item refs for observers/measurements
  const itemRefs = useRef([]);
  itemRefs.current = useMemo(() => new Array(items.length).fill(null), [items.length]);

  // Visibility (for crossfade), then stable focus (EMA + debounce + margin)
  const ratios = useVisibilityRatios(itemRefs);
  const focusIndex = useStableFocus(ratios, items.length);

  return (
    <div className="w-full flex justify-center pt-28">
      <div className="w-full max-w-xl flex flex-col items-center gap-14 sm:gap-16 pb-20">
        {items.map((item, idx) => (
          <TransitionLink to={`${basePath}/${item.id}`} key={item.id}>
            <div
              ref={(el) => (itemRefs.current[idx] = el)}
              className={isTouch ? "snap-center" : ""}
              style={isTouch ? { scrollMarginTop: "6rem", scrollMarginBottom: "6rem", scrollSnapStop: "normal" } : undefined}
            >
              <GalleryTile
                src={item.images[0]}
                label={item.name}
                inFocus={focusIndex === idx}
                visibilityRatio={ratios?.[idx] ?? 0}
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

const FurniturePage = () => {
  const isTouch = useIsTouch();
  const reducedMotion = usePrefersReducedMotion();
  const [scrolled, setScrolled] = useState(false);

  // Page-level soft snap on touch, and glass nav on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isTouch || reducedMotion) return;

    const root = document.documentElement;
    const prevSnapType = root.style.scrollSnapType;
    const prevPadTop = root.style.scrollPaddingTop;
    const prevPadBottom = root.style.scrollPaddingBottom;

    root.style.scrollSnapType = "y proximity"; // softer snap
    root.style.scrollPaddingTop = "6rem";      // account for fixed nav
    root.style.scrollPaddingBottom = "6rem";

    return () => {
      root.style.scrollSnapType = prevSnapType || "";
      root.style.scrollPaddingTop = prevPadTop || "";
      root.style.scrollPaddingBottom = prevPadBottom || "";
    };
  }, [isTouch, reducedMotion]);

  return (
    <LayoutWrapper>
      <Navigation glass glassActive={scrolled} />
      <ListWithFocus items={furnitureList} basePath="/furniture" />
    </LayoutWrapper>
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
          {item.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${item.name} ${idx + 1}`}
              className="mb-6 sm:mb-8 w-full max-w-3xl object-contain block mx-auto"
              loading="lazy"
              decoding="async"
            />
          ))}
          <h1 className="text-2xl sm:text-3xl font-light mb-2 text-gray-600 text-left w-full">{item.name}</h1>
          <p className="mb-6 font-light text-gray-600 text-left w-full text-sm sm:text-base">For inquiries about this piece, please click below:</p>
          <a href={`mailto:hannahjelmeland@gmail.com?subject=Request about ${item.name}`} className="inline-block bg-gray-400 text-white px-4 sm:px-6 py-2.5 sm:py-3 hover:bg-gray-700 transition font-light text-sm sm:text-base">Request this furniture</a>
        </div>
      </div>
    </LayoutWrapper>
  );
};

// --- Routes ---
const AppContent = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/furniture" element={<FurniturePage />} />
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
