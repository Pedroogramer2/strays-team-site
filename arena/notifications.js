// notifications.js
import { getFirestore, collection, addDoc, query, where, onSnapshot, doc, updateDoc, deleteDoc, getDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Inicializa (assume que o app já foi criado no auth.js)
// Precisamos pegar a instância do app que você já criou. 
// Como estamos em módulos separados, vamos instanciar de novo apontando pro mesmo projeto (o Firebase gerencia isso)
const db = getFirestore();
const auth = getAuth();

window.NotificationSystem = {
    
    // 1. INICIAR ESCUTA (REAL-TIME)
    init: () => {
        auth.onAuthStateChanged(user => {
            if (user) {
                // Escuta a coleção 'notifications' onde toUid == Eu
                const q = query(collection(db, "notifications"), where("toUid", "==", user.uid));
                
                // onSnapshot roda sempre que algo muda no banco
                onSnapshot(q, (snapshot) => {
                    const notifs = [];
                    snapshot.forEach(doc => {
                        notifs.push({ id: doc.id, ...doc.data() });
                    });
                    
                    // Ordena por data (mais novo primeiro)
                    notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    
                    // Atualiza a UI
                    NotificationSystem.render(notifs);
                });
            }
        });
    },

    // 2. ENVIAR NOTIFICAÇÃO (Grava no Firestore)
    send: async (toUid, type, title, message, actionData = null) => {
        try {
            await addDoc(collection(db, "notifications"), {
                toUid: toUid,
                type: type,
                title: title,
                message: message,
                actionData: actionData,
                read: false,
                createdAt: new Date().toISOString()
            });
            console.log("Notificação enviada para:", toUid);
        } catch (e) {
            console.error("Erro ao enviar notificação:", e);
            alert("Erro ao enviar convite.");
        }
    },

    // 3. RENDERIZAR NA TELA (Sino e Lista)
    render: (notifs) => {
        const unreadCount = notifs.length; // No Firestore, geralmente deletamos ao aceitar, ou usamos campo 'read'
        
        // Atualiza Bolinha
        const dot = document.querySelector('.notif-dot');
        if (dot) {
            dot.style.display = unreadCount > 0 ? 'block' : 'none';
        }

        // Atualiza Lista
        const list = document.getElementById('notification-list');
        if (list) {
            list.innerHTML = notifs.length === 0 
                ? '<div class="p-4 text-center text-gray-500 text-xs">Nenhuma notificação nova.</div>' 
                : notifs.map(n => NotificationSystem.htmlItem(n)).join('');
                
            if(window.lucide) lucide.createIcons();
        }
    },

    htmlItem: (n) => {
        let icon = 'info';
        let actionHtml = '';

        if (n.type === 'invite') icon = 'user-plus';
        if (n.type === 'match') icon = 'swords';

        // Botões de Ação para Convite
        if (n.type === 'invite') {
            actionHtml = `
                <div class="notif-actions">
                    <button onclick="NotificationSystem.acceptInvite('${n.id}', '${n.actionData.teamId}')" class="btn-accept">Aceitar</button>
                    <button onclick="NotificationSystem.delete('${n.id}')" class="btn-decline">Recusar</button>
                </div>
            `;
        } else {
             actionHtml = `<button onclick="NotificationSystem.delete('${n.id}')" class="text-xs text-gray-600 hover:text-white mt-1">Limpar</button>`;
        }

        return `
            <div class="notif-item">
                <div class="notif-icon ${n.type}">
                    <i data-lucide="${icon}" style="width:16px;"></i>
                </div>
                <div class="notif-content">
                    <div class="notif-title">${n.title}</div>
                    <div class="notif-msg">${n.message}</div>
                    ${actionHtml}
                </div>
            </div>
        `;
    },

    // 4. ACEITAR CONVITE (Lógica complexa de banco)
    acceptInvite: async (notifId, teamId) => {
        const user = auth.currentUser;
        if (!user) return;

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
            if (teamData.roster.some(m => m.uid === user.uid)) {
                alert("Você já está neste time.");
                await NotificationSystem.delete(notifId);
                return;
            }

            // Pega dados atuais do usuário para salvar no time
            // (Idealmente pegariamos do perfil do banco, mas vou usar o auth para ser rapido)
            // Para pegar foto e nick corretos, vamos ler o doc do usuario
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.data();

            const newMember = {
                uid: user.uid,
                nick: userData.nick || user.displayName,
                name: userData.name || user.displayName,
                photo: userData.photo || user.photoURL,
                role: 'Membro',
                riotAccount: userData.riotAccount || { rank: 'Unranked' }
            };

            // Atualiza o time no Firestore (Adiciona ao array)
            await updateDoc(teamRef, {
                roster: arrayUnion(newMember),
                members: teamData.members + 1
            });

            alert(`Você entrou no time ${teamData.name}!`);
            
            // Apaga a notificação
            await NotificationSystem.delete(notifId);

            // Redireciona
            window.location.href = `index.html#team-detail-${teamId}`;
            location.reload();

        } catch (e) {
            console.error(e);
            alert("Erro ao entrar no time: " + e.message);
        }
    },

    // 5. APAGAR NOTIFICAÇÃO
    delete: async (id) => {
        await deleteDoc(doc(db, "notifications", id));
    },

    clearAll: async () => {
        // Num app real, faríamos um batch delete. 
        // Aqui, para simplificar, vamos pedir pro usuário limpar uma por uma ou implementar depois.
        alert("Limpe individualmente por enquanto.");
    }
};

// Inicia o sistema
NotificationSystem.init();