import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link, useParams, useLocation, useNavigate } from "react-router-dom";

const furnitureList = [
  {
    id: "table1",
    name: "Skarpt Bord",
    images: [
      `${import.meta.env.BASE_URL}images/table/table-1.JPEG`,
      `${import.meta.env.BASE_URL}images/table/table-2.JPEG`,
      `${import.meta.env.BASE_URL}images/table/table-3.JPEG`,
    ],
  },
  {
    id: "chair1",
    name: "Skarp Stol",
    images: [
      `${import.meta.env.BASE_URL}images/chair/chair-1.JPEG`,
      `${import.meta.env.BASE_URL}images/chair/chair-2.JPEG`,
      `${import.meta.env.BASE_URL}images/chair/chair-3.JPEG`,
    ],
  },
  {
    id: "shelf1",
    name: "Skarp Hylle",
    images: [
      `${import.meta.env.BASE_URL}images/shelf/shelf-1.JPEG`,
      `${import.meta.env.BASE_URL}images/shelf/shelf-2.JPEG`,
      `${import.meta.env.BASE_URL}images/shelf/shelf-3.JPEG`,
      `${import.meta.env.BASE_URL}images/shelf/shelf-4.JPEG`,
    ],
  },
  {
    id: "table2",
    name: "Skarpt Bord II",
    images: [
      `${import.meta.env.BASE_URL}images/table/table-2.JPEG`,
      `${import.meta.env.BASE_URL}images/table/table-1.JPEG`,
      `${import.meta.env.BASE_URL}images/table/table-3.JPEG`,
    ],
  },
  {
    id: "chair2",
    name: "Skarp Stol II",
    images: [
      `${import.meta.env.BASE_URL}images/chair/chair-2.JPEG`,
      `${import.meta.env.BASE_URL}images/chair/chair-1.JPEG`,
      `${import.meta.env.BASE_URL}images/chair/chair-3.JPEG`,
    ],
  },
  {
    id: "shelf2",
    name: "Skarp Hylle II",
    images: [
      `${import.meta.env.BASE_URL}images/shelf/shelf-2.JPEG`,
      `${import.meta.env.BASE_URL}images/shelf/shelf-1.JPEG`,
      `${import.meta.env.BASE_URL}images/shelf/shelf-3.JPEG`,
    ],
  },
  {
    id: "table3",
    name: "Skarpt Bord III",
    images: [
      `${import.meta.env.BASE_URL}images/table/table-3.JPEG`,
      `${import.meta.env.BASE_URL}images/table/table-1.JPEG`,
      `${import.meta.env.BASE_URL}images/table/table-2.JPEG`,
    ],
  },
  {
    id: "chair3",
    name: "Skarp Stol III",
    images: [
      `${import.meta.env.BASE_URL}images/chair/chair-3.JPEG`,
      `${import.meta.env.BASE_URL}images/chair/chair-1.JPEG`,
      `${import.meta.env.BASE_URL}images/chair/chair-2.JPEG`,
    ],
  },
  {
    id: "shelf3",
    name: "Skarp Hylle III",
    images: [
      `${import.meta.env.BASE_URL}images/shelf/shelf-3.JPEG`,
      `${import.meta.env.BASE_URL}images/shelf/shelf-1.JPEG`,
      `${import.meta.env.BASE_URL}images/shelf/shelf-2.JPEG`,
    ],
  },
];

// Global state for page transitions
const PageTransitionContext = React.createContext();

// Define transition durations in one place for consistency
const transitionDuration = 600; // 1.2 seconds for a slower fade

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
      }, transitionDuration); // Wait for the full transition duration
      
      return () => clearTimeout(timer);
    }
  }, [nextPage, isTransitioning, navigate]);

  const navigateWithTransition = (to) => {
    setIsTransitioning(true);
    setNextPage(to);
  };

  return (
    <PageTransitionContext.Provider value={{ isTransitioning, navigateWithTransition }}>
      {/* Apply the transition to the entire content */}
      <div 
        className={`transition-opacity ease-in-out`} 
        style={{ 
          opacity: isTransitioning ? 0 : 1, 
          transitionDuration: `${transitionDuration}ms` 
        }}
      >
        {children}
      </div>
      {/* White background that's always visible behind content */}
      <div className="fixed inset-0 bg-white -z-10"></div>
    </PageTransitionContext.Provider>
  );
};

// Custom link that uses our transition
const TransitionLink = ({ to, children, className }) => {
  const { navigateWithTransition } = React.useContext(PageTransitionContext);
  
  const handleClick = (e) => {
    e.preventDefault();
    navigateWithTransition(to);
  };
  
  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};

// Centralized layout wrapper
const LayoutWrapper = ({ children, isHomePage = false }) => (
  <div className={`min-h-screen flex flex-col font-['Courier_New',_monospace]`}>
    <div className="flex-grow">
      {children}
    </div>
    {!isHomePage && <Footer />}
  </div>
);

const Navigation = () => {
  const { navigateWithTransition } = React.useContext(PageTransitionContext);
  
  return (
    <div className="fixed top-0 left-0 w-full bg-transparent flex flex-col items-center py-4 z-40 font-['Courier_New',_monospace] text-gray-600">
      <a 
        href="/" 
        onClick={(e) => {
          e.preventDefault();
          navigateWithTransition('/');
        }}
        className="text-4xl font-light mb-2 select-none uppercase"
      >
        Studio Glazebrook
      </a>
      <nav className="flex justify-center w-full max-w-md text-lg font-light">
        <TransitionLink to="/furniture" className="hover:underline text-center">
          Furniture
        </TransitionLink>
      </nav>
    </div>
  );
};

const Footer = () => (
  <footer className="w-full py-12 px-8 text-center mt-16 font-['Courier_New',_monospace] text-gray-600">
    <p className="font-light">Contact: edvard@glazebrook.com | +47 123 45 678</p>
  </footer>
);

const Home = () => {
  const { navigateWithTransition } = React.useContext(PageTransitionContext);
  
  return (
    <LayoutWrapper isHomePage={true}>
      <div className="relative w-full h-screen">
        <img
          src={`${import.meta.env.BASE_URL}images/frontpage_images/all-1.JPEG`}
          alt="Industrial Furniture"
          className="w-full h-full object-cover"
        />
        
        <div className="absolute top-0 left-0 w-full pt-8">
          <div className="text-center">
            <a 
              href="/" 
              className="text-5xl font-light mb-6 block text-white uppercase font-['Courier_New',_monospace]"
            >
              Studio Glazebrook
            </a>
          </div>
          <div className="flex justify-center w-full mt-6">
            <a 
              href="/furniture"
              onClick={(e) => {
                e.preventDefault();
                navigateWithTransition('/furniture');
              }}
              className="hover:underline text-center text-white text-xl font-light font-['Courier_New',_monospace]"
            >
              Furniture
            </a>
          </div>
        </div>
        
        <footer className="absolute bottom-0 w-full text-white py-12 px-8 text-center font-['Courier_New',_monospace]">
          <p className="font-light">Contact: edvard@glazebrook.com | +47 123 45 678</p>
        </footer>
      </div>
    </LayoutWrapper>
  );
};

const FurniturePage = () => {
  return (
    <LayoutWrapper>
      <Navigation />
      <div className="flex justify-center pt-28">
        <div className="flex flex-col items-center gap-12 max-w-xl mx-auto pb-16">
          {furnitureList.map((item) => (
            <TransitionLink to={`/furniture/${item.id}`} key={item.id}>
              <div className="relative w-80 group mx-auto">
                <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-white/30 group-hover:opacity-0 transition-opacity duration-300"></div>
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="w-full h-auto object-cover"
                />
                <div className="mt-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h2 className="text-sm font-light text-gray-600">{item.name}</h2>
                </div>
              </div>
            </TransitionLink>
          ))}
        </div>
      </div>
    </LayoutWrapper>
  );
};

const FurnitureDetail = () => {
  const { id } = useParams();
  const item = furnitureList.find((f) => f.id === id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { navigateWithTransition } = React.useContext(PageTransitionContext);

  if (!item) return <div className="p-6 text-center font-light text-gray-600">Furniture not found</div>;

  const prevImage = () => {
    setCurrentIndex((i) => (i === 0 ? item.images.length - 1 : i - 1));
  };
  const nextImage = () => {
    setCurrentIndex((i) => (i === item.images.length - 1 ? 0 : i + 1));
  };

  return (
    <LayoutWrapper>
      <Navigation />
      <div className="max-w-3xl mx-auto w-full pt-28">
        <div className="relative">
          <img
            src={item.images[currentIndex]}
            alt={`${item.name} ${currentIndex + 1}`}
            className="w-full h-96 object-cover mb-4"
          />
          {item.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
                aria-label="Previous Image"
              >
                ‹
              </button>
              <button
                onClick={nextImage}
                className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
                aria-label="Next Image"
              >
                ›
              </button>
            </>
          )}
        </div>
        <h1 className="text-3xl font-light mb-2 text-gray-600">{item.name}</h1>
        <p className="mb-6 font-light text-gray-600">For inquiries about this piece, please click below:</p>
        <div className="flex justify-center w-full">
          <a
            href={`mailto:hannahjelmeland@gmail.com?subject=Request about ${item.name}`}
            className="inline-block bg-gray-400 text-white px-6 py-3 hover:bg-gray-700 transition font-light"
          >
            Request this furniture
          </a>
        </div>
      </div>
    </LayoutWrapper>
  );
};

// Main app with routing
const AppContent = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/furniture" element={<FurniturePage />} />
      <Route path="/furniture/:id" element={<FurnitureDetail />} />
    </Routes>
  );
};

export default function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AppWithTransition />
    </Router>
  );
}

// Wrapper component to get access to navigate
function AppWithTransition() {
  return (
    <PageTransitionProvider>
      <AppContent />
    </PageTransitionProvider>
  );
}