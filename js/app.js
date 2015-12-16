angular
.module('youtubeApp', ['angular-jwt', 'ngResource', 'ui.router'])
.constant('API', 'http://localhost:3000/api')
.config(function($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
})
.config(MainRouter);

function onYouTubeIframeAPIReady() {
  console.log("READY CAPTAIN!");
}

function runGoogleApi() {
  window.initGoogleApi();
}

MainRouter.$inject = ['$stateProvider', '$urlRouterProvider'];
function MainRouter($stateProvider, $urlRouterProvider){
  $stateProvider
  .state('home', {
    url: "/",
    templateUrl: "home.html"
  })
  .state('signup', {
    url: '/signup',
    templateUrl: 'signup.html'
  })
  .state('channels', {
    url: "/channels",
    templateUrl: "channels.html",
    controller: 'ChannelsController as channels'
  })
  .state('channel', {
    url: '/channels/:channelId',
    templateUrl: 'channel.html',
    controller: 'ChannelsController as channels'
  })
  .state('addChannel', {
    url: '/channel/start',
    templateUrl: 'addChannel.html',
    controller: 'ChannelsController as channels'
  });

  $urlRouterProvider.otherwise('/');
}
