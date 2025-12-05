// Premium E-sports Website JavaScript

/**
 * Funções de Inicialização
 * Agrupadas para melhor organização e rastreamento.
 */

// --- CONFIGURAÇÃO DO FIREBASE ---
// Cole aqui os dados que você copiou no Passo 1 (console do Firebase)
 const firebaseConfig = {
    apiKey: "AIzaSyDaaBVNHZ6UOgHzb-pzT1RJxAT5yiQZLw0",
    authDomain: "site-strays.firebaseapp.com",
    projectId: "site-strays",
    storageBucket: "site-strays.firebasestorage.app",
    messagingSenderId: "1005872178248",
    appId: "1:1005872178248:web:36dfa929ab008a4415e47d",
    measurementId: "G-5FWVKCPRZY"
  };

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();



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
    initIntersectionObserver();
    initTeamModals();
    initPlayersPage(); // A função do Passo 2 (NOVA)
    initMatchWidget();
    initMatchHistory();
    initNewsSystem();
    initGalleryModal();
    initHighlightsButton();
    initLojaButton();
    initHeaderLogoVisibility();
    initLogoHoverEffect();
    initLogoHoverEffect2();
    initGalleryGridModal();
    initNumberCounters();
    initHeaderLogoVisibility2();
    initThemeToggle();
    initHeroSlider();       // Inicia o Slider do Hero
    initScrambleEffects();  // Inicia o efeito de letras do Widget
    initCalendarWidget(); // <--- ADICIONE ESTA LINHA
    initFullGallery(); // <--- ADICIONE ISSO
    

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

// Galeria de dados centralizada (AGORA COM SUPORTE A VÍDEOS)
const galleryData = [
    { src: 'media/Strays bg.mp4', alt: 'Logo da Line Feminina', caption: 'Logo da Line Feminina', type: 'video' },
    { src: 'img/camisa_time.png', alt: 'Camisa time', caption: 'Jersey do time', type: 'image' },
    { src: 'img/Strays jersey gif.gif', alt: 'Jersey animada', caption: 'Jersey da Strays in gif', type: 'image' },
    { src: 'img/Noticia Taisuke.png', alt: 'Lista dos melhores semanais', caption: 'Top 10 players, segunda semana', type: 'image' }
    // EXEMPO DE COMO ADICIONAR VÍDEOS:
    // { src: 'media/seu_video_aqui.mp4', alt: 'Descrição do vídeo', caption: 'Legenda do vídeo', type: 'video' },
    // { src: 'media/outro_video.mp4', alt: 'Outra descrição', caption: 'Outra legenda', type: 'video' }
];

// Gallery Carousel
function initGalleryCarousel() {
    const carouselContainer = document.querySelector('.carousel-container');
    const dotsContainer = document.querySelector('.carousel-dots');
    const thumbnailsContainer = document.querySelector('.gallery-thumbnails');
    const totalImagesSpan = document.querySelector('.total-images');

    if (!carouselContainer || !dotsContainer || !thumbnailsContainer || !totalImagesSpan) {
        console.error('Um ou mais elementos da galeria não foram encontrados.');
        return;
    }

    // Limpa o conteúdo existente para recriar dinamicamente
    carouselContainer.innerHTML = '';
    dotsContainer.innerHTML = '';
    thumbnailsContainer.innerHTML = '';
    totalImagesSpan.textContent = galleryData.length;

    // Cria os slides e os pontos (dots)
    galleryData.forEach((item, index) => {
        // Conteúdo do slide (imagem ou vídeo)
        let mediaContent = '';
        if (item.type === 'video') {
            mediaContent = `<video src="${item.src}" alt="${item.alt}" autoplay muted loop></video>`;
        } else {
            mediaContent = `<img src="${item.src}" alt="${item.alt}">`;
        }

        // Cria o slide principal
        const slide = document.createElement('div');
        slide.className = `carousel-slide${index === 0 ? ' active' : ''}`;
        slide.innerHTML = `
            ${mediaContent}
            <div class="slide-caption">
                <h3 class="caption-title text-glow">${item.caption}</h3>
                <div class="caption-actions">
                    <button class="btn-secondary">
                        <i class="fas fa-expand"></i>
                        Expandir
                    </button>
                </div>
            </div>
        `;
        carouselContainer.appendChild(slide);

        // Cria o ponto (dot) de navegação
        const dot = document.createElement('button');
        dot.className = `dot${index === 0 ? ' active' : ''}`;
        dot.dataset.slide = index;
        dotsContainer.appendChild(dot);
    });

    // Adiciona os botões de navegação e o contador
    carouselContainer.innerHTML += `
        <button class="carousel-nav prev-btn glass-effect" aria-label="Anterior">
            <i class="fas fa-chevron-left"></i>
        </button>
        <button class="carousel-nav next-btn glass-effect" aria-label="Próximo">
            <i class="fas fa-chevron-right"></i>
        </button>
        <div class="image-counter glass-effect">
            <span class="current-image">1</span> / <span class="total-images">${galleryData.length}</span>
        </div>
    `;

    // Cria as miniaturas (thumbnails)
    galleryData.forEach((item, index) => {
        let mediaContent = '';
        if (item.type === 'video') {
            mediaContent = `<video src="${item.src}" muted autoplay loop></video>`;
        } else {
            mediaContent = `<img src="${item.src}" alt="${item.alt}">`;
        }

        const thumbnail = document.createElement('div');
        thumbnail.className = `thumbnail glass-effect${index === 0 ? ' active' : ''}`;
        thumbnail.dataset.slide = index;
        thumbnail.innerHTML = `
            ${mediaContent}
            <div class="thumbnail-overlay">
                <i class="fas fa-play"></i>
            </div>
        `;
        thumbnailsContainer.appendChild(thumbnail);
    });

    // Pega as referências dos novos elementos criados
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    const thumbnails = document.querySelectorAll('.thumbnail');
    const prevBtnNew = document.querySelector('.carousel-container .prev-btn');
    const nextBtnNew = document.querySelector('.carousel-container .next-btn');
    const currentImageSpan = document.querySelector('.current-image');
    
    let currentSlide = 0;

    const updateCarousel = () => {
        slides.forEach((s, i) => s.classList.toggle('active', i === currentSlide));
        dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
        thumbnails.forEach((t, i) => t.classList.toggle('active', i === currentSlide));
        if (currentImageSpan) currentImageSpan.textContent = currentSlide + 1;

        // Pausa todos os vídeos e depois inicia o do slide ativo
        document.querySelectorAll('.carousel-slide video').forEach(video => {
            video.pause();
        });
        const activeVideo = document.querySelector('.carousel-slide.active video');
        if (activeVideo) {
            activeVideo.currentTime = 0; // Reinicia o vídeo
            activeVideo.play();
        }
    };

    const goToSlide = (index) => {
        currentSlide = index;
        updateCarousel();
    };

    prevBtnNew.addEventListener('click', () => goToSlide((currentSlide - 1 + galleryData.length) % galleryData.length));
    nextBtnNew.addEventListener('click', () => goToSlide((currentSlide + 1) % galleryData.length));

    dots.forEach((dot, index) => dot.addEventListener('click', () => goToSlide(index)));
    thumbnails.forEach((thumb, index) => thumb.addEventListener('click', () => goToSlide(index)));

    setInterval(() => nextBtnNew.click(), 5000);
    updateCarousel(); // Inicializa o carrossel
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

// Newsletter Form com Firebase Database
function initNewsletterForm() {
    const form = document.getElementById('newsletterForm');

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault(); // Impede a página de recarregar

            const input = this.querySelector('input[type="email"]');
            const button = this.querySelector('button');

            // Salva o texto original do botão para restaurar depois
            const originalText = button.innerHTML; 
            const emailValue = input.value;

            if (emailValue && button) {
                // 1. Muda o visual para "Carregando"
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
                button.disabled = true; // Impede cliques múltiplos

                // 2. Envia para o Banco de Dados (Coleção 'newsletter')
                db.collection("newsletter").add({
                    email: emailValue,
                    data_inscricao: new Date().toISOString(), // Salva a data/hora
                    origem: "Site Principal"
                })
                .then((docRef) => {
                    // --- SUCESSO ---
                    console.log("Email salvo com ID: ", docRef.id);

                    button.innerHTML = '<i class="fas fa-check"></i> Sucesso!';
                    button.style.background = 'linear-gradient(45deg, #10b981, #059669)';
                    input.value = ''; // Limpa o campo

                    // Volta o botão ao normal após 3 segundos
                    setTimeout(() => {
                        button.innerHTML = originalText;
                        button.style.background = '';
                        button.disabled = false;
                    }, 3000);
                })
                .catch((error) => {
                    // --- ERRO ---
                    console.error("Erro ao adicionar documento: ", error);

                    button.innerHTML = '<i class="fas fa-exclamation-circle"></i> Erro!';
                    button.style.background = '#ef4444'; // Vermelho

                    setTimeout(() => {
                        button.innerHTML = originalText;
                        button.style.background = '';
                        button.disabled = false;
                    }, 3000);
                });
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

    const interactiveElements = document.querySelectorAll('button, a, .player-card, .news-card, .sponsor-card, .store-banner');
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

    const animatedElements = document.querySelectorAll('.player-card, .news-card, .sponsor-card, .section-header, .store-banner');
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

// Team Modals and Data - VERSÃO: REDIRECIONAMENTO PARA PÁGINAS ESPECÍFICAS
function initTeamModals() {
    const teamCards = document.querySelectorAll('.player-card');

    const handleRedirect = (card) => {
        // Pega o tipo do time (ex: "feminina", "principal") do HTML
        const teamType = card.getAttribute('data-team');
        
        // Redireciona para players.html enviando o parâmetro "?line=..."
        window.location.href = `players.html?line=${teamType}`;
    };

    teamCards.forEach(card => {
        card.addEventListener('click', () => handleRedirect(card));
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleRedirect(card);
            }
        });
    });
}

// --- DADOS DAS LINES ---
// Aqui você edita, adiciona ou remove jogadores sem mexer no HTML

const teamBanners = {
    "principal": "img/lines/projeto site principal_Prancheta.svg",
    "mobile": "img/lines/projeto site mobile_Prancheta.svg",
    "Strays GC": "img/lines/projeto site GC_Prancheta.svg",    
    "Academy": "img/lines/projeto site academy_Prancheta.svg"
};

// Configuração de alinhamento da foto para cada line
// Valores: "top center", "center center", "bottom center" ou porcentagem "50% 20%"
const teamBannerPositions = {
    "principal": "75% 30%",      // Em pé: foca nos rostos lá em cima
    "mobile": "center center",      // Sentados: foca no meio (sofá)
    "Strays GC": "center center",      // Geralmente em pé
    "academy": "50% 25%"            // Um meio termo (testar)
};

const teamsDatabase = {
    "principal": [
        { nick: "Analu", age: "18 ANOS", nac: "Brasileira", role: "IGL", img: "img/Analustrays-Photoroom.png", insta: "#", x: "#" },
        { nick: "Mecci", age: "16 ANOS", nac: "Brasileira", role: "CONTROLLER", img: "img/Playerpreto.png", insta: "#", x: "#" },
        { nick: "Art", age: "16 ANOS", nac: "Brasileira", role: "DUELIST", img: "img/Playerpreto.png", insta: "#", x: "#" },
        { nick: "Youz", age: "16 ANOS", nac: "Brasileira", role: "CONTROLLER", img: "img/Playerpreto.png", insta: "#", x: "#" },
        { nick: "canezera", age: "16 ANOS", nac: "Brasileira", role: "DUELIST", img: "img/Playerpreto.png", insta: "#", x: "#" },
        { nick: "b1w", age: "17 ANOS", nac: "Brasileira", role: "COACH", img: "img/Playerpreto.png", insta: "#", x: "#" },
        { nick: "silverlive", age: "16 ANOS", nac: "Brasileira", role: "MANAGER", img: "img/Playerpreto.png", insta: "#", x: "#" },
        // Adicione mais jogadores aqui...
    ],
    "Strays GC": [
        { nick: "Rissa", age: "24 ANOS", nac: "Brasileira", role: "SENTINEL", img: "img/Playerpreto.png", insta: "https://instagram.com/...", x: "#" },
        { nick: "Rissa", age: "21 ANOS", nac: "Brasileira", role: "SENTINEL", img: "img/Playerpreto.png", insta: "#", x: "#" },
        { nick: "Rissa", age: "21 ANOS", nac: "Brasileira", role: "SENTINEL", img: "img/Playerpreto.png", insta: "#", x: "#" },
        { nick: "Rissa", age: "21 ANOS", nac: "Brasileira", role: "SENTINEL", img: "img/Playerpreto.png", insta: "#", x: "#" },
        { nick: "Rissa", age: "21 ANOS", nac: "Brasileira", role: "SENTINEL", img: "img/Playerpreto.png", insta: "#", x: "#" },
        // Adicione mais jogadores aqui...
    ],
    "mobile": [
        { nick: "iFix", age: "19 ANOS", nac: "Brasileira", role: "FLEX", img: "img/Playerpreto.png", insta: "#", x: "#" },
        { nick: "rikutaki", age: "19 ANOS", nac: "Brasileira", role: "CONTROLADOR", img: "img/Playerpreto.png", insta: "#", x: "#" },
        { nick: "zenn1", age: "19 ANOS", nac: "Brasileira", role: "IGL", img: "img/Playerpreto.png", insta: "#", x: "#" },
        { nick: "leans", age: "19 ANOS", nac: "Brasileira", role: "INICIADOR", img: "img/Playerpreto.png", insta: "#", x: "#" },
        { nick: "icezin", age: "19 ANOS", nac: "Brasileira", role: "SENTINELA", img: "img/Playerpreto.png", insta: "#", x: "#" },
        { nick: "vinizy", age: "19 ANOS", nac: "Brasileira", role: "DUELISTA", img: "img/Playerpreto.png", insta: "#", x: "#" },
        { nick: "Paty", age: "19 ANOS", nac: "Brasileira", role: "MANAGER", img: "img/Playerpreto.png", insta: "#", x: "#" },
    ],
    "academy": [
        { nick: "Juca", age: "17 ANOS", nac: "Brasileira", role: "FLEX", img: "img/Playerpreto.png", insta: "#", x: "#" },
        { nick: "GBK", age: "17 ANOS", nac: "Brasileira", role: "IGL", img: "img/Playerpreto.png", insta: "#", x: "#" },
        { nick: "Takeshi", age: "17 ANOS", nac: "Brasileira", role: "DUELISTA", img: "img/Playerpreto.png", insta: "#", x: "#" },
        { nick: "YUDI", age: "17 ANOS", nac: "Brasileira", role: "DUELISTA", img: "img/Playerpreto.png", insta: "#", x: "#" },
        { nick: "Novato", age: "17 ANOS", nac: "Brasileira", role: "DUELISTA", img: "img/Playerpreto.png", insta: "#", x: "#" },
    ]
};

// --- FUNÇÃO QUE CARREGA OS JOGADORES NA TELA (ATUALIZADA) ---
function initPlayersPage() {
    // Só roda se estivermos na página players.html e se existir o container
    const container = document.querySelector('.container-player');
    if (!container) return;

    // 1. Ler o parâmetro da URL
    const params = new URLSearchParams(window.location.search);
    const lineParam = params.get('line'); // Pega o que está na URL (ex: "batata")

    // --- NOVA LÓGICA DE VALIDAÇÃO ---
    // Verifica se o parâmetro está vazio OU se não existe no seu 'teamsDatabase'
    if (!lineParam || !teamsDatabase[lineParam]) {
        
        // A. Esconde o Banner do topo para não confundir o usuário
        const bannerSection = document.querySelector('.player-profile-banner');
        if (bannerSection) {
            bannerSection.style.display = 'none';
        }

        // B. Mostra a mensagem de erro bonita dentro do container
        // Usamos style inline aqui para centralizar e usar suas cores variáveis
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 100px 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh;">
                <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: var(--primary-gold); margin-bottom: 20px; animation: pulse-glow 2s infinite;"></i>
                <h2 class="text-glow" style="font-size: clamp(2rem, 5vw, 3rem); margin-bottom: 10px; color: var(--white);">LINE NÃO ENCONTRADA</h2>
                <p style="color: var(--text-secondary); font-size: 1.2rem; max-width: 600px;">
                    Desculpe, a line "<strong>${lineParam || 'Desconhecida'}</strong>" não consta em nossos registros.
                </p>
                <div style="margin-top: 30px;">
                    <p style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 15px;">Redirecionando para a base...</p>
                    <div class="store-image-container" style="width: 200px; height: 4px; background: var(--medium-gray); border-radius: 2px; overflow: hidden;">
                        <div style="width: 100%; height: 100%; background: var(--primary-gold); animation: slideInLeft 3s linear reverse;"></div>
                    </div>
                </div>
            </div>
        `;

        // C. Redireciona após 3 segundos (3000 milissegundos)
        setTimeout(() => {
            window.location.href = 'index.html#team';
        }, 3000);

        return; // IMPORTANTE: Para a execução aqui. Nada abaixo roda.
    }
    
    // Se passou da validação, a line existe!
    const lineName = lineParam;

   // 2. Configurar o BANNER (Imagem e Posição)
    const bannerImg = document.querySelector('.player-profile-banner img');
    if (bannerImg) {
        // Define a imagem
        const bannerSrc = teamBanners[lineName] || teamBanners['principal'];
        bannerImg.src = bannerSrc;

        // Define a POSIÇÃO (Foco) baseada na line
        // Se não tiver configuração específica, usa 'center center' como padrão
        const bannerPos = teamBannerPositions[lineName] || 'center center';
        bannerImg.style.objectPosition = bannerPos;
    }

    // Configurar o TÍTULO DO BANNER
    const bannerTitle = document.getElementById('lineTitle');
    if (bannerTitle) {
        bannerTitle.textContent = lineName.toUpperCase();
    }

    // 3. Selecionar os dados corretos da database
    const playersList = teamsDatabase[lineName];

    // 4. Limpar o container
    container.innerHTML = '';

    // 5. Criar o HTML para cada jogador
    playersList.forEach(player => {
        const playerHTML = `
            <div class="player-profile fade-in">
                <div class="player-info-profile">
                    <div class="player-nickname text-glow">${player.nick}</div>
                    <div class="details-section">
                        <div class="detail-item">
                            <span class="detail-label">Idade</span>
                            <span class="detail-value">${player.age}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Nacionalidade</span>
                            <span class="detail-value">${player.nac}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Role</span>
                            <span class="detail-value">${player.role}</span>
                        </div>
                    </div>
                </div>

                <div class="player-photo-container">
                    <img src="${player.img}" alt="Foto de ${player.nick}" class="player-photo">
                </div>

                <div class="player-social">
                    <a href="${player.insta}" target="_blank" class="social-link social-link-instagram glass-effect">
                        <i class="fab fa-instagram"></i>
                    </a>
                    <a href="${player.x}" target="_blank" class="social-link social-link-twitter glass-effect">
                        <i class="fab fa-twitter"></i>
                    </a>
                </div>
            </div>
        `;
        container.innerHTML += playerHTML;
    });
    
    // Atualiza o título da aba do navegador
    document.title = `STRAYS - ${lineName.toUpperCase()}`;
}   

// --- DADOS DAS PARTIDAS POR LINE ---
const matchesDatabase = {
    "principal": {
        hasMatch: true, // Se false, esconde o widget
        date: "21 NOV 2025 • 19:00",
        tourneyName: "VEXACUP: FINAL",
        tourneyLogo: "img/temp/Vexacup.png",
        map: "HAVEN",
        status: "FINALIZADO",
        home: { name: "Strays Principal", logo: "img/icone.png", score: "1" },
        away: { name: "Valoriza", logo: "img/temp/Valoriza.png", score: "3" }
    },
    "mobile": {
        hasMatch: false,
        date: "25 NOV 2025 • 20:00",
        tourneyName: "MOBILE LEGENDS CUP",
        tourneyLogo: "img/icone.png", // Coloque a logo do camp mobile
        map: "BERMUDA", // Exemplo
        status: "AO VIVO",
        home: { name: "Strays Mobile", logo: "img/icone.png", score: "2" },
        away: { name: "Fluxo", logo: "img/icone.png", score: "1" } // Exemplo
    },
    "academy": {
        hasMatch: false,
        date: "02 DEZ 2025 • 15:00",
        tourneyName: "ACADEMY SERIES",
        tourneyLogo: "img/icone.png",
        map: "ASCENT",
        status: "AGENDADO",
        home: { name: "Strays Academy", logo: "img/icone.png", score: "-" },
        away: { name: "Loud Academy", logo: "img/icone.png", score: "-" }
    },
    "Strays GC": {
        hasMatch: false, // Exemplo: Line GC não tem jogo marcado, o widget vai sumir
        date: "02 DEZ 2025 • 15:00",
        tourneyName: "ACADEMY SERIES",
        tourneyLogo: "img/icone.png",
        map: "ASCENT",
        status: "AGENDADO",
        home: { name: "Strays Academy", logo: "img/icone.png", score: "-" },
        away: { name: "Loud Academy", logo: "img/icone.png", score: "-" }
        
    }
};

// --- NOVO BANCO DE DADOS: HISTÓRICO ---
const historyDatabase = {
    "principal": [
        { date: "9 OUT", event: "VEXACUP FINAL", opponent: "Valoriza", logo: "img/temp/Valoriza.png", score: "1 - 3", result: "loss" },
        { date: "10 OUT", event: "VEXACUP Semifinal", opponent: "SERAPH", logo: "img/temp/Vexacup.png", score: "2 - 1", result: "win" },
        { date: "28 SET", event: "VEXACUP Quartas", opponent: "Rune", logo: "img/temp/Vexacup.png", score: "2 - 0", result: "win" },
        { date: "21 SET", event: "VEXACUP Oitavas", opponent: "GROW GAMING", logo: "img/temp/growgaming.png", score: "2 - 0", result: "win" }
    ],
    "mobile": [

    ],
    // Se a line não tiver histórico, o código vai lidar com isso
    "academy": [{ date: "20 NOV", event: "VEXACUP Oitavas", opponent: "Tribo", logo: "img/temp/Vexacup.png", score: "2 - 0", result: "win" },] 
};

// --- FUNÇÃO PARA INICIAR O HISTÓRICO ---
function initMatchHistory() {
    const listContainer = document.getElementById('matchHistoryList');
    if (!listContainer) return; // Se não tiver o container (ex: página inicial), sai.

    // 1. Pega a Line da URL
    const params = new URLSearchParams(window.location.search);
    const lineName = params.get('line') || 'principal';

    // 2. Pega os dados
    const history = historyDatabase[lineName];

    // 3. Limpa a lista atual
    listContainer.innerHTML = '';

    // 4. Se não tiver histórico
    if (!history || history.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align:center; padding: 20px; color: var(--text-secondary);">
                <i class="fas fa-ghost" style="font-size: 2rem; margin-bottom: 10px;"></i>
                <p>Nenhum histórico registrado para 2025.</p>
            </div>
        `;
        return;
    }

    // 5. Gera os itens
    history.forEach(match => {
        // Traduz o resultado para português na exibição
        const resultText = match.result === 'win' ? 'VITÓRIA' : (match.result === 'loss' ? 'DERROTA' : 'EMPATE');
        
        const html = `
            <div class="history-item ${match.result}">
                <div class="h-date">${match.date}</div>
                <div class="h-matchup">
                    <span style="font-size: 0.8rem; color: var(--primary-gold); margin-right:5px;">VS</span>
                    <img src="${match.logo}" alt="${match.opponent}">
                    <span>${match.opponent}</span>
                </div>
                <div class="h-score">${match.score}</div>
                <div class="h-result ${match.result}">${resultText}</div>
            </div>
        `;
        listContainer.innerHTML += html;
    });
}

// --- FUNÇÃO QUE ATUALIZA O WIDGET DE PARTIDA ---
function initMatchWidget() {
    // 1. Verifica se estamos na página correta e se o widget existe
    const widget = document.getElementById('matchWidgetContainer');
    if (!widget) return;

    // 2. Pega a line da URL (igual fazemos com os jogadores)
    const params = new URLSearchParams(window.location.search);
    const lineName = params.get('line') || 'principal';

    // 3. Busca os dados na matchesDatabase
    // Se não achar a line específica, tenta pegar a 'principal', ou retorna nulo
    const matchData = matchesDatabase[lineName] || matchesDatabase['principal'];

    // 4. Se não tiver dados ou "hasMatch" for false, esconde o widget e sai
    if (!matchData || matchData.hasMatch === false) {
        widget.style.display = 'none';
        return;
    }

    // Garante que o widget esteja visível
    widget.style.display = 'block';

    // 5. Preenche o HTML com os dados do JavaScript
    document.getElementById('match-date').textContent = matchData.date;
    
    // Atualiza nome do torneio (e o data-text pro efeito scramble)
    const tourneyNameEl = document.getElementById('match-tourney-name');
    tourneyNameEl.textContent = matchData.tourneyName;
    tourneyNameEl.setAttribute('data-text', matchData.tourneyName);
    
    document.getElementById('match-tourney-logo').src = matchData.tourneyLogo;
    document.getElementById('match-map').textContent = matchData.map;
    document.getElementById('match-status').textContent = matchData.status;

    // Time da Casa
    document.getElementById('match-team-home-name').textContent = matchData.home.name;
    document.getElementById('match-team-home-logo').src = matchData.home.logo;
    document.getElementById('match-score-home').textContent = matchData.home.score;

    // Time Visitante
    document.getElementById('match-team-away-name').textContent = matchData.away.name;
    document.getElementById('match-team-away-logo').src = matchData.away.logo;
    document.getElementById('match-score-away').textContent = matchData.away.score;

    // Cores do Status (Lógica simplificada)
    const statusEl = document.getElementById('match-status');
    
    // Remove a classe 'live-active' e 'pulse-dot' antiga para limpar o estado anterior
    statusEl.classList.remove('live-active', 'pulse-dot');
    
    // Reseta estilos manuais caso tenham sobrado
    statusEl.style.color = "";
    statusEl.style.background = "";

    if (matchData.status === "AO VIVO") {
        // Adiciona a nossa nova classe que cuida de tudo (cor, fundo e bolinha)
        statusEl.classList.add('live-active');
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

// Logo Visibility on scroll
function initHeaderLogoVisibility2() {
    const logo = document.getElementById('headerLogo');
    const teamSection = document.getElementById('campeonato');
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

// Loja Button
function initLojaButton() {
    const LojaBtn = document.getElementById('LojaBtn');
    if (LojaBtn) {
        LojaBtn.addEventListener('click', function() {
            window.open('https://minidrop.com.br/loja/times/', '_blank');
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

function initLogoHoverEffect() {
    const headerLogo = document.getElementById('headerLogo');
    // Salva o caminho da imagem original para poder voltar depois
    const originalSrc = headerLogo.src;
    // Defina o caminho para o seu arquivo GIF aqui
    const gifSrc = 'img/straysgifnopng3.gif';

    if (headerLogo) {
        headerLogo.addEventListener('mouseenter', () => {
            headerLogo.src = gifSrc;
        });

        headerLogo.addEventListener('mouseleave', () => {
            headerLogo.src = originalSrc;
        });
    }
}

function initLogoHoverEffect2() {
    const headerLogo = document.getElementById('headerLogo2');
    // Salva o caminho da imagem original para poder voltar depois
    const originalSrc = headerLogo.src;
    // Defina o caminho para o seu arquivo GIF aqui
    const gifSrc = 'img/straysgifnopng3.gif';

    if (headerLogo) {
        headerLogo.addEventListener('mouseenter', () => {
            headerLogo.src = gifSrc;
        });

        headerLogo.addEventListener('mouseleave', () => {
            headerLogo.src = originalSrc;
        });
    }
}

// Gallery Modal
function initGalleryModal() {
    const galleryModal = document.getElementById('galleryModal');
    const galleryModalBody = document.getElementById('gallery-modal-body');
    const closeGalleryModalBtn = galleryModal ? galleryModal.querySelector('.close-button') : null;

    function openGalleryModal() {
        const activeSlide = document.querySelector('.gallery-carousel .carousel-slide.active');
        const slideIndex = Array.from(document.querySelectorAll('.carousel-slide')).indexOf(activeSlide);
        const item = galleryData[slideIndex];

        if (item && galleryModal && galleryModalBody) {
            let mediaContent = '';
            if (item.type === 'video') {
                mediaContent = `<video src="${item.src}" controls autoplay style="max-width:100%; max-height:70vh; border-radius:12px;"></video>`;
            } else {
                mediaContent = `<img src="${item.src}" alt="${item.alt}" style="max-width:100%;max-height:70vh;border-radius:12px;">`;
            }

            galleryModalBody.innerHTML = mediaContent;
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

function initGalleryGridModal() {
    const gridModal = document.getElementById('galleryGridModal');
    const gridBody = document.getElementById('gallery-grid-body');
    const closeBtn = gridModal ? gridModal.querySelector('.close-button') : null;

    const openGridBtn = document.querySelector('.gallery-actions .btn-premium');
    if (openGridBtn && gridModal && gridBody) {
        openGridBtn.addEventListener('click', function() {
            gridBody.innerHTML = galleryData.map(item => {
                let mediaElement = '';
                if (item.type === 'video') {
                    mediaElement = `<video src="${item.src}" muted style="width:100%; height:100%; object-fit:cover;"></video>`;
                } else {
                    mediaElement = `<img src="${item.src}" alt="${item.alt}" style="width:100%; height:100%; object-fit:cover;">`;
                }
                return `
                    <div class="gallery-thumb-grid-wrapper" style="width:180px; height:120px; border-radius:8px; overflow:hidden; cursor:pointer; transition:transform .2s;">
                        ${mediaElement}
                    </div>
                `;
            }).join('');
            gridModal.classList.add('is-visible');
            document.body.style.overflow = 'hidden';
        });

        gridBody.addEventListener('click', function(e) {
            if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
                const galleryModal = document.getElementById('galleryModal');
                const galleryModalBody = document.getElementById('gallery-modal-body');
                if (galleryModal && galleryModalBody) {
                    const src = e.target.src;
                    const alt = e.target.alt;
                    
                    gridModal.classList.remove('is-visible');

                    let modalContent = '';
                    if (e.target.tagName === 'VIDEO') {
                        modalContent = `<video src="${src}" controls autoplay style="max-width:100%; max-height:70vh; border-radius:12px;"></video>`;
                    } else {
                        modalContent = `<img src="${src}" alt="${alt}" style="max-width:100%; max-height:70vh; border-radius:12px;">`;
                    }
                    
                    galleryModalBody.innerHTML = modalContent;
                    
                    galleryModal.classList.add('is-visible');
                    document.body.style.overflow = 'hidden';
                }
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            gridModal.classList.remove('is-visible');
            document.body.style.overflow = '';
        });
    }
    if (gridModal) {
        gridModal.addEventListener('click', function(event) {
            if (event.target === gridModal) {
                gridModal.classList.remove('is-visible');
                document.body.style.overflow = '';
            }
        });
    }
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape" && gridModal && gridModal.classList.contains('is-visible')) {
            gridModal.classList.remove('is-visible');
            document.body.style.overflow = '';
        }
    });
}

// Função para iniciar a animação dos contadores numéricos
function initNumberCounters() {
    const counters = document.querySelectorAll('.summary-value');
    const speed = 300;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = +counter.getAttribute('data-target');
                const isDecimal = target.toString().length > 5;

                const animate = () => {
                    const count = +counter.innerText.replace('.', '');
                    const increment = target / speed;

                    if (count < target) {
                        const newCount = Math.ceil(count + increment);
                        if (isDecimal) {
                            counter.innerText = (newCount / 100).toFixed(2);
                        } else {
                            counter.innerText = newCount;
                        }
                        setTimeout(animate, 10);
                    } else {
                        if (isDecimal) {
                            counter.innerText = (target / 100).toFixed(2);
                        } else {
                            counter.innerText = target;
                        }
                    }
                };

                animate();
                observer.unobserve(counter); // Para a animação após a primeira vez
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    });

    counters.forEach(counter => {
        observer.observe(counter);
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

window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    
    // Define o tempo mínimo em milissegundos (2000ms = 2 segundos)
    const tempoMinimo = 2000; 

    // Calcula o tempo que precisamos esperar (código da resposta anterior)
    const tempoFinalCarregamento = Date.now();
    const tempoInicial = performance.timing.navigationStart;
    const tempoDecorrido = tempoFinalCarregamento - tempoInicial;
    let tempoExtra = tempoMinimo - tempoDecorrido;

    if (tempoExtra < 0) {
        tempoExtra = 0;
    }

    // Espera pelo tempo restante (tempoExtra)
    setTimeout(function() {
        // 1. ADICIONA A CLASSE 'slide-out' para iniciar o efeito CSS de deslizar
        preloader.classList.add('slide-out');
        
        // 2. Espera o efeito de transição terminar (0.5s, conforme definido no CSS)
        setTimeout(function() {
            preloader.style.display = 'none'; // Remove após o slide-out
        }, 500); // 500ms é o tempo da nossa transição no CSS
        
    }, tempoExtra); 
});

// Adicione esta nova função de inicialização para carregar o tema
function initThemeToggle() {
    const button = document.getElementById("theme-toggle");
    if (!button) return; // Sai se o botão não for encontrado

    // REMOVIDO: const themeText = document.getElementById("theme-text");
    const moonIcon = document.getElementById("moon-icon");
    const sunIcon = document.getElementById("sun-icon");

    const isLightMode = localStorage.getItem('theme') === 'light';

    const updateUI = (isLight) => {
        if (isLight) {
            document.body.classList.add("light-mode");
            if (moonIcon) moonIcon.style.display = 'none';
            if (sunIcon) sunIcon.style.display = 'inline-block';
        } else {
            document.body.classList.remove("light-mode");
            if (moonIcon) moonIcon.style.display = 'inline-block';
            if (sunIcon) sunIcon.style.display = 'none';
        }
    };

    // 1. Aplica o tema salvo ao carregar
    updateUI(isLightMode);

    // 2. Adiciona o listener para alternar
    button.addEventListener("click", () => {
        const isCurrentlyLight = document.body.classList.toggle("light-mode");
        
        if (isCurrentlyLight) {
            localStorage.setItem('theme', 'light');
        } else {
            localStorage.setItem('theme', 'dark');
        }
        updateUI(isCurrentlyLight);
    });
}

 const config = {
            // Tempo que cada imagem fica na tela (em milissegundos). 3000 = 3 segundos.
            slideInterval: 4000, 
            
            // Tempo que demora a transição de fade (em segundos). Ex: '1s', '1.5s', '0.5s'
            transitionDuration: '1.2s',
            
            // Lista de Imagens (Substitua pelas URLs das suas fotos de Jersey)
            images: [
                {
                    src: "img/straysft1.png",
                    alt: "Jersey de Futebol Close-up"
                },
                {
                    src: "img/straysft2.png",
                    alt: "Time reunido com uniformes"
                },
                {
                    src: "img/straysft3.jpeg",
                    alt: "Jersey Dobrada Detalhe"
                },
                {
                    src: "img/straysft4.png",
                    alt: "Jersey Esportiva em Ação"
                }
            ]
        };

        // --- LÓGICA DO SLIDESHOW ---
        document.addEventListener('DOMContentLoaded', () => {
            const container = document.getElementById('slides-container');
            const indicatorsContainer = document.getElementById('indicators-container');
            let currentIndex = 0;
            let slides = [];
            let indicators = [];

            // 1. Inicializar as imagens e indicadores
            config.images.forEach((imgData, index) => {
                // Criar Imagem
                const imgElement = document.createElement('img');
                imgElement.src = imgData.src;
                imgElement.alt = imgData.alt;
                imgElement.classList.add('slide-image');
                imgElement.style.transitionDuration = config.transitionDuration; // Aplica o tempo de transição
                
                if (index === 0) imgElement.classList.add('active'); // A primeira começa visível
                
                container.appendChild(imgElement);
                slides.push(imgElement);

                // Criar Indicador (Bolinha)
                const dot = document.createElement('button');
                dot.className = `w-3 h-3 rounded-full transition-all duration-300 ${index === 0 ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}`;
                dot.ariaLabel = `Ir para slide ${index + 1}`;
                
                // Clique na bolinha para mudar manualmente (opcional)
                dot.addEventListener('click', () => {
                    resetTimer();
                    changeSlide(index);
                });

                indicatorsContainer.appendChild(dot);
                indicators.push(dot);
            });

            // 2. Função para mudar o slide
            const changeSlide = (nextIndex) => {
                // Remove classe ativa do atual
                slides[currentIndex].classList.remove('active');
                indicators[currentIndex].classList.remove('bg-white', 'scale-125');
                indicators[currentIndex].classList.add('bg-white/40');

                // Atualiza índice
                currentIndex = nextIndex;

                // Se passar do total, volta para 0
                if (currentIndex >= slides.length) currentIndex = 0;
                // Se for menor que 0 (caso implemente botão voltar), vai para o último
                if (currentIndex < 0) currentIndex = slides.length - 1;

                // Adiciona classe ativa no novo
                slides[currentIndex].classList.add('active');
                indicators[currentIndex].classList.remove('bg-white/40');
                indicators[currentIndex].classList.add('bg-white', 'scale-125');
            };

            // 3. Configurar o Loop Infinito
            let slideTimer = setInterval(() => {
                changeSlide(currentIndex + 1);
            }, config.slideInterval);

            // Função para reiniciar o timer se o usuário interagir (clicar nas bolinhas)
            const resetTimer = () => {
                clearInterval(slideTimer);
                slideTimer = setInterval(() => {
                    changeSlide(currentIndex + 1);
                }, config.slideInterval);
            };
        });


        // --- SISTEMA DE GALERIA COMPLETA (PÁGINA DEDICADA) ---

// 1. O Banco de Dados da Galeria (Pode ter quantos itens quiser)
const fullGalleryDatabase = [
    // Seus 6 primeiros (Exemplo misturando foto e vídeo)
    { type: 'image', src: 'img/Chamada Strays para todas as Lines.png', caption: 'Strays chamada' },
    { type: 'video', src: 'media/Strays bg.mp4', caption: 'Strays background' },
    { type: 'image', src: 'img/icone.png', caption: 'Icone Strays' },
    { type: 'image', src: 'img/Logo Strays.png', caption: 'Strays Icon gif' },
    { type: 'video', src: 'media/Strayspreloader.mp4', caption: 'Strayspreloadr' },
    { type: 'image', src: 'img/okay.png', caption: 'Raze' },

    // Os próximos que vão aparecer quando clicar em "Ver Mais"
    { type: 'image', src: 'img/foto5.jpg', caption: 'MVP da Partida' },
    { type: 'image', src: 'img/foto6.jpg', caption: 'Setup Gaming' },
    { type: 'video', src: 'media/clip3.mp4', caption: 'Highlights' },
    { type: 'image', src: 'img/foto7.jpg', caption: 'Treino Tático' },
    { type: 'image', src: 'img/foto8.jpg', caption: 'Media Day' },
    { type: 'image', src: 'img/foto9.jpg', caption: 'Uniforme Novo' },
    
    // Adicione mais itens aqui...
];

let itemsShown = 0;
const itemsPerPage = 6; // Quantos aparecem por vez

function initFullGallery() {
    const grid = document.getElementById('gallery-grid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    // Se não estiver na página de galeria, para a função
    if (!grid || !loadMoreBtn) return;

    // Função interna para renderizar itens
    function loadItems() {
        const total = fullGalleryDatabase.length;
        const end = itemsShown + itemsPerPage;
        
        // Pega o pedaço do array que queremos mostrar agora
        const itemsToLoad = fullGalleryDatabase.slice(itemsShown, end);

        itemsToLoad.forEach(item => {
            const el = document.createElement('div');
            el.className = 'gallery-item-rect fade-in'; // Adiciona animação
            
            // Verifica se é imagem ou vídeo para criar a tag certa
            let mediaTag = '';
            let iconClass = '';
            
            if (item.type === 'video') {
                mediaTag = `<video src="${item.src}" muted loop onmouseover="this.play()" onmouseout="this.pause()"></video>`;
                iconClass = 'fa-play-circle';
            } else {
                mediaTag = `<img src="${item.src}" alt="${item.caption}">`;
                iconClass = 'fa-camera';
            }

            el.innerHTML = `
                ${mediaTag}
                <div class="item-overlay">
                    <span class="item-caption text-glow">${item.caption}</span>
                    <i class="fas ${iconClass} item-icon"></i>
                </div>
            `;

            // Adiciona evento de clique para abrir o Lightbox (Modal de visualização)
            el.addEventListener('click', () => openLightbox(item));

            grid.appendChild(el);
        });

        itemsShown += itemsPerPage;

        // Se mostrou tudo, esconde o botão "Ver Mais"
        if (itemsShown >= total) {
            loadMoreBtn.style.display = 'none';
        }
    }

    // Carrega os primeiros 6 logo de cara
    loadItems();

    // Evento do botão
    loadMoreBtn.addEventListener('click', loadItems);
}

// Função Auxiliar para abrir a foto grande (Lightbox)
function openLightbox(item) {
    const modal = document.getElementById('lightboxModal');
    const body = document.getElementById('lightbox-body');
    const closeBtn = modal.querySelector('.close-button');

    if (!modal) return;

    let content = '';
    if (item.type === 'video') {
        content = `<video src="${item.src}" controls autoplay style="max-width:90%; max-height:80vh; border-radius:8px; box-shadow:0 0 20px rgba(255,215,0,0.2);"></video>`;
    } else {
        content = `<img src="${item.src}" style="max-width:90%; max-height:80vh; border-radius:8px; box-shadow:0 0 20px rgba(255,215,0,0.2);">`;
    }

    body.innerHTML = content;
    modal.classList.add('is-visible');

    // Fechar
    closeBtn.onclick = () => modal.classList.remove('is-visible');
    modal.onclick = (e) => {
        if(e.target === modal) modal.classList.remove('is-visible');
    }
}

        /* --- NOVAS FUNCIONALIDADES (SLIDER & WIDGET) --- */

// 1. Configuração e Inicialização do Hero Slider
function initHeroSlider() {
    const container = document.getElementById('slides-container');
    const indicatorsContainer = document.getElementById('indicators-container');
    
    // Se não achar o container (ex: página players.html), para a função
    if (!container || !indicatorsContainer) return;

    const config = {
        slideInterval: 4000, 
        transitionDuration: '1.2s',
        images: [
            { src: "img/straysft1.png", alt: "Jersey de Futebol Close-up" },
            { src: "img/straysft2.png", alt: "Time reunido com uniformes" },
            { src: "img/straysft3.jpeg", alt: "Jersey Dobrada Detalhe" },
            { src: "img/straysft4.png", alt: "Jersey Esportiva em Ação" }
        ]
    };

    let currentIndex = 0;
    let slides = [];
    let indicators = [];

    // Limpa containers antes de criar
    container.innerHTML = '';
    indicatorsContainer.innerHTML = '';

    // Cria as imagens e indicadores
    config.images.forEach((imgData, index) => {
        // Imagem
        const imgElement = document.createElement('img');
        imgElement.src = imgData.src;
        imgElement.alt = imgData.alt;
        imgElement.className = 'slide-image';
        if (index === 0) imgElement.classList.add('active');
        container.appendChild(imgElement);
        slides.push(imgElement);

        // Indicador (Bolinha)
        const dot = document.createElement('button');
        // Usando classes do seu CSS ou inline styles para garantir
        dot.style.cssText = `
            width: 12px; height: 12px; border-radius: 50%; border: none;
            background: ${index === 0 ? 'var(--white)' : 'rgba(255,255,255,0.4)'};
            transition: all 0.3s ease; cursor: pointer;
        `;
        dot.addEventListener('click', () => {
            resetTimer();
            changeSlide(index);
        });
        indicatorsContainer.appendChild(dot);
        indicators.push(dot);
    });

    const changeSlide = (nextIndex) => {
        // Remove ativo atual
        slides[currentIndex].classList.remove('active');
        indicators[currentIndex].style.background = 'rgba(255,255,255,0.4)';
        indicators[currentIndex].style.transform = 'scale(1)';

        // Calcula novo índice
        currentIndex = nextIndex;
        if (currentIndex >= slides.length) currentIndex = 0;

        // Ativa novo
        slides[currentIndex].classList.add('active');
        indicators[currentIndex].style.background = 'var(--white)';
        indicators[currentIndex].style.transform = 'scale(1.2)';
    };

    let slideTimer = setInterval(() => changeSlide(currentIndex + 1), config.slideInterval);

    const resetTimer = () => {
        clearInterval(slideTimer);
        slideTimer = setInterval(() => changeSlide(currentIndex + 1), config.slideInterval);
    };
}

// 2. Lógica do Efeito Scramble (Letras Rolando)
class ScrambleText {
    constructor(el) {
        this.el = el;
        this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
        this.targetText = el.getAttribute('data-text');
        this.delay = parseInt(el.getAttribute('data-delay') || 0);
        this.duration = 2000;
        this.frame = 0;
        this.queue = [];
        this.timer = null;
        this.init();
    }
    init() {
        const totalFrames = this.duration / 50;
        for (let i = 0; i < this.targetText.length; i++) {
            const char = this.targetText[i];
            this.queue.push({
                from: this.chars[Math.floor(Math.random() * this.chars.length)],
                to: char,
                start: Math.floor(Math.random() * (totalFrames - 10)),
                end: totalFrames
            });
        }
        setTimeout(() => {
            this.timer = setInterval(() => this.update(), 50);
        }, this.delay);
    }
    update() {
        let output = '';
        let complete = 0;
        for (let i = 0; i < this.queue.length; i++) {
            let { from, to, start, end } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!to || to === ' ') output += ' ';
                else output += this.chars[Math.floor(Math.random() * this.chars.length)];
            } else {
                output += from;
            }
        }
        this.el.innerText = output;
        if (complete === this.queue.length) clearInterval(this.timer);
        else this.frame++;
    }
}

function initScrambleEffects() {
    document.querySelectorAll('.scramble-text').forEach(el => {
        new ScrambleText(el);
    });
}

function initCalendarWidget() {
    const menu = document.getElementById('calendarMenu');
    const trigger = document.getElementById('calendarTrigger');

    if (!menu || !trigger) return;

    let isOpen = false;

    // Clique no botão do calendário
    trigger.addEventListener('click', (e) => {
        e.stopPropagation(); // Impede que o clique feche o menu imediatamente
        isOpen = !isOpen;
        if (isOpen) {
            menu.classList.add('open');
        } else {
            menu.classList.remove('open');
        }
    });

    // Fechar se clicar fora
    document.addEventListener('click', (e) => {
        if (isOpen && !menu.contains(e.target) && !trigger.contains(e.target)) {
            isOpen = false;
            menu.classList.remove('open');
        }
    });
}

document.addEventListener('DOMContentLoaded', initAll);