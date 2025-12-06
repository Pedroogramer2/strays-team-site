// js/pages/players.js

// --- GERAÇÃO DO CARD DE JOGADOR ---
export function generatePlayerCard(p) {
    const avatar = p.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${p.nick}`;
    const teamBadge = p.team 
        ? `<span class="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs rounded-lg font-medium">${p.team}</span>` 
        : `<span class="px-3 py-1 bg-gray-800 text-gray-500 text-xs rounded-lg font-medium">Free Agent</span>`;

    return `
        <div onclick="navigateToPage('player-detail-${p.id}')" class="bg-[#15171e] p-6 rounded-xl border border-transparent hover:border-gray-700 transition-all flex flex-col items-center text-center group cursor-pointer relative overflow-hidden shadow-lg">
            <div class="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-lg group-hover:scale-110 transition-transform overflow-hidden relative z-10 border-2 border-gray-700">
                <img src="${avatar}" class="w-full h-full object-cover">
            </div>
            <h3 class="text-white font-bold text-lg mb-1 group-hover:text-yellow-500 transition-colors relative z-10">${p.nick}</h3>
            <p class="text-gray-500 text-xs mb-4 flex items-center gap-1 relative z-10">
                <span class="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span> Brasil
            </p>
            <div class="relative z-10">${teamBadge}</div>
        </div>
    `;
}

// --- RENDERIZAÇÃO DA PÁGINA (100% FIREBASE) ---
export async function renderPlayersPage() {
    const content = document.getElementById('page-content');
    content.innerHTML = `<div class="text-center text-white mt-10 animate-pulse">Carregando Jogadores...</div>`;
    
    try {
        // Busca todos os usuários do Firebase
        const q = window.query(window.collection(window.db, "users"), window.orderBy("createdAt", "desc")); // Ordena por data de criação
        const snapshot = await window.getDocs(q);
        
        let users = [];
        snapshot.forEach(doc => {
            users.push({ id: doc.id, ...doc.data() });
        });

        if (users.length === 0) {
            content.innerHTML = `<div class="text-center text-gray-500 mt-10">Nenhum jogador registrado.</div>`;
            return;
        }

        const cardsHtml = users.map(p => {
             // Normaliza os dados para o card
             const finalP = {
                 id: p.id || p.uid, 
                 nick: p.nick || p.name || "Sem Nick",
                 photo: p.photo,
                 team: p.team || null // Você pode melhorar isso buscando se o player está num time
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
        
        // Lógica de Busca (Client-Side filtering)
        const input = document.getElementById('player-search');
        if(input) {
            input.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = users.filter(p => (p.nick || p.name || '').toLowerCase().includes(term));
                
                document.getElementById('players-grid').innerHTML = filtered.map(p => {
                    const finalP = { id: p.id, nick: p.nick||p.name, photo: p.photo, team: p.team };
                    return generatePlayerCard(finalP);
                }).join('');
            });
        }
    } catch (e) {
        console.error(e);
        content.innerHTML = `<div class="text-center text-red-500 mt-10">Erro ao carregar lista de jogadores.</div>`;
    }
}

// --- PERFIL PÚBLICO (100% FIREBASE) ---
export async function renderPlayerDetailPage(playerId) {
    const content = document.getElementById('page-content');
    content.innerHTML = `<div class="text-center text-white mt-10">Carregando perfil...</div>`;

    try {
        const docRef = window.doc(window.db, "users", playerId);
        const docSnap = await window.getDoc(docRef);

        if (!docSnap.exists()) {
            content.innerHTML = `<div class="text-center text-red-500 mt-10">Jogador não encontrado.</div>`;
            return;
        }

        const p = { id: docSnap.id, ...docSnap.data() };
        
        // Normaliza dados
        const userNick = p.nick || p.name;
        const userAvatar = p.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${userNick}`;
        const userBio = p.bio || "Sem assinatura definida.";

        const userJson = localStorage.getItem('strays_user');
        const loggedUser = userJson ? JSON.parse(userJson) : null;
        const isMe = loggedUser && String(loggedUser.uid) === String(p.id);

        const editButton = isMe ? 
            `<a href="editar-perfil.html" class="bg-[#1c1f26] border border-gray-700 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors text-sm"><i data-lucide="edit-2" class="w-4 h-4"></i> Editar</a>` 
            : '';

        content.innerHTML = `
        <div class="max-w-7xl mx-auto px-8 py-12 animate-fadeIn">
            <button onclick="navigateToPage('players')" class="flex items-center gap-2 text-gray-500 hover:text-white text-sm font-bold mb-8 transition-colors">
                <i data-lucide="arrow-left" class="w-4 h-4"></i> Voltar para lista
            </button>

            <div class="flex items-center justify-between mb-12">
                <div class="flex items-center gap-6">
                    <div class="w-24 h-24 rounded-full bg-gray-800 border-2 border-gray-700 overflow-hidden shrink-0">
                        <img src="${userAvatar}" class="w-full h-full object-cover">
                    </div>
                    <div class="flex flex-col gap-1">
                        <h1 class="text-4xl font-black text-white leading-none">${userNick}</h1>
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
                        <h3 class="text-gray-500 text-[10px] font-bold uppercase mb-3">BIO</h3>
                        <p class="text-gray-300 italic text-sm">"${userBio}"</p>
                    </div>
                    <div class="flex gap-6 text-sm">
                        <div class="flex items-center gap-2 text-gray-400"><i data-lucide="map-pin" class="w-4 h-4 text-purple-500"></i> Brasil</div>
                        <div class="flex items-center gap-2 text-gray-400"><i data-lucide="gamepad-2" class="w-4 h-4 text-purple-500"></i> Valorant</div>
                    </div>
                </div>

                <div class="lg:col-span-2">
                    <div class="bg-[#15171e] border border-gray-800 p-8 rounded-xl text-center">
                        <p class="text-gray-500">Estatísticas em breve.</p>
                    </div>
                </div>
            </div>
        </div>
        `;
        if(window.lucide) lucide.createIcons();

    } catch(e) {
        console.error(e);
        content.innerHTML = `<div class="text-center text-red-500 mt-10">Erro ao carregar perfil.</div>`;
    }
}

// Bindings
window.renderPlayersPage = renderPlayersPage;
window.renderPlayerDetailPage = renderPlayerDetailPage;