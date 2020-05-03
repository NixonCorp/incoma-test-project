import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class YoutubeService {

  private apiKey = environment.apiKey;
  private nextPageToken = "";
  constructor(private http: HttpClient) { }

  getMostPopularVideos(maxResults): Observable<Object> {
      let url = `https://www.googleapis.com/youtube/v3/search?key=${this.apiKey}&
      chart=mostPopular&
      order=date&part=snippet&
      type=video,id&
      maxResults=${maxResults}&
      pageToken=${this.nextPageToken}`;
      return this.http.get(url)
        .pipe(map((res: any) => {
          this.nextPageToken = res.nextPageToken;
          return res;
        }));
  }
}
