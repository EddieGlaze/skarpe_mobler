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

  var prevSvg = '<svg viewBox="0 0 6 6" fill="#111"><polygon points="6,0 6,6 0,3"/></svg>';
  var nextSvg = '<svg viewBox="0 0 6 6" fill="#111"><polygon points="0,0 0,6 6,3"/></svg>';

  page.innerHTML =
    '<div class="product-sidebar">' +
      '<div class="product-title" style="display:flex;align-items:center;gap:6px;">' +
        '<span class="product-nav-prev" id="proj-prev">' + prevSvg + '</span>' +
        '<span class="dot-' + (product.status || 'empty') + '"></span>' +
        product.number + ' ' + product.name +
        '<span class="product-nav-next" id="proj-next">' + nextSvg + '</span>' +
      '</div>' +
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

  // Prosjektnavigasjon inline
  document.getElementById('proj-prev').onclick = function() {
    window.location.href = 'product.html?id=' + products[prevIndex].id;
  };
  document.getElementById('proj-next').onclick = function() {
    window.location.href = 'product.html?id=' + products[nextIndex].id;
  };

  // Overlay-piler
  var overlayPrevBtn = document.createElement('div');
  overlayPrevBtn.className = 'overlay-project-prev';
  overlayPrevBtn.innerHTML = prevSvg;
  overlayPrevBtn.onclick = function(e) {
    e.stopPropagation();
    window.location.href = 'product.html?id=' + products[prevIndex].id;
  };
  document.body.appendChild(overlayPrevBtn);

  var overlayNextBtn = document.createElement('div');
  overlayNextBtn.className = 'overlay-project-next';
  overlayNextBtn.innerHTML = nextSvg;
  overlayNextBtn.onclick = function(e) {
    e.stopPropagation();
    window.location.href = 'product.html?id=' + products[nextIndex].id;
  };
  document.body.appendChild(overlayNextBtn);

  // Bildenavigasjon
  function getVisibleImages() {
    return Array.from(document.querySelectorAll('.product-thumb')).filter(function(img) {
      return img.style.display !== 'none' && img.complete && img.naturalWidth > 0;
    });
  }

  var overlayIndex = 0;

  function positionOverlayBtns() {
    var imgEl = document.getElementById('overlay-img');
    var rect = imgEl.getBoundingClientRect();
    var midY = (rect.top + rect.height / 2) + 'px';
    overlayPrevBtn.style.left = Math.max(8, rect.left - 28) + 'px';
    overlayPrevBtn.style.top = midY;
    overlayPrevBtn.style.transform = 'translateY(-50%)';
    overlayNextBtn.style.left = (rect.right + 8) + 'px';
    overlayNextBtn.style.top = midY;
    overlayNextBtn.style.transform = 'translateY(-50%)';
  }

  function openOverlay(index) {
    var visible = getVisibleImages();
    if (!visible.length) return;
    overlayIndex = index;
    var imgEl = document.getElementById('overlay-img');
    imgEl.src = visible[overlayIndex].src;
    document.getElementById('overlay').style.display = 'flex';
    imgEl.onload = positionOverlayBtns;
    setTimeout(positionOverlayBtns, 100);
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

  document.getElementById('overlay').addEventListener('click', function() {
    closeOverlay();
  });

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
