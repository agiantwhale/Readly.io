'use strict';

angular
.module('raSystem', [])
.directive('fullscreen', function($window) {
    return function(scope, element) {
        element.css({
            'min-height': $window.innerHeight.toString() + 'px'
        });
    };
});