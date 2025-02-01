import { app, BrowserWindow } from 'electron'

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: `./favicon.ico`
    })

    win.loadFile('index.html')
}

app.whenReady().then(() => {
    createWindow()
})