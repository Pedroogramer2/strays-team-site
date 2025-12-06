// auth.js - ATUALIZADO (Sem Alerts)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc, 
    orderBy,
    arrayUnion
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// --- SUAS CHAVES ---
const firebaseConfig = {
  apiKey: "AIzaSyDaaBVNHZ6UOgHzb-pzT1RJxAT5yiQZLw0",
  authDomain: "site-strays.firebaseapp.com",
  projectId: "site-strays",
  storageBucket: "site-strays.firebasestorage.app", 
  messagingSenderId: "1005872178248",
  appId: "1:1005872178248:web:36dfa929ab008a4415e47d",
  measurementId: "G-5FWVKCPRZY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); 
const googleProvider = new GoogleAuthProvider();

// --- EXPORTAR FERRAMENTAS PARA O WINDOW ---
window.db = db;
window.auth = auth; 
window.storage = storage;       
window.storageRef = ref;        
window.uploadBytes = uploadBytes; 
window.getDownloadURL = getDownloadURL; 

// Ferramentas do Firestore
window.collection = collection;
window.addDoc = addDoc;
window.doc = doc;
window.setDoc = setDoc;
window.deleteDoc = deleteDoc;
window.getDoc = getDoc;
window.getDocs = getDocs;
window.updateDoc = updateDoc;
window.query = query;
window.where = where;
window.orderBy = orderBy;
window.arrayUnion = arrayUnion;

// Helper para Toast seguro (caso main.js não tenha carregado ainda)
function safeToast(msg, type = 'error') {
    if (window.showToast) {
        window.showToast(msg, type);
    } else {
        console.warn("Toast system not ready, falling back to alert:", msg);
        // Fallback temporário apenas se o toast falhar muito feio
        alert(msg); 
    }
}

// --- FUNÇÕES DE AUTH ---
async function saveUserSession(user) {
    let role = 'user';
    let riotAccount = null;
    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const data = userSnap.data();
            role = data.role || 'user';
            riotAccount = data.riotAccount || null;
        } else {
            await setDoc(userRef, {
                email: user.email,
                role: 'user',
                nick: user.displayName,
                name: user.displayName,
                photo: user.photoURL,
                createdAt: new Date(),
                riotAccount: null
            });
        }
    } catch (error) { console.error("Erro ao salvar user:", error); }

    const userData = {
        name: user.displayName || "Usuário",
        email: user.email,
        photo: user.photoURL,
        uid: user.uid,
        role: role,
        riotAccount: riotAccount
    };
    
    localStorage.setItem('strays_user', JSON.stringify(userData));
    
    window.dispatchEvent(new Event('auth-change'));
    window.location.href = 'perfil.html';
}

window.handleGoogleAuth = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        await saveUserSession(user);
    } catch (error) {
        console.error("Erro Google:", error);
        safeToast("Erro ao conectar com Google: " + error.message, "error");
    }
};

window.handleRegisterEmail = async (event) => {
    event.preventDefault();
    const nome = document.getElementById('reg-nome').value;
    const email = document.getElementById('reg-email').value;
    const nick = document.getElementById('reg-nick').value;
    const senha = document.getElementById('reg-senha').value;
    const confirmSenha = document.getElementById('reg-confirm').value;

    if (senha !== confirmSenha) { safeToast("Senhas não coincidem!", "error"); return; }
    if (!nick) { safeToast("Preencha o Nick!", "error"); return; }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;
        await updateProfile(user, { displayName: nome });
        await setDoc(doc(db, "users", user.uid), {
            email: email, name: nome, nick: nick, role: 'user', createdAt: new Date(), riotAccount: null
        });
        safeToast("Conta criada com sucesso!", "success");
        await saveUserSession(user);
    } catch (error) { safeToast("Erro ao cadastrar: " + error.message, "error"); }
};

window.handleLoginEmail = async (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);
        await saveUserSession(userCredential.user);
    } catch (error) { safeToast("Erro ao entrar: " + error.message, "error"); }
};

window.handleLogout = () => {
    signOut(auth).then(() => {
        localStorage.removeItem('strays_user');
        window.dispatchEvent(new Event('auth-change'));
        window.location.href = 'index.html';
    });
};

window.searchUserByNick = async (nickToFind) => {
    try {
        console.log("Buscando usuário:", nickToFind);
        
        // 1. Tenta buscar pelo campo 'nick'
        const qNick = query(collection(db, "users"), where("nick", "==", nickToFind));
        const snapNick = await getDocs(qNick);
        
        if (!snapNick.empty) { 
            const docData = snapNick.docs[0].data();
            console.log("Encontrado por nick:", docData);
            return { uid: snapNick.docs[0].id, ...docData }; 
        }

        // 2. Se não achou, tenta buscar pelo campo 'name' (Nome real)
        // Isso resolve o caso onde a pessoa cadastrou "Pedro" como nome e o nick ficou igual ou vazio
        const qName = query(collection(db, "users"), where("name", "==", nickToFind));
        const snapName = await getDocs(qName);

        if (!snapName.empty) {
            const docData = snapName.docs[0].data();
            console.log("Encontrado por nome:", docData);
            return { uid: snapName.docs[0].id, ...docData };
        }

        console.log("Nenhum usuário encontrado.");
        return null;
    } catch (error) { 
        console.error("Erro na busca:", error);
        return null; 
    }
};

window.getAllUsers = async () => {
    const s = await getDocs(collection(db, "users"));
    let l = []; s.forEach((d) => l.push({ id: d.id, ...d.data() })); return l;
}

window.changeUserRole = async (targetUid, newRole) => {
    try {
        await updateDoc(doc(db, "users", targetUid), { role: newRole });
        safeToast(`Sucesso! Cargo alterado para ${newRole}`, "success");
        if(window.renderAdminPanel) window.renderAdminPanel();
    } catch (error) { safeToast("Erro ao mudar cargo.", "error"); }
}