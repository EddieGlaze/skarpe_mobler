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

// --- Visibility ratios via IntersectionObserver (for crossfade) ---
const buildThresholds = (steps = 20) =>
  Array.from({ length: steps + 1 }, (_, i) => i / steps);

const useVisibilityRatios = (itemRefs) => {
  const isTouch = useIsTouch();
  const [ratiosState, setRatiosState] = useState([]);
  const rafLock = useRef(false);
  const ratios = useRef([]);

  useEffect(() => {
    // We can keep ratios on both touch/desktop without cost; but only needed for touch crossfade.
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

// --- Stable focus by "center + hysteresis" (touch only) ---
const useFocusByCenter = (itemRefs) => {
  const isTouch = useIsTouch();
  const [focusIndex, setFocusIndex] = useState(-1);
  const currentRef = useRef(-1);
  const scheduled = useRef(false);

  useEffect(() => {
    if (!isTouch) return;

    const HYSTERESIS_PX = 32;                 // margin required to switch focus
    const compute = () => {
      scheduled.current = false;
      const centerY = window.innerHeight / 2;
      let bestIdx = -1;
      let bestDist = Infinity;

      itemRefs.current.forEach((el, idx) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const dist = Math.abs(elCenter - centerY);
        if (dist < bestDist) { bestDist = dist; bestIdx = idx; }
      });

      const prev = currentRef.current;
      if (prev === -1) {
        currentRef.current = bestIdx;
        setFocusIndex(bestIdx);
        return;
      }
      if (bestIdx !== prev) {
        const prevEl = itemRefs.current[prev];
        const prevRect = prevEl ? prevEl.getBoundingClientRect() : null;
        const prevCenter = prevRect ? prevRect.top + prevRect.height / 2 : Infinity;
        const prevDist = prevRect ? Math.abs(prevCenter - centerY) : Infinity;

        // Only switch if the new candidate is CLEARLY closer than the current one
        if (bestDist + HYSTERESIS_PX < prevDist) {
          currentRef.current = bestIdx;
          setFocusIndex(bestIdx);
        }
      }
    };

    const onScroll = () => {
      if (!scheduled.current) {
        scheduled.current = true;
        requestAnimationFrame(compute);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll(); // initial compute

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isTouch, itemRefs]);

  return isTouch ? focusIndex : -1;
};

// --- Layout wrapper ---
const LayoutWrapper = ({ children, isHomePage = false }) => (
  <div className={`min-h-screen flex flex-col font-['Courier_New',_monospace] text-left items-start w-full overflow-x-hidden ${isHomePage ? "" : "px-4 sm:px-6 md:px-8"}`}>
    <div className="flex-grow w-full">{children}</div>
    {!isHomePage && <Footer />}
  </div>
);

// --- Navigation (Hjem + Møbler, hidden on Home) ---
const Navigation = ({ hideOnHome = false }) => {
  const { navigateWithTransition } = React.useContext(PageTransitionContext);
  if (hideOnHome) return null;

  return (
    <div className="fixed top-0 left-0 w-full bg-transparent flex flex-col items-start py-3 sm:py-4 z-40 font-['Courier_New',_monospace] text-gray-600 px-4 sm:px-6 md:px-8">
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
  // Subtle crossfade: 0.85 -> 1.0 as the tile becomes fully visible (touch only)
  const imgOpacity = reducedMotion
    ? 1
    : isTouch
      ? Math.min(1, 0.85 + 0.15 * (visibilityRatio || 0))
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

  // Stable focus (center + hysteresis) & visibility ratios (for crossfade)
  const focusIndex = useFocusByCenter(itemRefs);
  const ratios = useVisibilityRatios(itemRefs);

  return (
    <div className="w-full flex justify-center pt-28">
      <div className="w-full max-w-xl flex flex-col items-center gap-14 sm:gap-16 pb-20">
        {items.map((item, idx) => (
          <TransitionLink to={`${basePath}/${item.id}`} key={item.id}>
            <div
              ref={(el) => (itemRefs.current[idx] = el)}
              className={isTouch ? "snap-center" : ""}
              style={isTouch ? { scrollMarginTop: "6rem", scrollMarginBottom: "6rem", scrollSnapStop: "always" } : undefined}
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

  // Enable page-level snapping only on touch & only on this page
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
      <Navigation />
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
      <Navigation />
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
