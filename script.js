// Premium E-sports Website JavaScript

/**
 * Funções de Inicialização
 * Agrupadas para melhor organização e rastreamento.
 */
function initAll() {
    // Inicializa todas as funcionalidades do site
    initMobileMenu();
    initScrollEffects();
    initGalleryCarousel();
    initPlayerCards();
    initNewsletterForm();
    initScrollToTop();
    initParallaxEffects();
    initTooltips();
    initMouseEffects();
    initIntersectionObserver(); // Nova função para o IntersectionObserver
    initTeamModals();          // Nova função para os modais de time
    initNewsSystem();          // Nova função para as notícias
    initGalleryModal();        // Nova função para o modal da galeria
    initHighlightsButton();    // Nova função para o botão de destaques
    initHeaderLogoVisibility(); // Nova função para a visibilidade do logo

    // Mostra que o carregamento foi concluído
    console.log('🎉 STRAYS TEAM website loaded successfully!');
}

// Mobile Menu Functionality
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileNav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileNav.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }
}

// Scroll Effects
function initScrollEffects() {
    const header = document.getElementById('header');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Gallery Carousel
function initGalleryCarousel() {
    const slides = [{
            image: 'img/Strays Feminina Icone.jpg',
            caption: 'Logo da Feminina'
        },
        {
            image: 'https://images.unsplash.com/photo-1633545495735-25df17fb9f31?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHw0fHxlc3BvcnRzfGVufDB8fHx8MTc1NzE5MTM1Nnww&ixlib=rb-4.1.0&q=85&w=1200&h=600&fit=crop',
            caption: 'State-of-the-art practice facility'
        },
        {
            image: 'https://images.unsplash.com/photo-1636036824578-d0d300a4effb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwzfHxlc3BvcnRzfGVufDB8fHx8MTc1NzE5MTM1Nnww&ixlib=rb-4.1.0&q=85&w=1200&h=600&fit=crop',
            caption: 'Professional gaming setup'
        },
        {
            image: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?w=1200&h=600&fit=crop',
            caption: 'Team training session'
        }
    ];

    let currentSlide = 0;
    const carouselContainer = document.querySelector('.carousel-container');
    const dots = document.querySelectorAll('.dot');
    const thumbnails = document.querySelectorAll('.thumbnail');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const currentImageSpan = document.querySelector('.current-image');
    const totalImagesSpan = document.querySelector('.total-images');

    if (carouselContainer && totalImagesSpan) {
        totalImagesSpan.textContent = slides.length;

        function updateCarousel() {
            const slide = carouselContainer.querySelector('.carousel-slide');
            if (slide) {
                const img = slide.querySelector('img');
                const title = slide.querySelector('.caption-title');

                if (img) img.src = slides[currentSlide].image;
                if (title) title.textContent = slides[currentSlide].caption;
            }

            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });

            thumbnails.forEach((thumb, index) => {
                thumb.classList.toggle('active', index === currentSlide);
            });

            if (currentImageSpan) {
                currentImageSpan.textContent = currentSlide + 1;
            }
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            updateCarousel();
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            updateCarousel();
        }

        function goToSlide(index) {
            currentSlide = index;
            updateCarousel();
        }

        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => goToSlide(index));
        });

        thumbnails.forEach((thumb, index) => {
            thumb.addEventListener('click', () => goToSlide(index));
        });

        setInterval(nextSlide, 5000);
        updateCarousel();
    }
}

// Player Card Interactions
function initPlayerCards() {
    const playerCards = document.querySelectorAll('.player-card');

    playerCards.forEach((card, index) => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.03)';
            const progressFill = this.querySelector('.progress-fill');
            if (progressFill) {
                const width = progressFill.style.width;
                progressFill.style.width = '0%';
                setTimeout(() => {
                    progressFill.style.width = width;
                }, 100);
            }
            const roleIcon = this.querySelector('.role-icon');
            if (roleIcon) {
                roleIcon.classList.add('glow-gold');
            }
        });

        card.addEventListener('mouseleave', function() {
            const roleIcon = this.querySelector('.role-icon');
            if (roleIcon) {
                roleIcon.classList.remove('glow-gold');
            }
        });
    });
}

// Newsletter Form
function initNewsletterForm() {
    const form = document.getElementById('newsletterForm');

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const input = this.querySelector('input[type="email"]');
            const button = this.querySelector('button');

            if (input && button) {
                const email = input.value;

                if (email) {
                    button.innerHTML = '<i class="fas fa-check"></i> Subscribed!';
                    button.style.background = 'linear-gradient(45deg, #10b981, #059669)';
                    input.value = '';
                    setTimeout(() => {
                        button.innerHTML = '<i class="fas fa-paper-plane"></i> Subscribe';
                        button.style.background = '';
                    }, 3000);
                }
            }
        });
    }
}

// Scroll to Top Functionality
function initScrollToTop() {
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollTopBtn.className = 'scroll-top-btn glass-effect';
    scrollTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border: none;
        border-radius: 50%;
        color: var(--primary-gold);
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        font-size: 18px;
    `;
    document.body.appendChild(scrollTopBtn);

    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            scrollTopBtn.style.opacity = '1';
            scrollTopBtn.style.visibility = 'visible';
        } else {
            scrollTopBtn.style.opacity = '0';
            scrollTopBtn.style.visibility = 'hidden';
        }
    });

    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Parallax Effects
function initParallaxEffects() {
    const heroSection = document.querySelector('.hero-section');
    const particles = document.querySelectorAll('.particle');

    if (heroSection) {
        window.addEventListener('mousemove', function(e) {
            const mouseX = (e.clientX / window.innerWidth) * 100;
            const mouseY = (e.clientY / window.innerHeight) * 100;
            const heroBg = heroSection.querySelector('.hero-bg');
            if (heroBg) {
                heroBg.style.transform = `translate(${mouseX * 0.02}px, ${mouseY * 0.02}px)`;
            }

            particles.forEach((particle, index) => {
                const speed = (index + 1) * 0.02;
                const directionX = index % 2 === 0 ? 1 : -1;
                const directionY = index % 3 === 0 ? 1 : -1;
                particle.style.transform = `translate(${mouseX * speed * directionX}px, ${mouseY * speed * directionY}px)`;
            });
        });
    }
}

// Enhanced Tooltips
function initTooltips() {
    const tooltips = document.querySelectorAll('.tooltip');

    tooltips.forEach(tooltip => {
        const tooltipText = tooltip.querySelector('.tooltiptext');

        if (tooltipText) {
            tooltip.addEventListener('mouseenter', function() {
                tooltipText.style.opacity = '1';
                tooltipText.style.visibility = 'visible';
                tooltipText.style.transform = 'translateY(-5px)';
            });

            tooltip.addEventListener('mouseleave', function() {
                tooltipText.style.opacity = '0';
                tooltipText.style.visibility = 'hidden';
                tooltipText.style.transform = 'translateY(0)';
            });
        }
    });
}

// Mouse Effects
function initMouseEffects() {
    const mouseTrail = [];
    const maxTrailLength = 10;

    document.addEventListener('mousemove', function(e) {
        mouseTrail.push({
            x: e.clientX,
            y: e.clientY,
            time: Date.now()
        });

        if (mouseTrail.length > maxTrailLength) {
            mouseTrail.shift();
        }

        updateMouseTrail();
    });

    function updateMouseTrail() {
        document.querySelectorAll('.mouse-trail').forEach(el => el.remove());
        mouseTrail.forEach((point, index) => {
            const trailElement = document.createElement('div');
            trailElement.className = 'mouse-trail';
            trailElement.style.cssText = `
                position: fixed;
                width: ${4 - (index * 0.3)}px;
                height: ${4 - (index * 0.3)}px;
                background: rgba(255, 215, 0, ${0.8 - (index * 0.08)});
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                left: ${point.x}px;
                top: ${point.y}px;
                transform: translate(-50%, -50%);
                transition: opacity 0.5s ease;
            `;
            document.body.appendChild(trailElement);
            setTimeout(() => {
                trailElement.style.opacity = '0';
                setTimeout(() => {
                    if (trailElement.parentNode) {
                        trailElement.parentNode.removeChild(trailElement);
                    }
                }, 500);
            }, 100);
        });
    }

    const interactiveElements = document.querySelectorAll('button, a, .player-card, .news-card, .sponsor-card');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        });
    });
}

// Intersection Observer for scroll animations
function initIntersectionObserver() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.player-card, .news-card, .sponsor-card, .section-header');
    animatedElements.forEach(el => observer.observe(el));
}

// Performance monitoring
function initPerformanceMonitoring() {
    let lastTime = performance.now();
    let frameCount = 0;

    function measureFPS() {
        const currentTime = performance.now();
        frameCount++;
        if (currentTime - lastTime >= 1000) {
            const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
            console.log(`FPS: ${fps}`);
            lastTime = currentTime;
            frameCount = 0;
        }
        requestAnimationFrame(measureFPS);
    }

    measureFPS();
}

// Team Modals and Data
function initTeamModals() {
    const teamsData = {
        'principal': {
            name: 'STRAYS',
            players: [
                { name: 'Jogador Principal 1', role: 'Duelista', image: 'img/icone.png' },
                { name: 'Jogador Principal 2', role: 'Sentinela', image: 'img/icone.png' },
                { name: 'Jogador Principal 3', role: 'Iniciador', image: 'img/icone.png' },
                { name: 'Jogador Principal 4', role: 'Controlador', image: 'img/icone.png' },
                { name: 'Jogador Principal 5', role: 'Flex', image: 'img/icone.png' },
                { name: 'Jogador Principal 6', role: 'Flex', image: 'img/icone.png' }
            ]
        },
        'core': {
            name: 'STRAYS CORE',
            players: [
                { name: 'Jogador Core 1', role: 'Duelista', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwyfHxnYW1pbmd8ZW58MHx8fHwxNzU3MDk5NjAyfDA&ixlib=rb-4.1.0&q=85&w=400&h=400&fit=crop' },
                { name: 'Jogador Core 2', role: 'Sentinela', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwyfHxnYW1pbmd8ZW58MHx8fHwxNzU3MDk5NjAyfDA&ixlib=rb-4.1.0&q=85&w=400&h=400&fit=crop' },
                { name: 'Jogador Core 3', role: 'Iniciador', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwyfHxnYW1pbmd8ZW58MHx8fHwxNzU3MDk5NjAyfDA&ixlib=rb-4.1.0&q=85&w=400&h=400&fit=crop' },
                { name: 'Jogador Core 4', role: 'Controlador', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwyfHxnYW1pbmd8ZW58MHx8fHwxNzU3MDk5NjAyfDA&ixlib=rb-4.1.0&q=85&w=400&h=400&fit=crop' },
                { name: 'Jogador Core 5', role: 'Flex', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwyfHxnYW1pbmd8ZW58MHx8fHwxNzU3MDk5NjAyfDA&ixlib=rb-4.1.0&q=85&w=400&h=400&fit=crop' },
                { name: 'Jogador Core 6', role: 'Flex', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwyfHxnYW1pbmd8ZW58MHx8fHwxNzU3MDk5NjAyfDA&ixlib=rb-4.1.0&q=85&w=400&h=400&fit=crop' }
            ]
        },
        'feminina': {
            name: 'STRAYS FEMININA',
            players: [
                { name: 'Rissa', role: 'Iniciadora', image: 'img/Strays Feminina Icone.jpg' },
                { name: 'Luna', role: 'Controladora IGL', image: 'img/Luna lol.jpg' },
                { name: 'Stehff', role: 'Sentinela', image: 'img/Strays Feminina Icone.jpg' },
                { name: 'Ishtar', role: 'Flex', image: 'img/Strays Feminina Icone.jpg' },
                { name: 'Cold', role: 'Duelista', image: 'img/Strays Feminina Icone.jpg' },
                { name: 'Sexto', role: 'Sexto', image: 'img/Strays Feminina Icone.jpg' }
            ]
        },
        'academy': {
            name: 'STRAYS ACADEMY',
            players: [
                { name: 'Virgula', role: 'Iniciador', image: 'img/Virgula teste player card.jpg' },
                { name: 'Academy 2', role: 'Sentinela', image: 'img/Strays Academy Icone.jpg' },
                { name: 'Academy 3', role: 'Duelista', image: 'img/Strays Academy Icone.jpg' },
                { name: 'Academy 4', role: 'Controlador', image: 'img/Strays Academy Icone.jpg' },
                { name: 'Academy 5', role: 'Flex', image: 'img/Strays Academy Icone.jpg' },
                { name: 'Academy 6', role: 'Flex', image: 'img/Strays Academy Icone.jpg' }
            ]
        }
    };

    const modal = document.getElementById('teamModal');
    if (modal) {
        const teamCards = document.querySelectorAll('.player-card');
        const modalTeamName = document.getElementById('modal-team-name');
        const modalPlayerContainer = document.getElementById('modal-player-container');
        const closeModalButton = modal.querySelector('.close-button');
        const prevBtn = modal.querySelector('.player-prev-btn');
        const nextBtn = modal.querySelector('.player-next-btn');
        const indicator = document.getElementById('carousel-indicator');
        let lastFocusedElement;
        let currentPlayers = [];
        let currentIndex = 0;

        function renderPlayer(index) {
            const player = currentPlayers[index];
            if (!player) return;
            modalPlayerContainer.innerHTML = `
                <div class="player-info-card">
                    <img src="${player.image}" alt="Foto de ${player.name}">
                    <h4>${player.name}</h4>
                    <p>${player.role}</p>
                </div>
            `;
            indicator.textContent = `${index + 1} / ${currentPlayers.length}`;
        }

        const openModal = (teamId) => {
            const teamInfo = teamsData[teamId];
            if (!teamInfo) {
                modalTeamName.textContent = 'Line não cadastrada';
                modalPlayerContainer.innerHTML = '<p style="color:#FFD700">Nenhum jogador cadastrado para esta line.</p>';
                indicator.textContent = '';
                modal.classList.add('is-visible');
                document.body.style.overflow = 'hidden';
                closeModalButton.focus();
                return;
            }
            lastFocusedElement = document.activeElement;
            modalTeamName.textContent = teamInfo.name;
            currentPlayers = teamInfo.players;
            currentIndex = 0;
            renderPlayer(currentIndex);
            modal.classList.add('is-visible');
            document.body.style.overflow = 'hidden';
            closeModalButton.focus();
        };

        const closeModal = () => {
            modal.classList.remove('is-visible');
            document.body.style.overflow = '';
            if (lastFocusedElement) {
                lastFocusedElement.focus();
            }
        };

        teamCards.forEach(card => {
            card.addEventListener('click', () => openModal(card.dataset.team));
            card.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openModal(card.dataset.team);
                }
            });
        });

        closeModalButton.addEventListener('click', closeModal);
        modal.addEventListener('click', (event) => {
            if (event.target === modal) closeModal();
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === "Escape" && modal.classList.contains('is-visible')) {
                closeModal();
            }
            if (modal.classList.contains('is-visible')) {
                if (event.key === "ArrowLeft") prevBtn.click();
                if (event.key === "ArrowRight") nextBtn.click();
            }
        });

        prevBtn.addEventListener('click', () => {
            if (currentPlayers.length) {
                currentIndex = (currentIndex - 1 + currentPlayers.length) % currentPlayers.length;
                renderPlayer(currentIndex);
            }
        });
        nextBtn.addEventListener('click', () => {
            if (currentPlayers.length) {
                currentIndex = (currentIndex + 1) % currentPlayers.length;
                renderPlayer(currentIndex);
            }
        });
    }
}

// Logo Visibility on scroll
function initHeaderLogoVisibility() {
    const logo = document.getElementById('headerLogo');
    const teamSection = document.getElementById('team');
    if (!logo || !teamSection) return;

    function checkLogoVisibility() {
        const rect = teamSection.getBoundingClientRect();
        const sectionTop = rect.top + window.scrollY;
        const sectionHalf = sectionTop + rect.height / 600;
        const scrollY = window.scrollY + window.innerHeight / 2;
        if (scrollY >= sectionHalf) {
            logo.classList.add('visible');
        } else {
            logo.classList.remove('visible');
        }
    }
    logo.classList.remove('visible');
    window.addEventListener('scroll', checkLogoVisibility);
    window.addEventListener('resize', checkLogoVisibility);
    checkLogoVisibility();
}

// Highlights Button
function initHighlightsButton() {
    const highlightsBtn = document.getElementById('highlightsBtn');
    if (highlightsBtn) {
        highlightsBtn.addEventListener('click', function() {
            window.open('https://www.youtube.com/@STRAYSTEAM', '_blank');
        });
    }
}

// News System
function initNewsSystem() {
    const newsData = [{
            title: "Adquira agora a jersey da Strays",
            date: "2025-09-10",
            image: "img/Strays Jersey gif.gif",
            excerpt: "Depois de muitos pedidos, a Strays finalmente coloca em produção a Jersey da Strays. Garanta agora a sua na pré-venda, e fique ligado. Em breve, o Manguito estará entre nós!",
        },
        {
            title: "Reformulação do Academy",
            date: "2025-09-09",
            image: "img/Strays Academy Icone.jpg",
            excerpt: "O Academy abre suas portas para novos talentos. Para aqueles que tem foco e muita sede de vitória, entre em contato caso queira fazer parte e aprender com profissionais.",
        },
        {
            title: "Taisuke é orgulho da Strays!!!",
            date: "2025-09-11",
            image: "img/Noticia Taisuke.png",
            excerpt: "Taisuke é um jogador excepcional, sempre se destacando em suas partidas e trazendo orgulho para a equipe Strays. Agora mais do que nunca, sendo o 6° colocado dos top 10 players contender do premier",
        },
        {
            title: "A STRAYS ESTÁ NO VALORANT!",
            date: "2025-01-05",
            image: "img/Chamada Strays para todas as Lines.png",
            excerpt: "🔥 Lineup Principal, 💥 Lineup Feminina, 🚀 Lineup Academy. Cada lineup foi construída com dedicação, visão e paixão pelo jogo. A Strays não veio para brincar — veio para vencer.",
        }
    ];

    newsData.sort((a, b) => new Date(b.date) - new Date(a.date));

    function formatDate(dateStr) {
        const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const d = new Date(dateStr + 'T12:00:00');
        return `${d.getDate()} ${meses[d.getMonth()]}`;
    }

    const newsCarousel = document.getElementById('newsCarousel');
    if (newsCarousel) {
        newsCarousel.innerHTML = newsData.map((news, idx) => `
            <article class="news-card card-premium fade-in stagger-${idx+1}">
                <div class="news-image image-container">
                    <img src="${news.image}" alt="News">
                    <div class="news-date glass-effect">
                        <i class="fas fa-calendar"></i>
                        <span>${formatDate(news.date)}</span>
                    </div>
                </div>
                <div class="news-content">
                    <h3 class="news-title">${news.title}</h3>
                    <p class="news-excerpt">${news.excerpt}</p>
                    <button class="news-link">
                        <span>Leia mais</span>
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </article>
        `).join('');
    }

    const newsModal = document.getElementById('newsModal');
    const newsModalTitle = document.getElementById('news-modal-title');
    const newsModalBody = document.getElementById('news-modal-body');
    const closeNewsModalBtn = newsModal ? newsModal.querySelector('.close-button') : null;

    if (newsCarousel) {
        newsCarousel.addEventListener('click', function(e) {
            const btn = e.target.closest('.news-link');
            if (btn) {
                const article = btn.closest('.news-card');
                const idx = Array.from(newsCarousel.children).indexOf(article);
                const data = newsData[idx];
                if (data && newsModal && newsModalTitle && newsModalBody) {
                    newsModalTitle.textContent = data.title;
                    newsModalBody.innerHTML = `
                        <div class="news-modal-flex">
                            <div class="news-modal-text">
                                <p>${data.excerpt}</p>
                            </div>
                            <div class="news-modal-media">
                                <img src="${data.image}" alt="${data.title}" style="width:100%;border-radius:8px;">
                            </div>
                        </div>
                    `;
                    newsModal.classList.add('is-visible');
                    document.body.style.overflow = 'hidden';
                    closeNewsModalBtn && closeNewsModalBtn.focus();
                }
            }
        });
    }

    if (closeNewsModalBtn) {
        closeNewsModalBtn.addEventListener('click', function() {
            newsModal.classList.remove('is-visible');
            document.body.style.overflow = '';
        });
    }
    if (newsModal) {
        newsModal.addEventListener('click', function(event) {
            if (event.target === newsModal) {
                newsModal.classList.remove('is-visible');
                document.body.style.overflow = '';
            }
        });
    }
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape" && newsModal && newsModal.classList.contains('is-visible')) {
            newsModal.classList.remove('is-visible');
            document.body.style.overflow = '';
        }
    });
}

// Gallery Modal
function initGalleryModal() {
    const galleryModal = document.getElementById('galleryModal');
    const galleryModalBody = document.getElementById('gallery-modal-body');
    const closeGalleryModalBtn = galleryModal ? galleryModal.querySelector('.close-button') : null;

    function openGalleryModal() {
        const activeSlide = document.querySelector('.gallery-carousel .carousel-slide.active img');
        if (activeSlide && galleryModal && galleryModalBody) {
            galleryModalBody.innerHTML = `<img src="${activeSlide.src}" alt="${activeSlide.alt}" style="max-width:100%;max-height:70vh;border-radius:12px;">`;
            galleryModal.classList.add('is-visible');
            document.body.style.overflow = 'hidden';
            closeGalleryModalBtn && closeGalleryModalBtn.focus();
        }
    }

    document.querySelectorAll('.gallery-carousel .btn-secondary').forEach(btn => {
        btn.addEventListener('click', openGalleryModal);
    });

    if (closeGalleryModalBtn) {
        closeGalleryModalBtn.addEventListener('click', function() {
            galleryModal.classList.remove('is-visible');
            document.body.style.overflow = '';
        });
    }
    if (galleryModal) {
        galleryModal.addEventListener('click', function(event) {
            if (event.target === galleryModal) {
                galleryModal.classList.remove('is-visible');
                document.body.style.overflow = '';
            }
        });
    }
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape" && galleryModal && galleryModal.classList.contains('is-visible')) {
            galleryModal.classList.remove('is-visible');
            document.body.style.overflow = '';
        }
    });
}

// Export functions for potential external use
window.StraysTeamWebsite = {
    initMobileMenu,
    initScrollEffects,
    initGalleryCarousel,
    initPlayerCards,
    initNewsletterForm
};

// Seção de inicialização principal
if (window.location.hostname === 'localhost') {
    initPerformanceMonitoring();
}

document.addEventListener('DOMContentLoaded', initAll);