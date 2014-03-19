var ang = angular.module('editor', [])

ang.controller('MainCtrl', function(userService, $scope) {

	$scope.data = {
		zen: false,
		selectedTool: 'sel',
		selectedTile: '',
		selectedEntity: '',
		showGrid: true,
		objectMode: 'tile',
		activeLayer: 'tiles1',
		layers: ['tiles1', 'entities1'],
		entities: ['wot'],
		tiles: tilesToLoad,
		scale: 1,
		showGrid: true,
		tweenTimes: {
			zen: 200
		},
	}

	config = $scope.data;

	$scope.world = {
		grid: [
			[]
		],
		tileSize: 40,
		rows: 20,
		columns: 20,
		oldRows: 20, //need to clear out tiles
		oldColumns: 20, //need to clear out tiles after ang changes
		scale: 1,
	}
	wld = $scope.world;

	$scope.$watchCollection('world', function(newValue, oldValue) {
		if (editor) {
			wld.rows = parseInt($scope.world.rows);
			wld.columns = parseInt($scope.world.columns);
			wld.tileSize = parseInt($scope.world.tileSize);
			if (stage) {
				if (editor) {
					resetGrid();
					centerCamera();
					drawOverlays();
				}
			}
		}
	})

	$scope.getTileDisplay = function(t) {
		if ($scope.data.tiles[t]) {
			return {
				background: $scope.data.tiles[t].color
			}
		}
	}

	$scope.toggleGrid = function() {
		if (editor) {
			$scope.data.showGrid = !$scope.data.showGrid;
			drawOverlays();
		}
	}
})

.controller('ToolCtrl', function($scope) {
	$scope.tools = ['sel', 'pnt', 'ers'];

	$scope.selectTool = function(tawl) {
		$scope.data.selectedTool = tawl;
	}
})

.controller('EntityTileCtrl', function(userService, $scope) {
	$scope.newTile = function() {
		var nt = {
			display: 'color',
			color: '0x000000'
		}
		var id = Object.keys($scope.data.tiles).length.toString();

		$scope.data.tiles[id] = nt;
	}
	$scope.selectTile = function(t) {
		$scope.data.selectedTile = t;
	}
	$scope.selectObjectMode = function(m) {
		console.log($scope.data.tiles)
		$scope.data.objectMode = m;
	}

})

.controller('ClassesAndInstancesCtrl', function(userService, $scope) {

});

ang.service('userService', function() {
	var me = this;

	this.selectTile = function(id) {
		me.data.selectedTile = id;
	}
})

ang.service('editorService', function() {

})