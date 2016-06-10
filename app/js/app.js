var app = angular.module('AngularNode', ['Controllers', 'ui.router']);

app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('index', {
            url: '/',
            templateUrl: 'views/index.html',
            controller: 'IndexController'
        })

        .state('manage', {
            url: '/manage',
            templateUrl: 'views/manage.html',
            controller: 'ManageController'
        })

        .state('login', {
            url: '/login',
            templateUrl: 'views/login.html',
            controller: 'LoginController'
        })

        .state('create', {
            url: '/create',
            templateUrl: 'views/login.html',
            controller: 'LoginController'
        })

        .state('details', {
            url: '/details/:id',
            templateUrl: 'views/details.html',
            controller: 'DetailsController'
        })
})