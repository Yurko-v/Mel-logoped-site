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
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;

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

    // ── Form Validation & Submit via Telegram ──
    const form = document.getElementById('contact-form');

    // Секреты загружаются из config.js (не коммитится в Git)
    const hasTelegramConfig = typeof TELEGRAM_CONFIG !== 'undefined' && TELEGRAM_CONFIG.BOT_TOKEN && TELEGRAM_CONFIG.CHAT_ID;
    const TELEGRAM_BOT_TOKEN = hasTelegramConfig ? TELEGRAM_CONFIG.BOT_TOKEN : '';
    const TELEGRAM_CHAT_ID = hasTelegramConfig ? TELEGRAM_CONFIG.CHAT_ID : '';

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

            // Compose Telegram message
            const text = [
                '📩 *Новая заявка с сайта*',
                '',
                `👤 *Имя:* ${nameField.value.trim()}`,
                `📞 *Телефон:* ${phoneField.value.trim()}`,
                ageField.value.trim() ? `👶 *Возраст ребёнка:* ${ageField.value.trim()}` : '',
                messageField.value.trim() ? `💬 *Сообщение:* ${messageField.value.trim()}` : '',
                '',
                `🕐 ${new Date().toLocaleString('ru-RU')}`
            ].filter(Boolean).join('\n');

            // Show loading state
            const originalText = btn.textContent;
            btn.textContent = 'Отправка...';
            btn.disabled = true;

            try {
                const response = await fetch(
                    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: TELEGRAM_CHAT_ID,
                            text: text,
                            parse_mode: 'Markdown'
                        })
                    }
                );

                if (!response.ok) throw new Error('Telegram API error');

                // Success
                btn.textContent = '✓ Заявка отправлена!';
                btn.style.background = '#7BA887';
                form.reset();

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 3000);

            } catch (error) {
                // Error
                btn.textContent = '✗ Ошибка, попробуйте позже';
                btn.style.background = '#e05252';

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 3000);
            }
        });
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
