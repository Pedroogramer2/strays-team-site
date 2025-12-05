// Sidebar Toggle Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'sidebar-toggle';
    toggleButton.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
    `;
    
    // Create overlay for mobile
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    
    // Add to body
    document.body.appendChild(toggleButton);
    document.body.appendChild(overlay);
    
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    // Toggle sidebar function
    function toggleSidebar() {
        sidebar.classList.toggle('hidden');
        mainContent.classList.toggle('expanded');
        toggleButton.classList.toggle('sidebar-hidden');
        
        // Update icon
        if (sidebar.classList.contains('hidden')) {
            toggleButton.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            `;
        } else {
            toggleButton.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            `;
        }
        
        // Mobile overlay
        if (window.innerWidth <= 768) {
            overlay.classList.toggle('active');
        }
    }
    
    // Event listeners
    toggleButton.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);
    
    // Close sidebar on mobile when clicking a menu item
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768 && !sidebar.classList.contains('hidden')) {
                toggleSidebar();
            }
        });
    });
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 768) {
                overlay.classList.remove('active');
                // Optionally keep sidebar visible on desktop
                // sidebar.classList.remove('hidden');
                // mainContent.classList.remove('expanded');
            }
        }, 250);
    });
});
