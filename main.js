const { app, BrowserWindow, shell, Menu, protocol, webFrame } = require('electron');
const autoUpdater = require('electron-updater').autoUpdater;
const { Console } = require('console');
const is = require('electron-util');
const toExecutableName = require('to-executable-name');
const url = require('url');
const path = require('path');
const crossSpawn = require('cross-spawn-with-kill');
const signalExit = require('signal-exit');
const isDev = require('electron-is-dev');
const fs = require('fs-extra');
//const PeerId = require('peer-id');

global.resourcesPath = process.resourcesPath;

autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'info';

app.setAsDefaultProtocolClient('qlc'); // Register handler for xrb: links

let mainWindow;

async function run() {
	const forceKill = (child, timeout = 5000) => {
		if (!child.killed) {
			child.kill();
		}

		if (child.stdin) {
			child.stdin.destroy();
		}

		if (child.stdout) {
			child.stdout.destroy();
		}

		if (child.stderr) {
			child.stderr.destroy();
		}

		const { pid } = child;
		child.unref();

		const interval = 500;
		function poll() {
			try {
				process.kill(pid, 0);
				setTimeout(() => {
					try {
						process.kill(pid, 'SIGKILL');
						console.log('Forcefully killed process PID:', pid);
					} catch (e) {
						setTimeout(poll, interval);
					}
				}, timeout);
			} catch (e) {
				// ignore
			}
		}

		return setTimeout(poll, interval);
	};

	function createWindow() {
		// Create the browser window.
		mainWindow = new BrowserWindow({
			titleBarStyle: 'hidden',
			width: 1300,
			height: 900,
			webPreferences: { webSecurity: true, nodeIntegration: true },
			icon: path.join(__dirname, 'dist/assets/favicon/favicon.ico')
		});
		// const options = { extraHeaders: "pragma: no-cache\n" };

		mainWindow.loadURL(
			url.format({
				pathname: path.join(__dirname, 'dist/index.html'),
				protocol: 'file:',
				slashes: true
			})
		);

		// Open dev tools
		if (isDev) mainWindow.webContents.openDevTools();

		// Emitted when the window is closed.
		mainWindow.on('closed', function() {
			// Dereference the window object, usually you would store windows
			// in an array if your app supports multi windows, this is the time
			// when you should delete the corresponding element.
			mainWindow = null;
		});

		mainWindow.webContents.on('new-window', function(e, url) {
			e.preventDefault();
			shell.openExternal(url);
		});

		const menuTemplate = getApplicationMenu();

		// Create our menu entries so that we can use MAC shortcuts
		Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
	}
	platform = process.platform;
	// start gqlc
	if (isDev) {
		console.log('Running in development');
		if (platform == 'win32') {
			global.resourcesPath = path.resolve(global.resourcesPath, '../../../../extra/', process.platform, process.arch);
		} else {
			appPath = app.getAppPath();
			global.resourcesPath = path.resolve(appPath, 'extra', process.platform, process.arch);
		}
	} else {
		console.log('Running in production');
	}
	console.log(`path: ${global.resourcesPath}`);
	console.log(`path: ` + toExecutableName('gqlc'));

	const cmd = path.join(global.resourcesPath, toExecutableName('gqlc'));
	const userData = app.getPath('userData');
	const configDir = path.join(userData, isDev ? 'gqlc_dev' : 'gqlc');
	if (!fs.existsSync(configDir)) {
		// create dir and parents
		fs.ensureDirSync(configDir);
	}
	console.log(`prepare gqlc data dir ${configDir}`);

	let config = path.join(configDir, 'qlc.json');
	const config_old = path.join(configDir, 'qlc_wallet.json');
	if (fs.existsSync(config_old)) {
		config = config_old;
	}

	console.log(`${configDir}, ${config}`);

	let child = {};
	startChild();
	
	function startChild() {
		console.log(`start qglc ${cmd}`);
		child = crossSpawn(cmd, ['--config', config, '--configParams=rpc.rpcEnabled=true'], {
			windowsHide: true,
			stdio: ['ignore', 'pipe', 'pipe']
		});

		if (!child) {
			const err = new Error('gqlc not started');
			err.code = 'ENOENT';
			err.path = cmd;
			throw err;
		}
		child.stdout.on('data', data => console.log('[node]', String(data).trim()));
		child.stderr.on('data', data => console.log('[node]', String(data).trim()));

		child.once('exit', () => {
			removeExitHandler();
			global.isNodeStarted = false;
			console.log(`Node exiting (PID ${child.pid})`);
			forceKill(child);
		});
	
		child.once('exit', () => app.removeListener('will-quit', killHandler));
	
		child.once('loaded', () => {});
	}
	
	//console.log(child);

	const killHandler = () => child.kill();
	const removeExitHandler = signalExit(killHandler);
	
	app.on('ready', () => {
		// Once the app is ready, launch the wallet window
		createWindow();

		app.once('will-quit', killHandler);

		// Detect when the application has been loaded using an xrb: link, send it to the wallet to load
		app.on('open-url', (event, path) => {
			if (!mainWindow) {
				createWindow();
			}
			if (!mainWindow.webContents.isLoading()) {
				mainWindow.webContents.executeJavaScript(
					`window.dispatchEvent(new CustomEvent('protocol-load', { detail: '${path}' }));`
				);
			}
			mainWindow.webContents.once('did-finish-load', () => {
				mainWindow.webContents.executeJavaScript(
					`window.dispatchEvent(new CustomEvent('protocol-load', { detail: '${path}' }));`
				);
			});
			event.preventDefault();
		});

		// Check for any updates on GitHub
		//checkForUpdates();
	});

	// Quit when all windows are closed.
	app.on('window-all-closed', function() {
		// On OS X it is common for applications and their menu bar
		// to stay active until the user quits explicitly with Cmd + Q

		if (process.platform !== 'darwin') {
			// close gqlc
			child.kill();
			killHandler();
			app.quit();
		}
	});

	app.on('activate', function() {
		// On OS X it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (mainWindow === null) {
			createWindow();
		}
	});

	function checkForUpdates() {
		autoUpdater
			.checkForUpdatesAndNotify()
			.then(() => {})
			.catch(console.log);
	}

	// Build up the menu bar options based on platform
	function getApplicationMenu() {
		const template = [
			{
				label: 'Edit',
				submenu: [
					{ role: 'undo' },
					{ role: 'redo' },
					{ type: 'separator' },
					{ role: 'cut' },
					{ role: 'copy' },
					{ role: 'paste' },
					{ role: 'pasteandmatchstyle' },
					{ role: 'delete' },
					{ role: 'selectall' }
				]
			},
			{
				label: 'View',
				submenu: [
					{ role: 'reload' },
					{ role: 'forcereload' },
					{ role: 'toggledevtools' },
					{ type: 'separator' },
					{ role: 'resetzoom' },
					{ role: 'zoomin' },
					{ role: 'zoomout' },
					{ type: 'separator' },
					{ role: 'togglefullscreen' }
				]
			},
			{
				role: 'window',
				submenu: [{ role: 'minimize' }, { role: 'close' }]
			},
			{
				role: 'help',
				submenu: [
					{
						label: 'View GitHub',
						click() {
							loadExternal('https://github.com/qlcchain/sms-billing');
						}
					},
					{
						label: 'Submit Issue',
						click() {
							loadExternal('https://github.com/qlcchain/sms-billing/issues/new');
						}
					},
					{ type: 'separator' },
					{
						type: 'normal',
						label: `sms-billing Version: ${autoUpdater.currentVersion}`
					},
					{
						label: 'View Latest Updates',
						click() {
							loadExternal('https://github.com/qlcchain/sms-billing/releases');
						}
					},
					{ type: 'separator' },
					{
						label: `Check for Updates...`,
						click(menuItem, browserWindow) {
							checkForUpdates();
						}
					}
				]
			}
		];

		if (process.platform === 'darwin') {
			template.unshift({
				label: 'sms-billing',
				submenu: [
					{ role: 'about' },
					{ type: 'separator' },
					{
						label: `Check for Updates...`,
						click(menuItem, browserWindow) {
							checkForUpdates();
						}
					},
					{ type: 'separator' },
					// {role: 'services', submenu: []},
					// {type: 'separator'},
					{ role: 'hide' },
					{ role: 'hideothers' },
					{ role: 'unhide' },
					{ type: 'separator' },
					{ role: 'quit' }
				]
			});

			// Edit menu
			template[1].submenu.push(
				{ type: 'separator' },
				{
					label: 'Speech',
					submenu: [{ role: 'startspeaking' }, { role: 'stopspeaking' }]
				}
			);

			// Window menu
			template[3].submenu = [
				{ role: 'close' },
				{ role: 'minimize' },
				{ role: 'zoom' },
				{ type: 'separator' },
				{ role: 'front' }
			];
		}

		return template;
	}

	function loadExternal(url) {
		shell.openExternal(url);
	}
}

run();
