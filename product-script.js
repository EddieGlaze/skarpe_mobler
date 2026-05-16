document.addEventListener('DOMContentLoaded', function() {
  const id = new URLSearchParams(window.location.search).get('id');
  const product = products.find(function(p) { return p.id === id; });
  const page = document.getElementById('product-page');

  if (!product) {
    page.innerHTML = '<p style="padding:120px 48px">Produkt ikke funnet.</p>';
    return;
  }

  document.title = product.name + ' — Studio Glazebrook';

  const priceHTML = product.price
    ? '<div class="product-price">NOK ' + product.price.toLocaleString('no-NO') + '</div>'
    : '';

  var validSrcs = [];
  for (var i = 0; i <= 20; i++) {
    validSrcs.push('images/' + product.id + '/' + i + '.jpg');
  }

  var imagesHTML = '';
  validSrcs.forEach(function(src, index) {
    imagesHTML += '<img src="' + src + '" alt="' + product.name + '" ' +
      'class="product-thumb" data-index="' + index + '" ' +
      'onerror="this.style.display=\'none\'">';
  });

  page.innerHTML =
    '<div class="product-sidebar">' +
      '<div class="product-title">' + product.number + ' ' + product.name + '</div>' +
      '<div class="product-meta">' + product.year + '</div>' +
      '<div class="product-description"><p>' + product.description + '</p></div>' +
      priceHTML +
      '<button class="btn-inquiry" onclick="window.location.href=\'contact.html?inquiry=' + product.id + '\'">Forespørsel</button>' +
    '</div>' +
    '<div class="product-images">' + imagesHTML + '</div>' +
    '<div id="overlay">' +
      '<div id="overlay-img-wrapper">' +
        '<img id="overlay-img" src="">' +
        '<div id="overlay-left"></div>' +
        '<div id="overlay-right"></div>' +
      '</div>' +
    '</div>';

  function getVisibleImages() {
    return Array.from(document.querySelectorAll('.product-thumb')).filter(function(img) {
      return img.style.display !== 'none' && img.complete && img.naturalWidth > 0;
    });
  }

  var overlayIndex = 0;

  function openOverlay(index) {
    var visible = getVisibleImages();
    if (!visible.length) return;
    overlayIndex = index;
    document.getElementById('overlay-img').src = visible[overlayIndex].src;
    document.getElementById('overlay').style.display = 'flex';
  }

  function closeOverlay() {
    document.getElementById('overlay').style.display = 'none';
  }

  function nextImage() {
    var visible = getVisibleImages();
    overlayIndex = (overlayIndex + 1) % visible.length;
    document.getElementById('overlay-img').src = visible[overlayIndex].src;
  }

  function prevImage() {
    var visible = getVisibleImages();
    overlayIndex = (overlayIndex - 1 + visible.length) % visible.length;
    document.getElementById('overlay-img').src = visible[overlayIndex].src;
  }

  document.querySelectorAll('.product-thumb').forEach(function(img, index) {
    img.addEventListener('click', function() {
      openOverlay(index);
    });
  });

  document.getElementById('overlay-left').addEventListener('click', function(e) {
    e.stopPropagation();
    prevImage();
  });

  document.getElementById('overlay-right').addEventListener('click', function(e) {
    e.stopPropagation();
    nextImage();
  });

  // Klikk på hvitt utenfor bildet lukker
  document.getElementById('overlay').addEventListener('click', function() {
    closeOverlay();
  });

  // Klikk på wrapper stopper ikke — bare bildet stopper
  document.getElementById('overlay-img').addEventListener('click', function(e) {
    e.stopPropagation();
  });

  document.addEventListener('keydown', function(e) {
    var overlay = document.getElementById('overlay');
    if (overlay.style.display !== 'flex') return;
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') closeOverlay();
  });
});
