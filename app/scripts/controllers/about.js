'use strict';

/**
 * @ngdoc function
 * @name simplexApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the simplexApp
 */
angular.module('simplexApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
