var ang = angular.module('editor', [])

ang.controller('MainCtrl', ["$scope", "userService", function($scope, userService) {

	$scope.u = userService;

	$scope.data = userService.data;
	$scope.world = userService.world;

	$scope.newLayer = userService.newLayer;
	$scope.loadLayer = userService.loadLayer;
	$scope.resizeLayer = userService.resizeLayer;

	$scope.getTileDisplay = function(t) {
		if ($scope.data.tiles[t]) {
			return {
				background: $scope.data.tiles[t].color
			}
		}
	}


	$scope.$watchCollection('world', function(newValue, oldValue) {
		console.log('worldChange')
		if (editor) {
			if (stage) {
				editor.drawOverlays();
				console.log(oldValue.rows)
				if((newValue.rows != oldValue.rows) ||
					(newValue.columns != oldValue.columns) ||
					(newValue.tileSize != oldValue.tileSize)) 
					{
						console.log('cha cha cha changes')
						$scope.u.resizeWorld();
					}
				
				$scope.data.world = newValue.world;
			}
		}
	})

	$scope.toggleGrid = function() {
		if (editor) {
			$scope.data.showGrid = !$scope.data.showGrid;
			editor.drawOverlays();
		}
	}
	//this needs to happen after editor is fully loaded.
	$scope.u.init();
}])

.controller('ToolCtrl', function($scope) {
	$scope.tools = ['sel', 'pnt', 'fll', 'ers'];

	$scope.selectTool = function(tawl) {
		$scope.data.selectedTool = tawl;
	}
})

.controller('EntityTileCtrl', function(userService, $scope) {
	$scope.newTile = userService.newTile;

	$scope.selectTile = function(t) {
		$scope.data.selectedTile = t;
		$scope.data.selectedTool='pnt'
	}
	$scope.selectObjectMode = function(m) {
		$scope.data.objectMode = m;
	}
})
	.controller('LayersCtrl', function(userService, $scope) {
		$scope.selectLayer = function(name) {
			$scope.data.activeLayer = name.toString();
		}

		$scope.deleteLayer = function(name) {
			userService.deleteLayer(name)
		}

	})

.controller('SelectedCtrl', function(userService, $scope) {
	$scope.changeActiveTileDisplayColor = function(color) {
		$scope.data.tiles[$scope.data.selectedTile].color = '#' + color.toString();
	}

	$scope.updateColor = function() {

		var col = document.getElementById('colorPickerBox').value

		$scope.changeActiveTileDisplayColor(col);
	}
});