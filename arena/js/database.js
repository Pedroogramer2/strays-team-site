// js/database.js

export const ROLES_IMG = {
    "Duelista": "https://img.icons8.com/ios-filled/50/fa314a/sword.png",
    "Controlador": "https://img.icons8.com/ios-filled/50/ffffff/smoke-explosion.png",
    "Iniciador": "https://img.icons8.com/ios-filled/50/22c55e/flash-on.png",
    "Sentinela": "https://img.icons8.com/ios-filled/50/3b82f6/shield.png",
    "Flex": "https://img.icons8.com/ios-filled/50/a855f7/change.png"
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
        title: "Como participar",
        content: `
            <p class="leading-relaxed mb-4 text-gray-300">Os jogadores devem se registrar em nosso site e formar uma equipe para participar.</p>
            <p class="leading-relaxed mb-4 text-gray-300">O pagamento da inscrição será realizado via <strong class="text-white">PIX</strong>.</p>
            <div class="mt-6 p-4 bg-yellow-500/10 border-l-4 border-yellow-500 rounded-r-lg">
                <p class="text-yellow-500 text-sm font-bold">Valor: R$ 10,00 por player</p>
            </div>
        `
    },
    'transmissoes': {
        title: "Onde Assistir",
        content: `
            <p class="leading-relaxed mb-6 text-gray-300">Todas as partidas principais serão transmitidas <strong class="text-white">AO VIVO</strong> em nossos canais oficiais.</p>
            <div class="flex items-center gap-4">
                <a href="#" class="flex items-center gap-2 bg-[#9146FF] hover:bg-[#7c2cf5] text-white px-6 py-3 rounded-lg transition-colors font-bold shadow-lg shadow-purple-900/20"><i data-lucide="twitch" class="w-5 h-5"></i> Twitch TV</a>
                <a href="#" class="flex items-center gap-2 bg-[#FF0000] hover:bg-[#cc0000] text-white px-6 py-3 rounded-lg transition-colors font-bold shadow-lg shadow-red-900/20"><i data-lucide="youtube" class="w-5 h-5"></i> Youtube</a>
            </div>
        `
    },
    'playoffs': {
        title: "Agendamento dos Playoffs",
        content: `
            <p class="leading-relaxed mb-4 text-gray-300 text-sm">Os playoffs seguirão o formato padrão de <strong class="text-white">oitavas, quartas, semifinais e final</strong>. MD3.</p>
            <div class="space-y-3">
                <div><h4 class="text-white font-bold text-sm mb-1">Oitavas</h4><p class="text-gray-400 text-xs">22/09 - 28/09</p></div>
                <div><h4 class="text-white font-bold text-sm mb-1">Quartas</h4><p class="text-gray-400 text-xs">29/09 - 02/10</p></div>
                <div><h4 class="text-white font-bold text-sm mb-1">Semis</h4><p class="text-gray-400 text-xs">03/10 - 04/10</p></div>
                <div><h4 class="text-yellow-500 font-bold text-sm mb-1">Final</h4><p class="text-gray-400 text-xs">05/10</p></div>
            </div>
        `
    },
    'regras': {
        title: "Regulamento Simplificado",
        content: `
            <ul class="space-y-2 text-gray-300 text-sm list-disc pl-5">
                <li>Tolerância máxima de atraso: <strong>15 minutos</strong>.</li>
                <li>Uso de cheats ou scripts resultará em banimento imediato.</li>
                <li>Cada time tem direito a 2 pauses táticos por mapa.</li>
            </ul>
        `
    }
};

// MOCKS DE BACKUP (Caso Firebase falhe ou esteja vazio)
export const PLAYERS_DB = [
    { id: 1, nick: "aspas", name: "Erick Santos", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aspas", team: "Leviatán", country: "Brasil", signature: "O melhor duelista.", socials: { twitter: "aspaszin" }, stats: { matches: 150, tournaments: 12, mvp: 45 }, gameStats: { elo: "Radiant", matches: 450, wins: 300, lastUpdate: "Hoje" } },
    { id: 2, nick: "sacy", name: "Gustavo Rossi", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sacy", team: "Sentinels", country: "Brasil", signature: "O careca da mira jovem.", socials: { twitter: "sacy" }, stats: { matches: 140, tournaments: 10, mvp: 20 }, gameStats: { elo: "Radiant", matches: 400, wins: 250, lastUpdate: "Ontem" } }
];

export const TEAMS_LIST_DB = [
    { id: 101, name: "LOUD", tag: "LLL", logo: "https://api.dicebear.com/7.x/identicon/svg?seed=LOUD", members: 5, wins: 15, losses: 2, rating: "4.9", desc: "Faz o L.", matches: 17, ownerId: "mock", roster: [] },
    { id: 102, name: "Sentinels", tag: "SEN", logo: "https://api.dicebear.com/7.x/identicon/svg?seed=SEN", members: 5, wins: 12, losses: 5, rating: "4.7", desc: "Absolute cinema.", matches: 17, ownerId: "mock", roster: [] }
];

export const TOURNAMENTS = [
    { id: "1", name: "U4nted Cup Pro 2", status: "Em Andamento", maxTeams: 16, registeredTeams: 8, prize: "R$ 900", startDate: "15/09/2025", endDate: "05/10/2025", fee: "R$ 10", format: "Grupos + Playoffs", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80", logo: "https://images.unsplash.com/photo-1624138784180-481437f1035a?q=80" }
];