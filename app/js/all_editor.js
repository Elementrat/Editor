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
var stage;
var renderer;
var editor;
var user;
var textures = {}
var testResources = {};

$(document).ready(function() {
    textures.empty = PIXI.Texture.fromImage("img/tile_empty.png");
    textures.basic = PIXI.Texture.fromImage("img/tile.jpg");
    textures.testTex = PIXI.Texture.fromImage("img/tile_test.png")
    editor = new Editor();

    user = angular.element(document.querySelector('[ng-controller]')).injector().get('userService')

    editor.centerCamera();
    editor.drawOverlays();
    requestAnimationFrame(animate);

    function animate() {
        renderer.render(stage);
        requestAnimationFrame(animate);
    }
})


var Editor = function() {
    gridContainer = new PIXI.Graphics();
    gridBorder = new PIXI.Graphics();
    gridOverlay = new PIXI.Graphics();
    editorUnderWorld = new PIXI.Graphics();
    editorOverWorld = new PIXI.Graphics();
    cellHighlight = new PIXI.Graphics();

    this.displays = {
        gridContainer: gridContainer,
        gridBorder: gridBorder,
        gridOverlay: gridOverlay,
        editorUnderWorld: editorUnderWorld,
        editorOverWorld: editorOverWorld,
        cellHighlight: cellHighlight
    }

    screenStats = detectScreen();

    renderer = new PIXI.autoDetectRenderer(screenStats.x, screenStats.y);
    $("#renderContainer").append(renderer.view);

    stage = new PIXI.Stage;
    stage.setBackgroundColor("0x222222")

    editorUnderWorld.addChild(gridBorder);
    gridContainer.addChild(editorUnderWorld)

    //Tiles and Entities go in layers
    gridContainer.layerList = new PIXI.Graphics();
    gridContainer.addChild(gridContainer.layerList)

    editorOverWorld.addChild(gridOverlay);
    editorOverWorld.addChild(cellHighlight);

    gridContainer.addChild(editorOverWorld);

    stage.addChild(gridContainer)
    listenToEvents();
    //document.getElementById("mainBody").requestFullscreen();

    this.toggleZen = function() {
        user.data.zen = !user.data.zen;
        if (!user.data.zen) {
            $("#lpanel").animate({
                'left': '0px'
            }, user.data.tweenTimes.zen)
            $("#rpanel").animate({
                'right': '0px'
            }, user.data.tweenTimes.zen)
        } else {
            $("#lpanel").animate({
                'left': '-400px'
            }, user.data.tweenTimes.zen)
            $("#rpanel").animate({
                'right': '-400px'
            }, user.data.tweenTimes.zen)
        }
    }

    this.centerCamera = function() {
        var totalX = user.world.columns * user.world.tileSize;
        var totalY = user.world.rows * user.world.tileSize;
        var scnCenter = detectScreen()
        gridContainer.x = scnCenter.x / 2;
        gridContainer.y = scnCenter.y / 2;
    }


    this.updateMousePos = function(x, y) {
        if ((x != -1) && (y != -1)) {
            if (user.data.mouse.down) {
                if ((this.xPos != x) || (this.yPos != y)) {
                    if (user.data.selectedTool == 'pnt') {
                        user.paintTile(x, y);
                    }
                    if (user.data.selectedTool == 'ers') {
                        user.eraseTile(x, y);
                    }
                }
            }
        }
        this.xPos = x;
        this.yPos = y;
    }


    this.drawOverlays = function() {
        if (editor) {
            if (stage) {
                gridBorder.clear();
                gridOverlay.clear();

                var borderW = 10;
                var rootX = -user.world.tileSize * user.world.columns / 2
                var rootY = -user.world.tileSize * user.world.rows / 2;

                var tSize = user.world.tileSize;


                //cell highlight
                if (editor.xPos != -1 && editor.yPos != -1) {
                    cellHighlight.clear();
                    if (!user.data.selecting) {

                        cellHighlight.lineStyle(2, '0xFFFFFF', 1)
                        cellHighlight.moveTo(rootX + left * tSize, rootY + top * tSize)
                        cellHighlight.drawRect(rootX + editor.xPos * tSize, rootY + editor.yPos * tSize, tSize, tSize);
                    }

                    if (user.data.selecting) {
                        xSide = 0;
                        ySide = 0;

                        cellHighlight.lineStyle(2, '0xFFFFFF', 1)
                        var left = Math.min(editor.xPos, editor.selectionRootXPos);
                        var top = Math.min(editor.yPos, editor.selectionRootYPos);

                        if (editor.xPos > editor.selectionRootXPos) {
                            xSide = 1; //on the right
                        }

                        if (editor.yPos > editor.selectionRootYPos) {
                            ySide = 1;
                        }


                        var bottom = Math.max(editor.yPos, editor.selectionRootYPos);
                        var right = Math.max(editor.xPos, editor.selectionRootXPos);

                        var width = Math.abs(right - left);
                        var height = Math.abs(bottom - top);

                        width += 1;
                        height += 1;

                        cellHighlight.moveTo(rootX + left * tSize, rootY + top * tSize)
                        cellHighlight.drawRect(rootX + left * tSize, rootY + top * tSize, width * tSize, height * tSize);
                    }
                }

                if (user.data.showGrid) {
                    gridBorder.beginFill('0x111111', 1);
                    gridBorder.lineStyle(borderW / 2, '0x000000', 1)
                    //outlne
                    gridBorder.drawRect(rootX - borderW / 2, rootY - borderW / 2, user.world.columns * tSize + borderW, user.world.rows * tSize + borderW);
                    gridBorder.endFill();

                    gridOverlay.clear();
                    gridOverlay.lineStyle(2, '0x333333', 1);

                    //vertical
                    gridOverlay.moveTo(rootX, rootY)

                    //horizontal
                    for (var y = 0; y < user.world.rows + 1; y++) {
                        //console.log(y)
                        gridOverlay.moveTo(rootX, rootY + y * tSize)
                        gridOverlay.lineTo(rootX + tSize * user.world.columns, rootY + tSize * y)
                    }

                    //vertical
                    for (var x = 0; x < user.world.columns + 1; x++) {
                        //console.log(x)
                        gridOverlay.moveTo(x * tSize + rootX, rootY)
                        gridOverlay.lineTo(x * tSize + rootX, rootY + tSize * user.world.rows)
                    }
                }
            }
        }
    }
}

    function detectScreen() {
        return {
            x: window.innerWidth,
            y: window.innerHeight
        };
    }

    function hashToHex(hash) {
        return '0x' + hash.substring(1, hash.length);
    }
var keydown = function(e) {

	//z
	if (e.keyCode == 90) {
		editor.toggleZen();
	}


	if(e.keyCode==71){
		//need to fix event here
		user.data.showGrid = !user.data.showGrid;
		editor.drawOverlays();
	}

	//shift
	if (e.keyCode == 16) {
		user.data.scroll = true;
		$("canvas").css("cursor", "move")
	}
}

var mousewheel = function(e) {
	gridContainer.scale.x += e.deltaY / 10.0
	gridContainer.scale.y += e.deltaY / 10.0
}

var listenToEvents = function() {

	 $(window).resize(function() {
	 	screenStats = detectScreen();
	 	renderer.resize(screenStats.x, screenStats.y)
	})

	$(window).keydown(keydown)

	$(window).on("mousewheel", mousewheel)


	$(window).keyup(function(e) {
		if (e.keyCode == 16) {
			user.data.scroll = false;
			$("canvas").css("cursor", "default")
		}
	})


	$("#renderContainer").mousedown(function(g) {
		user.data.mouse.down = true;;
		if (user.data.selectedTool == 'sel') {
			user.data.selecting = true;
			if ((editor.xPos != -1) && (editor.yPos != -1)) {
				editor.selectionRootXPos = editor.xPos;
				editor.selectionRootYPos = editor.yPos;
			}
		}
		var pos = getMousePos()
		editor.updateMousePos(pos.x,pos.y)
	})
	$("#renderContainer").mouseup(function(g) {
		user.data.mouse.down = false;
		if (user.data.selectedTool == 'sel') {
			user.data.selecting = false;
		}
	})

	$("#objectSearch").click(function(e) {
		e.currentTarget.value = "";
	})

	$("#renderContainer").mousemove(function(e) {
		if (user.data.scroll) {
			gridContainer.x += e.clientX - user.data.mouse.x
			gridContainer.y += e.clientY - user.data.mouse.y;
		}
		user.data.mouse.x = e.clientX;
		user.data.mouse.y = e.clientY;

		var pos = getMousePos();
		editor.updateMousePos(pos.x,pos.y)

		editor.drawOverlays();
	})
 
	$("#colorPickerBox").change(function(e) {
		user.changeActiveTileDisplayColor(e.currentTarget.value)
	})
} 

function getMousePos(){
		var xDiff = user.data.mouse.x -  gridContainer.x;
		var yDiff = user.data.mouse.y  - gridContainer.y;
		//lets figure out what square we're in

		var rootX = xDiff + user.world.columns * user.world.tileSize / 2;
		var rootY = yDiff + user.world.rows    * user.world.tileSize / 2;

		var xPos = Math.floor(rootX / user.world.tileSize)
		var yPos = Math.floor(rootY / user.world.tileSize)

		if ((xPos < 0) || (xPos > user.world.columns - 1) || (yPos < 0) || (yPos > user.world.rows - 1)) {
			xPos = -1;
			yPos = -1;
		}
		return {
			x : xPos,
			y : yPos
		}
}
var Layer = function(){
	this.grid  = [[]];
	this.display = new PIXI.Graphics();
	this.renderTexture = new PIXI.RenderTexture();
}

var defaultLayers = {
	'testTiles' : {
		grid : [[]],
	},
	'testEntities' : {
		grid : [[]]
	}
}
var ang = angular.module('editor')
var userService = ang.service('userService', function() {

	var me = this;
	me.data = {
		zen: false,
		selectedTool: 'pnt',
		selectedTile: '',
		selectedBrush: '',
		selectedEntity: '',
		showGrid: true,
		objectMode: 'tile',
		activeLayer: '',
		entities: ['wot'],
		tiles: {},
		selecting: false,
		scale: 1,
		showGrid: true,
		mouse: {
			x: 0,
			y: 0,
			xPos: 0,
			yPos: 0,
			down : false,
		},
		tweenTimes: {
			zen: 200
		},
	}

	me.world = {
		layers: {},
		tileSize: 40,
		rows: 20,
		columns: 20,
		oldRows: 20, //need to clear out tiles
		oldColumns: 20, //need to clear out tiles after ang changes
		scale: 1,
	}

	//Tiles 
	me.loadTile = function(tile){
		me.data.tiles[tile.name] = tile;
		me.data.selectedTile = tile.name;
	}

	me.eraseTile = function(x,y){
		var tile = me.world.layers[me.data.activeLayer].grid[y][x];
		tile.sprite.setTexture(textures.empty)
		tile.gfx.clear();
	}

	me.newTile = function(){
		var nt = {
			display: 'color',
			color: '0x000000'
		}
		var id = Object.keys(me.data.tiles).length.toString();

		me.data.tiles[id] = nt;
		me.selectedTile = id;
	}


	me.paintTile = function(x,y){
		//console.log(me.world.layers[me.data.activeLayer].grid[y][x].display.x);
		var tile = me.world.layers[me.data.activeLayer].grid[y][x];
		if(me.data.selectedTile!=''){

			var paintColor = hashToHex(me.data.tiles[me.data.selectedTile].color);
		
			tile.gfx.beginFill(paintColor,1);
			tile.gfx.drawRect(0,0,me.world.tileSize,me.world.tileSize)
			tile.gfx.endFill();

		}
		//tile.sprite.setTexture(textures.testTex)
	}

	//Layers
	me.deleteLayer = function(name){
		if(me.world.layers[name]){
			var disp = me.world.layers[name].display;
			editor.displays.gridContainer.layerList.removeChild(disp)
			delete me.world.layers[name]
		}
	}


	me.newLayer = function(name) {
		if (name == undefined) {
			name = Object.keys(me.world.layers).length + 1
		}
		if (!me.world.layers[name]) {
			var nLayer = new Layer()
			me.world.layers[name] = nLayer;

			editor.displays.gridContainer.layerList.addChild(nLayer.display)
			me.data.activeLayer = name;
			me.resizeLayer(nLayer)
		}
	}

	me.resizeLayer = function(layer){
		 var rootX = -me.world.tileSize * me.world.columns / 2
         var rootY = -me.world.tileSize * me.world.rows / 2;
			
		for (var y = 0; y < me.world.rows; y++) {
			if(!layer.grid[y]){
				layer.grid[y] = Array();
			}

			for (var x = 0; x < me.world.columns; x++) {
				if(!layer.grid[y][x]){
					//Creating a NEW TILE INSTANCE
					var nTile        = new Obj('tile', x, y, rootX + x * me.world.tileSize, rootY + y * me.world.tileSize);
  					layer.grid[y][x] = nTile;
                    layer.display.addChild(nTile.gfx)
                    //nTile.gfx.visible = false;
				}
			}
		}
	}

	me.resizeWorld = function(){
		console.log('resizeworld')
	}

	me.changeActiveTileDisplayColor = function(color) {
		me.data.tiles[me.data.selectedTile].color = '#' + color.toString();
	}


	me.loadLayer = function(name, layer) {
		if (!me.world.layers[name]) {
			var nLayer = new Layer()
			me.world.layers[name] = nLayer;
			nLayer.display = new PIXI.Graphics();
			editor.displays.gridContainer.layerList.addChild(nLayer.display)
		}
	}

	//CALL THIS AFTER EDITOR IS FULLY LOADED
	//loads / sets up tiles, layers, etc
	me.init = function(){
		for(var x in testResources.tilesToLoad){
			me.loadTile(testResources.tilesToLoad[x])
		}
		//me.newLayer('default')
	}	

})
testResources.tilesToLoad = {
	air: {
		name : 'air',
		display: 'color',
		color: '#000FFF'
	},
	water: {
		name : 'water',
		display: 'color',
		color: '#00FaFF'
	},
	gnd: {
		name : 'gnd',
		display: 'color',
		color: '#00AFFF'
	},
	grs: {
		name : 'gnd',
		display: 'color',
		color: '#00FF00'
	},
	sky: {
		name : 'sky',
		display: 'color',
		color: '#F00FFF'
	},
	rod: {
		name : 'rod',
		display: 'color',
		color: '#FF0000'
	}
}

var Obj = function(type, xPos, yPos, x, y){
	this.gfx   =  new PIXI.Graphics();
	this.sprite = new PIXI.Sprite(textures.empty);
	this.gfx.addChild(this.sprite);
	this.displayType = type;
	this.xPos = x;
	this.yPos = y;
	this.gfx.x = x;
	this.gfx.y = y;
}