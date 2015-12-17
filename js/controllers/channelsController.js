angular
.module('youtubeApp')
.controller('ChannelsController', ChannelsController);

ChannelsController.$inject = ['Channel', '$scope', '$document', '$window', '$stateParams', 'TokenService', 'YoutubeService'];

function ChannelsController(Channel, $scope, $document,  $window, $stateParams, TokenService, YoutubeService) {
  if(!TokenService.getToken()){
    $window.location = "/";
  }
  var socket = io.connect('https://wetube-api.herokuapp.com');
  var self = this;

  this.channel = {locked: false};
  self.message = {};
  self.messages = [];
  self.video = {};
  self.player = null;
  self.playlist = [];
  self.users = [];
  Channel.query(function(res){
    self.all = res.channels;
  });

  self.selectChannel = function(channelId) {
    Channel.get({ id: channelId }, function(res){
      self.selectedChannel = res;
      getUser = TokenService.getUser()._id;
      socket.emit('joinedRoom', $stateParams.channelId);
    });
  };
  socket.on('joinedRoom', function(){
    Channel.get({id:$stateParams.channelId}, function(res){
      self.selectedChannel = res;
      self.users = self.selectedChannel.channel.users;
      self.users.push(TokenService.getUser());
      self.channel = {users: self.users};
      Channel.update({id:$stateParams.channelId}, self.channel, function(newRes){
        console.log(newRes);
      });
    });
  });
  socket.on('leaveRoom', function(){
    Channel.get({id:$stateParams.channelId}, function(res){
      self.selectedChannel = res;
      console.log(self.users, self.selectedChannel.channel.users);
      self.users = self.selectedChannel.channel.users;
      index = self.users.indexOf(TokenService.getUser());
      self.users.splice(index, 1);
      self.channel = {users: self.users};
      Channel.update({id:$stateParams.channelId}, self.channel, function(newRes){
        console.log(newRes);
      });
    });
  })

  if($stateParams.channelId){
    self.selectChannel($stateParams.channelId);
  }

  self.playerAction = function(action, arg){
    if(!!self.player && !!self.player[action]){
      if(!arg){
        return self.player[action]();
      } else{
        return self.player[action](arg);
      }
    }
  };

  self.sendMessage = function() {
    socket.emit('message', $stateParams.channelId, TokenService.getUser().local.username, TokenService.getUser().local.image, self.message);
    self.message = "";
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
        // case 3:
        // self.playerAction("pauseVideo");
        // console.log('Pause Video');
        // break;
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

  socket.on('destroyVideo', function(video){
    $scope.$apply(self.playlist.splice(0,1));
    self.playerAction('destroy');
    $('playerContainer').append('<div id="player"></div>');
    self.player = null;
  });

  socket.on('nextPlaylist', function(){
    $scope.$apply(self.playlist.splice(0,1));
    console.log(self.playlist);
    socket.emit('nextVideo', $stateParams.channelId, self.playlist[0].videoId);
  });

  function onPlayerStateChange(event) {
    switch(event.data) {
      case YT.PlayerState.ENDED:
      if(self.playlist.length > 1){
        socket.emit('nextPlaylist', $stateParams.channelId);
      } else if(self.playlist.length === 1){
        socket.emit('destroyVideo', $stateParams.channelId);
      }
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
    if(!self.player) {
      console.log('INIT PLAYER');
      self.player = new YT.Player('player', {
        height: '480',
        width: '854',
        videoId: vidId,
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    }
  };

  socket.on('vidId', function(vid) {
    self.iframePlayer(vid);
  });

  socket.on('playlistUpdated', function(playlist){
    console.log("Video received");
    $scope.$apply(self.playlist.push(playlist));
    console.log(self.playlist[0].videoId);
    console.log(self.playlist);
    if(self.playlist.length === 1){
      playVideo(self.playlist[0].videoId);
    }
    // }else if(e){
    //   socket.emit('nextVideo', $stateParams.channelId, self.playlist[0].videoId);
    // }
  });

  function playVideo(vidId){
    socket.emit('vidId', $stateParams.channelId, vidId);
  }

  self.leaveRoom = function(id){
    socket.emit('leaveRoom', id);
    $window.location = '#/channels';
  };


  socket.on('message', function(user, img, msg) {
    console.log("Message received");
    $scope.$apply(self.messages.push({text: msg.text, username: user, image: img}));
    console.log(self.messages);
  });

  this.addChannel = function() {
    Channel.save(self.channel, function(channel) {
      console.log(channel);
      self.all.push(channel);
      self.channel = {users: [TokenService.getUser()], created_by: TokenService.getUser()._id};
      Channel.update({id: $stateParams.channelID}, self.channel);
      self.channel = {locked: false};
      $window.location = '#/channels/' + channel._id;
    });
  };

  this.deleteChannel = function(channel){
    Channel.delete({ id: channel._id });
    var index = self.all.indexOf(channel);
    self.all.splice(index, 1);
  };

  this.editChannel = function(channel){
    self.channel = channel;
  };

  this.lockRoom = function(channelId){
    console.log('clicked');
    console.log(channelId);
    Channel.get({ id: channelId }, function(res){
      self.channel = {locked: true};
      Channel.update({id: channelId}, self.channel, function(res){
        console.log(res);
      });
    });
  };

  this.updatePlaylists = function(videoId, title, imageUrl){
    updatePlaylist = {videoId: videoId, title: title, image: imageUrl};
    socket.emit('updatePlaylist', $stateParams.channelId, updatePlaylist);
  };

  //------------------- YOUTUBE SEARCH FUNCTIONALITY------------------------
  self.keyword = "";
  self.errorMsg = "";

  function goGoGoogle() {
    console.log('Calling API');
    gapi.client.setApiKey("AIzaSyBs4vDfTtUhDGjKd4fqJ2HhcMTcn0HTs78");
    gapi.client.load('youtube', 'v3').then(function() {
      $scope.$evalAsync(function() {
        self.search();
      },0);
    });
  }

  if(gApiLoaded) { goGoGoogle(); }

  $window.runGoogleApi = function(){
    goGoGoogle();
  };

  self.videos = [];

  self.search = function() {
    console.log('SEARCH');
    YoutubeService.search(self.keyword)
    .then(function(videos) {
      $scope.$evalAsync(function() {
        console.log(videos);
        if(videos.length === 0) {
          self.errorMsg = "No videos were found with the search term '" + self.keyword + "'. Please try again.";
        }
        else {
          self.errorMsg = "";
          self.videos = videos;
        }
        $('#newVid')[0].reset();
      },0);
    });
  };

   $('.commentWrapper').animate({ scrollTop: $(document).height() }, 'slow');
}
