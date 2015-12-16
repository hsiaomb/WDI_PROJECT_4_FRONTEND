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
  // var playlistItem;
  self.playlist = [];
  Channel.query(function(res){
    self.all = res.channels;
  });

  self.selectChannel = function(channelId) {
    Channel.get({ id: channelId }, function(res){
      self.selectedChannel = res;
      socket.emit('joinedRoom', $stateParams.channelId);
      // socket.emit('newUser', $stateParams.channelId);
      //
      // socket.on('newUser', function(){
      //   Channel.get({ id: $stateParams.channelId }, function(res){
      //     self.playerAction('cueVideoById', {videoID:res.channel.current_video});
      //     socket.on('newUserCurrentTime', function(time){
      //       playerAction('seekTo', time);});
      //     });
      //   });
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
        case 3:
        self.playerAction("pauseVideo");
        console.log('Pause Video');
        break;
      }
    }
  });

  socket.on('currentTime', function(time){
    self.playerAction("seekTo", time);
  });

  socket.on('nextVideo', function(video){
    self.playerAction('cueVideoById', {videoId: video, startSeconds: 0});
    self.playerAction('playVideo');
  });


  function onPlayerStateChange(event) {
    switch(event.data) {
      case YT.PlayerState.ENDED:
      Channel.get({ id: $stateParams.channelId }, function(res){
        if(res.channel.playlist.length > 1){
            self.selectedChannel.channel.playlist.splice(0,1);
            res.channel.playlist.splice(0,1);
            console.log(res.channel.playlist);
            newPlaylist = {playlist: res.channel.playlist, current_video: res.channel.playlist[0]};
            console.log(newPlaylist);
            Channel.update({id: $stateParams.channelId}, newPlaylist, function(newRes){
              console.log(newRes.channel.current_video);
              socket.emit('nextVideo', $stateParams.channelId, newRes.channel.current_video);
            });
        } else if(res.channel.playlist.length === 1){
          self.selectedChannel.channel.playlist.splice(0,1);
          res.channel.playlist.splice(0,1);
          console.log(res.channel.playlist);
          newPlaylist = {playlist: res.channel.playlist, current_video: res.channel.playlist[0]};
          console.log(newPlaylist);
          Channel.update({id: $stateParams.channelId}, newPlaylist, function(newRes){
            console.log(newRes.channel.current_video);
            socket.emit('stopVideo', $stateParams.channelId);
            socket.on('stopVideo', function(){
              self.playerAction('stopVideo');
              console.log('stopped')
              self.playerAction('destroy');
              console.log('cleared')
            });
          });
        }
      });
      break;
      case YT.PlayerState.PLAYING:
      socket.emit('playerState', $stateParams.channelId, YT.PlayerState.PLAYING);
      break;
      case YT.PlayerState.PAUSED:
      socket.emit('playerState', $stateParams.channelId, YT.PlayerState.PAUSED);
      break;
      case YT.PlayerState.BUFFERING:
      var currentTime = self.playerAction("getCurrentTime");
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

  function playVideo(vidId){
    socket.emit('vidId', $stateParams.channelId, vidId);
  }

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
      self.playerAction('playVideo', res.channel.current_video);
    });
  };

  this.updatePlaylists = function(channelId){
    Channel.get({ id: channelId }, function(res){
        self.selectedChannel = res;
        self.playlist = self.selectedChannel.channel.playlist;
        self.playlist.push(self.playlistItem);
        self.channel = {playlist: self.playlist};
        Channel.update({id: channelId}, self.channel, function(res){
          console.log('here');
          if(res.channel.playlist.length === 1){
            self.channel = {current_video: res.channel.playlist[0]};
            Channel.update({id: channelId}, self.channel, function(newRes){
              playVideo(newRes.channel.current_video);
            });
          }
        });
        self.playlist = [];
        self.playlistItem = '';
    });
  };
}
