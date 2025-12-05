// js/pages/tournaments.js
import { TOURNAMENTS, TEAMS_LIST_DB, OVERVIEW_DATA } from '../database.js';
import { state } from '../state.js';

// --- LISTAGEM DE CAMPEONATOS ---

export async function renderTournamentsList() {
    const content = document.getElementById('page-content');
    
    const userJson = localStorage.getItem('u4nted_user');
    const user = userJson ? JSON.parse(userJson) : null;
    const isAdmin = user && (user.role === 'admin' || user.role === 'staff');

    const createBtn = isAdmin ? `
        <div onclick="openCreateTournamentModal()" class="bg-[#15171e]/50 rounded-xl border-2 border-dashed border-gray-700 hover:border-yellow-500 hover:bg-[#15171e] transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[250px]">
            <div class="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <i data-lucide="plus" class="w-8 h-8 text-yellow-500"></i>
            </div>
            <h3 class="text-white font-bold text-lg">Criar Campeonato</h3>
        </div>` : '';

    content.innerHTML = `<div class="p-20 text-center text-white">Carregando Campeonatos...</div>`;

    let tournamentsHtml = '';
    try {
        const q = window.query(window.collection(window.db, "tournaments"), window.orderBy("createdAt", "desc"));
        const querySnapshot = await window.getDocs(q);
        
        const dbTournaments = [];
        querySnapshot.forEach((doc) => { dbTournaments.push({ id: doc.id, ...doc.data() }); });
        const listToRender = dbTournaments.length > 0 ? dbTournaments : TOURNAMENTS;

        tournamentsHtml = listToRender.map(t => `
            <div class="bg-[#15171e] rounded-xl overflow-hidden border border-gray-800 hover:border-yellow-500 transition-all cursor-pointer group shadow-lg" onclick="navigateToPage('campeonato-${t.id}')">
                <div class="h-48 bg-cover bg-center relative" style="background-image: url('${t.image}')">
                    <span class="absolute top-4 right-4 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase shadow-lg">${t.status}</span>
                </div>
                <div class="p-6">
                    <h3 class="text-xl font-bold text-white mb-2 group-hover:text-yellow-500 transition-colors">${t.name}</h3>
                    <div class="flex justify-between text-sm text-gray-400 mt-4 border-t border-gray-800 pt-4">
                        <span>${t.registeredTeams || 0}/${t.maxTeams} Times</span>
                        <span class="text-yellow-500 font-bold">${t.prize}</span>
                    </div>
                </div>
            </div>
        `).join('');

        if (listToRender.length === 0 && !isAdmin) tournamentsHtml = '<div class="col-span-3 text-center text-gray-500">Nenhum campeonato ativo no momento.</div>';
    } catch (e) {
        console.error(e);
        tournamentsHtml = '<div class="text-red-500">Erro ao carregar campeonatos.</div>';
    }

    content.innerHTML = `
        <div class="animate-fadeIn p-8 max-w-7xl mx-auto">
            <h1 class="text-3xl font-bold text-white mb-8 text-center uppercase tracking-wider">Campeonatos <span class="text-yellow-500">Strays Legends</span></h1>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${createBtn}
                ${tournamentsHtml}
            </div>
        </div>
    `;
    if(window.lucide) lucide.createIcons();
}

// --- DETALHES DO CAMPEONATO ---

export async function renderTournamentPro(tournamentId) {
    const content = document.getElementById('page-content');
    content.innerHTML = `<div class="p-20 text-center text-white">Carregando Detalhes...</div>`;

    try {
        let t = null;
        // Tenta buscar do Firebase
        if(window.doc && window.getDoc && window.db) {
            const docSnap = await window.getDoc(window.doc(window.db, "tournaments", tournamentId));
            if(docSnap.exists()) t = { id: docSnap.id, ...docSnap.data() };
        }
        if(!t) t = TOURNAMENTS.find(tr => tr.id === tournamentId) || TOURNAMENTS[0];

        // Inicia lógica de grupos e chaves se não existir
        if(state.groups.length === 0) {
            state.groups = generateGroups(TEAMS_LIST_DB);
            state.bracket = generateEmptyBracket(TEAMS_LIST_DB);
        }

        const userJson = localStorage.getItem('u4nted_user');
        const user = userJson ? JSON.parse(userJson) : null;
        const isAdmin = user && (user.role === 'admin' || user.role === 'staff');

        // Botão de Inscrição
        let actionButton = '';
        const requests = t.requests || [];
        const approvedTeams = t.registeredTeamsList || []; 
        let myTeamId = null;
        if(user) {
            const localTeams = JSON.parse(localStorage.getItem('u4nted_teams_db') || '[]');
            const myTeam = localTeams.find(tm => tm.ownerId === user.uid);
            if(myTeam) myTeamId = myTeam.id;
        }

        if (!user) actionButton = `<button onclick="window.location.href='login.html'" class="bg-gray-700 text-white font-bold py-3 px-8 rounded-lg">Login</button>`;
        else if (!myTeamId) actionButton = `<button onclick="navigateToPage('times')" class="bg-gray-700 text-white font-bold py-3 px-8 rounded-lg">Crie um Time</button>`;
        else {
            const isApproved = approvedTeams.includes(String(myTeamId));
            const isPending = requests.some(r => String(r.teamId) === String(myTeamId));
            if (isApproved) actionButton = `<button class="bg-green-600 text-white font-bold py-3 px-8 rounded-lg cursor-default border border-green-400">Inscrito ✅</button>`;
            else if (isPending) actionButton = `<button class="bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg cursor-default border border-yellow-400">Pendente ⏳</button>`;
            else actionButton = `<button onclick="subscribeTeam('${t.id}', '${myTeamId}')" class="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-8 rounded-lg shadow-[0_0_20px_rgba(234,179,8,0.4)]">Inscrever Time</button>`;
        }

        // Área Admin
        let adminArea = '';
        if (isAdmin) {
            const pendingList = requests.length > 0 ? requests.map(req => `
                <div class="flex items-center justify-between bg-[#1c1f26] p-3 rounded border border-gray-700 mb-2">
                    <span class="text-white text-sm">${req.teamName}</span>
                    <div class="flex gap-2">
                        <button onclick="approveTeam('${t.id}', '${req.teamId}', '${req.teamName}')" class="text-green-500 hover:text-white text-xs font-bold border border-green-500 px-2 py-1 rounded">Aprovar</button>
                        <button onclick="rejectTeam('${t.id}', '${req.teamId}')" class="text-red-500 hover:text-white text-xs font-bold border border-red-500 px-2 py-1 rounded">Recusar</button>
                    </div>
                </div>
            `).join('') : '<p class="text-gray-500 text-xs">Nenhuma solicitação pendente.</p>';
            adminArea = `<div class="mt-8 p-6 bg-[#15171e] border border-red-900/50 rounded-xl"><h3 class="text-red-500 font-bold mb-4 flex items-center gap-2"><i data-lucide="shield-alert"></i> Admin Area</h3><div class="mb-4"><h4 class="text-white text-sm font-bold mb-2">Solicitações (${requests.length})</h4>${pendingList}</div></div>`;
        }

        // HTML Principal
        content.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 animate-fadeIn">
            <header class="relative w-full h-80 rounded-3xl overflow-hidden mb-8 group shadow-2xl border border-gray-800">
                <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('${t.image}')"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-[#0f1116] via-[#0f1116]/60 to-transparent"></div>
                <div class="absolute bottom-0 left-0 w-full p-8 flex flex-col md:flex-row justify-between items-end gap-6">
                    <div class="flex items-center gap-6">
                         <div class="w-24 h-24 rounded-2xl overflow-hidden border-2 border-gray-700 shadow-lg shrink-0 bg-black"><img src="${t.logo}" class="w-full h-full object-cover"></div>
                        <div>
                            <h1 class="text-4xl font-black text-white mb-2 uppercase italic tracking-wider">${t.name}</h1>
                            <div class="flex gap-3"><span class="px-3 py-1 rounded bg-yellow-500 text-black text-xs font-bold uppercase">${t.status}</span><span class="px-3 py-1 rounded bg-gray-800 text-white text-xs font-bold border border-gray-700">${t.format}</span></div>
                        </div>
                    </div>
                    <div class="flex flex-col items-end gap-4"><div class="text-right"><p class="text-gray-400 text-xs font-bold uppercase">Premiação</p><p class="text-3xl font-black text-yellow-500 text-shadow-glow">${t.prize}</p></div>${actionButton}</div>
                </div>
                <button onclick="navigateToPage('campeonatos')" class="absolute top-6 left-6 text-white bg-black/40 hover:bg-black/60 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10 transition-all flex items-center gap-2 text-sm font-bold"><i data-lucide="arrow-left" class="w-4 h-4"></i> Voltar</button>
            </header>
            ${adminArea}
            <div class="flex justify-between items-center mb-6 border-b border-gray-800 pb-2 overflow-x-auto">
                <nav class="flex gap-8">
                     <button onclick="switchTab('Visão Geral')" class="nav-btn pb-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 text-white border-yellow-500" data-tab="Visão Geral">VISÃO GERAL</button>
                     <button onclick="switchTab('Times')" class="nav-btn pb-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 border-transparent text-gray-500 hover:text-white" data-tab="Times">TIMES</button>
                     <button onclick="switchTab('PlayOffs')" class="nav-btn pb-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 border-transparent text-gray-500 hover:text-white" data-tab="PlayOffs">BRACKET</button>
                </nav>
            </div>
            <main>
                <div id="tab-Visão Geral" class="tab-content animate-fadeIn">
                     <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div class="bg-[#15171e] p-6 rounded-xl border border-gray-800"><div class="text-gray-500 text-xs font-bold uppercase mb-1">Vagas</div><div class="text-xl font-bold text-white">${approvedTeams.length}/${t.maxTeams}</div></div>
                        <div class="bg-[#15171e] p-6 rounded-xl border border-gray-800"><div class="text-gray-500 text-xs font-bold uppercase mb-1">Início</div><div class="text-xl font-bold text-white">15/09</div></div>
                        <div class="bg-[#15171e] p-6 rounded-xl border border-gray-800"><div class="text-gray-500 text-xs font-bold uppercase mb-1">Taxa</div><div class="text-xl font-bold text-white">R$ 50,00</div></div>
                        <div class="bg-[#15171e] p-6 rounded-xl border border-gray-800"><div class="text-gray-500 text-xs font-bold uppercase mb-1">Status</div><div class="text-xl font-bold text-green-500">Aberto</div></div>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div class="lg:col-span-3 space-y-4">
                            <div class="bg-[#15171e] rounded-xl border border-gray-800 p-4 flex justify-between items-center"><span class="block text-white font-bold">1º Lugar</span><span class="block text-white font-bold">R$ 570</span></div>
                            <div class="bg-[#5865F2] hover:bg-[#4752c4] rounded-xl p-6 cursor-pointer transition-colors shadow-lg flex items-center gap-4"><i data-lucide="message-circle" class="text-white w-8 h-8"></i><div><div class="text-xs text-white/80 font-bold uppercase">Dúvidas?</div><div class="text-white font-black text-lg uppercase">Discord</div></div></div>
                        </div>
                         <div class="lg:col-span-4 space-y-4">
                            ${Object.keys(OVERVIEW_DATA).map(key => `<div id="btn-${key}" onclick="switchOverviewInfo('${key}')" class="overview-btn w-full bg-[#15171e] border border-gray-800 rounded-xl p-5 cursor-pointer text-left"><h3 class="btn-title text-white font-bold text-lg">${OVERVIEW_DATA[key].title}</h3></div>`).join('')}
                        </div>
                        <div class="lg:col-span-5 pl-4 pt-2" id="overview-dynamic-text"></div>
                    </div>
                </div>

                <div id="tab-Times" class="tab-content hidden-section animate-fadeIn">
                     <div id="teams-grid" class="grid grid-cols-1 md:grid-cols-3 gap-4"></div>
                </div>
                
                <div id="tab-PlayOffs" class="tab-content hidden-section animate-fadeIn">
                    <div class="overflow-x-auto pb-12 pt-4 scrollbar-thin"><div id="bracket-container" class="flex gap-16 min-w-max px-4"></div></div>
                </div>
            </main>
        </div>`;
        
        // Renderiza sub-componentes
        renderTeamsList();
        renderBracketDOM(isAdmin);
        setTimeout(() => switchOverviewInfo('inscricao'), 100);
        if(window.lucide) lucide.createIcons();

    } catch (e) {
        console.error(e);
        content.innerHTML = `<div class="text-center text-red-500 mt-20">Erro ao carregar torneio.</div>`;
    }
}

// --- FUNÇÕES DE INTERAÇÃO (OVERVIEW) ---

export function switchOverviewInfo(key) {
    const data = OVERVIEW_DATA[key];
    const container = document.getElementById('overview-dynamic-text');
    if(!container) return;
    
    // Reset estilos
    document.querySelectorAll('.overview-btn').forEach(btn => btn.className = "overview-btn w-full bg-[#15171e] border border-gray-800 rounded-xl p-5 cursor-pointer text-left");
    const activeBtn = document.getElementById(`btn-${key}`);
    if(activeBtn) activeBtn.className = "overview-btn w-full bg-yellow-500 rounded-xl p-5 cursor-default text-left shadow-lg";

    container.innerHTML = `<h3 class="text-2xl font-bold text-white mb-6">${data.title}</h3><div>${data.content}</div>`;
    if(window.lucide) lucide.createIcons();
}

// --- FUNÇÕES DE INSCRIÇÃO ---

export async function subscribeTeam(tourId, teamId) {
    if(!confirm("Deseja inscrever seu time?")) return;
    try {
        const userJson = localStorage.getItem('u4nted_user');
        const user = JSON.parse(userJson);
        const tourRef = window.doc(window.db, "tournaments", tourId);
        
        const localTeams = JSON.parse(localStorage.getItem('u4nted_teams_db') || '[]');
        const myTeam = localTeams.find(t => String(t.id) === String(teamId));
        if(!myTeam) throw new Error("Time não encontrado.");

        await window.updateDoc(tourRef, { requests: window.arrayUnion({ teamId: String(teamId), teamName: myTeam.name, captainUid: user.uid, status: 'pending' }) });
        alert("Solicitação enviada!");
        renderTournamentPro(tourId);
    } catch (e) { console.error(e); alert("Erro: " + e.message); }
}

export async function approveTeam(tourId, teamId, teamName) {
    if(!confirm(`Aprovar ${teamName}?`)) return;
    try {
        const tourRef = window.doc(window.db, "tournaments", tourId);
        const tourSnap = await window.getDoc(tourRef);
        const tourData = tourSnap.data();
        const newRequests = tourData.requests.filter(r => String(r.teamId) !== String(teamId));
        const newApproved = tourData.registeredTeamsList || [];
        if(!newApproved.includes(String(teamId))) newApproved.push(String(teamId));

        await window.updateDoc(tourRef, { requests: newRequests, registeredTeamsList: newApproved, registeredTeams: newApproved.length });
        alert("Aprovado!");
        renderTournamentPro(tourId);
    } catch (e) { console.error(e); }
}

export async function rejectTeam(tourId, teamId) {
    if(!confirm("Recusar?")) return;
    try {
        const tourRef = window.doc(window.db, "tournaments", tourId);
        const tourSnap = await window.getDoc(tourRef);
        const tourData = tourSnap.data();
        const newRequests = tourData.requests.filter(r => String(r.teamId) !== String(teamId));
        await window.updateDoc(tourRef, { requests: newRequests });
        renderTournamentPro(tourId);
    } catch (e) { console.error(e); }
}

// --- FUNÇÕES DE CHAVEAMENTO E GRUPOS ---

export function switchTab(tabName) {
    state.activeTab = tabName;
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden-section'));
    const activeEl = document.getElementById(`tab-${tabName}`);
    if(activeEl) activeEl.classList.remove('hidden-section');
    
    // Atualiza botões
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.dataset.tab === tabName) btn.classList = "nav-btn pb-4 text-sm font-bold whitespace-nowrap border-b-2 text-white border-yellow-500";
        else btn.classList = "nav-btn pb-4 text-sm font-bold whitespace-nowrap border-b-2 border-transparent text-gray-500";
    });
}

function renderTeamsList() {
    const container = document.getElementById('teams-grid');
    if (!container) return;
    container.innerHTML = TEAMS_LIST_DB.map(team => `
        <div onclick="navigateToPage('team-detail-${team.id}')" class="bg-[#15171e] rounded-xl border border-transparent hover:border-gray-700 p-4 flex items-center gap-4 cursor-pointer">
            <div class="w-12 h-12 rounded-lg bg-gray-800"><img src="${team.logo}" class="w-full h-full object-cover"></div>
            <div><h3 class="font-bold text-white text-lg">${team.name}</h3><p class="text-gray-500 text-xs">${team.members} Membros</p></div>
        </div>
    `).join('');
}

export function generateGroups(teams) {
    const shuffled = [...teams].sort(() => 0.5 - Math.random());
    const groupData = [];
    const letters = ['A', 'B', 'C', 'D'];
    for (let i = 0; i < 4; i++) {
        if (i * 4 >= shuffled.length) break;
        groupData.push({ name: `Grupo ${letters[i]}`, teams: shuffled.slice(i * 4, (i + 1) * 4) });
    }
    return groupData;
}

export function renderGroups() {
    const container = document.getElementById('groups-container');
    if (!container) return;
    container.innerHTML = state.groups.map(g => `<div class="bg-[#15171e] rounded-xl p-4"><h3 class="text-white font-bold mb-2">${g.name}</h3>${g.teams.map(t => `<div class="text-gray-400 text-sm py-1 border-b border-gray-800">${t.name}</div>`).join('')}</div>`).join('');
}

export function generateEmptyBracket(teams) {
    // Gera uma chave simples de 8 times para demo
    const rounds = [];
    let matchCount = 4; // Oitavas (8 times)
    let titles = ["Quartas", "Semis", "Final"];
    let idCounter = 1;

    for (let r = 0; r < 3; r++) {
        const matches = [];
        for(let i=0; i<matchCount; i++) {
             matches.push({ id: idCounter++, teamA: {name: "TBD"}, teamB: {name: "TBD"}, status: 'waiting', scoreA: 0, scoreB: 0 });
        }
        rounds.push({ title: titles[r], matches });
        matchCount /= 2;
    }
    // Preenche round 1
    const shuffled = [...teams].slice(0, 8);
    rounds[0].matches.forEach((m, i) => {
        m.teamA = shuffled[i*2] || {name: "BYE"};
        m.teamB = shuffled[i*2+1] || {name: "BYE"};
        m.status = 'scheduled';
    });
    return rounds;
}

export function renderBracketDOM(isAdmin) {
    const container = document.getElementById('bracket-container');
    if (!container) return;
    container.innerHTML = '';
    
    state.bracket.forEach((round, rIndex) => {
        const col = document.createElement('div');
        col.className = "flex flex-col justify-center space-y-8";
        col.innerHTML = `<h3 class="text-white font-bold text-center mb-4">${round.title}</h3>`;
        
        round.matches.forEach((m, mIndex) => {
             const adminBtn = (isAdmin && m.status !== 'finished') 
                ? `<button onclick="setMatchWinner(${rIndex}, ${mIndex}, 'teamA')" class="text-xs text-green-500 ml-2">Win A</button>` 
                : '';

            const matchHtml = `
                <div class="bg-[#15171e] border border-gray-700 rounded w-48 p-2">
                    <div class="flex justify-between ${m.isWinnerA ? 'text-green-500' : 'text-gray-300'}"><span>${m.teamA.name}</span> <span>${m.scoreA}</span></div>
                    <div class="h-[1px] bg-gray-700 my-1"></div>
                    <div class="flex justify-between ${m.isWinnerB ? 'text-green-500' : 'text-gray-300'}"><span>${m.teamB.name}</span> <span>${m.scoreB}</span></div>
                    ${adminBtn}
                </div>
            `;
            const div = document.createElement('div');
            div.innerHTML = matchHtml;
            col.appendChild(div);
        });
        container.appendChild(col);
    });
}

export function setMatchWinner(rIndex, mIndex, winnerSlot) {
    const match = state.bracket[rIndex].matches[mIndex];
    if(winnerSlot === 'teamA') { match.scoreA = 2; match.isWinnerA = true; } 
    else { match.scoreB = 2; match.isWinnerB = true; }
    match.status = 'finished';
    renderBracketDOM(true); // Re-renderiza como admin
}

// --- PAINEL ADMIN E MODAIS ---

export async function openAdminPanel() {
    const content = document.getElementById('page-content');
    content.innerHTML = `<div class="p-8"><h1 class="text-3xl text-white font-bold mb-4">Painel Admin</h1><div class="bg-[#15171e] p-6 rounded-xl"><table class="w-full text-left text-gray-300"><tbody id="admin-users-list"><tr><td>Carregando...</td></tr></tbody></table></div></div>`;
    renderAdminPanel();
}

export async function renderAdminPanel() {
    if(!window.getAllUsers) return;
    const users = await window.getAllUsers();
    const tbody = document.getElementById('admin-users-list');
    if(tbody) {
        tbody.innerHTML = users.map(u => `
            <tr class="border-b border-gray-800">
                <td class="p-3">${u.nick} <span class="text-xs text-gray-500">(${u.email})</span></td>
                <td class="p-3"><span class="bg-gray-700 px-2 py-1 rounded text-xs">${u.role}</span></td>
                <td class="p-3"><select onchange="changeUserRole('${u.id}', this.value)" class="bg-black border border-gray-600 rounded"><option value="">Mudar Cargo</option><option value="user">User</option><option value="admin">Admin</option></select></td>
            </tr>
        `).join('');
    }
}

export async function changeUserRole(uid, role) {
    if(!role) return;
    if(window.changeUserRole) await window.changeUserRole(uid, role);
    renderAdminPanel();
}

// Modais de Criação
export function openCreateTournamentModal() {
    const m = document.getElementById('create-tournament-modal');
    if(m) { m.classList.remove('hidden'); m.classList.add('flex'); }
}
export function closeCreateTournamentModal() {
    const m = document.getElementById('create-tournament-modal');
    if(m) { m.classList.add('hidden'); m.classList.remove('flex'); }
}
export function previewTourBanner(e) {
    const file = e.target.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            state.tempTourBanner = ev.target.result;
            document.getElementById('tour-banner-preview').src = state.tempTourBanner;
            document.getElementById('tour-banner-preview').classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}
export async function handleCreateTournamentForm(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerText = "Criando..."; btn.disabled = true;
    try {
        const name = document.getElementById('tour-name').value;
        const newTour = {
            name, 
            status: "Aberto", 
            maxTeams: 16, 
            registeredTeams: 0, 
            prize: document.getElementById('tour-prize').value, 
            format: document.getElementById('tour-format').value,
            image: state.tempTourBanner || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80",
            logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${name}`,
            createdAt: new Date().toISOString()
        };
        await window.addDoc(window.collection(window.db, "tournaments"), newTour);
        closeCreateTournamentModal();
        alert("Criado!");
        renderTournamentsList();
    } catch(err) { console.error(err); alert("Erro."); }
    btn.innerText = "Criar"; btn.disabled = false;
}