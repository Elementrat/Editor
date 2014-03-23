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