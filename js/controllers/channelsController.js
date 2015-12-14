angular
  .module('youtubeApp')
  .controller('ChannelsController', ChannelsController);

ChannelsController.$inject = ['Channel','$scope','$window', '$stateParams'];

function ChannelsController(Channel, $scope, $window, $stateParams) {
  var socket = io.connect('http://localhost:3000');
  var self = this;

  this.channel = {};
  self.message = {};
  self.messages = [];
  self.video = {};

  Channel.query(function(res){
    self.all = res.channels;
  });

  function selectChannel() {
  Channel.get({ id: $stateParams.channelId }, function(res){
    self.selectedChannel = res;
    socket.emit('joinedRoom', $stateParams.channelId);
  });
  }
  selectChannel();

  self.sendMessage = function() {
    socket.emit('message', $stateParams.channelId, self.message);
  };

  socket.on('playerState', function(state) {
  switch(state) {
      case 1:
          player.playVideo();
          break;
      case 2:
          player.pauseVideo();
          break;
        }
      });

  socket.on('currentTime', function(time){
    player.seekTo(time);
  });


  function onPlayerStateChange(event) {
    switch(event.data) {
        case YT.PlayerState.ENDED:
            socket.emit('playerState', $stateParams.channelId, YT.PlayerState.ENDED);
            break;
        case YT.PlayerState.PLAYING:
            socket.emit('playerState', $stateParams.channelId, YT.PlayerState.PLAYING);
            break;
        case YT.PlayerState.PAUSED:
            socket.emit('playerState', $stateParams.channelId, YT.PlayerState.PAUSED);
            break;
        case YT.PlayerState.BUFFERING:
            var currentTime = player.getCurrentTime();
            socket.emit('currentTime', $stateParams.channelId, currentTime);
            break;
        case YT.PlayerState.CUED:
            console.log('Video is cued.');
            break;
    }
}

  self.iframePlayer = function(vidId){
    player = new YT.Player('player', {
      height: '390',
      width: '640',
      videoId: vidId,
      events: {
        'onStateChange': onPlayerStateChange
      }
    });
  };

  socket.on('vidId', function(vid) {
    self.iframePlayer(vid);
  });

  self.playVideo = function(vidId){
    socket.emit('vidId', $stateParams.channelId, vidId);
  };

  $scope.$on('$locationChangeStart', function( event ) {
    socket.emit('leaveRoom', $stateParams.channelId);
});

  socket.on('message', function(msg) {
    console.log("Message received");
    $scope.$apply(self.messages.push(msg.text));
    console.log(self.messages.length);
  });

  this.addChannel = function() {
      Channel.save(self.channel, function(channel) {
        self.all.push(channel);
        self.channel = {};
        $window.location = '#/channels/' + channel._id;
      });
  };

  this.deleteChannel = function(channel){
  Channel.delete({ id: channel._id });
  var index = self.channels.indexOf(channel);
  self.channels.splice(index, 1);
};

  this.editChannel = function(channel){
  self.channel = channel;
  };

}
