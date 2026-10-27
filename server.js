/**
 * RideSafe AI - Local Static Web Server
 * Zero external dependencies. Uses Node.js standard library (http, fs, path).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Listen on all interfaces to allow physical phone testing on local Wi-Fi

const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webapp': 'application/x-web-app-manifest+json',
    '.webmanifest': 'application/manifest+json'
};

function getLocalIpAddresses() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                addresses.push(iface.address);
            }
        }
    }
    return addresses;
}

const server = http.createServer((req, res) => {
    // Parse URL and strip query string
    const cleanUrl = req.url.split('?')[0];
    let relativePath = cleanUrl === '/' ? '/index.html' : cleanUrl;
    
    // Normalize path to prevent directory traversal
    const safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(__dirname, safePath);

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
            res.end(`<!DOCTYPE html>
<html>
<head><title>404 Not Found - RideSafe AI</title></head>
<body style="font-family:sans-serif; background:#0B111E; color:#E2E8F0; text-align:center; padding:50px;">
  <h1 style="color:#EF4444;">404 - File Not Found</h1>
  <p>The requested file <code>${cleanUrl}</code> was not found.</p>
  <p><a href="/" style="color:#00E676;">Return to RideSafe AI Dashboard</a></p>
</body>
</html>`);
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'X-Content-Type-Options': 'nosniff'
        });

        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

server.listen(PORT, HOST, () => {
    const localIps = getLocalIpAddresses();
    console.log('====================================================');
    console.log('   🏍️  RideSafe AI — Rider Safety Companion Server');
    console.log('====================================================');
    console.log(`Local Access (Laptop):    http://localhost:${PORT}`);
    if (localIps.length > 0) {
        console.log(`Mobile Access (Local Wi-Fi):`);
        localIps.forEach(ip => {
            console.log(`   http://${ip}:${PORT}`);
        });
        console.log('Note: To test GPS on a physical phone, connect phone');
        console.log('and laptop to the same Wi-Fi network and open the mobile URL above.');
    }
    console.log('Press Ctrl + C to stop the server.');
    console.log('====================================================');
});
