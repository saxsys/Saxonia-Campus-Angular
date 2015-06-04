'use strict'

###*
 # @ngdoc overview
 # @name campusApp
 # @description
 # # campusApp
 #
 # Main module of the application.
###
app = angular.module 'app', [
  'ngAnimate',
  'ngCookies',
  'ngResource',
  'ngRoute',
  'ngSanitize',
  'ngTouch',
  'ui.router',
  'ui.bootstrap',
  'angular-hal',
  'angularSpinner',
  'shared.navigationBar',
  'shared.login.controller',
  'components.home',
  'components.details'
]

app.factory 'AuthInterceptor', ['$rootScope', '$q', '$window', '$log', ($rootScope, $q, $window, $log) ->
  $rootScope.errorCount = 0

  request: (config) ->
    if $window.sessionStorage.token
      config.headers.authorization = 'Basic ' + $window.sessionStorage.token
    config

  responseError: (response) ->
    if response.status is 401
      $log.info 'broadcasting unauthenticated'
      $rootScope.$broadcast 'unauthenticated', {errorCount: $rootScope.errorCount++}
    response or $q.when(response)
]

app.config ['$stateProvider', '$urlRouterProvider', '$httpProvider', 'usSpinnerConfigProvider', ($stateProvider, $urlRouterProvider, $httpProvider, usSpinnerConfigProvider) ->
  $stateProvider.state 'home',
    url: '/home'
    templateUrl: 'scripts/components/home/homeView.html'

  $httpProvider.defaults.withCredentials = true

  $httpProvider.defaults.headers.get = {} if !$httpProvider.defaults.headers.get
  $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
  $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';

  $httpProvider.interceptors.push 'AuthInterceptor'

  usSpinnerConfigProvider.setDefaults {
    color: 'black'
    lines: 13
    length: 28
    radius: 42
    width: 14
    scale: 1
  }

  return
]

app.run ['$rootScope', '$state', '$log', 'halClient', ($rootScope, $state, $log, halClient) ->
  configureApi = () ->
    $rootScope.apiRoot = halClient.$get('http://campustest-saxsys.rhcloud.com/rest')
    $rootScope.apiRoot.then (apiRoot) ->
      apiRoot.$get('slots').then () ->
        if $state.is 'home'
          $log.info 'broadcasting reload'
          $rootScope.$broadcast 'reload'
        else
          $state.go 'home'
        return
      return
    return

  $rootScope.$on 'challengeAuth', configureApi
  configureApi()
  return
]

app.controller 'AppController', ['$rootScope', '$scope', '$state', '$modal', '$window', '$log', ($rootScope, $scope, $state, $modal, $window, $log) ->

  login = (event, args) ->
    delete $window.sessionStorage.token

    $modal.open
      animation: true
      templateUrl: 'scripts/shared/login/loginView.html'
      controller: 'LoginController'
      backdrop: 'static'
      resolve:
        errorCount: () ->
          args.errorCount
    return

  $scope.logout = () ->
    delete $window.sessionStorage.token
    $rootScope.errorCount = 0
    $log.info 'broadcasting clearAll'
    $rootScope.$broadcast 'clearAll'
    $log.info 'broadcasting challengeAuth'
    $rootScope.$broadcast 'challengeAuth'
    return

  $scope.isLoggedIn = () ->
    return $window.sessionStorage.token?

  $rootScope.$on 'unauthenticated', login
  return
]
