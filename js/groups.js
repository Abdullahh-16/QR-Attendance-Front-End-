document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('groupsTableBody');
    const form = document.getElementById('addGroupForm');

    if (tableBody) {
        loadGroups();
    }
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById('name').value,
                description: document.getElementById('description').value
            };
            try {
                await apiFetch('/groups', { method: 'POST', body: JSON.stringify(data) });
                window.location.href = 'groups.html';
            } catch(e) { alert('Failed: ' + e.message); }
        });
    }

    window.editGroup = async (id, oldName, oldDesc) => {
        const name = prompt("Enter new group name:", oldName);
        if (name === null || name.trim() === "") return;
        const description = prompt("Enter new description:", oldDesc) || "";
        try {
            await apiFetch(`/groups/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ name, description })
            });
            loadGroups();
        } catch(e) {
            alert("Failed to edit: " + e.message);
        }
    };

    window.deleteGroup = async (id) => {
        if (!confirm("Are you sure you want to delete this group?")) return;
        try {
            await apiFetch(`/groups/${id}`, { method: 'DELETE' });
            loadGroups();
        } catch(e) {
            alert("Failed to delete: " + e.message);
        }
    };

    async function loadGroups() {
        try {
            const groups = await apiFetch('/groups');
            tableBody.innerHTML = '';
            groups.forEach(g => {
                const tr = document.createElement('tr');
                const desc = g.description ? g.description.replace(/'/g, "\\'") : '';
                const name = g.name.replace(/'/g, "\\'");
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${g.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${g.description || ''}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-3">
                        <button onclick="editGroup(${g.id}, '${name}', '${desc}')" class="text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>
                        <button onclick="deleteGroup(${g.id})" class="text-red-600 hover:text-red-900 font-medium">Delete</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        } catch(e) {}
    }
});
