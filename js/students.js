document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('studentsTableBody');
    const addForm = document.getElementById('addStudentForm');
    const editForm = document.getElementById('editStudentForm');
    const urlParams = new URLSearchParams(window.location.search);
    const sId = urlParams.get('id');

    if (tableBody) {
        loadStudents();
    }
    
    if (addForm) {
        loadGroupsForSelect('group_id');
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const generatedCode = 'STU-' + Math.floor(100000 + Math.random() * 900000);
            const data = {
                name: document.getElementById('name').value,
                student_code: generatedCode,
                phone: document.getElementById('phone').value,
                group_id: parseInt(document.getElementById('group_id').value)
            };
            try {
                await apiFetch('/students', { method: 'POST', body: JSON.stringify(data) });
                window.location.href = 'students.html';
            } catch(e) { alert('Failed: ' + e.message); }
        });
    }

    if (editForm) {
        if (!sId) {
            alert('No student ID provided');
            window.location.href = 'students.html';
            return;
        }
        
        // Load groups then load student data
        loadGroupsForSelect('edit_group_id').then(async () => {
            try {
                const student = await apiFetch(`/students/${sId}`);
                document.getElementById('edit_name').value = student.name;
                document.getElementById('edit_phone').value = student.phone || '';
                document.getElementById('edit_group_id').value = student.group_id || '';
            } catch (e) {
                console.error(e);
                alert("Failed to load student data.");
            }
        });

        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById('edit_name').value,
                phone: document.getElementById('edit_phone').value,
                group_id: parseInt(document.getElementById('edit_group_id').value)
            };
            try {
                await apiFetch(`/students/${sId}`, { method: 'PUT', body: JSON.stringify(data) });
                window.location.href = `student-details.html?id=${sId}`;
            } catch(e) { alert('Failed to update: ' + e.message); }
        });
    }

    window.deleteStudent = async (id) => {
        if (!confirm("Are you sure you want to deactivate/delete this student?")) return;
        try {
            await apiFetch(`/students/${id}`, { method: 'DELETE' });
            loadStudents();
        } catch(e) {
            alert("Failed to delete: " + e.message);
        }
    };

    async function loadStudents() {
        try {
            const [students, groups] = await Promise.all([apiFetch('/students'), apiFetch('/groups')]);
            const groupMap = {};
            groups.forEach(g => groupMap[g.id] = g.name);

            tableBody.innerHTML = '';
            students.forEach(s => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${s.student_code}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${s.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${groupMap[s.group_id] || 'Unknown'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${s.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${s.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <a href="student-details.html?id=${s.id}" class="text-indigo-600 hover:text-indigo-900 font-medium">View</a>
                        <a href="edit-student.html?id=${s.id}" class="text-blue-600 hover:text-blue-900 font-medium">Edit</a>
                        ${s.is_active ? `<button onclick="deleteStudent(${s.id})" class="text-red-600 hover:text-red-900 font-medium">Delete</button>` : ''}
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        } catch(e) {}
    }

    async function loadGroupsForSelect(elementId) {
        const select = document.getElementById(elementId);
        if (!select) return;
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

    // Details Page logic
    if (sId && document.getElementById('sName') && !editForm) {
        loadStudentDetails(sId);
        const editLink = document.getElementById('editStudentLink');
        if (editLink) editLink.href = `edit-student.html?id=${sId}`;
    }
    
    async function loadStudentDetails(id) {
        try {
            const student = await apiFetch('/students/' + id);
            document.getElementById('sName').textContent = student.name;
            document.getElementById('sCode').textContent = student.student_code;
            document.getElementById('sStatus').textContent = student.is_active ? 'Active' : 'Inactive';
            
            try {
                const groups = await apiFetch('/groups');
                const g = groups.find(x => x.id === student.group_id);
                document.getElementById('sGroup').textContent = g ? g.name : 'Unknown';
            } catch(e) {}

            const response = await fetch(`${API_BASE_URL}/students/${id}/qr`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });
            if (response.ok) {
                const blob = await response.blob();
                document.getElementById('qrImage').src = URL.createObjectURL(blob);
                document.getElementById('qrImage').classList.remove('hidden');
                document.getElementById('qrPlaceholder').classList.add('hidden');
            }
        } catch(e) {
            console.error(e);
        }
    }
});
