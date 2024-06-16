///////////////////////////////////////////////////////////
// app/QubeModel.js
//


const	QUBE_STATE_TITLE = 0;
const	QUBE_STATE_IDLE = 1;
const	QUBE_STATE_READY = 2;
const	QUBE_STATE_SET = 3;
const	QUBE_STATE_GO = 4;
const	QUBE_STATE_LOCKING = 5;
const	QUBE_STATE_LOCKED = 6;
const	QUBE_STATE_GAME_OVER = 10;


const	QUBE_DIFFICULTY_EASY = 0;
const	QUBE_DIFFICULTY_HARD = 1;


const	QUBE_PERSPECTIVE = 20;

var	QubeModel = function(controller) {

	this.ctr = controller;
	
	///////////////////////////////////////////////////////
	// These are actually set in the QubeViews initQube()
	// method - see QubeViews.js for more info.
	//
	this.stageEl;
	this.qubeEl;

	this.qubeSize = 7;
	
	this.gridIDPrefix = "grid-";
	this.tileIDPrefix = "tile-";
	
	this.qube = [];
	
	this.qubeState = QUBE_STATE_GAME_OVER;
	
	this.qubeDifficulty = QUBE_DIFFICULTY_EASY;
	
	this.qubeLevel;
	this.qubeLives = 5;
	this.qubeScore = 0;
	
	this.dropTileLayer = (this.qubeSize - 1);
	
	this.audioEffectsVolume = 0.50;
	
	this.track;
	this.trackVolume = 0.20;
	
	this.qubeNextTile = null;
	
	this.startQube = function() {
		this.qubeLevel = 1;
		this.qubeLives = 5;
		this.qubeScore = 9000;
		
		this.qubeState = QUBE_STATE_IDLE;
			
		this.newQube();
		
		this.track = new Audio("audio/tracks/QubeTrack1.mp3");
		this.track.volume = this.trackVolume;
		this.track.loop = true;
		
		this.track.play();
	};
	
	
///////////////////////////////////////////////////////////
//	newQube()
//
//	Creates the qube multi-dimensional array model.
//
	this.newQube = function() {
		var	qubeSize = this.qubeSize;
		
		for (var grid = 0; grid < qubeSize; grid++) {
			this.qube[grid] = [];
			
			for (var row = 0; row < qubeSize; row++) {
				this.qube[grid][row] = [];
				
				for (var column = 0; column < qubeSize; column++) {
					this.qube[grid][row][column] = 0;
				}
			}
		}
	};
	
	
	this.putTiles = function(layer, tiles) {
		var	gridCentre = Math.floor(this.qubeSize / 2);
		var	tileSize = tiles.length;
		
		var	tileRow = gridCentre;
		var	tileColumn = gridCentre;
		
		if (tileSize > 1) {
			tileRow -= Math.floor(Math.random() * tileSize);
			tileColumn -= Math.floor(Math.random() * tileSize);
		}
		
		for (var row = 0; row < tileSize; row++) {
			for (var column = 0; column < tileSize; column++) {
				this.qube[layer][(tileRow + row)][(tileColumn + column)] = tiles[row][column];
			}
		}
		
		this.ctr.updateQube();
	};
	
	
///////////////////////////////////////////////////////////
//	newTiles()
//
	this.newTiles = function() {
		this.playEffect("NewQube");
		
		var	level = this.qubeLevel;
		var	layer = (this.qubeSize - 1);
		
		var	tiles = QubeTiles.randomTile();
		
		if (this.qubeNextTile == null) {
			tile = this.randomiseTile(QubeTiles.getTile(tiles));
			tiles = QubeTiles.randomTile();
		}
		else
			tile = this.qubeNextTile;
		
		this.qubeNextTile = this.randomiseTile(QubeTiles.getTile(tiles));
		this.putTiles(layer, tile);
	};
	
	this.randomiseTile = function(tile) {
		var	out;
		
		if (Math.floor(Math.random() * 2))
			tile = QubeTiles.horizontalFlip(tile);
		if (Math.floor(Math.random() * 2))
			tile = QubeTiles.verticalFlip(tile);
		if (Math.floor(Math.random() * 2))
			tile = QubeTiles.rotateTile(tile);
		
		return tile;
	}
	
	this.playEffect = function(effect) {
		var	audio = new Audio("audio/effects/" + effect + ".mp3");
		audio.volume = this.audioEffectsVolume;
		audio.play();
	};
	
	
///////////////////////////////////////////////////////////
//	getGridID()
//
//	Returns a grid html element id.
//
	this.getGridID = function(gridIndex) {
		return this.gridIDPrefix + gridIndex.toString();
	};
	
	
	this.getInnerGridID = function(gridIndex) {
		return this.gridIDPrefix + "inner-" + gridIndex.toString();
	};
	
	
///////////////////////////////////////////////////////////
//	getTileID()
//
//	Returns a grid tile html element id.
//
	this.getTileID = function(gridIndex, row, column) {
		return this.tileIDPrefix + gridIndex.toString() + "-" + row.toString() + "-" + column.toString();
	};

	
///////////////////////////////////////////////////////////
//	getGridPosition()
//
//	
	this.getGridPosition = function(gridIndex) {
		var	position = 0;
		var	perspective = (QUBE_PERSPECTIVE - this.qubeSize);
		
		if (! gridIndex)
			return 0;
		
		for (var grid = 1; grid < gridIndex; grid++) {
			position += (perspective / grid);
		}
		
		return position;
	};
	

///////////////////////////////////////////////////////////
//	getGridArea()
//
//	When the view is creating new grid layers in the qube
//	they are positioned in such a way as to appear 3d,
//	with depth and perspective.
//
//	This method will, given a particular grid layer index,
//	figure out the position and size of the layer with
//	respect to the number of layers and perspective.
//
//	This method will calculate the top, left, width and
//	height of this particular grid and return a string
//	that is output in a style="" attribute in the
//	view - see the newQubeLayer() method in QubeViews.js
//
	this.getGridArea = function(gridIndex) {
		var	gridArea = "top: 0%; left: 0%; width: 100% height: 100;"; 
		var	qubeSize = this.qubeSize;
		
		if (gridIndex > 0) {
			var	top = (((QUBE_PERSPECTIVE - qubeSize) / gridIndex) + this.getGridPosition(gridIndex));
			var	left = (((QUBE_PERSPECTIVE - qubeSize) / gridIndex) + this.getGridPosition(gridIndex));
			var	width = (100 - (left * 2));
			var	height = (100 - (top * 2));
			
			gridArea = '\
				top: ' + top.toString() + '%; \
				left: ' + left.toString() + '%; \
				width: ' + width.toString() + '%; \
				height: ' + height.toString() + '%; \
			';
		}
		
		return gridArea;
	};
	
	
	this.landTile = function() {
		var layer = this.ctr.dropTileLayer;
		
		for (var row = 0; row < this.qubeSize; row++) {
			for (var column = 0; column < this.qubeSize; column++) {
				this.qube[1][row][column] = this.qube[layer][row][column];
				this.qube[layer][row][column] = 0;
			}
		}
		
		this.ctr.dropTileLayer = 1;
		this.dropTile();
	}
	
	
	this.shiftDown = function() {
		this.playEffect("KeypressQube");
		
		if (this.qubeState == QUBE_STATE_LOCKED) {
			if (this.ctr.dropTileLayer > 1)
				this.landTile();
		}
		
		this.ctr.lockKeys = true;
		
		var	layer = (this.qubeSize - 1);
		var	row = layer;
		
		var	notEmpty = 0;
		
		for (var column = 0; column < this.qubeSize; column++) {
			if (this.qube[layer][row][column] == 1) {
				notEmpty = 1;
				break;
			}
		}
		
		if (! notEmpty) {
			for (var row = layer; row > 0; row--) {
				for (var column = 0; column < this.qubeSize; column++)
					this.qube[layer][row][column] = this.qube[layer][(row - 1)][column];
			}
			for (var column = 0; column < this.qubeSize; column++)
				this.qube[layer][0][column] = 0;
		}
		
		this.ctr.updateQube();
		this.ctr.lockKeys = false;
	};
	
	this.shiftUp = function() {
		this.playEffect("KeypressQube");
		if (this.qubeState == QUBE_STATE_LOCKED)
			return false;
		this.ctr.lockKeys = true;
		
		var	layer = (this.qubeSize - 1);
		var	row = 0;
		
		var	notEmpty = 0;
		
		for (var column = 0; column < this.qubeSize; column++) {
			if (this.qube[layer][row][column] == 1) {
				notEmpty = 1;
				break;
			}
		}
		
		if (! notEmpty) {
			for (var row = 1; row < this.qubeSize; row++) {
				for (var column = 0; column < this.qubeSize; column++)
					this.qube[layer][(row - 1)][column] = this.qube[layer][row][column];
			}
			for (var column = 0; column < this.qubeSize; column++)
				this.qube[layer][layer][column] = 0;
		}
		
		this.ctr.updateQube();
		this.ctr.lockKeys = false;
	};
	
	this.rotateUpperLayerLeft = function() {
		clearTimeout(this.ctr.qubeTimeoutID);
	
		$("#" + this.getInnerGridID(0)).html("");
		this.ctr.newQubeGrid(0);
		
		$("#" + this.getInnerGridID(0)).css("transform", "rotate(270deg)");
		
		var grid = [];
				
		for (var row = 0; row < this.qubeSize; row++) {
			grid[row] = [];
			for (var column = 0; column < this.qubeSize; column++) {
				grid[row][column] = this.qube[0][row][column];
			}
		}
		
		for (var row = 0; row < this.qubeSize; row++) {
			for (var column = 0; column < this.qubeSize; column++) {
				this.qube[0][row][column] = grid[column][((this.qubeSize - 1) - row)];
			}
		}
	
		this.ctr.updateQube();
		this.ctr.qubeTimer();
		
		return false;
	};
	
	this.rotateUpperLayerRight = function() {
		clearTimeout(this.ctr.qubeTimeoutID);
	
		$("#" + this.getInnerGridID(0)).html("");
		this.ctr.newQubeGrid(0);
		
		$("#" + this.getInnerGridID(0)).css("transform", "rotate(90deg)");
		
		var grid = [];
				
		for (var row = 0; row < this.qubeSize; row++) {
			grid[row] = [];
			for (var column = 0; column < this.qubeSize; column++) {
				grid[row][column] = this.qube[0][row][column];
			}
		}
		
		for (var row = 0; row < this.qubeSize; row++) {
			for (var column = 0; column < this.qubeSize; column++) {
				this.qube[0][column][((this.qubeSize - 1) - row)] = grid[row][column];
			}
		}
	
		this.ctr.updateQube();
		this.ctr.qubeTimer();
		
		return false;
	};
	
	this.shiftLeft = function() {
		this.playEffect("KeypressQube");
		if (this.qubeState == QUBE_STATE_LOCKED) {
			this.rotateUpperLayerLeft();
			return false;
		}
		
		this.ctr.lockKeys = true;
		
		var	layer = (this.qubeSize - 1);
		var	column = 0;
		
		var	notEmpty = 0;
		
		for (var row = 0; row < this.qubeSize; row++) {
			if (this.qube[layer][row][column] == 1) {
				notEmpty = 1;
				break;
			}
		}
		
		if (! notEmpty) {
			for (var row = 0; row < this.qubeSize; row++) {
				for (var column = 1; column < this.qubeSize; column++)
					this.qube[layer][row][(column - 1)] = this.qube[layer][row][column];
			}
			for (var row = 0; row < this.qubeSize; row++)
				this.qube[layer][row][(this.qubeSize - 1)] = 0;
		}
		
		this.ctr.updateQube();
		this.ctr.lockKeys = false;
	};
	
	
	this.shiftRight = function() {
		this.playEffect("KeypressQube");
		
		if (this.qubeState == QUBE_STATE_LOCKED) {
			this.rotateUpperLayerRight();
			return false;
		}
		
		this.ctr.lockKeys = true;
		
		var	layer = (this.qubeSize - 1);
		var	column = layer;
		
		var	notEmpty = 0;
		
		for (var row = 0; row < this.qubeSize; row++) {
			if (this.qube[layer][row][column] == 1) {
				notEmpty = 1;
				break;
			}
		}
		
		if (! notEmpty) {
			for (var row = 0; row < this.qubeSize; row++) {
				for (var column = (this.qubeSize - 1); column > 0; column--)
					this.qube[layer][row][column] = this.qube[layer][row][(column - 1)];
			}
			for (var row = 0; row < this.qubeSize; row++)
				this.qube[layer][row][0] = 0;
		}
		
		this.ctr.updateQube();
		this.ctr.lockKeys = false;
	};
	
	this.dumpTile = function(el) {
		var n = 0;
		
		$("#" + el).html(this.ctr.qubeTileTimer + "<br>");
		
		for (var r = 0; r < this.qubeSize; r++) {
			for (var c = 0; c < this.qubeSize; c++) {
				$("#" + el).append('\
					' + this.qube[0][r][c] + '&nbsp;\
				');
			}
			$("#" + el).append("<br>");
		}
	};
	
	this.dropTile = function() {
		var	layer = this.ctr.dropTileLayer;
		var	checks = [];
	
		this.ctr.projectTiles();
		
		if (! (this.ctr.qubeTileTimer % (this.ctr.qubeTileTrigger / 2))) {
			this.playEffect("ShiftQube");
			
			if (layer > 1) {
				this.ctr.dropTileLayer--;

				for (var row = 0; row < this.qubeSize; row++) {
					for (var column = 0; column < this.qubeSize; column++) {
						this.qube[(layer - 1)][row][column] = this.qube[layer][row][column];
						this.qube[layer][row][column] = 0;
					}
				}
				this.ctr.updateQube();
			}
			else {
				var	hit = 0;
				
				for (var row = 0; row < this.qubeSize; row++) {
					for (var column = 0; column < this.qubeSize; column++) {
						if (this.qube[1][row][column] == 1 && this.qube[0][row][column] == 1) {
							hit++;
							
							this.qube[1][row][column] = 0;
							this.qube[0][row][column] = 0;
							
							this.ctr.dissolveTile(row, column);
						}
						else {
							if (this.qube[0][row][column] == 0)
								this.qube[0][row][column] = this.qube[1][row][column];
							this.qube[1][row][column] = 0;
							
							if (this.qube[0][row][column] == 1) {
								this.ctr.landTile(row, column);
								checks[checks.length] = [ row, column ];
								this.qubeScore += 10;
							}
						}
					}
				}
				
				if (hit) {
					this.qubeLives--;
					this.playEffect("DissolveQube");
				}
				
				if (this.qubeLives < 0) {
					this.qubeState = QUBE_STATE_GAME_OVER;
					this.track.pause();
					
					clearTimeout(this.ctr.qubeTimeoutID);
					
					this.playEffect("GameOver");		
					this.ctr.gameOverEffect();
				}
				else
					this.qubeState = QUBE_STATE_IDLE;
			}
		}
		
		this.doChecks(checks);
		this.ctr.updateQube();
	};
	
	this.checkRow = function(row) {
		for (var column = 0; column < this.qubeSize; column++) {
			if (this.qube[0][row][column] == 0)
				return false;
		}
		
		return true;
	};
	
	this.checkColumn = function(column) {
		for (var row = 0; row < this.qubeSize; row++) {
			if (this.qube[0][row][column] == 0)
				return false;
		}
		
		return true;
	};
	
	this.doChecks = function(checks) {
		var	results = [];
		
		for (var c = 0; c < checks.length; c++) {
			results[c] = [];
			
			results[c][0] = this.checkRow(checks[c][0]);
			results[c][1] = this.checkColumn(checks[c][1]);
		}
		
		for (var c = 0; c < checks.length; c++) {
			if (results[c][0]) {
				this.ctr.popRow(checks[c][0], checks[c][1]);
			}
			if (results[c][1]) {
				this.ctr.popColumn(checks[c][0], checks[c][1]);
			}
		}
	};
	
};

