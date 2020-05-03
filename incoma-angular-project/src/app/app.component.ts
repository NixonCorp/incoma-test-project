import {Component, OnInit} from '@angular/core';
import {YoutubeService} from "./services/youtube.service";
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  videos: any[] = [];
  filteredVideos: any[] = [];
  favoriteVideos: any[] = [];
  loading = false;
  infiniteScrollDisableStatus = false;
  badgeIcon = 'favorite_border'

  private storageName: string = 'Favorite videos';

  constructor(private youTubeService: YoutubeService,
              private sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    this.favoriteVideos = localStorage.getItem(this.storageName) !== null ? JSON.parse(<any>localStorage.getItem(this.storageName)) : [];
    this.loading = true;
    setTimeout(() => {
      this.loadVideos();
    }, 300);
  }

  loadVideos() {
    this.youTubeService
      .getMostPopularVideos(50)
      .subscribe(list => {
        for (let element of list["items"]) {
          element.videoSafeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(`https://youtube.com/embed/${element.id.videoId}`);
          element.isFavorite = this.favoriteVideos.filter(value => value.id.videoId === element.id.videoId).length > 0;
          this.videos.push(element);
        }
        this.filteredVideos = this.videos;
        this.loading = false;
      });
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    if (this.infiniteScrollDisableStatus)
      this.setFilteredVideos(this.favoriteVideos, filterValue, true);
    else
      this.setFilteredVideos(this.videos, filterValue, false);
  }

  setFilteredVideos(array: any[], filterValue, onFavoriteMode: boolean) {
    let filteredVideos = array.filter(value => value.snippet.title.toLowerCase().indexOf(filterValue) >= 0 ||
      value.snippet.description.toLowerCase().indexOf(filterValue) >= 0);
    if (filteredVideos.length > 0)
      this.filteredVideos = filteredVideos;
    else
      this.filteredVideos = onFavoriteMode ? this.favoriteVideos : this.videos
  }

  toggleSelected(video: any) {
    video.isFavorite = !video.isFavorite;
    if (this.videos.filter(value => value.id.videoId === video.id.videoId).length > 0)
      this.videos.filter(value => value.id.videoId === video.id.videoId)[0].isFavorite = video.isFavorite;
    if (video.isFavorite) {
      if (this.favoriteVideos.filter(value => value.id.videoId === video.id.videoId).length === 0)
        this.favoriteVideos.push(video);
    } else
      this.favoriteVideos = this.favoriteVideos.filter(value => value.id.videoId !== video.id.videoId);
    localStorage.setItem(this.storageName, JSON.stringify(this.favoriteVideos));
    if (this.infiniteScrollDisableStatus)
      this.filteredVideos = this.favoriteVideos;
  }

  onScrollDown() {
    this.loadVideos();
  }

  selectDeselectFavorites() {
    this.infiniteScrollDisableStatus = !this.infiniteScrollDisableStatus;
    if (this.infiniteScrollDisableStatus) {
      this.badgeIcon = 'favorite';
      this.favoriteVideos.forEach(value => {
        value.videoSafeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(`https://youtube.com/embed/${value.id.videoId}`);
      })
      this.filteredVideos = this.favoriteVideos;
    } else {
      this.badgeIcon = 'favorite_border';
      this.filteredVideos = this.videos;
    }
  }
}
