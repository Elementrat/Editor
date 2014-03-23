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