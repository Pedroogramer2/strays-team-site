// js/pages/players.js
import { PLAYERS_DB, TEAMS_LIST_DB } from '../database.js';

// --- LISTAGEM DE PLAYERS ---
export function generatePlayerCard(p) {
    const avatar = p.photo || p.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${p.nick}`;
    const teamBadge = p.team 
        ? `<span class="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs rounded-lg font-medium">${p.team}</span>` 
        : `<span class="px-3 py-1 bg-gray-800 text-gray-500 text-xs rounded-lg font-medium">Free Agent</span>`;

    return `
        <div onclick="window.location.href='perfil.html?uid=${p.id}'" class="bg-[#15171e] p-6 rounded-xl border border-transparent hover:border-gray-700 transition-all flex flex-col items-center text-center group cursor-pointer relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-lg group-hover:scale-110 transition-transform overflow-hidden relative z-10">
                <img src="${avatar}" class="w-full h-full object-cover">
            </div>
            <h3 class="text-white font-bold text-lg mb-1 group-hover:text-yellow-500 transition-colors relative z-10">${p.nick}</h3>
            <p class="text-gray-500 text-xs mb-4 flex items-center gap-1 relative z-10">
                <span class="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span> ${p.country || 'Brasil'}
            </p>
            <div class="relative z-10">${teamBadge}</div>
        </div>
    `;
}

export async function renderPlayersPage() {
    const content = document.getElementById('page-content');
    content.innerHTML = `<div class="text-center text-white mt-10 animate-pulse">Carregando Jogadores...</div>`;
    
    try {
        let displayList = [];
        if(window.getAllUsers) {
            try { const users = await window.getAllUsers(); if(users && users.length > 0) displayList = users; } 
            catch (err) { console.warn("Erro Firebase", err); }
        }
        if (displayList.length === 0) displayList = PLAYERS_DB;

        const cardsHtml = displayList.map(p => {
             const finalP = {
                 id: p.id || p.uid, 
                 nick: p.nick || p.name || "Sem Nick",
                 avatar: p.photo || p.avatar,
                 country: p.country || "Brasil",
                 team: p.team || null
             };
             return generatePlayerCard(finalP);
        }).join('');

        content.innerHTML = `
            <div class="animate-fadeIn max-w-7xl mx-auto pb-20">
                <div class="mb-10 text-center">
                    <h1 class="text-4xl font-black text-white mb-4 uppercase">Jogadores</h1>
                    <p class="text-gray-400">Explore os melhores jogadores da plataforma.</p>
                </div>
                <div class="relative w-full max-w-xl mx-auto mb-10">
                    <input id="player-search" type="text" placeholder="Procurar jogador pelo nick..." class="w-full bg-[#15171e] border border-gray-800 text-white p-4 pl-12 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors">
                    <i data-lucide="search" class="absolute left-4 top-4 text-gray-500"></i>
                </div>
                <div id="players-grid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    ${cardsHtml}
                </div>
            </div>
        `;
        if(window.lucide) lucide.createIcons();
        
        // Busca
        const input = document.getElementById('player-search');
        if(input) {
            input.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = displayList.filter(p => (p.nick || p.name || '').toLowerCase().includes(term));
                document.getElementById('players-grid').innerHTML = filtered.map(p => {
                    const finalP = { id: p.id||p.uid, nick: p.nick||p.name, avatar: p.photo||p.avatar, country: p.country||"Brasil", team: p.team };
                    return generatePlayerCard(finalP);
                }).join('');
            });
        }
    } catch (e) {
        console.error(e);
        content.innerHTML = `<div class="text-center text-red-500 mt-10">Erro ao carregar lista.</div>`;
    }
}

// --- PERFIL PÚBLICO DO JOGADOR ---
export async function renderPlayerDetailPage(playerId) {
    const content = document.getElementById('page-content');
    content.innerHTML = `<div class="text-center text-white mt-10">Carregando perfil...</div>`;

    // 1. Tenta achar o user (Mock ou Firebase)
    let p = PLAYERS_DB.find(pl => String(pl.id) === String(playerId));
    
    // Se não achou no mock, tenta buscar do Firebase se tivermos a lista carregada
    if (!p && window.getAllUsers) {
        const users = await window.getAllUsers();
        const found = users.find(u => String(u.id) === String(playerId));
        if(found) {
            p = {
                id: found.id,
                nick: found.nick || found.name,
                name: found.name,
                avatar: found.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${found.nick}`,
                country: "Brasil",
                bio: found.bio || "Sem assinatura definida.",
                socials: found.socials || {},
                team: found.team || null,
                stats: { matches: 0, tournaments: 0, mvp: 0 } // Mock stats por enquanto
            };
        }
    }

    if (!p) {
        content.innerHTML = `<div class="text-center text-red-500 mt-10">Jogador não encontrado.</div>`;
        return;
    }

    // 2. Verifica se é o próprio usuário logado (para mostrar/esconder botão Editar)
    const userJson = localStorage.getItem('u4nted_user');
    const loggedUser = userJson ? JSON.parse(userJson) : null;
    const isMe = loggedUser && String(loggedUser.uid) === String(p.id);

    const editButton = isMe ? 
        `<a href="editar-perfil.html" class="bg-[#1c1f26] border border-gray-700 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors text-sm"><i data-lucide="edit-2" class="w-4 h-4"></i> Editar</a>` 
        : '';

    // HTML DO PERFIL (Reutilizando estrutura do perfil.html)
    content.innerHTML = `
    <div class="max-w-7xl mx-auto px-8 py-12 animate-fadeIn">
        
        <button onclick="navigateToPage('players')" class="flex items-center gap-2 text-gray-500 hover:text-white text-sm font-bold mb-8 transition-colors">
            <i data-lucide="arrow-left" class="w-4 h-4"></i> Voltar para lista
        </button>

        <div class="flex items-center justify-between mb-12">
            <div class="flex items-center gap-6">
                <div class="w-24 h-24 rounded-full bg-gray-800 border-2 border-gray-700 overflow-hidden shrink-0">
                    <img src="${p.avatar}" class="w-full h-full object-cover">
                </div>
                <div class="flex flex-col gap-1">
                    <h1 class="text-4xl font-black text-white leading-none">${p.nick}</h1>
                    <div class="flex items-center gap-4">
                        <p class="text-gray-400 text-sm font-medium">${p.name}</p>
                        <div class="flex items-center gap-3 border-l border-gray-700 pl-4">
                            ${p.socials?.twitter ? `<a href="https://twitter.com/${p.socials.twitter}" target="_blank" class="text-gray-500 hover:text-blue-400"><i data-lucide="twitter" class="w-4 h-4"></i></a>` : ''}
                            ${p.socials?.instagram ? `<a href="https://instagram.com/${p.socials.instagram}" target="_blank" class="text-gray-500 hover:text-pink-500"><i data-lucide="instagram" class="w-4 h-4"></i></a>` : ''}
                        </div>
                    </div>
                </div>
            </div>
            ${editButton}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div class="space-y-8">
                <div class="bg-[#15171e] p-6 rounded-xl border border-gray-800">
                    <h3 class="text-gray-500 text-[10px] font-bold uppercase mb-3">Assinatura</h3>
                    <p class="text-gray-300 italic text-sm">"${p.bio || 'Sem assinatura.'}"</p>
                </div>
                <div class="flex gap-6 text-sm">
                    <div class="flex items-center gap-2 text-gray-400"><i data-lucide="map-pin" class="w-4 h-4 text-purple-500"></i> ${p.country}</div>
                    <div class="flex items-center gap-2 text-gray-400"><i data-lucide="gamepad-2" class="w-4 h-4 text-purple-500"></i> Valorant</div>
                </div>
                <div>
                    <h3 class="text-gray-500 text-[10px] font-bold uppercase mb-2">Time Atual</h3>
                    ${p.team ? 
                        `<div class="bg-[#1c1f26] border border-gray-700 rounded-xl p-3 flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-gray-800"></div><span class="text-white font-bold text-sm">${p.team}</span></div>` 
                        : `<p class="text-gray-400 text-sm">Sem time.</p>`
                    }
                </div>
            </div>

            <div class="lg:col-span-2">
                <div class="flex gap-4 mb-8 border-b border-gray-800">
                    <button onclick="switchProfileTab('overview')" id="prof-btn-overview" class="px-6 py-2 text-white text-xs font-bold border-b-2 border-purple-500 mb-[-1px] transition-colors">Visão Geral</button>
                    <button onclick="switchProfileTab('matches')" id="prof-btn-matches" class="px-6 py-2 text-gray-500 hover:text-white text-xs font-bold mb-[-1px] border-b-2 border-transparent transition-colors">Partidas</button>
                </div>

                <div id="prof-tab-overview" class="animate-fadeIn">
                    <div class="grid grid-cols-3 gap-4 mb-10">
                        <div class="bg-[#15171e] border border-gray-800 p-5 rounded-xl"><i data-lucide="zap" class="w-5 h-5 text-gray-400 mb-2"></i><div class="text-2xl font-bold text-white">${p.stats?.matches || 0}</div><div class="text-[10px] text-gray-500 font-bold uppercase">Partidas</div></div>
                        <div class="bg-[#15171e] border border-gray-800 p-5 rounded-xl"><i data-lucide="trophy" class="w-5 h-5 text-gray-400 mb-2"></i><div class="text-2xl font-bold text-white">${p.stats?.tournaments || 0}</div><div class="text-[10px] text-gray-500 font-bold uppercase">Torneios</div></div>
                        <div class="bg-[#15171e] border border-gray-800 p-5 rounded-xl"><i data-lucide="medal" class="w-5 h-5 text-gray-400 mb-2"></i><div class="text-2xl font-bold text-white">${p.stats?.mvp || 0}</div><div class="text-[10px] text-gray-500 font-bold uppercase">MVPs</div></div>
                    </div>
                </div>

                <div id="prof-tab-matches" class="hidden animate-fadeIn space-y-3">
                    ${renderMatchHistoryMock()}
                </div>
            </div>
        </div>
    </div>
    `;
    lucide.createIcons();
    
    // Injeta a função de troca de aba globalmente só para essa tela
    window.switchProfileTab = (tab) => {
        const overview = document.getElementById('prof-tab-overview');
        const matches = document.getElementById('prof-tab-matches');
        const btnOver = document.getElementById('prof-btn-overview');
        const btnMatch = document.getElementById('prof-btn-matches');

        if(tab === 'overview') {
            overview.classList.remove('hidden'); matches.classList.add('hidden');
            btnOver.className = "px-6 py-2 text-white text-xs font-bold border-b-2 border-purple-500 mb-[-1px] transition-colors";
            btnMatch.className = "px-6 py-2 text-gray-500 hover:text-white text-xs font-bold mb-[-1px] border-b-2 border-transparent transition-colors";
        } else {
            overview.classList.add('hidden'); matches.classList.remove('hidden');
            btnMatch.className = "px-6 py-2 text-white text-xs font-bold border-b-2 border-purple-500 mb-[-1px] transition-colors";
            btnOver.className = "px-6 py-2 text-gray-500 hover:text-white text-xs font-bold mb-[-1px] border-b-2 border-transparent transition-colors";
        }
    };
}

function renderMatchHistoryMock() {
    // Dados falsos para preencher a aba
    const history = [
        { result: 'V', score: '13 - 9', map: 'Ascent', kda: '18/12/5', agent: 'Jett' },
        { result: 'D', score: '11 - 13', map: 'Haven', kda: '22/15/8', agent: 'Reyna' },
        { result: 'V', score: '13 - 5', map: 'Bind', kda: '15/8/10', agent: 'Omen' },
    ];

    return history.map(h => `
        <div class="flex items-center justify-between bg-[#15171e] border border-gray-800 p-4 rounded-xl hover:border-gray-700 transition-colors">
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded bg-gray-800 flex items-center justify-center font-bold text-xs text-gray-500">${h.agent}</div>
                <div>
                    <div class="text-white font-bold text-sm">${h.map}</div>
                    <div class="text-gray-500 text-xs">Competitivo</div>
                </div>
            </div>
            <div class="flex flex-col items-end">
                <span class="font-bold ${h.result === 'V' ? 'text-green-500' : 'text-red-500'}">${h.result === 'V' ? 'VITÓRIA' : 'DERROTA'}</span>
                <span class="text-white font-mono text-sm">${h.score}</span>
            </div>
            <div class="text-gray-400 text-xs font-mono">${h.kda}</div>
        </div>
    `).join('');
}