document.addEventListener('DOMContentLoaded', () => {
  const fixedOffset = 20;
  const scrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

  document.body.addEventListener('click', (event) => {
    const link = event.target.closest('a[href*="#"]:not(.linknotanchor)');
    if (!link || link.pathname !== window.location.pathname || !link.hash) return;

    const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (!target) return;

    event.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - fixedOffset;
    window.scrollTo({ top, behavior: scrollBehavior });
    window.history.pushState(null, '', link.hash);
  });

  const menuButton = document.querySelector('.toprightmenu');
  menuButton?.addEventListener('click', () => {
    const isOpen = document.querySelector('.topmenu')?.classList.toggle('active') ?? false;
    const topOpen = document.querySelector('.topopen');
    const topClose = document.querySelector('.topclose');
    if (topOpen) topOpen.style.display = isOpen ? 'none' : '';
    if (topClose) topClose.style.display = isOpen ? 'block' : 'none';
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  });

  document.querySelectorAll('a[href^="http"]').forEach((link) => {
    if (link.hostname.replace(/^www\./, '') === window.location.hostname.replace(/^www\./, '')) return;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });

  document.querySelectorAll('.btnopen').forEach((button, index) => {
    const answer = button.nextElementSibling;
    if (!answer) return;

    if (!answer.id) answer.id = `answer-${index + 1}`;
    button.setAttribute('aria-controls', answer.id);
    button.setAttribute('aria-expanded', String(answer.classList.contains('active')));

    button.addEventListener('click', () => {
      const isOpen = answer.classList.toggle('active');
      button.setAttribute('aria-expanded', String(isOpen));
      button.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
    });
  });
});
