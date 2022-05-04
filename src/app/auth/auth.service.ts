import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { AngularFireAuth } from "angularfire2/auth";
import { Subject } from "rxjs";

import { AuthData } from "./auth-data.model";
import { User } from "./user.model";

@Injectable()
export class AuthService {
  authChange = new Subject<boolean>();
  private user: User;

  constructor(private router: Router, private auth: AngularFireAuth) {}

  registerUser(authData: AuthData) {
    this.auth.auth.createUserWithEmailAndPassword(
      authData.email,
      authData.password
      ).then(result => {
        console.log(result);
      })
       .catch(error => {
         console.log(error);
       });
  }

  login(authData: AuthData) {
    this.user = {
      email: authData.email,
      userid: Math.round(Math.random() * 10000).toString()
    };
    this.authSuccessfully();
  }

  logout() {
    this.user = null;
    this.authChange.next(false);
    this.router.navigate(['/login'])
  }

  getUser() {
    return {...this.user };
  }

  isAuth() {
    return this.user != null;
  }

  private authSuccessfully() {
    this.authChange.next(true);
    this.router.navigate(['/training'])
  }
}
