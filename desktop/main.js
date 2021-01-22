const { app, BrowserWindow, ipcMain, shell, Menu, protocol, webFrame } = require('electron');
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
const chmod = require('chmod-plus');
const findProcess = require('find-process');
const pidusage = require('pidusage');
//const PeerId = require('peer-id');

const inly = require('inly');

const DownloadManager = require("electron-download-manager");

DownloadManager.register({
    downloadFolder: app.getPath('userData')
});

const log = require('electron-log');
log.transports.file.level = 'info';

global.resourcesPath = process.resourcesPath;

autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'info';

app.setAsDefaultProtocolClient('qlc'); // Register handler for xrb: links

let mainWindow;

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

const userData = app.getPath('userData');

const defaultWalletData = {
	version: 'v1.4.2',
	nodeData: {
		version: '',
		filename: '',
		gitrev: '',
		platform: ''
	},
	minerData: {
		version: '',
		filename: '',
		gitrev: '',
		platform: ''
	},
	poolData: {
		version: '',
		filename: '',
		gitrev: '',
		platform: ''
	}
}

function getConfig() {
	const wallletConfigPath = path.join(userData, 'walletConfig.json');
	if (fs.existsSync(wallletConfigPath)) { // check if walletConfig.json exists
		console.log('walletConfig file found');
		const rawData = fs.readFileSync(wallletConfigPath);
		const cfg = JSON.parse(rawData);
		if (cfg.version == 'v1.0.1') {
			console.log('found version v1.0.1, updating');
			fs.writeFileSync(wallletConfigPath, JSON.stringify(defaultWalletData, null, 4));
			return defaultWalletData;
		}
		if (cfg.version == 'v1.0.2') {
			console.log('found version v1.0.2, updating');
			fs.writeFileSync(wallletConfigPath, JSON.stringify(defaultWalletData, null, 4));
			return defaultWalletData;
		}
		if (cfg.version == 'v1.3.0') {
			console.log('found version v1.3.0, updating');
			cfg.version = 'v1.4.2';
			fs.writeFileSync(wallletConfigPath, JSON.stringify(cfg, null, 4));
			return cfg;
		}
		if (cfg.version == 'v1.3.1') {
			console.log('found version v1.3.1, updating');
			cfg.version = 'v1.4.2';
			fs.writeFileSync(wallletConfigPath, JSON.stringify(cfg, null, 4));
			return cfg;
		}
		if (cfg.version == 'v1.3.2') {
			console.log('found version v1.3.2, updating');
			cfg.version = 'v1.4.2';
			fs.writeFileSync(wallletConfigPath, JSON.stringify(cfg, null, 4));
			return cfg;
		}
		if (cfg.version == 'v1.3.3') {
			console.log('found version v1.3.3, updating');
			cfg.version = 'v1.4.2';
			fs.writeFileSync(wallletConfigPath, JSON.stringify(cfg, null, 4));
			return cfg;
		}
		if (cfg.version == 'v1.4.0') {
			console.log('found version v1.3.3, updating');
			cfg.version = 'v1.4.2';
			fs.writeFileSync(wallletConfigPath, JSON.stringify(cfg, null, 4));
			return cfg;
		}
		return cfg;
	} else {
		console.log('creating new walletConfig file');
		fs.ensureFileSync(wallletConfigPath);
		fs.writeFileSync(wallletConfigPath, JSON.stringify(defaultWalletData, null, 4));
		return defaultWalletData;
	}
}

function saveWalletConfigData() {
	const wallletConfigPath = path.join(userData, 'walletConfig.json');
	fs.writeFileSync(wallletConfigPath, JSON.stringify(walletConfigData, null, 4));
}

let walletConfigData = getConfig();
console.log(walletConfigData);

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

ipcMain.on('node-start', (event, data) => {
	//log.log('node-start');
	startChild();
});

ipcMain.on('node-stop', (event, data) => {
	//log.log('node-stop');
	killHandler();
});

ipcMain.on('node-restart', async (event, data) => {
	//log.log('node-restart');
	await killHandler();
	startChild();
});

ipcMain.on('node-update', (event, data) => {
	//log.log('node-update');
	//log.log(data);
	downloadUpdate(data.version,data.gitrev,data.platform);
});

var deleteFolderRecursive = function(path) {
  console.log('deleteFolderRecursive',path);
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};


ipcMain.on('delete-ledger', (event, data) => {
  log.log('delete-ledger');
  const ledgerPath = path.join(configDir, 'ledger');
  console.log(ledgerPath);
	deleteFolderRecursive(ledgerPath);
	try {
		mainWindow.webContents.send('delete-ledger-finish',{});
	} catch (error) {
		console.log(error);
	}
});

ipcMain.on('node-data', (event, data) => {
	//log.log('node-update');
	// check if node file exsists
	//console.log(walletConfigData);
	const nodePath = path.join(userData, walletConfigData.nodeData.filename);
	if (fs.existsSync(nodePath)) { // check if node exists
		try {
			mainWindow.webContents.send('node-data',{
				'config': walletConfigData,
				'arch' : process.arch,
				'platform' : process.platform
			});
		} catch (error) {
			console.log(error);
		}
	} else {
		try {
			mainWindow.webContents.send('node-data',{
				'config': defaultWalletData,
				'arch' : process.arch,
				'platform' : process.platform
			});
		} catch (error) {
			console.log(error);
		}
	}
	
});

ipcMain.on('node-process', (event, data) => {
	const nodePath = path.join(userData, walletConfigData.nodeData.filename);
	if (fs.existsSync(nodePath)) { // check if node exists
		getProcessData();
	}
});

//miner

ipcMain.on('miner-start', (event, data) => {
	//log.log('miner-start');
	startMiner(data.qlc_address,data.algo);
});

ipcMain.on('miner-stop', (event, data) => {
	//log.log('miner-stop');
	killMinerHandler();
});

ipcMain.on('miner-restart', async (event, data) => {
	//log.log('miner-restart');
	await killMinerHandler();
	startMiner(data.qlc_address,data.algo);
});

ipcMain.on('miner-update', (event, data) => {
	//log.log('pool-update');
	//log.log(data);
	//downloadUpdate('v1.2.6.6','7be5c37','win32');
	downloadMiner(data.version,data.gitrev,data.platform);
});

ipcMain.on('pool-update', (event, data) => {
	//log.log('pool-update');
	//log.log(data);
	downloadPool(data.version,data.gitrev,data.platform);
});

ipcMain.on('pool-start', (event, data) => {
	//log.log('pool-start');
	startPool(data.qlc_address,data.algo);
});

ipcMain.on('pool-stop', (event, data) => {
	//log.log('pool-stop');
	killPoolHandler();
});

ipcMain.on('pool-restart', async (event, data) => {
	//log.log('pool-restart');
	await killPoolHandler();
	startPool(data.qlc_address,data.algo);
});

function getProcessData() {
	findProcess('name','gqlc')
		.then(function (list) {
			//log.log(list);
			if (typeof list[0] != 'undefined') {
				pidusage(list[0].pid, function (err, stats) {
					//log.log(stats);
					try {
						mainWindow.webContents.send('node-running',{
							'status' : 1
						});
						mainWindow.webContents.send('node-process-data',{
							stats
						});
					} catch (error) {
						console.log(error);
					}
				})
			} else {
				try {
					mainWindow.webContents.send('node-running',{
						'status' : 0
					});
				} catch (error) {
					console.log(error);
				}
			}
		}
		, function (err) {
			log.log(err.stack || err);
		})
		.catch(console.log);
		;
}

function onDownloadProgress(progress) {
	log.log(progress);
	try {
		mainWindow.webContents.send('download-progress',progress);
	} catch (error) {
		console.log(error);
	}
}

function onMinerDownloadProgress(progress) {
	log.log(progress);
	try {
		mainWindow.webContents.send('download-miner-progress',progress);
	} catch (error) {
		console.log(error);
	}
}

function onPoolDownloadProgress(progress) {
	log.log(progress);
	try {
		mainWindow.webContents.send('download-pool-progress',progress);
	} catch (error) {
		console.log(error);
	}
}

function downloadUpdate(version,gitrev,platform) {

	platformExt = '';

	if (platform == 'win32') {
		platformExt = '-Windows-x64.zip';
	} else if (platform == 'darwin') {
		platformExt = '-macOS-x64.tar.gz';
	} else if (platform == 'linux') {
		platformExt = '-Linux-x64.tar.gz';
	}
/*
	if (platform == 'win32') {
		platformExt = '-windows-6.0-amd64.exe';
	} else if (platform == 'darwin') {
		platformExt = '-darwin-10.10-amd64';
	} else if (platform == 'linux') {
		platformExt = '-linux-amd64';
	}
	filename = "gqlc-"+version+"-"+gitrev+platformExt;
	
*/
	filename = "gqlc-"+version+"-"+gitrev+platformExt;
	log.log('downloadUpdate filename:');
	log.log(filename);

	DownloadManager.download({
		url: "https://github.com/qlcchain/go-qlc/releases/download/"+version+"/"+filename,
		onProgress:  onDownloadProgress
	}, function (error, info) {
        if (error) {
            log.log(error);
            return;
        }
 
		log.log("DONE: " + info.url);
		const previousFileName = walletConfigData.nodeData.filename;
		try {
			mainWindow.webContents.send('download-finished', {
				version,
				filename,
				gitrev,
				platform
			});
		} catch (error) {
			console.log(error);
		}
		walletConfigData.nodeData = {
			version,
			filename,
			gitrev,
			platform
		}
		console.log(userData);
		const versionDir = path.join(userData, version);
		console.log(versionDir);
		if (!fs.existsSync(versionDir)) {
			// create dir and parents
			fs.ensureDirSync(versionDir);
		}
		const extract = inly(path.join(userData, filename), versionDir);
		extract.on('file', (name) => {
			console.log(name);
		});
		 
		extract.on('progress', (percent) => {
			console.log(percent + '%');
		});
		 
		extract.on('error', (error) => {
			console.error(error);
		});
		 
		extract.on('end', () => {
			console.log('done');
			if (platform != 'win32') {
				chmod.file(700,path.join(versionDir, 'gqlc'));
				chmod.file(700,path.join(versionDir, 'gqlct'));
			}
		});
		//chmod.file(700,path.join(userData, filename));

		if (previousFileName != '' && filename != previousFileName) { // remove previous node version
			const previousFileNamePath = path.join(userData, previousFileName);
			if (fs.existsSync(previousFileNamePath)) { 
				fs.unlink(previousFileNamePath);
			}
		}
		saveWalletConfigData();
    });
}

function downloadMiner(version,gitrev,platform) {

	platformExt = '';

	if (platform == 'win32') {
		platformExt = '-Windows-x64.zip';
	} else if (platform == 'darwin') {
		platformExt = '-macOS-x64.tar.gz';
	} else if (platform == 'linux') {
		platformExt = '-Linux-x64.tar.gz';
	}

	filename = "gqlc-miner-"+version+"-"+gitrev+platformExt;
	log.log('downloadUpdate filename:');
	log.log(filename);

	DownloadManager.download({
		url: "https://github.com/qlcchain/qlc-miner/releases/download/"+version+"/"+filename,
		onProgress:  onMinerDownloadProgress
	}, function (error, info) {
        if (error) {
            log.log(error);
            return;
        }
 
		log.log("DONE: " + info.url);
		const previousFileName = walletConfigData.minerData.filename;
		try {
			mainWindow.webContents.send('download-miner-finished', {
				version,
				filename,
				gitrev,
				platform
			});	
		} catch (error) {
			console.log(error);
		}
		walletConfigData.minerData = {
			version,
			filename,
			gitrev,
			platform
		}
		console.log(userData);
		const versionDir = path.join(userData, version);
		console.log(versionDir);
		if (!fs.existsSync(versionDir)) {
			// create dir and parents
			fs.ensureDirSync(versionDir);
		}
		const extract = inly(path.join(userData, filename), versionDir);
		extract.on('file', (name) => {
			console.log(name);
		});
		 
		extract.on('progress', (percent) => {
			console.log(percent + '%');
		});
		 
		extract.on('error', (error) => {
			console.error(error);
		});
		 
		extract.on('end', () => {
			console.log('done');
			if (platform != 'win32') {
				chmod.file(700,path.join(versionDir, 'gqlc-miner'));
			}
		});

		if (previousFileName != '' && filename != previousFileName) { // remove previous miner version
			const previousFileNamePath = path.join(userData, previousFileName);
			if (fs.existsSync(previousFileNamePath)) { 
				fs.unlink(previousFileNamePath);
			}
		}
		saveWalletConfigData();
    });
}

function downloadPool(version,gitrev,platform) {

	platformExt = '';

	if (platform == 'win32') {
		platformExt = '-Windows-x64.zip';
	} else if (platform == 'darwin') {
		platformExt = '-macOS-x64.tar.gz';
	} else if (platform == 'linux') {
		platformExt = '-Linux-x64.tar.gz';
	}

	filename = "gqlc-pool-"+version+"-"+gitrev+platformExt;
	log.log('downloadUpdate filename:');
	log.log(filename);

	DownloadManager.download({
		url: "https://github.com/qlcchain/qlc-pool/releases/download/"+version+"/"+filename,
		onProgress:  onPoolDownloadProgress
	}, function (error, info) {
        if (error) {
            log.log(error);
            return;
        }
 
		log.log("DONE: " + info.url);
		const previousFileName = walletConfigData.poolData.filename;
		try {
			mainWindow.webContents.send('download-pool-finished', {
				version,
				filename,
				gitrev,
				platform
			});
		} catch (error) {
			console.log(error);
		}
		walletConfigData.poolData = {
			version,
			filename,
			gitrev,
			platform
		}
		console.log(userData);
		const versionDir = path.join(userData, version);
		console.log(versionDir);
		if (!fs.existsSync(versionDir)) {
			// create dir and parents
			fs.ensureDirSync(versionDir);
		}
		const extract = inly(path.join(userData, filename), versionDir);
		extract.on('file', (name) => {
			console.log(name);
		});
		 
		extract.on('progress', (percent) => {
			console.log(percent + '%');
		});
		 
		extract.on('error', (error) => {
			console.error(error);
		});
		 
		extract.on('end', () => {
			console.log('done');
			if (platform != 'win32') {
				chmod.file(700,path.join(versionDir, 'gqlc-pool'));
			}
		});

		if (previousFileName != '' && filename != previousFileName) { // remove previous node version
			const previousFileNamePath = path.join(userData, previousFileName);
			if (fs.existsSync(previousFileNamePath)) { 
				fs.unlink(previousFileNamePath);
			}
		}
		saveWalletConfigData();
    });
}


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
			icon: path.join(__dirname, '../build/icon.png')
		});
		// const options = { extraHeaders: "pragma: no-cache\n" };

		mainWindow.loadURL(
			url.format({
				pathname: path.join(__dirname, '../dist/index.html'),
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
	

	let child = {};
	let miner = {};
	let pool = {};
	//startChild();
	
	function startChild() {
		log.log('start child');
		log.log(userData);
		log.log(walletConfigData.nodeData.filename);

		const platform = walletConfigData.nodeData.platform;
		let platformExt = '';
		if (platform == 'win32') {
			platformExt = '.exe';
		} 
		console.log(userData);
		const versionDir = path.join(userData, walletConfigData.nodeData.version);
		console.log(versionDir);
		if (!fs.existsSync(versionDir)) {
			// create dir and parents
			fs.ensureDirSync(versionDir);
			console.log('node folder not found');
		}
		//const cmd = path.join(userData, walletConfigData.nodeData.filename);
		const cmd = path.join(versionDir, 'gqlc' + platformExt);
		if (!fs.existsSync(cmd)) {
			//fs.ensureDirSync(versionDir);
			// try to extract again if file not found
			console.log('node not found');
			
			const extract = inly(path.join(userData, walletConfigData.nodeData.filename), versionDir);
			extract.on('file', (name) => {
				console.log(name);
			});
			
			extract.on('progress', (percent) => {
				console.log(percent + '%');
			});
			
			extract.on('error', (error) => {
				console.error(error);
			});
			
			extract.on('end', () => {
				console.log('done');
				if (platform != 'win32') {
					chmod.file(700,path.join(versionDir, 'gqlc'));
					chmod.file(700,path.join(versionDir, 'gqlct'));
				}
				startChild();
			});
			return;
		}
		log.log(`start qglc ${cmd}`);
		child = crossSpawn(cmd, ['--config', config, '--configParams=rpc.rpcEnabled=true'], {
			windowsHide: true,
			stdio: ['ignore', 'pipe', 'pipe']
		});

		if (!child) {
			try {
				mainWindow.webContents.send('node-running',{
					'status' : 0
				});
			} catch (error) {
				console.log(error);
			}
			const err = new Error('gqlc not started');
			err.code = 'ENOENT';
			err.path = cmd;
			throw err;
		} else {
			try {
				mainWindow.webContents.send('node-running',{
					'status' : 1
				});
			} catch (error) {
				console.log(error);
			}
			child.stdout.on('data', data => log.log('[node]', String(data).trim()));
			child.stderr.on('data', data => log.log('[node]', String(data).trim()));
	
			child.once('exit', () => {
				removeExitHandler();
				global.isNodeStarted = false;
				log.log(`Node exiting (PID ${child.pid})`);
				forceKill(child);
			});
		
			child.once('exit', () => app.removeListener('will-quit', killHandler));
		
			child.once('loaded', () => {});
		}
	}

	function startMiner(qlc_address,algo) {
		log.log('start miner');
		log.log(userData);
		log.log(walletConfigData.minerData.filename);

		const platform = walletConfigData.minerData.platform;
		let platformExt = '';
		if (platform == 'win32') {
			platformExt = '.exe';
		} 
		console.log(userData);
		const versionDir = path.join(userData, walletConfigData.minerData.version);
		console.log(versionDir);
		if (!fs.existsSync(versionDir)) {
			// create dir and parents
			fs.ensureDirSync(versionDir);
			console.log('miner folder not found');
		}
		//const cmd = path.join(userData, walletConfigData.minerData.filename);
		const cmd = path.join(versionDir, 'gqlc-miner' + platformExt);
		if (!fs.existsSync(cmd)) {
			// try to extract again if file not found
			//fs.ensureDirSync(versionDir);
			console.log('miner not found');
		}
		log.log(`start miner ${cmd}`);
		//console.log(algo)
		//console.log(qlc_address);
		miner = crossSpawn(cmd, ['-nodeurl', 'http://127.0.0.1:9735', '-algo' , algo, '-miner', qlc_address], {
			windowsHide: true,
			stdio: ['ignore', 'pipe', 'pipe']
		});

		if (!miner) {
			try {
				mainWindow.webContents.send('miner-running',{
					'status' : 0
				});
			} catch (error) {
				console.log(error);
			}
			const err = new Error('miner not started');
			err.code = 'ENOENT';
			err.path = cmd;
			throw err;
		} else {
			try {
				mainWindow.webContents.send('miner-running',{
					'status' : 1
				});
			} catch (error) {
				console.log(error);
			}
		}
		miner.stdout.on('data', data => { 
			log.log('[miner]', String(data).trim()); 
			try {
				mainWindow.webContents.send('miner-log',String(data).trim());
			} catch (error) {
				console.log(error);
			}
		});
		miner.stderr.on('data', data => {
			log.log('[miner]', String(data).trim());
			try {
				mainWindow.webContents.send('miner-log',String(data).trim());
			} catch (error) {
				console.log(error);
			}
		});

		miner.once('exit', () => {
			removeMinerExitHandler();
			global.isMinerStarted = false;
			log.log(`Miner exiting (PID ${miner.pid})`);
			forceKill(miner);
		});
	
		miner.once('exit', () => app.removeListener('will-quit', killMinerHandler));
	
		miner.once('loaded', () => {});
	}

	function startPool(qlc_address,algo) {
		log.log('start pool');
		log.log(userData);
		log.log(walletConfigData.poolData.filename);

		const platform = walletConfigData.poolData.platform;
		let platformExt = '';
		if (platform == 'win32') {
			platformExt = '.exe';
		} 
		console.log(userData);
		const versionDir = path.join(userData, walletConfigData.poolData.version);
		console.log(versionDir);
		if (!fs.existsSync(versionDir)) {
			// create dir and parents
			fs.ensureDirSync(versionDir);
			console.log('pool folder not found');
		}
		//const cmd = path.join(userData, walletConfigData.poolData.filename);
		const cmd = path.join(versionDir, 'gqlc-pool' + platformExt);
		if (!fs.existsSync(cmd)) {
			// try to extract again if file not found
			//fs.ensureDirSync(versionDir);
			console.log('pool not found');
		}
		log.log(`start pool ${cmd}`);

		pool = crossSpawn(cmd, ['-nodeurl', 'http://127.0.0.1:9735', '-algo' , algo, '-miner', qlc_address], {
			windowsHide: true,
			stdio: ['ignore', 'pipe', 'pipe']
		});

		if (!pool) {
			try {
				mainWindow.webContents.send('pool-running',{
					'status' : 0
				});
			} catch (error) {
				console.log(error);
			}
			const err = new Error('pool not started');
			err.code = 'ENOENT';
			err.path = cmd;
			throw err;
		} else {
			try {
				mainWindow.webContents.send('pool-running',{
					'status' : 1
				});
			} catch (error) {
				console.log(error);
			}
		}
		pool.stdout.on('data', data => {
			log.log('[pool]', String(data).trim());
			try {
				mainWindow.webContents.send('pool-log',String(data).trim());
			} catch (error) {
				console.log(error);
			}
		});
		pool.stderr.on('data', data => {
			log.log('[pool]', String(data).trim());
			try {
				mainWindow.webContents.send('pool-log',String(data).trim());;
			} catch (error) {
				console.log(error);
			}
		});

		pool.once('exit', () => {
			removePoolExitHandler();
			global.isPoolStarted = false;
			log.log(`Pool exiting (PID ${pool.pid})`);
			forceKill(pool);
		});
	
		pool.once('exit', () => app.removeListener('will-quit', killPoolHandler));
	
		pool.once('loaded', () => {});
	}
	
	const killHandler = () => { 
		if (typeof child.kill == 'function') {
			child.kill();
			if (mainWindow != null) {
				try {
					mainWindow.webContents.send('node-running',{
						'status' : 0
					});
				} catch (error) {
					console.log(error);
				}
			}
		}
	};
	const removeExitHandler = signalExit(killHandler);

	const killMinerHandler = () => { 
		if (typeof miner.kill == 'function') {
			miner.kill();
			try {
				mainWindow.webContents.send('miner-running',{
					'status' : 0
				});
			} catch (error) {
				console.log(error);
			}
		}
	};
	const removeMinerExitHandler = signalExit(killMinerHandler);

	
	const killPoolHandler = () => { 
		if (typeof pool.kill == 'function') {
			pool.kill();
			try {
				mainWindow.webContents.send('pool-running',{
					'status' : 0
				});
			} catch (error) {
				console.log(error);
			}
		}
	};
	const removePoolExitHandler = signalExit(killPoolHandler);
	
	app.on('ready', () => {
		// Once the app is ready, launch the wallet window
		const { powerMonitor } = require('electron');
		powerMonitor.on('suspend', () => {
			console.log('The system is going to sleep');
			killHandler();
		})
		
		powerMonitor.on('resume', () => {
			console.log('The system is resuming');
		})
		createWindow();
		
		app.once('will-quit', killHandler);
		app.once('will-quit', killMinerHandler);
		app.once('will-quit', killPoolHandler);

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
		//mainWindow.webContents.send('update-check','');
	});

	// Quit when all windows are closed.
	app.on('window-all-closed', function() {
		// On OS X it is common for applications and their menu bar
		// to stay active until the user quits explicitly with Cmd + Q

		if (process.platform !== 'darwin') {
			// close gqlc
			console.log(typeof child.kill);
			if (typeof child.kill == 'function') {
				child.kill();
				killHandler();
			}
			// close miner
			console.log(typeof miner.kill);
			if (typeof miner.kill == 'function') {
				miner.kill();
				killMinerHandler();
			}
			// close pool
			console.log(typeof pool.kill);
			if (typeof pool.kill == 'function') {
				pool.kill();
				killPoolHandler();
			}
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
			.then((data) => { log.log(data) })
			.catch(console.log);
	}

	// Build up the menu bar options based on platform
	function getApplicationMenu() {
		const template = [
			{
				label: 'View',
				submenu: [
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
							loadExternal('https://github.com/qlcchain/QLCTracker');
						}
					},
					{
						label: 'Submit Issue',
						click() {
							loadExternal('https://github.com/qlcchain/QLCTracker/issues/new');
						}
					},
					{ type: 'separator' },
					{
						type: 'normal',
						label: `QLCTracker Version: ${walletConfigData.version}`
					},
					{
						label: 'View Latest Updates',
						click() {
							loadExternal('https://github.com/qlcchain/QLCTracker/releases');
						}
					},
					{ type: 'separator' },
					{
						label: `Check for Updates...`,
						click(menuItem, browserWindow) {
							try {
								mainWindow.webContents.send('update-check','');
							} catch (error) {
								console.log(error);
							}
						}
					}
				]
			}
		];

		if (process.platform === 'darwin') {
			template.unshift({
				label: 'QLCTracker',
				submenu: [
					{ role: 'about' },
					{ type: 'separator' },
					{
						label: `Check for Updates...`,
						click(menuItem, browserWindow) {
							try {
								mainWindow.webContents.send('update-check','');
							} catch (error) {
								console.log(error);
							}
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

