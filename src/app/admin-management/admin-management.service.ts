import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../authentication/config.service';
import { ToasterService } from 'angular2-toaster';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class AdminManagementService {

  private userInfoEndpoint: string;
  private repoEndpoint: string;
  private serviceEndpoint: string;

  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private toasterService: ToasterService
  ) {
    this.repoEndpoint = this.config.repositoryUrl;
    this.userInfoEndpoint = this.config.userInfoUrl;
    this.serviceEndpoint = '/user/';
  }

   /** 
   * Pattern Pedia API 
   * */

  public getAllUsers(): Observable<any[]> {
    return this.http.get<any>(this.repoEndpoint + this.serviceEndpoint + 'getAll').pipe(
      map(result => {
        return result
      }),
      catchError(error => {
        this.toasterService.pop('error', 'Getting user list', error)
        return [];
      }),
    )
  }
}
