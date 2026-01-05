document.addEventListener('DOMContentLoaded', async () => {

    // --- LIFF INITIALIZATION ---
    const LIFF_ID = '2008820349-2nsOUfZi'; // TODO: User must replace this
    let lineUserId = '';

    try {
        await liff.init({ liffId: LIFF_ID });
        if (liff.isLoggedIn()) {
            const profile = await liff.getProfile();
            lineUserId = profile.userId;
            console.log('User ID:', lineUserId);
        } else {
            liff.login();
        }
    } catch (err) {
        console.error('LIFF Init Error:', err);
    }
    // ---------------------------

    const form = document.getElementById('registerForm');

    // Auto-format helper for ID Card and Phone (optional enhancement)
    const idInput = document.getElementById('idcard');
    const phoneInput = document.getElementById('phone');

    // Prevent non-numeric input for ID/Phone
    const enforceNumeric = (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    };

    idInput.addEventListener('input', enforceNumeric);
    phoneInput.addEventListener('input', enforceNumeric);

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = form.querySelector('.submit-btn');
        const originalText = btn.innerText;

        // Visual feedback - Loading
        btn.innerText = 'กำลังบันทึก...';
        btn.disabled = true;
        btn.style.opacity = '0.7';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Add LINE User ID to payload
        data.lineUserId = lineUserId;

        // REPLACEME: User needs to replace this URL after deploying their script
        const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxBhIvL8qcHT0MawMxwCIgHdy9309JWkpdKsewZk2McldiCg-zXZ31pOgMYmbFj74c/exec';

        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Important for Google Apps Script simple triggers
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow',
            body: JSON.stringify(data)
        })
            .then(() => {
                // Because mode is 'no-cors', we can't read the response status directly.
                // We assume success if the request completes without network error.
                btn.innerText = 'ลงทะเบียนสำเร็จ!';
                btn.style.backgroundColor = '#10B981'; // Success Green

                setTimeout(() => {
                    alert(`ลงทะเบียนสำเร็จ!\nชื่อ: ${data.firstname} ${data.lastname}`);
                    form.reset();
                    btn.innerText = originalText;
                    btn.disabled = false;
                    btn.style.backgroundColor = '';
                    btn.style.opacity = '1';
                }, 500);
            })
            .catch(error => {
                console.error('Error:', error);
                alert('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
                btn.innerText = originalText;
                btn.disabled = false;
                btn.style.opacity = '1';
            });
    });
});
