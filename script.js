document.addEventListener('DOMContentLoaded', async () => {
    // Show loading immediately
    const loadingOverlay = document.getElementById('liffLoading');
    const LIFF_ID = '2008820349-2nsOUfZi';
    let lineUserId = '';

    try {
        await liff.init({ liffId: LIFF_ID });

        // Check if user is logged in
        if (!liff.isLoggedIn()) {
            // If not logged in, force login immediately
            liff.login({ redirectUri: window.location.href });
            return; // Stop execution here, wait for redirect
        }

        // If logged in, get profile and show form
        const profile = await liff.getProfile();
        lineUserId = profile.userId;
        console.log('User ID:', lineUserId);

        // Optional: Pre-fill specific fields if you want
        // const nameParts = profile.displayName.split(' ');
        // if (document.getElementById('firstname')) document.getElementById('firstname').value = nameParts[0] || '';

        // Hide loading overlay
        loadingOverlay.classList.add('hidden');

    } catch (err) {
        console.error('LIFF Init Error:', err);
        // On error, maybe still show form but warn? Or keep loading?
        // For now, let's hide loading so they can at least try (or see an error message if you added one)
        alert('ไม่สามารถเชื่อมต่อ LINE ได้ กรุณาลองใหม่อีกครั้ง');
        loadingOverlay.classList.add('hidden');
    }

    const form = document.getElementById('registerForm');

    // Auto-format helper for ID Card and Phone
    const idInput = document.getElementById('idcard');
    const phoneInput = document.getElementById('phone');

    // Prevent non-numeric input for ID/Phone
    const enforceNumeric = (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    };

    if (idInput) idInput.addEventListener('input', enforceNumeric);
    if (phoneInput) phoneInput.addEventListener('input', enforceNumeric);

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

        const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxN1lzCEm1-u294yQchH-nzufRdi2duRvUPa3E1MET-L3CDa-k7uPBfeYpgIQsyaEI/exec';

        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow',
            body: JSON.stringify(data)
        })
            .then(() => {
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
