'use strict';

/**
 * @ngdoc function
 * @name simplexApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the simplexApp
 */
angular.module('simplexApp')
        .factory(
                "Simplex",
                function(trim) {
                    // Define the constructor function.
                    function Simplex() {
                        var tableaux = [
                            [0, 1, 3, 1, 0, 0, 6],
                            [0, -1, 1, 0, 1, 0, 1],
                            [0, 3, -1, 0, 0, 1, 6],
                            [1, -1, -2, 0, 0, 0, 0],
                        ];
                        this.tableaux= tableaux;
                    }


                    // Define the "instance" methods using the prototype
                    // and standard prototypal inheritance.
                    Simplex.prototype = {
                        solve: function() {

                            return(this);

                        },
                        getTableaux: function(){
                            return this.tableaux;
                        }
                    };


                    // Define the "class" / "static" methods. These are
                    // utility methods on the class itself; they do not
                    /* have access to the "this" reference.
                     Friend.fromFullName = function( fullName ) {
                     
                     var parts = trim( fullName || "" ).split( /\s+/gi );
                     
                     return(
                     new Friend(
                     parts[ 0 ],
                     parts.splice( 0, 1 ) && parts.join( " " )
                     )
                     );
                     
                     
                     };*/


                    // Return constructor - this is what defines the actual
                    // injectable in the DI framework.
                    return(Simplex);

                }
        )
        .value("trim", jQuery.trim)
.filter('range', function() {
  return function(input, total) {
    total = parseInt(total);
    for (var i=0; i<total; i++)
      input.push(i);
    return input;
  };
})



        .controller('MainCtrl', function($scope, Simplex) {
            $scope.awesomeThings = [
                'HTML5 Boilerplate',
                'AngularJS',
                'Karma'
            ];
            var a = [
            ];
            var c = [1, 2];
            var simplex = new Simplex();
            $scope.tab = simplex.getTableaux();
        });
