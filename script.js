/* ════════════════════════════════════════════════════
   Детский центр развития «Мел» — Script
   ════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ── Sticky Header ──
    const header = document.getElementById('header');
    const onScroll = () => {
        header.classList.toggle('header--scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ── Burger Menu ──
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);

    const toggleMenu = () => {
        const isOpen = nav.classList.toggle('open');
        burger.classList.toggle('active', isOpen);
        overlay.classList.toggle('active', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    const closeMenu = () => {
        nav.classList.remove('open');
        burger.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    burger.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', closeMenu);

    // Close menu on nav link click
    nav.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // ── Smooth Scroll ──
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerHeight = header.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ── Scroll Animations (IntersectionObserver) ──
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '0px 0px -60px 0px',
            threshold: 0.1
        });

        animatedElements.forEach(el => observer.observe(el));
    } else {
        // Fallback: show all immediately
        animatedElements.forEach(el => el.classList.add('visible'));
    }

    // ── FAQ Accordion ──
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-item__question');
        const answer = item.querySelector('.faq-item__answer');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all other FAQ items
            faqItems.forEach(other => {
                if (other !== item) {
                    other.classList.remove('active');
                    const otherAnswer = other.querySelector('.faq-item__answer');
                    otherAnswer.style.maxHeight = null;
                    other.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current
            item.classList.toggle('active', !isActive);
            question.setAttribute('aria-expanded', !isActive);

            if (!isActive) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.style.maxHeight = null;
            }
        });
    });

    // ── Form Validation & Submit via Python-бэкенд ──
    const form = document.getElementById('contact-form');

    // URL бэкенда загружается из config.js
    const hasApiConfig = typeof TELEGRAM_CONFIG !== 'undefined' && TELEGRAM_CONFIG.API_URL;
    const API_URL = hasApiConfig ? TELEGRAM_CONFIG.API_URL : '';

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameField = form.querySelector('#name');
            const phoneField = form.querySelector('#phone');
            const ageField = form.querySelector('#child-age');
            const messageField = form.querySelector('#message');
            const btn = form.querySelector('button[type="submit"]');
            let isValid = true;

            // Validation
            [nameField, phoneField].forEach(field => {
                if (!field.value.trim()) {
                    field.style.borderColor = '#e05252';
                    isValid = false;
                } else {
                    field.style.borderColor = '';
                }
            });

            if (!isValid) return;

            if (!API_URL) {
                alert('Форма временно не работает. Позвоните нам!');
                return;
            }

            // Show loading state
            const btnLabel = btn.querySelector('span') || btn;
            const originalText = btnLabel.textContent;
            btnLabel.textContent = 'Отправка...';
            btn.disabled = true;

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: nameField.value.trim(),
                        phone: phoneField.value.trim(),
                        age: ageField.value.trim(),
                        message: messageField.value.trim()
                    })
                });

                const result = await response.json().catch(() => ({}));
                if (!response.ok || !result.ok) {
                    throw new Error(result.error || 'Ошибка отправки');
                }

                // Success
                btnLabel.textContent = '✓ Заявка отправлена!';
                btn.style.background = '#7BA887';
                form.reset();

                setTimeout(() => {
                    btnLabel.textContent = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 3000);

            } catch (error) {
                // Error
                btnLabel.textContent = '✗ Ошибка, попробуйте позже';
                btn.style.background = '#e05252';

                setTimeout(() => {
                    btnLabel.textContent = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 3000);
            }
        });
    }

    // ── Gallery Slider ──
    const gallerySlider = document.querySelector('.gallery__slider');

    if (gallerySlider) {
        const track = gallerySlider.querySelector('.gallery__track');
        const slides = Array.from(gallerySlider.querySelectorAll('.gallery__slide'));
        const prevBtn = gallerySlider.querySelector('.gallery__prev');
        const nextBtn = gallerySlider.querySelector('.gallery__next');
        const dotsContainer = gallerySlider.querySelector('.gallery__dots');
        let currentIndex = 0;
        let autoplayTimer = null;

        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'gallery__dot';
            dot.setAttribute('aria-label', `Перейти к фото ${i + 1}`);
            dot.addEventListener('click', () => {
                goToSlide(i);
                restartAutoplay();
            });
            dotsContainer.appendChild(dot);
        });
        const dots = Array.from(dotsContainer.querySelectorAll('.gallery__dot'));

        const updateSlider = () => {
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            dots.forEach((dot, i) => dot.classList.toggle('gallery__dot--active', i === currentIndex));
        };

        const goToSlide = (index) => {
            currentIndex = (index + slides.length) % slides.length;
            updateSlider();
        };

        const nextSlide = () => goToSlide(currentIndex + 1);
        const prevSlide = () => goToSlide(currentIndex - 1);

        const stopAutoplay = () => {
            if (autoplayTimer) clearInterval(autoplayTimer);
        };

        const startAutoplay = () => {
            stopAutoplay();
            if (slides.length > 1) autoplayTimer = setInterval(nextSlide, 5000);
        };

        const restartAutoplay = () => startAutoplay();

        prevBtn.addEventListener('click', () => { prevSlide(); restartAutoplay(); });
        nextBtn.addEventListener('click', () => { nextSlide(); restartAutoplay(); });

        gallerySlider.addEventListener('mouseenter', stopAutoplay);
        gallerySlider.addEventListener('mouseleave', startAutoplay);
        gallerySlider.addEventListener('focusin', stopAutoplay);
        gallerySlider.addEventListener('focusout', startAutoplay);

        // Touch swipe
        let touchStartX = 0;
        let touchStartY = 0;

        track.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
                dx < 0 ? nextSlide() : prevSlide();
                restartAutoplay();
            }
        }, { passive: true });

        // Keyboard navigation
        gallerySlider.setAttribute('tabindex', '0');
        gallerySlider.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') { prevSlide(); restartAutoplay(); }
            if (e.key === 'ArrowRight') { nextSlide(); restartAutoplay(); }
        });

        // Lightbox
        const lightbox = document.createElement('div');
        lightbox.className = 'gallery__lightbox';
        lightbox.innerHTML = `
            <button class="gallery__lightbox-close" aria-label="Закрыть">&times;</button>
            <img class="gallery__lightbox-image" src="" alt="">
        `;
        document.body.appendChild(lightbox);
        const lightboxImage = lightbox.querySelector('.gallery__lightbox-image');
        const lightboxClose = lightbox.querySelector('.gallery__lightbox-close');

        const openLightbox = () => {
            const img = slides[currentIndex].querySelector('.gallery__image');
            lightboxImage.src = img.src;
            lightboxImage.alt = img.alt;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
            stopAutoplay();
        };

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            startAutoplay();
        };

        slides.forEach(slide => {
            slide.querySelector('.gallery__image').addEventListener('click', openLightbox);
        });

        lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
        });

        updateSlider();
        startAutoplay();
    }

    // ── Phone input formatting ──
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');

            if (value.length > 0) {
                if (value[0] === '7' || value[0] === '8') {
                    value = value.substring(1);
                }

                let formatted = '+7';
                if (value.length > 0) formatted += ' (' + value.substring(0, 3);
                if (value.length >= 3) formatted += ') ' + value.substring(3, 6);
                if (value.length >= 6) formatted += '-' + value.substring(6, 8);
                if (value.length >= 8) formatted += '-' + value.substring(8, 10);

                e.target.value = formatted;
            }
        });
    }

});
