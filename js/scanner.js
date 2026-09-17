document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (!sessionId) {
        alert('No session ID provided.');
        window.location.href = 'sessions.html';
        return;
    }

    const sessionIdDisplay = document.getElementById('sessionIdDisplay');
    if (sessionIdDisplay) sessionIdDisplay.textContent = sessionId;

    const scanResults = document.getElementById('scan-results');
    let isProcessing = false;

    async function onScanSuccess(decodedText, decodedResult) {
        if (isProcessing) return;
        isProcessing = true;

        try {
            const response = await fetch(`${API_BASE_URL}/attendance/scan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({
                    qr_token: decodedText,
                    session_id: parseInt(sessionId)
                })
            });
            const data = await response.json();
            addScanResult(data, decodedText);
        } catch (error) {
            console.error('Scan error:', error);
            addScanResult({ type: 'error', message: 'Network or server error' }, decodedText);
        } finally {
            setTimeout(() => { isProcessing = false; }, 1500);
        }
    }

    function addScanResult(data, qrToken) {
        if (!scanResults) return;

        const div = document.createElement('div');
        div.className = 'p-4 rounded-lg shadow font-medium text-white mb-2';
        const timeStr = new Date().toLocaleTimeString();
        
        let name = "Unknown Student";
        if (data.student && data.student.name) name = data.student.name;

        if (data.success) {
            div.classList.add('bg-green-500');
            div.innerHTML = `<span class="block text-lg">✓ Present: ${name}</span><span class="text-sm opacity-80">${timeStr}</span>`;
        } else if (data.type === 'duplicate') {
            div.classList.add('bg-yellow-500');
            div.innerHTML = `<span class="block text-lg">⚠ Already Present: ${name}</span><span class="text-sm opacity-80">${timeStr}</span>`;
        } else {
            div.classList.add('bg-red-500');
            div.innerHTML = `<span class="block text-lg">✕ Invalid QR / Error: ${data.message}</span><span class="text-sm opacity-80">${timeStr}</span>`;
        }

        scanResults.prepend(div);
        if (scanResults.children.length > 10) scanResults.lastChild.remove();
    }

    if (typeof Html5QrcodeScanner !== 'undefined') {
        const html5QrcodeScanner = new Html5QrcodeScanner(
            "reader", { fps: 10, qrbox: {width: 250, height: 250} }, false);
        html5QrcodeScanner.render(onScanSuccess, () => {});
    }
});
