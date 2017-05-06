angular.module('app', ['ngResource', 'ngRoute', 'angularMoment', 'infinite-scroll'])
.controller('MainController', ['$scope', '$resource', '$route', '$routeParams', '$location', function($scope, $resource, $route, $routeParams, $location) {

  $scope.Apology = $resource('/apology/:apologyId', {
    apologyId: '@id'
  });

  $scope.landingPage = function() {
    $location.path('/');
  };

  $scope.createApology = function() {
    $location.path('/create');
  };
}])

.controller('LandingController', ['$scope', '$resource', '$route', '$routeParams', '$location', function($scope, $resource, $route, $routeParams, $location) {

  $scope.page = 1;
  $scope.pageSize = 10;
  $scope.done = false;
  $scope.loading = false;

  $scope.apologies = $scope.Apology.query({
    limit: $scope.pageSize,
    sort: 'createdAt DESC'
  });

  $scope.viewApology = function(apology) {
    $location.path('/apology/' + apology.user.name.toLowerCase().split(' ').join('-') + '/' + apology.id);
  };

  $scope.nextPage = function() {
    if (!$scope.done && !$scope.loading) {
      $scope.loading = true;
      $scope.Apology.query({
        limit: $scope.pageSize,
        skip: $scope.pageSize * $scope.page,
        sort: 'createdAt DESC'
      }).$promise.then(function(apologies) {
        $scope.apologies = $scope.apologies.concat(apologies);
        $scope.page++;
        $scope.done = $scope.done || apologies.length === 0;
        $scope.loading = false;
      });
    }
  };
}])

.controller('CreateApologyController', ['$scope', '$route', '$routeParams', '$location', function($scope, $route, $routeParams, $location) {
  $scope.params = $routeParams;

  $scope.apologyId = $scope.params.apologyId;

  $scope.apology = $scope.apologyId ? $scope.Apology.get({
    apologyId: $scope.params.apologyId
  }) : new $scope.Apology();

  $scope.save = function() {
    $scope.apology.$save().then(function(apology) {
      return $scope.Apology.get({
        apologyId: apology.id
      }).$promise;
    }).then(function(apology) {
      $location.path('/apology/' + apology.user.name.toLowerCase().split(' ').join('-') + '/' + apology.id);
    }).catch(function(err) {
      $scope.error = err.data;
    });
  };
}])

.controller('ApologyController', ['$scope', '$route', '$routeParams', '$location', function($scope, $route, $routeParams, $location) {
  $scope.params = $routeParams;

  $scope.apology = $scope.Apology.get({
    apologyId: $scope.params.apologyId
  });
}])

.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider
  .when('/', {
      templateUrl : "/templates/index.html",
      controller: 'LandingController'
  })
 .when('/create', {
    templateUrl: '/templates/createApology.html',
    controller: 'CreateApologyController'
  })
 .when('/edit/:apologyId', {
    templateUrl: '/templates/createApology.html',
    controller: 'CreateApologyController'
  })
 .when('/apology/:user/:apologyId', {
    templateUrl: '/templates/apology.html',
    controller: 'ApologyController'
  });
}]);