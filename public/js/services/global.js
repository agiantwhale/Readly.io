'use strict';

//Global service for global variables
angular.module('raSystem').factory('Global', [ '$window',
    function($window) {
        var _this = this;
        _this._data = {
            user: $window.user,
            authenticated: !! $window.user,
            verify: function() {
                if($window.user) {
                    if(!$window.user.verified && $window.location.pathname !== '/email') {
                        $window.location.href = '/email';
                    }
                }
            }
        };

        return _this._data;
    }
]);
