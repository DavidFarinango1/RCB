document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.mobile-toggle');
  const navbar = document.querySelector('.navbar');
  if (toggle && navbar) {
    toggle.addEventListener('click', () => navbar.classList.toggle('nav-open'));
  }

  const tabs = document.querySelectorAll('.tab-row .tab');
  const cards = document.querySelectorAll('[data-category]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      cards.forEach(card => {
        card.style.display = (filter === 'todos' || card.dataset.category === filter) ? '' : 'none';
      });
    });
  });
});
