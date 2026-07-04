const http = require('http');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const PORT = Number(process.env.PORT) || 3000;
const ADMIN_EMAIL = 'admin@squareinterio.com';

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER || 'smtp-user@example.com',
        pass: process.env.SMTP_PASS || 'smtp-password'
    }
});

const sendContactEmail = async ({ name, email, phone, projectType, message }) => {
    const isPlaceholderSmtp = !process.env.SMTP_HOST || process.env.SMTP_HOST === 'smtp.example.com';
    
    console.log('\n=============================================');
    console.log('📬 NEW PRIORITY INQUIRY RECEIVED (LOCAL TERMINAL LOG):');
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Phone: ${phone}`);
    console.log(`Project Type: ${projectType}`);
    console.log(`Message: ${message}`);
    console.log('=============================================\n');

    if (isPlaceholderSmtp) {
        console.log('⚠️ [Notice] Running in mock SMTP fallback mode. To send real emails, rename .env.example to .env and configure your SMTP credentials.');
        return;
    }

    const htmlBody = `
        <h2>Premium Contact Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Project Type:</strong> ${projectType}</p>
        <p><strong>Message:</strong></p>
        <p>${message ? message.replace(/\n/g, '<br>') : '<em>No additional details provided.</em>'}</p>
    `;

    await transporter.sendMail({
        from: `${ADMIN_EMAIL}`,
        to: ADMIN_EMAIL,
        subject: 'New Premium Inquiry from Square Interio Website',
        html: htmlBody,
        replyTo: email
    });
};

const parseRequestBody = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body || '{}'));
            } catch (err) {
                reject(err);
            }
        });
        req.on('error', reject);
    });
};

const server = http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/contact') {
        try {
            const data = await parseRequestBody(req);
            const { name, email, phone, projectType, message } = data;

            if (!name || !email || !phone) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Name, email and phone are required.' }));
                return;
            }

            await sendContactEmail({ name, email, phone, projectType: projectType || 'Not specified', message: message || '' });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Inquiry sent successfully.' }));
        } catch (err) {
            console.error('Contact form error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Unable to send inquiry right now.' }));
        }

        return;
    }

    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    const ext = path.extname(filePath).toLowerCase();

    if (!filePath.startsWith(__dirname)) {
        res.statusCode = 403;
        res.end('Access Denied');
        return;
    }

    if (!ext) {
        filePath = path.join(__dirname, 'index.html');
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.statusCode = 404;
                res.end('File Not Found');
            } else {
                res.statusCode = 500;
                res.end(`Server Error: ${err.code}`);
            }
            return;
        }

        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
        res.end(content, 'utf-8');
    });
});

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
