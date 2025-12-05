// js/database.js

export const ROLES_IMG = {
    "Duelista": "https://img.icons8.com/ios-filled/50/fa314a/sword.png",
    "Controlador": "https://img.icons8.com/ios-filled/50/ffffff/smoke-explosion.png",
    "Iniciador": "https://img.icons8.com/ios-filled/50/22c55e/flash-on.png",
    "Sentinela": "https://img.icons8.com/ios-filled/50/3b82f6/shield.png",
    "Flex": "https://img.icons8.com/ios-filled/50/EAB308/change.png" // Mudei para Amarelo (Strays)
};

export const ELOS_IMG = {
    "Radiant": "https://media.valorant-api.com/competitivetiers/564d8e2d-c226-317e-4628-eb5263512e37/24/largeicon.png",
    "Immortal 3": "https://media.valorant-api.com/competitivetiers/564d8e2d-c226-317e-4628-eb5263512e37/23/largeicon.png",
    "Immortal 2": "https://media.valorant-api.com/competitivetiers/564d8e2d-c226-317e-4628-eb5263512e37/22/largeicon.png",
    "Immortal 1": "https://media.valorant-api.com/competitivetiers/564d8e2d-c226-317e-4628-eb5263512e37/21/largeicon.png",
    "Ascendant 3": "https://media.valorant-api.com/competitivetiers/564d8e2d-c226-317e-4628-eb5263512e37/20/largeicon.png",
    "Diamond 2": "https://media.valorant-api.com/competitivetiers/564d8e2d-c226-317e-4628-eb5263512e37/17/largeicon.png"
};

export const OVERVIEW_DATA = {
    'inscricao': {
        title: "Inscrição no Campeonato",
        content: `
            <p class="leading-relaxed mb-4 text-gray-300">Para garantir a vaga da sua equipe, o capitão deve realizar o cadastro e o pagamento da taxa.</p>
            <div class="mt-6 p-4 bg-yellow-500/10 border-l-4 border-yellow-500 rounded-r-lg">
                <p class="text-yellow-500 text-sm font-bold uppercase">Taxa de Inscrição</p>
                <p class="text-white font-bold text-lg">R$ 10,00 <span class="text-xs font-normal text-gray-400">/ player</span></p>
            </div>
        `
    },
    'transmissoes': {
        title: "Transmissão Oficial",
        content: `
            <p class="leading-relaxed mb-6 text-gray-300">Acompanhe todos os jogos decisivos <strong class="text-white">AO VIVO</strong> nos canais da Strays.</p>
            <div class="flex items-center gap-4">
                <a href="#" class="flex items-center gap-2 bg-[#9146FF] hover:bg-[#7c2cf5] text-white px-6 py-3 rounded-lg transition-colors font-bold shadow-lg shadow-purple-900/20"><i data-lucide="twitch" class="w-5 h-5"></i> Twitch</a>
                <a href="#" class="flex items-center gap-2 bg-[#FF0000] hover:bg-[#cc0000] text-white px-6 py-3 rounded-lg transition-colors font-bold shadow-lg shadow-red-900/20"><i data-lucide="youtube" class="w-5 h-5"></i> Youtube</a>
            </div>
        `
    },
    'playoffs': {
        title: "Calendário",
        content: `
            <div class="space-y-4">
                <div class="flex justify-between border-b border-gray-800 pb-2"><span class="text-gray-400">Fase de Grupos</span><span class="text-white font-bold">15/09 - 20/09</span></div>
                <div class="flex justify-between border-b border-gray-800 pb-2"><span class="text-gray-400">Playoffs (MD3)</span><span class="text-white font-bold">22/09 - 04/10</span></div>
                <div class="flex justify-between border-b border-gray-800 pb-2"><span class="text-yellow-500 font-bold">Grande Final</span><span class="text-yellow-500 font-bold">05/10</span></div>
            </div>
        `
    },
    'regras': {
        title: "Regras Gerais",
        content: `
            <ul class="space-y-2 text-gray-300 text-sm list-disc pl-5 marker:text-yellow-500">
                <li>Tolerância de atraso: <strong>15 minutos</strong> (W.O. automático após esse tempo).</li>
                <li>É obrigatório o uso do <strong>Moss</strong> em todas as partidas.</li>
                <li>Respeito acima de tudo: toxicidade resultará em desclassificação.</li>
            </ul>
        `
    }
};

// MOCKS DE BACKUP
export const PLAYERS_DB = [
    { id: 1, nick: "aspas", name: "Erick Santos", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aspas", team: "Leviatán", country: "Brasil", signature: "O melhor duelista.", socials: { twitter: "aspaszin" }, stats: { matches: 150, tournaments: 12, mvp: 45 }, gameStats: { elo: "Radiant", matches: 450, wins: 300, lastUpdate: "Hoje" } },
    { id: 2, nick: "sacy", name: "Gustavo Rossi", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sacy", team: "Sentinels", country: "Brasil", signature: "O careca da mira jovem.", socials: { twitter: "sacy" }, stats: { matches: 140, tournaments: 10, mvp: 20 }, gameStats: { elo: "Radiant", matches: 400, wins: 250, lastUpdate: "Ontem" } }
];

export const TEAMS_LIST_DB = [
    { id: 101, name: "STRAYS TEAM", tag: "STR", logo: "https://api.dicebear.com/7.x/identicon/svg?seed=STRAYS", members: 5, wins: 20, losses: 1, rating: "5.0", desc: "O time da casa.", matches: 21, ownerId: "mock", roster: [] },
    { id: 102, name: "LOUD", tag: "LLL", logo: "https://api.dicebear.com/7.x/identicon/svg?seed=LOUD", members: 5, wins: 15, losses: 2, rating: "4.9", desc: "Faz o L.", matches: 17, ownerId: "mock", roster: [] }
];

export const TOURNAMENTS = [
    { 
        id: "1", 
        name: "Strays Legends Cup #1", 
        status: "Aberto", 
        maxTeams: 16, 
        registeredTeams: 4, 
        prize: "R$ 1.500", 
        startDate: "15/09/2025", 
        endDate: "05/10/2025", 
        fee: "R$ 10", 
        format: "Grupos + Playoffs", 
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80", 
        logo: "https://api.dicebear.com/7.x/identicon/svg?seed=StraysCup" 
    }
];