import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { GithubPersistenceService } from '../../service/github-persistence.service';
import { switchMap } from 'rxjs/internal/operators';

@Component({
  selector: 'pp-process-oauth-callback',
  templateUrl: './process-oauth-callback.component.html',
  styleUrls: ['./process-oauth-callback.component.scss']
})
export class ProcessOauthCallbackComponent implements OnInit {

  constructor(private _httpClient: HttpClient, private _route: ActivatedRoute, private _cookieService: CookieService, private _router: Router,
              private _githubPersistenceService: GithubPersistenceService) {
    this._route.params.subscribe( params => console.log(params) );

  }

  ngOnInit() {
    const code = this._route.snapshot.params['code'];
    this._route.queryParams.pipe(
      switchMap((params) => {
        return this._httpClient.get('https://eqjjnlkv6a.execute-api.eu-central-1.amazonaws.com/default/authenticate/' + params['code']);
      })).subscribe(
      (res) => {
        // github sends the access_token in url param style (access_token=...&...), so let's use this info to decode the token:
      const urlResponse = new URLSearchParams(res);
      this._cookieService.set('patternpedia_github_token', urlResponse.get('access_token'));
      this._router.navigate(['..'], {relativeTo: this._route});
      });
  }

}
