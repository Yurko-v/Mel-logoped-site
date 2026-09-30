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

    // ── Gallery ──
    const gallerySection = document.getElementById('gallery');

    if (gallerySection) {
        const items = Array.from(gallerySection.querySelectorAll('.gallery__item'));
        const moreBtn = gallerySection.querySelector('.gallery__more-btn');
        let currentIndex = 0;

        if (moreBtn) {
            moreBtn.addEventListener('click', () => gallerySection.classList.add('gallery--expanded'));
        }

        // Lightbox
        const lightbox = document.createElement('div');
        lightbox.className = 'gallery__lightbox';
        lightbox.setAttribute('role', 'dialog');
        lightbox.setAttribute('aria-modal', 'true');
        lightbox.setAttribute('aria-label', 'Просмотр фотографии');
        lightbox.innerHTML = `
            <button class="gallery__lightbox-close" aria-label="Закрыть">&times;</button>
            <button class="gallery__lightbox-prev" aria-label="Предыдущее фото">&#10094;</button>
            <img class="gallery__lightbox-image" src="" alt="">
            <button class="gallery__lightbox-next" aria-label="Следующее фото">&#10095;</button>
            <div class="gallery__lightbox-counter" aria-live="polite"></div>
        `;
        document.body.appendChild(lightbox);
        const lightboxImage = lightbox.querySelector('.gallery__lightbox-image');
        const lightboxClose = lightbox.querySelector('.gallery__lightbox-close');
        const lightboxPrev = lightbox.querySelector('.gallery__lightbox-prev');
        const lightboxNext = lightbox.querySelector('.gallery__lightbox-next');
        const lightboxCounter = lightbox.querySelector('.gallery__lightbox-counter');

        const showPhoto = (index) => {
            currentIndex = (index + items.length) % items.length;
            const item = items[currentIndex];
            const thumb = item.querySelector('.gallery__image');
            lightboxImage.src = item.href;
            lightboxImage.alt = thumb.alt;
            lightboxCounter.textContent = `${currentIndex + 1} / ${items.length}`;
            // Соседние кадры подгружаем заранее, чтобы листание не мигало
            [currentIndex - 1, currentIndex + 1].forEach(i => {
                new Image().src = items[(i + items.length) % items.length].href;
            });
        };

        const openLightbox = (index) => {
            showPhoto(index);
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
            lightboxClose.focus();
        };

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            items[currentIndex].focus();
        };

        items.forEach((item, i) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                openLightbox(i);
            });
        });

        lightboxClose.addEventListener('click', closeLightbox);
        lightboxPrev.addEventListener('click', () => showPhoto(currentIndex - 1));
        lightboxNext.addEventListener('click', () => showPhoto(currentIndex + 1));
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showPhoto(currentIndex - 1);
            if (e.key === 'ArrowRight') showPhoto(currentIndex + 1);
        });

        // Touch swipe
        let touchStartX = 0;
        let touchStartY = 0;

        lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        lightbox.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
                showPhoto(dx < 0 ? currentIndex + 1 : currentIndex - 1);
            }
        }, { passive: true });
    }

});
