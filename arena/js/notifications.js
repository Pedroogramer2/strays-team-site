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
    arrayUnion 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Inicializa as ferramentas (Pega as instâncias já criadas pelo Firebase)
const db = getFirestore();
const auth = getAuth();

window.NotificationSystem = {
    
    // 1. INICIAR ESCUTA (Roda assim que o site abre)
    // Fica vigiando o banco de dados por novas mensagens para o usuário logado
    init: () => {
        onAuthStateChanged(auth, user => {
            if (user) {
                // Filtra notificações onde o destino (toUid) é o usuário atual
                const q = query(collection(db, "notifications"), where("toUid", "==", user.uid));
                
                // onSnapshot é o "ouvido" do Firebase: roda sempre que chega algo novo
                onSnapshot(q, (snapshot) => {
                    const notifs = [];
                    snapshot.forEach(doc => {
                        notifs.push({ id: doc.id, ...doc.data() });
                    });
                    
                    // Ordena: mais recentes primeiro
                    notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    
                    // Manda desenhar na tela
                    NotificationSystem.render(notifs);
                });
            }
        });
    },

    // 2. ENVIAR NOTIFICAÇÃO (Usado por teams.js e tournaments.js)
    send: async (toUid, type, title, message, actionData = null) => {
        try {
            await addDoc(collection(db, "notifications"), {
                toUid: toUid,
                type: type, // 'invite' ou 'info'
                title: title,
                message: message,
                actionData: actionData, // Ex: { teamId: '123' }
                read: false,
                createdAt: new Date().toISOString()
            });
            console.log("Notificação enviada com sucesso!");
        } catch (e) {
            console.error("Erro ao enviar notificação:", e);
            if(window.showToast) window.showToast("Erro ao enviar aviso.", "error");
        }
    },

    // 3. DESENHAR NA TELA (Preenche o sininho)
    render: (notifs) => {
        const unreadCount = notifs.length;
        
        // Liga/Desliga a bolinha vermelha
        const dot = document.querySelector('.notif-dot');
        if (dot) {
            dot.style.display = unreadCount > 0 ? 'block' : 'none';
        }

        // Preenche a lista do dropdown
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

    // Cria o HTML de cada item da lista
    htmlItem: (n) => {
        let icon = 'info';
        let actionHtml = '';
        let iconClass = 'bg-blue-500';

        if (n.type === 'invite') {
            icon = 'user-plus';
            iconClass = 'bg-purple-600';
            // Botões de Aceitar/Recusar
            actionHtml = `
                <div class="flex gap-2 mt-2">
                    <button onclick="NotificationSystem.acceptInvite('${n.id}', '${n.actionData.teamId}')" class="bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded transition-colors">Aceitar</button>
                    <button onclick="NotificationSystem.delete('${n.id}')" class="bg-gray-700 hover:bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded transition-colors">Recusar</button>
                </div>
            `;
        } else {
             // Apenas limpar para avisos simples
             actionHtml = `<button onclick="NotificationSystem.delete('${n.id}')" class="text-[10px] text-gray-500 hover:text-white mt-1 underline">Limpar</button>`;
        }

        return `
            <div class="p-4 border-b border-gray-800 hover:bg-white/5 transition-colors flex gap-3">
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

    // 4. LÓGICA DE ACEITAR CONVITE
    acceptInvite: async (notifId, teamId) => {
        const user = auth.currentUser;
        if (!user) return;

        // Botão visual feedback (opcional, já que recarrega rápido)
        if(window.showToast) window.showToast("Entrando no time...", "success");

        try {
            const teamRef = doc(db, "teams", teamId);
            const teamSnap = await getDoc(teamRef);

            if (!teamSnap.exists()) {
                alert("Este time não existe mais.");
                await NotificationSystem.delete(notifId);
                return;
            }

            const teamData = teamSnap.data();
            
            // Verifica se já está no time
            if (teamData.roster && teamData.roster.some(m => m.uid === user.uid)) {
                alert("Você já está neste time.");
                await NotificationSystem.delete(notifId);
                return;
            }

            // Pega dados atualizados do usuário para gravar no time
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.data();

            const newMember = {
                uid: user.uid,
                nick: userData.nick || user.displayName,
                name: userData.name || user.displayName,
                photo: userData.photo || user.photoURL,
                role: 'Membro', // Entra como membro padrão
                gameRole: 'Flex',
                riotAccount: userData.riotAccount || null
            };

            // Atualiza o time no Banco
            await updateDoc(teamRef, {
                roster: arrayUnion(newMember),
                members: (teamData.members || 0) + 1
            });

            // Apaga a notificação pois já foi usada
            await NotificationSystem.delete(notifId);

            // Atualiza localstorage para refletir a mudança
            let localTeams = JSON.parse(localStorage.getItem('u4nted_teams_db') || '[]');
            // Se o time estiver no localstorage (cache), atualiza ele também
            const localIndex = localTeams.findIndex(t => String(t.id) === String(teamId));
            if(localIndex > -1) {
                localTeams[localIndex].roster.push(newMember);
                localTeams[localIndex].members += 1;
                localStorage.setItem('u4nted_teams_db', JSON.stringify(localTeams));
            }

            alert(`Bem-vindo ao ${teamData.name}!`);
            window.location.href = `index.html#team-detail-${teamId}`;
            window.location.reload(); // Recarrega para atualizar a UI

        } catch (e) {
            console.error(e);
            alert("Erro ao entrar no time: " + e.message);
        }
    },

    // 5. APAGAR NOTIFICAÇÃO
    delete: async (id) => {
        try {
            await deleteDoc(doc(db, "notifications", id));
        } catch(e) {
            console.error("Erro ao apagar notificação", e);
        }
    },

    // Limpar todas
    clearAll: async () => {
        if(!confirm("Limpar todas as notificações?")) return;
        // Pega as atuais da tela/memoria se possível, ou faz query de novo
        // Simplificação: Avisa usuário para limpar uma a uma ou implementa batch delete depois
        if(window.showToast) window.showToast("Limpe uma por uma por enquanto.", "info");
    }
};

// Inicia o sistema automaticamente
NotificationSystem.init();