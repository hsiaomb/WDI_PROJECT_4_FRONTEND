angular
  .module('youtubeApp')
  .factory('User', User);

User.$inject = ['$resource', 'API'];

function User($resource, API) {

  return $resource(API + '/users/:id', null, {
  	'authorize': { method: "POST", url: API + '/login' },
  	'join': { method: "POST", url: API + '/register' },
  	'query': { method: "GET", isArray: false }
  });

}
