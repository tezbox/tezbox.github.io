"use strict";
var app = angular.module('popup', [
  'ngRoute',
])

app.config(function($routeProvider) {
    $routeProvider
    .when("/new", {
        templateUrl : "app/views/new.html",
        controller : "NewController",
    })
    .otherwise({
        redirectTo: '/new'
    });
});