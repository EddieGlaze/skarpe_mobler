document.addEventListener('DOMContentLoaded', function() {
  const slideshow = document.getElementById('slideshow');
  if (!slideshow) return;

  const allSlides = [];
  products.forEach(function(p) {
    const slideImages = p.slides || ["0.jpg"];
    slideImages.forEach(function(img) {
      allSlides.push({
        id: p.id,
        src: 'images/' + p.id + '/' + img
      });
    });
  });

  // Enkel shuffle uten nabo-sjekk
  for (var i = allSlides.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = allSlides[i]; allSlides[i] = allSlides[j]; allSlides[j] = tmp;
  }

  allSlides.forEach(function(item, index) {
    var slide = document.createElement('div');
    slide.className = index === 0 ? 'slide active' : 'slide';
    slide.style.backgroundImage = 'url(' + item.src + ')';
    slideshow.appendChild(slide);
  });

  allSlides.forEach(function(item) {
    var img = new Image();
    img.src = item.src;
  });

  var slides = document.querySelectorAll('.slide');
  var current = 0;
  setInterval(function() {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, 5000);
});
