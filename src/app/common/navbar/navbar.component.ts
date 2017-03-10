import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {OAuth2Service} from '../../shared/auth/oauth2.service';
import {JwtHelper} from 'angular2-jwt';

@Component({
    selector: 'campus-navbar',
    templateUrl: './navbar.component.html'
})
export class NavbarComponent {

    private username = '';
    private jwtHelper: JwtHelper = new JwtHelper();

    constructor(private _router: Router,
                private _oauth2Service: OAuth2Service) {
        this._oauth2Service.onAuthenticate.subscribe(token => {
            const decodedToken = this.jwtHelper.decodeToken(token);
            this.username = decodedToken.sub;
        });
    }

    isAuthenticated(): boolean {
        return this._oauth2Service.isAuthenticated();
    }

    logout() {
        this.username = '';
        this._oauth2Service.logout();
    }
}
