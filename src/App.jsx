import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link, useParams } from "react-router-dom";

const furnitureList = [
  {
    id: "table1",
    name: "Skarpt Bord",
    images: ["/images/table/table-1.png", "/images/table/table-2.png", "/images/table/table-3.png"],
  },
  {
    id: "chair1",
    name: "Skarp Stol",
    images: ["/images/chair/chair-1.png", "/images/chair/chair-2.png", "/images/chair/chair-3.png"],
  },
  {
    id: "shelf1",
    name: "Skarp Hylle",
    images: ["/images/shelf/shelf-1.png", "/images/shelf/shelf-2.png", "/images/shelf/shelf-3.png"],
  },
];

// Centralized layout wrapper with consistent cement-color background
const LayoutWrapper = ({ children }) => (
  <div className="min-h-screen bg-gray-300 flex flex-col">
    <div className="flex-grow">
      {children}
    </div>
    <Footer />
  </div>
);

const Navigation = () => (
  <div className="fixed top-0 left-0 w-full bg-transparent text-white font-sans flex flex-col items-center py-4 z-50">
    <h1 className="text-4xl font-light mb-2 select-none uppercase">Skarpe Møbler</h1>
    <nav className="flex gap-8 text-lg font-light">
      <Link to="/" className="hover:underline">
        Home
      </Link>
      <Link to="/furniture" className="hover:underline">
        Furniture
      </Link>
    </nav>
  </div>
);

const Footer = () => (
  <footer className="w-full bg-gray-600 text-white py-12 px-8 text-center mt-16">
    <p className="font-light">Contact us: hannahjelmeland@gmail.com | +47 123 45 678</p>
  </footer>
);

const Home = () => (
  <LayoutWrapper>
    <div className="flex flex-col items-center justify-center flex-grow pt-28">
      <img
        src="/images/hero-table.png"
        alt="Industrial Table"
        className="w-full max-w-4xl object-cover rounded-2xl shadow-lg"
      />
    </div>
  </LayoutWrapper>
);

const FurniturePage = () => (
  <LayoutWrapper>
    <div className="flex justify-center pt-28">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {furnitureList.map((item) => (
          <div
            key={item.id}
            className="hover:shadow-xl transition-all border cursor-pointer w-64 h-72 bg-white"
          >
            <Link to={`/furniture/${item.id}`}>
              <div className="h-48 overflow-hidden">
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-light text-center">{item.name}</h2>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  </LayoutWrapper>
);

const FurnitureDetail = () => {
  const { id } = useParams();
  const item = furnitureList.find((f) => f.id === id);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!item) return <div className="p-6 text-center font-light">Furniture not found</div>;

  const prevImage = () => {
    setCurrentIndex((i) => (i === 0 ? item.images.length - 1 : i - 1));
  };
  const nextImage = () => {
    setCurrentIndex((i) => (i === item.images.length - 1 ? 0 : i + 1));
  };

  return (
    <LayoutWrapper>
      <div className="max-w-3xl mx-auto w-full pt-28">
        <div className="relative">
          <img
            src={item.images[currentIndex]}
            alt={`${item.name} ${currentIndex + 1}`}
            className="w-full h-96 object-cover rounded-2xl mb-4"
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
        <h1 className="text-3xl font-light mb-2">{item.name}</h1>
        <p className="mb-6 font-light">For inquiries about this piece, please click below:</p>
        <div className="flex justify-center w-full">
          <a
            href={`mailto:hannahjelmeland@gmail.com?subject=Request about ${item.name}`}
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded hover:bg-gray-700 transition font-light"
          >
            Request this furniture
          </a>
        </div>
      </div>
    </LayoutWrapper>
  );
};

export default function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/furniture" element={<FurniturePage />} />
        <Route path="/furniture/:id" element={<FurnitureDetail />} />
      </Routes>
    </Router>
  );
}