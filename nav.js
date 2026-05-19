document.addEventListener('DOMContentLoaded', function() {
  var nav = document.getElementById('nav');
  var mobileMenu = document.getElementById('mobile-menu');

  nav.innerHTML =
    '<a href="index.html" class="nav-logo">Studio Glazebrook</a>' +
    '<ul class="nav-links">' +
      '<li><a href="works.html">Kolleksjon</a></li>' +
      '<li><a href="about.html">Studio</a></li>' +
      '<li><a href="contact.html">Kontakt</a></li>' +
    '</ul>' +
    '<button class="nav-hamburger" id="hamburger" aria-label="Meny">' +
      '<span></span><span></span><span></span>' +
    '</button>';

  mobileMenu.innerHTML =
    '<a href="index.html">Hjem</a>' +
    '<a href="works.html">Kolleksjon</a>' +
    '<a href="about.html">Studio</a>' +
    '<a href="contact.html">Kontakt</a>';

  document.getElementById('hamburger').addEventListener('click', function() {
    this.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });

  mobileMenu.querySelectorAll('a').forEach(function(a) {
    a.addEventListener('click', function() {
      document.getElementById('hamburger').classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });
});
