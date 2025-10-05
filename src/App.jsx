import React, { useState, useEffect, useRef, useCallback, useLayoutEffect, useMemo } from "react";
import { BrowserRouter as Router, Route, Routes, useParams, useNavigate, Navigate, useLocation } from "react-router-dom";

/**
 * DATA
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

/* -------------------- Page transition -------------------- */
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

/* -------------------- Route scroll reset -------------------- */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

/* -------------------- Helpers -------------------- */
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
    setIsTouch(mq.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);
  return isTouch;
};

/* -------------------- Client-side image optimizer -------------------- */
/**
 * Converts the original image to a downscaled WebP blob and caches it.
 * This reduces bytes transferred without you having to ship extra files.
 * Fallbacks to the original image if any step fails.
 */
async function optimizeImageToWebP(src, targetWidth) {
  try {
    if (!('caches' in window)) throw new Error('No CacheStorage');
    const cache = await caches.open('sg-img-opt-v1');
    const key = `${src}|w=${Math.round(targetWidth)}`;
    const cached = await cache.match(key);
    if (cached) {
      return await cached.blob();
    }

    // Fetch original (once), decode, downscale, re-encode.
    const resp = await fetch(src, { credentials: 'same-origin' });
    if (!resp.ok) throw new Error('Fetch failed');
    const originalBlob = await resp.blob();

    // Decode with createImageBitmap if available, else via HTMLImageElement
    let bitmap;
    if ('createImageBitmap' in window) {
      bitmap = await createImageBitmap(originalBlob);
    } else {
      const img = await new Promise((resolve, reject) => {
        const im = new Image();
        im.onload = () => resolve(im);
        im.onerror = reject;
        im.src = URL.createObjectURL(originalBlob);
      });
      // draw to canvas to get bitmap-like object
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const cx = c.getContext('2d');
      cx.drawImage(img, 0, 0);
      bitmap = { width: c.width, height: c.height, _img: img };
    }

    const scale = Math.min(1, targetWidth / (bitmap.width || bitmap._img.naturalWidth));
    const tw = Math.max(1, Math.round((bitmap.width || bitmap._img.naturalWidth) * scale));
    const th = Math.max(1, Math.round((bitmap.height || bitmap._img.naturalHeight) * scale));

    let outBlob;
    if (typeof OffscreenCanvas !== 'undefined') {
      const canvas = new OffscreenCanvas(tw, th);
      const ctx = canvas.getContext('2d', { alpha: false });
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      if (bitmap instanceof ImageBitmap) {
        ctx.drawImage(bitmap, 0, 0, tw, th);
      } else {
        ctx.drawImage(bitmap._img, 0, 0, tw, th);
      }
      if (canvas.convertToBlob) {
        outBlob = await canvas.convertToBlob({ type: 'image/webp', quality: 0.82 });
      } else {
        // Safari fallback
        const c = document.createElement('canvas');
        c.width = tw; c.height = th;
        const cx = c.getContext('2d');
        cx.imageSmoothingEnabled = true;
        cx.imageSmoothingQuality = 'high';
        if (bitmap instanceof ImageBitmap) cx.drawImage(bitmap, 0, 0, tw, th);
        else cx.drawImage(bitmap._img, 0, 0, tw, th);
        outBlob = await new Promise(res => c.toBlob(res, 'image/webp', 0.82));
      }
    } else {
      const c = document.createElement('canvas');
      c.width = tw; c.height = th;
      const cx = c.getContext('2d');
      cx.imageSmoothingEnabled = true;
      cx.imageSmoothingQuality = 'high';
      if (bitmap instanceof ImageBitmap) cx.drawImage(bitmap, 0, 0, tw, th);
      else cx.drawImage(bitmap._img, 0, 0, tw, th);
      outBlob = await new Promise(res => c.toBlob(res, 'image/webp', 0.82));
    }

    if (!outBlob) throw new Error('Encoding failed');
    await cache.put(key, new Response(outBlob));
    return outBlob;
  } catch (e) {
    // On any failure, return null to signal fallback to original.
    return null;
  }
}

/**
 * SmartImg
 * - Waits until visible (unless priority) to start optimizing.
 * - Downscales to containerWidth * DPR (capped).
 * - Uses cached WebP if available; otherwise falls back to original.
 */
function SmartImg({
  src,
  alt,
  className = "",
  priority = false,
  capWidth = 1600,      // upper bound in CSS pixels × DPR
  wrapperRef,           // optional external ref to measure width
}) {
  const imgRef = useRef(null);
  const [currentSrc, setCurrentSrc] = useState("");   // object URL or original
  const objectUrlRef = useRef(null);

  // Measure container width
  const getContainerWidth = useCallback(() => {
    const el = (wrapperRef?.current) || imgRef.current?.parentElement || imgRef.current;
    return el ? el.clientWidth : 800;
  }, [wrapperRef]);

  // Start optimization when visible (or immediately if priority)
  useEffect(() => {
    let io;
    let cancelled = false;

    const start = async () => {
      const dpr = Math.min(3, window.devicePixelRatio || 1);
      const targetW = Math.min(capWidth, Math.ceil(getContainerWidth() * dpr));

      const blob = await optimizeImageToWebP(src, targetW);
      if (cancelled) return;

      if (blob) {
        // Use optimized object URL (and revoke previous)
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        setCurrentSrc(url);
      } else {
        // Fallback to original
        setCurrentSrc(src);
      }
    };

    if (priority) {
      start();
    } else if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            io.disconnect();
            start();
          }
        });
      }, { rootMargin: "200px" });
      if (imgRef.current) io.observe(imgRef.current);
    } else {
      // Older browsers
      start();
    }

    return () => {
      cancelled = true;
      io?.disconnect();
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [src, priority, capWidth, getContainerWidth]);

  return (
    <img
      ref={imgRef}
      src={currentSrc || undefined}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

/* -------------------- Layout & Navigation -------------------- */
const LayoutWrapper = ({ children, isHomePage = false }) => (
  <div className={`min-h-screen flex flex-col font-['Courier_New',_monospace] text-left items-start w-full overflow-x-hidden ${isHomePage ? "" : "px-4 sm:px-6 md:px-8"}`}>
    <div className="flex-grow w-full">{children}</div>
    {!isHomePage && <Footer />}
  </div>
);

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

/* -------------------- Home -------------------- */
const Home = () => {
  const { navigateWithTransition } = React.useContext(PageTransitionContext);
  const wrapperRef = useRef(null);
  return (
    <LayoutWrapper isHomePage={true}>
      <div ref={wrapperRef} className="relative w-full h-screen">
        <SmartImg
          src={`${import.meta.env.BASE_URL}images/frontpage_images/all-1.JPEG`}
          alt="Industrial Furniture"
          className="w-full h-full object-cover block"
          priority
          capWidth={2200}
          wrapperRef={wrapperRef}
        />
        <div className="absolute top-0 left-0 w-full pt-4 sm:pt-8 px-4 sm:px-6 md:px-8 text-left">
          <a href="/" className="block text-3xl sm:text-4xl md:text-5xl font-light mb-1 text-white uppercase font-['Courier_New',_monospace]">Studio Glazebrook</a>
          <span className="text-xs sm:text-sm font-light text-white">Contact: edvard@glazebrook.com | +47 123 45 678</span>
          <div className="mt-4 sm:mt-6 flex gap-4 sm:gap-6">
            <a href="/" onClick={(e) => { e.preventDefault(); navigateWithTransition('/'); }} className="hover:underline text-white text-base sm:text-xl font-light">Hjem</a>
            <a href="/furniture" onClick={(e) => { e.preventDefault(); navigateWithTransition('/furniture'); }} className="hover:underline text-white text-base sm:text-xl font-light">Møbler</a>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
};

/* -------------------- Furniture Index -------------------- */
// Mobile: no overlay/fade. Desktop: overlay fades only on hover.

const GalleryTile = React.memo(function GalleryTile({ src, label }) {
  const isTouch = useIsTouch();
  const wrap = useRef(null);
  return (
    <div ref={wrap} className="relative w-72 sm:w-80 mx-auto group">
      {!isTouch && (
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 to-white/20 opacity-100 transition-opacity duration-200 group-hover:opacity-0" />
      )}
      <SmartImg
        src={src}
        alt={label}
        className="w-full h-auto object-cover block mx-auto"
        capWidth={700}
        wrapperRef={wrap}
      />
      <div className={`mt-2 text-left ${isTouch ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity duration-200'}`}>
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

/* -------------------- Carousel & Lightbox -------------------- */
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
    if (Math.abs(dy) > Math.abs(dx) * 1.2) tracking.current = false; // let vertical scroll pass
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

const Lightbox = ({ images, startIndex, onClose, name }) => {
  const [idx, setIdx] = useState(startIndex || 0);
  const go = useCallback((n) => setIdx((cur) => (cur + n + images.length) % images.length), [images.length]);
  const close = useCallback(() => onClose?.(), [onClose]);

  // lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [close, go]);

  // swipe down to close (mobile)
  const startY = useRef(0), tracking = useRef(false);
  const onTouchStart = (e) => {
    if (e.touches?.length !== 1) return;
    tracking.current = true;
    startY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e) => {
    if (!tracking.current) return;
    tracking.current = false;
    const dy = (e.changedTouches?.[0]?.clientY ?? 0) - startY.current;
    if (dy > 60) close();
  };

  const stageRef = useRef(null);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 text-white flex flex-col"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="dialog"
      aria-modal="true"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="text-sm">{idx + 1} / {images.length}</div>
        <button
          onClick={close}
          aria-label="Lukk"
          className="text-white border border-white/60 px-3 py-1"
        >×</button>
      </div>

      {/* Stage */}
      <div ref={stageRef} className="flex-1 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <SmartImg
            src={images[idx]}
            alt={`${name} – bilde ${idx + 1}`}
            className="max-w-[100vw] max-h-[80vh] object-contain block"
            priority
            capWidth={2400}
            wrapperRef={stageRef}
          />
        </div>

        {/* Arrows */}
        <button
          type="button"
          aria-label="Forrige"
          onClick={() => go(-1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black w-8 h-8 flex items-center justify-center border border-white/60"
        >‹</button>
        <button
          type="button"
          aria-label="Neste"
          onClick={() => go(1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black w-8 h-8 flex items-center justify-center border border-white/60"
        >›</button>
      </div>
    </div>
  );
};

const Carousel = ({ images, name, onOpenLightbox }) => {
  const [idx, setIdx] = useState(0);
  const total = images.length;

  const go = useCallback((n) => setIdx((cur) => (cur + n + total) % total), [total]);
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

  // Thumbnails auto-follow
  const thumbRefs = useRef([]);
  useEffect(() => {
    const el = thumbRefs.current[idx];
    if (el?.scrollIntoView) {
      el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [idx]);

  // Wrapper for measuring SmartImg capWidth target
  const stageWrap = useRef(null);

  return (
    <div ref={wrapRef} tabIndex={0} className="w-full max-w-3xl mx-auto outline-none select-none">
      {/* Stage */}
      <div
        ref={stageWrap}
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
              <SmartImg
                src={src}
                alt={`${name} – bilde ${i + 1}`}
                className="max-w-full max-h-full object-contain block cursor-zoom-in"
                priority={i === idx}
                capWidth={1800}
                wrapperRef={stageWrap}
              />
              {/* Click catcher for full-screen */}
              <button
                type="button"
                onClick={() => onOpenLightbox?.(i)}
                aria-label="Åpne i fullskjerm"
                className="absolute inset-0"
              />
            </div>
          ))}
        </div>

        {/* Arrows: smaller, rectangular */}
        <button
          type="button"
          aria-label="Forrige"
          onClick={() => go(-1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-gray-900 w-8 h-8 flex items-center justify-center border border-gray-300 text-base"
        >‹</button>
        <button
          type="button"
          aria-label="Neste"
          onClick={() => go(1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-gray-900 w-8 h-8 flex items-center justify-center border border-gray-300 text-base"
        >›</button>
      </div>

      {/* Thumbnails */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {images.map((src, i) => (
          <button
            type="button"
            key={i}
            ref={(el) => (thumbRefs.current[i] = el)}
            aria-label={`Bilde ${i + 1}`}
            onClick={() => goTo(i)}
            className={`shrink-0 border ${i === idx ? 'border-gray-900' : 'border-gray-300'} p-0.5`}
            title={`${name} – bilde ${i + 1}`}
          >
            <SmartImg
              src={src}
              alt=""
              className="block h-16 w-24 object-cover"
              capWidth={320}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

/* -------------------- Furniture Detail -------------------- */
const FurnitureDetail = () => {
  const { id } = useParams();
  const item = furnitureList.find((f) => f.id === id);
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });

  if (!item) return <div className="p-6 text-left font-light text-gray-600">Furniture not found</div>;

  return (
    <LayoutWrapper>
      <Navigation glass glassActive />
      <div className="mx-auto w-full pt-28 px-4 sm:px-6 md:px-8 max-w-3xl">
        <div className="flex flex-col items-center">
          <Carousel
            images={item.images}
            name={item.name}
            onOpenLightbox={(i) => setLightbox({ open: true, index: i })}
          />

          <h1 className="text-2xl sm:text-3xl font-light mt-6 mb-2 text-gray-600 text-left w-full">{item.name}</h1>

          {/* Vis interesse button only */}
          <a
            href={`mailto:hannahjelmeland@gmail.com?subject=Interesse for ${encodeURIComponent(item.name)}`}
            className="self-start inline-block bg-gray-700 text-white px-5 py-3 hover:bg-gray-800 transition font-light text-sm sm:text-base"
          >
            Vis interesse
          </a>

          {/* Produktdetaljer (blend-in, caret rotates) */}
          <details className="w-full mt-4 group">
            <summary className="cursor-pointer select-none text-gray-800 flex items-center gap-2 px-0 py-2">
              <span className="inline-block w-3 transform transition-transform duration-200 group-open:rotate-90">›</span>
              <span className="underline-offset-2 hover:underline">Produktdetaljer</span>
            </summary>
            <div className="pl-5 pt-1 pb-2 text-sm text-gray-700 space-y-3">
              <p className="text-gray-700">
                Estimert leveringstid: 4–6 uker. Pris på forespørsel.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Dimensjoner: Dybde x cm, Bredde x cm, Høyde x cm</li>
                <li>Materiale: Massivt tre / Stål / Annet</li>
                <li>Finish: Oljet / Lakkert / Naturlig</li>
                <li>Tilpasning: Mulig på forespørsel (mål, finish)</li>
                <li>Vedlikehold: Tørk av med fuktig klut</li>
              </ul>
            </div>
          </details>
        </div>
      </div>

      {lightbox.open && (
        <Lightbox
          images={item.images}
          startIndex={lightbox.index}
          onClose={() => setLightbox({ open: false, index: 0 })}
          name={item.name}
        />
      )}
    </LayoutWrapper>
  );
};

/* -------------------- Routes -------------------- */
const AppContent = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/furniture" element={<FurnitureIndexPage />} />
    <Route path="/furniture/:id" element={<FurnitureDetail />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

/* -------------------- App -------------------- */
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
      <ScrollToTop />
      <AppContent />
    </PageTransitionProvider>
  );
}
