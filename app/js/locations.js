var app = angular.module('Locations', []);

app.factory('Locations', ['$http', function($http) {
    var locations = {};
    locations.latlng = {};
    locations.geoCode = function(address) {
        //var config = {};
        $http.post('/geoCode', address)
            .then(function(res) {
                if(res.data.results.length != 0) {
                    locations.latlng = res.data.results[0].geometry.location;
                    //console.log('Lat & Lng', locations.latlng);
                }
            }, function(res) {
                console.log('error', res);
            });
    };

    locations.search = function(params) {
        $http.post('/locations/search', params)
            .then(function(res) {
                console.log('success search', res);
            }, function(res) {
                console.log('error search', res);
            });
    }

    locations.add = function(data) {
        console.log('add location', data);
        $http.post('/locations/add', data)
            .then(function(res) {
                console.log('success add', res);
            }, function(res) {
                console.log('error add', res);
            });
    }

    locations.remove = function(data) {
        $http.post('/locations/remove', data)
            .then(function(res) {
                console.log('lets delete this shit', res);
                if (res.status == 200) {
                    console.log('successful deletion');
                    console.table(res.data);
                } else {
                    console.log('problem deleting');
                }
            }, function(res) {
                console.log('error remove', res);
            });
    }
    return locations
}])