angular
  .module('youtubeApp')
  .controller('ChannelsController', ChannelsController);

ChannelsController.$inject = ['Channel','$scope','$window', '$stateParams'];

function ChannelsController(Channel, $scope, $window, $stateParams) {
  var socket = io.connect('http://localhost:3000');
  var self = this;

  this.channel = {current_video: '', secret:''};
  self.message = {};
  self.messages = [];
  self.video = {};
  self.player = null;
  Channel.query(function(res){
    self.all = res.channels;
  });

  self.selectChannel = function(channelId) {
    Channel.get({ id: channelId }, function(res){
      self.selectedChannel = res;
      socket.emit('joinedRoom', $stateParams.channelId);
      self.playVideo(res.channel.current_video);
    });
  };

  if($stateParams.channelId){
    self.selectChannel($stateParams.channelId);
  }

  self.playerAction = function(action){
    if(!!self.player && !!self.player[action]){
      if(arguments.length == 1){
        return self.player[action]();
      } else{
        return self.player[action](arguments[1]);
      }

    }
  };

  self.sendMessage = function() {
    socket.emit('message', $stateParams.channelId, self.message);
  };

  socket.on('playerState', function(state) {
    if(!!self.player){
      switch(state) {
        case 1:
        self.playerAction("playVideo");
        console.log('Play Video');
        break;
        case 2:
        self.playerAction("pauseVideo");
        console.log('Pause Video');
        break;
      }
    }
  });

  socket.on('currentTime', function(time){
    self.playerAction("seekTo", time);
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
      var currentTime = self.playerAction("getCurrentTime");
      console.log("in buffering state", currentTime);
      socket.emit('currentTime', $stateParams.channelId, currentTime);
      break;
      case YT.PlayerState.CUED:
      console.log('Video is cued.');
      break;
    }
  }

  function onPlayerReady(event) {
    event.target.playVideo();
  }

  self.iframePlayer = function(vidId){
    self.player = new YT.Player('player', {
      height: '390',
      width: '640',
      videoId: vidId,
      events: {
        'onReady': onPlayerReady,
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

  self.leaveRoom = function(id){
    socket.emit('leaveRoom', id);
    $window.location = '#/channels';
  };

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

  this.updateCurrentVideo = function(){
    Channel.update({id: $stateParams.channelId}, self.channel, function(res){
      self.playVideo(res.channel.current_video);
    });
  };

}
