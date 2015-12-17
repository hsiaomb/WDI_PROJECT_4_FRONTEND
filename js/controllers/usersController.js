angular
  .module('youtubeApp')
  .controller('usersController', UsersController);

UsersController.$inject = ['User', 'TokenService', '$scope', '$window', '$state'];

function UsersController(User, TokenService, $scope, $window, $state) {
  if(!!TokenService.getToken()){
    $window.location = '#/channels';
  }
  var self = this;

  self.all    = [];
  self.user  = {};

  function handleLogin(res) {
    var token = res.token ? res.token : null;

    if(token) {
      self.getUsers();
      self.user = TokenService.getUser();
    }

    self.message = res.message;
    $window.location = "#/channels";
  }

  self.authorize = function() {
    User.authorize(self.user, handleLogin);
  };

  self.join = function() {
    User.join(self.user, handleLogin);
  };

  self.logout = function() {
    TokenService.removeToken();
    self.all = [];
    self.user = {};
    $window.location = '/';
  };

  self.getUsers = function() {
    User.query(function(data) {
      self.all = data.users;
    });
  };

  self.isLoggedIn = function() {
    return !!TokenService.getToken();
  };

  if(self.isLoggedIn()) {
    self.getUsers();
    self.user = TokenService.getUser();
  }
}
