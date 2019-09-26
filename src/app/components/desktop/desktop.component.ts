import { Component, OnInit, TemplateRef, ContentChild, ViewChild } from '@angular/core';
import { IpcService } from 'src/app/services/ipc.service';
import { NodeService } from 'src/app/services/node.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { NotificationService } from 'src/app/services/notification.service';
import { ApiService } from 'src/app/services/api.service';
import { interval, timer } from 'rxjs';

@Component({
  selector: 'app-desktop',
  templateUrl: './desktop.component.html',
  styleUrls: ['./desktop.component.scss']
})
export class DesktopComponent implements OnInit {
  modalRef: BsModalRef;
  modalNodeStoppedRef: BsModalRef;
  modalUpdateCheckRef: BsModalRef;
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
    }
  };

  showNodeControl = true;

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

  private checkProccesInterval$ = interval(1000);


  @ViewChild('template', { read: TemplateRef, static:true }) template: TemplateRef<any>;
  @ViewChild('templateNodeStopped', { read: TemplateRef, static:true }) templateNodeStopped: TemplateRef<any>;
  @ViewChild('templateUpdateCheck', { read: TemplateRef, static:true }) templateUpdateCheck: TemplateRef<any>;

  
  constructor(
    public api: ApiService,
    public ipc: IpcService, 
    public node: NodeService, 
    private modalService: BsModalService,
    private notifications: NotificationService
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
    this.ipc.on('download-finished', (event, data) => {
      //console.log('got event');
      //console.log(event);
      //console.log('got data');
      //console.log(data);
      this.showDownload = false;
      this.showDownloadUpdate = false;
      this.showDownloadNew = false;
      this.showDownloading = false;
      this.showDownloadFinished = true;
      this.showStartNode = true;
    });
    this.ipc.on('node-running', (event, data) => {
      //console.log('got node-running event');
      //console.log('got data');
      //console.log(data);
      if (data.status == 1) {
        if (this.stoppingNode === false) {
          this.node.running = true;
          this.showStartNode = false;
          this.showStartingNode = false;
          if (this.showSynchronizingNode === false) {
            this.api.connect();
            this.showSynchronizingNode = true;
          }
          
        }
      } else {
        this.node.running = false;
        this.node.synchronized = false;
        this.showSynchronizingNode = false;
        this.nodeMemoryUsage = 0;
        this.nodeCPUUsage = 0;
        this.nodeUptime = '';
        if (this.startingDesktop === false && this.stoppedDesktop === false && this.updateCheckDesktop === false) {
          this.showStartNode = true;
          this.stoppedDesktop = true;
          this.openNodeStoppedModal(this.templateNodeStopped);
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
    
    this.openModal(this.template);
    
    this.notifications.removeNotification('node-offline');
    this.notifications.removeNotification('node-connect');

    this.nodeData();

    this.checkProccesInterval$.subscribe(async () => {
			this.nodeGetProcess();
		});
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

}
