const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const multer = require('multer');

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware tambahan untuk CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Middleware parsing
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    next();
});

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'f34995975@gmail.com',
        pass: 'hcll mvld icgh xazg'
    },
    tls: {
        rejectUnauthorized: false
    }
});

app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Backend UMKM Keuangan Aktif',
        status: 'Running',
        timestamp: new Date().toISOString(),
        endpoints: [
            {
                path: '/',
                method: 'GET',
                description: 'Status server'
            },
            {
                path: '/api/send-email',
                method: 'POST',
                description: 'Kirim email dengan attachment PDF'
            }
        ]
    });
});

app.get('/api/send-email', (req, res) => {
    res.status(200).json({
        message: 'Endpoint email siap digunakan',
        method: 'Gunakan POST untuk mengirim email',
        requiredParams: ['to', 'subject', 'body', 'pdfBase64']
    });
});

app.post('/api/send-email', async (req, res) => {
    try {
        console.log('Request Email Diterima:', JSON.stringify(req.body, null, 2));

        const { to, subject, body, pdfBase64 } = req.body;

        if (!to) {
            console.error('Email penerima tidak ada');
            return res.status(400).json({ 
                error: 'Email penerima diperlukan',
                details: 'Parameter "to" tidak boleh kosong'
            });
        }

        if (!subject) {
            console.error('Subjek email tidak ada');
            return res.status(400).json({ 
                error: 'Subjek email diperlukan',
                details: 'Parameter "subject" tidak boleh kosong'
            });
        }

        const mailOptions = {
            from: 'f34995975@gmail.com',
            to: to,
            subject: subject,
            text: body || 'Laporan Keuangan UMKM',
            attachments: pdfBase64 ? [
                {
                    filename: 'Laporan_Keuangan.pdf',
                    content: pdfBase64.split('base64,')[1],
                    encoding: 'base64'
                }
            ] : []
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('Email berhasil dikirim:', info.messageId);

        res.status(200).json({ 
            message: 'Email berhasil dikirim', 
            messageId: info.messageId 
        });
    } catch (error) {
        console.error('Kesalahan pengiriman email:', error);
        res.status(500).json({ 
            error: 'Gagal mengirim email', 
            details: error.message,
            stack: error.stack
        });
    }
});



// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    =======================================
    🚀 Server UMKM Keuangan Aktif
    📍 Port: ${PORT}
    📅 Waktu Mulai: ${new Date().toLocaleString()}
    ✅ Akses: http://localhost:${PORT}
    =======================================
    `);
});