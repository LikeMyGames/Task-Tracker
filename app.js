import { app, BrowserWindow } from 'electron'
import { execFile } from 'node:child_process'

// const child = execFile('./API/API.exe', (error, stdout, stderr) => {
//   if (error) {
//     throw error;
//   }
//   console.log(stdout);
// })

// child.on('exit', () => {
// 	child.kill()
// })

const API = execFile('./API/API.exe', (err, stdout, stderr) => {
	if (err) {
		throw err
	}

	console.log(stdout)
})

const createWindow = () => {
    const win = new BrowserWindow({
		width: 1280,
		height: 720,
		icon: `./favicon.ico`,
		titleBarStyle: 'hidden',
		titleBarOverlay: {
			color: '#00000000',
			symbolColor: '#92ff5c',
			height: 40
        }
    })

    win.loadFile('index.html')
}


app.whenReady().then(() => {
    createWindow()
})

app.setUserTasks([
	{
	  program: process.execPath,
	  arguments: '--new-window',
	  iconPath: process.execPath,
	  iconIndex: 0,
	  title: 'New Window',
	  description: 'Create a new window'
	}
])