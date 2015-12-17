angular
.module('youtubeApp', ['angular-jwt', 'ngResource', 'ui.router'])
.constant('API', 'https://wetube-api.herokuapp.com//api')
.config(function($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
})
.config(MainRouter);

function onYouTubeIframeAPIReady() {
  console.log("READY CAPTAIN!");
}

var gApiLoaded = false;
function initGoogleApi() {
  gApiLoaded = true;
  if(window.runGoogleApi) {
    window.runGoogleApi();
  }
}

MainRouter.$inject = ['$stateProvider', '$urlRouterProvider'];
function MainRouter($stateProvider, $urlRouterProvider){
  $stateProvider
  .state('login', {
    url: "/",
    templateUrl: "login.html"
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
