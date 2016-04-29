import {Injectable} from 'angular2/core';
import {Http, Response, Headers} from 'angular2/http';
import {Observable} from 'rxjs/Observable';
import {RestService} from './rest.service';
import {OAuth2Service} from './oauth2.service';
import {User} from '../model/user';
import {EmbeddedSlots} from '../model/embedded-slots';
import {Slot} from '../model/slot';
import {HypermediaResource} from '../model/hypermedia-resource';

@Injectable()
export class UserService {
    constructor (private _http: Http,
                 private _restService: RestService,
                 private _oauth2Service: OAuth2Service) {}

    getUser() {
        return this._restService.getRest()
            .flatMap((hypermediaResource: HypermediaResource) => {
                let link: string = 'currentUser';
                return Observable.defer(() => this._http.get(hypermediaResource._links[link].href, {headers: RestService.getAuthHeader()}))
                    .retryWhen(errors => errors.zip(Observable.range(1, 1), error => error)
                        .flatMap(error => {
                            if (error.status != 401) {
                                return Observable.throw('no automatic retry possible' + error.status);
                            }
                            // this will essentially automatically retry the request if it can
                            console.log('automatic currentUser retry');
                            return this._oauth2Service.doImplicitFlow(null);
                        }).delay(250)
                    )
                    .map(res => {
                        let user:User = <User> res.json();
                        if (res.json()._embedded == null) {
                            user._embedded = new EmbeddedSlots();
                            user._embedded.slots = [];
                        } else if (res.json()._embedded.slots.constructor != Array) {
                            user._embedded.slots = [<Slot> res.json()._embedded.slots];
                        }
                        return user;
                    })
            })
            .catch(UserService.handleError)
    }

    private static handleError (error: Response) {
        console.error(error);
        return Observable.throw(error || 'Server error');
    }
}
