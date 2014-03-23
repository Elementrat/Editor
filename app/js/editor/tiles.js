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