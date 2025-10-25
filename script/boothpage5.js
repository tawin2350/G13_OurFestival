const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(50px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(section);
    });
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.parallax-bg');
        if (parallax) {
            parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
    const toppingCards = document.querySelectorAll('.topping-card');
    toppingCards.forEach(card => {
        const checkbox = card.querySelector('input[type="checkbox"]');
        
        card.addEventListener('click', (e) => {
            if (e.target.type !== 'checkbox' && e.target.tagName !== 'LABEL') {
                checkbox.checked = !checkbox.checked;
                updateCardState(card, checkbox.checked);
            }
        });

        checkbox.addEventListener('change', () => {
            updateCardState(card, checkbox.checked);
        });
    });

    function updateCardState(card, isChecked) {
        if (isChecked) {
            card.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
            card.style.color = 'white';
            card.querySelector('h3').style.color = 'white';
            card.querySelector('.topping-price').style.color = '#ffd700';
            createConfetti(card);
        } else {
            card.style.background = 'white';
            card.style.color = '#333';
            card.querySelector('h3').style.color = '#333';
            card.querySelector('.topping-price').style.color = '#667eea';
        }
    }
    function createConfetti(element) {
        const colors = ['#667eea', '#764ba2', '#ffd700', '#ff6b6b', '#48dbfb'];
        const confettiCount = 15;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = '8px';
            confetti.style.height = '8px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = '50%';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '1000';
            
            const rect = element.getBoundingClientRect();
            confetti.style.left = `${rect.left + rect.width / 2}px`;
            confetti.style.top = `${rect.top + rect.height / 2}px`;
            
            document.body.appendChild(confetti);

            const angle = (Math.PI * 2 * i) / confettiCount;
            const velocity = 100;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;

            let x = 0;
            let y = 0;
            let opacity = 1;

            const animate = () => {
                x += vx * 0.02;
                y += vy * 0.02 + 2;
                opacity -= 0.02;

                confetti.style.transform = `translate(${x}px, ${y}px)`;
                confetti.style.opacity = opacity;

                if (opacity > 0) {
                    requestAnimationFrame(animate);
                } else {
                    confetti.remove();
                }
            };

            animate();
        }
    }
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.innerHTML = `
                <div class="lightbox-content">
                    <span class="close-lightbox">&times;</span>
                    <img src="${img.src}" alt="${img.alt}">
                </div>
            `;
            
            document.body.appendChild(lightbox);
            
            setTimeout(() => {
                lightbox.style.opacity = '1';
            }, 10);

            const close = () => {
                lightbox.style.opacity = '0';
                setTimeout(() => lightbox.remove(), 300);
            };

            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox || e.target.classList.contains('close-lightbox')) {
                    close();
                }
            });
        });
    });
    const style = document.createElement('style');
    style.textContent = `
        .lightbox {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .lightbox-content {
            position: relative;
            max-width: 90%;
            max-height: 90%;
            animation: zoomIn 0.3s ease;
        }
        .lightbox-content img {
            max-width: 100%;
            max-height: 90vh;
            border-radius: 10px;
            box-shadow: 0 0 50px rgba(255, 255, 255, 0.2);
        }
        .close-lightbox {
            position: absolute;
            top: -40px;
            right: 0;
            color: white;
            font-size: 40px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .close-lightbox:hover {
            transform: scale(1.2);
        }
        @keyframes zoomIn {
            from {
                transform: scale(0.5);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    if ('ontouchstart' in window) {
        const flipCards = document.querySelectorAll('.flip-card');
        flipCards.forEach(card => {
            card.addEventListener('click', () => {
                card.classList.toggle('flipped');
            });
        });

        const flipStyle = document.createElement('style');
        flipStyle.textContent = `
            .flip-card.flipped .flip-card-inner {
                transform: rotateY(180deg);
            }
        `;
        document.head.appendChild(flipStyle);
    }
    const contactCards = document.querySelectorAll('.contact-card');
    contactCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const icon = card.querySelector('.contact-icon');
            icon.style.transform = 'scale(1.2) rotate(10deg)';
        });

        card.addEventListener('mouseleave', () => {
            const icon = card.querySelector('.contact-icon');
            icon.style.transform = 'scale(1) rotate(0deg)';
        });
    });
    const orderBtns = document.querySelectorAll('.order-btn');
    orderBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const originalText = btn.textContent;
            btn.textContent = '✓ เพิ่มแล้ว!';
            btn.style.background = '#1dd1a1';
            btn.style.color = 'white';

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = 'white';
                btn.style.color = '#667eea';
            }, 2000);
        });
    });
    const animateCounter = (element, target, duration = 2000) => {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target + '+';
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + '+';
            }
        }, 16);
    };
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                const numberElement = entry.target.querySelector('.stat-number');
                if (numberElement && numberElement.textContent.includes('50')) {
                    numberElement.textContent = '0+';
                    animateCounter(numberElement, 50);
                }
            }
        });
    }, { threshold: 0.5 });

    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach(item => statsObserver.observe(item));
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach(shape => {
        setInterval(() => {
            shape.style.filter = `brightness(${1 + Math.random()}) drop-shadow(0 0 10px rgba(255, 255, 255, ${Math.random()}))`;
        }, 1000);
    });
});
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});
