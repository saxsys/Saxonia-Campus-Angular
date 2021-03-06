# Saxonia Campus App built with Angular

Angular client with TypeScript for the Saxonia Campus conference management.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.6.5 and 
requires [Yarn](https://yarnpkg.com) to run. You should install both Yarn and the Angular CLI globally:
```
npm install -g yarn
npm install -g @angular/cli 
```

## Download dependencies

Run `yarn install` or simply `yarn` to resolve dependencies.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. 
Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Prepare your local dev environment

1. Copy your SSL certificate and key for your environment to the `/ssl` directory. Name them 
`server.crt` and `server.key` respectively.
2. Make a copy of `environments/environment.ts`, name it `environments/environment.<your_env>.ts` and adjust the 
properties to your local environment.
3. Open `angular.json` and add an environment entry mapping <your_env> to your environements.<your_env>.ts file.

## Build and run in dev environment

Run `yarn run proxy -c <your_env>` for serving the app and using it with a browser of your choice.
.
## Build distribution for environment

Run `yarn run build -c <target_env> --prod` to build a distribution into dist folder.
Run `create-campus.war.cmd` to pack a WAR file from this distribution. This command requires 7zip on the %PATH%.


