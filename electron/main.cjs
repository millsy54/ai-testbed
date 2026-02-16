const { app, BrowserWindow, ipcMain, nativeImage } = require('electron')
const fs = require('node:fs')
const path = require('node:path')
const { spawn } = require('node:child_process')

const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'
const isDev = !app.isPackaged

function resolveFilePath(fileName) {
  const safeName = path.basename(fileName)
  const baseDir = isDev
    ? path.join(process.cwd(), 'public', 'files')
    : path.join(process.resourcesPath, 'files')
  return path.join(baseDir, safeName)
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 760,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (isDev) {
    win.loadURL(DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }
}

function createGenericDragIcon() {
  const placeholderPath = resolveFilePath('drag-placeholder.png')
  const placeholder = nativeImage.createFromPath(placeholderPath)
  if (!placeholder.isEmpty()) {
    return placeholder.resize({ width: 64, height: 64, quality: 'best' })
  }

  const appIcon = nativeImage.createFromPath(process.execPath)
  if (!appIcon.isEmpty()) {
    return appIcon.resize({ width: 64, height: 64, quality: 'best' })
  }

  const lastResort = nativeImage.createFromPath(resolveFilePath('picture.png'))
  return lastResort.resize({ width: 64, height: 64, quality: 'best' })
}

app.whenReady().then(() => {
  createWindow()

  ipcMain.handle('native-drag:validate', (_event, payload) => {
    const fileName = payload && typeof payload.name === 'string' ? payload.name : ''
    if (!fileName) return false
    const filePath = resolveFilePath(fileName)
    return fs.existsSync(filePath)
  })

  ipcMain.on('native-drag:start', (event, payload) => {
    const fileName = payload && typeof payload.name === 'string' ? payload.name : ''
    if (!fileName) return

    const filePath = resolveFilePath(fileName)
    if (!fs.existsSync(filePath)) return

    const safeIcon = createGenericDragIcon()

    event.sender.startDrag({
      file: filePath,
      icon: safeIcon,
    })
  })

  ipcMain.handle('outlook:attach', async (_event, payload) => {
    const fileName = payload && typeof payload.name === 'string' ? payload.name : ''
    if (!fileName) {
      return { ok: false, message: 'Missing file name.' }
    }

    const filePath = resolveFilePath(fileName)
    if (!fs.existsSync(filePath)) {
      return { ok: false, message: 'File path not found.' }
    }

    const scriptPath = path.join(__dirname, 'scripts', 'attach-outlook.ps1')
    if (!fs.existsSync(scriptPath)) {
      return { ok: false, message: 'Outlook attach script not found.' }
    }

    const args = [
      '-NoProfile',
      '-NonInteractive',
      '-ExecutionPolicy',
      'Bypass',
      '-File',
      scriptPath,
      '-AttachmentPath',
      filePath,
    ]

    const result = await new Promise((resolve) => {
      const child = spawn('powershell.exe', args, { windowsHide: true })
      let stdout = ''
      let stderr = ''

      child.stdout.on('data', (data) => {
        stdout += String(data)
      })
      child.stderr.on('data', (data) => {
        stderr += String(data)
      })
      child.on('error', (err) => {
        resolve({ ok: false, message: err.message })
      })
      child.on('close', (code) => {
        if (code === 0) {
          resolve({ ok: true, message: 'Attachment added to active Outlook draft.' })
          return
        }

        const message = (stderr || stdout || `PowerShell exited with ${code}`).trim()
        resolve({ ok: false, message })
      })
    })

    return result
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
