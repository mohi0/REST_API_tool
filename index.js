const { app, BrowserWindow, TouchBar, ipcMain, net } = require('electron')
const request = require('request')

const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar


const createWindow = () => {
    window = new BrowserWindow({
        width: 200, 
        height: 100, 
        x: 10, 
        y: 10, 
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: true //this value should be false for production application
        }
    })
    window.loadFile("html/index.html")
    window.webContents.openDevTools()
    window.setTouchBar(touchbar)
}

const sendReqTouchBar = new TouchBarButton({
    label: 'Send',
    backgroundColor: '#038103',
    click: () => {
        console.log("From Touchbar")
        window.webContents.send('touch-bar-send-req', '')
    }
})

const addReqHeaderTouchBar = new TouchBarButton({
    label: 'Add Request Header',
    backgroundColor: '#404040',
    click: () => {
        console.log("From Touchbar")
        window.webContents.send('touch-bar-req-add-header', '')
    }
})



const touchbar = new TouchBar({
    items: [
        sendReqTouchBar,
        new TouchBarSpacer({ size: 'small' }),
        addReqHeaderTouchBar
    ]
})

app.whenReady().then(() => {
    createWindow()
})



