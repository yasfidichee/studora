import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// تهيئة Google Gemini API
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

app.post('/api/chat', async (req, res) => {
    try {
        const { messages, profile } = req.body;

        if (!apiKey) {
            return res.status(500).json({ error: 'مفتاح Gemini API غير متوفر في السيرفر.' });
        }

        // بناء System Instruction بناءً على ملف تعريف التلميذ
        const systemInstruction = `
أنت "مرشد"، مرشد ذكي ولطيف ومحفز موجه لتلاميذ الثانوية بالمغرب.
معلومات التلميذ:
- الاسم: ${profile?.full_name || 'تلميذ'}
- العمر: ${profile?.age || 'غير محدد'} سنوات
- المستوى الدراسي: ${profile?.level || 'الثانوي'}
- الهدف الدراسي: ${profile?.goal || 'النجاح والتفوق'}
- المواد التي يريد تحسينها: ${profile?.subjects ? profile.subjects.join(', ') : 'جميع المواد'}

طريقة الكلام:
- تحدث باللهجة المغربية الدارجة البيضاء أو العربية الفصحى المبسطة والقريبة للقلب (أسلوب تشجيعي وتربوي).
- ساعده في دروسه، توجيهه الدراسي، أو تحفيزه.
- كن مختصراً، واضحاً، ومفيداً.
`;

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            systemInstruction: systemInstruction,
        });

        // تحويل الرسائل لتوافق هيكل Gemini API
        const formattedHistory = messages.slice(0, -1).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const chat = model.startChat({
            history: formattedHistory,
        });

        const latestMessage = messages[messages.length - 1].content;
        const result = await chat.sendMessage(latestMessage);
        const responseText = result.response.text();

        res.json({ reply: responseText });

    } catch (error) {
        console.error('خطأ في الاتصال بـ Gemini API:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء معالجة رسالتك، عاود المحاولة عفاك.' });
    }
});

app.listen(port, () => {
    console.log(`🚀 السيرفر خدام مزيان على الرابط: http://localhost:${port}`);
});
