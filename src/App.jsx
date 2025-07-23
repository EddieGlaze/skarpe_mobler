import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useParams, useNavigate } from "react-router-dom";

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

const projectsList = [
  {
    id: "project1",
    name: "Campus Remarkable",
    images: [
      `${import.meta.env.BASE_URL}images/projects/remarkable/remarkable-1.jpg`,
      `${import.meta.env.BASE_URL}images/projects/remarkable/remarkable-2.png`,
      `${import.meta.env.BASE_URL}images/projects/remarkable/remarkable-3.png`,
    ],
  },
  {
    id: "project2",
    name: "Filipstad Brygge 1",
    images: [
      `${import.meta.env.BASE_URL}images/projects/filipstad/filipstad-1.png`,
      `${import.meta.env.BASE_URL}images/projects/filipstad/filipstad-2.png`,
      `${import.meta.env.BASE_URL}images/projects/filipstad/filipstad-3.png`,
    ],
  },
];

const drawingsList = [
  {
    id: "drawing1",
    name: "Blomst",
    images: [
      `${import.meta.env.BASE_URL}images/drawings/blomst/blomst-1.jpg`,
      `${import.meta.env.BASE_URL}images/drawings/blomst/blomst-2.jpg`,
    ],
  },
  {
    id: "drawing2",
    name: "Kvinne",
    images: [
      `${import.meta.env.BASE_URL}images/drawings/kvinne/kvinne-1.jpg`,
      `${import.meta.env.BASE_URL}images/drawings/kvinne/kvinne-2.jpg`,
    ],
  },
  {
    id: "drawing2",
    name: "Uteplass",
    images: [
      `${import.meta.env.BASE_URL}images/drawings/uteplass/uteplass-1.jpg`,
      `${import.meta.env.BASE_URL}images/drawings/uteplass/uteplass-2.jpg`,
      `${import.meta.env.BASE_URL}images/drawings/uteplass/uteplass-3.jpg`,
    ],
  },
];

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
      <div className={`transition-opacity ease-in-out`} style={{ opacity: isTransitioning ? 0 : 1, transitionDuration: `${transitionDuration}ms` }}>
        {children}
      </div>
      
    </PageTransitionContext.Provider>
  );
};

const TransitionLink = ({ to, children, className }) => {
  const { navigateWithTransition } = React.useContext(PageTransitionContext);

  return (
    <a href={to} onClick={(e) => { e.preventDefault(); navigateWithTransition(to); }} className={className}>
      {children}
    </a>
  );
};

const LayoutWrapper = ({ children, isHomePage = false }) => (
  <div className={`min-h-screen flex flex-col font-['Courier_New',_monospace] text-left items-start pl-8`}>
    <div className="flex-grow w-full">
      {children}
    </div>
    {!isHomePage && <Footer />}
  </div>
);

const Navigation = () => {
  const { navigateWithTransition } = React.useContext(PageTransitionContext);
  return (
    <div className="fixed top-0 left-0 w-full bg-transparent flex flex-col items-start py-4 z-40 font-['Courier_New',_monospace] text-gray-600 pl-8">
      <a href="/" onClick={(e) => { e.preventDefault(); navigateWithTransition('/'); }} className="text-4xl font-light mb-1 select-none uppercase">
        Studio Glazebrook
      </a>
      <span className="text-sm font-light">Contact: edvard@glazebrook.com | +47 123 45 678</span>
      <nav className="flex justify-start w-full max-w-md text-lg font-light mt-2 space-x-6">
        <TransitionLink to="/furniture" className="hover:underline text-left">
          Furniture
        </TransitionLink>
        <TransitionLink to="/projects" className="hover:underline text-left">
          Projects
        </TransitionLink>
        <TransitionLink to="/drawings" className="hover:underline text-left">
          Drawings
        </TransitionLink>
      </nav>
    </div>
  );
};

const Footer = () => (
  <footer className="w-full py-12 px-8 text-left mt-16 font-['Courier_New',_monospace] text-gray-600">
    {/* Contact line removed */}
  </footer>
);

const Home = () => {
  const { navigateWithTransition } = React.useContext(PageTransitionContext);
  return (
    <LayoutWrapper isHomePage={true}>
      <div className="relative w-full h-screen">
        <img src={`${import.meta.env.BASE_URL}images/frontpage_images/all-1.JPEG`} alt="Industrial Furniture" className="w-full h-full object-cover" />
        <div className="absolute top-0 left-0 w-full pt-8 pl-8 text-left">
          <a href="/" className="text-5xl font-light mb-1 block text-white uppercase font-['Courier_New',_monospace]">Studio Glazebrook</a>
          <span className="text-sm font-light text-white">Contact: edvard@glazebrook.com | +47 123 45 678</span>
          <div className="mt-6 flex space-x-6">
            <a href="/furniture" onClick={(e) => { e.preventDefault(); navigateWithTransition('/furniture'); }} className="hover:underline text-white text-xl font-light">
              Furniture
            </a>
            <a href="/projects" onClick={(e) => { e.preventDefault(); navigateWithTransition('/projects'); }} className="hover:underline text-white text-xl font-light">
              Projects
            </a>
            <a href="/drawings" onClick={(e) => { e.preventDefault(); navigateWithTransition('/drawings'); }} className="hover:underline text-white text-xl font-light">
              Drawings
            </a>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
};

const FurniturePage = () => (
  <LayoutWrapper>
    <Navigation />
    <div className="flex justify-center pt-28">
      <div className="flex flex-col items-center gap-12 max-w-xl pb-16">
        {furnitureList.map((item) => (
          <TransitionLink to={`/furniture/${item.id}`} key={item.id}>
            <div className="relative w-80 group">
              <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-white/30 group-hover:opacity-0 transition-opacity duration-300"></div>
              <img src={item.images[0]} alt={item.name} className="w-full h-auto object-cover" />
              <div className="mt-2 text-left opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h2 className="text-sm font-light text-gray-600">{item.name}</h2>
              </div>
            </div>
          </TransitionLink>
        ))}
      </div>
    </div>
  </LayoutWrapper>
);

const FurnitureDetail = () => {
  const { id } = useParams();
  const item = furnitureList.find((f) => f.id === id);
  const { navigateWithTransition } = React.useContext(PageTransitionContext);

  if (!item) return <div className="p-6 text-left font-light text-gray-600">Furniture not found</div>;

  return (
    <LayoutWrapper>
      <Navigation />
      <div className="max-w-3xl mx-auto w-full pt-28">
        <div className="flex flex-col items-center">
          {item.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${item.name} ${idx + 1}`}
              className="mb-8"
              style={{ width: '50vw', margin: '0 auto' }}
            />
          ))}
          <h1 className="text-3xl font-light mb-2 text-gray-600 text-left w-full">{item.name}</h1>
          <p className="mb-6 font-light text-gray-600 text-left w-full">For inquiries about this piece, please click below:</p>
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

const ProjectsPage = () => (
  <LayoutWrapper>
    <Navigation />
    <div className="flex justify-center pt-28">
      <div className="flex flex-col items-center gap-12 max-w-xl pb-16">
        {projectsList.map((item) => (
          <TransitionLink to={`/projects/${item.id}`} key={item.id}>
            <div className="relative w-80 group">
              <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-white/30 group-hover:opacity-0 transition-opacity duration-300"></div>
              <img src={item.images[0]} alt={item.name} className="w-full h-auto object-cover" />
              <div className="mt-2 text-left opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h2 className="text-sm font-light text-gray-600">{item.name}</h2>
              </div>
            </div>
          </TransitionLink>
        ))}
      </div>
    </div>
  </LayoutWrapper>
);

const ProjectDetail = () => {
  const { id } = useParams();
  const item = projectsList.find((p) => p.id === id);

  if (!item) return <div className="p-6 text-left font-light text-gray-600">Project not found</div>;
  
  return (
    <LayoutWrapper>
      <Navigation />
      <div className="max-w-3xl mx-auto w-full pt-28">
        <div className="flex flex-col items-center">
          {item.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${item.name} ${idx + 1}`}
              className="mb-8"
              style={{ width: '50vw', margin: '0 auto' }}
            />
          ))}
          <h1 className="text-3xl font-light mb-2 text-gray-600 text-left w-full">{item.name}</h1>
          <p className="mb-6 font-light text-gray-600 text-left w-full">For inquiries about this project, please click below:</p>
          <a
            href={`mailto:edvard@glazebrook.com?subject=Request about ${item.name}`}
            className="inline-block bg-gray-400 text-white px-6 py-3 hover:bg-gray-700 transition font-light"
          >
            Request more information
          </a>
        </div>
      </div>
    </LayoutWrapper>
  );
};

const DrawingsPage = () => (
  <LayoutWrapper>
    <Navigation />
    <div className="flex justify-center pt-28">
      <div className="flex flex-col items-center gap-12 max-w-xl pb-16">
        {drawingsList.map((item) => (
          <TransitionLink to={`/drawings/${item.id}`} key={item.id}>
            <div className="relative w-80 group">
              <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-white/30 group-hover:opacity-0 transition-opacity duration-300"></div>
              <img src={item.images[0]} alt={item.name} className="w-full h-auto object-cover" />
              <div className="mt-2 text-left opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h2 className="text-sm font-light text-gray-600">{item.name}</h2>
              </div>
            </div>
          </TransitionLink>
        ))}
      </div>
    </div>
  </LayoutWrapper>
);

const DrawingDetail = () => {
  const { id } = useParams();
  const item = drawingsList.find((d) => d.id === id);

  if (!item) return <div className="p-6 text-left font-light text-gray-600">Drawing not found</div>;
  
  return (
    <LayoutWrapper>
      <Navigation />
      <div className="max-w-3xl mx-auto w-full pt-28">
        <div className="flex flex-col items-center">
          {item.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${item.name} ${idx + 1}`}
              className="mb-8"
              style={{ width: '50vw', margin: '0 auto' }}
            />
          ))}
          <h1 className="text-3xl font-light mb-2 text-gray-600 text-left w-full">{item.name}</h1>
          <p className="mb-6 font-light text-gray-600 text-left w-full">For inquiries about this drawing, please click below:</p>
          <a
            href={`mailto:edvard@glazebrook.com?subject=Request about ${item.name}`}
            className="inline-block bg-gray-400 text-white px-6 py-3 hover:bg-gray-700 transition font-light"
          >
            Request more information
          </a>
        </div>
      </div>
    </LayoutWrapper>
  );
};

const AppContent = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/furniture" element={<FurniturePage />} />
    <Route path="/furniture/:id" element={<FurnitureDetail />} />
    <Route path="/projects" element={<ProjectsPage />} />
    <Route path="/projects/:id" element={<ProjectDetail />} />
    <Route path="/drawings" element={<DrawingsPage />} />
    <Route path="/drawings/:id" element={<DrawingDetail />} />
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