import { Component, OnInit } from '@angular/core';
import { NeoWalletService, myProvider } from 'src/app/services/neo-wallet.service';

@Component({
  selector: 'app-neo-settings',
  templateUrl: './neo-settings.component.html',
  styleUrls: ['./neo-settings.component.scss']
})
export class NeoSettingsComponent implements OnInit {

  neoNodes = [];

  constructor(
    public neoService: NeoWalletService,
  ) { }

  ngOnInit() {
  }

  async getNodes() {
    const api = new myProvider();
    const nodes = await api.getGoodNodes();
    console.log(nodes);
    this.neoNodes = nodes;
  }

}
