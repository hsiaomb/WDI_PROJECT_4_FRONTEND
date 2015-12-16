angular
  .module('youtubeApp')
  .service('YoutubeService', YoutubeService);

YoutubeService.$inject = ['$q'];
function YoutubeService($q) {
  return {
    search: function(keyword) {

      return $q(function(resolve, reject) {

        gapi.client.youtube.search.list({
          part: 'snippet, id',
          q: keyword,
          maxResults: 50,
          type: 'video'
        }).execute(function(res) {

          if(res.code) return reject(res);

          else {
            var data = res.items.map(function(item) {
              return {
                videoId: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                date: new Date(item.snippet.publishedAt),
                imageUrl: item.snippet.thumbnails.high.url
              };
            });

            return resolve(data);
          }
        });

      });
    }
  };
}
