'use strict';

angular.module('raSystem').controller('HeaderController', ['$scope', 'Global', function ($scope, Global) {
    $scope.global = Global;
    
    $scope.isCollapsed = false;
}]);