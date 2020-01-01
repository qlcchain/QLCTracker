import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {

  newsList = [];
  archiveList = [];

  constructor(
    private api: ApiService
  ) { }

  ngOnInit() {
    this.loadNews();
  }

  
	async loadNews() {
		const news = await this.api.news();
		if (!news.error) {
			this.newsList = news.result;
    }
    const archive = await this.api.newsArchive();
		if (!archive.error) {
			this.archiveList = archive.result;
		}
	}

}
