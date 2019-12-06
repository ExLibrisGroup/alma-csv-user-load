import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor( private httpClient: HttpClient ) { }

  /** Create a new BIB record with the specified MARCXML */
  createUser( user ) {
    return this.httpClient.post<any>(environment.proxyUrl + '/almaws/v1/users', user )
  }

}
