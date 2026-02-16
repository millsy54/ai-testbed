const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('nativeBridge', {
  isElectron: true,
  async validateFile(payload) {
    return ipcRenderer.invoke('native-drag:validate', payload)
  },
  async attachToOutlook(payload) {
    return ipcRenderer.invoke('outlook:attach', payload)
  },
  startDrag(payload) {
    ipcRenderer.send('native-drag:start', payload)
  },
})
