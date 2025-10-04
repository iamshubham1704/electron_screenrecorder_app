
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
        a.download = `screen-recording-${Date.now()}.webm`;
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
    notice.style.cssText = `
        background-color: #e3f2fd;
        border: 1px solid #2196f3;
        border-radius: 4px;
        padding: 10px;
        margin: 10px 0;
        color: #1976d2;
        font-size: 14px;
    `;
    notice.innerHTML = `
        <strong>📱 Web Version:</strong> This is the web version with limited functionality. 
        <a href="#download" style="color: #1976d2;">Download the desktop app</a> for full features!
    `;
    document.body.insertBefore(notice, document.body.firstChild);
});
