const carouselTrack = document.querySelector('.carousel-track');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

if (prevBtn && nextBtn && carouselTrack) {
  prevBtn.addEventListener('click', () => {
    carouselTrack.scrollBy({
      left: -380,
      behavior: 'smooth'
    });
  });

  nextBtn.addEventListener('click', () => {
    carouselTrack.scrollBy({
      left: 380,
      behavior: 'smooth'
    });
  });
}

const carouselCards = document.querySelectorAll('.carousel-card');
carouselCards.forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
  });
});
