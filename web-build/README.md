# Screen Recorder Web Build

This is the web version of the Electron Screen Recorder app.

## Usage

1. Open `index.html` in a modern web browser
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
```bash
npm run serve-web
```

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
