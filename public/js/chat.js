document.addEventListener('DOMContentLoaded', () => {
    const profileData = JSON.parse(localStorage.getItem('onboarding')) || {
        full_name: "تلميذ",
        level: "الثانوي",
        goal: "النجاح",
        subjects: []
    };

    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');

    let messages = [];

    // رسالة الترحيب الأولى من المرشد
    const initialGreeting = `أهلاً ${profileData.full_name} 👋، أنا مرشدك الذكي. شفت أنك فـ "${profileData.level || 'المرحلة الثانوية'}" وباغي "${profileData.goal || 'تحقيق أهدافك'}". كيفاش نقدر نعاونك اليوم فالدراسة ولا التوجيه؟`;

    messages.push({ role: 'model', content: initialGreeting });
    appendMessage('bot', initialGreeting);

    function appendMessage(role, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', role);
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('message', 'bot', 'typing-container');
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const typingDiv = document.getElementById('typingIndicator');
        if (typingDiv) {
            typingDiv.remove();
        }
    }

    async function handleSendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        // إضافة رسالة المستخدم الواجهة
        appendMessage('user', text);
        messages.push({ role: 'user', content: text });
        userInput.value = '';

        showTypingIndicator();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: messages,
                    profile: profileData
                })
            });

            const data = await response.json();
            removeTypingIndicator();

            if (data.reply) {
                appendMessage('bot', data.reply);
                messages.push({ role: 'model', content: data.reply });
            } else {
                appendMessage('bot', 'عذراً، حدث خطأ في الاتصال، عاود المحاولة عفاك.');
            }
        } catch (error) {
            removeTypingIndicator();
            console.error(error);
            appendMessage('bot', 'تعذر الاتصال بالسيرفر، تأكد من اتصالك بالإنترنت.');
        }
    }

    sendBtn.addEventListener('click', handleSendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });
});
