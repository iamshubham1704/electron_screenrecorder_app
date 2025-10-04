const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// IPC to communicate with the main process
contextBridge.exposeInMainWorld('electronAPI', {
    getSources: async () => {
        try {
            return await ipcRenderer.invoke('get-sources');
        } catch (error) {
            console.error('Error in getSources:', error);
            throw error;
        }
    }
});
