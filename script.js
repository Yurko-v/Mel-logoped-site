/* ════════════════════════════════════════════════════
   Детский центр развития «Мел» — Script
   ════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    const isEn = document.documentElement.lang === 'en';
    const t = isEn ? {
        toDark: 'Switch to dark theme',
        toLight: 'Switch to light theme',
        photo: 'Photo viewer',
        close: 'Close',
        prev: 'Previous photo',
        next: 'Next photo',
    } : {
        toDark: 'Включить тёмную тему',
        toLight: 'Включить светлую тему',
        photo: 'Просмотр фотографии',
        close: 'Закрыть',
        prev: 'Предыдущее фото',
        next: 'Следующее фото',
    };

    // ── Тема ──
    // Начальную тему ставит маленький скрипт в <head> (чтобы не было вспышки).
    // Здесь — только кнопка и запоминание выбора.
    const root = document.documentElement;
    const themeBtn = document.getElementById('theme-toggle');

    const syncThemeBtn = () => {
        if (!themeBtn) return;
        const dark = root.dataset.theme === 'dark';
        themeBtn.setAttribute('aria-pressed', String(dark));
        themeBtn.setAttribute('aria-label', dark ? t.toLight : t.toDark);
        themeBtn.title = dark ? t.toLight : t.toDark;
    };

    const setTheme = (theme, remember) => {
        root.dataset.theme = theme;
        if (remember) {
            try { localStorage.setItem('theme', theme); } catch (e) { /* приватный режим */ }
        }
        syncThemeBtn();
    };

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
        });
    }
    syncThemeBtn();

    // Пока человек сам не выбрал тему — следуем за системной
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
    systemDark.addEventListener('change', (e) => {
        let saved = null;
        try { saved = localStorage.getItem('theme'); } catch (err) { /* нет доступа */ }
        if (!saved) setTheme(e.matches ? 'dark' : 'light', false);
    });

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

    // На странице политики меню нет
    if (burger && nav) {
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
    }

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
        lightbox.setAttribute('aria-label', t.photo);
        lightbox.innerHTML = `
            <button class="gallery__lightbox-close" aria-label="${t.close}">&times;</button>
            <button class="gallery__lightbox-prev" aria-label="${t.prev}">&#10094;</button>
            <img class="gallery__lightbox-image" src="" alt="">
            <button class="gallery__lightbox-next" aria-label="${t.next}">&#10095;</button>
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
