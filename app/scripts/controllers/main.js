'use strict';
/**
 * @ngdoc function
 * @name simplexApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the simplexApp
 */
angular.module('simplexApp')
        .factory('Tableau', function () {
            function Tableau(tab) {
                this.table = tab;
                this.m = tab.length; // rows
                this.n = tab[0].length; // columns
            }
            Tableau.prototype = {
                getTableau: function () {
                    return this.table;
                },
                getM: function () {
                    return this.m;
                },
                getN: function () {
                    return this.n;
                },
                divideRow: function (rowIndex, denominator) {
                    for (var i = 0; i < this.n; i++)
                        this.table[rowIndex][i] /= denominator;
                },
                addRowToRow: function (addToIndex, addWhatIndex, multiplier) {
                    multiplier = typeof multiplier !== 'undefined' ? multiplier : 1; //Default 1
                    for (var i = 0; i < this.n; i++)
                        this.table[addToIndex][i] += this.table[addWhatIndex][i] * multiplier;
                },
                makeColumnBasis: function (columnIndex, rowIndex) {
                    var table = this.table;
//                    console.log(rowIndex,columnIndex)
                    this.divideRow(rowIndex, table[rowIndex][columnIndex]);
                    for (var j = 0; j < this.m; j++)
                    {
                        if (j === rowIndex)
                            continue;
                        var a = (-1) * table[j][columnIndex]; //For elimination 
                        //if (a==-1) a=a*(-1);
                        this.addRowToRow(j, rowIndex, a);
                        //console.log([j, rowIndex, a])
                    }
                }
            };
            return(Tableau);
        })
        .factory(
                'Simplex',
                function (Tableau) { // Tableau is dependency
                    // Define the constructor function.
                    function Simplex(conditions) {
                        this.conditions = conditions;
                        var a = [
                            [1, 3],
                            [-1, 1],
                            [3, -1]
                        ];
                        //var b = [6,1,6,0];
                        var tab = [
                            [0, 2, -1, 1, 0, 10],
                            [0, -1, 1, 0, 1, 8],
                            [1, -2, -1, 0, 0, 0]
                        ];
                        /*DUAL*/
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

                        /*
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
                        this.tableau = new Tableau(tab);
                        this.m = this.tableau.getM(); // always start from 1 cause of f(x) basis
                        this.n = this.tableau.getN(); // always end on m-1 cause of b vector
                        this.iterations = [];
                        this.solve();
                    }


                    // Define the "instance" methods using the prototype
                    // and standard prototypal inheritance.
                    Simplex.prototype = {
                        solve: function () {
                            if (!this.isFeasible()) {
                                var unfeasibleRow, unfeasibleColumn;
                                unfeasibleRow = this.findUnfeasibleRow();
                                unfeasibleColumn = this.findUnfeasibleColumn(unfeasibleRow);
                                do {
                                    unfeasibleRow = this.findUnfeasibleRow();
                                    unfeasibleColumn = this.findUnfeasibleColumn(unfeasibleRow);
                                    iteration = {
                                        table: this.tableau.getTableau(),
                                        pivot: {
                                            column: unfeasibleColumn,
                                            row: unfeasibleRow
                                        },
                                        quotients: [2, 3, 4]
                                    };
                                    this.iterations.push(Simplex.clone(iteration));
                                    this.tableau.makeColumnBasis(unfeasibleColumn, unfeasibleRow);
                                } while (!this.isFeasible())
                            }
                            var i = 1
                            if (!this.isOptimal()) {
                                var pivotColumn, pivotRow, iteration;
                                do {
                                    pivotColumn = this.findPivotColumnIndex();
                                    pivotRow = this.findPivotRowIndex(pivotColumn);
                                    iteration = {
                                        table: this.tableau.getTableau(),
                                        pivot: {
                                            column: pivotColumn,
                                            row: pivotRow
                                        },
                                        quotients: [2, 3, 4]
                                    };
                                    this.iterations.push(Simplex.clone(iteration));
                                    //console.log(this.iterations)
                                    if (pivotRow === undefined)
                                        return alert('unbounded');
//
                                    this.tableau.makeColumnBasis(pivotColumn, pivotRow)
                                    i++;
                                    if (i > 10)
                                        break;
                                } while (!this.isOptimal())


                            }
                            this.tableau.getTableau();
                            var iteration = {
                                table: this.tableau.getTableau()
                            };
                            this.iterations.push(Simplex.clone(iteration));



                            /*var pivotColumn,pivotRow,iteration;
                             do {
                             pivotColumn = this.findPivotColumnIndex();
                             pivotRow = this.findPivotRowIndex(pivotColumn);
                             iteration = {
                             table: this.tableau,
                             pivot: {
                             column: pivotColumn,
                             row: pivotRow
                             },
                             quotients: [2, 3, 4]
                             }; 
                             if (this.isOptimal()) {
                             iteration = {}
                             break;
                             }
                             this.iterations.push(Simplex.clone(iteration));
                             
                             } while (!this.isOptimal())
                             
                             
                             
                             
                             if (!this.isOptimal())
                             {
                             var pivotColumn = this.findPivotColumnIndex();
                             var pivotRow = this.findPivotRowIndex(pivotColumn);
                             
                             var pivot = {
                             row: pivotRow,
                             column: pivotColumn
                             }
                             }
                             var tableaux = {
                             table: this.tableau,
                             pivot: pivot,
                             quotients: [
                             2, 3, 4
                             ]
                             };
                             var it = [];
                             it.push(Simplex.clone(tableaux));
                             var t = new Tableau(this.tableau);
                             t.makeColumnBasis(pivotColumn,pivotRow)
                             tableaux.table = t.getTableau();
                             it.push(Simplex.clone(tableaux));
                             this.iterations = it;
                             this.isOptimal();*/
                        },
                        getIterations: function () {
                            return this.iterations;
                        },
                        isOptimal: function () {
                            var table = this.tableau.getTableau();
                            for (var i = 1; i < this.n - 1; i++)
                                if (table[this.m - 1][i] < 0)
                                    return 0;
                            return 1;
                        },
                        findPivotColumnIndex: function () {
                            var minIndex = 1;
                            var vector = this.tableau.getTableau()[this.m - 1];
                            for (var i = 1; i < this.n - 1; i++) {
                                if (vector[i] < vector[minIndex])
                                    minIndex = i;
                            }
                            return minIndex;
                        },
                        findPivotRowIndex: function (columnIndex) {
                            //console.log([columnIndex])
                            var quotients = [];
                            var tableau = this.tableau.getTableau();
                            var b = this.n - 1; // Index for b vector
                            for (var j = 0; j < this.m - 1; j++)
                                quotients.push(tableau[j][b] / tableau[j][columnIndex]);
                            var minIndex = undefined;
                            //console.log(tableau)
                            for (var i = 0; i < quotients.length; i++)
                                if (minIndex === undefined) {
                                    if (quotients[i] > 0)
                                        minIndex = i;
                                } else {
                                    if ((quotients[i] < quotients[minIndex]) && (quotients[i] > 0))
                                        minIndex = i;
                                }
                            //console.log(minIndex)
                            return minIndex;
                            /*
                             var minIndex = 1;
                             var vector = this.tableau[this.m - 1];
                             for (var i = 1; i < this.n - 1; i++) {
                             if (vector[i] < vector[minIndex])
                             minIndex = i;
                             }
                             return minIndex;
                             */
                        },
                        isFeasible: function () {
                            var tableau = this.tableau.getTableau();
                            var quotients = [];
                            for (var j = 0; j < this.m - 1; j++)
                                quotients.push(tableau[j][this.n - 1])
                            //console.log(quotients);
                            for (var i = 0; i < quotients.length; i++)
                                if (quotients[i] < 0)
                                    return 0;
                            return 1;
                        },
                        findUnfeasibleRow: function () {
                            var tableau = this.tableau.getTableau();
                            var quotients = [];
                            for (var j = 0; j < this.m - 1; j++)
                                quotients.push(tableau[j][this.n - 1])
                            for (var i = 0; i < quotients.length; i++)
                                if (quotients[i] < 0)
                                    return i;
                            return undefined;
                        },
                        findUnfeasibleColumn: function (unfeasibleRow) {
                            var tableau = this.tableau.getTableau();
                            for (var i = 1; i < this.n - 1; i++)
                                if (tableau[unfeasibleRow][i] < 0)
                                    return i;
                            return undefined;
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
                    Simplex.clone = function (src) {
                        return JSON.parse(JSON.stringify(src));
                    };
                    return(Simplex);
                }
        )
        .filter('range', function () {
            return function (input, total) {
                total = parseInt(total);
                for (var i = 0; i < total; i++)
                    input.push(i);
                return input;
            };
        })



        .controller('MainCtrl', function ($scope, Simplex) {
            $scope.awesomeThings = [
                'HTML5 Boilerplate',
                'AngularJS',
                'Karma'
            ];
            $scope.operations = [
                {name: '≤'},
                {name: '='},
                {name: '≥'},
            ];
            //$scope.conditions={}

            //$scope.conditions.operations = $scope.operations[0]

            $scope.$watch('conditions.numberOfVariables', function (newValue, oldValue) {
                var c = $scope.conditions.c;

                if (newValue !== null && c !== undefined) {
                    for (var i = newValue; i < c.oldValue; i++) {
                        delete c[i];
                    }
                    var a = $scope.conditions.a;
                    for (var i = 0; i < $scope.conditions.numberOfRestrictions; i++)
                        for (var j = newValue; j < c.oldValue; j++)
                            delete a[i][j];
                    c.oldValue = newValue;
                }
                //$scope.solve();
            });
            $scope.$watch('conditions.numberOfRestrictions', function (newValue, oldValue) {
                var a = $scope.conditions.a;
                var b = $scope.conditions.b;
                var o = $scope.conditions.operations;
                if (newValue !== null && a !== undefined) {
                    for (var i = newValue; i < a.oldValue; i++) {
                        delete a[i];
                        delete b[i];
                        delete o[i];
                    }
                    a.oldValue = newValue;
                }

                //alert(newValue);
                //
                //$scope.conditions.numberOfVariables = 0;
                //$scope.conditions.numberOfVariables = newValue;
                //$scope.solve();
            });
            $scope.solve = function () {
                
                // first column(f(x) in basis)
                var typeOfOptimization = $scope.conditions.optimization;
                var n = $scope.conditions.numberOfVariables;
                var m = $scope.conditions.numberOfRestrictions;
                var item;
                var c = [];//objectiveFunctionCoefficients
                for (var i = 0; i < n; i++)
                {
                    item = parseFloat($scope.conditions.c[i]);
                    c.push(item);
                }
                var a = [];
                var b = [];
                var row;
                for (var i = 0; i < m; i++){
                    row = [];
                    for (var j = 0; j < n; j++){
                        item = parseFloat($scope.conditions.a[i][j]);
                        row.push(item)
                    }
                    a.push(row);
                    item = parseFloat($scope.conditions.b[i]);
                    b.push(item);
                }
                for (var i = 0; i < m; i++){
                    
                }
                    
                        
                
                
                console.log(b)
                //var simplex = new Simplex($scope.optimization);
                //$scope.iterations = simplex.getIterations();
            }
            //$scope.solve();

        })
        .directive('numberOnlyInput', function () {
            return {
                restrict: 'EA',
                scope: {
                    inputValue: '=',
                    inputName: '='
                },
                link: function (scope) {
                    scope.$watch('inputValue', function (newValue, oldValue) {
                        var arr = String(newValue).split("");
                        if (arr.length === 0)
                            return;
                        if (arr.length === 1 && (arr[0] == '-' || arr[0] === '.'))
                            return;
                        if (arr.length === 2 && newValue === '-.')
                            return;
                        if (isNaN(newValue)) {
                            scope.inputValue = oldValue;
                        }
                    });
                }
            };
        });
;
