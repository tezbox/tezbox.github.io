"use strict";

// Declare app level module which depends on filters, and services
var app = angular.module('popup', [
  'ngRoute'
])

app.config(function($routeProvider) {
    console.log($routeProvider);
    $routeProvider
    .when("/create", {
        templateUrl : "views/create.html",
        controller : "CreateController",
    })
    .when("/unlock", {
        templateUrl : "views/unlock.html",
        controller : "UnlockController",
    })
    .when("/new", {
        templateUrl : "views/new.html",
        controller : "NewController",
    })
    .when("/restore", {
        templateUrl : "views/restore.html",
        controller : "RestoreController",
    })
    .when("/main", {
        templateUrl : "views/main.html",
        controller : "MainController",
    })
    .otherwise({
        redirectTo: '/new'
    });
});