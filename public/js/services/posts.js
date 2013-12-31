'use strict';

angular.module('raPosts').factory('Posts', ['$resource', function($resource) {
    return $resource('posts/:postId', {
        postId: '@_id'
    });
}]);