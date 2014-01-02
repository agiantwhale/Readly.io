'use strict';

angular
.module('raSystem', [])
.directive('fullscreen', function($window) {
    return function(scope, element) {
        element.css({
            'min-height': $window.innerHeight.toString() + 'px'
        });
    };
})
.directive('fill', function($window) {
    return function(scope, element) {
        element.css({
            'min-height': ($window.innerHeight - 120 - 300 - 50 - 60 + 10).toString() + 'px'
        });
    };
});