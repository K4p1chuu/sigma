async function loadSidebarAndUserData(activePage) {
    const token = localStorage.getItem('mdt-token');
    if (!token) {
        window.location.href = 'index.html';
        return null;
    }

    try {
        const response = await fetch('/api/user-data', {
            headers: { 'Authorization': token }
        });

        if (!response.ok) {
            localStorage.removeItem('mdt-token');
            window.location.href = 'index.html';
            throw new Error('Błąd autoryzacji');
        }

        const { userData } = await response.json();
        
        const sidebarHTML = `
            <div class="flex items-center mb-8">
                <img src="wisc2.png" alt="WSP Logo" class="w-12 h-12 mr-3">
                <div><h1 class="text-xl font-bold text-white">WSP MDT</h1></div>
            </div>
            <nav class="flex-grow">
                <a href="dashboard.html" class="sidebar-link ${activePage === 'dashboard' ? 'active bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'} flex items-center px-4 py-3 rounded-lg"><i data-lucide="layout-dashboard" class="w-5 h-5 mr-3"></i> Panel Główny</a>
                <a href="database.html" class="sidebar-link ${activePage === 'database' ? 'active bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'} flex items-center mt-2 px-4 py-3 rounded-lg"><i data-lucide="database" class="w-5 h-5 mr-3"></i> Baza Danych</a>
                <a href="odznaki.html" class="sidebar-link ${activePage === 'odznaki' ? 'active bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'} flex items-center mt-2 px-4 py-3 rounded-lg"><i data-lucide="shield" class="w-5 h-5 mr-3"></i> Odznaki</a>
                <a href="bolo.html" class="sidebar-link ${activePage === 'bolo' ? 'active bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'} flex items-center mt-2 px-4 py-3 rounded-lg"><i data-lucide="search" class="w-5 h-5 mr-3"></i> Poszukiwania</a>
                <a href="ticket-form.html" class="sidebar-link ${activePage === 'ticket-form' ? 'active bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'} flex items-center mt-2 px-4 py-3 rounded-lg"><i data-lucide="file-plus-2" class="w-5 h-5 mr-3"></i> Wystaw Mandat</a>
                <a href="arrest-form.html" class="sidebar-link ${activePage === 'arrest-form' ? 'active bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'} flex items-center mt-2 px-4 py-3 rounded-lg"><i data-lucide="grid-3x3" class="w-5 h-5 mr-3"></i> Wystaw Areszt</a>
                <a href="dywizje.html" class="sidebar-link ${activePage === 'dywizje' ? 'active bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'} flex items-center mt-2 px-4 py-3 rounded-lg"><i data-lucide="users" class="w-5 h-5 mr-3"></i> Dywizje</a>
                <a href="formulas.html" class="sidebar-link ${activePage === 'formulas' ? 'active bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'} flex items-center mt-2 px-4 py-3 rounded-lg"><i data-lucide="book-marked" class="w-5 h-5 mr-3"></i> Formułki</a>
                <a href="reports.html" class="sidebar-link ${activePage === 'reports' ? 'active bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'} flex items-center mt-2 px-4 py-3 rounded-lg"><i data-lucide="file-text" class="w-5 h-5 mr-3"></i> Raporty</a>
                ${userData.isAdmin ? `<a href="admin-panel.html" class="sidebar-link ${activePage === 'admin-panel' ? 'active bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'} flex items-center mt-2 px-4 py-3 rounded-lg"><i data-lucide="user-cog" class="w-5 h-5 mr-3"></i> Panel Admina</a>` : ''}
            </nav>
            <div class="mt-auto">
                <div class="border-t border-gray-700 pt-4">
                    <p id="user-display-name" class="text-sm font-semibold text-white">${userData.username}</p>
                    <p id="user-display-rank" class="text-xs text-gray-400">[${userData.badge}] - ${userData.rank}</p>
                </div>
                <a href="#" id="logout-button" class="sidebar-link flex items-center mt-2 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-800 hover:text-white">
                    <i data-lucide="log-out" class="w-5 h-5 mr-3"></i> Wyloguj się
                </a>
            </div>
        `;
        
        const sidebarContainer = document.getElementById('sidebar-container');
        if (sidebarContainer) {
            sidebarContainer.innerHTML = sidebarHTML;
            document.getElementById('logout-button').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('mdt-token');
                window.location.href = 'index.html';
            });
            lucide.createIcons();
        }
        return userData;
    } catch (error) {
        console.error("Błąd weryfikacji:", error);
        localStorage.removeItem('mdt-token');
        window.location.href = 'index.html';
        return null;
    }
}

