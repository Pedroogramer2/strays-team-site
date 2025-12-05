document.addEventListener('DOMContentLoaded', () => {
    // --- CORREÇÃO: LIMPEZA INICIAL ---
    // Verifica se já existem botões ou overlays antigos e remove para não duplicar
    const existingBtn = document.querySelector('.sidebar-toggle');
    if (existingBtn) existingBtn.remove();
    
    const existingOverlay = document.querySelector('.sidebar-overlay');
    if (existingOverlay) existingOverlay.remove();
    // ----------------------------------

    // Cria o botão do zero
    const toggleButton = document.createElement('button');
    toggleButton.className = 'sidebar-toggle';
    // Ícone inicial (Seta para esquerda/X pois a sidebar começa aberta)
    toggleButton.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    `;
    
    // Cria o overlay para mobile
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    
    // Adiciona ao corpo da página
    document.body.appendChild(toggleButton);
    document.body.appendChild(overlay);
    
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    // Função de Alternar
    function toggleSidebar() {
        sidebar.classList.toggle('hidden');
        mainContent.classList.toggle('expanded');
        toggleButton.classList.toggle('sidebar-hidden');
        
        // Atualiza o ícone
        if (sidebar.classList.contains('hidden')) {
            // Sidebar escondida -> Mostra Hamburger
            toggleButton.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            `;
        } else {
            // Sidebar visível -> Mostra X
            toggleButton.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            `;
        }
        
        // Overlay Mobile
        if (window.innerWidth <= 768) {
            overlay.classList.toggle('active');
        }
    }
    
    // Eventos de Clique
    toggleButton.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);
    
    // Fecha sidebar no mobile ao clicar em um item
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768 && !sidebar.classList.contains('hidden')) {
                toggleSidebar();
            }
        });
    });
    
    // Ajuste ao redimensionar a tela
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 768) {
                overlay.classList.remove('active');
            }
        }, 250);
    });
});