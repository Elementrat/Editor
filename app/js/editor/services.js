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