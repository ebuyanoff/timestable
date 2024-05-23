////////////////Плавный скрол по якорям
$(document).ready(function() {
  $("body").on('click', '[href*="#"]:not(.linknotanchor)', function(e) {
    var fixed_offset = 20;
    if (this.pathname === location.pathname && this.hash) {
      $('html,body').stop().animate({ scrollTop: $(this.hash).offset().top - fixed_offset }, 200);
      e.preventDefault();
    }
  });
  if (window.location.hash) {
    var fixed_offset = 20;
    var hash = window.location.hash;
    if (window.location.pathname === '/games/') {
      $('html,body').animate({ scrollTop: $(hash).offset().top - fixed_offset }, 200);
    }
  }
});

////////////////9 точек верхнего меню
document.querySelector('.toprightmenu').addEventListener('click', function() {
  document.querySelector('.topmenu').classList.toggle('active');
  var topOpen = document.querySelector('.topopen');
  var topClose = document.querySelector('.topclose');
  topOpen.style.display = topOpen.style.display === 'none' ? '' : 'none';
  topClose.style.display = topClose.style.display === 'none' ? '' : 'none';
});

// Открытие внешних ссылок в новой вкладке
document.addEventListener('DOMContentLoaded', function() {
  document.body.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.hostname && e.target.hostname !== window.location.hostname.replace(/^www\./, '')) {
      e.target.target = '_blank';
    }
  });
});


// Раскрытие блока по кнопке ответ и плавный скролл к кнопке
document.querySelectorAll('.btnopen').forEach(function(btn) {
  btn.addEventListener('click', function() {
    this.nextElementSibling.classList.toggle('active');

    // Плавный скролл к кнопке
    this.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

