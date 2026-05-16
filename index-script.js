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
  var current = 0;
  var currentSlide = null;

  function showNext() {
    var item = ordered[current];
    var img = new Image();

    img.onload = function() {
      // Bildet er lastet — fade ut gammelt
      if (currentSlide) {
        currentSlide.style.opacity = '0';
        setTimeout(function() {
          if (currentSlide) currentSlide.remove();
        }, 1400);
      }

      // Lag nytt slide og fade inn
      var slide = document.createElement('div');
      slide.className = 'slide';
      slide.style.backgroundImage = 'url(' + item.src + ')';
      slideshow.appendChild(slide);

      // Liten forsinkelse for å trigge CSS-transition
      setTimeout(function() {
        slide.classList.add('active');
      }, 20);

      currentSlide = slide;
      current = (current + 1) % ordered.length;
    };

    img.src = item.src;
  }

  // Start
  showNext();
  setInterval(showNext, 5000);
});
