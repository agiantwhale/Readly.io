'use strict';

angular.module('raPosts').controller('PostsController', ['$scope', '$routeParams', '$location', 'Global', 'Posts', function($scope, $routeParams, $location, Global, Posts) {
    $scope.global = Global;

    $scope.remove = function(post) {
        post.$remove();

        for (var i in $scope.posts) {
            if ($scope.posts[i] === post) {
                $scope.posts.splice(i, 1);
            }
        }
    };

    $scope.find = function() {
        Posts.query(function(posts) {
            $scope.posts = posts;
        });
    };
}]);