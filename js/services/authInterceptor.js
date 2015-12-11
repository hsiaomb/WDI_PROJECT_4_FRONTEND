angular
	.module('youtubeApp')
	.factory('AuthInterceptor', AuthInterceptor);

function AuthInterceptor(API, TokenService) {
	return {

		request: function(config) {
			var token = TokenService.getToken();
			if(config.url.match(API) && token) {
				config.headers.Authorization = 'Bearer ' + token;
			}
			return config;
		},

		response: function(res) {
			if(res.config.url.match(API) && res.data.token) {
				TokenService.saveToken(res.data.token);
			}
			return res;
		}
	};
}
