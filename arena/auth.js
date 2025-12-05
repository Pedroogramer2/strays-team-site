// auth.js
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

// --- FUNÇÕES DE AUTH ---
function isValidEmailDomain(email) {
    const allowedDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'live.com'];
    const domain = email.split('@')[1];
    return allowedDomains.includes(domain);
}

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
    
    // --- CORREÇÃO AQUI: Mudado de u4nted_user para strays_user ---
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
        alert("Erro ao conectar com Google: " + error.message);
    }
};

window.handleRegisterEmail = async (event) => {
    event.preventDefault();
    const nome = document.getElementById('reg-nome').value;
    const email = document.getElementById('reg-email').value;
    const nick = document.getElementById('reg-nick').value;
    const senha = document.getElementById('reg-senha').value;
    const confirmSenha = document.getElementById('reg-confirm').value;

    if (senha !== confirmSenha) { alert("Senhas não coincidem!"); return; }
    if (!nick) { alert("Preencha o Nick!"); return; }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;
        await updateProfile(user, { displayName: nome });
        await setDoc(doc(db, "users", user.uid), {
            email: email, name: nome, nick: nick, role: 'user', createdAt: new Date(), riotAccount: null
        });
        await saveUserSession(user);
    } catch (error) { alert("Erro ao cadastrar: " + error.message); }
};

window.handleLoginEmail = async (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);
        await saveUserSession(userCredential.user);
    } catch (error) { alert("Erro ao entrar: " + error.message); }
};

window.handleLogout = () => {
    signOut(auth).then(() => {
        // --- CORREÇÃO AQUI TAMBÉM ---
        localStorage.removeItem('strays_user');
        window.dispatchEvent(new Event('auth-change'));
        window.location.href = 'index.html';
    });
};

window.searchUserByNick = async (nickToFind) => {
    try {
        const q = query(collection(db, "users"), where("nick", "==", nickToFind));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) { return { uid: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() }; }
        return null;
    } catch (error) { return null; }
};

window.getAllUsers = async () => {
    const s = await getDocs(collection(db, "users"));
    let l = []; s.forEach((d) => l.push({ id: d.id, ...d.data() })); return l;
}

window.changeUserRole = async (targetUid, newRole) => {
    try {
        await updateDoc(doc(db, "users", targetUid), { role: newRole });
        alert(`Sucesso! Cargo alterado para ${newRole}`);
        if(window.renderAdminPanel) window.renderAdminPanel();
    } catch (error) { alert("Erro ao mudar cargo."); }
}