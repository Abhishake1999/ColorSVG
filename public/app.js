angular.module('myApp', ['color.picker']).controller('myCtrl', ($scope, $http) => {
  $scope.background = 'E44949';
  $scope.accent = 'FFC600';
  $scope.generating = false;

  $scope.icons = [
    {
      id: 'vscode',
      name: 'Visual Studio Code',
      description: 'code development',
    },
    {
      id: 'atom',
      name: 'Atom',
      description: 'code development',
    },
    {
      id: 'sublime',
      name: 'Sublime Text',
      description: 'code development',
    },
    {
      id: 'digitalocean',
      name: 'DigitalOcean',
      description: 'code deployment',
    },
    {
      id: 'spotify',
      name: 'Spotify',
      description: 'music',
    }
  ];
  $scope.icon = {
    index: 0,
  };

  $scope.submit = function submit() {
    $scope.generating = true;

    const imageId = `icon-${$scope.icons[$scope.icon.index].id}`;
    let image = document.getElementById(imageId);
    image = image.outerHTML.replace('{{ background }}', $scope.background);
    image = image.replace(/{{ accent }}/g, $scope.accent);

    $http.post('/api/convert', { image }).then((res) => {
      $scope.generating = false;

      const fileName = res.data;
      window.location.href = `/api/download/${fileName}`;
    }, (err) => {
      console.log(err);
    });
  };

  $scope.pickerOptions = {
    alpha: false,
    format: 'hex',
    swatchOnly: true,
  };

  $scope.goNext = function goNext() {
    $scope.icon.index += 1;
    $scope.icon.animation = 'fade-in fade-right';
  };

  $scope.goPrevious = function goPrevious() {
    $scope.icon.index -= 1;
    $scope.icon.animation = 'fade-in fade-left';
  };
});
