// js/pages/tournaments.js
import { TOURNAMENTS, TEAMS_LIST_DB, OVERVIEW_DATA } from '../database.js';
import { state } from '../state.js';
// Cole isso logo abaixo dos imports no topo do tournaments.js

function cleanTextFromHTML(htmlString) {
    if (!htmlString) return "";
    
    // 1. Converte <br> e </div> em quebra de linha (Enter)
    let text = htmlString.replace(/<br\s*\/?>/gi, "\n")
                         .replace(/<\/div>/gi, "\n")
                         .replace(/<\/li>/gi, "\n");

    // 2. Remove as tags HTML restantes
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;
    text = tempDiv.textContent || tempDiv.innerText || "";

    // 3. REMOVE AS FRASES QUE ESTAVAM DUPLICANDO (A Mágica acontece aqui)
    const frasesParaRemover = [
        "Os jogadores devem se registrar em nosso site e formar uma equipe para participar.",
        "O pagamento da inscrição será realizado via PIX.",
        "VALOR DA INSCRIÇÃO",
        "Valor:",
        "Regulamento Simplificado",
        "Agendamento dos Playoffs",
        "Cronograma",
        "Onde Assistir",
        "Todas as partidas principais serão transmitidas AO VIVO em nossos canais oficiais."
    ];

    frasesParaRemover.forEach(frase => {
        // Remove a frase onde quer que ela esteja
        text = text.split(frase).join("");
    });

    // 4. Limpa espaços extras no começo e fim
    return text.trim();
}

// --- VARIÁVEL GLOBAL PARA O ARQUIVO ---
let selectedTourBannerFile = null;

// --- UPLOAD HELPER (Para Banner) ---
async function uploadImageToFirebase(file, path) {
    if (!file) return null;
    if (!window.storage || !window.uploadBytes) {
        console.error("Storage não encontrado no window.");
        throw new Error("Sistema de upload não carregado. Recarregue a página.");
    }
    try {
        const ref = window.storageRef(window.storage, path);
        const snap = await window.uploadBytes(ref, file);
        return await window.getDownloadURL(snap.ref);
    } catch (e) {
        throw new Error("Erro no upload: " + e.message);
    }
}

// --- 1. LISTAGEM DE CAMPEONATOS ---

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

    content.innerHTML = `<div class="p-20 text-center text-white animate-pulse">Carregando Campeonatos...</div>`;

    let tournamentsHtml = '';
    try {
        const q = window.query(window.collection(window.db, "tournaments"), window.orderBy("createdAt", "desc"));
        const querySnapshot = await window.getDocs(q);
        
        const dbTournaments = [];
        querySnapshot.forEach((doc) => { dbTournaments.push({ id: doc.id, ...doc.data() }); });
        
        const listToRender = dbTournaments.length > 0 ? dbTournaments : TOURNAMENTS;

        tournamentsHtml = listToRender.map(t => {
            let statusClass = 'aberto';
            if(t.status === 'Ao Vivo') statusClass = 'aovivo';
            if(t.status === 'Concluído') statusClass = 'concluido';
            if(t.status === 'Anulado') statusClass = 'anulado';

            return `
            <div class="bg-[#15171e] rounded-xl overflow-hidden border border-gray-800 hover:border-yellow-500 transition-all cursor-pointer group shadow-lg" onclick="navigateToPage('campeonato-${t.id}')">
                <div class="h-48 bg-cover bg-center relative" style="background-image: url('${t.image}')">
                    <span class="absolute top-4 right-4 status-badge ${statusClass} text-xs font-bold px-3 py-1 rounded-full uppercase shadow-lg text-black bg-yellow-500">${t.status}</span>
                </div>
                <div class="p-6">
                    <h3 class="text-xl font-bold text-white mb-2 group-hover:text-yellow-500 transition-colors">${t.name}</h3>
                    <div class="flex justify-between text-sm text-gray-400 mt-4 border-t border-gray-800 pt-4">
                        <span>${t.registeredTeams || 0}/${t.maxTeams} Times</span>
                        <span class="text-yellow-500 font-bold">${t.prize}</span>
                    </div>
                </div>
            </div>`;
        }).join('');

        if (listToRender.length === 0 && !isAdmin) tournamentsHtml = '<div class="col-span-3 text-center text-gray-500">Nenhum campeonato ativo no momento.</div>';
    } catch (e) {
        console.error(e);
        tournamentsHtml = `<div class="text-red-500">Erro ao carregar campeonatos: ${e.message}</div>`;
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

// --- 2. DETALHES DO CAMPEONATO ---

export async function renderTournamentPro(tournamentId) {
    const content = document.getElementById('page-content');
    content.innerHTML = `<div class="p-20 text-center text-white">Carregando Detalhes...</div>`;

    try {
        let t = null;
        if(window.doc && window.getDoc && window.db) {
            const docSnap = await window.getDoc(window.doc(window.db, "tournaments", tournamentId));
            if(docSnap.exists()) t = { id: docSnap.id, ...docSnap.data() };
        }
        if(!t) t = TOURNAMENTS.find(tr => tr.id === tournamentId) || TOURNAMENTS[0];

        state.currentTournament = t;

        if(!state.bracket || state.bracket.length === 0) {
            state.groups = generateGroups(TEAMS_LIST_DB);
            state.bracket = generateEmptyBracket(TEAMS_LIST_DB);
        }

        const userJson = localStorage.getItem('u4nted_user');
        const user = userJson ? JSON.parse(userJson) : null;
        const isAdmin = user && (user.role === 'admin' || user.role === 'staff');

        let actionButton = '';
        const requests = t.requests || [];
        const approvedTeams = t.registeredTeamsList || []; 
        let myTeamId = null;
        
        if(user) {
            const localTeams = JSON.parse(localStorage.getItem('u4nted_teams_db') || '[]');
            const myTeam = localTeams.find(tm => tm.ownerId === user.uid);
            if(myTeam) myTeamId = myTeam.id;
        }

        if (isAdmin) {
            actionButton = `
                <button onclick="openEditTournamentModal('${t.id}')" class="bg-[#1c1f26] border border-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center gap-2 transition-all">
                    <i data-lucide="settings" class="w-4 h-4"></i> Gerenciar Torneio
                </button>`;
        } else {
            if (!user) {
                actionButton = `<button onclick="window.location.href='login.html'" class="bg-gray-700 text-white font-bold py-3 px-8 rounded-lg">Faça Login</button>`;
            } else if (!myTeamId) {
                actionButton = `<div class="bg-[#1c1f26] border border-gray-800 text-gray-500 text-xs font-bold py-2 px-4 rounded-lg">Necessário ter um time</div>`;
            } else {
                if (t.status !== 'Aberto') {
                    actionButton = `<button class="bg-gray-800 text-gray-400 font-bold py-3 px-8 rounded-lg cursor-not-allowed border border-gray-700">Inscrições Fechadas</button>`;
                } else {
                    const isApproved = approvedTeams.includes(String(myTeamId));
                    const isPending = requests.some(r => String(r.teamId) === String(myTeamId));
                    if (isApproved) actionButton = `<button class="bg-green-600 text-white font-bold py-3 px-8 rounded-lg cursor-default border border-green-400">Inscrito ✅</button>`;
                    else if (isPending) actionButton = `<button class="bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg cursor-default border border-yellow-400">Pendente ⏳</button>`;
                    else actionButton = `<button onclick="subscribeTeam('${t.id}', '${myTeamId}')" class="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-8 rounded-lg shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all">Inscrever Time</button>`;
                }
            }
        }

        let statusClass = 'aberto';
        if(t.status === 'Ao Vivo') statusClass = 'aovivo';
        if(t.status === 'Concluído') statusClass = 'concluido';
        if(t.status === 'Anulado') statusClass = 'anulado';

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
            adminArea = `<div class="mt-8 p-6 bg-[#15171e] border border-red-900/50 rounded-xl"><h3 class="text-red-500 font-bold mb-4 flex items-center gap-2"><i data-lucide="shield-alert"></i> Solicitações de Inscrição</h3><div class="mb-4">${pendingList}</div></div>`;
        }

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
                            <div class="flex gap-3">
                                <span class="status-badge ${statusClass} text-xs font-bold px-3 py-1 rounded-full uppercase shadow-lg bg-yellow-500 text-black">${t.status}</span>
                                <span class="px-3 py-1 rounded bg-gray-800 text-white text-xs font-bold border border-gray-700">${t.format}</span>
                            </div>
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
                        <div class="bg-[#15171e] p-6 rounded-xl border border-gray-800"><div class="text-gray-500 text-xs font-bold uppercase mb-1">Status</div><div class="text-xl font-bold text-white">${t.status}</div></div>
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
        
        renderTeamsList();
        renderBracketDOM(isAdmin);
        setTimeout(() => switchOverviewInfo('inscricao'), 100);
        if(window.lucide) lucide.createIcons();

    } catch (e) {
        console.error(e);
        content.innerHTML = `<div class="text-center text-red-500 mt-20">Erro ao carregar torneio.</div>`;
    }
}

// --- 3. TEXTOS DINÂMICOS ---
export function switchOverviewInfo(key) {
    const t = state.currentTournament;
    const defaultData = OVERVIEW_DATA[key];
    
    let contentHtml = defaultData.content;
    if (t && t.customOverview && t.customOverview[key]) {
        contentHtml = t.customOverview[key];
    }

    const container = document.getElementById('overview-dynamic-text');
    if(!container) return;
    
    document.querySelectorAll('.overview-btn').forEach(btn => btn.className = "overview-btn w-full bg-[#15171e] border border-gray-800 rounded-xl p-5 cursor-pointer text-left");
    const activeBtn = document.getElementById(`btn-${key}`);
    if(activeBtn) activeBtn.className = "overview-btn w-full bg-yellow-500 rounded-xl p-5 cursor-default text-left shadow-lg";

    container.innerHTML = `<h3 class="text-2xl font-bold text-white mb-6">${defaultData.title}</h3><div class="editable-text-area text-gray-300 leading-relaxed">${contentHtml}</div>`;
    if(window.lucide) lucide.createIcons();
}

// --- 4. ADMINISTRAÇÃO (EDITOR COM EXCLUSÃO E VISUAL BONITO) ---
// Substitua a função openEditTournamentModal inteira por esta:

export function openEditTournamentModal(tourId) {
    const t = state.currentTournament;
    if(!t) return;

    const old = document.getElementById('edit-tour-modal');
    if(old) old.remove();

    // --- AQUI A CORREÇÃO: Limpa o lixo antes de mostrar no input ---
    const valInscricao = cleanTextFromHTML(t.customOverview?.inscricao) || "R$ 10,00 por player";
    const valRegras = cleanTextFromHTML(t.customOverview?.regras) || "Regras padrão.";
    const valAgenda = cleanTextFromHTML(t.customOverview?.playoffs) || "Oitavas: 22/09\nFinal: 05/10";
    
    // Tenta manter os links se existirem
    let valTwitch = "";
    let valYoutube = "";
    if(t.customOverview?.transmissoes) {
        if(t.customOverview.transmissoes.includes("twitch.tv")) valTwitch = "https://twitch.tv/"; 
        if(t.customOverview.transmissoes.includes("youtube.com")) valYoutube = "https://youtube.com/";
    }

    const modalHtml = `
    <div id="edit-tour-modal" class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn">
        <div class="bg-[#15171e] w-full max-w-2xl rounded-2xl border border-gray-800 shadow-2xl flex flex-col max-h-[90vh]">
            
            <div class="flex justify-between items-center p-6 border-b border-gray-800 bg-[#1c1f26] rounded-t-2xl">
                <h3 class="text-white font-bold text-xl">⚡ Editor de Torneio</h3>
                <button onclick="closeEditTournamentModal()" class="text-gray-400 hover:text-white"><i data-lucide="x" class="w-6 h-6"></i></button>
            </div>

            <div class="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                
                <div class="grid grid-cols-2 gap-6">
                    <div>
                        <label class="text-xs font-bold text-gray-400 uppercase">Estado</label>
                        <select id="edit-tour-status" class="w-full bg-[#0a0a0a] border border-gray-700 text-white px-4 py-3 rounded-xl mt-1 outline-none focus:border-yellow-500">
                            <option value="Aberto" ${t.status === 'Aberto' ? 'selected' : ''}>🟢 Aberto</option>
                            <option value="Ao Vivo" ${t.status === 'Ao Vivo' ? 'selected' : ''}>🔴 Ao Vivo</option>
                            <option value="Concluído" ${t.status === 'Concluído' ? 'selected' : ''}>🏁 Concluído</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-xs font-bold text-gray-400 uppercase">Prêmio Total</label>
                        <input type="text" id="edit-tour-prize" value="${t.prize}" class="w-full bg-[#0a0a0a] border border-gray-700 text-white px-4 py-3 rounded-xl mt-1 outline-none focus:border-green-500 font-bold">
                    </div>
                </div>

                <div>
                    <label class="block text-gray-400 text-xs font-bold mb-1">Valor da Inscrição (Só o valor)</label>
                    <input type="text" id="txt-inscricao" value="${valInscricao}" class="w-full bg-[#0f1116] border border-gray-700 text-white px-4 py-3 rounded-lg text-sm outline-none focus:border-yellow-500">
                    <p class="text-[10px] text-gray-500 mt-1">O texto "Os jogadores devem se registrar..." será adicionado automaticamente.</p>
                </div>
                
                <div>
                    <label class="block text-gray-400 text-xs font-bold mb-1">Agendamento (Use Enter para pular linha)</label>
                    <textarea id="txt-playoffs" rows="5" class="w-full bg-[#0f1116] border border-gray-700 text-white px-4 py-3 rounded-lg text-sm outline-none resize-none font-mono">${valAgenda}</textarea>
                </div>

                <div>
                    <label class="block text-gray-400 text-xs font-bold mb-1">Regulamento (Use Enter para criar itens)</label>
                    <textarea id="txt-regras" rows="5" class="w-full bg-[#0f1116] border border-gray-700 text-gray-300 text-sm rounded-lg p-3 outline-none resize-none">${valRegras}</textarea>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-[#a970ff] text-xs font-bold mb-1">Link Twitch</label>
                        <input type="text" id="edit-tour-twitch" value="${valTwitch}" placeholder="https://twitch.tv/..." class="w-full bg-[#0f1116] border border-gray-700 text-white px-3 py-2 rounded-lg text-sm">
                    </div>
                    <div>
                        <label class="block text-[#ff0000] text-xs font-bold mb-1">Link YouTube</label>
                        <input type="text" id="edit-tour-youtube" value="${valYoutube}" placeholder="https://youtube.com/..." class="w-full bg-[#0f1116] border border-gray-700 text-white px-3 py-2 rounded-lg text-sm">
                    </div>
                </div>

            </div>

            <div class="p-6 border-t border-gray-800 bg-[#1c1f26] rounded-b-2xl flex justify-end gap-3">
                <button onclick="closeEditTournamentModal()" class="text-gray-400 hover:text-white font-bold text-sm px-6 py-3">Cancelar</button>
                <button onclick="saveTournamentChanges('${t.id}')" class="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-8 rounded-xl shadow-lg">Salvar Tudo</button>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if(window.lucide) lucide.createIcons();
}

export function closeEditTournamentModal() {
    const m = document.getElementById('edit-tour-modal');
    if(m) m.remove();
}

// --- CONFIRMAÇÃO DE EXCLUSÃO (MODAL NOVO) ---
export function openDeleteConfirmation(tourId) {
    const html = `
    <div id="delete-confirm-modal" class="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
        <div class="bg-[#15171e] w-full max-w-sm rounded-xl border border-red-900/50 shadow-2xl p-6 text-center">
            <div class="w-12 h-12 rounded-full bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                <i data-lucide="alert-triangle" class="text-red-500 w-6 h-6"></i>
            </div>
            <h3 class="text-white font-bold text-lg mb-2">Excluir Campeonato?</h3>
            <p class="text-gray-400 text-xs mb-6">Essa ação não pode ser desfeita. Todos os jogos e inscrições serão apagados.</p>
            
            <div class="flex gap-3 justify-center">
                <button onclick="document.getElementById('delete-confirm-modal').remove()" class="text-gray-400 hover:text-white text-sm font-bold px-4 py-2">Cancelar</button>
                <button onclick="executeDelete('${tourId}')" class="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-red-900/20">Sim, Excluir</button>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', html);
    if(window.lucide) lucide.createIcons();
}

export async function executeDelete(tourId) {
    const btn = document.querySelector('button[onclick^="executeDelete"]');
    if(btn) btn.innerText = "Apagando...";

    try {
        if (!window.deleteDoc || !window.doc || !window.db) {
            throw new Error("Funções do Firebase não encontradas. Verifique auth.js.");
        }
        await window.deleteDoc(window.doc(window.db, "tournaments", tourId));
        window.showToast("Campeonato excluído.", "success");
        document.getElementById('delete-confirm-modal').remove();
        closeEditTournamentModal();
        renderTournamentsList();
    } catch(e) {
        console.error(e);
        window.showToast("Erro ao excluir: " + e.message, "error");
        const modal = document.getElementById('delete-confirm-modal');
        if(modal) modal.remove();
    }
}

// --- SALVAR (VISUAL RECONSTRUÍDO CORRETAMENTE) ---
// Substitua a função saveTournamentChanges inteira por esta:

export async function saveTournamentChanges(tourId) {
    try {
        const btn = document.querySelector('button[onclick^="saveTournamentChanges"]');
        if(btn) btn.innerText = "Salvando...";

        const newStatus = document.getElementById('edit-tour-status').value;
        const newPrize = document.getElementById('edit-tour-prize').value;
        
        // Pega o texto puro que você digitou no modal
        const txtInscricao = document.getElementById('txt-inscricao').value;
        const txtAgenda = document.getElementById('txt-playoffs').value;
        const txtRegras = document.getElementById('txt-regras').value;
        const linkTwitch = document.getElementById('edit-tour-twitch').value;
        const linkYoutube = document.getElementById('edit-tour-youtube').value;

        // --- RECONSTRÓI O HTML BONITO (TEMPLATES) ---
        
        // 1. Inscrição: Adiciona a frase padrão + seu valor
        const htmlInscricao = `
            <p class="text-gray-300 mb-4">Os jogadores devem se registrar em nosso site e formar uma equipe para participar.</p>
            <div class="mt-4 bg-yellow-500/10 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                <p class="text-yellow-500 text-sm font-bold uppercase mb-1">VALOR DA INSCRIÇÃO</p>
                <p class="text-white font-bold text-lg">Valor: <span class="text-white">${txtInscricao}</span></p>
            </div>`;

        // 2. Agenda: Transforma cada linha do enter em uma DIV bonita
        const agendaLines = txtAgenda.split('\n').map(line => {
            if(!line.trim()) return "";
            // Se a linha tiver "Final", pinta de dourado
            const styleClass = line.toLowerCase().includes("final") ? "text-yellow-500 font-black text-base mt-2 uppercase tracking-wide" : "";
            return `<div class="${styleClass}">${line}</div>`;
        }).join('');
        
        const htmlAgenda = `<div class="space-y-4">
            <h4 class="text-white font-bold flex items-center gap-2 text-lg"><i data-lucide="calendar" class="text-white w-5 h-5"></i> Cronograma</h4>
            <div class="space-y-1 text-gray-300 font-bold text-sm">${agendaLines}</div>
        </div>`;

        // 3. Regras: Transforma cada linha em um item de lista (bullet point)
        const htmlRegras = `<ul class="space-y-2 text-gray-300 list-disc pl-5 marker:text-white text-sm">
            ${txtRegras.split('\n').filter(l=>l.trim()).map(l => `<li>${l}</li>`).join('')}
        </ul>`;

        // 4. Transmissão (Versão Compacta e Elegante)
        let botoesHtml = "";
        
        // Banner Twitch (Compacto)
        if(linkTwitch) {
            botoesHtml += `
            <a href="${linkTwitch}" target="_blank" class="group w-full bg-[#9146FF] hover:bg-[#7c2cf5] rounded-xl p-4 flex items-center gap-4 transition-all duration-300 shadow-lg hover:shadow-[#9146FF]/40 hover:-translate-y-1 relative overflow-hidden border border-white/10">
                <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                <svg class="w-8 h-8 md:w-10 md:h-10 text-white shrink-0 drop-shadow-md transform group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                </svg>
                <div>
                    <div class="text-[10px] md:text-xs text-white/90 font-bold uppercase tracking-wider mb-0.5 leading-none">Assista agora na</div>
                    <div class="text-white font-black text-xl md:text-2xl uppercase tracking-tight leading-none drop-shadow-md">Twitch TV</div>
                </div>
            </a>`;
        }

        // Banner YouTube (Compacto)
        if(linkYoutube) {
            botoesHtml += `
            <a href="${linkYoutube}" target="_blank" class="group w-full bg-[#FF0000] hover:bg-[#cc0000] rounded-xl p-4 flex items-center gap-4 transition-all duration-300 shadow-lg hover:shadow-[#FF0000]/40 hover:-translate-y-1 relative overflow-hidden border border-white/10">
                <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                 <svg class="w-8 h-8 md:w-10 md:h-10 text-white shrink-0 drop-shadow-md transform group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <div>
                    <div class="text-[10px] md:text-xs text-white/90 font-bold uppercase tracking-wider mb-0.5 leading-none">Assista agora no</div>
                    <div class="text-white font-black text-xl md:text-2xl uppercase tracking-tight leading-none drop-shadow-md">YouTube</div>
                </div>
            </a>`;
        }

        if(!botoesHtml) botoesHtml = '<div class="bg-[#1c1f26] p-4 rounded-xl border border-gray-800 text-center text-gray-400 text-sm font-bold flex items-center justify-center gap-2"><i data-lucide="tv" class="w-4 h-4"></i> Nenhuma transmissão agendada.</div>';

        // Container (mantive flex-col para empilhar se tiver os dois)
        const htmlTransmissao = `
            <div class="space-y-4">
                <p class="leading-relaxed text-gray-300 text-sm">Todas as partidas principais serão transmitidas <strong class="text-white">AO VIVO</strong> em nossos canais oficiais.</p>
                <div class="flex flex-col gap-3 w-full">${botoesHtml}</div>
            </div>`;

        // Monta o objeto final para o banco
        const customOverview = {
            inscricao: htmlInscricao,
            transmissoes: htmlTransmissao,
            playoffs: htmlAgenda,
            regras: htmlRegras
        };

        // Salva no Firebase
        const tourRef = window.doc(window.db, "tournaments", tourId);
        await window.updateDoc(tourRef, {
            status: newStatus,
            prize: newPrize,
            customOverview: customOverview
        });

        // --- CORREÇÃO DO REFRESH ---
        // Atualiza a memória local para não precisar recarregar a página
        if(state.currentTournament && state.currentTournament.id === tourId) {
            state.currentTournament.status = newStatus;
            state.currentTournament.prize = newPrize;
            state.currentTournament.customOverview = customOverview;
        }

        window.showToast("Torneio atualizado com sucesso!", "success");
        closeEditTournamentModal();
        
        // Atualiza a tela imediatamente
        if(window.renderTournamentPro) window.renderTournamentPro(tourId); 
        
        // Força a atualização da aba "Visão Geral" se estiver aberta
        const activeTab = document.querySelector('.nav-btn[data-tab="Visão Geral"]');
        if(activeTab && activeTab.classList.contains('border-yellow-500')) {
            // Recarrega o texto da seção de inscrição
            if(window.switchOverviewInfo) window.switchOverviewInfo('inscricao');
        }

    } catch (e) {
        console.error(e);
        alert("Erro ao salvar: " + e.message);
        if(btn) btn.innerText = "Salvar Tudo";
    }
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
    const shuffled = [...teams].slice(0, 8);
    rounds[0].matches.forEach((m, i) => {
        m.teamA = shuffled[i*2] || {name: "BYE"};
        m.teamB = shuffled[i*2+1] || {name: "BYE"};
        m.status = 'scheduled';
    });
    return rounds;
}

// --- RENDERIZADOR DO BRACKET ---
export function renderBracketDOM(isAdmin) {
    const container = document.getElementById('bracket-container');
    if (!container) return;
    container.innerHTML = '';
    
    container.className = "flex justify-center px-8 pt-8 min-w-max"; 

    state.bracket.forEach((round, rIndex) => {
        const col = document.createElement('div');
        
        const baseGap = 20; 
        const matchHeight = 90;
        const gapMultiplier = Math.pow(2, rIndex); 
        const calculatedGap = (baseGap * gapMultiplier) + (matchHeight * (gapMultiplier - 1));
        
        col.className = "flex flex-col justify-center relative mx-6"; 
        col.style.gap = `${calculatedGap}px`;

        const titleHeight = 40;
        col.innerHTML = `
            <div style="height: ${titleHeight}px; position: absolute; top: -${titleHeight + 10}px; width: 100%; text-align: center;">
                <h3 class="text-gray-500 text-xs font-bold uppercase tracking-widest">${round.title}</h3>
            </div>
        `;
        
        round.matches.forEach((m, mIndex) => {
             const adminBtn = (isAdmin && m.status !== 'finished') 
                ? `<div class="absolute -right-8 top-8 flex flex-col gap-1 z-50">
                    <button onclick="setMatchWinner(${rIndex}, ${mIndex}, 'teamA')" class="text-[10px] bg-green-900 text-green-300 px-1 rounded hover:bg-green-700">A</button>
                    <button onclick="setMatchWinner(${rIndex}, ${mIndex}, 'teamB')" class="text-[10px] bg-green-900 text-green-300 px-1 rounded hover:bg-green-700">B</button>
                   </div>` 
                : '';
            
            let connectorHtml = '';
            
            if (rIndex < state.bracket.length - 1) { 
                const verticalHeight = (calculatedGap / 2) + (matchHeight / 2);

                if (mIndex % 2 === 0) {
                    connectorHtml = `<div class="connector-right top" style="height: ${verticalHeight}px;"></div>`;
                } else {
                    connectorHtml = `<div class="connector-right bottom" style="height: ${verticalHeight}px;"></div>`;
                }
            }
            
            let connectorLeft = (rIndex > 0) ? `<div class="connector-left"></div>` : '';

            const activeClass = (m.teamA.name !== 'TBD' && m.teamB.name !== 'TBD') ? 'border-gray-600' : 'border-gray-800 opacity-60';
            
            const matchHtml = `
                <div class="bg-[#15171e] border ${activeClass} rounded-lg w-56 relative match-box transition-all group hover:border-yellow-500/30" style="height: ${matchHeight}px">
                    ${connectorLeft}
                    
                    <div class="flex flex-col justify-center h-full px-4 gap-2">
                        <div class="flex justify-between items-center ${m.isWinnerA ? 'text-green-400 font-bold' : 'text-gray-300'}">
                            <span class="truncate text-sm w-32">${m.teamA.name}</span> 
                            <span class="bg-[#0f1116] w-6 h-6 flex items-center justify-center rounded text-xs border border-gray-800">${m.scoreA}</span>
                        </div>
                        <div class="h-[1px] bg-gray-800 w-full"></div>
                        <div class="flex justify-between items-center ${m.isWinnerB ? 'text-green-400 font-bold' : 'text-gray-300'}">
                            <span class="truncate text-sm w-32">${m.teamB.name}</span> 
                            <span class="bg-[#0f1116] w-6 h-6 flex items-center justify-center rounded text-xs border border-gray-800">${m.scoreB}</span>
                        </div>
                    </div>
                    ${adminBtn}
                    ${connectorHtml}
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
    renderBracketDOM(true);
}

// --- MODAL DE CRIAÇÃO ---
export function openCreateTournamentModal() {
    const old = document.getElementById('create-tournament-modal');
    if(old) old.remove();

    const html = `
    <div id="create-tournament-modal" class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
        <div class="bg-[#15171e] w-full max-w-lg rounded-xl border border-gray-800 shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <div class="flex justify-between items-start mb-6">
                <h3 class="text-white font-bold text-xl flex items-center gap-2"><span class="text-yellow-500">🏆</span> Novo Campeonato</h3>
                <button type="button" onclick="closeCreateTournamentModal()" class="text-gray-500 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>

            <form onsubmit="handleCreateTournamentForm(event)" class="space-y-4">
                <div>
                    <label class="block text-gray-400 text-xs font-bold mb-1 uppercase">Nome do Evento</label>
                    <input type="text" id="tour-name" required class="w-full bg-[#0f1116] border border-gray-800 text-white px-4 py-3 rounded-lg text-sm focus:border-yellow-500 outline-none">
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-gray-400 text-xs font-bold mb-1 uppercase">Premiação (R$)</label>
                        <input type="text" id="tour-prize" required class="w-full bg-[#0f1116] border border-gray-800 text-white px-4 py-3 rounded-lg text-sm focus:border-yellow-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-gray-400 text-xs font-bold mb-1 uppercase">Vagas</label>
                        <select id="tour-teams" class="w-full bg-[#0f1116] border border-gray-800 text-white px-4 py-3 rounded-lg text-sm focus:border-yellow-500 outline-none">
                            <option value="8">8 Times</option>
                            <option value="16">16 Times</option>
                            <option value="32">32 Times</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label class="block text-gray-400 text-xs font-bold mb-1 uppercase">Formato</label>
                    <select id="tour-format" class="w-full bg-[#0f1116] border border-gray-800 text-white px-4 py-3 rounded-lg text-sm focus:border-yellow-500 outline-none">
                        <option value="Eliminação Simples">Eliminação Simples (Mata-mata)</option>
                        <option value="Grupos + Playoffs">Fase de Grupos + Playoffs</option>
                        <option value="Dupla Eliminação">Dupla Eliminação</option>
                    </select>
                </div>

                <div class="mb-4">
                    <label class="block text-gray-400 text-xs font-bold mb-1 uppercase">Banner do Evento</label>
                    <label for="tour-banner-upload" class="flex gap-4 items-center bg-[#0f1116] p-3 rounded-xl border border-gray-800 cursor-pointer hover:border-gray-600 transition-all">
                        <div class="w-24 h-14 rounded bg-[#1c1f26] border border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                            <img id="tour-banner-preview" class="hidden w-full h-full object-cover">
                            <i id="tour-banner-icon" data-lucide="image" class="w-6 h-6 text-gray-500"></i>
                        </div>
                        <div>
                            <span class="bg-[#1c1f26] text-white text-xs font-bold px-3 py-1.5 rounded border border-gray-700">Escolher Imagem</span>
                            <p class="text-[10px] text-gray-500 mt-1">Recomendado 1920x1080.</p>
                        </div>
                        <input type="file" id="tour-banner-upload" hidden accept="image/*" onchange="previewTourBanner(event)">
                    </label>
                </div>

                <button type="submit" class="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition-all shadow-lg shadow-yellow-900/20 mt-4 uppercase text-sm">
                    Publicar Campeonato
                </button>
            </form>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', html);
    if(window.lucide) lucide.createIcons();
}

export function closeCreateTournamentModal() {
    const el = document.getElementById('create-tournament-modal');
    if(el) el.remove();
}

export function previewTourBanner(e) {
    const file = e.target.files[0];
    if(file) {
        selectedTourBannerFile = file;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = document.getElementById('tour-banner-preview');
            const icon = document.getElementById('tour-banner-icon');
            if(img) { img.src = ev.target.result; img.classList.remove('hidden'); }
            if(icon) icon.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }
}

export async function handleCreateTournamentForm(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const oldText = btn.innerText;
    btn.innerText = "Criando..."; btn.disabled = true;

    try {
        const name = document.getElementById('tour-name').value;
        const newId = Date.now().toString();
        
        let bannerUrl = "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80"; 

        if(selectedTourBannerFile) {
            bannerUrl = await uploadImageToFirebase(selectedTourBannerFile, `tournaments/${newId}/banner.jpg`);
        }

        const newTour = {
            name, 
            status: "Aberto", 
            maxTeams: parseInt(document.getElementById('tour-teams').value), 
            registeredTeams: 0, 
            registeredTeamsList: [],
            requests: [],
            prize: document.getElementById('tour-prize').value, 
            format: document.getElementById('tour-format').value,
            image: bannerUrl,
            logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${name}`,
            createdAt: new Date().toISOString(),
            customOverview: {} 
        };

        await window.setDoc(window.doc(window.db, "tournaments", newId), newTour);
        
        closeCreateTournamentModal();
        selectedTourBannerFile = null;
        window.showToast("Campeonato criado!", "success");
        renderTournamentsList();

    } catch(err) {
        console.error(err);
        window.showToast("Erro: " + err.message, "error");
    } finally {
        btn.innerText = oldText; btn.disabled = false;
    }
}

// --- EXPORTS PARA O MAIN.JS ---
export function openAdminPanel() {}
export function changeUserRole() {}