///////////////////////////////////////////////////////////
// app/QubeViews.js
//


var	QubeViews = function(controller, model) {

	var	self = this;
	
	this.ctr = controller;
	this.model = model;

	
///////////////////////////////////////////////////////////
//	refreshQube()
//
//	If the width of the stage is greater than the height
//	then the height and width of qube will be the height
//	of stage and qube will be horizontally centered.
//
//	However, if the height of the stage is greater than
//	the width then qube height and width will be the width
//	of stage and qube will be vertically centered.
//
	this.refreshQube = function() {
		var	stageEl = $("#" + this.model.stageEl);
		
		var	stageWidth = parseInt(stageEl.css("width").replace('px', ''));
		var	stageHeight = parseInt(stageEl.css("height").replace('px', ''));
	
		var	qubeArea = {
			top: "0px",
			left: Math.floor((stageWidth - stageHeight) / 2).toString() + "px",
			width: stageHeight.toString() + "px",
			height: stageHeight.toString() + "px"
		};
		
		var	overlayLineHeight = stageHeight;
		
		if (stageHeight > stageWidth) {
			qubeArea.top = Math.floor((stageHeight - stageWidth) / 2).toString() + "px";
			qubeArea.left = "0px";
			qubeArea.width = qubeArea.height = stageWidth.toString() + "px";
			overlayLineHeight = stageWidth;
		}
		
		$("#" + this.model.qubeEl).css(qubeArea);
		$("#qube-overlay, #footer-controls, #header-info").css({
			"left": qubeArea.left,
			"width": qubeArea.width
		});
		$("#qube-overlay").css("line-height", overlayLineHeight.toString() + "px")
	};
	

///////////////////////////////////////////////////////////
//	initQube()
//
//	The real purpose of this method is to store the stage
//	and qube element ID's in the model.
//
//	Will make the assignments then call the refreshQube()
//	method above.
//
	this.initQube = function(stageEl, qubeEl) {
		this.model.stageEl = stageEl;
		this.model.qubeEl = qubeEl;
		
		this.refreshQube();
	};


///////////////////////////////////////////////////////////
//	newQubeGrid()
//
	this.newQubeGrid = function(gridIndex) {
		var	gridEl = $("#" + this.model.getGridID(gridIndex));
		var	qubeSize = this.model.qubeSize;
	
		var	tileSize = (100 / qubeSize).toString() + "%";
	
		gridEl.html("");
	
		for (var row = 0; row < qubeSize; row++) {
			for (column = 0; column < qubeSize; column++) {
				gridEl.append('\
					<div \
						id="' + this.model.getTileID(gridIndex, row, column) + '" \
						class="qube-tile"\
						style="\
							width: ' + tileSize + '; \
							height: ' + tileSize + ';\
						"\
					>\
						&nbsp;\
					</div>\
				');
			}
		}
	};
	

///////////////////////////////////////////////////////////
//	newQubeLayer()
//
	this.newQubeLayer = function(gridIndex) {
		var	qubeEl = $("#" + this.model.qubeEl);
		
		qubeEl.append('\
			<div \
				id="' + this.model.getGridID(gridIndex) + '" \
				class="qube-layer" \
				style="' + this.model.getGridArea(gridIndex) + '"\
			>\
				<div \
					id="' + this.model.getInnerGridID(gridIndex) + '" \
					class="qube-layer qube-inner"\
				></div>\
			</div>\
		');
		
		this.newQubeGrid(gridIndex);
	};
	
	
///////////////////////////////////////////////////////////
//	Builds the qube.
//
	this.buildQube = function() {
		var	qubeSize = this.model.qubeSize;
		
		for (var qubeLayer = (qubeSize - 1); qubeLayer >= 0; qubeLayer--) {
			this.newQubeLayer(qubeLayer);
		}
		
		$("#qube-overlay").css({
			"display": "block",
			"opacity": "0.50"
		}).html("Click to start");
	}
	
	
	this.showNextTile = function() {
		$(".info-tile-blank").removeClass("info-tile-qube");
		
		for (var row = 0; row < self.model.qubeNextTile.length; row++) {
			for (var column = 0; column < self.model.qubeNextTile.length; column++) {
				if (this.model.qubeNextTile[row][column] == 1) {
					$("#info-tile-" + row.toString() + "-" + column.toString()).addClass("info-tile-qube");
				}
			}
		}
	};
	
	
///////////////////////////////////////////////////////////
//	updateQube()
//
	this.updateQube = function() {
		var	qube = self.model.qube;
		
		if (this.model.qubeLives >= 0)
			$("#info-lives-data").html(this.model.qubeLives);
		
		$("#info-score-data").html(this.model.qubeScore.toString());
		$("#info-level-data").html(this.model.qubeLevel);
		
		this.showNextTile();
		
		if (this.model.qubeDifficulty == QUBE_DIFFICULTY_EASY) {
			this.projectTiles();
		}
		for (var layer = 0; layer < qube.length; layer++) {
			for (var row = 0; row < qube.length; row++) {
				for (var column = 0; column < qube.length; column++) {
					if (qube[layer][row][column] == 1 && layer > 0) {
						if (this.model.qubeState == QUBE_STATE_READY)
							$("#" + this.model.getTileID(layer, row, column)).addClass("qube-ready");
						else if (this.model.qubeState == QUBE_STATE_SET)
							$("#" + this.model.getTileID(layer, row, column)).addClass("qube-set");
						else if (this.model.qubeState == QUBE_STATE_GO)
							$("#" + this.model.getTileID(layer, row, column)).addClass("qube-go");
						else if (this.model.qubeState == QUBE_STATE_LOCKED)
							$("#" + this.model.getTileID(layer, row, column)).addClass("qube-locked");
						continue;
					}
					else {
						$("#" + this.model.getTileID(layer, row, column)).removeClass("qube-go qube-set qube-ready qube-clash qube-locked");
					
						if (this.model.qube[layer][row][column] == 1) {
							$("#" + this.model.getTileID(layer, row, column)).css({
								"opacity": "0.50",
								"background-color": "#050",
								"border": "solid 2px #FFF"
							});
						}
		 			}
				}
			}
		}
		
		if (this.model.qubeScore > (this.model.qubeLevel * 10000)) {
			for (var r = 0; r < this.model.qubeSize; r++) {
				for (var c = 0; c < this.model.qubeSize; c++) {
					this.model.qube[0][r][c] = 0;
				}
			}
			
			this.model.qubeLives++;
			this.model.qubeLevel++;
			this.model.playEffect("LevelQube");
			
			this.layer = (this.model.qubeSize - 1);
			
			$("#qube-overlay").css({
				"opacity": "0.50",
				"display": "block"
			}).html("Level up!");
			
			$("#qube-overlay").animate({
				"opacity": "0.01"
			}, 2000, "linear", function() {
				$("#qube-overlay").css("display", "none");
			});
		}
		
	};
	
	this.projectTiles = function() {
		var	qube = this.model.qube;
		var backLayer = this.model.dropTileLayer;
		
		$("#" + this.model.getInnerGridID(0)).html("");
		this.newQubeGrid(0);
		$(".qube-tile").removeClass("qube-project qube-project-clash");
		
		for (var row = 0; row < this.model.qubeSize; row++) {
			for (var column = 0; column < this.model.qubeSize; column++) {
				if (qube[backLayer][row][column] == 1) {
					if (qube[0][row][column] == 1)
						$("#" + this.model.getTileID(0, row, column)).addClass("qube-project-clash");
					else
						$("#" + this.model.getTileID(0, row, column)).addClass("qube-project");
				}
			}
		}
	};
	
	
	this.animateTile = function() {
		var	toColour = "#A00";
		var	toOpacity = "0.90";
		var	currentClass = "qube-ready";
		var	animationDuration = self.ctr.qubeTileTrigger;
		
		if (this.model.qubeState == QUBE_STATE_SET) {
			toColour = "#FA0";
			currentClass = "qube-set";
		}
		else if (this.model.qubeState == QUBE_STATE_GO) {
			toColour = "#0A0";
			toOpacity = "0.80";
			currentClass = "qube-set";
		}
		
		$("." + currentClass).animate({
			"background-color": toColour,
			"opacity": toOpacity
		}, (animationDuration / 5), "linear");
	}
	
	this.dissolveTile = function(row, column) {
		$("#" + this.model.getTileID(0, row, column)).css({
			"opacity": "0.40",
			"background-color": "#F00"
		});
		
		$("#t").html("CLASH! " + row + " " + column);
		$("#" + this.model.getTileID(0, row, column)).animate({
			"background-color": "#000",
			"border-color": "#000",
			"opacity": "0.01"
		}, 500, "linear", function() {
			$("#" + self.model.getTileID(0, row, column)).removeClass("qube-ready qube-set qube-go qube-locked qube-clash qube-landed");	
		});
	};
	
	this.landTile = function(row, column) {
		$("#" + this.model.getTileID(0, row, column)).removeClass("qube-ready qube-set qube-go qube-locked qube-clash");
		$("#" + this.model.getTileID(0, row, column)).addClass("qube-landed");
	};
	
	this.gameOverEffect = function() {	
		self.model.qubeState = QUBE_STATE_GAME_OVER;
		
		this.ctr.qubeTileTrigger = (1000 - (100 * this.qubeLevel));
		
		$("#qube-overlay").css({
			"opacity": "0.50",
			"display": "block"
		}).html("Click to start");
	};
	/*
	this.rattleTiles = function(row, column) {
		localStorage.setItem("__qubePlayerScore", this.model.qubeScore);
		$("#info-score-data").html("XXXXXX");
		$("#info-lives-data").html("X");
		$("#info-level-data").html("X");
		$(".info-tile-blank").removeClass("info-tile-qube");
		
		$(".qube-landed").animate({
			"background-color": "#A00",
			"opacity": "0.50"
		}, 1000, "swing", function() {
			$(".qube-landed").animate({
				"background-color": "#000",
				"opacity": "0.01"
			}, 1000, "swing", function() {
				if (column >= self.model.qubeSize) {
					row++;
					column = 0;
				}
				else
					column++;
						
				if (row >= self.model.qubeSize)
					return false;
						
				self.rattleTiles(row, column);
			});
		});
	};
	*/
	this.popLeft = function(row, column) {
		setTimeout(function() {
			if (column < 0)
				return false;
			
			$("#" + self.model.getTileID(0, row, column)).animate({
				"background-color": "#050",
				"opacity": "0.30"
			}, 100, "linear", function() {
				$("#" + self.model.getTileID(0, row, column)).animate({
					"background-color": "#000",
					"opacity": "0.01"
				}, 100, "linear");
			});
			
			self.model.qube[0][row][column] = 0;
			self.popLeft(row, (column - 1));
			
		}, 100);
	};
	
	this.popRight = function(row, column) {
		setTimeout(function() {
			if (column >= self.model.qubeSize)
				return false;
			
			$("#" + self.model.getTileID(0, row, column)).animate({
				"background-color": "#050",
				"opacity": "0.30"
			}, 100, "linear", function() {
				$("#" + self.model.getTileID(0, row, column)).animate({
					"background-color": "#000",
					"opacity": "0.01"
				}, 100, "linear");
			});
			
			self.model.qube[0][row][column] = 0;
			self.popRight(row, (column + 1));
			
		}, 100);
	};
	
	this.popTop = function(row, column) {
		setTimeout(function() {
			if (row < 0)
				return false;
			
			$("#" + self.model.getTileID(0, row, column)).animate({
				"background-color": "#050",
				"opacity": "0.30"
			}, 100, "linear", function() {
				$("#" + self.model.getTileID(0, row, column)).animate({
					"background-color": "#000",
					"opacity": "0.01"
				}, 100, "linear");
			});
			
			self.model.qube[0][row][column] = 0;
			self.popTop((row - 1), column);
			
		}, 100);
	};
	
	this.popBottom = function(row, column) {
		setTimeout(function() {
			if (row >= self.model.qubeSize)
				return false;
			
			$("#" + self.model.getTileID(0, row, column)).animate({
				"background-color": "#050",
				"opacity": "0.30"
			}, 100, "linear", function() {
				$("#" + self.model.getTileID(0, row, column)).animate({
					"background-color": "#000",
					"opacity": "0.01"
				}, 100, "linear");
			});
			
			self.model.qube[0][row][column] = 0;
			self.popBottom((row + 1), column);
			
		}, 100);
	};
	
	this.popRow = function(row, column) {
		this.popLeft(row, column);
		this.popRight(row, column);
		
		this.model.playEffect("LineQube");
		this.model.qubeScore += 100;
	};
	
	this.popColumn = function(row, column) {
		this.popTop(row, column);
		this.popBottom(row, column);
		
		this.model.playEffect("LineQube");
		this.model.qubeScore += 100;
	};
	
};
