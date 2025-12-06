// js/main.js
import { setupNavigation, navigateToPage } from './router.js';
import { renderTopBar } from './topbar.js';
import * as TeamsModule from './pages/teams.js';
import * as TourneyModule from './pages/tournaments.js';
import { state } from './state.js';

// --- CONFIGURAÇÃO INICIAL ---
document.addEventListener('DOMContentLoaded', () => {
    renderTopBar();
    window.addEventListener('auth-change', renderTopBar);
    setupNavigation();
    if(window.lucide) lucide.createIcons();
});

// --- FUNÇÃO GLOBAL DE TOAST ---
window.showToast = function(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'error' ? 'alert-circle' : 'check-circle';
    
    toast.innerHTML = `
        <div class="toast-icon"><i data-lucide="${icon}" style="width:14px; height:14px;"></i></div>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    if(window.lucide) lucide.createIcons();

    setTimeout(() => {
        toast.style.animation = 'fadeOutToast 0.4s forwards';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

// --- EXPOR FUNÇÕES PARA O HTML (WINDOW) ---
window.navigateToPage = navigateToPage;

// Funções de Times
window.openCreateTeamModal = TeamsModule.openCreateTeamModal;
window.closeCreateTeamModal = TeamsModule.closeCreateTeamModal;
window.handleCreateTeamForm = TeamsModule.handleCreateTeamForm;
window.previewTeamLogo = TeamsModule.previewTeamLogo;
window.switchTeamTab = TeamsModule.switchTeamTab;
window.renderTeamSettings = TeamsModule.renderTeamSettings;
window.switchSettingsTab = TeamsModule.switchSettingsTab;
window.switchPlayerSubTab = TeamsModule.switchPlayerSubTab;
window.openAddPlayerModal = TeamsModule.openAddPlayerModal;
window.confirmAddPlayer = TeamsModule.confirmAddPlayer;
window.openEditPlayerModal = TeamsModule.openEditPlayerModal;
window.closeEditPlayerModal = TeamsModule.closeEditPlayerModal;
window.savePlayerEdit = TeamsModule.savePlayerEdit;
window.previewEditLogo = TeamsModule.previewEditLogo;
window.previewEditBanner = TeamsModule.previewEditBanner;
window.saveTeamSettings = TeamsModule.saveTeamSettings;
window.removePlayer = TeamsModule.removePlayer;
window.openDeleteTeamModal = TeamsModule.openDeleteTeamModal;
window.closeDeleteTeamModal = TeamsModule.closeDeleteTeamModal;
window.confirmDeleteTeam = TeamsModule.confirmDeleteTeam; 

// Funções de Campeonato e Admin
window.switchTab = TourneyModule.switchTab;
window.openCreateTournamentModal = TourneyModule.openCreateTournamentModal;
window.closeCreateTournamentModal = TourneyModule.closeCreateTournamentModal;
window.handleCreateTournamentForm = TourneyModule.handleCreateTournamentForm;
window.previewTourBanner = TourneyModule.previewTourBanner;
window.setMatchWinner = TourneyModule.setMatchWinner;
window.switchOverviewInfo = TourneyModule.switchOverviewInfo;
window.changeUserRole = TourneyModule.changeUserRole;
window.openAdminPanel = TourneyModule.openAdminPanel;

// --- FUNÇÕES DE EDIÇÃO DE TORNEIO (ATUALIZADAS) ---
window.openEditTournamentModal = TourneyModule.openEditTournamentModal;
window.closeEditTournamentModal = TourneyModule.closeEditTournamentModal;
window.saveTournamentChanges = TourneyModule.saveTournamentChanges;

// *** AQUI ESTAVA FALTANDO AS FUNÇÕES NOVAS DE DELETAR ***
window.openDeleteConfirmation = TourneyModule.openDeleteConfirmation; 
window.executeDelete = TourneyModule.executeDelete;

window.subscribeTeam = TourneyModule.subscribeTeam;
window.approveTeam = TourneyModule.approveTeam;
window.rejectTeam = TourneyModule.rejectTeam;

window.appState = state;
