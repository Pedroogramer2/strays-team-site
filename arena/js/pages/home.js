// js/pages/home.js

export function renderHomePage() {
    return `
        <div class="animate-fadeIn">
            <div class="relative w-full min-h-[500px] md:min-h-[600px] flex items-center justify-center overflow-hidden mb-12 rounded-b-3xl md:rounded-3xl border-b border-yellow-500/20 shadow-[0_10px_40px_-10px_rgba(234,179,8,0.1)]">
                <div class="absolute inset-0 bg-cover bg-center z-0" style="background-image: url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80'); filter: brightness(0.3) grayscale(0.8);"></div>
                <div class="absolute inset-0 bg-gradient-to-b from-[#0f1116]/30 via-transparent to-[#0f1116] z-0"></div>
                
                <div class="relative z-10 text-center px-4 max-w-4xl mx-auto mt-10">
                    <div class="inline-block px-4 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
                        O Palco das Lendas
                    </div>
                    <h1 class="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-2xl">
                        STRAYS<br>
                        <span class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">LEGENDS</span>
                    </h1>
                    <p class="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                        A liga definitiva para o cenário competitivo amador. Organize seu time, participe de campeonatos profissionais e mostre seu valor.
                    </p>
                    <div class="flex flex-col md:flex-row gap-4 justify-center">
                        
                        <button onclick="if(localStorage.getItem('strays_user')) window.location.href='perfil.html'; else window.location.href='cadastro.html';" class="bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 px-10 rounded-xl transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(234,179,8,0.4)] flex items-center justify-center gap-3 uppercase tracking-wider text-sm">
                            <i data-lucide="zap" class="w-5 h-5"></i> Começar Agora
                        </button>

                        <button onclick="navigateToPage('campeonatos')" class="bg-[#1c1f26] hover:bg-[#252830] text-white border border-gray-700 hover:border-white font-bold py-4 px-10 rounded-xl transition-all flex items-center justify-center gap-3 uppercase tracking-wider text-sm">
                            <i data-lucide="trophy" class="w-5 h-5"></i> Ver Campeonatos
                        </button>
                    </div>
                </div>
            </div>

            <div class="max-w-7xl mx-auto px-6 py-20">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div class="relative group">
                        <div class="absolute -inset-4 bg-gradient-to-r from-yellow-600/20 to-yellow-900/20 rounded-2xl blur-xl group-hover:opacity-75 transition-opacity"></div>
                        <img src="https://images.unsplash.com/photo-1624138784180-481437f1035a?q=80" class="relative rounded-2xl shadow-2xl border border-white/10 w-full transform -rotate-1 group-hover:rotate-0 transition-all duration-500 grayscale group-hover:grayscale-0">
                    </div>
                    <div>
                        <h2 class="text-3xl font-black text-white mb-6 uppercase italic">Eleve seu nível de jogo</h2>
                        <p class="text-gray-400 leading-relaxed mb-6">A <strong class="text-yellow-500">STRAYS LEGENDS</strong> nasceu para preencher a lacuna entre o jogo casual e o profissional. Focamos em organização, pontualidade e experiência competitiva.</p>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                            <div class="bg-[#15171e] p-5 rounded-xl border border-gray-800 hover:border-yellow-500/30 transition-colors group">
                                <i data-lucide="shield-check" class="text-yellow-500 mb-3 w-8 h-8 group-hover:scale-110 transition-transform"></i>
                                <h4 class="text-white font-bold uppercase text-sm mb-1">Anti-Cheat Ativo</h4>
                                <p class="text-xs text-gray-500">Moss & Replay analysis</p>
                            </div>
                            <div class="bg-[#15171e] p-5 rounded-xl border border-gray-800 hover:border-yellow-500/30 transition-colors group">
                                <i data-lucide="video" class="text-yellow-500 mb-3 w-8 h-8 group-hover:scale-110 transition-transform"></i>
                                <h4 class="text-white font-bold uppercase text-sm mb-1">Transmissão</h4>
                                <p class="text-xs text-gray-500">Casters e comentaristas</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="max-w-7xl mx-auto px-6 py-10 mb-20">
                <div class="bg-gradient-to-r from-[#5865F2] to-[#4752c4] rounded-3xl p-8 md:p-16 relative overflow-hidden group shadow-2xl">
                    <div class="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                        <div class="max-w-xl">
                            <h2 class="text-3xl md:text-4xl font-black text-white mb-4 flex items-center gap-4">
                                <i data-lucide="message-circle" class="w-10 h-10"></i> 
                                COMUNIDADE STRAYS
                            </h2>
                            <p class="text-white/80 leading-relaxed text-lg mb-8">
                                Entre no nosso Discord para encontrar times, agendar treinos (scrims) e falar diretamente com a organização dos campeonatos.
                            </p>
                            <a href="#" target="_blank" class="inline-flex items-center gap-2 bg-white text-[#5865F2] font-black py-4 px-8 rounded-xl hover:bg-gray-100 transition-colors shadow-lg uppercase tracking-wide text-sm">
                                Entrar no Discord
                            </a>
                        </div>
                        <div class="grid grid-cols-2 gap-4 opacity-50 mix-blend-overlay">
                            <div class="bg-black/20 p-4 rounded-lg"><i data-lucide="users" class="w-8 h-8 text-white"></i></div>
                            <div class="bg-black/20 p-4 rounded-lg"><i data-lucide="mic" class="w-8 h-8 text-white"></i></div>
                            <div class="bg-black/20 p-4 rounded-lg"><i data-lucide="hash" class="w-8 h-8 text-white"></i></div>
                            <div class="bg-black/20 p-4 rounded-lg"><i data-lucide="bell" class="w-8 h-8 text-white"></i></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}