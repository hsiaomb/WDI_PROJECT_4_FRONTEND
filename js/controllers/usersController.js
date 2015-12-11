angular
  .module('labApp')
  .controller('usersController', UsersController);

UsersController.$inject = ['User', 'TokenService'];

function UsersController(User, TokenService) {
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
  }

  self.authorize = function() {
    console.log(self.user);
    User.authorize(self.user, handleLogin);
  }

  self.join = function() {
    User.join(self.user, handleLogin);
  }

  // self.disappear = function() {
  //   TokenService.removeToken();
  //   self.all = [];
  //   self.user = {};
  // }

  self.getUsers = function() {
    User.query(function(data) {
      self.all = data.users;
    });
  }

  self.isLoggedIn = function() {
    return !!TokenService.getToken();
  }

  if(self.isLoggedIn()) {
    self.getUsers();
    self.user = TokenService.getUser();
  }
}
