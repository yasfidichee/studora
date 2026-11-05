const steps = [
    {
        title: "شنو سميتك؟",
        type: "text",
        placeholder: "مثال: أمين",
        key: "full_name"
    },
    {
        title: "شحال عمرك؟",
        type: "number",
        placeholder: "مثال: 17",
        key: "age"
    },
    {
        title: "فين كاتقرى؟",
        type: "single",
        options: ["جذع مشترك", "أولى باك", "ثانية باك"],
        key: "level"
    },
    {
        title: "شنو باغي تولي أو شنو هدفك؟",
        type: "single",
        options: ["ننجح فالباك بمعدل ممتاز", "نختار التوجيه المناسب لمستقبلي", "نتعلم مهارات دراسية جديدة", "نحسن نقاطي فالمواد الصعبة"],
        key: "goal"
    },
    {
        title: "شنو المواد اللي بغيتي تحسن فيها؟",
        type: "multi",
        options: ["الرياضيات", "الفيزياء والكيمياء", "علوم الحياة والأرض", "الفلسفة", "اللغة الفرنسية", "اللغة الإنجليزية", "الاجتماعيات"],
        key: "subjects"
    }
];

let currentStep = 0;
const onboardingData = {
    full_name: "",
    age: "",
    level: "",
    goal: "",
    subjects: []
};

const stepContainer = document.getElementById('stepContainer');
const nextBtn = document.getElementById('nextBtn');
const backBtn = document.getElementById('backBtn');
const progressBar = document.getElementById('progressBar');

function renderStep() {
    const step = steps[currentStep];
    let content = `<h2>${step.title}</h2>`;

    if (step.type === 'text' || step.type === 'number') {
        content += `<input type="${step.type}" id="stepInput" class="step-input" placeholder="${step.placeholder}" value="${onboardingData[step.key] || ''}">`;
    } else if (step.type === 'single') {
        content += `<div class="options-list">`;
        step.options.forEach(opt => {
            const isSelected = onboardingData[step.key] === opt ? 'selected' : '';
            content += `<div class="option-card ${isSelected}" data-value="${opt}">${opt}</div>`;
        });
        content += `</div>`;
    } else if (step.type === 'multi') {
        content += `<div class="options-list">`;
        step.options.forEach(opt => {
            const isSelected = (onboardingData[step.key] || []).includes(opt) ? 'selected' : '';
            content += `<div class="option-card multi ${isSelected}" data-value="${opt}">${opt}</div>`;
        });
        content += `</div>`;
    }

    stepContainer.innerHTML = content;

    // تحديث شريط التقدم
    const progressPercent = ((currentStep + 1) / steps.length) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // زر الرجوع
    if (currentStep > 0) {
        backBtn.classList.remove('hidden');
    } else {
        backBtn.classList.add('hidden');
    }

    // زر التالي / الانتهاء
    if (currentStep === steps.length - 1) {
        nextBtn.textContent = "يلا نبداو 🚀";
    } else {
        nextBtn.textContent = "التالي";
    }

    validateStep();
    attachStepEvents();
}

function validateStep() {
    const step = steps[currentStep];
    let isValid = false;

    if (step.type === 'text' || step.type === 'number') {
        const val = onboardingData[step.key];
        isValid = val && val.toString().trim().length > 0;
    } else if (step.type === 'single') {
        isValid = Boolean(onboardingData[step.key]);
    } else if (step.type === 'multi') {
        const arr = onboardingData[step.key];
        isValid = arr && arr.length > 0;
    }

    nextBtn.disabled = !isValid;
}

function attachStepEvents() {
    const step = steps[currentStep];

    if (step.type === 'text' || step.type === 'number') {
        const input = document.getElementById('stepInput');
        input.focus();
        input.addEventListener('input', (e) => {
            onboardingData[step.key] = e.target.value;
            validateStep();
        });
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !nextBtn.disabled) {
                handleNext();
            }
        });
    } else if (step.type === 'single') {
        const cards = stepContainer.querySelectorAll('.option-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                cards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                onboardingData[step.key] = card.getAttribute('data-value');
                validateStep();
                // الانتقال التلقائي بعد الاختيار لتجربة مستخدم أسرع
                setTimeout(handleNext, 250);
            });
        });
    } else if (step.type === 'multi') {
        const cards = stepContainer.querySelectorAll('.option-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const val = card.getAttribute('data-value');
                if (!onboardingData[step.key]) {
                    onboardingData[step.key] = [];
                }
                const index = onboardingData[step.key].indexOf(val);
                if (index > -1) {
                    onboardingData[step.key].splice(index, 1);
                    card.classList.remove('selected');
                } else {
                    onboardingData[step.key].push(val);
                    card.classList.add('selected');
                }
                validateStep();
            });
        });
    }
}

function handleNext() {
    if (currentStep < steps.length - 1) {
        currentStep++;
        renderStep();
    } else {
        // حفظ البيانات في localStorage والانتقال للـ Dashboard
        localStorage.setItem('onboarding', JSON.stringify(onboardingData));
        window.location.href = 'dashboard.html';
    }
}

nextBtn.addEventListener('click', handleNext);
backBtn.addEventListener('click', () => {
    if (currentStep > 0) {
        currentStep--;
        renderStep();
    }
});

// تخطي السؤال الحالي
document.getElementById('skipBtn').addEventListener('click', () => {
    handleNext();
});

// بدء التشغيل
document.addEventListener('DOMContentLoaded', () => {
    // إذا لم تكن شاشة الـ splash تعمل، ابدأ الـ onboarding مباشرة
    renderStep();
});
