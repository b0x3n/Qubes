///////////////////////////////////////////////////////////
// app/QubeTiles.js
//


///////////////////////////////////////////////////////////
// QubeTiles
//
// Stores all of the Qube tiles and provides a number of
// functions to obtain and manipulate them.
//
var	QubeTiles = (function() {

	var	tiles = [
	
	//	1x1 tile
		[
			[ 1 ]
		],
		
	//	2x2 tiles
		[
			[ 1, 0 ],
			[ 0, 1 ]
		],
		[
			[ 1, 1 ],
			[ 0, 0 ]
		],
		[
			[ 1, 1 ],
			[ 0, 1 ]
		],
		[
			[ 1, 1 ],
			[ 1, 1 ]
		],
		
	//	3x3 tiles
		[
			[ 1, 1, 1 ],
			[ 0, 0, 0 ],
			[ 0, 0, 0 ]
		],
		[
			[ 1, 0, 0 ],
			[ 0, 1, 0 ],
			[ 0, 0, 1 ]
		],
		[
			[ 1, 0, 1 ],
			[ 0, 1, 0 ],
			[ 0, 0, 0 ]
		],
		[
			[ 1, 0, 0 ],
			[ 0, 1, 0 ],
			[ 0, 1, 0 ]
		],
		[
			[ 1, 1, 0 ],
			[ 0, 0, 1 ],
			[ 0, 0, 1 ]
		],
		[
			[ 1, 1, 0 ],
			[ 0, 1, 1 ],
			[ 0, 0, 0 ]
		]
		
	];
	

///////////////////////////////////////////////////////////
//	getTile()
//
//	Returns the tile indexed by tileNo - if the specified
//	tileNo is out of range false is returned.
//
	var	getTile = function(tileNo) {
		if (tileNo < 0 || tileNo >= tiles.length)
			return false;
			
		return tiles[tileNo];
	};
	
	
///////////////////////////////////////////////////////////
//	emptyTile()
//
//	Returns a blank tile of the given size.
//
	var	emptyTile = function(size) {
		var tile = [];
		
		for (var y = 0; y < size; y++) {
			tile[y] = [];
			for (var x = 0; x < size; x++)
				tile[y][x] = 0;
		}
		
		return tile;
	};

	
///////////////////////////////////////////////////////////
//	randomTile()
//
//	Doesn't return an actual tile - simply generates
//	and returns a random tile number. The tile can be
//	retrieved with a call to getTile():
//
//		tile = QubeTiles.getTile(QubeTiles.randomTile())
//
	var	randomTile = function() {
		return Math.floor(Math.random() * tiles.length);
	};

	
///////////////////////////////////////////////////////////
//	rotateTile()
//
//	Rotates and returns the given tile 90 degrees
//	to the right (clockwise).
//
	var	rotateTile = function(tile) {
		var	rotated = emptyTile(tile.length);
		
		for (var y = 0; y < tile.length; y++) {
			for (var x = 0, b = 0; x < tile[y].length; x++) {
				rotated[x][((tile.length - 1) - y)] = tile[y][x];
			}
		}
		
		return rotated;
	};
	

///////////////////////////////////////////////////////////
//	horizontalFlip()
//
//	Horizontally flips and returns the given tile.
//	
	var	horizontalFlip = function(tile) {
		var	flipped = emptyTile(tile.length);
		
		for (var y = 0; y < tile.length; y++) {
			for (var x = 0; x < tile.length; x++) {
				flipped[y][((tile.length  - 1) - x)] = tile[y][x];
			}
		}
		
		return flipped;
	};
	
	
///////////////////////////////////////////////////////////
//	verticalFlip()
//
//	Vertically flips and returns the given tile.
//	
	var	verticalFlip = function(tile) {
		var	flipped = emptyTile(tile.length);
		
		for (var y = 0; y < tile.length; y++) {
			for (var x = 0; x < tile.length; x++) {
				flipped[((tile.length - 1) - y)][x] = tile[y][x];
			}
		}
		
		return flipped;
	}
	
	
///////////////////////////////////////////////////////////
//	Available functions.
//
	return {
		"getTile":			getTile,
		"emptyTile":		emptyTile,
		"randomTile":		randomTile,
		"rotateTile":		rotateTile,
		"horizontalFlip":	horizontalFlip,
		"verticalFlip":		verticalFlip
	};
	
})();
