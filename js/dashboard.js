document.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('access_token')) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const students = await apiFetch('/students');
        document.getElementById('total-students').textContent = students.length || 0;
    } catch(e) {}
    
    try {
        const groups = await apiFetch('/groups');
        document.getElementById('total-groups').textContent = groups.length || 0;
    } catch(e) {}
});
