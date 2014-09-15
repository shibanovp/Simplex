'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('simplexApp'));

  var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
/*
                        var tab = [
                            [0, 2, -1, 1, 0, 10],
                            [0, -1, 1, 0, 1, 8],
                            [1, -2, -1, 0, 0, 0]
                        ];
                        //DUAL
                        var tab = [
                            [0, -2, 1, 1, 0, -2],
                            [0, 1, -1, 0, 1, -1],
                            [1, 10, 8, 0, 0, 0]
                        ];
                        // x0 = 12, x1 = 28, opt = 800
                        var tab = [
                            [0, 5, 15, 1, 0, 0, 480],
                            [0, 4, 4, 0, 1, 0, 160],
                            [0, 35, 20, 0, 0, 1, 1190],
                            [1, -13, -23, 0, 0, 0, 0],
                        ];
                        
                         // unbounded
                         var tab = [
                         [0, -2, -9, 1, 9, 1, 0, 480],
                         [0, 1, 1, -1, -2, 0, 1, 160],
                         [1, -2, -3, -1, -12, 0, 0, 0],
                         ];
                         
                         var tab = [
                         [0, 2, -1, 1, 0, 2],
                         [0, -1, 1, 0, 1, 1],
                         [1, -10, -8, 0, 0, 0]
                         ];
                         var tab = [
                         [0, 1, 3, 1, 0, 0, 6],
                         [0, -1, 1, 0, 1, 0, 1],
                         [0, 3, -1, 0, 0, 1, 6],
                         [1, -1, -2, 0, 0, 0, 0],
                         ];*/