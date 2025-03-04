const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');

let mainWindow;

// Start an Express server to serve the React build files
function createExpressServer() {
    const expressApp = express();

    // Serve static files from the React build folder
    const buildPath = path.join(__dirname, 'build');
    expressApp.use(express.static(buildPath));

    // Fallback to `index.html` for any unmatched routes (React Router support)
    expressApp.get('*', (req, res) => {
        res.sendFile(path.join(buildPath, 'index.html'));
    });

    // Start the server on a specific port
    const port = 3000;
    expressApp.listen(port, () => {
        console.log(`Express server running at http://localhost:${port}`);
    });

    return `http://localhost:${port}`;
}

// Create the main Electron window
async function createMainWindow() {
    const reactAppUrl = createExpressServer(); // Start the server and get the URL

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // Load the React app from the Express server
    mainWindow.loadURL(reactAppUrl);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// App lifecycle events
app.whenReady().then(createMainWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});
