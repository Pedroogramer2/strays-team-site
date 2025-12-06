// js/notifications.js
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    where, 
    onSnapshot, 
    doc, 
    updateDoc, 
    deleteDoc, 
    getDoc, 
    getDocs, // Adicionado
    writeBatch, // Adicionado para deletar em massa
    arrayUnion 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Inicializa as ferramentas
const db = getFirestore();
const auth = getAuth();

window.NotificationSystem = {
    
    // 1. INICIAR ESCUTA
    init: () => {
        onAuthStateChanged(auth, user => {
            if (user) {
                const q = query(collection(db, "notifications"), where("toUid", "==", user.uid));
                
                onSnapshot(q, (snapshot) => {
                    const notifs = [];
                    snapshot.forEach(doc => {
                        notifs.push({ id: doc.id, ...doc.data() });
                    });
                    
                    // Ordena: mais recentes primeiro
                    notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    
                    NotificationSystem.render(notifs);
                });
            }
        });
    },

    // 2. ENVIAR NOTIFICAÇÃO
    send: async (toUid, type, title, message, actionData = null) => {
        try {
            await addDoc(collection(db, "notifications"), {
                toUid: toUid,
                type: type, // 'invite' ou 'info'
                title: title,
                message: message,
                actionData: actionData,
                read: false,
                createdAt: new Date().toISOString()
            });
        } catch (e) {
            console.error("Erro ao enviar notificação:", e);
        }
    },

    // 3. RENDERIZAR NA TELA
    render: (notifs) => {
        const unreadCount = notifs.length;
        
        const dot = document.querySelector('.notif-dot');
        if (dot) {
            dot.style.display = unreadCount > 0 ? 'block' : 'none';
        }

        const list = document.getElementById('notification-list');
        if (list) {
            if (notifs.length === 0) {
                list.innerHTML = '<div class="p-4 text-center text-gray-500 text-xs">Nenhuma notificação nova.</div>';
            } else {
                list.innerHTML = notifs.map(n => NotificationSystem.htmlItem(n)).join('');
                if(window.lucide) lucide.createIcons();
            }
        }
    },

    htmlItem: (n) => {
        let icon = 'info';
        let actionHtml = '';
        let iconClass = 'bg-blue-500';

        if (n.type === 'invite') {
            icon = 'user-plus';
            iconClass = 'bg-purple-600';
            actionHtml = `
                <div class="flex gap-2 mt-2">
                    <button onclick="NotificationSystem.acceptInvite('${n.id}', '${n.actionData.teamId}')" class="bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded transition-colors">Aceitar</button>
                    <button onclick="NotificationSystem.delete('${n.id}')" class="bg-gray-700 hover:bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded transition-colors">Recusar</button>
                </div>
            `;
        } else {
             actionHtml = `<button onclick="NotificationSystem.delete('${n.id}')" class="text-[10px] text-gray-500 hover:text-white mt-1 underline">Limpar</button>`;
        }

        return `
            <div class="p-4 border-b border-gray-800 hover:bg-white/5 transition-colors flex gap-3 animate-fadeIn">
                <div class="w-8 h-8 rounded-full ${iconClass} flex items-center justify-center shrink-0 text-white">
                    <i data-lucide="${icon}" class="w-4 h-4"></i>
                </div>
                <div class="flex-1">
                    <h4 class="text-white text-sm font-bold leading-tight">${n.title}</h4>
                    <p class="text-gray-400 text-xs mt-1 leading-relaxed">${n.message}</p>
                    ${actionHtml}
                </div>
            </div>
        `;
    },

    // 4. ACEITAR CONVITE
    acceptInvite: async (notifId, teamId) => {
        const user = auth.currentUser;
        if (!user) return;

        if(window.showToast) window.showToast("Entrando no time...", "info");

        try {
            const teamRef = doc(db, "teams", teamId);
            const teamSnap = await getDoc(teamRef);

            if (!teamSnap.exists()) {
                window.showToast("Time não existe mais.", "error");
                await NotificationSystem.delete(notifId);
                return;
            }

            const teamData = teamSnap.data();
            
            if (teamData.roster && teamData.roster.some(m => m.uid === user.uid)) {
                window.showToast("Você já está neste time.", "info");
                await NotificationSystem.delete(notifId);
                return;
            }

            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.data();

            const newMember = {
                uid: user.uid,
                nick: userData.nick || user.displayName,
                name: userData.name || user.displayName,
                photo: userData.photo || user.photoURL,
                role: 'Membro',
                gameRole: 'Flex',
                riotAccount: userData.riotAccount || null
            };

            await updateDoc(teamRef, {
                roster: arrayUnion(newMember),
                members: (teamData.members || 0) + 1
            });

            await NotificationSystem.delete(notifId);

            // Atualiza LocalStorage
            let localTeams = JSON.parse(localStorage.getItem('strays_teams_db') || '[]');
            const localIndex = localTeams.findIndex(t => String(t.id) === String(teamId));
            if(localIndex > -1) {
                localTeams[localIndex].roster.push(newMember);
                localTeams[localIndex].members += 1;
                localStorage.setItem('strays_teams_db', JSON.stringify(localTeams));
            }

            window.showToast(`Bem-vindo ao ${teamData.name}!`, "success");
            setTimeout(() => {
                window.location.href = `index.html#team-detail-${teamId}`;
                window.location.reload();
            }, 1000);

        } catch (e) {
            console.error(e);
            window.showToast("Erro ao entrar no time.", "error");
        }
    },

    // 5. APAGAR UMA
    delete: async (id) => {
        try {
            await deleteDoc(doc(db, "notifications", id));
        } catch(e) { console.error(e); }
    },

    // 6. LIMPAR TODAS (MODAL CUSTOMIZADO)
    clearAll: () => {
        // Remove modal antigo se existir
        const old = document.getElementById('clear-notif-modal');
        if (old) old.remove();

        const html = `
            <div id="clear-notif-modal" class="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
                <div class="bg-[#15171e] w-full max-w-sm rounded-xl border border-red-900/50 shadow-2xl p-6 text-center">
                    <div class="w-12 h-12 rounded-full bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                        <i data-lucide="trash-2" class="text-red-500 w-6 h-6"></i>
                    </div>
                    <h3 class="text-white font-bold text-lg mb-2">Limpar notificações?</h3>
                    <p class="text-gray-400 text-xs mb-6">Todas as notificações serão apagadas permanentemente.</p>
                    <div class="flex gap-3 justify-center">
                        <button onclick="document.getElementById('clear-notif-modal').remove()" class="text-gray-400 hover:text-white text-sm font-bold px-4 py-2 hover:bg-white/5 rounded-lg transition-colors">Cancelar</button>
                        <button onclick="NotificationSystem.confirmClearAll()" class="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-red-900/20 transition-colors">Sim, Limpar</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        if(window.lucide) lucide.createIcons();
    },

    // EXECUTA A LIMPEZA EM MASSA
    confirmClearAll: async () => {
        const modal = document.getElementById('clear-notif-modal');
        if(modal) modal.remove();

        const user = auth.currentUser;
        if(!user) return;

        try {
            const q = query(collection(db, "notifications"), where("toUid", "==", user.uid));
            const snapshot = await getDocs(q);
            
            const batch = writeBatch(db);
            snapshot.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            if(window.showToast) window.showToast("Notificações limpas!", "success");
        } catch(e) {
            console.error(e);
            if(window.showToast) window.showToast("Erro ao limpar.", "error");
        }
    }
};

NotificationSystem.init();