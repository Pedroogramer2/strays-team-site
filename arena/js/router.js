// js/router.js
import { renderHomePage } from './pages/home.js';
import { renderPlayersPage, renderPlayerDetailPage } from './pages/players.js';
import { renderTeamsPage, renderTeamDetailPage } from './pages/teams.js'; 
import { renderTournamentsList, renderTournamentPro } from './pages/tournaments.js';

export function navigateToPage(page) {
    // Se a página não for informada, não faz nada
    if (!page) return;

    // Atualiza menu ativo
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) item.classList.add('active');
        // Mantém ativo se for sub-página
        if (page.startsWith('team-detail') && item.dataset.page === 'times') item.classList.add('active');
        if (page.startsWith('campeonato') && item.dataset.page === 'campeonatos') item.classList.add('active');
    });

    const content = document.getElementById('page-content');
    
    // Se não existir a área de conteúdo (ex: estamos no perfil.html), redireciona para a home
    if (!content) {
        window.location.href = `index.html#${page}`;
        return;
    }
    
    // Roteamento
    if (page === 'home') content.innerHTML = renderHomePage();
    else if (page === 'players') renderPlayersPage();
    else if (page === 'times') renderTeamsPage();
    else if (page === 'campeonatos') renderTournamentsList();
    
    // Rotas Dinâmicas
    else if (page.startsWith('campeonato-')) {
        const tId = page.replace('campeonato-', '');
        renderTournamentPro(tId);
    }
    else if (page.startsWith('team-detail-')) {
        const tId = page.replace('team-detail-', '');
        renderTeamDetailPage(tId);
    }
    else if (page.startsWith('player-detail-')) {
        const pId = page.replace('player-detail-', '');
        const html = renderPlayerDetailPage(pId);
        if(html) content.innerHTML = html;
    }
    
    // Admin direto via URL #admin
    else if (page === 'admin') {
        import('./pages/tournaments.js').then(module => {
            if(module.openAdminPanel) module.openAdminPanel();
        });
    }

    if(window.lucide) lucide.createIcons();
}

export function setupNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        // CORREÇÃO CRÍTICA:
        // Só intercepta o clique se o botão tiver o atributo 'data-page'.
        // Se for um link comum (como no perfil.html), deixa o navegador seguir o href.
        if (item.dataset.page) {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                navigateToPage(page);
            });
        }
    });

    // Lê a URL inicial apenas se estivermos na index (que tem page-content)
    if (document.getElementById('page-content')) {
        const hash = window.location.hash.replace('#', '');
        if (hash) navigateToPage(hash);
        else navigateToPage('home');
    }
}