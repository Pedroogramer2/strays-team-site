// js/state.js

export const state = {
    activeTab: 'Visão Geral',
    isAdminMode: true,
    groups: [],
    bracket: [],
    // Variáveis temporárias de upload
    tempTeamLogo: "",
    tempTourBanner: "",
    currentTeamId: null,

    // --- NOVO: Templates HTML Originais (Para restaurar o visual) ---
    overviewTemplates: {
        inscricao: `
            <p class="text-gray-300 mb-4">Para participar, siga os passos abaixo:</p>
            <div class="bg-yellow-500/10 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                <h4 class="text-yellow-500 font-bold text-sm uppercase mb-1">Valor da Inscrição</h4>
                <p class="text-white font-bold text-lg">{{VALOR}}</p>
            </div>`,
        
        transmissoes: `
            <div class="space-y-6">
                <p class="leading-relaxed text-gray-300">Todas as partidas principais serão transmitidas <strong class="text-white">AO VIVO</strong> em nossos canais oficiais.</p>
                <div class="flex flex-wrap gap-4">
                    {{BOTOES_LINKS}}
                </div>
            </div>`,

        playoffs: `
            <div class="space-y-4">
                <p class="text-gray-300">Acompanhe a agenda oficial:</p>
                <div class="bg-[#1c1f26] p-4 rounded-lg border border-gray-700 flex justify-between items-center">
                    <span class="text-white font-bold"><i data-lucide="calendar" class="inline w-4 h-4 mr-2 text-blue-500"></i>Cronograma</span>
                    <span class="text-blue-400 font-mono">{{AGENDA}}</span>
                </div>
            </div>`,

        regras: `<p class="text-gray-300 leading-relaxed whitespace-pre-line">{{REGRAS}}</p>`
    }
};