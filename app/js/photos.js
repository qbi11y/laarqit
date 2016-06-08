var app = angular.module('Photos', []);

app.factory('Photos', ['$http', function($http) {
    var photos = {};
    photos.photos = [];
    photos.getVenuePhotos = function() {
        if (photos.photos.length === 0) {
            //call to the server
            $http.get('/manage/photos')
                .then(function(res) {
                    console.log('success', res);
                    photos.photos = res.data;
                }, function(err) {
                    console.log('error', err);
                })
        } 
        return photos.photos
    }
    return photos
}]);