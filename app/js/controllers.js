var app = angular.module('Controllers', ['Photos', 'Locations', 'Accounts']);

app.controller('LoginController', ['$scope', '$state', 'Accounts', function($scope, $state, Accounts) {
  //Accounts.login({username: 'James', password: 'test'});
  Accounts.create({username: 'James', password: 'test'});
}]);

app.controller('ManageController', ['$scope', '$state', 'Photos', 'Locations', function($scope, $state, Photos, Locations) {
    $scope.Photos = Photos;
    $scope.Locations = Locations;
    $scope.locations = [];
    $scope.uploadedPhotos = [];
    Photos.getVenuePhotos();
    Locations.geoCode({address: '1201 Mercer St', city: 'Seattle', state: 'WA', zip: ''});
    //Locations.add({address: '6611 Clinton Manor Dr', city: 'Clinton', state: 'MD', zip: ''});
    //Locations.remove({address: '6611 Clinton Manor Dr', city: 'Clinton', state: 'MD', zip: ''});    
    
    $scope.$watch(function(scope) {
      return scope.Locations.latlng;
    }, function(newValue, oldValue) {
      console.log('location geo code', newValue)
    });

    $scope.$watch(function(scope) {
        return scope.Photos.photos;
    }, function(newValue, oldValue) {
        $scope.uploadedPhotos = newValue;
        console.log('photo array', $scope.uploadedPhotos);
    });

    $('.upload-btn').on('click', function (){
        $('#upload-input').click();
    });

    $('#upload-input').on('change', function(){

      var files = $(this).get(0).files;

      if (files.length > 0){
        // create a FormData object which will be sent as the data payload in the
        // AJAX request
        var formData = new FormData();

        // loop through all the selected files and add them to the formData object
        for (var i = 0; i < files.length; i++) {
          var file = files[i];

          // add the files to formData object for the data payload
          formData.append('uploads[]', file, file.name);
        }

        $.ajax({
          url: '/upload',
          type: 'POST',
          data: formData,
          processData: false,
          contentType: false,
          success: function(data){
                console.log('data after call', data);
                for (n=0; n < data.length; n++) {
                    $scope.$apply(function() {                
                        $scope.uploadedPhotos.push(data[n]);                
                    });
                }
          },
          xhr: function() {
            // create an XMLHttpRequest
            var xhr = new XMLHttpRequest();

            // listen to the 'progress' event
            xhr.upload.addEventListener('progress', function(evt) {

              if (evt.lengthComputable) {
                // calculate the percentage of upload completed
                var percentComplete = evt.loaded / evt.total;
                percentComplete = parseInt(percentComplete * 100);

                // update the Bootstrap progress bar with the new percentage
                $('.progress-bar').text(percentComplete + '%');
                $('.progress-bar').width(percentComplete + '%');

                // once the upload reaches 100%, set the progress bar text to done
                if (percentComplete === 100) {
                  $('.progress-bar').html('Done');
                }

              }

            }, false);

            return xhr;
          }
        });

      }
    });
}]);

app.controller('DetailsController', ['$scope', '$state', '$stateParams', 'Locations', function($scope, $state, $stateParams, Locations) {
  console.log($stateParams.id)
  console.log('current location', Locations.getCurrentLocation());
}]);

app.controller('IndexController', ['$scope', '$state', '$stateParams', 'Locations', function($scope, $state, $stateParams, Locations) {
    console.log('index controller');
    $scope.Locations = Locations;
    $scope.locations = [];
    Locations.search({location: 'Seattle, WA', cll: '47.62393669999999, -122.3326679'});
    $scope.showDetails = function(loc) {
      console.log('location details', loc);
      Locations.setCurrentLocation(loc);
      $state.go('details');
    }

    $scope.$watch(function(scope) {
      return scope.Locations.locations;
    }, function(newValue, oldValue) {
      if (newValue != oldValue) updateLocations(newValue);
    });

    function updateLocations(locs) {
      console.log('locations to work with', locs);
      var locations = locs.data.businesses;
      for (var n=0; n < locations.length; n++) {
        $scope.locations.push(locations[n]);
      }
      console.log('UI ready locations', $scope.locations);
    }
    
}])