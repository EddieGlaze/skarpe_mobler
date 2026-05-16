document.addEventListener('DOMContentLoaded', function() {
  const slideshow = document.getElementById('slideshow');
  if (!slideshow) return;

  products.forEach(function(p, index) {
    const cover = p.coverImage
      ? 'images/' + p.id + '/' + p.coverImage
      : 'images/' + p.id + '/0.jpg';

    const slide = document.createElement('div');
    slide.className = index === 0 ? 'slide active' : 'slide';
    slide.style.backgroundImage = 'url(' + cover + ')';
    slide.style.backgroundSize = 'contain';
    slide.style.backgroundPosition = 'center';
    slide.style.backgroundRepeat = 'no-repeat';
    slideshow.appendChild(slide);
  });

  const slides = document.querySelectorAll('.slide');
  let current = 0;
  setInterval(function() {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, 5000);
});
