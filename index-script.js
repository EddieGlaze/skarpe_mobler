document.addEventListener('DOMContentLoaded', function() {
  const slideshow = document.getElementById('slideshow');
  if (!slideshow) return;

  // Bygg liste over alle slides fra products
  const allSlides = [];
  products.forEach(function(p) {
    const slideImages = p.slides || ["0.jpg"];
    slideImages.forEach(function(img) {
      allSlides.push('images/' + p.id + '/' + img);
    });
  });

  // Enkel shuffle
  for (var i = allSlides.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = allSlides[i]; allSlides[i] = allSlides[j]; allSlides[j] = tmp;
  }

  // Forhåndslast og lag slides
  allSlides.forEach(function(src, index) {
    var img = new Image();
    img.src = src;

    var slide = document.createElement('div');
    slide.className = index === 0 ? 'slide active' : 'slide';
    slide.style.backgroundImage = 'url(' + src + ')';
    slideshow.appendChild(slide);
  });

  // Bytt slide hvert 8. sekund
  var slides = document.querySelectorAll('.slide');
  var current = 0;
  setInterval(function() {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, 5000);
});
