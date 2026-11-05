document.addEventListener('DOMContentLoaded', () => {
    // التحقق واش التلميذ دار onboarding من قبل
    const savedOnboarding = localStorage.getItem('onboarding');
    if (savedOnboarding) {
        // إذا كان مسجل من قبل، ندوزو مباشرة للـ dashboard
        window.location.href = 'dashboard.html';
        return;
    }

    const splashScreen = document.getElementById('splash-screen');
    const splashDot = document.getElementById('splashDot');
    const splashContent = document.getElementById('splashContent');

    // تشغيل Animation نقطة البداية بعد 300ms
    setTimeout(() => {
        splashDot.classList.add('expand');
    }, 300);

    // ظهور النص بعد تكبير النقطة
    setTimeout(() => {
        splashContent.classList.add('show');
    }, 1100);

    // إخفاء الـ splash screen والدخول للـ onboarding بعد 3.3 ثانية إجمالاً
    setTimeout(() => {
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.style.display = 'none';
            document.getElementById('onboarding-screen').classList.remove('hidden');
        }, 500);
    }, 3300);
});
