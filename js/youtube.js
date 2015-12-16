var apikey = 'AIzaSyDYwPzLevXauI-kTSVXTLroLyHEONuF9Rw';

$(function() {
  var searchField = $('#search-input');

  $('#search-form').submit(function(e) {
    e.preventDefault();
  });

  // /* Alert VideoID */
  // $('#results').on('click','img[data-videoId]',function() {
  //   alert($(this).attr('data-videoId'));
  // });
  // /* End Alert VideoID */

});

function search() {
  $('#results').html('');

  q = $('#search-input').val();

  $.get(
    "https://www.googleapis.com/youtube/v3/search", {
      part: 'snippet, id',
      q: q,
      maxResults: 50,
      type: 'video',
      key: apikey
    },
    function(data) {
      $.each(data.items, function(i, item) {
        var output = getResults(item);

        $('#results').append(output);
      });
    });
  }

  function getResults(item) {
    var title = item.snippet.title;
    var thumb = item.snippet.thumbnails.high.url;
    var channelTitle = item.snippet.channelTitle;
    var videoID = item.id.videoId;

    var output = '<li>' +
    '<div class="list-left">' +
    '<img data-videoId="' + videoID + '" src="' + thumb + '">' +
    '</div>' +
    '<div class="list-right">' +
    '<h3>' + title + '</h3>' +
    '<p class="cTitle">' + channelTitle + '</p>' + '<button ng-click="updatePlaylists($stateParams.channelId, videoID, title)"> Add to Playlist</button>' +
    '</div>' +
    '</li>' +
    '<div class="clearfix"></div>' +
    '';

    return output;
  }
