"use strict";

// Declare app level module which depends on filters, and services
var app = angular.module('popup', [
  'ngRoute',
  'angular-blockies',
  'monospaced.qrcode',
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
    .when("/send", {
        templateUrl : "views/send.html",
        controller : "SendController",
    })
    .when("/delegate", {
        templateUrl : "views/delegate.html",
        controller : "DelegateController",
    })
    .when("/qr", {
        templateUrl : "views/qr.html",
        controller : "QrController",
    })
    .when("/encrypt", {
        templateUrl : "views/encrypt.html",
        controller : "EncryptController",
    })
    .otherwise({
        redirectTo: '/new'
    });
});