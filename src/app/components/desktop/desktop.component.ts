import { Component, OnInit, TemplateRef, ContentChild, ViewChild } from '@angular/core';
import { IpcService } from 'src/app/services/ipc.service';
import { NodeService } from 'src/app/services/node.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { NotificationService } from 'src/app/services/notification.service';
import { ApiService } from 'src/app/services/api.service';
import { interval, timer } from 'rxjs';
import { WalletService } from 'src/app/services/wallet.service';
import { QLCWebSocketService } from 'src/app/services/qlc-websocket.service';
import { environment } from 'src/environments/environment';
import { httpProvider } from 'qlc.js/provider/HTTP';
import Client from 'qlc.js/client';

@Component({
  selector: 'app-desktop',
  templateUrl: './desktop.component.html',
  styleUrls: ['./desktop.component.scss']
})
export class DesktopComponent implements OnInit {
  accounts = this.walletService.wallet.accounts;
  minerAccounts = [];
  selectedMinerAccount = '';

  modalRef: BsModalRef;
  modalNodeStoppedRef: BsModalRef;
  modalUpdateCheckRef: BsModalRef;
  modalMiningSetupRef: BsModalRef;
  modalGqlcMiningSetupRef: BsModalRef;
  modalPoolSetupRef: BsModalRef;

  modalMinerRef: BsModalRef;
  modalPoolRef: BsModalRef;
  modalPoolMinersRef: BsModalRef;
  modalPoolMinersCPURef: BsModalRef;
  modalPoolMinersGPURef: BsModalRef;
  modalPoolMinersASICRef: BsModalRef;
  
  minerStats = [];

  modalConfig = {
    backdrop: true,
    ignoreBackdropClick: true
  };

  desktopConfig = {
    version: '',
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
  };

  showNodeControl = true;

  deleteLedgerWarning = true;
  deleteLedgerWarningProgress = false;
  deleteLedgerWarningFinish = false;
  deleteLedgerWarningShowOnUpdate = false;

  downloadProgress = 0;
  newVersion = '';

  startingDesktop = true;
  stoppedDesktop = false;
  stoppingNode = false;
  updateCheckDesktop = false;

  showCheckingStatus = true;
  showNodeFound = false;
  showNoNodeFound = false;
  showDownload = false;
  showDownloadUpdate = false;
  showDownloadNew = false;
  showDownloading = false;
  showDownloadFinished = false;
  showStartNode = false;
  showStartingNode = false;
  showSynchronizingNode = false;
  showNoUpdate = false;
  showNodeStopped = false;

  nodeMemoryUsage = 0;
  nodeCPUUsage = 0; // not working correctly on windows - pidusage
  nodeUptime = '';

  platform = '';
  arch = '';

  //miner

  minerLastMsg = '';
  minerLog = [];

  selectedMiner = '1';
  selectedAlgo = 'SHA256D';
  selectedPoolMiner = '1';


  showCheckingMinerStatus = true;
  showMinerFound = false;
  showNoMinerFound = false;
  showDownloadMinerNew = false;
  showDownloadMinerUpdate = false;

  showDownloadMiner = false;
  showDownloadingMiner = false;
  showDownloadMinerFinished = false;
  
  downloadMinerProgress = 0;
  newMinerVersion = '';

  showNoMinerUpdate = false;
  showStartMiner = false;
  showStartingMiner = false;
  showStartedMiner = false;
  stoppingMiner = false;

  showMinerControl = false;
  
  //pool

  poolLastMsg = '';
  poolLog = [];

  showCheckingPoolStatus = true;
  showPoolFound = false;
  showNoPoolFound = false;
  showDownloadPoolNew = false;
  showDownloadPoolUpdate = false;

  showDownloadPool = false;
  showDownloadingPool = false;
  showDownloadPoolFinished = false;
  
  downloadPoolProgress = 0;
  newPoolVersion = '';

  showNoPoolUpdate = false;
  showStartPool = false;
  showStartingPool = false;
  showStartedPool = false;
  stoppingPool = false;

  showPoolControl = false;
  
  usingPublicNode = false;

  private checkProccesInterval$ = interval(5000);


  @ViewChild('publicrpctemplate', { read: TemplateRef, static:true }) publicrpctemplate: TemplateRef<any>;
  @ViewChild('template', { read: TemplateRef, static:true }) template: TemplateRef<any>;
  @ViewChild('templateNodeStopped', { read: TemplateRef, static:true }) templateNodeStopped: TemplateRef<any>;
  @ViewChild('templateUpdateCheck', { read: TemplateRef, static:true }) templateUpdateCheck: TemplateRef<any>;
  @ViewChild('templateMiningSetup', { read: TemplateRef, static:true }) templateMiningSetup: TemplateRef<any>;
  @ViewChild('templateGqlcMiningSetup', { read: TemplateRef, static:true }) templateGqlcMiningSetup: TemplateRef<any>;
  
  @ViewChild('templateMiner', { read: TemplateRef, static:true }) templateMiner: TemplateRef<any>;

  @ViewChild('templatePool', { read: TemplateRef, static:true }) templatePool: TemplateRef<any>;
  @ViewChild('templatePoolSetup', { read: TemplateRef, static:true }) templatePoolSetup: TemplateRef<any>;
  @ViewChild('templatePoolMiners', { read: TemplateRef, static:true }) templatePoolMiners: TemplateRef<any>;
  @ViewChild('templatePoolMinersCPU', { read: TemplateRef, static:true }) templatePoolMinersCPU: TemplateRef<any>;
  @ViewChild('templatePoolMinersGPU', { read: TemplateRef, static:true }) templatePoolMinersGPU: TemplateRef<any>;
  @ViewChild('templatePoolMinersASIC', { read: TemplateRef, static:true }) templatePoolMinersASIC: TemplateRef<any>;
  

  constructor(
    public api: ApiService,
    public ipc: IpcService, 
    public node: NodeService, 
    private modalService: BsModalService,
    private notifications: NotificationService,
    private walletService: WalletService,
    private ws: QLCWebSocketService
  ) { }

  async ngOnInit() {
    this.ipc.on('update-check', async (event, data) => {
      console.log('got event update-check');
      console.log('got data');
      console.log(data);
      this.showDownload = false;
      this.showDownloading = false;
      this.showNoUpdate = false;
      this.showDownloadFinished = false;
      const latest = await this.api.nodeVersion(this.desktopConfig.version,this.desktopConfig.nodeData.version,this.platform,this.arch);
      //console.log(latest);
      if (latest.result) {
        if (this.desktopConfig.nodeData.version != latest.result.version) {
          this.showDownload = true;
          this.newVersion = latest.result;
          if (this.desktopConfig.nodeData.version == '') {
            this.showDownloadNew = true;
          } else {
            this.showDownloadUpdate = true;
          }

        } else {
          this.showNoUpdate = true;
          this.showStartNode = true;
        }
      }
      this.openUpdateCheckModal(this.templateUpdateCheck);
    });
    this.ipc.on('download-progress', (event, data) => {
      //console.log('got event');
      //console.log(event);
      //console.log('got data');
      //console.log(data);
      this.downloadProgress = data.progress;
      this.showDownload = false;
      this.showDownloadUpdate = false;
      this.showDownloadNew = false;
      this.showDownloading = true;
    });
    this.ipc.on('delete-ledger-finish', (event, data) => {
      this.deleteLedgerWarningProgress = false;
      this.deleteLedgerWarningFinish = true;
    });
    this.ipc.on('download-finished', (event, data) => {
      //console.log('got event');
      //console.log(event);
      //console.log('got data');
      //console.log(data);
      this.desktopConfig.nodeData = data;
      this.showDownload = false;
      this.showDownloadUpdate = false;
      this.showDownloadNew = false;
      this.showDownloading = false;
      this.showDownloadFinished = true;
      this.showStartNode = true;
    });
    this.ipc.on('download-miner-progress', (event, data) => {
      //console.log('got event');
      //console.log(event);
      //console.log('got data');
      //console.log(data);
      this.downloadMinerProgress = data.progress;
      this.showDownloadMiner = false;
      this.showDownloadMinerUpdate = false;
      this.showDownloadMinerNew = false;
      this.showDownloadingMiner = true;
    });
    this.ipc.on('download-miner-finished', (event, data) => {
      //console.log('got event');
      //console.log(event);
      //console.log('got data');
      //console.log(data);
      this.showDownloadMiner = false;
      this.showDownloadMinerUpdate = false;
      this.showDownloadMinerNew = false;
      this.showDownloadingMiner = false;
      this.showDownloadMinerFinished = true;
      this.showStartMiner = true;
    });
    this.ipc.on('miner-log', (event, data) => {
      //console.log('got event');
      //console.log(event);
      //console.log('got data');
      //console.log(data);
      this.minerLastMsg = data;
      this.minerLog.push(data);
    });
    this.ipc.on('download-pool-progress', (event, data) => {
      //console.log('got event');
      //console.log(event);
      //console.log('got data');
      //console.log(data);
      this.downloadPoolProgress = data.progress;
      this.showDownloadPool = false;
      this.showDownloadPoolUpdate = false;
      this.showDownloadPoolNew = false;
      this.showDownloadingPool = true;
    });
    this.ipc.on('download-pool-finished', (event, data) => {
      //console.log('got event');
      //console.log(event);
      //console.log('got data');
      //console.log(data);
      this.showDownloadPool = false;
      this.showDownloadPoolUpdate = false;
      this.showDownloadPoolNew = false;
      this.showDownloadingPool = false;
      this.showDownloadPoolFinished = true;
      this.showStartPool = true;
    });
    this.ipc.on('pool-log', (event, data) => {
      //console.log('got event');
      //console.log(event);
      //console.log('got data');
      //console.log(data);
      this.poolLastMsg = data;
      this.poolLog.push(data);
    });
    this.ipc.on('node-running', (event, data) => {
      //console.log('got node-running event',event);
      //console.log('node-running got data',data);
      //console.log(data);
      if (this.usingPublicNode) {
        return;
      }
      if (data.status == 1) {
        if (this.showStartNode)
          this.showStartNode = false;
        if (this.stoppingNode === false && !this.showStartNode && !this.showDownload && !this.showDownloading && !this.showDownloadFinished && !this.showNoUpdate) {
          this.node.running = true;
          this.showStartNode = false;
          this.showStartingNode = false;
          if (this.showSynchronizingNode === false) {
            this.api.connect();
            this.showSynchronizingNode = true;
            this.node.setSynchronizingPov();
            this.node.setSynchronizingTransactions();
          }
          
        }
      } else {
        if (this.node.running === true) {
          this.node.setOffline('Node stopped.');
          this.node.running = false;
          this.node.synchronized = false;
          this.showNodeStopped = true;
          this.showSynchronizingNode = false;
          this.nodeMemoryUsage = 0;
          this.nodeCPUUsage = 0;
          this.nodeUptime = '';
          if (this.stoppedDesktop === false && this.updateCheckDesktop === false) {
            this.showStartNode = true;
            this.stoppedDesktop = true;
            this.openNodeStoppedModal(this.templateNodeStopped);
          }
        }
      }
    });
    this.ipc.on('miner-running', (event, data) => {
      //console.log('got node-running event');
      //console.log('got data');
      //console.log(data);
      if (data.status == 1) {
        if (this.stoppingMiner === false) {
          //this.miner.running = true;
          this.showStartMiner = false;
          this.showStartingMiner = false;
          this.showStartedMiner = true;
          
        }
      } else {
        //this.miner.running = false;
        if (this.startingDesktop === false && this.stoppedDesktop === false && this.updateCheckDesktop === false) {
          this.showStartMiner = true;
          //this.stoppedDesktop = true;
          //this.openNodeStoppedModal(this.templateNodeStopped);
        }
      }
    });
    this.ipc.on('pool-running', (event, data) => {
      //console.log('got node-running event');
      //console.log('got data');
      //console.log(data);
      if (data.status == 1) {
        if (this.stoppingPool === false) {
          //this.miner.running = true;
          this.showStartPool = false;
          this.showStartingPool = false;
          this.showStartedPool = true;
          
        }
      } else {
        //this.miner.running = false;
        if (this.startingDesktop === false && this.stoppedDesktop === false && this.updateCheckDesktop === false) {
          this.showStartPool = true;
          //this.stoppedDesktop = true;
          //this.openNodeStoppedModal(this.templateNodeStopped);
        }
      }
    });
    this.ipc.on('node-data', async (event, data) => {
      //console.log('got node-data event');
      //console.log('got data');
      //console.log(data);
      this.desktopConfig = data.config;
      if (this.desktopConfig.nodeData.version != '') {
        this.showNodeFound = true;
      } else {
        this.showNoNodeFound = true;
      }
      this.platform = data.platform;
      this.arch = data.arch;
      const latest = await this.api.nodeVersion(this.desktopConfig.version,this.desktopConfig.nodeData.version,this.platform,this.arch);
      //console.log(latest);
      if (latest.result) {
        if (this.desktopConfig.nodeData.version != latest.result.version) {
          this.showDownload = true;
          this.newVersion = latest.result;
          if (this.desktopConfig.nodeData.version == '') {
            this.showDownloadNew = true;
          } else {
            this.showDownloadUpdate = true;
            //if (latest.result.version === 'v1.4.1') {
              this.deleteLedgerWarningShowOnUpdate = true;
            //}
          }

        } else {
          this.showNoUpdate = true;
          this.showStartNode = true;
        }
      }
    });

    this.ipc.on('node-process-data', (event, data) => {
      //console.log('got node-process-data event');
      //console.log('got data');
      //console.log(data);
      if (data.stats) {
        this.nodeCPUUsage = data.stats.cpu;
        this.nodeMemoryUsage = data.stats.memory;
        this.nodeUptime = this.millisecondsTohhmmss(data.stats.elapsed);
      }
    });
    
    this.openModal(this.publicrpctemplate);
    //this.openMiningSetupModal();
    
    this.notifications.removeNotification('node-offline');
    this.notifications.removeNotification('node-connect');

    this.nodeData();
  }

  async useLocalNode() {
    this.modalRef.hide();
    this.openModal(this.template);

    this.checkProccesInterval$.subscribe(async () => {
			this.nodeGetProcess();
		});
  }

  async usePublicNode() {
    this.modalRef.hide();
    this.api.rpcUrl = environment.mainRpcUrl[environment.qlcChainNetwork];
    const httpRpc = new httpProvider(this.api.rpcUrl);
    this.api.c = new Client(httpRpc, () => {});
    this.ws.wsUrl = 'wss://rpc-ws.qlcchain.online';
    this.node.running = true;
    this.api.connect();
    this.usingPublicNode = true;
  }

  async checkIfMinerAccounts() {
    this.minerAccounts = [];
    for (const account of this.accounts) { // check if any account address is a miner
      
      console.log('.................checking account state');
      const repStatus = await this.api.pov_getLatestAccountState(account.id);
      if (repStatus.result) {
        console.log(repStatus);
        if (repStatus.result.accountState && repStatus.result.accountState != null) {
          if (repStatus.result.accountState.vote && repStatus.result.accountState.vote >= 10000000000000) {
            console.log('found minerAccount');
            console.log(account)
            this.minerAccounts.push(account);
          } 
        } 
      } else {
        console.log('ERROR getting account state');
      }
    }
    if (this.minerAccounts[0]) {
      this.selectedMinerAccount = this.minerAccounts[0].id;
    }
  }

  async deleteLedger() {
    this.ipc.send('delete-ledger','');
    this.deleteLedgerWarning = false;
    this.deleteLedgerWarningProgress = true;
  }


  millisecondsTohhmmss(milliseconds) {
    const totalSeconds = milliseconds/1000;
    const days    = Math.floor(totalSeconds / 86400);
    const hours   = Math.floor((totalSeconds - (days * 86400)) / 3600);
    const minutes = Math.floor((totalSeconds  - (days * 86400) - (hours * 3600)) / 60);
    const seconds = Math.floor(totalSeconds - (days * 86400) - (hours * 3600) - (minutes * 60));
    let result:string = (days > 0 ? days + 'd ' : '');
    result += (hours < 10 ? "0" + hours : hours);
    result += ":" + (minutes < 10 ? "0" + minutes : minutes);
    result += ":" + (seconds  < 10 ? "0" + seconds : seconds);
    return result;
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, this.modalConfig);
  }

  closeModal() {
    this.modalRef.hide();
    this.startingDesktop = false;
    this.nodeData();
  }

  openNodeStoppedModal(template: TemplateRef<any>) {
    this.modalRef.hide();
    this.api.nodeBlocksCount = 0;
    this.api.nodeMainBlocksCount = 0;
    this.showStartNode = true;
    this.showSynchronizingNode = false;
    this.node.running = false;
    this.modalNodeStoppedRef = this.modalService.show(template, this.modalConfig);
    const source = timer(1500);
		const abc =  source.subscribe(async val => {
      this.stoppingNode = false;
		});
  }

  closeNodeStoppedModal() {
    this.modalNodeStoppedRef.hide();
    this.stoppedDesktop = false;
  }

  openUpdateCheckModal(template: TemplateRef<any>) {
    this.updateCheckDesktop = true;
    this.showCheckingStatus = true;
    this.modalUpdateCheckRef = this.modalService.show(template, this.modalConfig);

  }

  closeUpdateCheckModal() {
    this.modalUpdateCheckRef.hide();
    this.updateCheckDesktop = false;
    this.nodeData();
  }
  
  
  nodeStart() {
    this.ipc.send('node-start','');

    this.showCheckingStatus = false;
    this.showNodeFound = false;
    this.showNoNodeFound = false;
    this.showDownloadFinished = false;
    this.showStartNode = false;
    this.showNoUpdate = false;
    this.showStartingNode = true;
    this.showNodeStopped = false;
  }

  nodeStop() {
    this.ipc.send('node-stop','');
    this.stoppingNode = true;
    this.showNodeStopped = true;
    this.node.setOffline('Node stopped.');
  }

  nodeRestart() {
    this.ipc.send('node-restart','');
  }

  nodeUpdate() {
    this.api.nodeBlocksCount = 0;
    this.api.nodeMainBlocksCount = 0;
    this.ipc.send('node-stop','');
    this.ipc.send('node-update',this.newVersion);
  }
//{arch: "x64", platform: "win32"}
  nodeGetVersion() {
    this.ipc.send('node-version-get','');
  }

  nodeGetProcess() {
    this.ipc.send('node-process','');
  }

  nodeSaveVersion() {
    this.ipc.send('node-version-save','');
  }

  nodeData() {
    this.ipc.send('node-data','');
  }

  async openMiningSetupModal() {
    this.modalRef.hide();
    this.modalMiningSetupRef = this.modalService.show(this.templateMiningSetup, this.modalConfig);
    await this.checkIfMinerAccounts();
  }

  closeMiningSetupModal() {
    this.modalMiningSetupRef.hide();
  }

  continueMinerSetup() {
    console.log(this.selectedMiner);
    if (this.selectedMiner == '1') {
      this.openGqlcMiningSetupModal();
    } else {
      this.openPoolSetupModal();
    }
  }

  continuePoolMinerSetup() {
    console.log(this.selectedPoolMiner);
    if (this.selectedPoolMiner == '1') {
      this.openPoolMinersModalCPU();
    } else if (this.selectedPoolMiner == '2') {
      this.openPoolMinersModalGPU();

    } else {
      this.openPoolMinersModalASIC();
    }
  }

  openPoolSetupModal() {
    this.modalMiningSetupRef.hide();
    this.modalPoolSetupRef = this.modalService.show(this.templatePoolSetup, this.modalConfig);
  }

  closePoolSetupModal() {
    this.modalPoolSetupRef.hide();
  }
  
  openPoolModal() {
    this.closePoolSetupModal();
    this.modalPoolRef = this.modalService.show(this.templatePool, this.modalConfig);
  }

  closePoolModal() {
    this.modalPoolRef.hide();
  }

  openPoolMinersModal() {
    this.closePoolModal();
    this.modalPoolMinersRef = this.modalService.show(this.templatePoolMiners, this.modalConfig);
  }

  closePoolMinersModal() {
    this.modalPoolMinersRef.hide();
  }

  openPoolMinersModalCPU() {
    this.closePoolMinersModal();
    this.modalPoolMinersCPURef = this.modalService.show(this.templatePoolMinersCPU, this.modalConfig);
  }

  closePoolMinersModalCPU() {
    this.modalPoolMinersCPURef.hide();
  }

  openPoolMinersModalGPU() {
    this.closePoolMinersModal();
    this.modalPoolMinersGPURef = this.modalService.show(this.templatePoolMinersGPU, this.modalConfig);
  }

  closePoolMinersModalGPU() {
    this.modalPoolMinersGPURef.hide();
  }

  openPoolMinersModalASIC() {
    this.closePoolMinersModal();
    this.modalPoolMinersASICRef = this.modalService.show(this.templatePoolMinersASIC, this.modalConfig);
  }

  closePoolMinersModalASIC() {
    this.modalPoolMinersASICRef.hide();
  }
  


  openGqlcMiningSetupModal() {
    this.modalMiningSetupRef.hide();
    this.modalGqlcMiningSetupRef = this.modalService.show(this.templateGqlcMiningSetup, this.modalConfig);
  }

  closeGqlcMiningSetupModal() {
    this.modalGqlcMiningSetupRef.hide();
  }

  openMinerModal() {
    this.closeGqlcMiningSetupModal();
    this.modalMinerRef = this.modalService.show(this.templateMiner, this.modalConfig);
  }

  closeMinerModal() {
    this.modalMinerRef.hide();
  }

  

  minerStart() {
    this.ipc.send('miner-start',{
      'qlc_address' : this.selectedMinerAccount,
      'algo' : this.selectedAlgo
    });
    this.showMinerControl = true;

    /*this.showCheckingStatus = false;
    this.showNodeFound = false;
    this.showNoNodeFound = false;
    this.showDownloadFinished = false;
    this.showStartNode = false;
    this.showNoUpdate = false;
    this.showStartingNode = true;
    this.showNodeStopped = false;*/
  }

  minerStop() {
    this.ipc.send('miner-stop','');
    this.showStartedMiner = false;
    /*this.stoppingNode = true;
    this.showNodeStopped = true;*/
  }

  minerRestart() {
    this.ipc.send('miner-restart','');
  }

  async minerUpdate() {
    this.openMinerModal();
    /*this.api.nodeBlocksCount = 0;
    this.api.nodeMainBlocksCount = 0;*/
    const latest = await this.api.minerVersion(this.desktopConfig.version,this.desktopConfig.minerData.version,this.platform,this.arch);
    //console.log(latest);
    if (latest.result) {
      if (this.desktopConfig.minerData.version != latest.result.version) {
        this.showDownloadMiner = true;
        this.newMinerVersion = latest.result;
        if (this.desktopConfig.minerData.version == '') {
          this.showDownloadMinerNew = true;
        } else {
          this.showDownloadMinerUpdate = true;
        }

      } else {
        this.showNoMinerUpdate = true;
        this.showStartMiner = true;
      }
    }

  }

  async runMinerUpdate() {
    this.ipc.send('miner-stop','');
    console.log(this.newMinerVersion);
    this.ipc.send('miner-update',this.newMinerVersion);
  }


  poolStart() {
    this.ipc.send('pool-start',{
      'qlc_address' : this.selectedMinerAccount,
      'algo' : this.selectedAlgo
    });
    this.showPoolControl = true;

    /*this.showCheckingStatus = false;
    this.showNodeFound = false;
    this.showNoNodeFound = false;
    this.showDownloadFinished = false;
    this.showStartNode = false;
    this.showNoUpdate = false;
    this.showStartingNode = true;
    this.showNodeStopped = false;*/
  }

  poolStop() {
    this.ipc.send('pool-stop','');
    this.showStartedPool = false;
    /*this.stoppingNode = true;
    this.showNodeStopped = true;*/
  }

  poolRestart() {
    this.ipc.send('pool-restart','');
  }

  async poolUpdate() {
    this.openPoolModal();
    /*this.api.nodeBlocksCount = 0;
    this.api.nodeMainBlocksCount = 0;*/
    const latest = await this.api.poolVersion(this.desktopConfig.version,this.desktopConfig.poolData.version,this.platform,this.arch);
    //console.log(latest);
    if (latest.result) {
      if (this.desktopConfig.poolData.version != latest.result.version) {
        this.showDownloadPool = true;
        this.newPoolVersion = latest.result;
        if (this.desktopConfig.poolData.version == '') {
          this.showDownloadPoolNew = true;
        } else {
          this.showDownloadPoolUpdate = true;
        }

      } else {
        this.showNoPoolUpdate = true;
        this.showStartPool = true;
      }
    }

  }

  async runPoolUpdate() {
    this.ipc.send('pool-stop','');
    console.log(this.newPoolVersion);
    this.ipc.send('pool-update',this.newPoolVersion);
  }


  async getMinerStats() {
    const minerStatsQuery = await this.api.getMinerStats();
    if (minerStatsQuery.result) {
      const minerStats = minerStatsQuery.result.minerStats;
      let displayMinerStats = [];
      for (var key in minerStats) {
        //console.log(minerStats[key]);
        displayMinerStats.push({
          "address" : key,
          "mainBlockNum": minerStats[key].mainBlockNum,
          "mainRewardAmount": minerStats[key].mainRewardAmount,
          "firstBlockTime": minerStats[key].firstBlockTime,
          "lastBlockTime": minerStats[key].lastBlockTime,
          "firstBlockHeight": minerStats[key].firstBlockHeight,
          "lastBlockHeight": minerStats[key].lastBlockHeight,
          "isHourOnline": minerStats[key].isHourOnline,
          "isDayOnline": minerStats[key].isDayOnline
        });
      }
      this.minerStats = displayMinerStats;
      return true;
    }
    return false;
    //console.log(this.minerStats);
  }

}
