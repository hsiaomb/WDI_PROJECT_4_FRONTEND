angular
  .module('youtubeApp')
  .controller('usersController', UsersController);

UsersController.$inject = ['User', 'TokenService', '$scope'];

function UsersController(User, TokenService, $scope) {
  // place this into a service
  var socket = io.connect('http://localhost:3000');
  var self = this;

  self.all    = [];
  self.user  = {};

  self.message = {};
  self.video = {};
  self.messages = [];

  socket.on('message', function(msg) {
    console.log("Message received");
    $scope.$apply(self.messages.push(msg.text));
    console.log(self.messages.length);
  });
  socket.on('playerState', function(state) {
    YT.PlayerState = state;
  });

  // socket.on('video', function(vid) {
  //   console.log("Video received");
  //   $scope.$apply(self.messages.push(msg.text));
  //   console.log(self.messages.length);
  // });
  function onPlayerStateChange(event) {
      switch(event.data) {
          case YT.PlayerState.ENDED:
              console.log('Video has ended.');
              break;
          case YT.PlayerState.PLAYING:
              console.log('Video is playing.');
              break;
          case YT.PlayerState.PAUSED:
              var playerState = 2;
              socket.emit('playerState', playerState);
              break;
          case YT.PlayerState.BUFFERING:
              console.log('Video is buffering.');
              break;
          case YT.PlayerState.CUED:
              console.log('Video is cued.');
              break;
      }
  }
  // -1 (unstarted)
  // 0 (ended)
  // 1 (playing)
  // 2 (paused)
  // 3 (buffering)
  // 5 (video cued).
  self.iframePlayer = function(vidId){
    $('#container').html('<iframe id="player_'+vidId+'" width="420" height="315" src="http://www.youtube.com/embed/' + vidId + '?enablejsapi=1&autoplay=1&autohide=1&showinfo=0" frameborder="0" allowfullscreen></iframe>');

    new YT.Player('player_'+vidId, {
        events: {
            'onStateChange': onPlayerStateChange
        }
      });
  };

  socket.on('vidId', function(vid) {
    self.iframePlayer(vid);
  });

  self.playVideo = function(vidId){
    console.log('click');
    socket.emit('vidId', vidId);
  };

  function handleLogin(res) {
    var token = res.token ? res.token : null;

    if(token) {
      self.getUsers();
      self.user = TokenService.getUser();
    }

    self.message = res.message;
  }

  self.authorize = function() {
    console.log(self.user);
    User.authorize(self.user, handleLogin);
  };

  self.join = function() {
    User.join(self.user, handleLogin);
  };

  self.disappear = function() {
    TokenService.removeToken();
    self.all = [];
    self.user = {};
  };

  self.getUsers = function() {
    User.query(function(data) {
      self.all = data.users;
    });
  };

  self.isLoggedIn = function() {
    return !!TokenService.getToken();
  };

  self.sendMessage = function() {
    socket.emit('message', self.message);
  };


  if(self.isLoggedIn()) {
    self.getUsers();
    self.user = TokenService.getUser();
  }
}
