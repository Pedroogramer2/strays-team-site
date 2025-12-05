// js/pages/teams.js
import { TEAMS_LIST_DB, ROLES_IMG } from '../database.js';
import { state } from '../state.js';

// --- FUNÇÕES DE RENDERIZAÇÃO ---
export function generateTeamCard(t) {
    return `
        <div onclick="navigateToPage('team-detail-${t.id}')" class="bg-[#15171e] p-4 rounded-xl border border-transparent hover:border-gray-600 transition-all group cursor-pointer flex items-center gap-5 shadow-lg relative overflow-hidden">
             <div class="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="w-16 h-16 rounded-lg bg-gray-800 flex items-center justify-center font-bold text-white shadow-lg overflow-hidden shrink-0 border border-gray-700"><img src="${t.logo}" class="w-full h-full object-cover"></div>
            <div class="flex-1 min-w-0"><h3 class="text-white font-bold text-lg leading-tight truncate group-hover:text-yellow-500 transition-colors">${t.name}</h3><p class="text-gray-500 text-xs mt-1 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span> Brasil</p><div class="mt-2 flex gap-3 text-xs"><span class="bg-gray-800 px-2 py-0.5 rounded text-gray-400 font-bold border border-gray-700">${t.wins||0}W - ${t.losses||0}L</span><span class="bg-yellow-500/10 px-2 py-0.5 rounded text-yellow-500 font-bold border border-yellow-500/20">${t.rating||'Unranked'} ★</span></div></div>
            <div class="hidden sm:flex flex-col items-end gap-1 text-right border-l border-gray-800 pl-4"><div class="text-xs text-gray-500">Membros</div><div class="font-bold text-white flex items-center gap-1"><i data-lucide="users" class="w-3 h-3"></i> ${t.members || (t.roster ? t.roster.length : 0)}</div></div>
        </div>
    `;
}

export function renderTeamsPage() {
    const content = document.getElementById('page-content');
    const userJson = localStorage.getItem('u4nted_user');
    const user = userJson ? JSON.parse(userJson) : null;
    const customTeams = JSON.parse(localStorage.getItem('u4nted_teams_db') || '[]');
    const myTeam = user ? customTeams.find(t => t.ownerId === user.uid) : null;
    const createBtnHtml = (user && !myTeam) ? `<button onclick="openCreateTeamModal()" class="bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-purple-900/20 whitespace-nowrap"><i data-lucide="plus-circle" class="w-5 h-5"></i> Criar Meu Time</button>` : ``;
    const allTeams = [...customTeams, ...TEAMS_LIST_DB];

    content.innerHTML = `
        <div class="animate-fadeIn max-w-7xl mx-auto pb-20">
             <div class="mb-10 text-center"><h1 class="text-4xl font-black text-white mb-4 uppercase">Times Competitivos</h1><p class="text-gray-400">Explore os melhores times da plataforma.</p></div>
            <div class="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto mb-10"><div class="relative flex-grow"><input id="team-search" type="text" placeholder="Procurar time pelo nome..." class="w-full bg-[#15171e] border border-gray-800 text-white p-4 pl-12 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"><i data-lucide="search" class="absolute left-4 top-4 text-gray-500"></i></div>${createBtnHtml}</div>
            <div id="teams-grid-page" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${allTeams.map(t => generateTeamCard(t)).join('')}</div>
       </div>`;
    
    const input = document.getElementById('team-search');
    if(input) { input.addEventListener('input', (e) => { const term = e.target.value.toLowerCase(); const filtered = allTeams.filter(t => t.name.toLowerCase().includes(term)); document.getElementById('teams-grid-page').innerHTML = filtered.map(t => generateTeamCard(t)).join(''); if(window.lucide) lucide.createIcons(); }); }
}

export function renderTeamDetailPage(teamId) {
    const content = document.getElementById('page-content');
    const customTeams = JSON.parse(localStorage.getItem('u4nted_teams_db') || '[]');
    const allTeams = [...customTeams, ...TEAMS_LIST_DB];
    const t = allTeams.find(team => String(team.id) === String(teamId));
    if (!t) return content.innerHTML = `<div class="text-center text-white mt-10">Time não encontrado.</div>`;
    const userJson = localStorage.getItem('u4nted_user');
    const user = userJson ? JSON.parse(userJson) : null;
    const isCaptain = user && String(t.ownerId) === String(user.uid);
    state.currentTeamId = t.id; 
    const editButton = isCaptain ? `<button onclick="renderTeamSettings('${t.id}')" class="bg-yellow-500 hover:bg-yellow-400 text-black border border-yellow-500 px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-bold text-sm shadow-[0_0_15px_rgba(234,179,8,0.4)]"><i data-lucide="settings" class="w-4 h-4"></i> Editar Time</button>` : '';

    content.innerHTML = `
        <div class="animate-fadeIn max-w-7xl mx-auto pb-20 relative">
            <div class="relative w-full h-72 rounded-b-3xl overflow-hidden group shadow-2xl -mt-6">
                <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('${t.banner || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80'}')"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-[#0f1116] via-[#0f1116]/60 to-transparent"></div>
                <div class="absolute bottom-0 left-0 w-full p-8 flex items-center justify-between">
                    <div class="flex items-center gap-6"><div class="w-32 h-32 rounded-full bg-[#0f1116] p-1 border border-[#2a2d35] shadow-2xl shrink-0"><img src="${t.logo}" class="w-full h-full rounded-full object-cover"></div><div class="mb-2"><h1 class="text-4xl font-black text-white uppercase drop-shadow-lg leading-none mb-2">${t.name}</h1><div class="flex items-center gap-3 text-sm text-gray-300 font-bold"><span class="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded font-bold">${t.tag || 'TAG'}</span><span>• Brasil</span></div></div></div><div class="flex gap-2">${editButton}</div>
                </div>
            </div>
            <div class="mt-8 mb-8 border-b border-gray-800"><nav class="flex gap-8" id="team-tabs-nav"><button onclick="switchTeamTab('overview', '${t.id}')" class="team-tab-btn active text-white border-yellow-500 pb-3 border-b-2 font-bold text-sm transition-colors" data-tab="overview">Visão Geral</button><button onclick="switchTeamTab('players', '${t.id}')" class="team-tab-btn text-gray-500 border-transparent pb-3 border-b-2 font-bold text-sm hover:text-gray-300 transition-colors" data-tab="players">Jogadores</button><button onclick="switchTeamTab('matches', '${t.id}')" class="team-tab-btn text-gray-500 border-transparent pb-3 border-b-2 font-bold text-sm hover:text-gray-300 transition-colors" data-tab="matches">Partidas</button></nav></div>
            <main id="team-dynamic-content"></main>
        </div>`;
    switchTeamTab('overview', t.id);
}

export function switchTeamTab(tabName, teamId) {
    const customTeams = JSON.parse(localStorage.getItem('u4nted_teams_db') || '[]');
    const allTeams = [...customTeams, ...TEAMS_LIST_DB];
    const t = allTeams.find(team => String(team.id) === String(teamId));
    if(!t) return;
    const container = document.getElementById('team-dynamic-content');
    document.querySelectorAll('.team-tab-btn').forEach(btn => { if (btn.dataset.tab === tabName) btn.className = "team-tab-btn pb-4 border-b-2 text-white font-bold text-sm border-yellow-500 transition-colors"; else btn.className = "team-nav-btn pb-4 border-b-2 text-gray-500 hover:text-white font-bold text-sm border-transparent transition-colors"; });

    if (tabName === 'overview') {
        let socialsHtml = `<p class="text-gray-500 text-xs">Nenhuma rede social informada.</p>`;
        if (t.socials && (t.socials.twitter || t.socials.instagram)) {
            socialsHtml = `<div class="flex gap-4">${t.socials.twitter ? `<a href="https://twitter.com/${t.socials.twitter}" target="_blank" class="flex items-center gap-2 bg-[#1c1f26] border border-gray-700 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:border-blue-400 transition-colors"><i data-lucide="twitter" class="w-4 h-4"></i> Twitter</a>` : ''}${t.socials.instagram ? `<a href="https://instagram.com/${t.socials.instagram}" target="_blank" class="flex items-center gap-2 bg-[#1c1f26] border border-gray-700 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:border-pink-500 transition-colors"><i data-lucide="instagram" class="w-4 h-4"></i> Instagram</a>` : ''}</div>`;
        }
        container.innerHTML = `<div class="animate-fadeIn space-y-6"><div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div class="bg-[#15171e] p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors"><div class="text-yellow-500 mb-2"><i data-lucide="zap" class="w-6 h-6"></i></div><div class="text-2xl font-bold text-white">${t.matches||0}</div><div class="text-[10px] text-gray-500 font-bold uppercase">Partidas Jogadas</div></div><div class="bg-[#15171e] p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors"><div class="text-yellow-500 mb-2"><i data-lucide="award" class="w-6 h-6"></i></div><div class="text-2xl font-bold text-white">${t.wins||0}</div><div class="text-[10px] text-gray-500 font-bold uppercase">Partidas Vencidas</div></div><div class="bg-[#15171e] p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors"><div class="text-yellow-500 mb-2"><i data-lucide="trophy" class="w-6 h-6"></i></div><div class="text-2xl font-bold text-white">0</div><div class="text-[10px] text-gray-500 font-bold uppercase">Campeonatos Jogados</div></div></div><div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-6"><div class="bg-[#15171e] p-8 rounded-xl border border-gray-800"><h3 class="text-white font-bold text-sm mb-4 border-b border-gray-800 pb-2">Sobre o Time</h3><p class="text-gray-300 text-sm leading-relaxed">${t.desc || 'Sem descrição.'}</p></div><div class="bg-[#15171e] p-8 rounded-xl border border-gray-800"><div class="flex justify-between items-center mb-4 border-b border-gray-800 pb-2"><h3 class="text-white font-bold text-sm">Conquistas</h3><button class="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1">Ver Todas <i data-lucide="chevron-right" class="w-3 h-3"></i></button></div><p class="text-gray-500 text-sm">Nenhuma conquista registrada.</p></div></div><div class="bg-[#15171e] p-8 rounded-xl border border-gray-800 h-fit"><h3 class="text-white font-bold text-sm mb-4 border-b border-gray-800 pb-2">Redes Sociais</h3>${socialsHtml}</div></div></div>`;
    } 
    else if (tabName === 'players') {
        const roster = t.roster || [];
        const cards = roster.map(m => {
            const roleImage = ROLES_IMG[m.gameRole] || ROLES_IMG['Flex']; 
            const avatar = m.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.nick}`;
            return `<div class="bg-[#1c1f26] rounded-xl border border-gray-800 p-5 flex flex-col gap-6 shadow-lg hover:border-gray-700 transition-all"><div class="flex items-center gap-4"><div class="w-12 h-12 rounded-full bg-gray-700 p-0.5 overflow-hidden"><img src="${avatar}" class="w-full h-full object-cover"></div><div><h4 class="text-white font-bold text-base leading-tight">${m.nick}</h4><p class="text-gray-500 text-xs">Membro</p></div></div><div class="grid grid-cols-2 gap-2 border-t border-gray-800 pt-4"><div class="flex flex-col"><div class="flex items-center gap-2 mb-1"><div class="w-1.5 h-1.5 rounded-full border border-white"></div><span class="text-white font-bold text-xs uppercase">${m.role || 'Membro'}</span></div><span class="text-[10px] text-gray-500 uppercase font-medium">Função</span></div><div class="flex flex-col"><div class="flex items-center gap-2 mb-1"><img src="${roleImage}" class="w-4 h-4 object-contain"><span class="text-white font-bold text-xs uppercase">${m.gameRole || 'Flex'}</span></div><span class="text-[10px] text-gray-500 uppercase font-medium">Role</span></div></div></div>`;
        }).join('');
        container.innerHTML = `<div class="animate-fadeIn"><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${cards || '<p class="text-gray-500">Nenhum jogador.</p>'}</div></div>`;
    }
    else if (tabName === 'matches') { container.innerHTML = `<div class="animate-fadeIn space-y-4"><p class="text-center text-gray-600 text-sm pt-8">Nenhuma partida recente.</p></div>`; }
    if(window.lucide) lucide.createIcons();
}

// --- CONFIGURAÇÕES DE TIME (GERENCIAMENTO) ---

export function renderTeamSettings(teamId) {
    const allTeams = JSON.parse(localStorage.getItem('u4nted_teams_db') || '[]');
    const t = allTeams.find(team => String(team.id) === String(teamId));
    if(!t) return;
    state.currentTeamId = t.id;
    if (!t.socials) t.socials = { twitter: '', instagram: '' };

    const content = document.getElementById('page-content');
    
    // NOTA: Adicionei o modal de deletar personalizado e corrigi o layout do modal de player
    content.innerHTML = `
        <div class="max-w-7xl mx-auto px-6 py-10 animate-fadeIn">
            <button onclick="navigateToPage('team-detail-${t.id}')" class="flex items-center gap-2 text-gray-500 hover:text-white text-sm font-bold mb-6 transition-colors">
                <i data-lucide="arrow-left" class="w-4 h-4"></i> Voltar para o perfil
            </button>
            <h1 class="text-2xl font-black text-white uppercase mb-2">Configurações do time</h1>

            <div class="flex flex-col lg:flex-row gap-8 mt-8">
                <div class="w-full lg:w-64 flex flex-col gap-2">
                    <button onclick="switchSettingsTab('info')" id="btn-set-info" class="text-left px-4 py-3 rounded-lg bg-yellow-500 text-black font-bold text-sm flex items-center gap-3 transition-all shadow-lg"><i data-lucide="info" class="w-4 h-4"></i> Informações</button>
                    <button onclick="switchSettingsTab('players')" id="btn-set-players" class="text-left px-4 py-3 rounded-lg hover:bg-[#1c1f26] text-gray-400 hover:text-white font-bold text-sm flex items-center gap-3 transition-all"><i data-lucide="users" class="w-4 h-4"></i> Jogadores</button>
                </div>

                <div class="flex-1">
                    <div id="settings-tab-info" class="settings-content">
                        <div class="bg-[#15171e] border border-gray-800 rounded-xl p-8">
                            <div class="flex gap-8 mb-8 border-b border-gray-800 pb-8">
                                <div class="flex items-center gap-4">
                                    <div class="w-20 h-20 rounded-full bg-[#0f1116] border border-gray-700 overflow-hidden relative"><img id="edit-team-logo-preview" src="${t.logo}" class="w-full h-full object-cover"></div>
                                    <div>
                                        <button onclick="document.getElementById('edit-team-logo').click()" class="bg-[#1c1f26] border border-gray-700 text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-gray-700 transition-colors">Enviar nova logo</button>
                                        <input type="file" id="edit-team-logo" hidden accept="image/*" onchange="previewEditLogo(event)">
                                    </div>
                                </div>
                                <div class="flex items-center gap-4 flex-1">
                                    <div class="h-20 w-32 rounded-lg bg-[#0f1116] border border-gray-700 overflow-hidden relative"><img id="edit-team-banner-preview" src="${t.banner || ''}" class="w-full h-full object-cover"></div>
                                    <div>
                                        <button onclick="document.getElementById('edit-team-banner').click()" class="bg-[#1c1f26] border border-gray-700 text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-gray-700 transition-colors">Enviar nova capa</button>
                                        <input type="file" id="edit-team-banner" hidden accept="image/*" onchange="previewEditBanner(event)">
                                    </div>
                                </div>
                            </div>
                            <div class="space-y-6">
                                <div><label class="block text-white text-xs font-bold mb-2">Nome</label><input id="edit-team-name" type="text" value="${t.name}" class="w-full bg-[#0f1116] border border-gray-800 text-gray-300 text-sm rounded-lg px-4 py-3 outline-none focus:border-yellow-500 transition-colors"></div>
                                <div><label class="block text-white text-xs font-bold mb-2">Tag</label><input id="edit-team-tag" type="text" value="${t.tag || ''}" class="w-full bg-[#0f1116] border border-gray-800 text-gray-300 text-sm rounded-lg px-4 py-3 outline-none focus:border-yellow-500 transition-colors"></div>
                                <div><label class="block text-white text-xs font-bold mb-2">Descrição</label><textarea id="edit-team-desc" rows="3" class="w-full bg-[#0f1116] border border-gray-800 text-gray-300 text-sm rounded-lg px-4 py-3 outline-none focus:border-yellow-500 transition-colors">${t.desc || ''}</textarea></div>
                            </div>
                            <div class="mt-8 pt-8 border-t border-gray-800">
                                <h3 class="text-white font-bold text-sm mb-4">Redes Sociais</h3>
                                <div class="grid grid-cols-2 gap-4">
                                    <div><label class="block text-gray-500 text-xs mb-1">Twitter</label><div class="flex items-center bg-[#0f1116] border border-gray-800 rounded-lg px-3"><span class="text-gray-500 text-xs">@</span><input id="edit-team-twitter" type="text" value="${t.socials.twitter || ''}" class="bg-transparent border-none text-white text-sm w-full py-3 outline-none ml-1"></div></div>
                                    <div><label class="block text-gray-500 text-xs mb-1">Instagram</label><div class="flex items-center bg-[#0f1116] border border-gray-800 rounded-lg px-3"><span class="text-gray-500 text-xs">@</span><input id="edit-team-insta" type="text" value="${t.socials.instagram || ''}" class="bg-transparent border-none text-white text-sm w-full py-3 outline-none ml-1"></div></div>
                                </div>
                            </div>
                            <div class="flex justify-between items-center mt-8 pt-8 border-t border-gray-800">
                                <button onclick="saveTeamSettings()" class="bg-[#5b4dff] hover:bg-[#4a3ecc] text-white font-bold py-2.5 px-6 rounded-lg text-sm shadow-lg shadow-indigo-500/20">Salvar Alterações</button>
                                <button onclick="openDeleteTeamModal()" class="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 font-bold py-2.5 px-6 rounded-lg text-sm transition-colors flex items-center gap-2"><i data-lucide="trash-2" class="w-4 h-4"></i> Deletar Time</button>
                            </div>
                        </div>
                    </div>

                    <div id="settings-tab-players" class="settings-content hidden">
                        <div class="flex gap-6 border-b border-gray-800 mb-6">
                            <button onclick="switchPlayerSubTab('list')" id="sub-btn-list" class="pb-3 text-sm font-bold text-white border-b-2 border-white transition-colors">Jogadores</button>
                            <button onclick="switchPlayerSubTab('history')" id="sub-btn-history" class="pb-3 text-sm font-bold text-gray-500 hover:text-gray-300 transition-colors">Histórico</button>
                            <button onclick="switchPlayerSubTab('invites')" id="sub-btn-invites" class="pb-3 text-sm font-bold text-gray-500 hover:text-gray-300 transition-colors">Convites</button>
                        </div>

                        <div id="sub-tab-list">
                            <div class="flex justify-between items-center mb-4">
                                <p class="text-gray-400 text-sm">${(t.roster || []).length} Jogadores</p>
                                <button onclick="openAddPlayerModal()" class="bg-[#5b4dff] hover:bg-[#4a3ecc] text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2"><i data-lucide="plus" class="w-4 h-4"></i> Convidar Jogador</button>
                            </div>
                            <div class="space-y-3">
                                ${(t.roster || []).map(m => `
                                    <div class="bg-[#15171e] border border-gray-800 rounded-xl p-4 flex items-center justify-between group hover:border-gray-700 transition-colors">
                                        <div class="flex items-center gap-4"><div class="w-10 h-10 rounded-full bg-gray-800 overflow-hidden"><img src="${m.photo || 'https://api.dicebear.com/7.x/avataaars/svg?seed='+m.nick}" class="w-full h-full object-cover"></div><div><h4 class="text-white font-bold text-sm">${m.nick}</h4><p class="text-gray-500 text-[10px]">Membro desde 03/12/2025</p></div></div>
                                        <div class="flex items-center gap-4">
                                            <span class="text-[10px] text-gray-400 font-bold bg-[#0f1116] px-2 py-1 rounded border border-gray-700 uppercase">${m.role || 'Membro'}</span>
                                            <span class="text-[10px] text-purple-400 font-bold bg-[#0f1116] px-2 py-1 rounded border border-gray-700 uppercase">${m.gameRole || 'Flex'}</span>
                                            <button onclick="openEditPlayerModal('${m.uid}', '${m.nick}', '${m.role}', '${m.gameRole}')" class="w-8 h-8 rounded-lg bg-[#0f1116] border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                                            <button onclick="removePlayer('${m.uid}')" class="w-8 h-8 rounded-lg bg-[#0f1116] border border-red-900/30 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors"><i data-lucide="trash" class="w-4 h-4"></i></button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div id="sub-tab-history" class="hidden">
                             <div class="bg-[#15171e] border border-gray-800 rounded-xl overflow-hidden">
                                <table class="w-full text-left"><thead class="bg-[#1c1f26] border-b border-gray-800 text-gray-500 text-xs uppercase"><tr><th class="p-4">Player</th><th class="p-4">Ação</th><th class="p-4 text-right">Data</th></tr></thead>
                                    <tbody class="text-sm"><tr class="border-b border-gray-800/50"><td class="p-4 flex items-center gap-3 text-white font-bold"><div class="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px]">Z</div> ZenitH</td><td class="p-4"><span class="bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs font-bold border border-green-500/20">Entrou</span></td><td class="p-4 text-right text-gray-400">03/12/2025</td></tr></tbody>
                                </table>
                             </div>
                        </div>

                        <div id="sub-tab-invites" class="hidden">
                             <div class="bg-[#15171e] border border-gray-800 rounded-xl overflow-hidden">
                                <table class="w-full text-left"><thead class="bg-[#1c1f26] border-b border-gray-800 text-gray-500 text-xs uppercase"><tr><th class="p-4">Player</th><th class="p-4">Status</th><th class="p-4 text-right">Enviado</th></tr></thead>
                                    <tbody class="text-sm"><tr class="border-b border-gray-800/50"><td colspan="3" class="p-4 text-center text-gray-500">Nenhum convite pendente.</td></tr></tbody>
                                </table>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="edit-player-modal" class="fixed inset-0 bg-black/80 z-50 hidden items-center justify-center p-4 backdrop-blur-sm">
            <div class="bg-[#15171e] w-full max-w-md rounded-xl border border-gray-800 shadow-2xl p-6">
                <h3 class="text-white font-bold text-lg mb-6">Editar Função</h3>
                <div class="bg-[#1c1f26] border border-gray-800 rounded-lg p-3 flex items-center gap-3 mb-6"><div class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-sm" id="modal-p-avatar"></div><h4 class="text-white font-bold text-sm" id="modal-p-nick"></h4></div>
                <input type="hidden" id="modal-p-uid">
                <div class="space-y-4 mb-8">
                    <div><label class="block text-white text-xs font-bold mb-2">Função no Time</label><select id="modal-p-role" class="w-full bg-[#1c1f26] border border-gray-700 text-white px-4 py-3 rounded-lg text-sm outline-none focus:border-yellow-500"><option value="Membro">Membro</option><option value="Capitão">Capitão</option><option value="Coach">Coach</option><option value="6º Player">6º Player</option></select></div>
                    <div><label class="block text-white text-xs font-bold mb-2">Função no Jogo (Valorant)</label><select id="modal-p-gameRole" class="w-full bg-[#1c1f26] border border-gray-700 text-white px-4 py-3 rounded-lg text-sm outline-none focus:border-purple-500"><option value="Flex">FLEX</option><option value="Duelista">DUELISTA</option><option value="Controlador">CONTROLADOR</option><option value="Iniciador">INICIADOR</option><option value="Sentinela">SENTINELA</option></select></div>
                </div>
                <div class="flex justify-end gap-3"><button onclick="closeEditPlayerModal()" class="text-white font-bold text-sm px-4 py-2 hover:bg-white/5 rounded-lg">Cancelar</button><button onclick="savePlayerEdit()" class="bg-[#5b4dff] text-white font-bold py-2 px-6 rounded-lg text-sm shadow-lg">Salvar</button></div>
            </div>
        </div>
        
        <div id="add-player-modal" class="fixed inset-0 bg-black/80 z-50 hidden items-center justify-center p-4 backdrop-blur-sm">
            <div class="bg-[#15171e] w-full max-w-sm rounded-xl border border-gray-800 shadow-2xl p-6">
                <h3 class="text-white font-bold text-lg mb-4">Recrutar Jogador</h3>
                <input type="text" id="recruit-nick" placeholder="Nick exato..." class="w-full bg-[#0f1116] border border-gray-800 text-white px-4 py-3 rounded-lg text-sm mb-4 outline-none focus:border-yellow-500">
                <div class="flex justify-end gap-3"><button onclick="document.getElementById('add-player-modal').classList.add('hidden'); document.getElementById('add-player-modal').classList.remove('flex');" class="text-gray-500 text-sm font-bold">Cancelar</button><button onclick="confirmAddPlayer()" class="bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-bold">Adicionar</button></div>
            </div>
        </div>

        <div id="delete-team-modal" class="fixed inset-0 bg-black/80 z-50 hidden items-center justify-center p-4 backdrop-blur-sm">
            <div class="bg-[#15171e] w-full max-w-md rounded-xl border border-gray-800 shadow-2xl p-6">
                <h3 class="text-white font-bold text-lg mb-2">Confirmar Saída do Time</h3>
                <p class="text-gray-400 text-sm mb-6 leading-relaxed">
                    Você tem certeza que deseja deletar o time? Você e todos os jogadores serão removidos e o time deixará de existir. Esta ação não poderá ser desfeita.
                </p>
                <div class="flex justify-end gap-3">
                    <button onclick="closeDeleteTeamModal()" class="bg-[#1c1f26] hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg text-sm border border-gray-700 transition-colors">Cancelar</button>
                    <button onclick="confirmDeleteTeam()" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm shadow-lg shadow-red-900/20 transition-colors">Sim, quero sair</button>
                </div>
            </div>
        </div>
    `;
    if(window.lucide) lucide.createIcons();
}

// --- FUNÇÕES AUXILIARES ---

export function switchSettingsTab(tab) {
    document.querySelectorAll('.settings-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(`settings-tab-${tab}`).classList.remove('hidden');
    const btnInfo = document.getElementById('btn-set-info');
    const btnPlayers = document.getElementById('btn-set-players');
    if(tab === 'info') {
        btnInfo.className = "text-left px-4 py-3 rounded-lg bg-yellow-500 text-black font-bold text-sm flex items-center gap-3 transition-all shadow-lg";
        btnPlayers.className = "text-left px-4 py-3 rounded-lg hover:bg-[#1c1f26] text-gray-400 hover:text-white font-bold text-sm flex items-center gap-3 transition-all";
    } else {
        btnInfo.className = "text-left px-4 py-3 rounded-lg hover:bg-[#1c1f26] text-gray-400 hover:text-white font-bold text-sm flex items-center gap-3 transition-all";
        btnPlayers.className = "text-left px-4 py-3 rounded-lg bg-yellow-500 text-black font-bold text-sm flex items-center gap-3 transition-all shadow-lg";
    }
    if(window.lucide) lucide.createIcons();
}

export function switchPlayerSubTab(tab) {
    ['list', 'history', 'invites'].forEach(t => {
        document.getElementById(`sub-tab-${t}`).classList.add('hidden');
        document.getElementById(`sub-btn-${t}`).className = "pb-3 text-sm font-bold text-gray-500 hover:text-gray-300 transition-colors";
    });
    document.getElementById(`sub-tab-${tab}`).classList.remove('hidden');
    document.getElementById(`sub-btn-${tab}`).className = "pb-3 text-sm font-bold text-white border-b-2 border-white transition-colors";
}

// UPLOADS FIXOS
export function previewEditLogo(e) {
    const file = e.target.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            document.getElementById('edit-team-logo-preview').src = ev.target.result;
            state.tempTeamLogo = ev.target.result; 
        };
        reader.readAsDataURL(file);
    }
}
export function previewEditBanner(e) {
    const file = e.target.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            document.getElementById('edit-team-banner-preview').src = ev.target.result;
            state.tempTourBanner = ev.target.result; 
        };
        reader.readAsDataURL(file);
    }
}

export function saveTeamSettings() {
    const teams = JSON.parse(localStorage.getItem('u4nted_teams_db') || '[]');
    const idx = teams.findIndex(t => String(t.id) === String(state.currentTeamId));
    
    if (idx > -1) {
        // Pega valores e garante que não são nulos
        const nameVal = document.getElementById('edit-team-name').value;
        const tagVal = document.getElementById('edit-team-tag').value;
        const descVal = document.getElementById('edit-team-desc').value;
        const twitterVal = document.getElementById('edit-team-twitter').value;
        const instaVal = document.getElementById('edit-team-insta').value;

        teams[idx].name = nameVal;
        teams[idx].tag = tagVal;
        teams[idx].desc = descVal;
        if(!teams[idx].socials) teams[idx].socials = {};
        teams[idx].socials.twitter = twitterVal;
        teams[idx].socials.instagram = instaVal;
        
        // Verifica se houve nova imagem carregada
        if (state.tempTeamLogo && state.tempTeamLogo !== "") teams[idx].logo = state.tempTeamLogo;
        if (state.tempTourBanner && state.tempTourBanner !== "") teams[idx].banner = state.tempTourBanner;

        localStorage.setItem('u4nted_teams_db', JSON.stringify(teams));
        state.tempTeamLogo = ""; state.tempTourBanner = ""; 
        
        if(window.showToast) window.showToast("Configurações salvas!", "success");
        
        // Recarrega a tela para mostrar as mudanças
        renderTeamSettings(state.currentTeamId);
    } else {
        if(window.showToast) window.showToast("Erro ao salvar (time não encontrado).", "error");
    }
}

// NOVAS FUNÇÕES DO MODAL DE EXCLUIR (EXPORTADAS)
export function openDeleteTeamModal() {
    document.getElementById('delete-team-modal').classList.remove('hidden');
    document.getElementById('delete-team-modal').classList.add('flex');
}

export function closeDeleteTeamModal() {
    document.getElementById('delete-team-modal').classList.add('hidden');
    document.getElementById('delete-team-modal').classList.remove('flex');
}

export function confirmDeleteTeam() {
    let teams = JSON.parse(localStorage.getItem('u4nted_teams_db') || '[]');
    teams = teams.filter(t => String(t.id) !== String(state.currentTeamId));
    localStorage.setItem('u4nted_teams_db', JSON.stringify(teams));
    
    closeDeleteTeamModal();
    window.navigateToPage('times');
    
    if(window.showToast) window.showToast("Time excluído com sucesso!", "success");
}

// Função ANTIGA de delete (mantida como referência ou deletada se preferir)
export function deleteTeam() {
    // Redireciona para o novo modal
    openDeleteTeamModal();
}

// ... Resto das funções mantidas ...
export function openCreateTeamModal() { document.getElementById('create-team-modal').classList.remove('hidden'); document.getElementById('create-team-modal').classList.add('flex'); }
export function closeCreateTeamModal() { document.getElementById('create-team-modal').classList.add('hidden'); document.getElementById('create-team-modal').classList.remove('flex'); }
export async function handleCreateTeamForm(e) {
    e.preventDefault();
    const userJson = localStorage.getItem('u4nted_user'); if(!userJson) return;
    const user = JSON.parse(userJson);
    const name = document.getElementById('new-team-name').value;
    const tag = document.getElementById('new-team-tag').value.toUpperCase();
    const desc = document.getElementById('new-team-desc').value;
    const finalLogo = state.tempTeamLogo || `https://api.dicebear.com/7.x/identicon/svg?seed=${name}`;

    try {
        const localTeams = JSON.parse(localStorage.getItem('u4nted_teams_db') || '[]');
        const newId = Date.now();
        const newTeam = { id: newId, name, tag, desc, wins: 0, losses: 0, matches: 0, members: 1, logo: finalLogo, banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80", socials: { twitter: "", instagram: "" }, ownerId: user.uid, roster: [{ uid: user.uid, nick: user.nick || user.name, name: user.name, photo: user.photo, role: 'Capitão', gameRole: 'Flex' }] };
        localTeams.push(newTeam);
        localStorage.setItem('u4nted_teams_db', JSON.stringify(localTeams));
        closeCreateTeamModal();
        if(window.showToast) window.showToast("Time criado!", "success");
        setTimeout(() => window.navigateToPage(`team-detail-${newId}`), 500);
    } catch (e) { console.error(e); if(window.showToast) window.showToast("Erro ao criar.", "error"); }
}

// AQUI ESTAVA O PROBLEMA DO MODAL DE PLAYER
export function openAddPlayerModal() { 
    const modal = document.getElementById('add-player-modal');
    modal.classList.remove('hidden'); 
    modal.classList.add('flex'); // <--- ADICIONADO ISSO PARA CENTRALIZAR
}

export function confirmAddPlayer() {
    const nick = document.getElementById('recruit-nick').value;
    if(!nick) return;
    const modal = document.getElementById('add-player-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    if(window.showToast) window.showToast(`Convite enviado para ${nick}!`, "success");
}
export function openEditPlayerModal(uid, nick, role, gameRole) {
    document.getElementById('modal-p-uid').value = uid;
    document.getElementById('modal-p-nick').innerText = nick;
    document.getElementById('modal-p-avatar').innerText = nick.charAt(0).toUpperCase();
    document.getElementById('modal-p-role').value = role || 'Membro';
    document.getElementById('modal-p-gameRole').value = gameRole || 'Flex';
    document.getElementById('edit-player-modal').classList.remove('hidden');
    document.getElementById('edit-player-modal').classList.add('flex');
}
export function closeEditPlayerModal() { document.getElementById('edit-player-modal').classList.add('hidden'); document.getElementById('edit-player-modal').classList.remove('flex'); }
export function savePlayerEdit() {
    const uid = document.getElementById('modal-p-uid').value;
    const newRole = document.getElementById('modal-p-role').value;
    const newGameRole = document.getElementById('modal-p-gameRole').value;
    const teams = JSON.parse(localStorage.getItem('u4nted_teams_db') || '[]');
    const teamIndex = teams.findIndex(t => String(t.id) === String(state.currentTeamId));
    if (teamIndex > -1) {
        const playerIndex = teams[teamIndex].roster.findIndex(m => String(m.uid) === String(uid));
        if(playerIndex > -1) {
            teams[teamIndex].roster[playerIndex].role = newRole;
            teams[teamIndex].roster[playerIndex].gameRole = newGameRole;
            localStorage.setItem('u4nted_teams_db', JSON.stringify(teams));
            closeEditPlayerModal();
            renderTeamSettings(state.currentTeamId);
            setTimeout(() => switchSettingsTab('players'), 50); 
            if(window.showToast) window.showToast("Jogador atualizado!", "success");
        }
    }
}
export function removePlayer(uid) {
    if(!confirm("Remover?")) return;
    const teams = JSON.parse(localStorage.getItem('u4nted_teams_db') || '[]');
    const idx = teams.findIndex(t => String(t.id) === String(state.currentTeamId));
    if (idx > -1) {
        teams[idx].roster = teams[idx].roster.filter(m => String(m.uid) !== String(uid));
        localStorage.setItem('u4nted_teams_db', JSON.stringify(teams));
        renderTeamSettings(state.currentTeamId);
        setTimeout(() => switchSettingsTab('players'), 50);
        if(window.showToast) window.showToast("Jogador removido.", "success");
    }
}