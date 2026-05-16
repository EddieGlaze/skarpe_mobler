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

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  function shuffleNoAdjacentDuplicates(arr) {
    var shuffled = shuffle(arr.slice());
    var maxAttempts = 100;
    var attempts = 0;
    while (attempts < maxAttempts) {
      var hasDuplicate = false;
      for (var i = 0; i < shuffled.length - 1; i++) {
        if (shuffled[i].id === shuffled[i + 1].id) {
          hasDuplicate = true;
          break;
        }
      }
      if (!hasDuplicate) break;
      shuffled = shuffle(shuffled.slice());
      attempts++;
    }
    return shuffled;
  }

  var ordered = shuffleNoAdjacentDuplicates(allSlides);

  // Lag alle slides først
  ordered.forEach(function(item, index) {
    var slide = document.createElement('div');
    slide.className = index === 0 ? 'slide active' : 'slide';
    slide.style.backgroundImage = 'url(' + item.src + ')';
    slideshow.appendChild(slide);
  });

  // Forhåndslast alle bilder stille i bakgrunnen
  ordered.forEach(function(item) {
    var img = new Image();
    img.src = item.src;
  });

  // Bytt slide hvert 5. sekund
  var slides = document.querySelectorAll('.slide');
  var current = 0;
  setInterval(function() {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, 8000);
});
