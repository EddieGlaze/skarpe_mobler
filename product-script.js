document.addEventListener('DOMContentLoaded', function() {
  var page = document.getElementById('product-page');
  var overlayIndex = 0;

  var prevSvg = '<svg viewBox="0 0 8 8" fill="#aaa"><polygon points="8,0 8,8 0,4"/></svg>';
  var nextSvg = '<svg viewBox="0 0 8 8" fill="#aaa"><polygon points="0,0 0,8 8,4"/></svg>';

  function getVisibleImages() {
    return Array.from(document.querySelectorAll('.product-thumb')).filter(function(img) {
      return img.style.display !== 'none' && img.complete && img.naturalWidth > 0;
    });
  }

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

  function bindImageClicks() {
    document.querySelectorAll('.product-thumb').forEach(function(img, index) {
      img.addEventListener('click', function() { openOverlay(index); });
    });
  }

  function loadProduct(product) {
    var idx = products.findIndex(function(p) { return p.id === product.id; });
    var prevIdx = (idx - 1 + products.length) % products.length;
    var nextIdx = (idx + 1) % products.length;
    var prevProduct = products[prevIdx];
    var nextProduct = products[nextIdx];

    document.title = product.name + ' — Studio Glazebrook';
    history.pushState(null, '', '?id=' + product.id);

    var priceHTML = product.price
      ? '<div class="product-price">NOK ' + product.price.toLocaleString('no-NO') + '</div>'
      : '';

    // Oppdater sidebar
    document.querySelector('.product-sidebar').innerHTML =
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
      '<button class="btn-inquiry" onclick="window.location.href=\'/kontakt/?inquiry=' + product.id + '\'">Forespørsel</button>';

    // Oppdater bildeliste
    var imagesHTML = '';
    for (var i = 0; i <= 20; i++) {
      imagesHTML += '<img src="images/' + product.id + '/' + i + '.jpg" alt="' + product.name + '" ' +
        'class="product-thumb" data-index="' + i + '" onerror="this.style.display=\'none\'">';
    }
    document.querySelector('.product-images').innerHTML = imagesHTML;
    bindImageClicks();

    // Oppdater overlay-info
    document.getElementById('overlay-info').innerHTML =
      '<span class="product-nav-prev" id="overlay-prev">' + prevSvg + '</span>' +
      '<span class="product-nav-gap"></span>' +
      '<span class="product-nav-next" id="overlay-next">' + nextSvg + '</span>' +
      '<span style="font-size:11px;letter-spacing:0.1em;color:#999;margin-left:16px;">' +
        product.number + ' ' + product.name + ' — ' + product.year +
      '</span>';

    // Sidebar-piler: vanlig navigasjon
    document.getElementById('proj-prev').onclick = function() {
      window.location.href = '/produkt/?id=' + prevProduct.id;
    };
    document.getElementById('proj-next').onclick = function() {
      window.location.href = '/produkt/?id=' + nextProduct.id;
    };

    // Overlay-piler: bli i overlay, last nytt prosjekt
    document.getElementById('overlay-prev').onclick = function(e) {
      e.stopPropagation();
      loadProduct(prevProduct);
      document.getElementById('overlay-img').src = 'images/' + prevProduct.id + '/0.jpg';
    };
    document.getElementById('overlay-next').onclick = function(e) {
      e.stopPropagation();
      loadProduct(nextProduct);
      document.getElementById('overlay-img').src = 'images/' + nextProduct.id + '/0.jpg';
    };
  }

  // Les produkt fra URL
  var id = new URLSearchParams(window.location.search).get('id');
  var product = products.find(function(p) { return p.id === id; });

  if (!product) {
    page.innerHTML = '<p style="padding:120px 48px">Produkt ikke funnet.</p>';
    return;
  }

  // Bygg DOM-strukturen én gang
  page.innerHTML =
    '<div class="product-sidebar"></div>' +
    '<div class="product-images"></div>' +
    '<div id="overlay">' +
      '<div id="overlay-info"></div>' +
      '<div id="overlay-img-wrapper">' +
        '<img id="overlay-img" src="">' +
        '<div id="overlay-left"></div>' +
        '<div id="overlay-right"></div>' +
      '</div>' +
    '</div>';

  // Last startprodukt
  loadProduct(product);

  // Statiske overlay-lyttere (settes kun én gang)
  document.getElementById('overlay').addEventListener('click', closeOverlay);
  document.getElementById('overlay-img').addEventListener('click', function(e) { e.stopPropagation(); });
  document.getElementById('overlay-info').addEventListener('click', function(e) { e.stopPropagation(); });
  document.getElementById('overlay-left').addEventListener('click', function(e) {
    e.stopPropagation();
    prevImage();
  });
  document.getElementById('overlay-right').addEventListener('click', function(e) {
    e.stopPropagation();
    nextImage();
  });

  document.addEventListener('keydown', function(e) {
    var overlay = document.getElementById('overlay');
    if (overlay.style.display !== 'flex') return;
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') closeOverlay();
  });
});
