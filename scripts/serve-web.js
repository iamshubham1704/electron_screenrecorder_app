const http = require('http');
const fs = require('fs');
const path = require('path');

const webDir = path.join(__dirname, '..', 'web-build');
const port = 3000;

// Simple static file server
const server = http.createServer((req, res) => {
    let filePath = path.join(webDir, req.url === '/' ? 'index.html' : req.url);
    
    // Security: prevent directory traversal
    if (!filePath.startsWith(webDir)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end('Not Found');
        return;
    }
    
    // Determine content type
    const ext = path.extname(filePath);
    const contentType = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    }[ext] || 'application/octet-stream';
    
    // Set CORS headers for local development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Read and serve file
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(500);
            res.end('Server Error');
            return;
        }
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

server.listen(port, () => {
    console.log(`🌐 Web server running at http://localhost:${port}`);
    console.log('📁 Serving files from: web-build/');
    console.log('🛑 Press Ctrl+C to stop');
    
    // Try to open browser (Windows)
    const { exec } = require('child_process');
    exec(`start http://localhost:${port}`, (err) => {
        if (err) {
            console.log('💡 Manually open: http://localhost:3000');
        }
    });
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`❌ Port ${port} is already in use`);
        console.log('💡 Try a different port or stop other servers');
    } else {
        console.error('Server error:', err);
    }
});