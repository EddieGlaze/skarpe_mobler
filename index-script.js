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

  function shuffleNoAdjacent(arr) {
    // Bland tilfeldig
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    // Én gjennomgang — flytt naboer
    for (var i = 0; i < arr.length - 1; i++) {
      if (arr[i].id === arr[i + 1].id) {
        var target = (i + 2) % arr.length;
        var moved = arr.splice(i + 1, 1)[0];
        arr.splice(target, 0, moved);
      }
    }
    return arr;
  }

  var ordered = shuffleNoAdjacent(allSlides);

  ordered.forEach(function(item, index) {
    var img = new Image();
    img.src = item.src;

    var slide = document.createElement('div');
    slide.className = index === 0 ? 'slide active' : 'slide';
    slide.style.backgroundImage = 'url(' + item.src + ')';
    slideshow.appendChild(slide);
  });

  var slides = document.querySelectorAll('.slide');
  var current = 0;
  setInterval(function() {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, 8000);
});
