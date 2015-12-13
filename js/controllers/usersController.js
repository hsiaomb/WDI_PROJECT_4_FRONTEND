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

  self.sendVideo = function(){
    socket.emit('video', self.video);
  };


  if(self.isLoggedIn()) {
    self.getUsers();
    self.user = TokenService.getUser();
  }
}
