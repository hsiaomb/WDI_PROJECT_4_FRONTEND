angular
  .module('youtubeApp')
  .directive('youtube', youtubeDirective);

function youtubeDirective() {
  return {
    replace: true,
    restrict: 'E',
    templateUrl: 'youtubeView.html'
  };
}
