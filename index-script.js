document.addEventListener('DOMContentLoaded', function() {
  const slideshow = document.getElementById('slideshow');
  if (!slideshow) return;

  // Bygg og bland bildelist
  const slides = [];
  products.forEach(function(p) {
    (p.slides || ["0.jpg"]).forEach(function(img) {
      slides.push('images/' + p.id + '/' + img);
    });
  });
  slides.sort(function() { return Math.random() - 0.5; });

  // Lag slides
  slides.forEach(function(src, i) {
    var el = document.createElement('div');
    el.className = i === 0 ? 'slide active' : 'slide';
    el.style.backgroundImage = 'url(' + src + ')';
    slideshow.appendChild(el);
  });

  // Bytt hvert 5. sekund
  var all = document.querySelectorAll('.slide');
  var cur = 0;
  setInterval(function() {
    all[cur].classList.remove('active');
    cur = (cur + 1) % all.length;
    all[cur].classList.add('active');
  }, 5000);
});
