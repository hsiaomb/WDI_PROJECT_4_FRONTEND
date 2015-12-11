angular
  .module('youtubeApp', ['angular-jwt', 'ngResource', 'ui.router'])
  .constant('API', 'http://localhost:3000/api')
  .config(function($httpProvider) {
  	$httpProvider.interceptors.push('AuthInterceptor');
  })
  .config(MainRouter);

MainRouter.$inject = ['$stateProvider', '$urlRouterProvider'];
function MainRouter($stateProvider, $urlRouterProvider){
	$stateProvider
		.state('home', {
			url: "/",
			templateUrl: "home.html"
		});

		$urlRouterProvider.otherwise('/');
}
