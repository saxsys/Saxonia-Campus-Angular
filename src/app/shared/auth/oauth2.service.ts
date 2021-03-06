import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, range } from 'rxjs';
import { publishReplay, refCount } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ConfigService } from '../config/config.service';
import { Jwt } from './jwt';

@Injectable()
export class OAuth2Service {
  @Output()
  onAuthenticate: EventEmitter<any> = new EventEmitter(false);

  constructor(private http: HttpClient, private configService: ConfigService, private jwtHelper: JwtHelperService) {
  }

  public doImplicitFlow(code: string) {
    const config = this.configService.getConfig();
    const clientId: string = config['client.id'];
    const resource: string = config['resource'];
    const redirectUrl: string = config['redirect.url'];
    const adfsAuthUrl: string = config['adfs.auth.url'];

    const id_token = localStorage.getItem('id_token');
    const refresh_token = localStorage.getItem('refresh_token');

    // everything is valid and user is authenticated
    if (id_token != null && !this.jwtHelper.isTokenExpired(id_token)) {
      console.log('all authenticated');
      console.log('user roles: ' + this.jwtHelper.decodeToken(id_token).role);
      this.onAuthenticate.emit(id_token);
      return range(1, 1);
      // access token expired or not available and refresh token available -> get new access token with refresh token
    } else if (refresh_token != null) {
      console.log('using refresh token to get new auth token');
      const payload = `client_id=${clientId}&refresh_token=${localStorage.getItem('refresh_token')}&grant_type=refresh_token`;
      return this.getToken(config['adfs.token.url'], payload);
      // process callback via redirect URI with authorization code -> get access token and refresh token with code
    } else if (code != null) {
      console.log('using authorization code to get new auth and refresh tokens');
      const payload = `client_id=${clientId}&code=${code}&redirect_uri=${encodeURIComponent(redirectUrl)}&grant_type=authorization_code`;
      return this.getToken(config['adfs.token.url'], payload);
      // completely unauthenticated -> initiate OAuth2 flow by redirecting to ADFS
    } else {
      console.log('redirecting to ADFS');
      window.location.href = `${adfsAuthUrl}?response_type=code&client_id=${clientId}&resource=${resource}&redirect_uri=${redirectUrl}`;
    }
  }

  private getToken(adfsTokenUrl: string, payload: string) {
    const observable = this.http.post(adfsTokenUrl, payload)
      .pipe(
        publishReplay(),
        refCount()
      );

    observable.subscribe(
      (json: Jwt) => {
        let access_token = json.access_token;
        try {
          const decodedToken = JSON.parse(this.jwtHelper.urlBase64Decode(json.access_token));
          if (decodedToken.proxy_token != null) {
            // this is actually a proxy token wrapper from ADFS not an access token
            // this will also never contain refresh tokens according to Microsoft spec
            access_token = decodedToken.access_token;
          }
        } catch (error) {
        }

        localStorage.setItem('id_token', access_token);
        if (localStorage.getItem('refresh_token') == null && json.refresh_token != null) {
          localStorage.setItem('refresh_token', json.refresh_token);
        }
        console.log('user roles: ' + this.jwtHelper.decodeToken(access_token).role);
        this.onAuthenticate.emit(access_token);
      },
      () => this.removeTokens()
    );

    return observable;
  }

  public isAuthenticated(): boolean {
    return localStorage.getItem('id_token') != null;
  }

  public logout() {
    this.removeTokens();
    this.redirectToLogoutUrl();
  }

  public removeTokens() {
    localStorage.removeItem('id_token');
    localStorage.removeItem('refresh_token');
  }

  private redirectToLogoutUrl() {
    const config = this.configService.getConfig();
    window.location.href = config['adfs.logout.url'];
  }
}
