// js/topbar.js
import { state } from './state.js';

// Função principal que desenha a barra
export function renderTopBar() {
    const container = document.getElementById('top-bar-container');
    if (!container) return;

    container.innerHTML = '';

    // ATUALIZADO: strays_user
    const userJson = localStorage.getItem('strays_user');
    const user = userJson ? JSON.parse(userJson) : null;

    // 1. Busca Time
    let myTeamHtml = '';
    if (user) {
        // ATUALIZADO: strays_teams_db
        const localTeams = JSON.parse(localStorage.getItem('strays_teams_db') || '[]');
        
        const myTeam = localTeams.find(t => 
            (t.ownerId === user.uid) || 
            (t.roster && t.roster.some(m => m.uid === user.uid))
        );

        if (myTeam) {
            myTeamHtml = `
                <a href="index.html#team-detail-${myTeam.id}" onclick="setTimeout(() => location.reload(), 100)" class="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors group">
                    <div class="w-5 h-5 rounded-full overflow-hidden border border-gray-600 group-hover:border-yellow-500">
                        <img src="${myTeam.logo}" class="w-full h-full object-cover">
                    </div>
                    <span class="font-bold text-yellow-500">Meu Time</span>
                </a>
            `;
        }
    }

    // 2. Link Admin
    let adminLinkHtml = '';
    if (user && (user.role === 'admin' || user.role === 'staff')) {
        adminLinkHtml = `
            <div class="h-[1px] bg-gray-800 mx-2 my-1"></div>
            <a href="index.html#admin" onclick="window.navigateToPage('admin')" class="flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors font-bold">
                <i data-lucide="shield-alert" class="w-4 h-4"></i> Painel Admin
            </a>
        `;
    }

    // 3. Renderiza HTML
    let htmlContent = '';

    if (user) {
        const avatarUrl = user.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`;
        
        htmlContent = `
            <div id="user-actions" class="user-logged-area flex items-center gap-6 animate-fadeIn">
                <div class="notification-btn relative cursor-pointer group" onclick="toggleNotificationDropdown()">
                    <i data-lucide="bell" class="w-5 h-5 text-gray-400 group-hover:text-white transition-colors"></i>
                    <div class="notif-dot hidden absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full border-2 border-[#0f1116]"></div>
                    
                    <div id="notification-dropdown" class="notification-dropdown">
                        <div class="notif-header">
                            <h3>Notificações</h3>
                            <span class="notif-clear" onclick="NotificationSystem.clearAll()">Limpar tudo</span>
                        </div>
                        <div id="notification-list" class="notif-list"></div>
                    </div>
                </div>

                <div class="user-profile-widget flex items-center gap-3 bg-[#15171e] border border-gray-800 rounded-full pr-4 pl-1 py-1 cursor-pointer hover:border-gray-600 transition-all relative" onclick="toggleUserMenu(event)">
                    <div class="w-8 h-8 rounded-full overflow-hidden bg-indigo-600">
                        <img src="${avatarUrl}" class="w-full h-full object-cover">
                    </div>
                    <div class="flex flex-col leading-none">
                        <span class="text-xs font-bold text-white">${user.nick || user.name.split(' ')[0]}</span>
                        <span class="text-[10px] text-gray-500">Online</span>
                    </div>
                    <i data-lucide="chevron-down" class="w-3 h-3 text-gray-500 ml-1"></i>

                    <div id="user-dropdown" class="hidden absolute top-12 right-0 w-56 bg-[#1c1f26] border border-gray-800 rounded-xl shadow-xl flex-col overflow-hidden z-50">
                        <div class="p-3 border-b border-gray-800 bg-[#15171e]">
                            <span class="text-xs text-gray-500 font-bold uppercase block mb-1">Minha Conta</span>
                            <div class="text-white font-bold text-sm truncate">${user.name}</div>
                        </div>
                        
                        <a href="perfil.html" class="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                            <i data-lucide="user" class="w-4 h-4"></i> Meu Perfil
                        </a>
                        
                        <a href="editar-perfil.html" class="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                            <i data-lucide="settings" class="w-4 h-4"></i> Editar Perfil
                        </a>

                        ${myTeamHtml}
                        
                        ${adminLinkHtml} <div class="h-[1px] bg-gray-800 mx-2 my-1"></div>
                        <a href="#" onclick="handleLogout()" class="flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors">
                            <i data-lucide="log-out" class="w-4 h-4"></i> Sair
                        </a>
                    </div>
                </div>
            </div>
        `;
    } else {
        htmlContent = `
            <div id="guest-actions" class="auth-buttons flex gap-3 animate-fadeIn">
                <button onclick="window.location.href='login.html'" class="px-6 py-2 border border-gray-700 text-gray-300 rounded-lg text-xs font-bold hover:border-white hover:text-white transition-all">ENTRAR</button>
                <button onclick="window.location.href='cadastro.html'" class="px-6 py-2 bg-yellow-500 text-black rounded-lg text-xs font-bold hover:bg-yellow-400 transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)]">CADASTRAR</button>
            </div>
        `;
    }

    container.innerHTML = htmlContent;
}

// Funções globais de Toggle
window.toggleUserMenu = function(event) {
    event.stopPropagation();
    const menu = document.getElementById('user-dropdown');
    const notifMenu = document.getElementById('notification-dropdown');
    if (menu) { menu.classList.toggle('hidden'); menu.classList.toggle('flex'); }
    if (notifMenu) notifMenu.classList.remove('show');
}

window.toggleNotificationDropdown = function() {
    const menu = document.getElementById('notification-dropdown');
    const userMenu = document.getElementById('user-dropdown');
    if (menu) menu.classList.toggle('show');
    if (userMenu) { userMenu.classList.add('hidden'); userMenu.classList.remove('flex'); }
}

// Fecha menus ao clicar fora
window.onclick = function(event) {
    if (!event.target.closest('.user-profile-widget') && !event.target.closest('.notification-btn')) {
        const userMenu = document.getElementById('user-dropdown');
        const notifMenu = document.getElementById('notification-dropdown');
        if (userMenu) { userMenu.classList.add('hidden'); userMenu.classList.remove('flex'); }
        if (notifMenu) notifMenu.classList.remove('show');
    }
}