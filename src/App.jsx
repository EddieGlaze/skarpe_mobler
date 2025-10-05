import React, { useState, useEffect, useRef } from "react";
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

// --- Responsive helpers ---
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

// Compute which tile is visually "in focus" (closest to viewport center)
const useScrollFocusIndex = (refs) => {
  const isTouch = useIsTouch();
  const [focusIndex, setFocusIndex] = useState(0);

  useEffect(() => {
    if (!isTouch) return; // Only needed on touch devices

    const compute = () => {
      const centerY = window.innerHeight / 2;
      let bestIdx = 0;
      let bestDelta = Infinity;
      refs.current.forEach((el, idx) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const delta = Math.abs(centerY - elCenter);
        // Only consider if at least partially in viewport
        const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;
        if (isVisible && delta < bestDelta) { bestDelta = delta; bestIdx = idx; }
      });
      setFocusIndex(bestIdx);
    };

    compute();
    const onScroll = () => compute();
    const onResize = () => compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [refs, isTouch]);

  return isTouch ? focusIndex : -1; // -1 disables on non-touch (desktop uses hover)
};

// Wrapper: responsive page padding and readable line-length on mobile
const LayoutWrapper = ({ children, isHomePage = false }) => (
  <div className={`min-h-screen flex flex-col font-['Courier_New',_monospace] text-left items-start ${isHomePage ? "" : "px-4 sm:px-6 md:px-8"}`}>
    <div className="flex-grow w-full">{children}</div>
    {!isHomePage && <Footer />}
  </div>
);

// Navigation: Furniture only (Projects/Drawings hidden)
const Navigation = () => {
  const { navigateWithTransition } = React.useContext(PageTransitionContext);
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
        <TransitionLink to="/furniture" className="hover:underline text-left">Furniture</TransitionLink>
        {/* Projects and Drawings links removed */}
      </nav>
    </div>
  );
};

const Footer = () => (
  <footer className="w-full py-12 px-4 sm:px-6 md:px-8 text-left mt-16 font-['Courier_New',_monospace] text-gray-600" />
);

// Home: Furniture only (Projects/Drawings links removed)
const Home = () => {
  const { navigateWithTransition } = React.useContext(PageTransitionContext);
  return (
    <LayoutWrapper isHomePage={true}>
      <div className="relative w-full h-screen">
        <img src={`${import.meta.env.BASE_URL}images/frontpage_images/all-1.JPEG`} alt="Industrial Furniture" className="w-full h-full object-cover" />
        <div className="absolute top-0 left-0 w-full pt-4 sm:pt-8 px-4 sm:px-6 md:px-8 text-left">
          <a href="/" className="block text-3xl sm:text-4xl md:text-5xl font-light mb-1 text-white uppercase font-['Courier_New',_monospace]">Studio Glazebrook</a>
          <span className="text-xs sm:text-sm font-light text-white">Contact: edvard@glazebrook.com | +47 123 45 678</span>
          <div className="mt-4 sm:mt-6 flex gap-4 sm:gap-6">
            <a
              href="/furniture"
              onClick={(e) => { e.preventDefault(); navigateWithTransition('/furniture'); }}
              className="hover:underline text-white text-base sm:text-xl font-light"
            >
              Furniture
            </a>
            {/* Projects/Drawings buttons removed */}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
};

// Tile and list components
function GalleryTile({ src, label, inFocus }) {
  return (
    <div className="relative w-72 sm:w-80">
      {/* Overlay: default visible, disappears on hover (desktop) OR when inFocus (touch) */}
      <div className={`absolute inset-0 bg-gradient-to-b from-white/90 to-white/30 transition-opacity duration-300 ${inFocus ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'}`}></div>
      <img src={src} alt={label} className="w-full h-auto object-cover" />
      <div className={`mt-2 text-left transition-opacity duration-300 ${inFocus ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <h2 className="text-sm font-light text-gray-600">{label}</h2>
      </div>
    </div>
  );
}

function ListWithFocus({ items, basePath }) {
  const refs = useRef([]);
  refs.current = [];
  const focusIndex = useScrollFocusIndex(refs);

  return (
    <div className="flex justify-center pt-28">
      <div className="flex flex-col items-center gap-10 sm:gap-12 max-w-xl pb-16">
        {items.map((item, idx) => (
          <TransitionLink to={`${basePath}/${item.id}`} key={item.id}>
            <div ref={(el) => (refs.current[idx] = el)}>
              <GalleryTile src={item.images[0]} label={item.name} inFocus={focusIndex === idx} />
            </div>
          </TransitionLink>
        ))}
      </div>
    </div>
  );
}

// Furniture pages (active)
const FurniturePage = () => (
  <LayoutWrapper>
    <Navigation />
    <ListWithFocus items={furnitureList} basePath="/furniture" />
  </LayoutWrapper>
);

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
            <img key={idx} src={img} alt={`${item.name} ${idx + 1}`} className="mb-6 sm:mb-8 w-full max-w-3xl object-contain" />
          ))}
          <h1 className="text-2xl sm:text-3xl font-light mb-2 text-gray-600 text-left w-full">{item.name}</h1>
          <p className="mb-6 font-light text-gray-600 text-left w-full text-sm sm:text-base">For inquiries about this piece, please click below:</p>
          <a href={`mailto:hannahjelmeland@gmail.com?subject=Request about ${item.name}`} className="inline-block bg-gray-400 text-white px-4 sm:px-6 py-2.5 sm:py-3 hover:bg-gray-700 transition font-light text-sm sm:text-base">Request this furniture</a>
        </div>
      </div>
    </LayoutWrapper>
  );
};

// App routes: only Home and Furniture; anything else redirects to "/"
const AppContent = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/furniture" element={<FurniturePage />} />
    <Route path="/furniture/:id" element={<FurnitureDetail />} />
    {/* Deactivated:
    <Route path="/projects" element={<ProjectsPage />} />
    <Route path="/projects/:id" element={<ProjectDetail />} />
    <Route path="/drawings" element={<DrawingsPage />} />
    <Route path="/drawings/:id" element={<DrawingDetail />} />
    */}
    {/* Redirect any other paths (including old Projects/Drawings URLs) to Home */}
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
