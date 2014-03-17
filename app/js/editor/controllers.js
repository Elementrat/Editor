var angApp = angular.module('editor',[]);

angApp.controller('ToolCtrl', function($scope){
	$scope.tools = [1,2,3,4] 
});

angApp.controller('EntityTileCtrl', function($scope){
	$scope.tiles = [1,2,3,4,5,6,7,8]
	$scope.newTile = function(){
		$scope.tiles.push($scope.tiles.length+1)
	}

	$scope.selectTile = function(tileID){
		console.log(tileID);

	}
})