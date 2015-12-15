angular
  .module('youtubeApp')
  .factory('Channel', Channel);

Channel.$inject = ['$resource', 'API'];

function Channel($resource, API) {
  return $resource(API + '/channels/:id', null, {
  	'query': { method: "GET" },
    'update': { method: 'PUT'}
  });
}
