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