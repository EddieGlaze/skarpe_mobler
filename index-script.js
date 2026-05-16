document.addEventListener('DOMContentLoaded', function() {
  const slideshow = document.getElementById('slideshow');
  if (!slideshow) return;

  // Kopier og bland tilfeldig
  const shuffled = products.slice().sort(function() {
    return 0.5 - Math.random();
  });

  shuffled.forEach(function(p, index) {
    const cover = p.coverImage
      ? 'images/' + p.id + '/' + p.coverImage
      : 'images/' + p.id + '/0.jpg';

    const slide = document.createElement('div');
    slide.className = index === 0 ? 'slide active' : 'slide';
    slide.style.backgroundImage = 'url(' + cover + ')';
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
