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
var stage;
var renderer;
var editor;
var bunnyTexture
var gridContainer;
var tileTexture = PIXI.Texture.fromImage("img/tile.jpg");
var gridBorder;
var gridOverlay;
var editorUnderWorld;
var editorOverWorld;

$(document).ready(function() {
    editor = new Editor();
    centerCamera();
    resetGrid();
    drawOverlays();
    requestAnimationFrame(animate);

    function animate() {
        renderer.render(stage);
        requestAnimationFrame(animate);
    }
})

$(window).keydown(function(e) {
    //z
    if (e.keyCode == 90) {
        toggleZen();
    }

    if (e.keyCode == 16) {
        editor.scroll = true;
        $("canvas").css("cursor", "move")
    }
})

$(window).on("mousewheel", function(e) {
    if(config){
        config.scale += e.deltaY / 10.0;
        gridContainer.scale.x += e.deltaY / 10.0
        gridContainer.scale.y += e.deltaY / 10.0
    }
})

$(window).keyup(function(e) {
    if (e.keyCode == 16) {
        editor.scroll = false;
        $("canvas").css("cursor", "default")
    }
})

var toggleZen = function() {
    zen = !zen;
    if (zen) {
        $("#lpanel").animate({
            'left': '0px'
        }, config.tweenTimes.zen)
        $("#rpanel").animate({
            'right': '0px'
        }, config.tweenTimes.zen)
    } else {
        $("#lpanel").animate({
            'left': '-400px'
        }, config.tweenTimes.zen)
        $("#rpanel").animate({
            'right': '-400px'
        }, config.tweenTimes.zen)
    }
}

var Editor = function() {
    this.scroll = false;
    this.zen    = false;
    this.mouse  = {x: 0, y : 0}
    this.initialized = false;

    screenStats = detectScreen();
    gridContainer = new PIXI.Graphics();
    gridBorder  = new PIXI.Graphics();
    gridOverlay = new PIXI.Graphics();
    editorOverWorld = new PIXI.Graphics();
    editorUnderWorld = new PIXI.Graphics();
    renderer = new PIXI.autoDetectRenderer(screenStats.x, screenStats.y);

    $(window).resize(function() {
        screenStats = detectScreen();
        renderer.resize(screenStats.x, screenStats.y)
    })

    $("#renderContainer").mousedown(function(g) {
        //  scrolling = true;
    })
    $("#renderContainer").mouseup(function(g) {
        // scrolling = false;
    })

    $("#objectSearch").click(function(e) {
        e.currentTarget.value = "";
    })

    $("#renderContainer").mousemove(function(e) {
        if (editor.scroll) {
            gridContainer.x += e.clientX - editor.mouse.x
            gridContainer.y += e.clientY - editor.mouse.y;
        }
        editor.mouse.x = e.clientX;
        editor.mouse.y = e.clientY;
    })

    $("#colorPickerBox").change(function() {
        console.log("huh")
    })

    $("#renderContainer").append(renderer.view);
    stage = new PIXI.Stage;
    stage.setBackgroundColor("0x333333")

    editorUnderWorld.addChild(gridBorder);
    gridContainer.addChild(editorUnderWorld)

    editorOverWorld.addChild(gridOverlay);
    gridContainer.addChild(editorOverWorld);

    stage.addChild(gridContainer)

}

    function drawOverlays() {
        if(editor){
        if (stage) {
            gridBorder.clear();
            gridOverlay.clear();

            if (config.showGrid) {
                gridBorder.beginFill('0x000000', 1);

                //rx = gridContainer.x;
                // ry = gridContainer.y;
                var borderW = 10;
                //outlne

                //gridBorder.drawRect(0,200,800,800)
                console.log('wat')

                var rootX = -wld.tileSize * wld.columns / 2
                var rootY = -wld.tileSize * wld.rows / 2;

                gridBorder.drawRect(rootX - borderW / 2, rootY - borderW / 2, wld.columns * wld.tileSize + borderW, wld.rows * wld.tileSize + borderW);
                gridBorder.endFill();

                gridOverlay.clear();
                gridOverlay.lineStyle(2, '0x222222', 1);

                //vertical
                gridOverlay.moveTo(rootX, rootY)

                //horizontal
                for (var y = 0; y < wld.rows + 1; y++) {
                    //console.log(y)
                    gridOverlay.moveTo(rootX, rootY + y * wld.tileSize)
                    gridOverlay.lineTo(rootX + wld.tileSize * wld.columns, rootY + wld.tileSize * y)
                }

                //vertical
                for (var x = 0; x < wld.columns + 1; x++) {
                    //console.log(y)
                    gridOverlay.moveTo(x * wld.tileSize + rootX, rootY)
                    gridOverlay.lineTo(x * wld.tileSize + rootX, rootY + wld.tileSize * wld.rows)
                }
            }
        }
     }
    }

    function resetGrid() {
        if (stage) {
            // gridContainer.x = detectScreen().x / 2;
            // gridContainer.y = detectScreen().y / 2;
            /*
            while(gridContainer.children[0]){
               // gridContainer.removeChild(gridContainer.children[0])
            }*/
            //updateGridSprites();
        }
    }

    function updateGridSprites() {
        wld.grid = Array();
        for (var y = 0; y < wld.rows; y++) {
            wld.grid[y] = Array()
            for (var x = 0; x < wld.columns; x++) {
                wld.grid[y][x] = 'tile'
            }
        }
        //for every row
        for (var y = 0; y < wld.grid.length; y++) {
            //for every columnc
            for (var x = 0; x < wld.grid[0].length; x++) {
                var bunny = new PIXI.Sprite(tileTexture);
                bunny.width = wld.tileSize;
                bunny.height = wld.tileSize;
                bunny.x = x * wld.tileSize;
                bunny.y = y * wld.tileSize;
                gridContainer.addChild(bunny);
            }
        }
        centerCamera();
    }

    function centerCamera() {
        var totalX = wld.columns * wld.tileSize;
        var totalY = wld.rows * wld.tileSize;
        var scnCenter = detectScreen()

        gridContainer.x = scnCenter.x / 2;
        gridContainer.y = scnCenter.y / 2;
    }

    function detectScreen() {
        return {
            x: window.innerWidth,
            y: window.innerHeight
        };
    }
var Obj = function() {

}
 
var tilesToLoad = {
	air: {
		display: 'color',
		color: '#000FFF'
	},
	water: {
		display: 'color',
		color: '#00FaFF'
	},
	gnd: {
		display: 'color',
		color: '#00AFFF'
	},
	grs: {
		display: 'color',
		color: '#x0F0FFF'
	},
	sky: {
		display: 'color',
		color: '#F00FFF'
	},
	rod: {
		display: 'color',
		color: '#000F0F'
	}
}
var tools = {
	'paint' : 'blue',
	'select' : 'grey',
	'delete' : 'red'
}