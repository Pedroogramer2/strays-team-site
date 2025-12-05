// js/pages/teams.js
import { TEAMS_LIST_DB, ROLES_IMG } from '../database.js';
import { state } from '../state.js';

// --- VARIÁVEIS GLOBAIS ---
let selectedLogoFile = null;
let selectedBannerFile = null;

// =========================================
// 0. FUNÇÕES GLOBAIS DE SISTEMA (IMPORTANTE)
// =========================================

function switchSettingsTab(tabName) {
    // 1. Esconde todos os conteúdos
    document.querySelectorAll('.settings-content').forEach(el => {
        el.classList.add('hidden');
    });

    // 2. Mostra o conteúdo selecionado
    const target = document.getElementById(`settings-tab-${tabName}`);
    if (target) {
        target.classList.remove('hidden');
    }

    // 3. Atualiza os botões laterais (Estilo Ativo/Inativo)
    const btnInfo = document.getElementById('btn-set-info');
    const btnPlayers = document.getElementById('btn-set-players');

    // Classes de estilo
    const activeClass = "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20";
    const inactiveClass = "hover:bg-[#1c1f26] text-gray-400 hover:text-white";
    const baseClass = "text-left px-4 py-3 rounded-lg font-bold text-sm flex items-center gap-3 transition-all w-full border border-transparent";

    // Reseta e aplica classes
    if (btnInfo) {
        btnInfo.className = `${baseClass} ${tabName === 'info' ? activeClass : inactiveClass}`;
        // Adiciona borda amarela se ativo
        if(tabName === 'info') btnInfo.classList.add('border-yellow-500');
    }
    if (btnPlayers) {
        btnPlayers.className = `${baseClass} ${tabName === 'players' ? activeClass : inactiveClass}`;
        if(tabName === 'players') btnPlayers.classList.add('border-yellow-500');
    }
}

// Função de Upload Segura
async function uploadImageToFirebase(file, path) {
    if (!file) return null;
    
    // Verificação de segurança
    if (!window.storage || !window.storageRef || !window.uploadBytes || !window.getDownloadURL) {
        console.error("Firebase Storage não carregado.");
        throw new Error("Sistema de upload indisponível. Recarregue a página.");
    }

    try {
        const ref = window.storageRef(window.storage, path);
        const metadata = { contentType: file.type };
        const snapshot = await window.uploadBytes(ref, file, metadata);
        const url = await window.getDownloadURL(snapshot.ref);
        return url;
    } catch (error) {
        console.error("Erro no Upload:", error);
        throw new Error("Falha no upload da imagem.");
    }
}

// Função de Troca de Abas Principais (Informações vs Jogadores)
// Definida no window para garantir que o clique do HTML funcione
window.switchSettingsTab = function(tabName) {
    // 1. Esconde todos os conteúdos
    const contents = document.querySelectorAll('.settings-content');
    contents.forEach(el => {
        el.style.display = 'none'; // Força display none via estilo
        el.classList.add('hidden');
    });

    // 2. Mostra o conteúdo selecionado
    const target = document.getElementById(`settings-tab-${tabName}`);
    if (target) {
        target.style.display = 'block'; // Força display block
        target.classList.remove('hidden');
        target.classList.add('animate-fadeIn');
    }

    // 3. Atualiza os botões laterais (Estilo Ativo/Inativo)
    const btnInfo = document.getElementById('btn-set-info');
    const btnPlayers = document.getElementById('btn-set-players');

    // Classes para Ativo (Amarelo) e Inativo (Cinza)
    const activeClass = "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20 border-yellow-500";
    const inactiveClass = "hover:bg-[#1c1f26] text-gray-400 hover:text-white border-transparent";
    const baseClass = "text-left px-4 py-3 rounded-lg font-bold text-sm flex items-center gap-3 transition-all w-full border";

    if (btnInfo) {
        btnInfo.className = `${baseClass} ${tabName === 'info' ? activeClass : inactiveClass}`;
    }
    if (btnPlayers) {
        btnPlayers.className = `${baseClass} ${tabName === 'players' ? activeClass : inactiveClass}`;
    }
}

// Função de Troca de Sub-Abas (Jogadores / Histórico / Convites)
window.switchPlayerSubTab = function(subTab) {
    // Esconde todas as listas
    document.getElementById('sub-tab-list').classList.add('hidden');
    document.getElementById('sub-tab-history').classList.add('hidden');
    document.getElementById('sub-tab-invites').classList.add('hidden');

    // Remove estilo ativo de todos os botões
    const btns = ['list', 'history', 'invites'];
    btns.forEach(b => {
        const btnEl = document.getElementById(`sub-btn-${b}`);
        if(btnEl) {
            btnEl.classList.remove('text-white', 'border-yellow-500');
            btnEl.classList.add('text-gray-500', 'border-transparent');
        }
    });

    // Ativa a aba clicada
    const targetDiv = document.getElementById(`sub-tab-${subTab}`);
    const targetBtn = document.getElementById(`sub-btn-${subTab}`);

    if (targetDiv) targetDiv.classList.remove('hidden');
    if (targetBtn) {
        targetBtn.classList.add('text-white', 'border-yellow-500');
        targetBtn.classList.remove('text-gray-500', 'border-transparent');
    }
}

// =========================================
// 1. RENDERIZAÇÃO DA LISTA DE TIMES (PÚBLICA)
// =========================================
export function generateTeamCard(t) {
    const logoSrc = t.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${t.name}`;
    
    return `
        <div onclick="navigateToPage('team-detail-${t.id}')" class="bg-[#15171e] p-4 rounded-xl border border-transparent hover:border-gray-600 transition-all group cursor-pointer flex items-center gap-5 shadow-lg relative overflow-hidden">
             <div class="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="w-16 h-16 rounded-lg bg-gray-800 flex items-center justify-center font-bold text-white shadow-lg overflow-hidden shrink-0 border border-gray-700 relative">
                <img src="${logoSrc}" class="w-full h-full object-cover absolute inset-0">
            </div>
            <div class="flex-1 min-w-0">
                <h3 class="text-white font-bold text-lg leading-tight truncate group-hover:text-yellow-500 transition-colors">${t.name}</h3>
                <p class="text-gray-500 text-xs mt-1 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span> Brasil</p>
                <div class="mt-2 flex gap-3 text-xs">
                    <span class="bg-gray-800 px-2 py-0.5 rounded text-gray-400 font-bold border border-gray-700">${t.wins||0}W - ${t.losses||0}L</span>
                    <span class="bg-yellow-500/10 px-2 py-0.5 rounded text-yellow-500 font-bold border border-yellow-500/20">${t.tag || 'TAG'}</span>
                </div>
            </div>
            <div class="hidden sm:flex flex-col items-end gap-1 text-right border-l border-gray-800 pl-4">
                <div class="text-xs text-gray-500">Membros</div>
                <div class="font-bold text-white flex items-center gap-1"><i data-lucide="users" class="w-3 h-3"></i> ${t.members || (t.roster ? t.roster.length : 0)}</div>
            </div>
        </div>
    `;
}

export function renderTeamsPage() {
    const content = document.getElementById('page-content');
    const userJson = localStorage.getItem('strays_user');
    const user = userJson ? JSON.parse(userJson) : null;
    
    let customTeams = [];
    try { customTeams = JSON.parse(localStorage.getItem('strays_teams_db') || '[]'); } catch (e) { customTeams = []; }
    
    // Verifica se usuário já tem time
    const myTeam = user ? customTeams.find(t => t.ownerId === user.uid || (t.roster && t.roster.some(m => m.uid === user.uid))) : null;
    
    // Botão criar time (Amarelo)
    const createBtnHtml = (user && !myTeam) ? 
        `<button onclick="openCreateTeamModal()" class="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-yellow-500/20 whitespace-nowrap"><i data-lucide="plus-circle" class="w-5 h-5"></i> Criar Meu Time</button>` 
        : ``;
    
    const allTeams = [...customTeams, ...TEAMS_LIST_DB];

    content.innerHTML = `
        <div class="animate-fadeIn max-w-7xl mx-auto pb-20">
             <div class="mb-10 text-center">
                <h1 class="text-4xl font-black text-white mb-4 uppercase">Times Competitivos</h1>
                <p class="text-gray-400">Explore os melhores times da plataforma.</p>
             </div>
            <div class="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto mb-10">
                <div class="relative flex-grow">
                    <input id="team-search" type="text" placeholder="Procurar time..." class="w-full bg-[#15171e] border border-gray-800 text-white p-4 pl-12 rounded-xl focus:border-yellow-500 focus:outline-none transition-colors">
                    <i data-lucide="search" class="absolute left-4 top-4 text-gray-500"></i>
                </div>
                ${createBtnHtml}
            </div>
            <div id="teams-grid-page" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${allTeams.map(t => generateTeamCard(t)).join('')}
            </div>
       </div>`;
    
    // Busca
    const input = document.getElementById('team-search');
    if(input) { 
        input.addEventListener('input', (e) => { 
            const term = e.target.value.toLowerCase(); 
            const filtered = allTeams.filter(t => t.name.toLowerCase().includes(term)); 
            document.getElementById('teams-grid-page').innerHTML = filtered.map(t => generateTeamCard(t)).join(''); 
            if(window.lucide) lucide.createIcons(); 
        }); 
    }
}

// =========================================
// 2. PÁGINA DE DETALHES DO TIME (PERFIL PÚBLICO)
// =========================================
export function renderTeamDetailPage(teamId) {
    const content = document.getElementById('page-content');
    const customTeams = JSON.parse(localStorage.getItem('strays_teams_db') || '[]');
    const allTeams = [...customTeams, ...TEAMS_LIST_DB];
    
    const t = allTeams.find(team => String(team.id) === String(teamId));
    
    if (!t) return content.innerHTML = `<div class="text-center text-white mt-20 text-xl font-bold">Time não encontrado.</div>`;
    
    const userJson = localStorage.getItem('strays_user');
    const user = userJson ? JSON.parse(userJson) : null;
    
    // Permissão: Dono OU Capitão
    const isOwner = user && String(t.ownerId) === String(user.uid);
    const isCaptainMember = user && t.roster && Array.isArray(t.roster) && t.roster.some(m => m.uid === user.uid && m.role === 'Capitão');
    const canEdit = isOwner || isCaptainMember;

    state.currentTeamId = t.id; 
    
    // Botão Editar (Estilo Dourado)
    const editButton = canEdit ? `<button onclick="renderTeamSettings('${t.id}')" class="bg-yellow-500 hover:bg-yellow-400 text-black border border-yellow-500 px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-bold text-sm shadow-[0_0_15px_rgba(234,179,8,0.4)]"><i data-lucide="settings" class="w-4 h-4"></i> Editar Time</button>` : '';

    const bannerSrc = t.banner || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80';
    const logoSrc = t.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${t.name}`;

    content.innerHTML = `
        <div class="animate-fadeIn max-w-7xl mx-auto pb-20 relative">
            <div class="relative w-full h-72 rounded-b-3xl overflow-hidden group shadow-2xl -mt-6">
                <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('${bannerSrc}')"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-[#0f1116] via-[#0f1116]/60 to-transparent"></div>
                <div class="absolute bottom-0 left-0 w-full p-8 flex items-center justify-between">
                    <div class="flex items-center gap-6">
                        <div class="w-32 h-32 rounded-full bg-[#0f1116] p-1 border-2 border-[#2a2d35] shadow-2xl shrink-0 relative overflow-hidden">
                            <img src="${logoSrc}" class="w-full h-full rounded-full object-cover">
                        </div>
                        <div class="mb-2">
                            <h1 class="text-4xl font-black text-white uppercase drop-shadow-lg leading-none mb-2">${t.name}</h1>
                            <div class="flex items-center gap-3 text-sm text-gray-300 font-bold">
                                <span class="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded font-bold">${t.tag || 'TAG'}</span>
                                <span>• Brasil</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-2">${editButton}</div>
                </div>
            </div>
            <div class="mt-8 mb-8 border-b border-gray-800">
                <nav class="flex gap-8" id="team-tabs-nav">
                    <button onclick="switchTeamTab('overview', '${t.id}')" class="team-tab-btn active text-white border-yellow-500 pb-3 border-b-2 font-bold text-sm transition-colors" data-tab="overview">Visão Geral</button>
                    <button onclick="switchTeamTab('players', '${t.id}')" class="team-tab-btn text-gray-500 border-transparent pb-3 border-b-2 font-bold text-sm hover:text-gray-300 transition-colors" data-tab="players">Jogadores</button>
                    <button onclick="switchTeamTab('matches', '${t.id}')" class="team-tab-btn text-gray-500 border-transparent pb-3 border-b-2 font-bold text-sm hover:text-gray-300 transition-colors" data-tab="matches">Partidas</button>
                </nav>
            </div>
            <main id="team-dynamic-content"></main>
        </div>`;
    switchTeamTab('overview', t.id);
}

// Função de troca de abas (Pública)
export function switchTeamTab(tabName, teamId) {
    const customTeams = JSON.parse(localStorage.getItem('strays_teams_db') || '[]');
    const allTeams = [...customTeams, ...TEAMS_LIST_DB];
    const t = allTeams.find(team => String(team.id) === String(teamId));
    if(!t) return;
    const container = document.getElementById('team-dynamic-content');
    
    // Atualiza botões
    document.querySelectorAll('.team-tab-btn').forEach(btn => { 
        if (btn.dataset.tab === tabName) btn.className = "team-tab-btn pb-3 border-b-2 text-white font-bold text-sm border-yellow-500 transition-colors"; 
        else btn.className = "team-nav-btn pb-3 border-b-2 text-gray-500 hover:text-white font-bold text-sm border-transparent transition-colors"; 
    });

    if (tabName === 'overview') {
        let socialsHtml = `<p class="text-gray-500 text-xs">Nenhuma rede social informada.</p>`;
        if (t.socials && (t.socials.twitter || t.socials.instagram)) {
            socialsHtml = `<div class="flex gap-4">
                ${t.socials.twitter ? `<a href="#" class="flex items-center gap-2 bg-[#1c1f26] border border-gray-700 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:border-blue-400 transition-colors"><i data-lucide="twitter" class="w-4 h-4"></i> Twitter</a>` : ''}
                ${t.socials.instagram ? `<a href="#" class="flex items-center gap-2 bg-[#1c1f26] border border-gray-700 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:border-pink-500 transition-colors"><i data-lucide="instagram" class="w-4 h-4"></i> Instagram</a>` : ''}
            </div>`;
        }
        container.innerHTML = `<div class="animate-fadeIn space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-[#15171e] p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors"><div class="text-yellow-500 mb-2"><i data-lucide="zap" class="w-6 h-6"></i></div><div class="text-2xl font-bold text-white">${t.matches||0}</div><div class="text-[10px] text-gray-500 font-bold uppercase">Partidas Jogadas</div></div>
                <div class="bg-[#15171e] p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors"><div class="text-yellow-500 mb-2"><i data-lucide="award" class="w-6 h-6"></i></div><div class="text-2xl font-bold text-white">${t.wins||0}</div><div class="text-[10px] text-gray-500 font-bold uppercase">Partidas Vencidas</div></div>
                <div class="bg-[#15171e] p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors"><div class="text-yellow-500 mb-2"><i data-lucide="trophy" class="w-6 h-6"></i></div><div class="text-2xl font-bold text-white">0</div><div class="text-[10px] text-gray-500 font-bold uppercase">Campeonatos Jogados</div></div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 space-y-6">
                    <div class="bg-[#15171e] p-8 rounded-xl border border-gray-800"><h3 class="text-white font-bold text-sm mb-4 border-b border-gray-800 pb-2">Sobre o Time</h3><p class="text-gray-300 text-sm leading-relaxed">${t.desc || 'Sem descrição.'}</p></div>
                </div>
                <div class="bg-[#15171e] p-8 rounded-xl border border-gray-800 h-fit"><h3 class="text-white font-bold text-sm mb-4 border-b border-gray-800 pb-2">Redes Sociais</h3>${socialsHtml}</div>
            </div>
        </div>`;
    } 
    else if (tabName === 'players') {
        const roster = Array.isArray(t.roster) ? t.roster : [];
        if(roster.length === 0) {
             container.innerHTML = `<div class="animate-fadeIn p-8 text-center text-gray-500">Nenhum jogador neste time.</div>`;
        } else {
             const cards = roster.map(m => {
                const roleImage = ROLES_IMG[m.gameRole] || ROLES_IMG['Flex']; 
                const avatar = m.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.nick}`;
                return `<div class="bg-[#1c1f26] rounded-xl border border-gray-800 p-5 flex flex-col gap-6 shadow-lg hover:border-gray-700 transition-all">
                    <div class="flex items-center gap-4"><div class="w-12 h-12 rounded-full bg-gray-700 p-0.5 overflow-hidden"><img src="${avatar}" class="w-full h-full object-cover"></div><div><h4 class="text-white font-bold text-base leading-tight">${m.nick}</h4><p class="text-gray-500 text-xs">Membro</p></div></div>
                    <div class="grid grid-cols-2 gap-2 border-t border-gray-800 pt-4">
                        <div class="flex flex-col"><div class="flex items-center gap-2 mb-1"><div class="w-1.5 h-1.5 rounded-full border border-white"></div><span class="text-white font-bold text-xs uppercase">${m.role || 'Membro'}</span></div><span class="text-[10px] text-gray-500 uppercase font-medium">Função</span></div>
                        <div class="flex flex-col"><div class="flex items-center gap-2 mb-1"><img src="${roleImage}" class="w-4 h-4 object-contain"><span class="text-white font-bold text-xs uppercase">${m.gameRole || 'Flex'}</span></div><span class="text-[10px] text-gray-500 uppercase font-medium">Role</span></div>
                    </div>
                </div>`;
            }).join('');
            container.innerHTML = `<div class="animate-fadeIn"><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${cards}</div></div>`;
        }
    }
    else if (tabName === 'matches') { container.innerHTML = `<div class="animate-fadeIn space-y-4"><p class="text-center text-gray-600 text-sm pt-8">Nenhuma partida recente.</p></div>`; }
    if(window.lucide) lucide.createIcons();
}

// =========================================
// 3. GERENCIAMENTO DO TIME (EDIÇÃO / SETTINGS)
// =========================================
export function renderTeamSettings(teamId) {
    const allTeams = JSON.parse(localStorage.getItem('strays_teams_db') || '[]');
    const t = allTeams.find(team => String(team.id) === String(teamId));
    if(!t) { window.showToast("Time não encontrado.", "error"); return navigateToPage('times'); }
    
    state.currentTeamId = t.id;
    if (!t.socials) t.socials = { twitter: '', instagram: '' };

    const content = document.getElementById('page-content');
    
    content.innerHTML = `
        <div class="max-w-7xl mx-auto px-6 py-10 animate-fadeIn">
            <button onclick="navigateToPage('team-detail-${t.id}')" class="flex items-center gap-2 text-gray-500 hover:text-white text-sm font-bold mb-6 transition-colors">
                <i data-lucide="arrow-left" class="w-4 h-4"></i> Voltar para o perfil do time
            </button>
            <h1 class="text-2xl font-black text-white uppercase mb-8">CONFIGURAÇÕES DO TIME</h1>

            <div class="flex flex-col lg:flex-row gap-8">
                <div class="w-full lg:w-64 flex flex-col gap-2 shrink-0">
                    <button onclick="switchSettingsTab('info')" id="btn-set-info" class="text-left px-4 py-3 rounded-lg bg-yellow-500 text-black font-bold text-sm flex items-center gap-3 transition-all shadow-lg cursor-default border border-yellow-500"><i data-lucide="info" class="w-4 h-4"></i> Informações</button>
                    <button onclick="switchSettingsTab('players')" id="btn-set-players" class="text-left px-4 py-3 rounded-lg hover:bg-[#1c1f26] text-gray-400 hover:text-white font-bold text-sm flex items-center gap-3 transition-all cursor-pointer border border-transparent"><i data-lucide="users" class="w-4 h-4"></i> Jogadores</button>
                </div>

                <div class="flex-1">
                    
                    <div id="settings-tab-info" class="settings-content block animate-fadeIn">
                        <div class="bg-[#15171e] border border-gray-800 rounded-xl p-8">
                            <div class="flex flex-col md:flex-row gap-8 mb-8 border-b border-gray-800 pb-8">
                                <div class="flex flex-col items-center gap-4">
                                    <div class="w-24 h-24 rounded-full bg-[#0f1116] border-2 border-gray-700 overflow-hidden relative shrink-0"><img id="edit-team-logo-preview" src="${t.logo || ''}" class="w-full h-full object-cover"></div>
                                    <div>
                                        <button onclick="document.getElementById('edit-team-logo').click()" class="bg-[#1c1f26] border border-gray-700 text-white text-xs font-bold px-4 py-2 rounded hover:bg-gray-700 transition-colors">Enviar nova logo</button>
                                        <input type="file" id="edit-team-logo" hidden accept="image/*" onchange="previewEditLogo(event)">
                                    </div>
                                </div>
                                <div class="flex flex-col items-center gap-4 flex-1">
                                    <div class="h-24 w-full md:w-64 rounded-lg bg-[#0f1116] border-2 border-gray-700 overflow-hidden relative shrink-0"><img id="edit-team-banner-preview" src="${t.banner || ''}" class="w-full h-full object-cover"></div>
                                    <div>
                                        <button onclick="document.getElementById('edit-team-banner').click()" class="bg-[#1c1f26] border border-gray-700 text-white text-xs font-bold px-4 py-2 rounded hover:bg-gray-700 transition-colors">Enviar nova capa</button>
                                        <input type="file" id="edit-team-banner" hidden accept="image/*" onchange="previewEditBanner(event)">
                                    </div>
                                </div>
                            </div>
                            <div class="space-y-6">
                                <div><label class="block text-gray-400 text-xs font-bold mb-2 uppercase">Nome do Time</label><input id="edit-team-name" type="text" value="${t.name}" class="w-full bg-[#0a0a0a] border border-gray-800 text-white text-sm rounded-lg px-4 py-3 outline-none focus:border-yellow-500 transition-colors"></div>
                                <div><label class="block text-gray-400 text-xs font-bold mb-2 uppercase">Tag</label><input id="edit-team-tag" type="text" value="${t.tag || ''}" maxlength="5" class="w-full bg-[#0a0a0a] border border-gray-800 text-white text-sm rounded-lg px-4 py-3 outline-none focus:border-yellow-500 transition-colors uppercase"></div>
                                <div><label class="block text-gray-400 text-xs font-bold mb-2 uppercase">Descrição</label><textarea id="edit-team-desc" rows="3" class="w-full bg-[#0a0a0a] border border-gray-800 text-white text-sm rounded-lg px-4 py-3 outline-none focus:border-yellow-500 transition-colors resize-none">${t.desc || ''}</textarea></div>
                            </div>
                            <div class="mt-8 pt-8 border-t border-gray-800">
                                <h3 class="text-white font-bold text-sm mb-4 uppercase">Redes Sociais</h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label class="block text-gray-500 text-xs mb-1 font-bold">Twitter (X)</label><div class="flex items-center bg-[#0a0a0a] border border-gray-800 rounded-lg px-3"><i data-lucide="twitter" class="w-4 h-4 text-gray-500 mr-2"></i><input id="edit-team-twitter" type="text" value="${t.socials.twitter || ''}" placeholder="@usuario" class="bg-transparent border-none text-white text-sm w-full py-3 outline-none"></div></div>
                                    <div><label class="block text-gray-500 text-xs mb-1 font-bold">Instagram</label><div class="flex items-center bg-[#0a0a0a] border border-gray-800 rounded-lg px-3"><i data-lucide="instagram" class="w-4 h-4 text-gray-500 mr-2"></i><input id="edit-team-insta" type="text" value="${t.socials.instagram || ''}" placeholder="@usuario" class="bg-transparent border-none text-white text-sm w-full py-3 outline-none"></div></div>
                                </div>
                            </div>
                            <div class="flex justify-between items-center mt-10 pt-8 border-t border-gray-800">
                                <button id="btn-save-team" onclick="saveTeamSettings()" class="bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 px-8 rounded-lg text-sm shadow-lg shadow-yellow-500/20 uppercase tracking-wide transition-transform hover:scale-105">Salvar Alterações</button>
                                <button onclick="openDeleteTeamModal()" class="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 font-bold py-3 px-6 rounded-lg text-sm transition-colors flex items-center gap-2"><i data-lucide="trash-2" class="w-4 h-4"></i> Excluir Time</button>
                            </div>
                        </div>
                    </div>

                    <div id="settings-tab-players" class="settings-content hidden animate-fadeIn">
                        
                        <div class="flex gap-6 border-b border-gray-800 mb-6">
                            <button onclick="switchPlayerSubTab('list')" id="sub-btn-list" class="sub-tab-btn pb-3 text-sm font-bold text-white border-b-2 border-yellow-500 transition-colors">Jogadores</button>
                            <button onclick="switchPlayerSubTab('history')" id="sub-btn-history" class="sub-tab-btn pb-3 text-sm font-bold text-gray-500 border-b-2 border-transparent hover:text-white transition-colors">Histórico</button>
                            <button onclick="switchPlayerSubTab('invites')" id="sub-btn-invites" class="sub-tab-btn pb-3 text-sm font-bold text-gray-500 border-b-2 border-transparent hover:text-white transition-colors">Convites</button>
                        </div>

                        <div id="sub-tab-list">
                            <div class="flex justify-between items-center mb-4">
                                <p class="text-gray-400 text-sm font-bold">${(t.roster || []).length} Jogadores</p>
                                <button onclick="openAddPlayerModal()" class="bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-transparent hover:border-[#8b5cf6]"><i data-lucide="plus" class="w-4 h-4"></i> Convidar Jogador</button>
                            </div>

                            <div class="flex flex-col gap-2">
                                ${(t.roster || []).map(m => `
                                    <div class="bg-[#15171e] border border-gray-800 rounded-lg p-4 flex items-center justify-between group hover:border-gray-700 transition-colors">
                                        <div class="flex items-center gap-4">
                                            <div class="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-gray-700"><img src="${m.photo || 'https://api.dicebear.com/7.x/avataaars/svg?seed='+m.nick}" class="w-full h-full object-cover"></div>
                                            <div>
                                                <h4 class="text-white font-bold text-sm">${m.nick}</h4>
                                                <p class="text-gray-500 text-[10px]">Membro desde ${new Date(m.joinedAt || Date.now()).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        
                                        <div class="flex items-center gap-6">
                                            <div class="flex flex-col items-end">
                                                <span class="text-[10px] text-gray-500 font-bold uppercase mb-1">Funções</span>
                                                <span class="bg-[#6d28d9] text-white text-[10px] font-bold px-2 py-0.5 rounded border border-[#8b5cf6] uppercase flex items-center gap-1"><i data-lucide="user" class="w-3 h-3"></i> ${m.role}</span>
                                            </div>
                                            <div class="flex flex-col items-end">
                                                <span class="text-[10px] text-gray-500 font-bold uppercase mb-1">Role</span>
                                                <span class="bg-[#1c1f26] text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-700 uppercase flex items-center gap-1"><i data-lucide="crosshair" class="w-3 h-3"></i> ${m.gameRole || 'Flex'}</span>
                                            </div>
                                            <button onclick="openEditPlayerModal('${m.uid}', '${m.nick}', '${m.role}', '${m.gameRole}')" class="w-8 h-8 rounded-lg bg-[#1c1f26] border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition-colors"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                                            <button onclick="removePlayer('${m.uid}')" class="w-8 h-8 rounded-lg bg-[#1c1f26] border border-red-900/30 text-red-500 hover:bg-red-500 hover:text-white transition-colors" title="Remover do Time"><i data-lucide="user-x" class="w-4 h-4"></i></button>
                                        </div>
                                    </div>
                                `).join('')}
                                ${(t.roster || []).length === 0 ? '<p class="text-gray-500 text-center py-4 text-sm">Nenhum jogador no roster.</p>' : ''}
                            </div>
                        </div>

                        <div id="sub-tab-history" class="hidden">
                            <div class="bg-[#15171e] border border-gray-800 rounded-lg overflow-hidden">
                                <div class="grid grid-cols-3 bg-[#1c1f26] p-3 text-[10px] font-bold text-gray-500 uppercase">
                                    <div>Player</div><div>Ação</div><div>Data</div>
                                </div>
                                <div class="p-3 text-center text-gray-500 text-xs">Nenhum histórico disponível.</div>
                            </div>
                        </div>

                        <div id="sub-tab-invites" class="hidden">
                            <div class="bg-[#15171e] border border-gray-800 rounded-lg overflow-hidden">
                                <div class="grid grid-cols-3 bg-[#1c1f26] p-3 text-[10px] font-bold text-gray-500 uppercase">
                                    <div>Player</div><div>Status</div><div>Enviado</div>
                                </div>
                                <div class="p-3 text-center text-gray-500 text-xs">Nenhum convite pendente.</div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    `;
    injectSettingsModals();
    if(window.lucide) lucide.createIcons();
}

// =========================================
// 5. MODAIS DE EDIÇÃO (INJEÇÃO)
// =========================================
function injectSettingsModals() {
    ['edit-player-modal', 'delete-team-modal', 'add-player-modal'].forEach(id => {
        const old = document.getElementById(id); if(old) old.remove();
    });

    const modalsHtml = `
        <div id="edit-player-modal" class="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm hidden animate-fadeIn">
            <div class="bg-[#15171e] w-full max-w-md rounded-xl border border-gray-800 shadow-2xl p-6">
                <div class="flex justify-between items-start mb-6">
                    <div><h3 class="text-white font-bold text-lg">Editar Jogador</h3><p class="text-gray-500 text-xs">Editar informações do jogador</p></div>
                    <button onclick="closeEditPlayerModal()" class="text-gray-500 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>
                
                <div class="bg-[#1c1f26] border border-gray-800 rounded-lg p-3 flex items-center gap-3 mb-6">
                    <div class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold"><i data-lucide="user"></i></div>
                    <div><h4 class="text-white font-bold text-sm" id="modal-p-nick">Nick</h4><p class="text-gray-500 text-[10px]">Membro do time</p></div>
                </div>
                <input type="hidden" id="modal-p-uid">
                
                <div class="space-y-4 mb-8">
                    <div><label class="block text-gray-400 text-xs font-bold mb-2">Funções no time</label><select id="modal-p-role" class="w-full bg-[#1c1f26] border border-gray-700 text-white px-4 py-3 rounded-lg text-sm outline-none focus:border-yellow-500"><option value="Membro">Membro</option><option value="Capitão">Capitão</option><option value="Coach">Coach</option><option value="Manager">Manager</option></select></div>
                    <div><label class="block text-gray-400 text-xs font-bold mb-2">Role no Valorant</label><select id="modal-p-gameRole" class="w-full bg-[#1c1f26] border border-gray-700 text-white px-4 py-3 rounded-lg text-sm outline-none focus:border-yellow-500"><option value="Flex">FLEX</option><option value="Duelista">DUELISTA</option><option value="Controlador">CONTROLADOR</option><option value="Iniciador">INICIADOR</option><option value="Sentinela">SENTINELA</option></select></div>
                </div>
                <div class="flex justify-end gap-3"><button onclick="closeEditPlayerModal()" class="bg-[#1c1f26] border border-gray-700 text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-gray-700">Cancelar</button><button onclick="savePlayerEdit()" class="bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-bold py-2 px-6 rounded-lg text-sm">Salvar Alterações</button></div>
            </div>
        </div>
        
        <div id="delete-team-modal" class="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm hidden animate-fadeIn">
            <div class="bg-[#15171e] w-full max-w-sm rounded-xl border border-red-900/50 shadow-2xl p-6 text-center">
                 <div class="w-12 h-12 rounded-full bg-red-900/20 flex items-center justify-center mx-auto mb-4"><i data-lucide="alert-triangle" class="text-red-500 w-6 h-6"></i></div>
                <h3 class="text-white font-bold text-lg mb-2">Excluir Time?</h3>
                <p class="text-gray-400 text-sm mb-6 leading-relaxed">Esta ação é permanente.</p>
                <div class="flex justify-center gap-3"><button onclick="closeDeleteTeamModal()" class="bg-[#1c1f26] hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg text-sm border border-gray-700 transition-colors">Cancelar</button><button onclick="confirmDeleteTeam()" id="btn-confirm-delete-team" class="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg text-sm shadow-lg shadow-red-900/20 transition-colors">Sim, Excluir</button></div>
            </div>
        </div>

        <div id="add-player-modal" class="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm hidden animate-fadeIn">
             <div class="bg-[#15171e] w-full max-w-md rounded-xl border border-gray-800 shadow-2xl p-6">
                <div class="flex justify-between items-start mb-6"><h3 class="text-white font-bold text-lg">Convidar Jogador</h3><button onclick="document.getElementById('add-player-modal').classList.add('hidden')" class="text-gray-500 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button></div>
                <div class="mb-6"><label class="block text-gray-400 text-xs font-bold mb-2 uppercase">Buscar por Nick exato</label><div class="relative"><input type="text" id="recruit-nick" placeholder="Digite o nick do jogador..." class="w-full bg-[#0a0a0a] border border-gray-700 text-white pl-10 pr-4 py-3 rounded-lg text-sm outline-none focus:border-purple-500"><i data-lucide="search" class="absolute left-3 top-3.5 text-gray-500 w-5 h-5"></i></div></div>
                <div class="flex justify-end gap-3"><button onclick="document.getElementById('add-player-modal').classList.add('hidden')" class="text-white font-bold text-sm px-4 py-2 hover:bg-white/5 rounded-lg">Cancelar</button><button onclick="confirmAddPlayer()" id="btn-send-invite" class="bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-bold py-2 px-6 rounded-lg text-sm shadow-lg shadow-purple-900/20">Enviar Convite</button></div>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', modalsHtml);
}


// =========================================
// 6. LÓGICA DE CRIAÇÃO DE TIME (CORRIGIDA E ROBUSTA)
// =========================================
window.openCreateTeamModal = function() {
    const oldModal = document.getElementById('create-team-modal'); if (oldModal) oldModal.remove();

    const modalHtml = `
    <div id="create-team-modal" class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
        <div class="bg-[#15171e] w-full max-w-md rounded-xl border border-gray-800 shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <div class="flex justify-between items-start mb-6">
                <div><h3 class="text-white font-bold text-xl flex items-center gap-2"><span class="text-yellow-500">🏆</span> Criar Time</h3><p class="text-gray-500 text-xs mt-1">Preencha as informações do seu time.</p></div>
                <button type="button" onclick="closeCreateTeamModal()" class="text-gray-500 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>
            
            <form onsubmit="handleCreateTeamForm(event)">
                <div class="flex justify-center mb-8">
                    <label for="unique-logo-upload-123" class="relative w-28 h-28 rounded-full bg-[#0f1116] border-2 border-dashed border-gray-700 hover:border-yellow-500 text-gray-500 flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden z-20 shadow-lg">
                        <div id="create-team-icon-container" class="flex flex-col items-center pointer-events-none group-hover:text-yellow-500 transition-colors">
                            <i data-lucide="camera" class="w-8 h-8 mb-2"></i><span class="text-[10px] font-bold uppercase tracking-wider">Upload Logo</span>
                        </div>
                        <img id="create-team-preview" src="" class="absolute inset-0 w-full h-full object-cover hidden pointer-events-none">
                        <input type="file" id="unique-logo-upload-123" class="hidden" accept="image/*" onchange="previewCreateLogo(event)">
                    </label>
                </div>

                <div class="space-y-4">
                    <div><label class="block text-gray-400 text-xs font-bold mb-2 uppercase">Nome do Time</label><input type="text" id="new-team-name" required placeholder="Ex: Strays E-sports" class="w-full bg-[#0a0a0a] border border-gray-800 text-white px-4 py-3 rounded-lg text-sm focus:border-yellow-500 outline-none transition-colors"></div>
                    <div><label class="block text-gray-400 text-xs font-bold mb-2 uppercase">Tag (Sigla)</label><input type="text" id="new-team-tag" required maxlength="5" placeholder="Ex: STRY" class="w-full bg-[#0a0a0a] border border-gray-800 text-white px-4 py-3 rounded-lg text-sm focus:border-yellow-500 outline-none transition-colors uppercase"></div>
                    <div><label class="block text-gray-400 text-xs font-bold mb-2 uppercase">Descrição (Opcional)</label><textarea id="new-team-desc" rows="3" placeholder="Fale um pouco sobre os objetivos do time..." class="w-full bg-[#0a0a0a] border border-gray-800 text-white px-4 py-3 rounded-lg text-sm focus:border-yellow-500 outline-none transition-colors resize-none"></textarea></div>
                </div>

                <div class="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-800">
                    <button type="button" onclick="closeCreateTeamModal()" class="text-white font-bold text-sm px-4 py-3 hover:bg-white/5 rounded-lg transition-colors">Cancelar</button>
                    <button type="submit" id="btn-create-submit" class="bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 px-8 rounded-lg text-sm shadow-lg shadow-yellow-500/20 uppercase tracking-wide transition-transform hover:scale-105">Criar Time</button>
                </div>
            </form>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if(window.lucide) lucide.createIcons();
    selectedLogoFile = null; // Reseta seleção anterior
}

window.closeCreateTeamModal = function() { const modal = document.getElementById('create-team-modal'); if(modal) modal.remove(); }

window.handleCreateTeamForm = async function(e) {
    e.preventDefault();
    
    // 1. Verifica Login
    const userJson = localStorage.getItem('strays_user'); 
    if(!userJson) { window.showToast("Você precisa estar logado!", "error"); return; }
    const user = JSON.parse(userJson);

    // 2. Prepara UI
    const btn = document.getElementById('btn-create-submit');
    const oldText = btn.innerText;
    btn.innerText = "CRIANDO..."; btn.disabled = true;

    try {
        // 3. Verifica ferramentas do Firebase
        if (!window.db || !window.collection || !window.doc || !window.setDoc) {
             throw new Error("Banco de dados não inicializado. Recarregue a página.");
        }

        const name = document.getElementById('new-team-name').value.trim();
        const tag = document.getElementById('new-team-tag').value.toUpperCase().trim();
        const desc = document.getElementById('new-team-desc').value.trim();

        // 4. GERA O ID DO DOCUMENTO PRIMEIRO (Essencial para o Storage funcionar bem)
        const newTeamRef = window.doc(window.collection(window.db, "teams"));
        const newTeamId = newTeamRef.id; // Este é o ID real do Firestore

        // 5. Upload da Logo (usando o ID real)
        let finalLogoUrl = null;
        if (selectedLogoFile) {
            try {
                window.showToast("Enviando logo...", "info");
                // Usa o ID do documento no caminho do Storage
                finalLogoUrl = await uploadImageToFirebase(selectedLogoFile, `teams/${newTeamId}/logo.jpg`);
            } catch (uploadError) {
                 throw uploadError; // Re-lança para cair no catch principal
            }
        }

        // 6. Monta o objeto do time
        const newTeamData = {
            id: newTeamId, // Salva o ID dentro do objeto também
            name, tag, desc,
            wins: 0, losses: 0, matches: 0, rating: 0,
            logo: finalLogoUrl, // URL do Storage ou null
            banner: null,
            socials: { twitter: "", instagram: "" },
            ownerId: user.uid,
            createdAt: new Date().toISOString(),
            // O criador é automaticamente o Capitão
            roster: [{ 
                uid: user.uid, 
                nick: user.nick || user.name, 
                photo: user.photo || null,
                role: 'Capitão', 
                gameRole: 'Flex',
                joinedAt: new Date().toISOString()
            }]
        };
        
        // 7. Salva no Firestore (usando a referência criada no passo 4)
        await window.setDoc(newTeamRef, newTeamData);

        // 8. Atualiza LocalStorage (para refletir na hora sem F5)
        let localTeams = [];
        try { localTeams = JSON.parse(localStorage.getItem('strays_teams_db') || '[]'); } catch(err) { localTeams = []; }
        localTeams.push(newTeamData);
        localStorage.setItem('strays_teams_db', JSON.stringify(localTeams));

        // 9. Finaliza
        closeCreateTeamModal();
        selectedLogoFile = null;
        window.showToast("Time criado com sucesso!", "success");
        
        // Redireciona para o painel do novo time
        setTimeout(() => {
            if (window.navigateToPage) window.navigateToPage(`team-detail-${newTeamId}`);
            else window.location.href = `index.html#team-detail-${newTeamId}`;
        }, 500);

    } catch (e) {
        console.error("Erro na criação do time:", e);
        window.showToast("Erro: " + (e.message || "Falha ao criar time."), "error");
    } finally {
        btn.innerText = oldText; btn.disabled = false;
    }
}

// =========================================
// 7. PREVIEWS E SUPORTE
// =========================================
window.previewCreateLogo = function(e) {
    const file = e.target.files[0];
    if(file) {
        selectedLogoFile = file;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = document.getElementById('create-team-preview');
            const iconContainer = document.getElementById('create-team-icon-container');
            if(img) { img.src = ev.target.result; img.classList.remove('hidden'); }
            if(iconContainer) iconContainer.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }
}

// Funções de preview na edição (precisam estar no escopo global)
window.previewEditLogo = function(e) {
    const file = e.target.files[0];
    if(file) {
        selectedLogoFile = file;
        const reader = new FileReader();
        reader.onload = (ev) => document.getElementById('edit-team-logo-preview').src = ev.target.result;
        reader.readAsDataURL(file);
    }
}
window.previewEditBanner = function(e) {
    const file = e.target.files[0];
    if(file) {
        selectedBannerFile = file;
        const reader = new FileReader();
        reader.onload = (ev) => document.getElementById('edit-team-banner-preview').src = ev.target.result;
        reader.readAsDataURL(file);
    }
}

// Salvar edições do time
window.saveTeamSettings = async function() {
    const teamId = state.currentTeamId;
    if (!teamId) return;
    
    const btn = document.getElementById('btn-save-team');
    const oldText = btn.innerText;
    btn.innerText = "SALVANDO..."; btn.disabled = true;

    try {
        let updates = {};
        
        // Uploads se houver novos arquivos
        if (selectedLogoFile) {
            const url = await uploadImageToFirebase(selectedLogoFile, `teams/${teamId}/logo.jpg`);
            updates.logo = url;
        }
        if (selectedBannerFile) {
            const url = await uploadImageToFirebase(selectedBannerFile, `teams/${teamId}/banner.jpg`);
            updates.banner = url;
        }

        // Campos de texto
        updates.name = document.getElementById('edit-team-name').value.trim();
        updates.tag = document.getElementById('edit-team-tag').value.toUpperCase().trim();
        updates.desc = document.getElementById('edit-team-desc').value.trim();
        updates.socials = {
            twitter: document.getElementById('edit-team-twitter').value.trim(),
            instagram: document.getElementById('edit-team-insta').value.trim()
        };

        // Atualiza Firestore
        const teamRef = window.doc(window.db, "teams", teamId);
        await window.updateDoc(teamRef, updates);

        // Atualiza LocalStorage
        let teams = JSON.parse(localStorage.getItem('strays_teams_db') || '[]');
        const idx = teams.findIndex(t => String(t.id) === String(teamId));
        if (idx > -1) {
            teams[idx] = { ...teams[idx], ...updates };
            localStorage.setItem('strays_teams_db', JSON.stringify(teams));
        }
        
        selectedLogoFile = null; selectedBannerFile = null;
        window.showToast("Time atualizado com sucesso!", "success");
        renderTeamSettings(teamId); // Recarrega a tela de edição

    } catch(e) {
        console.error(e);
        window.showToast("Erro ao salvar: " + e.message, "error");
    } finally {
        btn.innerText = oldText; btn.disabled = false;
    }
}

// Funções de Exclusão
window.openDeleteTeamModal = function() { document.getElementById('delete-team-modal').classList.remove('hidden'); document.getElementById('delete-team-modal').classList.add('flex'); }
window.closeDeleteTeamModal = function() { document.getElementById('delete-team-modal').classList.add('hidden'); document.getElementById('delete-team-modal').classList.remove('flex'); }

window.confirmDeleteTeam = async function() {
    const teamId = state.currentTeamId;
    if(!teamId) return;
    
    const btn = document.getElementById('btn-confirm-delete-team');
    btn.innerText = "Excluindo..."; btn.disabled = true;

    try {
        // Deleta do Firestore
        await window.deleteDoc(window.doc(window.db, "teams", teamId));
        
        // Atualiza LocalStorage
        let teams = JSON.parse(localStorage.getItem('strays_teams_db') || '[]');
        teams = teams.filter(t => String(t.id) !== String(teamId));
        localStorage.setItem('strays_teams_db', JSON.stringify(teams));
        
        closeDeleteTeamModal();
        window.showToast("Time excluído permanentemente.", "success");
        if (window.navigateToPage) window.navigateToPage('times');
        else window.location.href = 'index.html#times';

    } catch(e) {
        console.error(e);
        window.showToast("Erro ao excluir time: " + e.message, "error");
        btn.innerText = "Sim, Excluir"; btn.disabled = false;
    }
}

// Funções de Gerenciamento de Jogadores (Modais e Ações)
window.openEditPlayerModal = function(uid, nick, role, gameRole) {
    document.getElementById('modal-p-uid').value = uid;
    document.getElementById('modal-p-nick').innerText = nick;
    document.getElementById('modal-p-role').value = role || 'Membro';
    document.getElementById('modal-p-gameRole').value = gameRole || 'Flex';
    document.getElementById('edit-player-modal').classList.remove('hidden');
    document.getElementById('edit-player-modal').classList.add('flex');
}
window.closeEditPlayerModal = function() {
    document.getElementById('edit-player-modal').classList.add('hidden');
    document.getElementById('edit-player-modal').classList.remove('flex');
}

window.savePlayerEdit = async function() {
    const teamId = state.currentTeamId;
    const uid = document.getElementById('modal-p-uid').value;
    const newRole = document.getElementById('modal-p-role').value;
    const newGameRole = document.getElementById('modal-p-gameRole').value;

    try {
        // Busca o time no Firestore para garantir dados frescos
        const teamRef = window.doc(window.db, "teams", teamId);
        const teamSnap = await window.getDoc(teamRef);
        if(!teamSnap.exists()) throw new Error("Time não encontrado no banco.");
        
        let teamData = teamSnap.data();
        let roster = teamData.roster || [];
        const pIdx = roster.findIndex(m => String(m.uid) === String(uid));
        
        if(pIdx === -1) throw new Error("Jogador não está mais no time.");

        // Atualiza o array localmente
        roster[pIdx].role = newRole;
        roster[pIdx].gameRole = newGameRole;

        // Salva no Firestore
        await window.updateDoc(teamRef, { roster: roster });

        // Atualiza LocalStorage
        let localTeams = JSON.parse(localStorage.getItem('strays_teams_db') || '[]');
        const localIdx = localTeams.findIndex(t => String(t.id) === String(teamId));
        if(localIdx > -1) {
            localTeams[localIdx].roster = roster;
            localStorage.setItem('strays_teams_db', JSON.stringify(localTeams));
        }

        closeEditPlayerModal();
        renderTeamSettings(teamId); // Recarrega a tela
        setTimeout(() => switchSettingsTab('players'), 100); // Volta para a aba de players
        window.showToast("Jogador atualizado.", "success");

    } catch(e) {
        console.error(e);
        window.showToast("Erro ao atualizar jogador: " + e.message, "error");
    }
}

window.removePlayer = async function(uid) {
    if(!confirm("Tem certeza que deseja remover este jogador do time?")) return;
    const teamId = state.currentTeamId;
    
    try {
        const teamRef = window.doc(window.db, "teams", teamId);
        const teamSnap = await window.getDoc(teamRef);
        if(!teamSnap.exists()) throw new Error("Time não encontrado.");
        
        let teamData = teamSnap.data();
        // Filtra o roster removendo o UID alvo
        const newRoster = (teamData.roster || []).filter(m => String(m.uid) !== String(uid));
        
        // Atualiza Firestore
        await window.updateDoc(teamRef, { 
            roster: newRoster,
            members: newRoster.length // Atualiza contagem
        });

        // Atualiza LocalStorage
        let localTeams = JSON.parse(localStorage.getItem('strays_teams_db') || '[]');
        const localIdx = localTeams.findIndex(t => String(t.id) === String(teamId));
        if(localIdx > -1) {
            localTeams[localIdx].roster = newRoster;
            localTeams[localIdx].members = newRoster.length;
            localStorage.setItem('strays_teams_db', JSON.stringify(localTeams));
        }

        renderTeamSettings(teamId);
        setTimeout(() => switchSettingsTab('players'), 100);
        window.showToast("Jogador removido do time.", "success");

    } catch(e) {
         console.error(e);
         window.showToast("Erro ao remover jogador: " + e.message, "error");
    }
}

window.openAddPlayerModal = function() { document.getElementById('add-player-modal').classList.remove('hidden'); document.getElementById('add-player-modal').classList.add('flex'); }

window.confirmAddPlayer = async function() {
    const nickInput = document.getElementById('recruit-nick');
    const nick = nickInput.value.trim();
    const modal = document.getElementById('add-player-modal');
    
    if(!nick) return window.showToast("Digite o nick do jogador.", "error");

    const btn = document.getElementById('btn-send-invite');
    const originalText = btn.innerText;
    btn.innerText = "Buscando..."; btn.disabled = true;

    try {
        if (!window.searchUserByNick || !window.NotificationSystem) {
            throw new Error("Sistema de busca ou notificação não carregado.");
        }

        const targetUser = await window.searchUserByNick(nick);
        
        if (!targetUser) {
            window.showToast("Jogador não encontrado com este nick exato.", "error");
            return;
        }
        
        // Pega nome do time atual
        const allTeams = JSON.parse(localStorage.getItem('strays_teams_db') || '[]');
        const currentTeam = allTeams.find(t => String(t.id) === String(state.currentTeamId));
        const teamName = currentTeam ? currentTeam.name : "um time";

        // Envia Notificação
        await window.NotificationSystem.send(
            targetUser.uid,
            'invite',
            'Convite de Time 🛡️', 
            `Você foi convidado para entrar no time **${teamName}**.`,
            { teamId: state.currentTeamId, teamName: teamName }
        );
        
        window.showToast(`Convite enviado para ${targetUser.nick}!`, "success");
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        nickInput.value = '';
        

    } catch (e) {
        console.error(e);
        window.showToast("Erro: " + e.message, "error");
    } finally {
        btn.innerText = originalText; btn.disabled = false;
    }
    window.switchSettingsTab = switchSettingsTab;
window.switchPlayerSubTab = switchPlayerSubTab;
}