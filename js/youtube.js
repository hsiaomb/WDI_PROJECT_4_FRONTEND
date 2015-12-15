function log(msg) {
    jQuery('#log').prepend(msg + '<br/>');
}

function onPlayerStateChange(event) {
    switch(event.data) {
        case YT.PlayerState.ENDED:
            log('Video has ended.');
            break;
        case YT.PlayerState.PLAYING:
            log('Video is playing.');
            break;
        case YT.PlayerState.PAUSED:
            log('Video is paused.');
            break;
        case YT.PlayerState.BUFFERING:
            log('Video is buffering.');
            break;
        case YT.PlayerState.CUED:
            log('Video is cued.');
            break;
    }
}

function onPlayerReady(event) {
  var embedCode = event.target.getVideoEmbedCode();
  event.target.playVideo();
}

$('Document').ready(function(){
    $('.video-thumb').click(function(){

        var vidId = $(this).attr('id');
        $('#container').html('<iframe id="player_'+vidId+'" width="420" height="315" src="http://www.youtube.com/embed/' + vidId + '?enablejsapi=1&autoplay=1&autohide=1&showinfo=0" frameborder="0" allowfullscreen></iframe>');

        new YT.Player('player_'+vidId, {
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    });
});
