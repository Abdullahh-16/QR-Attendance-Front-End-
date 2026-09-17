document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('reportsTableBody');
    if (!tableBody) return;

    try {
        const [sessions, groups] = await Promise.all([apiFetch('/sessions'), apiFetch('/groups')]);
        const gMap = {};
        groups.forEach(g => gMap[g.id] = g.name);

        tableBody.innerHTML = '';
        
        for (const s of sessions) {
            try {
                // Fetch summary for each session
                const summary = await apiFetch(`/sessions/${s.id}`);
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${s.date} ${s.start_time.substring(0,8)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${gMap[s.group_id] || s.group_id}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${summary.present} / ${summary.total_students}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <div class="w-full bg-gray-200 rounded-full h-2.5">
                        <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${summary.attendance_rate}%"></div>
                        </div>
                        <span class="text-xs text-gray-500 mt-1">${summary.attendance_rate}%</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${s.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">${s.status}</span>
                    </td>
                `;
                tableBody.appendChild(tr);
            } catch(e) { console.error(e) }
        }
    } catch(e) {
        console.error(e);
    }
});
