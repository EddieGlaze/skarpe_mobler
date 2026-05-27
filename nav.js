document.addEventListener('DOMContentLoaded', function() {
  var nav = document.getElementById('nav');
  var mobileMenu = document.getElementById('mobile-menu');

  nav.innerHTML =
    '<a href="/" class="nav-logo-mark" aria-label="Studio Glazebrook"><img src="/logo.svg" class="nav-logo-img" alt=""></a>' +
    '<a href="/" class="nav-logo">Studio Glazebrook</a>' +
    '<ul class="nav-links">' +
      '<li><a href="/kolleksjon/">Kolleksjon</a></li>' +
      '<li><a href="/studio/">Studio</a></li>' +
      '<li><a href="/kontakt/">Kontakt</a></li>' +
    '</ul>' +
    '<button class="nav-hamburger" id="hamburger" aria-label="Meny">' +
      '<span></span><span></span><span></span>' +
    '</button>';

  mobileMenu.innerHTML =
    '<a href="/">Hjem</a>' +
    '<a href="/kolleksjon/">Kolleksjon</a>' +
    '<a href="/studio/">Studio</a>' +
    '<a href="/kontakt/">Kontakt</a>';

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
