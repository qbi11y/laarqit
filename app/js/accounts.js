var app = angular.module('Accounts', []);

app.factory('Accounts', ['$http', function($http) {
    var accounts = {};
    accounts.login = function(data) {
        $http.post('/login', data)
            .then(function(res) {

            }, function(res) {

            })
    };

    accounts.create = function(data) {
        $http.post('/create', data)
            .then(function(res) {

            }, function(res) {

            });
    }

    return accounts
}]);