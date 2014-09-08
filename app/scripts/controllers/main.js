'use strict';

/**
 * @ngdoc function
 * @name simplexApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the simplexApp
 */
angular.module('simplexApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
