// js/pages/home.js

export function renderHomePage() {
    return `
        <div class="animate-fadeIn">
            <div class="relative w-full min-h-[500px] md:min-h-[600px] flex items-center justify-center overflow-hidden mb-12 rounded-b-3xl md:rounded-3xl">
                <div class="absolute inset-0 bg-cover bg-center z-0" style="background-image: url('https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2070&auto=format&fit=crop'); filter: brightness(0.4);"></div>
                <div class="absolute inset-0 bg-gradient-to-b from-[#0f1116]/30 via-transparent to-[#0f1116] z-0"></div>
                <div class="relative z-10 text-center px-4 max-w-4xl mx-auto mt-10">
                    <h1 class="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-lg">LIGA DE <br>CAMPEONATOS <br><span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">AMADORES</span></h1>
                    <p class="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light">Experiência única e imersiva, feita para você sentir a adrenalina e emoção de um campeonato profissional!</p>
                    <button onclick="window.location.href='cadastro.html'" class="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(139,92,246,0.5)] flex items-center gap-3 mx-auto uppercase tracking-wider text-sm">
                        <i data-lucide="user-plus" class="w-5 h-5"></i> Faça sua conta agora
                    </button>
                </div>
            </div>

            <div class="max-w-7xl mx-auto px-6 py-20">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div class="relative group">
                        <div class="absolute -inset-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl opacity-20 blur-xl group-hover:opacity-40 transition-opacity"></div>
                        <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80" class="relative rounded-2xl shadow-2xl border border-white/10 w-full transform -rotate-2 group-hover:rotate-0 transition-all duration-500">
                    </div>
                    <div>
                        <h2 class="text-3xl font-bold text-white mb-6">O QUE É A STRAYS LEGENDS</h2>
                        <p class="text-gray-400 leading-relaxed mb-6">A STRAYS LEGENDS chegou para agitar o cenário amador de esports, unindo jogadores de <strong class="text-white">CS2</strong> e <strong class="text-white">Valorant</strong>.</p>
                        <p class="text-gray-400 leading-relaxed">Competição, emoção e a oportunidade perfeita para equipes amadoras brilharem em um ambiente profissional e organizado.</p>
                        
                        <div class="grid grid-cols-2 gap-4 mt-8">
                            <div class="bg-[#15171e] p-4 rounded-xl border border-gray-800">
                                <i data-lucide="trophy" class="text-yellow-500 mb-2"></i>
                                <h4 class="text-white font-bold">Premiações</h4>
                                <p class="text-xs text-gray-500">Em dinheiro e pontos</p>
                            </div>
                            <div class="bg-[#15171e] p-4 rounded-xl border border-gray-800">
                                <i data-lucide="video" class="text-purple-500 mb-2"></i>
                                <h4 class="text-white font-bold">Transmissões</h4>
                                <p class="text-xs text-gray-500">Ao vivo na Twitch</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="max-w-7xl mx-auto px-6 py-20 mb-20">
                <div class="bg-[#15171e] rounded-3xl border border-white/5 p-8 md:p-12 relative overflow-hidden group">
                    <div class="absolute top-0 right-0 w-96 h-96 bg-[#5865F2]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                        <div>
                            <h2 class="text-3xl font-bold text-white mb-6 flex items-center gap-3"><i data-lucide="message-circle" class="text-[#5865F2]"></i> COMUNIDADE DISCORD</h2>
                            <p class="text-gray-400 leading-relaxed mb-8">Participe da nossa comunidade, encontre time, tire dúvidas e fique por dentro de todas as novidades dos campeonatos.</p>
                            <a href="#" class="inline-flex items-center gap-2 bg-white text-black font-bold py-3 px-8 rounded-lg hover:bg-gray-200 transition-colors shadow-lg">
                                ACESSAR SERVIDOR
                            </a>
                        </div>
                        <div class="relative">
                            <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop" class="rounded-xl shadow-2xl border border-gray-700/50 transform group-hover:scale-105 transition-transform duration-500">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}