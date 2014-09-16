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
                    {
                        this.table[rowIndex][i] /= denominator;
                    }
                },
                addRowToRow: function (addToIndex, addWhatIndex, multiplier) {
                    multiplier = typeof multiplier !== 'undefined' ? multiplier : 1; //Default 1
                    for (var i = 0; i < this.n; i++)
                    {
                        this.table[addToIndex][i] += this.table[addWhatIndex][i] * multiplier;
                    }
                },
                makeColumnBasis: function (columnIndex, rowIndex) {
                    var table = this.table;
//                    console.log(rowIndex,columnIndex)
                    this.divideRow(rowIndex, table[rowIndex][columnIndex]);
                    for (var j = 0; j < this.m; j++)
                    {
                        if (j === rowIndex) {
                            continue;
                        }
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
                    function Simplex(a, b, c, typeOfOptimization) {
                        var table = this.formTable(a, b, c, typeOfOptimization);
                        this.typeOfOptimization = typeOfOptimization;
                        this.tableau = new Tableau(table);
                        this.m = this.tableau.getM(); // always start from 1 cause of f(x) basis
                        this.n = this.tableau.getN(); // always end on m-1 cause of b vector
                        this.iterations = [];
                        this.result = this.solve();
                    }
                    // Define the 'instance' methods using the prototype
                    // and standard prototypal inheritance.
                    Simplex.prototype = {
                        formTable: function (a, b, c, typeOfOptimization) {
                            var tab = a;
                            var m = a.length;
                            for (var i = 0; i < m; i++) {
                                tab[i].unshift(0);//add zero first
                                tab[i].push(b[i]);//a
                            }
                            var objectiveCoefficients = [];
                            for (var i = 0; i < c.length; i++) { //solve objective function for min and max
                                objectiveCoefficients.push((typeOfOptimization === 'minimize') ? c[i] : -c[i]);
                            }
                            objectiveCoefficients.unshift((typeOfOptimization === 'minimize') ? -1 : 1);
                            for (var i = objectiveCoefficients.length - 1; i < tab[0].length - 1; i++) {
                                objectiveCoefficients.push(0);// add zeros to objective function
                            }
                            tab.push(objectiveCoefficients);
                            return tab;
                        },
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

                                    if (unfeasibleColumn === undefined)
                                        return 'unfeasible';
                                    this.tableau.makeColumnBasis(unfeasibleColumn, unfeasibleRow);
                                } while (!this.isFeasible())
                            }
                            var iteration;
                            if (!this.isOptimal()) {
                                var pivotColumn, pivotRow;
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
                                    if (pivotRow === undefined) {
                                        return 'unbounded';
                                    }
                                    this.tableau.makeColumnBasis(pivotColumn, pivotRow);
                                } while (!this.isOptimal())
                            }
                            this.tableau.getTableau();
                            iteration = {
                                table: this.tableau.getTableau()
                            };
                            this.iterations.push(Simplex.clone(iteration));
                            return (this.typeOfOptimization === 'minimize') ?
                                    -this.tableau.getTableau()[this.m - 1][this.n - 1] :
                                    this.tableau.getTableau()[this.m - 1][this.n - 1];
                        },
                        getIterations: function () {
                            return this.iterations;
                        },
                        getResult: function () {
                            return this.result;
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
                            var quotients = [];
                            var tableau = this.tableau.getTableau();
                            var b = this.n - 1; // Index for b vector
                            for (var j = 0; j < this.m - 1; j++) {
                                if (tableau[j][columnIndex] === 0)
                                    quotients.push(0);
                                else
                                    quotients.push(tableau[j][b] / tableau[j][columnIndex]);
                            }
                            var minIndex = undefined;
                            for (var i = 0; i < quotients.length; i++)
                                if (minIndex === undefined) {
                                    if (quotients[i] > 0)
                                        minIndex = i;
                                } else {
                                    if ((quotients[i] < quotients[minIndex]) && (quotients[i] > 0))
                                        minIndex = i;
                                }
                            return minIndex;
                        },
                        isFeasible: function () {
                            var tableau = this.tableau.getTableau();
                            var quotients = [];
                            for (var j = 0; j < this.m - 1; j++)
                                quotients.push(tableau[j][this.n - 1])
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
                    // Define the 'class' / 'static' methods. These are
                    // utility methods on the class itself; they do not
                    // have access to the 'this' reference.

                    Simplex.clone = function (src) {
                        return JSON.parse(JSON.stringify(src));
                    };
                    // Return constructor - this is what defines the actual
                    // injectable in the DI framework.
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
            $scope.operations = ['≤', '=', '≥'];
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
            });
            $scope.solve = function () {
                var n = $scope.conditions.numberOfVariables;
                var m = $scope.conditions.numberOfRestrictions;
                var item;
                var c = []; //objectiveFunctionCoefficients
                for (var i = 0; i < n; i++)
                {
                    item = parseFloat($scope.conditions.c[i]);
                    c.push(item);
                }
                var a = [];//Restrictions matrix
                var b = [];
                var row;
                for (var i = 0; i < m; i++) {
                    row = [];
                    for (var j = 0; j < n; j++) {
                        item = parseFloat($scope.conditions.a[i][j]);
                        row.push(item);
                    }
                    a.push(row);
                    item = parseFloat($scope.conditions.b[i]);
                    b.push(item);
                }// Analyse inequality sign
                for (var i = 0; i < m; i++) {
                    switch ($scope.conditions.operations[i]) {
                        case '≥':
                            for (var j = 0; j < n; j++) {
                                a[i][j] *= -1; //make inequality ≤
                            }
                            b[i] *= -1; // no break
                        case '≤':
                            for (var j = 0; j < m; j++) {
                                a[j].push((i === j) ? 1 : 0);// add surplus variable to a matrix
                            }
                            break;
                        default:// in case '=' do nothing 
                    }
                }
                var typeOfOptimization = $scope.conditions.optimization;
                var simplex = new Simplex(a, b, c, typeOfOptimization);
                $scope.iterations = simplex.getIterations();
                $scope.result = simplex.getResult();
                $scope.objF = $scope.getObjectiveFunction();
                $scope.restrictions = $scope.getRestrictions();
            };
            $scope.getObjectiveFunction = function () {
                var c = $scope.conditions.c;
                var n = $scope.conditions.numberOfVariables;
                var objFunction = 'f(x)=';
                for (var i = 0; i < n; i++) {
                    if ((i === 0)) {
                        objFunction += c[i] + 'x_{' + (i + 1) + '}';
                    } else if (i === n - 1) {
                        if (c[i] >= 0)
                            objFunction += '+';
                        objFunction += c[i] + 'x_{' + (i + 1) + '}';
                    }
                    else {
                        if (c[i] >= 0)
                            objFunction += '+';
                        objFunction += c[i] + 'x_{' + (i + 1) + '}';
                    }
                }
                objFunction += '→' + $scope.conditions.optimization;
                return objFunction;
            };
            $scope.getRestrictions = function () {
                var restrictions = '\\left\\{\\begin{matrix}';
                var n = $scope.conditions.numberOfVariables;
                var m = $scope.conditions.numberOfRestrictions;
                var b = $scope.conditions.b;
                var a = $scope.conditions.a;
                var op = $scope.conditions.operations;
                var restriction, item;
                for (var i = 0; i < m; i++) {
                    restriction = '';
                    for (var j = 0; j < n; j++) {
                        item = a[i][j];
                        if ((item >= 0) && (j !== 0)) {
                            restriction += '+' + item;
                        }
                        else {
                            restriction += item;
                        }
                        restriction += 'x_{' + (j + 1) + '}';
                    }
                    switch (op[i]) {
                        case '≥':
                            restriction += '\\geq';
                            break;
                        case '≤':
                            restriction += '\\leq';
                            break;
                        default:
                            restriction += '=';
                            break;
                    }
                    restriction += b[i] + '\\\\';
                    restrictions += restriction;
                }
                restrictions += '\\end{matrix}\\right.';
                return restrictions;
            }
        })
        .directive('mathjaxBind', function () {
            return {
                restrict: 'A',
                controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
                        $scope.$watch($attrs.mathjaxBind, function (value) {
                            var $script = angular.element('<script type="math/tex">')
                                    .html(value === undefined ? '' : value);
                            $element.html('');
                            $element.append($script);
                            MathJax.Hub.Queue(['Reprocess', MathJax.Hub, $element[0]]);
                        });
                    }]
            };
        })
        ;
