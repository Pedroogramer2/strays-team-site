// js/pages/tournaments.js
// Versão completa atualizada — Bracket 32, Inscrição visual, Prêmios editáveis, estrutura mantida
// Autor: gerado por assistant (adaptado ao seu projeto)

// ---------------------------
// IMPORTS & DEPENDÊNCIAS
// ---------------------------
// (supondo que exista um arquivo database.js e state.js conforme seu projeto)
import { TOURNAMENTS, TEAMS_LIST_DB, OVERVIEW_DATA } from '../database.js';
import { state } from '../state.js';

// ---------------------------
// UTILITÁRIOS GLOBAIS
// ---------------------------
function safeGet(obj, path, fallback = null) {
  try {
    return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj) ?? fallback;
  } catch {
    return fallback;
  }
}

function el(q) { return document.querySelector(q); }
function els(q) { return Array.from(document.querySelectorAll(q)); }

function showToast(msg, type = 'info') {
  // Implementação simples de toast — se já tiver, essa função respeita a existente
  if (window.showToast) return window.showToast(msg, type);
  const id = 'app-toast';
  let container = document.getElementById(id);
  if (!container) {
    container = document.createElement('div');
    container.id = id;
    container.style.position = 'fixed';
    container.style.right = '20px';
    container.style.bottom = '20px';
    container.style.zIndex = 99999;
    document.body.appendChild(container);
  }
  const node = document.createElement('div');
  node.innerText = msg;
  node.style.marginTop = '8px';
  node.style.padding = '10px 14px';
  node.style.borderRadius = '10px';
  node.style.color = '#fff';
  node.style.fontWeight = '700';
  node.style.boxShadow = '0 6px 25px rgba(0,0,0,0.4)';
  node.style.opacity = '0';
  node.style.transition = 'all 250ms';
  if (type === 'success') node.style.background = 'linear-gradient(90deg,#06b6d4,#10b981)';
  else if (type === 'error') node.style.background = 'linear-gradient(90deg,#ef4444,#f97316)';
  else node.style.background = '#111827';
  container.appendChild(node);
  requestAnimationFrame(()=> { node.style.opacity = '1'; node.style.transform = 'translateY(0)'; });
  setTimeout(()=> { node.style.opacity = '0'; node.style.transform = 'translateY(10px)'; setTimeout(()=>node.remove(),300); }, 3500);
}

// ---------------------------
// LIMPEZA E HELPERS DE TEXTO
// ---------------------------
function cleanTextFromHTML(htmlString) {
    if (!htmlString) return "";
    let text = String(htmlString)
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]*>?/gm, "");
    return text.trim();
}

// ---------------------------
// UPLOADS / PREVIEW (BANNER)
// ---------------------------
let selectedTourBannerFile = null;

async function uploadImageToFirebase(file, path) {
    if (!file) return null;
    if (!window.storage || !window.uploadBytes) {
        // fallback: return object URL
        return URL.createObjectURL(file);
    }
    try {
        const ref = window.storageRef(window.storage, path);
        const snap = await window.uploadBytes(ref, file);
        return await window.getDownloadURL(snap.ref);
    } catch (e) {
        console.error("Erro upload:", e);
        throw e;
    }
}

export function previewTourBanner(input) {
    const file = input.files && input.files[0];
    if (!file) return;
    selectedTourBannerFile = file;
    const url = URL.createObjectURL(file);
    const img = document.getElementById('create-tour-banner-preview');
    if (img) img.src = url;
}

// ---------------------------
// RENDER LISTA DE TORNEIOS
// ---------------------------
export async function renderTournamentsList() {
    const content = document.getElementById('page-content');
    
    const userJson = localStorage.getItem('strays_user');
    const user = userJson ? JSON.parse(userJson) : null;
    const isAdmin = user && (user.role === 'admin' || user.role === 'staff');

    const createBtn = isAdmin ? `
        <div onclick="openCreateTournamentModal()" class="bg-[#15171e] rounded-xl border-2 border-dashed border-gray-700 hover:border-yellow-500 hover:bg-[#15171e] transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[280px]">
            <div class="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-yellow-500/20">
                <i data-lucide="plus" class="w-8 h-8 text-yellow-500"></i>
            </div>
            <h3 class="text-white font-bold text-lg uppercase tracking-wide">Criar Campeonato</h3>
            <p class="text-gray-500 text-xs mt-2">Área Administrativa</p>
        </div>` : '';

    content.innerHTML = `<div class="p-20 text-center text-white animate-pulse">Carregando Campeonatos...</div>`;

    try {
        const q = window.query ? window.query(window.collection(window.db, "tournaments"), window.orderBy("createdAt", "desc")) : null;
        const querySnapshot = q && window.getDocs ? await window.getDocs(q) : null;
        
        const dbTournaments = [];
        if (querySnapshot && typeof querySnapshot.forEach === 'function') {
            querySnapshot.forEach((doc) => { dbTournaments.push({ id: doc.id, ...doc.data() }); });
        }
        
        const listToRender = dbTournaments.length > 0 ? dbTournaments : TOURNAMENTS;

        const tournamentsHtml = listToRender.map(t => {
            let statusClass = 'bg-green-500';
            let statusText = t.status || 'Aberto';
            
            if(t.status === 'Ao Vivo') { statusClass = 'bg-red-500 animate-pulse'; }
            else if(t.status === 'Concluído') { statusClass = 'bg-gray-500'; }
            else if(t.status === 'Inscrições' || t.status === 'Aberto') { statusClass = 'bg-yellow-500 text-black'; }

            const deleteBtn = isAdmin ? `
    <button onclick="event.stopPropagation(); openDeleteConfirmation('${t.id}')" 
        class="absolute top-4 left-4 z-20 bg-black/60 hover:bg-red-600 text-gray-300 hover:text-white p-2 rounded-lg border border-white/10 hover:border-red-500 transition-all backdrop-blur-md shadow-lg group-hover:scale-110" 
        title="Excluir Campeonato">
        <i data-lucide="trash-2" class="w-4 h-4"></i>
    </button>
` : '';

            return `
            <div class="bg-[#15171e] rounded-xl overflow-hidden border border-gray-800 hover:border-yellow-500 transition-all cursor-pointer group shadow-lg flex flex-col h-full" onclick="navigateToPage('campeonato-${t.id}')">
                <div class="h-48 bg-cover bg-center relative" style="background-image: url('${t.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80'}')">
                    <div class="absolute inset-0 bg-gradient-to-t from-[#15171e] via-transparent to-transparent opacity-90"></div>
                    ${deleteBtn}
                    <span class="absolute top-4 right-4 text-[10px] font-black px-3 py-1 rounded-full shadow-lg ${statusClass} text-white">
                        ${statusText}
                    </span>
                </div>
                <div class="p-6 relative flex-1 flex flex-col">
    <div class="mt-2 mb-4"> 
        <h3 class="text-xl font-black text-white group-hover:text-yellow-500 transition-colors uppercase italic leading-none">${t.name}</h3>
        <p class="text-gray-500 text-xs mt-1 font-bold">Format: ${t.format || 'Solo'}</p>
    </div>
                    
                    <div class="mt-auto border-t border-gray-800 pt-4 flex justify-between items-center text-sm">
                        <span class="flex items-center gap-2 text-gray-400 font-bold"><i data-lucide="users" class="w-4 h-4 text-purple-500"></i> ${t.registeredTeams || 0}/${t.maxTeams || 32}</span>
                        <span class="text-yellow-500 font-black flex items-center gap-2 text-lg"><i data-lucide="trophy" class="w-4 h-4"></i> ${t.prize || '-'}</span>
                    </div>
                </div>
            </div>`;
        }).join('');

        content.innerHTML = `
            <div class="animate-fadeIn p-8 max-w-7xl mx-auto">
                <div class="flex items-center justify-between mb-10">
                    <div>
                        <h1 class="text-4xl font-black text-white uppercase tracking-tight italic">Torneios <span class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Strays</span></h1>
                        <p class="text-gray-400 text-sm mt-1">Inscreva seu time e compita pelos melhores prêmios.</p>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${createBtn}
                    ${tournamentsHtml}
                </div>
            </div>
        `;
    } catch (e) {
        console.error(e);
        content.innerHTML = `<div class="text-red-500 text-center mt-10 p-4 border border-red-900 rounded bg-red-900/10">Erro ao carregar campeonatos: ${e.message}</div>`;
    }
    if(window.lucide) lucide.createIcons();
}

// ---------------------------
// RENDER DE PÁGINA DO TORNEIO (PRO)
// ---------------------------
export async function renderTournamentPro(tournamentId) {
    const content = document.getElementById('page-content');
    content.innerHTML = `<div class="p-20 text-center text-white flex flex-col items-center gap-4"><div class="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>Carregando Detalhes...</div>`;

    try {
        let t = null;
        if(window.doc && window.getDoc && window.db) {
            const docSnap = await window.getDoc(window.doc(window.db, "tournaments", tournamentId));
            if(docSnap && docSnap.exists()) t = { id: docSnap.id, ...docSnap.data() };
        }
        if(!t) t = TOURNAMENTS.find(tr => tr.id === tournamentId) || TOURNAMENTS[0];

        state.currentTournament = t;

        if(!state.bracket || state.bracket.length === 0) {
            state.groups = generateGroups(TEAMS_LIST_DB);
            state.bracket = generateEmptyBracket(TEAMS_LIST_DB, t.maxTeams || 32);
        }

        const userJson = localStorage.getItem('strays_user');
        const user = userJson ? JSON.parse(userJson) : null;
        const isAdmin = user && (user.role === 'admin' || user.role === 'staff');

        let actionButton = '';
        const requests = t.requests || [];
        const approvedTeams = t.registeredTeamsList || []; 
        let myTeamId = null;
        
        if(user) {
            const localTeams = JSON.parse(localStorage.getItem('strays_teams_db') || '[]');
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
                actionButton = `<div class="bg-[#1c1f26] border border-gray-800 text-gray-500 text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2"><i data-lucide="alert-circle" class="w-4 h-4"></i> Necessário criar um time</div>`;
            } else {
                if (t.status === 'Concluído' || t.status === 'Ao Vivo') {
                    actionButton = `<button class="bg-gray-800 text-gray-400 font-bold py-3 px-8 rounded-lg cursor-not-allowed border border-gray-700">Inscrições Encerradas</button>`;
                } else {
                    const isApproved = approvedTeams.includes(String(myTeamId));
                    const isPending = requests.some(r => String(r.teamId) === String(myTeamId));
                    
                    if (isApproved) {
                        actionButton = `
                            <button class="bg-green-600 text-white font-black py-3 px-8 rounded-lg cursor-default border border-green-400 flex items-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.4)] uppercase tracking-wide">
                                <i data-lucide="check-circle" class="w-5 h-5"></i> INSCRITO
                            </button>`;
                    } else if (isPending) {
                        actionButton = `
                            <button class="bg-yellow-500/10 text-yellow-500 font-bold py-3 px-8 rounded-lg cursor-wait border border-yellow-500/30 flex items-center gap-2 uppercase tracking-wide">
                                <i data-lucide="clock" class="w-5 h-5 animate-pulse"></i> Aguardando Aprovação
                            </button>`;
                    } else {
                        actionButton = `<button onclick="openSubscribeModal('${t.id}', '${myTeamId}')" class="bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 px-8 rounded-lg shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all uppercase tracking-wide transform hover:scale-105">Inscrever Time</button>`;
                    }
                }
            }
        }

        let adminArea = '';
        if (isAdmin) {
            const pendingList = requests.length > 0 ? requests.map(req => `
                <div class="flex items-center justify-between bg-[#1c1f26] p-4 rounded-lg border border-gray-700 mb-2">
                    <div class="flex items-center gap-3">
                        <div class="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span class="text-white font-bold text-sm">${req.teamName}</span>
                        <span class="text-[10px] text-gray-500">${new Date(req.timestamp || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="approveTeam('${t.id}', '${req.teamId}', '${req.teamName}')" class="bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white text-xs font-bold border border-green-500/50 px-3 py-1.5 rounded transition-colors">Aprovar</button>
                        <button onclick="rejectTeam('${t.id}', '${req.teamId}')" class="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-xs font-bold border border-red-500/50 px-3 py-1.5 rounded transition-colors">Recusar</button>
                    </div>
                </div>
            `).join('') : '<p class="text-gray-500 text-sm italic">Nenhuma solicitação pendente.</p>';
            
            adminArea = `
                <div class="mt-8 mb-8 p-6 bg-[#15171e] border border-red-900/30 rounded-xl shadow-lg">
                    <h3 class="text-white font-bold mb-4 flex items-center gap-2 border-b border-gray-700 pb-3">
                        <i data-lucide="shield-alert" class="text-red-500"></i> Área do Admin - Inscrições (${requests.length})
                    </h3>
                    <div class="max-h-60 overflow-y-auto custom-scrollbar pr-2">${pendingList}</div>
                </div>`;
        }

        content.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 animate-fadeIn">
            
            <header class="relative w-full h-80 rounded-3xl overflow-hidden mb-8 group shadow-2xl border border-gray-800">
                <div class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style="background-image: url('${t.image || ''}')"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-[#0f1116] via-[#0f1116]/80 to-transparent"></div>
                
                <div class="absolute bottom-0 left-0 w-full p-8 flex flex-col md:flex-row justify-between items-end gap-6 relative z-10">
                    <div class="flex items-center gap-6">
                        <div>
                            <h1 class="text-4xl md:text-5xl font-black text-white mb-2 uppercase italic tracking-wider shadow-black drop-shadow-md">${t.name}</h1>
                            <div class="flex gap-3">
                                <span class="bg-yellow-500 text-black text-xs font-black px-3 py-1 rounded-md uppercase shadow-lg tracking-wide">${t.status || 'Aberto'}</span>
                                <span class="px-3 py-1 rounded-md bg-gray-800 text-gray-300 text-xs font-bold border border-gray-700 uppercase">${t.format || 'Solo'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col items-end gap-4">
                        <div class="text-right">
                            <p class="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Premiação Total</p>
                            <p class="text-4xl font-black text-white text-shadow-glow">${t.prize || '-'}</p>
                        </div>
                        ${actionButton}
                    </div>
                </div>
                
                <button onclick="navigateToPage('campeonatos')" class="absolute top-6 left-6 text-white bg-black/40 hover:bg-black/60 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10 transition-all flex items-center gap-2 text-sm font-bold z-20">
                    <i data-lucide="arrow-left" class="w-4 h-4"></i> Voltar
                </button>
            </header>
            
            ${adminArea}

            <div class="flex justify-between items-center mb-8 border-b border-gray-800 pb-0 overflow-x-auto">
                <nav class="flex gap-8">
                     <button onclick="switchTab('Visão Geral')" class="nav-btn pb-4 text-sm font-bold border-b-2 text-white border-yellow-500 transition-colors uppercase tracking-wide" data-tab="Visão Geral">VISÃO GERAL</button>
                     <button onclick="switchTab('Times')" class="nav-btn pb-4 text-sm font-bold border-b-2 border-transparent text-gray-500 hover:text-white transition-colors uppercase tracking-wide" data-tab="Times">TIMES INSCRITOS</button>
                     <button onclick="switchTab('PlayOffs')" class="nav-btn pb-4 text-sm font-bold border-b-2 border-transparent text-gray-500 hover:text-white transition-colors uppercase tracking-wide" data-tab="PlayOffs">CHAVEAMENTO</button>
                </nav>
            </div>
            
            <main>
                <div id="tab-Visão Geral" class="tab-content animate-fadeIn">
                     
                     <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div class="bg-[#15171e] p-5 rounded-xl border border-gray-800 hover:border-gray-600 transition-colors"><div class="text-gray-500 text-[10px] font-bold uppercase mb-1 tracking-widest">Vagas</div><div class="text-2xl font-bold text-white flex items-center gap-2">${approvedTeams.length}/${t.maxTeams || 32}</div></div>
                        <div class="bg-[#15171e] p-5 rounded-xl border border-gray-800 hover:border-gray-600 transition-colors"><div class="text-gray-500 text-[10px] font-bold uppercase mb-1 tracking-widest">Início</div><div class="text-2xl font-bold text-white flex items-center gap-2">${t.startDate || '15/09'}</div></div>
                        <div class="bg-[#15171e] p-5 rounded-xl border border-gray-800 hover:border-gray-600 transition-colors"><div class="text-gray-500 text-[10px] font-bold uppercase mb-1 tracking-widest">Taxa</div><div class="text-2xl font-bold text-white flex items-center gap-2">${t.fee || 'R$ 50,00'}</div></div>
                        <div class="bg-[#15171e] p-5 rounded-xl border border-gray-800 hover:border-gray-600 transition-colors"><div class="text-gray-500 text-[10px] font-bold uppercase mb-1 tracking-widest">Status</div><div class="text-2xl font-bold text-white flex items-center gap-2">${t.status || 'Aberto'}</div></div>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        <div class="lg:col-span-3 space-y-4">
                            
                            <div class="bg-[#15171e] rounded-xl border border-gray-800 p-5">
${ t.customOverview && (t.customOverview.premios || t.customOverview["prêmios"]) 
    ? (t.customOverview.premios || t.customOverview["prêmios"])
    : `

                                    <h4 class="text-white font-bold text-sm uppercase mb-4 border-b border-gray-800 pb-2">Distribuição</h4>
                                    <div class="flex justify-between items-center mb-2"><span class="text-gray-400 text-sm">1º Lugar</span><span class="text-yellow-500 font-bold">${t.prize || '-'}</span></div>
                                    <div class="flex justify-between items-center mb-2"><span class="text-gray-400 text-sm">2º Lugar</span><span class="text-gray-300 font-bold">-</span></div>
                                    <div class="text-center text-xs text-gray-600 mt-4 italic">Configure no Painel Admin</div>
                                `}
                            </div>

                            <div class="bg-[#5865F2] hover:bg-[#4752c4] rounded-xl p-6 cursor-pointer transition-colors shadow-lg flex items-center gap-4 group">
                                <div class="bg-white/20 p-2 rounded-lg"><i data-lucide="message-circle" class="text-white w-6 h-6"></i></div>
                                <div><div class="text-xs text-white/80 font-bold uppercase">Dúvidas?</div><div class="text-white font-black text-lg uppercase">Discord Oficial</div></div>
                            </div>
                        </div>
                        
                        <div class="lg:col-span-4 space-y-3">
                            ${Object.keys(OVERVIEW_DATA).map(key => `
                                <div id="btn-${key}" onclick="switchOverviewInfo('${key}')" class="overview-btn w-full bg-[#15171e] border border-gray-800 hover:border-gray-600 rounded-xl p-5 cursor-pointer text-left transition-all group">
                                    <h3 class="btn-title text-white font-bold text-lg flex justify-between items-center">
                                        ${OVERVIEW_DATA[key].title}
                                        <i data-lucide="chevron-right" class="w-5 h-5 text-gray-600 group-hover:text-yellow-500 transition-colors"></i>
                                    </h3>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="lg:col-span-5 pl-4 pt-2">
                            <div id="overview-dynamic-text" class="animate-fadeIn">
                                </div>
                        </div>
                    </div>
                </div>

                <div id="tab-Times" class="tab-content hidden-section animate-fadeIn">
                     <div id="teams-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        </div>
                </div>
                
                <div id="tab-PlayOffs" class="tab-content hidden-section animate-fadeIn">
                    <div class="bg-transparent rounded-xl p-8 border border-gray-800 overflow-x-auto pb-12 pt-8 scrollbar-thin">
                        <div id="bracket-container" class="flex gap-16 min-w-max px-4 items-center justify-center"></div>
                    </div>
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

// ---------------------------
// INSCRIÇÃO — MODAL & EXECUÇÃO
// ---------------------------
export function openSubscribeModal(tourId, teamId) {
    const old = document.getElementById('subscribe-confirm-modal');
    if(old) old.remove();

    const html = `
    <div id="subscribe-confirm-modal" class="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
        <div class="bg-[#15171e] w-full max-w-sm rounded-xl border border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.1)] p-8 text-center relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
            
            <div class="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-6 border border-yellow-500/20 shadow-inner">
                <i data-lucide="trophy" class="text-yellow-500 w-8 h-8"></i>
            </div>
            
            <h3 class="text-white font-black text-xl mb-2">INSCREVER TIME?</h3>
            <p class="text-gray-400 text-sm mb-8 leading-relaxed">
                Você está prestes a enviar a inscrição do seu time para este campeonato. A taxa será cobrada após a aprovação.
            </p>
            
            <div class="flex gap-3 justify-center">
                <button onclick="document.getElementById('subscribe-confirm-modal').remove()" class="text-gray-400 hover:text-white text-xs font-bold px-6 py-3 rounded-lg hover:bg-white/5 transition-colors uppercase tracking-wider">Cancelar</button>
                <button onclick="executeSubscription('${tourId}', '${teamId}')" id="btn-confirm-sub" class="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-3 rounded-lg text-xs font-black shadow-lg shadow-yellow-500/20 transition-all uppercase tracking-wider transform hover:scale-105">Confirmar</button>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', html);
    if(window.lucide) lucide.createIcons();
}

export async function executeSubscription(tourId, teamId) {
    const btn = document.getElementById('btn-confirm-sub');
    if(btn) { btn.innerText = "ENVIANDO..."; btn.disabled = true; }

    try {
        const userJson = localStorage.getItem('strays_user');
        const user = JSON.parse(userJson);
        const tourRef = window.doc ? window.doc(window.db, "tournaments", tourId) : null;
        
        const localTeams = JSON.parse(localStorage.getItem('strays_teams_db') || '[]');
        const myTeam = localTeams.find(t => String(t.id) === String(teamId));
        
        if(!myTeam) throw new Error("Time não encontrado.");

        if (tourRef && window.updateDoc && window.arrayUnion) {
            await window.updateDoc(tourRef, { 
                requests: window.arrayUnion({ 
                    teamId: String(teamId), 
                    teamName: myTeam.name, 
                    captainUid: user.uid, 
                    status: 'pending',
                    timestamp: new Date().toISOString()
                }) 
            });
        } else {
            // Fallback local mock: atualiza state.currentTournament para simular
            if (state.currentTournament) {
                state.currentTournament.requests = state.currentTournament.requests || [];
                state.currentTournament.requests.push({
                    teamId: String(teamId),
                    teamName: myTeam.name,
                    captainUid: user.uid,
                    status: 'pending',
                    timestamp: new Date().toISOString()
                });
            }
        }

        const modal = document.getElementById('subscribe-confirm-modal');
        if(modal) modal.remove();
        
        showToast("Solicitação de inscrição enviada com sucesso!", "success");
        renderTournamentPro(tourId);

    } catch (e) {
        console.error("Erro na inscrição:", e);
        const modal = document.getElementById('subscribe-confirm-modal');
        if(modal) modal.remove();
        showToast("Erro: " + (e.message || 'Não foi possível inscrever'), "error");
    }
}

// ---------------------------
// ADMIN: Aprovar / Rejeitar / Excluir
// ---------------------------
export async function approveTeam(tourId, teamId, teamName) {
    // Não uso confirm para seguir sua diretriz — admin visual aprova rápido
    try {
        const tourRef = window.doc ? window.doc(window.db, "tournaments", tourId) : null;
        if (tourRef && window.getDoc && window.updateDoc) {
            const tourSnap = await window.getDoc(tourRef);
            const tourData = tourSnap.data();
            const newRequests = (tourData.requests || []).filter(r => String(r.teamId) !== String(teamId));
            const newApproved = tourData.registeredTeamsList || [];
            if(!newApproved.includes(String(teamId))) newApproved.push(String(teamId));
            await window.updateDoc(tourRef, { requests: newRequests, registeredTeamsList: newApproved, registeredTeams: newApproved.length });
        } else {
            if (state.currentTournament) {
                state.currentTournament.requests = (state.currentTournament.requests || []).filter(r => String(r.teamId) !== String(teamId));
                state.currentTournament.registeredTeamsList = state.currentTournament.registeredTeamsList || [];
                if(!state.currentTournament.registeredTeamsList.includes(String(teamId))) state.currentTournament.registeredTeamsList.push(String(teamId));
            }
        }
        if (window.NotificationSystem) {
            try {
                await window.NotificationSystem.send(teamId, 'info', 'Inscrição Aprovada! ✅', `Seu time ${teamName} foi aceito no campeonato.`);
            } catch(e) { /* ignore */ }
        }
        renderTournamentPro(tourId);
        showToast('Time aprovado!', 'success');
    } catch(e) {
        console.error(e);
        showToast('Erro ao aprovar time.', 'error');
    }
}

export async function rejectTeam(tourId, teamId) {
    try {
        const tourRef = window.doc ? window.doc(window.db, "tournaments", tourId) : null;
        if (tourRef && window.getDoc && window.updateDoc) {
            const tourSnap = await window.getDoc(tourRef);
            const tourData = tourSnap.data();
            const newRequests = (tourData.requests || []).filter(r => String(r.teamId) !== String(teamId));
            await window.updateDoc(tourRef, { requests: newRequests });
        } else {
            if (state.currentTournament) state.currentTournament.requests = (state.currentTournament.requests || []).filter(r => String(r.teamId) !== String(teamId));
        }
        renderTournamentPro(tourId);
        showToast('Solicitação recusada.', 'info');
    } catch(e) {
        console.error(e);
        showToast('Erro ao recusar solicitação.', 'error');
    }
}

export function openDeleteConfirmation(tourId) {
    const html = `<div id="delete-confirm-modal" class="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn"><div class="bg-[#15171e] w-full max-w-sm rounded-xl border border-red-900/50 shadow-2xl p-6 text-center"><div class="w-12 h-12 rounded-full bg-red-900/20 flex items-center justify-center mx-auto mb-4"><i data-lucide="alert-triangle" class="text-red-500 w-6 h-6"></i></div><h3 class="text-white font-bold text-lg mb-2">Excluir Campeonato?</h3><p class="text-gray-400 text-xs mb-6">Essa ação não pode ser desfeita.</p><div class="flex gap-3 justify-center"><button onclick="document.getElementById('delete-confirm-modal').remove()" class="text-gray-400 hover:text-white text-sm font-bold px-4 py-2">Cancelar</button><button onclick="executeDelete('${tourId}')" class="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-red-900/20">Sim, Excluir</button></div></div></div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    if(window.lucide) lucide.createIcons();
}

export async function executeDelete(tourId) {
    try {
        if (window.deleteDoc && window.doc) {
            await window.deleteDoc(window.doc(window.db, "tournaments", tourId));
            showToast("Campeonato excluído.", "success");
            const modal = document.getElementById('delete-confirm-modal'); if(modal) modal.remove();
            renderTournamentsList();
            return;
        }
        // fallback: remove from mock
        const idx = TOURNAMENTS.findIndex(t => t.id === tourId);
        if (idx >= 0) TOURNAMENTS.splice(idx, 1);
        showToast("Campeonato excluído (mock).", "success");
        const modal = document.getElementById('delete-confirm-modal'); if(modal) modal.remove();
        renderTournamentsList();
    } catch(e) {
        console.error(e);
        showToast("Erro ao excluir campeonato.", "error");
    }
}

// ---------------------------
// EDITOR DE TORNEIO (MODAL) com Prêmios editáveis
// ---------------------------
// --- EDITOR DE TORNEIO (CORRIGIDO PARA ACEITAR CAMPO VAZIO) ---
// --- EDITOR DE TORNEIO (ATUALIZADO COM CAMPO DE LINK DE PAGAMENTO) ---
export function openEditTournamentModal(tourId) {
    const t = state.currentTournament;
    if(!t) return;
    const old = document.getElementById('edit-tour-modal'); if(old) old.remove();

    const valInscricao = t.customOverview?.rawInscricao ?? (cleanTextFromHTML(t.customOverview?.inscricao) || "R$ 10,00 por player");
    const valRegras = t.customOverview?.rawRegras ?? (cleanTextFromHTML(t.customOverview?.regras) || "Regras padrão.");
    const valAgenda = t.customOverview?.rawPlayoffs ?? (cleanTextFromHTML(t.customOverview?.playoffs) || "Oitavas: 22/09\nFinal: 05/10");
    
    // NOVO: Recupera o link salvo, ou deixa vazio
    const valLinkPagamento = t.customOverview?.paymentLink || "";

    let valPremios = "1º Lugar: R$ " + (t.prize || '') + "\n2º Lugar: R$ 200\n3º Lugar: Vaga na Pro League";
    if (t.customOverview?.rawPremios !== undefined && t.customOverview?.rawPremios !== null) {
        valPremios = t.customOverview.rawPremios;
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
                        <label class="text-xs font-bold text-gray-400 uppercase">Data de Início</label>
                        <input type="text" id="edit-tour-startdate" value="${t.startDate || ''}" placeholder="Ex: 15/09" class="w-full bg-[#0a0a0a] border border-gray-700 text-white px-4 py-3 rounded-xl mt-1 outline-none focus:border-yellow-500">
                    </div>
                </div>

                <div>
                    <label class="text-xs font-bold text-gray-400 uppercase">Prêmio Total (Capa)</label>
                    <input type="text" id="edit-tour-prize" value="${t.prize || ''}" class="w-full bg-[#0a0a0a] border border-gray-700 text-white px-4 py-3 rounded-xl mt-1 outline-none focus:border-green-500 font-bold">
                </div>

                <div class="bg-yellow-500/5 p-4 rounded-xl border border-yellow-500/20">
                    <label class="block text-yellow-500 text-xs font-bold mb-2 uppercase">Distribuição de Prêmios</label>
                    <textarea id="txt-premios" rows="4" class="w-full bg-[#0f1116] border border-gray-700 text-white px-4 py-3 rounded-lg text-sm outline-none resize-none font-mono placeholder-gray-600">${valPremios}</textarea>
                </div>

                <div class="grid grid-cols-1 gap-4 bg-[#1c1f26] p-4 rounded-xl border border-gray-800">
                    <div>
                        <label class="block text-gray-400 text-xs font-bold mb-1">Texto do Valor (Ex: R$ 50,00)</label>
                        <input type="text" id="txt-inscricao" value="${valInscricao}" class="w-full bg-[#0f1116] border border-gray-700 text-white px-4 py-3 rounded-lg text-sm outline-none focus:border-yellow-500">
                    </div>
                    <div>
                        <label class="block text-yellow-500 text-xs font-bold mb-1 flex items-center gap-2">
                            <i data-lucide="link" class="w-3 h-3"></i> Link para Pagamento (Botão)
                        </label>
                        <input type="text" id="edit-tour-payment-link" value="${valLinkPagamento}" placeholder="Ex: https://forms.google.com/..." class="w-full bg-[#0f1116] border border-gray-700 text-white px-4 py-3 rounded-lg text-sm outline-none focus:border-yellow-500 placeholder-gray-600">
                        <p class="text-[10px] text-gray-500 mt-1">Se deixar vazio, o botão "PAGUE AQUI" não aparecerá.</p>
                    </div>
                </div>

                <div><label class="block text-gray-400 text-xs font-bold mb-1">Agendamento</label><textarea id="txt-playoffs" rows="3" class="w-full bg-[#0f1116] border border-gray-700 text-white px-4 py-3 rounded-lg text-sm outline-none resize-none font-mono">${valAgenda}</textarea></div>
                <div><label class="block text-gray-400 text-xs font-bold mb-1">Regulamento</label><textarea id="txt-regras" rows="3" class="w-full bg-[#0f1116] border border-gray-700 text-gray-300 text-sm rounded-lg p-3 outline-none resize-none">${valRegras}</textarea></div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div><label class="block text-[#a970ff] text-xs font-bold mb-1">Link Twitch</label><input type="text" id="edit-tour-twitch" value="${safeGet(t,'customOverview.transmissoes','').includes('twitch') ? 'https://twitch.tv/' : ''}" placeholder="Link Twitch" class="w-full bg-[#0f1116] border border-gray-700 text-white px-3 py-2 rounded-lg text-sm"></div>
                    <div><label class="block text-[#ff0000] text-xs font-bold mb-1">Link YouTube</label><input type="text" id="edit-tour-youtube" value="${safeGet(t,'customOverview.transmissoes','').includes('youtube') ? 'https://youtube.com/' : ''}" placeholder="Link Youtube" class="w-full bg-[#0f1116] border border-gray-700 text-white px-3 py-2 rounded-lg text-sm"></div>
                </div>
            </div>
            
            <div class="p-6 border-t border-gray-800 bg-[#1c1f26] rounded-b-2xl flex justify-between items-center">
                <button onclick="openDeleteConfirmation('${t.id}')" class="text-red-500 hover:text-white hover:bg-red-600/90 border border-transparent hover:border-red-500 px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
                    <i data-lucide="trash-2" class="w-4 h-4"></i> Excluir Torneio
                </button>
                <div class="flex gap-3">
                    <button onclick="closeEditTournamentModal()" class="text-gray-400 hover:text-white font-bold text-sm px-6 py-3">Cancelar</button>
                    <button onclick="saveTournamentChanges('${t.id}')" class="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-8 rounded-xl shadow-lg">Salvar Tudo</button>
                </div>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if(window.lucide) lucide.createIcons();
}

export function closeEditTournamentModal() { const m = document.getElementById('edit-tour-modal'); if(m) m.remove(); }

export async function saveTournamentChanges(tourId) {
    const btn = document.querySelector('button[onclick^="saveTournamentChanges"]'); if(btn) btn.innerText = "Salvando...";
    try {
        const newStatus = document.getElementById('edit-tour-status').value;
        const newPrize = document.getElementById('edit-tour-prize').value;
        const newStartDate = document.getElementById('edit-tour-startdate').value;
        
        const txtInscricao = document.getElementById('txt-inscricao').value;
        // NOVO: Pega o valor do link
        const txtPaymentLink = document.getElementById('edit-tour-payment-link').value;
        
        const txtAgenda = document.getElementById('txt-playoffs').value;
        const txtRegras = document.getElementById('txt-regras').value;
        const txtPremios = document.getElementById('txt-premios').value;
        const linkTwitch = document.getElementById('edit-tour-twitch').value;
        const linkYoutube = document.getElementById('edit-tour-youtube').value;

        // Monta HTML de Prêmios
        const listaPremiosHtml = txtPremios.split('\n').filter(line => line.trim() !== "").map((line, index) => {
            const parts = line.split(':');
            const place = parts[0].trim();
            const reward = parts.slice(1).join(':').trim();
            const colorClass = index === 0 ? "text-yellow-500" : "text-white";
            return `
            <div class="flex justify-between items-center mb-2 border-b border-white/5 pb-2 last:border-0 last:mb-0 last:pb-0">
                <span class="text-gray-400 text-sm font-medium">${place}</span>
                <span class="text-yellow-500 font-bold text-sm">${reward}</span>
            </div>`;
        }).join('');
        const htmlPremios = `<h4 class="text-white font-bold text-sm uppercase mb-4 border-b border-gray-800 pb-2">Distribuição de Prêmios</h4><div class="flex flex-col gap-1">${listaPremiosHtml}</div>`;

        // ============================================================
        // MONTA HTML DE INSCRIÇÃO COM O BOTÃO DOURADO
        // ============================================================
        let btnPagamentoHtml = "";
        
        // Se tiver link, cria o botão dourado estilo Twitch (mas amarelo)
        if(txtPaymentLink && txtPaymentLink.trim() !== "") {
            btnPagamentoHtml = `
            <a href="${txtPaymentLink}" target="_blank" class="w-full mt-6 bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-xl flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-transform hover:scale-[1.02] uppercase tracking-widest text-lg group">
                <i data-lucide="credit-card" class="w-6 h-6 text-black group-hover:scale-110 transition-transform"></i>
                PAGUE AQUI
            </a>
            `;
        }

        const htmlInscricao = `
            <p class="text-gray-300 mb-4">Os jogadores devem se registrar em nosso site e formar uma equipe para participar.</p>
            <div class="mt-4 bg-yellow-500/10 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                <p class="text-yellow-500 text-sm font-bold uppercase mb-1">VALOR DA INSCRIÇÃO</p>
                <p class="text-white font-bold text-lg">Valor: <span class="text-white">${txtInscricao}</span></p>
            </div>
            ${btnPagamentoHtml}
        `;
        // ============================================================
        
        // Monta HTML da Agenda
        const agendaLines = txtAgenda.split('\n').map(line => { if(!line.trim()) return ""; const styleClass = line.toLowerCase().includes("final") ? "text-yellow-500 font-black text-base mt-2 uppercase tracking-wide" : ""; return `<div class="${styleClass}">${line}</div>`; }).join('');
        const htmlAgenda = `<div class="space-y-4"><h4 class="text-white font-bold flex items-center gap-2 text-lg"><i data-lucide="calendar" class="text-white w-5 h-5"></i> Cronograma</h4><div class="space-y-1 text-gray-300 font-bold text-sm">${agendaLines}</div></div>`;
        
        // Monta HTML de Regras
        const htmlRegras = `<ul class="space-y-2 text-gray-300 list-disc pl-5 marker:text-white text-sm">${txtRegras.split('\n').filter(l=>l.trim()).map(l => `<li>${l}</li>`).join('')}</ul>`;
        
        // Monta HTML de Transmissão
        let botoesHtml = "";
        if(linkTwitch) botoesHtml += `<a href="${linkTwitch}" target="_blank" class="bg-[#9146FF] hover:bg-[#7c2cf5] text-white px-6 py-3 rounded-lg font-bold flex items-center gap-3 transition-transform hover:scale-105 shadow-lg shadow-purple-900/30">Twitch TV</a>`;
        if(linkYoutube) botoesHtml += `<a href="${linkYoutube}" target="_blank" class="bg-[#FF0000] hover:bg-[#cc0000] text-white px-6 py-3 rounded-lg font-bold flex items-center gap-3 transition-transform hover:scale-105 shadow-lg shadow-red-900/30">Youtube</a>`;
        const htmlTransmissao = `<div class="space-y-4"><p class="leading-relaxed text-gray-300 text-base">Todas as partidas principais serão transmitidas <strong class="text-white">AO VIVO</strong> em nossos canais oficiais.</p><div class="flex flex-wrap gap-4 items-center">${botoesHtml}</div></div>`;

        const customOverview = { 
            inscricao: htmlInscricao, 
            transmissoes: htmlTransmissao, 
            playoffs: htmlAgenda, 
            regras: htmlRegras,
            premios: htmlPremios,
            "prêmios": htmlPremios,
            rawPremios: txtPremios,
            rawInscricao: txtInscricao,
            rawPlayoffs: txtAgenda,
            rawRegras: txtRegras,
            paymentLink: txtPaymentLink // Salva o link cru para poder editar depois
        };

        const updateData = { 
            status: newStatus, 
            prize: newPrize, 
            startDate: newStartDate, 
            customOverview: customOverview 
        };

        if (window.updateDoc && window.doc) {
            await window.updateDoc(window.doc(window.db, "tournaments", tourId), updateData);
        } else {
            if(state.currentTournament && state.currentTournament.id === tourId) {
                Object.assign(state.currentTournament, updateData);
            }
        }

        showToast("Torneio atualizado!", "success");
        closeEditTournamentModal();
        renderTournamentPro(tourId);
    } catch (e) { console.error(e); showToast("Erro ao salvar: " + (e.message || ''), "error"); if(btn) btn.innerText = "Salvar Tudo"; }
}

// ---------------------------
// RENDER DE TIMES LISTA
// ---------------------------
function renderTeamsList() {
    const container = document.getElementById('teams-grid');
    if (!container) return;
    container.innerHTML = TEAMS_LIST_DB.map(team => `
        <div onclick="navigateToPage('team-detail-${team.id}')" class="bg-[#15171e] rounded-xl border border-transparent hover:border-gray-700 p-4 flex items-center gap-4 cursor-pointer transition-all hover:bg-[#1c1f26]">
            <div class="w-12 h-12 rounded-lg bg-gray-800 overflow-hidden"><img src="${team.logo || 'https://via.placeholder.com/48'}" class="w-full h-full object-cover"></div>
            <div><h3 class="font-bold text-white text-lg">${team.name}</h3><p class="text-gray-500 text-xs">${team.members || 1} Membros</p></div>
        </div>
    `).join('');
}

// ---------------------------
// GERAÇÃO DE GRUPOS E BRACKET DINÂMICO
// ---------------------------
export function generateGroups(teams) {
    const shuffled = [...teams].sort(() => 0.5 - Math.random());
    const groupData = [];
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const groupsCount = Math.floor(shuffled.length / 4);
    for (let i = 0; i < groupsCount; i++) {
        groupData.push({ name: `Grupo ${letters[i] || String.fromCharCode(65+i)}`, teams: shuffled.slice(i * 4, (i + 1) * 4) });
    }
    return groupData;
}

// tournamentSize default 32 but supports 8,16,32,64 if you pass it
export function generateEmptyBracket(teams, tournamentSize = 32) {
    // garante potência de 2
    let size = parseInt(tournamentSize, 10) || 32;
    if ((size & (size - 1)) !== 0) {
        // se não for potência de 2, arredonda para próximo maior potência de 2
        let p = 1;
        while (p < size) p <<= 1;
        size = p;
    }

    const rounds = [];
    let matchCount = size / 2; 
    let idCounter = 1;
    const totalRounds = Math.log2(size);

    for (let r = 0; r < totalRounds; r++) {
        const matches = [];
        let roundTitle = "";
        if (matchCount === 1) roundTitle = "Grande Final";
        else if (matchCount === 2) roundTitle = "Semifinais";
        else if (matchCount === 4) roundTitle = "Quartas de Final";
        else if (matchCount === 8) roundTitle = "Oitavas de Final";
        else if (matchCount === 16) roundTitle = "Round of 32";
        else roundTitle = `Round ${r + 1}`;

        for(let i=0; i<matchCount; i++) {
             matches.push({ id: idCounter++, teamA: {name: "TBD"}, teamB: {name: "TBD"}, status: 'waiting', scoreA: 0, scoreB: 0 });
        }
        rounds.push({ title: roundTitle, matches });
        matchCount = Math.floor(matchCount / 2);
    }
    return rounds;
}

// ---------------------------
// RENDER BRACKET
// ---------------------------
export function renderBracketDOM(isAdmin) {
    const container = document.getElementById('bracket-container');
    if (!container) return;
    container.innerHTML = '';
    
    container.className = "flex justify-center px-8 pt-8 min-w-max"; 

    if (!state.bracket || !Array.isArray(state.bracket) || state.bracket.length === 0) {
        container.innerHTML = '<div class="text-gray-400">Nenhum bracket disponível.</div>';
        return;
    }

    state.bracket.forEach((round, rIndex) => {
        const col = document.createElement('div');
        
        const baseGap = 20; 
        const matchHeight = 90;
        const gapMultiplier = Math.pow(2, rIndex); 
        const calculatedGap = Math.max(12, (baseGap * gapMultiplier) + (matchHeight * (gapMultiplier - 1)));
        
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
                <div class="bg-transparent border  ${activeClass} rounded-lg w-56 relative match-box transition-all group hover:border-yellow-500/30" style="height: ${matchHeight}px">
                    ${connectorLeft}
                    
                    <div class="flex flex-col justify-center h-full px-4 gap-2">
                        <div class="flex justify-between items-center ${m.isWinnerA ? 'text-green-400 font-bold' : 'text-gray-300'}">
                            <span class="truncate text-sm w-32">${m.teamA.name}</span> 
                            <span class="bg-[#0f1116] w-6 h-6 flex items-center justify-center rounded text-xs border border-gray-800 font-mono">${m.scoreA}</span>
                        </div>
                        <div class="h-[1px] bg-gray-800 w-full"></div>
                        <div class="flex justify-between items-center ${m.isWinnerB ? 'text-green-400 font-bold' : 'text-gray-300'}">
                            <span class="truncate text-sm w-32">${m.teamB.name}</span> 
                            <span class="bg-[#0f1116] w-6 h-6 flex items-center justify-center rounded text-xs border border-gray-800 font-mono">${m.scoreB}</span>
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
    if(!match) return;
    if(winnerSlot === 'teamA') { match.scoreA = 2; match.isWinnerA = true; match.isWinnerB = false; } 
    else { match.scoreB = 2; match.isWinnerB = true; match.isWinnerA = false; }
    match.status = 'finished';
    // autopropaga para a próxima fase se existir
    try {
        const nextRound = state.bracket[rIndex+1];
        if (nextRound) {
            const targetMatchIndex = Math.floor(mIndex/2);
            const winnerName = match.isWinnerA ? match.teamA.name : match.teamB.name;
            const slot = (mIndex % 2 === 0) ? 'teamA' : 'teamB';
            if (!nextRound.matches[targetMatchIndex]) {
                nextRound.matches[targetMatchIndex] = { id: Date.now(), teamA: {name: 'TBD'}, teamB: {name: 'TBD'}, status: 'waiting', scoreA:0, scoreB:0 };
            }
            const tm = nextRound.matches[targetMatchIndex];
            if (slot === 'teamA') tm.teamA.name = winnerName;
            else tm.teamB.name = winnerName;
        }
    } catch(e) { /* ignore */ }
    renderBracketDOM(true);
}

// ---------------------------
// NAVEGAÇÃO, TABS, OVERVIEW
// ---------------------------
export function switchTab(tabName) {
    state.activeTab = tabName;
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden-section'));
    const activeEl = document.getElementById(`tab-${tabName}`);
    if(activeEl) activeEl.classList.remove('hidden-section');
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.dataset.tab === tabName) btn.classList = "nav-btn pb-4 text-sm font-bold whitespace-nowrap border-b-2 text-white border-yellow-500 transition-colors uppercase tracking-wide";
        else btn.classList = "nav-btn pb-4 text-sm font-bold whitespace-nowrap border-b-2 border-transparent text-gray-500";
    });
}

export function switchOverviewInfo(key) {
    const t = state.currentTournament;
    // Pega o conteúdo padrão do arquivo de banco de dados
    const defaultData = OVERVIEW_DATA[key] || { title: key, content: '<p>Sem conteúdo</p>' };
    
    let contentHtml = defaultData.content;

    // LÓGICA CORRIGIDA: Verifica se existe personalização salva no torneio
    if (t && t.customOverview) {
        // Mapeamento: O botão pode se chamar 'calendario', mas no banco salvamos como 'playoffs'
        if (key === 'calendario' && t.customOverview.playoffs) {
            contentHtml = t.customOverview.playoffs;
        }
        // Regras
        else if (key === 'regras' && t.customOverview.regras) {
            contentHtml = t.customOverview.regras;
        }
        // Inscrição
        else if (key === 'inscricao' && t.customOverview.inscricao) {
            contentHtml = t.customOverview.inscricao;
        }
        // Transmissão
        else if (key === 'transmissoes' && t.customOverview.transmissoes) {
            contentHtml = t.customOverview.transmissoes;
        }
        // Prêmios (lida com acento ou sem)
        else if ((key === 'premios' || key === 'prêmios') && (t.customOverview.premios || t.customOverview["prêmios"])) {
            contentHtml = t.customOverview.premios || t.customOverview["prêmios"];
        }
        // Caso genérico (se o nome da chave for igual)
        else if (t.customOverview[key]) {
            contentHtml = t.customOverview[key];
        }
    }

    const container = document.getElementById('overview-dynamic-text');
    if(!container) return;
    
    // Atualiza visual dos botões
    document.querySelectorAll('.overview-btn').forEach(btn => btn.className = "overview-btn w-full bg-[#15171e] border border-gray-800 hover:border-gray-600 rounded-xl p-5 cursor-pointer text-left transition-all group");
    const activeBtn = document.getElementById(`btn-${key}`);
    if(activeBtn) activeBtn.className = "overview-btn w-full bg-yellow-500 rounded-xl p-5 cursor-default text-left shadow-lg transform scale-[1.02] border border-yellow-400";

    // Injeta o HTML (editado ou padrão)
    container.innerHTML = `
        <h3 class="text-2xl font-bold text-white mb-6 uppercase tracking-wide border-b border-gray-800 pb-4">
            ${defaultData.title}
        </h3>
        <div class="editable-text-area text-gray-300 leading-relaxed">
            ${contentHtml}
        </div>`;
        
    if(window.lucide) lucide.createIcons();
}

// ---------------------------
// CRIAÇÃO DE TORNEIO (CORRIGIDO: VISUAL + LÓGICA)
// ---------------------------

// 1. ABRIR O MODAL (Visual Sofisticado igual à FOTO 2)
export function openCreateTournamentModal() {
    // Garante que fecha anteriores
    const old = document.getElementById('create-tournament-modal');
    if(old) old.remove();

    const html = `
    <div id="create-tournament-modal" class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
        <div class="bg-[#15171e] w-full max-w-lg rounded-xl border border-gray-800 shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            
            <div class="flex justify-between items-start mb-6">
                <h3 class="text-white font-bold text-xl flex items-center gap-2">
                    <span class="text-yellow-500">🏆</span> Novo Campeonato
                </h3>
                <button type="button" onclick="closeCreateTournamentModal()" class="text-gray-500 hover:text-white transition-colors">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>

            <form onsubmit="handleCreateTournamentForm(event)" class="space-y-4">
                <div>
                    <label class="block text-gray-400 text-xs font-bold mb-1 uppercase">Nome do Evento</label>
                    <input type="text" id="tour-name" required class="w-full bg-[#0f1116] border border-gray-800 text-white px-4 py-3 rounded-lg text-sm focus:border-yellow-500 outline-none placeholder-gray-600">
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
                    
                    <label for="tour-banner-upload" class="flex gap-4 items-center bg-[#0f1116] p-4 rounded-xl border border-gray-800 cursor-pointer hover:border-gray-600 transition-all h-24 relative overflow-hidden group">
                        
                        <div class="w-16 h-full rounded bg-[#1c1f26] border border-gray-700 flex items-center justify-center overflow-hidden shrink-0 z-10">
                            <img id="create-tour-banner-preview" class="w-full h-full object-cover hidden">
                            <i id="tour-banner-icon" data-lucide="image" class="w-6 h-6 text-gray-500"></i>
                        </div>
                        
                        <div class="z-10">
                            <span class="bg-[#1c1f26] text-white text-xs font-bold px-3 py-1.5 rounded border border-gray-700 shadow-sm group-hover:bg-gray-700 transition-colors">Escolher Imagem</span>
                            <p class="text-[10px] text-gray-500 mt-2">Recomendado 1920x1080.</p>
                        </div>

                        <input type="file" id="tour-banner-upload" hidden accept="image/*" onchange="previewTourBannerInternal(this)">
                    </label>
                </div>

                <button type="submit" class="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition-all shadow-lg shadow-yellow-900/20 mt-4 uppercase text-sm tracking-wide">
                    Publicar Campeonato
                </button>
            </form>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', html);
    if(window.lucide) lucide.createIcons();
}

// 2. FUNÇÃO DE FECHAR CORRETA
export function closeCreateTournamentModal() {
    const el = document.getElementById('create-tournament-modal');
    if(el) el.remove();
}

// 3. PREVIEW INTERNO (Adaptado para o ID deste modal)
window.previewTourBannerInternal = function(input) {
    // Reutiliza a lógica global, mas controla o ícone também
    const file = input.files && input.files[0];
    if (!file) return;
    
    // Atualiza variável global do arquivo para o upload
    // (Nota: precisamos acessar a variavel selectedTourBannerFile definida lá em cima no seu arquivo)
    // Como ela não foi exportada, vamos defini-la no escopo global temporariamente ou confiar que o upload pegue do input
    
    const url = URL.createObjectURL(file);
    const img = document.getElementById('create-tour-banner-preview');
    const icon = document.getElementById('tour-banner-icon');
    
    if (img) {
        img.src = url;
        img.classList.remove('hidden');
    }
    if (icon) {
        icon.classList.add('hidden');
    }
}

// 4. SALVAR (Lógica corrigida para pegar IDs e não FormData)
export async function handleCreateTournamentForm(e) {
    e.preventDefault();
    
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerText = "Criando...";
    btn.disabled = true;

    try {
        // Pega valores pelo ID direto (FormData falha se não tiver name="")
        const name = document.getElementById('tour-name').value;
        const prize = document.getElementById('tour-prize').value;
        const teamsVal = document.getElementById('tour-teams').value;
        const format = document.getElementById('tour-format').value;
        
        // Pega o arquivo direto do input
        const fileInput = document.getElementById('tour-banner-upload');
        const bannerFile = fileInput && fileInput.files ? fileInput.files[0] : null;

        const newT = {
            name: name,
            maxTeams: parseInt(teamsVal) || 32,
            prize: prize,
            format: format,
            createdAt: new Date(), // Firebase timestamp preferencialmente
            status: 'Aberto',
            registeredTeams: 0,
            registeredTeamsList: [],
            requests: [],
            image: '', // será preenchido após upload
            logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${name}`,
            customOverview: {}
        };

        // Upload da Imagem
        if (bannerFile) {
            // Gera ID temporário se não tiver DB, ou usa Date
            const tempId = 't_' + Date.now();
            const url = await uploadImageToFirebase(bannerFile, `tournaments/${tempId}/banner.jpg`).catch(err => {
                console.error("Erro imagem:", err);
                return null;
            });
            if (url) newT.image = url;
        } else {
            // Imagem padrão
            newT.image = "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80";
        }

        // Salvar no Firebase ou Mock
        if (window.addDoc && window.collection && window.db) {
            await window.addDoc(window.collection(window.db, "tournaments"), newT);
            showToast('Campeonato criado com sucesso!', 'success');
        } else {
            // Fallback para array local
            newT.id = 't_' + Date.now();
            TOURNAMENTS.unshift(newT);
            showToast('Torneio criado (Modo Local).', 'success');
        }

        closeCreateTournamentModal();
        renderTournamentsList();

    } catch (err) {
        console.error(err);
        showToast('Erro ao criar: ' + err.message, 'error');
    } finally {
        btn.innerText = "PUBLICAR CAMPEONATO";
        btn.disabled = false;
    }
}

// ---------------------------
// UTILIDADES DE NAVEGAÇÃO
// ---------------------------
export function navigateToPage(slug) {
    // espera que exista uma função de roteamento — fallback: procura por ids
    try {
        if (window.navigateTo) return window.navigateTo(slug);
        // else: simula páginas por slug 'campeonato-<id>'
        if (slug.startsWith('campeonato-')) {
            const id = slug.replace('campeonato-', '');
            renderTournamentPro(id);
            window.scrollTo({top:0, behavior:'smooth'});
            return;
        }
        // se for 'campeonatos' volta para lista
        if (slug === 'campeonatos' || slug === 'torneios') {
            renderTournamentsList();
            window.scrollTo({top:0, behavior:'smooth'});
            return;
        }
        // team-detail-<id>
        if (slug.startsWith('team-detail-')) {
            const id = slug.replace('team-detail-', '');
            // se existir função externa abrir team
            if (window.openTeamPage) return window.openTeamPage(id);
            showToast('Abrir time: ' + id, 'info');
        }
    } catch(e) { console.error(e); }
}
export function openAdminPanel() {
    const old = document.getElementById('admin-panel-modal'); 
    if(old) old.remove();

    const html = `
    <div id="admin-panel-modal" class="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
        <div class="bg-[#15171e] w-full max-w-md rounded-xl border border-red-900/50 shadow-[0_0_50px_rgba(220,38,38,0.1)] overflow-hidden">
            
            <div class="bg-gradient-to-r from-red-900/20 to-transparent p-6 border-b border-red-900/20 flex justify-between items-center">
                <h3 class="text-white font-bold text-xl flex items-center gap-2">
                    <i data-lucide="shield-alert" class="text-red-500"></i> Painel Admin
                </h3>
                <button onclick="document.getElementById('admin-panel-modal').remove()" class="text-gray-400 hover:text-white transition-colors">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <div class="p-6 space-y-4">
                <p class="text-gray-400 text-sm mb-4">Bem-vindo à central de controle da Strays Legends.</p>

                <button onclick="document.getElementById('admin-panel-modal').remove(); openCreateTournamentModal();" class="w-full bg-[#1c1f26] hover:bg-[#252830] border border-gray-700 hover:border-yellow-500 p-4 rounded-xl flex items-center gap-4 group transition-all text-left">
                    <div class="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform">
                        <i data-lucide="plus" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h4 class="text-white font-bold text-sm">Criar Campeonato</h4>
                        <p class="text-gray-500 text-xs">Adicionar novo torneio à lista.</p>
                    </div>
                </button>

                <button onclick="document.getElementById('admin-panel-modal').remove(); navigateToPage('campeonatos');" class="w-full bg-[#1c1f26] hover:bg-[#252830] border border-gray-700 hover:border-blue-500 p-4 rounded-xl flex items-center gap-4 group transition-all text-left">
                    <div class="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        <i data-lucide="list" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h4 class="text-white font-bold text-sm">Gerenciar Torneios</h4>
                        <p class="text-gray-500 text-xs">Ver lista e editar existentes.</p>
                    </div>
                </button>
            </div>
            
            <div class="p-4 bg-black/20 text-center border-t border-white/5">
                <p class="text-[10px] text-gray-600 uppercase font-bold">Strays Legends System v1.0</p>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', html);
    if(window.lucide) lucide.createIcons();
}

// ---------------------------
// EXPORTS FINAIS E ATTACH AO WINDOW
// ---------------------------
export function openCreateTournamentModalWrapper() { openCreateTournamentModal(); }
export function closeCreateTournamentModalWrapper() { const m = document.getElementById('create-tour-modal'); if(m) m.remove(); }

window.openSubscribeModal = openSubscribeModal;
window.executeSubscription = executeSubscription;
window.approveTeam = approveTeam;
window.rejectTeam = rejectTeam;
window.openEditTournamentModal = openEditTournamentModal;
window.closeEditTournamentModal = closeEditTournamentModal;
window.saveTournamentChanges = saveTournamentChanges;
window.setMatchWinner = setMatchWinner;
window.previewTourBanner = previewTourBanner;
window.openCreateTournamentModal = openCreateTournamentModal;
window.handleCreateTournamentForm = handleCreateTournamentForm;
window.navigateToPage = navigateToPage;

// inicialização opcional para quem importa diretamente

// EOF - fim do arquivo
