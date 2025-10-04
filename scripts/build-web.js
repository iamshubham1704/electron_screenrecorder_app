const fs = require('fs-extra');
const path = require('path');

async function buildWeb() {
    console.log('🌐 Building web version...');
    
    // Create web build directory
    const webDir = path.join(__dirname, '..', 'web-build');
    await fs.ensureDir(webDir);
    
    // Copy HTML file and modify for web
    const srcHtml = path.join(__dirname, '..', 'src', 'index.html');
    const webHtml = path.join(webDir, 'index.html');
    
    let htmlContent = await fs.readFile(srcHtml, 'utf8');
    
    // Modify HTML for web compatibility
    htmlContent = htmlContent
        .replace('<script defer src="render.js"></script>', '<script defer src="web-render.js"></script>')
        .replace('<title>Hello World!</title>', '<title>Screen Recorder Web</title>');
    
    await fs.writeFile(webHtml, htmlContent);
    
    // Copy CSS
    await fs.copy(
        path.join(__dirname, '..', 'src', 'index.css'),
        path.join(webDir, 'index.css')
    );
    
    // Create web-compatible render.js
    const renderJs = path.join(__dirname, '..', 'src', 'render.js');
    const webRenderJs = path.join(webDir, 'web-render.js');
    
    let renderContent = await fs.readFile(renderJs, 'utf8');
    
    // Modify for web compatibility - remove Electron-specific APIs
    const webRenderContent = `
// Web version of screen recorder
// Note: This is a limited web version. Desktop version has full functionality.

// Get DOM elements
const videoElement = document.querySelector('video');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoSelectBtn = document.getElementById('videoSelectBtn');

// Global variables
let mediaRecorder;
let recordedChunks = [];

// Event listeners
videoSelectBtn.onclick = getVideoSources;
startBtn.onclick = startRecording;
stopBtn.onclick = stopRecording;

// Initially disable start and stop buttons
startBtn.disabled = true;
stopBtn.disabled = true;

async function getVideoSources() {
    try {
        // Web version: Use getDisplayMedia for screen capture
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: { mediaSource: 'screen' },
            audio: false
        });
        
        videoElement.srcObject = stream;
        videoElement.play();
        
        videoSelectBtn.innerText = 'Screen Selected';
        startBtn.disabled = false;
        
        // Handle stream end (user stops sharing)
        stream.getVideoTracks()[0].onended = () => {
            videoSelectBtn.innerText = 'Choose Video Source';
            startBtn.disabled = true;
            stopBtn.disabled = true;
        };
        
    } catch (error) {
        console.error('Error getting video sources:', error);
        alert('Error accessing screen. Please allow screen sharing permissions.');
    }
}

function startRecording() {
    try {
        if (!videoElement.srcObject) {
            alert('Please select a video source first.');
            return;
        }
        
        recordedChunks = [];
        mediaRecorder = new MediaRecorder(videoElement.srcObject, {
            mimeType: 'video/webm; codecs=vp9'
        });
        
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.onstop = handleStop;
        
        mediaRecorder.start();
        
        startBtn.disabled = true;
        stopBtn.disabled = false;
        
        console.log('Recording started');
    } catch (error) {
        console.error('Error starting recording:', error);
        alert('Error starting recording. Please try again.');
    }
}

function stopRecording() {
    try {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        }
        
        startBtn.disabled = false;
        stopBtn.disabled = true;
        
        console.log('Recording stopped');
    } catch (error) {
        console.error('Error stopping recording:', error);
    }
}

function handleDataAvailable(event) {
    if (event.data.size > 0) {
        recordedChunks.push(event.data);
    }
}

function handleStop() {
    try {
        const blob = new Blob(recordedChunks, {
            type: 'video/webm; codecs=vp9'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = \`screen-recording-\${Date.now()}.webm\`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        console.log('Recording saved');
    } catch (error) {
        console.error('Error saving recording:', error);
        alert('Error saving recording. Please try again.');
    }
}

// Add notice about web limitations
document.addEventListener('DOMContentLoaded', () => {
    const notice = document.createElement('div');
    notice.style.cssText = \`
        background-color: #e3f2fd;
        border: 1px solid #2196f3;
        border-radius: 4px;
        padding: 10px;
        margin: 10px 0;
        color: #1976d2;
        font-size: 14px;
    \`;
    notice.innerHTML = \`
        <strong>📱 Web Version:</strong> This is the web version with limited functionality. 
        <a href="#download" style="color: #1976d2;">Download the desktop app</a> for full features!
    \`;
    document.body.insertBefore(notice, document.body.firstChild);
});
`;
    
    await fs.writeFile(webRenderJs, webRenderContent);
    
    // Create README for web build
    const readmeContent = `# Screen Recorder Web Build

This is the web version of the Electron Screen Recorder app.

## Usage

1. Open \`index.html\` in a modern web browser
2. Click "Choose Video Source" to select your screen
3. Click "Start" to begin recording
4. Click "Stop" to end recording and download the file

## Limitations

- Web version uses browser's screen sharing API
- Limited to screen capture only (no window selection)
- Requires HTTPS for deployment (except localhost)
- Some browsers may have different codec support

## Deployment

### Local Testing
\`\`\`bash
npm run serve-web
\`\`\`

### Static Hosting
Upload the contents of this folder to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting
- Any web server

## Requirements

- Modern web browser with MediaRecorder API support
- HTTPS connection (for screen sharing permissions)
`;
    
    await fs.writeFile(path.join(webDir, 'README.md'), readmeContent);
    
    console.log('✅ Web build completed!');
    console.log(`📁 Files available in: ${webDir}`);
    console.log('🚀 Run "npm run serve-web" to test locally');
}

buildWeb().catch(console.error);