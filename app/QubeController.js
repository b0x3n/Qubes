///////////////////////////////////////////////////////////
// app/QubeController.js
//


const	QUBE_KEY_LEFT = 37;
const	QUBE_KEY_UP = 38;
const	QUBE_KEY_RIGHT = 39;
const	QUBE_KEY_DOWN = 40;


var	QubeController = function(stageElement, qubeElement) {

	var	self = this;
	
	var	model = new QubeModel(self);
	var	views = new QubeViews(self, model);

	this.qubeTimeslice = 100;
	
	var	qubeTimeoutID = null;
	this.qubeTileTimer = -1;
	
	this.dropTileLayer = -1;
	this.qubeTileTrigger;
	
	this.lockKeys = false;
	
	this.qubeColour = "#0A0";
	
	this.updateQube = function() {
		views.updateQube();
	};
	
	this.startQube = function() {
		model.startQube();
		
		this.qubeTimer();
	};
	
	this.stopQube = function() {
		if (qubeTimeoutID != null) {
			clearTimeout(qubeTimeoutID);
			qubeTimeoutID = null;
		}
		
		this.qubeTileTimer = -1;
	};
	
	this.qubeTimer = function() {
		self.qubeTimeoutID = setTimeout(function() {			
			if (model.level >= 7)
				self.qubeTileTrigger = 300;
			else
				self.qubeTileTrigger = (1000 - (100 * model.qubeLevel));
			
			if (self.qubeTileTimer >= 0)
				self.qubeTileTimer += self.qubeTimeslice;
			
			self.qubeContinue();
			self.qubeTimer();
		}, self.qubeTimeslice);
	};
	
	this.qubeContinue = function() {
		
		if (model.qubeState == QUBE_STATE_GAME_OVER) {
			$("#qube-overlay").css({
				"display": "block",
				"opacity": "0.50"
			});
		}
		
		if (model.qubeState == QUBE_STATE_IDLE) {
			console.log("IDLE - generating new tile");
			model.qubeState = QUBE_STATE_READY;
			model.newTiles();
			views.updateQube();
			
			this.qubeTileTimer = 0;
		}
		if (model.qubeState == QUBE_STATE_READY) {
			if (self.qubeTileTimer >= (self.qubeTileTrigger) && self.qubeTileTimer < (self.qubeTileTrigger * 2)) {
				$(".qube-ready").addClass("qube-set");
				
				model.qubeState = QUBE_STATE_SET;
				model.playEffect("TimerQube");
			}
		}
		if (model.qubeState == QUBE_STATE_SET) {
			if (self.qubeTileTimer >= (self.qubeTileTrigger * 2) && self.qubeTileTimer < (self.qubeTileTrigger * 3)) {
				$(".qube-set").addClass("qube-go");
				
				model.qubeState = QUBE_STATE_GO;
				model.playEffect("TimerQube");
			}
		}
		if (model.qubeState == QUBE_STATE_GO) {
			if (self.qubeTileTimer >= (self.qubeTileTrigger * 3) && self.qubeTileTimer < (self.qubeTileTrigger * 4)) {
				$(".qube-go").addClass("qube-locked").css("opacity", "0.99");
				
				model.qubeState = QUBE_STATE_LOCKING;
				model.playEffect("TimerQube");
			}
		}
		if (model.qubeState == QUBE_STATE_LOCKING) {
			if (self.qubeTileTimer >= (self.qubeTileTrigger * 4) && self.qubeTileTimer < (self.qubeTileTrigger * 5)) {
				$("#qube-go").addClass("qube-locked");
				
				$(".qube-tile").removeClass("qube-go");
				$(".qube-tile").removeClass("qube-set");
				$(".qube-tile").removeClass("qube-ready");
				
				model.qubeState = QUBE_STATE_LOCKED;
				this.dropTileLayer = (model.qubeSize - 1);
			}
		}
		if (model.qubeState == QUBE_STATE_LOCKED) {
			if (self.qubeTileTimer >= (self.qubeTileTrigger * 5) && self.qubeTileTimer < (self.qubeTileTrigger * 6)) {
				model.dropTile();
			}
			else
				model.dropTile();
		}
	};
	
	this.gameOverEffect = function() {
		views.gameOverEffect();
	};
	
	
///////////////////////////////////////////////////////////
//	Constructor.
//

	views.initQube(stageElement, qubeElement);
	views.buildQube();
	
	// Call the views.refreshQube() method any time the
	// screen is resized - this makes sure the qube will
	// always be horizontally or vertically centered.
	$(window).on("resize", function() {
		views.refreshQube();
	});
	
	$("#qube-overlay").on("click", function() {
		$("#qube-overlay").animate({
			"opacity": "0.01"
		}, 500, "linear", function() {
			$("#qube-overlay").css("display", "none");
		});
		
		model.playEffect("QubeLanded");
		
		setTimeout(function() {
			self.startQube();
		}, 500)
	});
	
	$(".control-el").on("click", function() {
		var	attrID = $(this).attr("id");
		
		if (attrID == "control-down")
			model.shiftDown();
		if (attrID == "control-up")
			model.shiftUp();
		if (attrID == "control-right")
			model.shiftRight();
		if (attrID == "control-left")
			model.shiftLeft();
	});

	$(".icon-el").on("mouseenter", function() {
		$(this).animate({
			"background-color": self.qubeColour
		}, 500, "linear");
	});
	
	$(".icon-el").on("mouseleave", function() {
		$(this).animate({
			"background-color": "#FFF"
		}, 500, "linear");
	});
	
	$(window).on("keydown", function(e) {
		var e = window.event ? window.event : e;
		var	qubeState = model.qubeState;
		
		if (this.lockKeys)
			return;
		
		if (e.keyCode == QUBE_KEY_DOWN)
			$("#control-down").trigger("click");
		if (e.keyCode == QUBE_KEY_UP)
			model.shiftUp();
		if (e.keyCode == QUBE_KEY_RIGHT)
			model.shiftRight();
		if (e.keyCode == QUBE_KEY_LEFT)
			model.shiftLeft();
	});
	
	this.dissolveTile = function(row, column) {
		views.dissolveTile(row, column);
	};
	
	this.landTile = function(row, column) {
		views.landTile(row, column);
	};
	
	this.popRow = function(row, column) {
		views.popRow(row, column);
	};
	
	this.popColumn = function(row, column) {
		views.popColumn(row, column);
	};
	
	this.projectTiles = function(row, column) {
		views.projectTiles();
	};
	
	this.newQubeGrid = function(layerIndex) {
		views.newQubeGrid(layerIndex);
	};
	
};
