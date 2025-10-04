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
        const inputSources = await window.electronAPI.getSources();
        
        // Create a source selection UI
        showSourceSelection(inputSources);
    } catch (error) {
        console.error('Error getting video sources:', error);
        alert('Error getting video sources. Please check console.');
    }
}

function showSourceSelection(sources) {
    // Remove existing source list if any
    const existingList = document.getElementById('sourceList');
    if (existingList) {
        existingList.remove();
    }
    
    // Create source selection container
    const sourceList = document.createElement('div');
    sourceList.id = 'sourceList';
    sourceList.style.cssText = `
        margin: 10px 0;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        background-color: #f9f9f9;
        max-height: 200px;
        overflow-y: auto;
    `;
    
    const title = document.createElement('h3');
    title.textContent = 'Select a Video Source:';
    title.style.margin = '0 0 10px 0';
    sourceList.appendChild(title);
    
    // Create buttons for each source
    sources.forEach((source, index) => {
        const button = document.createElement('button');
        button.textContent = `${source.name}`;
        button.style.cssText = `
            display: block;
            width: 100%;
            margin: 5px 0;
            padding: 8px 12px;
            background-color: #007cba;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            text-align: left;
        `;
        
        button.onmouseover = () => button.style.backgroundColor = '#005a87';
        button.onmouseout = () => button.style.backgroundColor = '#007cba';
        
        button.onclick = () => {
            selectSource(source);
            sourceList.remove(); // Remove the selection UI after selection
        };
        
        sourceList.appendChild(button);
    });
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Cancel';
    closeButton.style.cssText = `
        display: block;
        width: 100%;
        margin: 10px 0 0 0;
        padding: 8px 12px;
        background-color: #666;
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
    `;
    closeButton.onclick = () => sourceList.remove();
    sourceList.appendChild(closeButton);
    
    // Insert after the video select button
    videoSelectBtn.parentNode.insertBefore(sourceList, videoSelectBtn.nextSibling);
}

async function selectSource(source) {
    try {
        videoSelectBtn.innerText = source.name;

        const constraints = {
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: source.id
                }
            }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = stream;
        videoElement.play();
        
        // Enable start button now that we have a video source
        startBtn.disabled = false;
    } catch (error) {
        console.error('Error selecting source:', error);
        alert('Error selecting video source. Please try again.');
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