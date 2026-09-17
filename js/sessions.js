document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('sessionsTableBody');
    const form = document.getElementById('addSessionForm');

    if (tableBody) {
        loadSessions();
        if (form) loadGroupsForSelect();
    }
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                group_id: parseInt(document.getElementById('group_id').value)
            };
            try {
                const s = await apiFetch('/sessions', { method: 'POST', body: JSON.stringify(data) });
                window.location.href = `scanner.html?session_id=${s.id}`;
            } catch(e) { alert('Failed: ' + e.message); }
        });
    }

    window.closeSession = async (id) => {
        if (!confirm("Are you sure you want to close this session?")) return;
        try {
            await apiFetch('/sessions/' + id + '/close', { method: 'POST' });
            loadSessions();
        } catch (e) {
            alert('Failed to close session: ' + e.message);
        }
    };

    async function loadSessions() {
        try {
            const sessions = await apiFetch('/sessions');
            const groups = await apiFetch('/groups');
            const gMap = {};
            groups.forEach(g => gMap[g.id] = g.name);

            tableBody.innerHTML = '';
            sessions.forEach(s => {
                const tr = document.createElement('tr');
                const active = s.status === 'ACTIVE';
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${s.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${gMap[s.group_id] || s.group_id}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${s.date} ${s.start_time.substring(0,8)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${s.status}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        ${active ? `<a href="scanner.html?session_id=${s.id}" class="text-blue-600 hover:text-blue-900 font-medium">Open Scanner</a>` : ''}
                        ${active ? `<button onclick="closeSession(${s.id})" class="text-red-600 hover:text-red-900 font-medium">Close Session</button>` : ''}
                        ${!active ? `<a href="reports.html" class="text-gray-600 hover:text-gray-900 font-medium">View Report</a>` : ''}
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        } catch(e) {}
    }

    async function loadGroupsForSelect() {
        const select = document.getElementById('group_id');
        try {
            const groups = await apiFetch('/groups');
            groups.forEach(g => {
                const opt = document.createElement('option');
                opt.value = g.id;
                opt.textContent = g.name;
                select.appendChild(opt);
            });
        } catch(e) {}
    }
});
