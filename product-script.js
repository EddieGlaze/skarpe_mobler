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

  let imagesHTML = '';
  for (var i = 0; i <= 20; i++) {
    const src = 'images/' + product.id + '/' + i + '.jpg';
    imagesHTML += '<a href="' + src + '" target="_blank">' +
      '<img src="' + src + '" alt="' + product.name + '" ' +
      'onerror="this.parentElement.style.display=\'none\'">' +
      '</a>';
  }

  page.innerHTML =
    '<div class="product-sidebar">' +
      '<div class="product-title">' + product.number + ' ' + product.name + '</div>' +
      '<div class="product-meta">' + product.year + '</div>' +
      '<div class="product-description"><p>' + product.description + '</p></div>' +
      priceHTML +
      '<button class="btn-inquiry" onclick="window.location.href=\'contact.html?inquiry=' + product.id + '\'">Forespørsel</button>' +
    '</div>' +
    '<div class="product-images">' + imagesHTML + '</div>';
});
