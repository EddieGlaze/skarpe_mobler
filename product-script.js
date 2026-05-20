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

  var currentIndex = products.findIndex(function(p) { return p.id === id; });
  var prevIndex = (currentIndex - 1 + products.length) % products.length;
  var nextIndex = (currentIndex + 1) % products.length;

  var prevSvg = '<svg viewBox="0 0 8 8" fill="#aaa"><polygon points="8,0 8,8 0,4"/></svg>';
  var nextSvg = '<svg viewBox="0 0 8 8" fill="#aaa"><polygon points="0,0 0,8 8,4"/></svg>';

  page.innerHTML =
    '<div class="product-sidebar">' +
      '<div class="product-title">' +
        product.number + ' ' + product.name +
        '<span class="dot-' + (product.status || 'empty') + '"></span>' +
      '</div>' +
     '<div class="product-meta">' +
        '<span class="product-nav-prev" id="proj-prev">' + prevSvg + '</span>' +
        '<span class="product-nav-gap"></span>' +
        '<span class="product-nav-next" id="proj-next">' + nextSvg + '</span>' +
        '<span class="product-year">' + product.year + '</span>' +
      '</div>' +
      '<div class="product-description"><p>' + product.description + '</p></div>' +
      priceHTML +
      '<button class="btn-inquiry" onclick="window.location.href=\'contact.html?inquiry=' + product.id + '\'">Forespørsel</button>' +
    '</div>' +
    '<div class="product-images">' + imagesHTML + '</div>' +
    '<div id="overlay">' +
      '<div id="overlay-info">' +
        '<span class="product-nav-prev" id="overlay-prev">' + prevSvg + '</span>' +
        '<span class="product-nav-gap"></span>' +
        '<span class="product-nav-next" id="overlay-next">' + nextSvg + '</span>' +
        '<span style="font-size:11px;letter-spacing:0.1em;color:#999;margin-left:16px;">' + product.number + ' ' + product.name + ' — ' + product.year + '</span>' +
      '</div>' +
      '<div id="overlay-img-wrapper">' +
        '<img id="overlay-img" src="">' +
        '<div id="overlay-left"></div>' +
        '<div id="overlay-right"></div>' +
      '</div>' +
    '</div>';

  document.getElementById('proj-prev').onclick = function() {
    window.location.href = 'product.html?id=' + products[prevIndex].id;
  };
  document.getElementById('proj-next').onclick = function() {
    window.location.href = 'product.html?id=' + products[nextIndex].id;
  };
  document.getElementById('overlay-prev').onclick = function(e) {
    e.stopPropagation();
    window.location.href = 'product.html?id=' + products[prevIndex].id;
  };
  document.getElementById('overlay-next').onclick = function(e) {
    e.stopPropagation();
    window.location.href = 'product.html?id=' + products[nextIndex].id;
  };

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
    img.addEventListener('click', function() { openOverlay(index); });
  });

  document.getElementById('overlay-left').addEventListener('click', function(e) {
    e.stopPropagation();
    prevImage();
  });
  document.getElementById('overlay-right').addEventListener('click', function(e) {
    e.stopPropagation();
    nextImage();
  });
  document.getElementById('overlay').addEventListener('click', function() {
    closeOverlay();
  });
  document.getElementById('overlay-img').addEventListener('click', function(e) {
    e.stopPropagation();
  });
  document.getElementById('overlay-info').addEventListener('click', function(e) {
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
