// Premium E-sports Website JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initMobileMenu();
    initScrollEffects();
    initGalleryCarousel();
    initPlayerCards();
    initNewsletterForm();
    initScrollToTop();
    initParallaxEffects();
    initTooltips();
    initMouseEffects();
    
    // Show loading complete
    console.log('🎉 STRAYS TEAM website loaded successfully!');
});

// Mobile Menu Functionality
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
            
            // Toggle icon
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileNav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close mobile menu when clicking links
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

    // Smooth scrolling for navigation links
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
    const slides = [
        {
            image: '/img/Strays Feminina Icone.jpg',
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
            // Update main slide
            const slide = carouselContainer.querySelector('.carousel-slide');
            if (slide) {
                const img = slide.querySelector('img');
                const title = slide.querySelector('.caption-title');
                
                if (img) img.src = slides[currentSlide].image;
                if (title) title.textContent = slides[currentSlide].caption;
            }

            // Update dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });

            // Update thumbnails
            thumbnails.forEach((thumb, index) => {
                thumb.classList.toggle('active', index === currentSlide);
            });

            // Update counter
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

        // Event listeners
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => goToSlide(index));
        });

        thumbnails.forEach((thumb, index) => {
            thumb.addEventListener('click', () => goToSlide(index));
        });

        // Auto-play carousel
        setInterval(nextSlide, 5000);

        // Initialize
        updateCarousel();
    }
}

// Player Card Interactions
function initPlayerCards() {
    const playerCards = document.querySelectorAll('.player-card');
    
    playerCards.forEach((card, index) => {
        card.addEventListener('mouseenter', function() {
            // Add premium hover effects
            this.style.transform = 'translateY(-10px) scale(1.03)';
            
            // Animate progress bars
            const progressFill = this.querySelector('.progress-fill');
            if (progressFill) {
                const width = progressFill.style.width;
                progressFill.style.width = '0%';
                setTimeout(() => {
                    progressFill.style.width = width;
                }, 100);
            }

            // Glow effect on role icon
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
                    // Simulate subscription
                    button.innerHTML = '<i class="fas fa-check"></i> Subscribed!';
                    button.style.background = 'linear-gradient(45deg, #10b981, #059669)';
                    
                    input.value = '';
                    
                    // Reset button after 3 seconds
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
    // Create scroll to top button
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
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            scrollTopBtn.style.opacity = '1';
            scrollTopBtn.style.visibility = 'visible';
        } else {
            scrollTopBtn.style.opacity = '0';
            scrollTopBtn.style.visibility = 'hidden';
        }
    });
    
    // Scroll to top when clicked
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
            
            // Move background
            const heroBg = heroSection.querySelector('.hero-bg');
            if (heroBg) {
                heroBg.style.transform = `translate(${mouseX * 0.02}px, ${mouseY * 0.02}px)`;
            }
            
            // Move particles
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
    // Add mouse trail effect
    const mouseTrail = [];
    const maxTrailLength = 10;
    
    document.addEventListener('mousemove', function(e) {
        mouseTrail.push({
            x: e.clientX,
            y: e.clientY,
            time: Date.now()
        });
        
        // Limit trail length
        if (mouseTrail.length > maxTrailLength) {
            mouseTrail.shift();
        }
        
        // Update existing trail elements
        updateMouseTrail();
    });
    
    function updateMouseTrail() {
        // Remove old trail elements
        document.querySelectorAll('.mouse-trail').forEach(el => el.remove());
        
        // Create new trail elements
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
            
            // Fade out and remove
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
    
    // Enhanced hover effects for interactive elements
    const interactiveElements = document.querySelectorAll('button, a, .player-card, .news-card, .sponsor-card');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        });
    });
}

// Intersection Observer for scroll animations
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

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.player-card, .news-card, .sponsor-card, .section-header');
    animatedElements.forEach(el => observer.observe(el));
});

// Performance monitoring
function initPerformanceMonitoring() {
    // Monitor frame rate
    let lastTime = performance.now();
    let frameCount = 0;
    
    function measureFPS() {
        const currentTime = performance.now();
        frameCount++;
        
        if (currentTime - lastTime >= 1000) {
            const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
            console.log(`FPS: ${fps}`);
            
            // Reset counters
            lastTime = currentTime;
            frameCount = 0;
        }
        
        requestAnimationFrame(measureFPS);
    }
    
    measureFPS();
}

// Initialize performance monitoring in development
if (window.location.hostname === 'localhost') {
    initPerformanceMonitoring();
}

// Export functions for potential external use
window.StraysTeamWebsite = {
    initMobileMenu,
    initScrollEffects,
    initGalleryCarousel,
    initPlayerCards,
    initNewsletterForm
};



document.addEventListener('DOMContentLoaded', () => {
    const teamsData = {
        'principal': {
            name: 'STRAYS',
            players: [
                { name: 'Jogador Principal 1', role: 'Duelista', image: '/img/icone.png' },
                { name: 'Jogador Principal 2', role: 'Sentinela', image: '/img/icone.png' },
                { name: 'Jogador Principal 3', role: 'Iniciador', image: '/img/icone.png' },
                { name: 'Jogador Principal 4', role: 'Controlador', image: '/img/icone.png' },
                { name: 'Jogador Principal 5', role: 'Flex', image: '/img/icone.png' },
                { name: 'Jogador Principal 6', role: 'Flex', image: '/img/icone.png' }
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
                { name: 'Rissa', role: 'Iniciadora', image: '/img/Strays Feminina Icone.jpg' },
                { name: 'Luna', role: 'Controladora IGL', image: '/img/Luna lol.jpg' },
                { name: 'Stehff', role: 'Sentinela', image: '/img/Strays Feminina Icone.jpg' },
                { name: 'Ishtar', role: 'Flex', image: '/img/Strays Feminina Icone.jpg' },
                { name: 'Cold', role: 'Duelista', image: '/img/Strays Feminina Icone.jpg' },
                { name: 'Sexto', role: 'Sexto', image: '/img/Strays Feminina Icone.jpg' }
            ]
        },
        'academy': {
            name: 'STRAYS ACADEMY',
            players: [
                { name: 'Virgula', role: 'Iniciador', image: '/img/Virgula teste player card.jpg' },
                { name: 'Academy 2', role: 'Sentinela', image: '/img/Strays Academy Icone.jpg' },
                { name: 'Academy 3', role: 'Duelista', image: '/img/Strays Academy Icone.jpg' },
                { name: 'Academy 4', role: 'Controlador', image: '/img/Strays Academy Icone.jpg' },
                { name: 'Academy 5', role: 'Flex', image: '/img/Strays Academy Icone.jpg' },
                { name: 'Academy 6', role: 'Flex', image: '/img/Strays Academy Icone.jpg' }
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
            if (lastFocusedElement) { lastFocusedElement.focus(); }
        };

        teamCards.forEach(card => {
            card.addEventListener('click', () => openModal(card.dataset.team));
            card.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openModal(card.dataset.team); }
            });
        });

        closeModalButton.addEventListener('click', closeModal);
        modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
        document.addEventListener('keydown', (event) => { 
            if (event.key === "Escape" && modal.classList.contains('is-visible')) { closeModal(); }
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
});


document.addEventListener('DOMContentLoaded', function() {
    const logo = document.getElementById('headerLogo');
    const teamSection = document.getElementById('team');

    function checkLogoVisibility() {
        if (!logo || !teamSection) return;
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

    // Esconde o logo inicialmente
    logo.classList.remove('visible');
    window.addEventListener('scroll', checkLogoVisibility);
    window.addEventListener('resize', checkLogoVisibility);
    checkLogoVisibility();
});


document.addEventListener('DOMContentLoaded', function() {
    const patrocinarBtn = document.getElementById('highlightsBtn');
    if (patrocinarBtn) {
        patrocinarBtn.addEventListener('click', function() {
            window.open('https://www.youtube.com/@STRAYSTEAM', '_blank');
        });
    }
});



document.addEventListener('DOMContentLoaded', function() {
    // Seleciona todos os botões "Leia mais"
    const newsLinks = document.querySelectorAll('.news-link');
    const newsModal = document.getElementById('newsModal');
    const newsModalTitle = document.getElementById('news-modal-title');
    const newsModalBody = document.getElementById('news-modal-body');
    const closeNewsModalBtn = newsModal ? newsModal.querySelector('.close-button') : null;

    // Exemplo de dados completos das notícias (você pode adaptar para buscar de outro lugar)
    const newsData = [
        {
            title: "Adquira agora a jersey da Strays",
            image: "/img/Strays Jersey gif.gif",
            content: "Depois de muitos pedidos, a Strays finalmente coloca em produção a Jersey da Strays. Garanta agora a sua na pré-venda, e fique ligado. Em breve, o Manguito estará entre nós!<br><br><img src='/img/Strays Jersey gif.gif' alt='Jersey' style='width:100%;border-radius:8px;'>"
        },
        {
            title: "Reformulação do Academy",
            image: "/img/Strays Academy Icone.jpg",
            content: "O Academy abre suas portas para novos talentos. Para aqueles que tem foco e muita sede de vitória, entre em contato caso queira fazer parte e aprender com profissionais.<br><br><img src='/img/Strays Academy Icone.jpg' alt='Academy' style='width:100%;border-radius:8px;'>"
        },
        {
            title: "A STRAYS ESTÁ NO VALORANT!",
            image: "/img/Chamada Strays para todas as Lines.png",
            content: "🔥 Lineup Principal, 💥 Lineup Feminina, 🚀 Lineup Academy. Cada lineup foi construída com dedicação, visão e paixão pelo jogo. A Strays não veio para brincar — veio para vencer.<br><br><img src='/img/Chamada Strays para todas as Lines.png' alt='Valorant' style='width:100%;border-radius:8px;'>"
        }
    ];

    newsLinks.forEach((btn, idx) => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const data = newsData[idx];
            if (data && newsModal && newsModalTitle && newsModalBody) {
                newsModalTitle.textContent = data.title;
                newsModalBody.innerHTML = `
  <div class="news-modal-flex">
    <div class="news-modal-text">
      <p>${data.content.split('<br><br><img')[0]}</p>
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
        });
    });

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
});