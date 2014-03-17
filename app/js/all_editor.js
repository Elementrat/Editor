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
var stage;
var renderer;
var editor;
var bunnyTexture
var gridContainer;
scrolling = false;
var mouse = {x: 0, y : 0}

var world = {
    grid: [[]],
    tileSize : 40,
}

 $(document).ready(function(){
 	editor = new Editor();
 })

var Editor = function(){
	screenStats = detectScreen();

    renderer = new PIXI.autoDetectRenderer(screenStats.x, screenStats.y);
	$(window).resize(function(){
		screenStats = detectScreen();
		renderer.resize(screenStats.x, screenStats.y)
	})

    $("#renderContainer").mousedown(function(g){
        scrolling =true;
    })
    $("#renderContainer").mouseup(function(g){
        scrolling = false;
    })


    $("#renderContainer").mousemove(function(e){

        if(scrolling){
            gridContainer.x += e.clientX - mouse.x
            gridContainer.y += e.clientY - mouse.y;
        }

        mouse.x = e.clientX;
        mouse.y = e.clientY;
    })



   $("#renderContainer").append(renderer.view);
    stage = new PIXI.Stage;
    stage.setBackgroundColor("0x333333")

    initGrid();
    requestAnimationFrame(animate);

    function animate() {
        renderer.render(stage);
        requestAnimationFrame(animate);
    }
}

function initGrid(){

    var bunnyTexture = PIXI.Texture.fromImage("img/bunny.png");
    gridContainer = new PIXI.Graphics();
    gridContainer.x = detectScreen().x/2;
    gridContainer.y = detectScreen().y/2;
    stage.addChild(gridContainer)

    for(var x =0; x < 10; x++){
        for(var y = 0; y < 10; y++){
            var bunny        = new PIXI.Sprite(bunnyTexture);
            bunny.width = world.tileSize;
            bunny.height = world.tileSize;
            bunny.x = x * world.tileSize;
            bunny.y = y * world.tileSize;
            gridContainer.addChild(bunny);
            console.log("WOTE")
        }
    }


}

function detectScreen(){
	return { x: window.innerWidth, y : window.innerHeight};
}

var tools = {
	'paint' : 'blue',
	'select' : 'grey',
	'delete' : 'red'
}