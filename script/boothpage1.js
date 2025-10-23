const slider = document.querySelector('.menu-slider');
const prev = document.querySelector('.prev');
const next = document.querySelector('.next');

const scrollStep = 300;

next.addEventListener('click', () => {
  slider.scrollBy({ left: scrollStep, behavior: 'smooth' });
});

prev.addEventListener('click', () => {
  slider.scrollBy({ left: -scrollStep, behavior: 'smooth' });
});
