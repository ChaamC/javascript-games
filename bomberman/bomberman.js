
GRID_SIZE = [18,11];
TILE_SIZE = 50;
var tile_type = {
	EMPTY: 0,
	DESTRUCTIBLE: 1,
	SOLID: 2
}
BOMB_DELAY = 50;

function Player(x,y){
	this.power = 1;
	this.x = x;
	this.y = y;
	this.size = 40;
	this.speed_factor = 10;
	this.speedX = 0;
	this.speedY = 0;
	this.bombTriggered = 0;
	this.bombCounter = 0;
	this.bombPosition = [0,0];
}
var keys_enum = {
	UP: 0,
	DOWN: 1,
	LEFT: 2,
	RIGHT: 3,
	W: 4,
	S: 5,
	A: 6,
	D: 7
};
var keyPressed = [0,0,0,0, 0,0,0,0];

var player1 = new Player(1 * TILE_SIZE + 5, 1 * TILE_SIZE + 5);
var player2 = new Player(16 * TILE_SIZE + 5, 9 * TILE_SIZE + 5);

var map1 = [
[2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
[2,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,2],
[2,0,2,1,2,1,2,1,2,1,2,1,2,1,2,1,0,2],
[2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
[2,1,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2],
[2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
[2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,1,2],
[2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
[2,0,1,2,1,2,1,2,1,2,1,2,1,2,1,2,0,2],
[2,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,2],
[2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
];
var current_map = map1;

function load_grid()
{
	var grid_html = "";
	for (i = 0; i < GRID_SIZE[1]; i++)
	{
		grid_html += "<div class=\"row\">\n";
		for (j = 0; j < GRID_SIZE[0]; j++)
		{
			grid_html += "<div class=\"column\" id=\"tile" + j + "_" + i + "\"></div>\n";
		}
		grid_html += "</div>\n"
	}
	$('#game_screen').append(grid_html);
}

function load_map()
{
	for (y = 0; y < map1.length; y++)
	{
		for(x = 0; x < map1[y].length; x++)
		{
			switch (map1[y][x])
			{
				case tile_type.EMPTY:
					var img = document.createElement("IMG");
					img.setAttribute("src", "resources/empty.png");
					img.setAttribute("class", "tile_img")
					$('#tile' + x + '_' + y).append(img);
					break;
				case tile_type.DESTRUCTIBLE:
					var img = document.createElement("IMG");
					img.setAttribute("src", "resources/destr1.png");
					img.setAttribute("class", "tile_img")
					$('#tile' + x + '_' + y).append(img);
					break;
				case tile_type.SOLID:
					var img = document.createElement("IMG");
					img.setAttribute("src", "resources/solid.png");
					img.setAttribute("class", "tile_img")
					$('#tile' + x + '_' + y).append(img);
					break;
			}
		}
	}
}
function findTilePosition(position)
{
	return [ Math.floor(position[0]/ TILE_SIZE), Math.floor(position[1]/ TILE_SIZE)];
}

function isCollidingMap(player, nextPosition)
{
	//check each corner
	var cornersPositions = [nextPosition, 
						[nextPosition[0] + player.size - 1, nextPosition[1]], 
						[nextPosition[0], nextPosition[1] + player.size - 1],
						[nextPosition[0] + player.size - 1, nextPosition[1] + player.size - 1]];
	for (var i = 0; i < cornersPositions.length; i++)
	{
		//find on which tile the corner is
		var tilePosition = findTilePosition(cornersPositions[i])
		if ( current_map[ tilePosition[1] ][ tilePosition[0] ] != tile_type.EMPTY )
			return true; // collision detected

	}

	//no collision if all the tests are passed
	return false;
}

function isCollidingPlayer(player, adversary)
{
	return false;
}

function updatePosition(nextPosition, player, adversary)
{
	if(!isCollidingMap(player, nextPosition) && !isCollidingPlayer(player, adversary))
	{
		player.x = nextPosition[0];
		player.y = nextPosition[1];
	}
}

function updatePlayers()
{
	//update their position
	if(player1.speedX != 0)
		updatePosition( [player1.x + player1.speedX, player1.y], player1, player2);
	if(player1.speedY != 0)
		updatePosition( [player1.x, player1.y + player1.speedY], player1, player2);
	if(player2.speedX != 0)
		updatePosition( [player2.x + player2.speedX, player2.y], player2, player1);
	if(player2.speedY != 0)
		updatePosition( [player2.x, player2.y + player2.speedY], player2, player1);	

	//update the bomb counters
	if(player1.bombTriggered)
		player1.bombCounter += 1;
	if(player2.bombTriggered)
		player2.bombCounter += 1;
}

function plantBomb(player)
{
	if(player.bombTriggered) // do nothing if there is already a bomb planted by the player
		return;
	player.bombTriggered = 1;
	player.bombCounter = 0;

	var tilePosition = findTilePosition([player.x + player.size / 2, player.y + player.size / 2]);

	var img = document.createElement("IMG");
	img.setAttribute("src", "resources/bomb.png");
	img.setAttribute("class", "bomb_img")
	$('#tile' + tilePosition[0] + '_' + tilePosition[1]).append(img);
	player.bombPosition = tilePosition;
}

function destroyTile(x, y)
{
	$('#tile' + x + '_' + y + "> img.tile_img").attr("src", "resources/empty.png");
	current_map[y][x] = tile_type.EMPTY;
}

function explodeBomb(player)
{
	var x = player.bombPosition[0];
	var y = player.bombPosition[1];
	$('#tile' + x + '_' + y + "> img.bomb_img").remove();
	player.bombTriggered = 0;
	player.bombCounter = 0;
	//destroy destructible tiles in the x and y axis, according to the player<s power
	for(var i = 1; i <= player.power; i++)
	{
		if(current_map[y - i][x] == tile_type.DESTRUCTIBLE)
		{
			destroyTile(x, y - i);
		}
		if(current_map[y + i][x] == tile_type.DESTRUCTIBLE)
		{
			destroyTile(x, y + i);
		}
		if(current_map[y][x - i] == tile_type.DESTRUCTIBLE)
		{
			destroyTile(x - i, y);
		}
		if(current_map[y][x + i] == tile_type.DESTRUCTIBLE)
		{
			destroyTile(x + i, y);
		}
	}
}

function draw()
{
	$("#player1").css('top', player1.y);
	$("#player1").css('left', player1.x);
	$("#player2").css('top', player2.y);
	$("#player2").css('left', player2.x);
}

$(document).ready(function(){
	//hint: http-server
	$('#left_panel').load('../navbar.html');
	$("#cover").fadeOut(100);

	load_grid();
	load_map();

	setInterval(function(){ 
		updatePlayers();

		//check for bomb explosions
		if(player1.bombCounter >= BOMB_DELAY)
		{
			explodeBomb(player1);
		}
		if(player2.bombCounter >= BOMB_DELAY)
		{
			explodeBomb(player2);
		}

		draw();


	}, 40);

	$(document).on('keydown',function(evt) {

	    if (evt.keyCode == 38) { //UP
    		player1.speedY = -player1.speed_factor;
    		keyPressed[keys_enum.UP] = 1;
	    }
	    if (evt.keyCode == 40) { //DOWN
    		player1.speedY = player1.speed_factor;
    		keyPressed[keys_enum.DOWN] = 1;
	    }
	    if (evt.keyCode == 37) { //LEFT
    		player1.speedX = -player1.speed_factor;
    		keyPressed[keys_enum.LEFT] = 1;
	    }
	    if (evt.keyCode == 39) { //RIGHT
    		player1.speedX = player1.speed_factor;
    		keyPressed[keys_enum.RIGHT] = 1;
	    }

	    if (evt.keyCode == 87) { //W
    		player2.speedY = -player2.speed_factor;
    		keyPressed[keys_enum.W] = 1;
	    }
	    else if (evt.keyCode == 83) { //S
    		player2.speedY = player2.speed_factor;
    		keyPressed[keys_enum.S] = 1;
	    }
	    else if (evt.keyCode == 65) { //A
    		player2.speedX = -player2.speed_factor;
    		keyPressed[keys_enum.A] = 1;
	    }
	    else if (evt.keyCode == 68) { //D
    		player2.speedX = player2.speed_factor;
    		keyPressed[keys_enum.D] = 1;
	    }

	    //Bomb keys
	    if (evt.keyCode == 191) { // É
	    	plantBomb(player1);
	    }
	    if (evt.keyCode == 81) { // Q
	    	plantBomb(player2);
	    }
	});

	$(document).on('keyup',function(evt) {

	    if (evt.keyCode == 38) { //UP
	    	if(!keyPressed[keys_enum.DOWN])
    			player1.speedY = 0;
    		keyPressed[keys_enum.UP] = 0;
	    }
	    if (evt.keyCode == 40) { //DOWN
	    	if(!keyPressed[keys_enum.UP])
    			player1.speedY = 0;
    		keyPressed[keys_enum.DOWN] = 0;
	    }
	    if (evt.keyCode == 37) { //LEFT
	    	if(!keyPressed[keys_enum.RIGHT])
    			player1.speedX = 0;
    		keyPressed[keys_enum.LEFT] = 0;
	    }
	    if (evt.keyCode == 39) { //RIGHT
	    	if(!keyPressed[keys_enum.LEFT])
    			player1.speedX = 0;
    		keyPressed[keys_enum.RIGHT] = 0;
	    }

	    if (evt.keyCode == 87) { //W
	    	if(!keyPressed[keys_enum.S])
    			player2.speedY = 0;
    		keyPressed[keys_enum.W] = 0;
	    }
	    else if (evt.keyCode == 83) { //S
	    	if(!keyPressed[keys_enum.W])
    			player2.speedY = 0;
    		keyPressed[keys_enum.S] = 0;
	    }
	    else if (evt.keyCode == 65) { //A
	    	if(!keyPressed[keys_enum.D])
    			player2.speedX = 0;
    		keyPressed[keys_enum.A] = 0;
	    }
	    else if (evt.keyCode == 68) { //D
	    	if(!keyPressed[keys_enum.A])
    			player2.speedX = 0;
    		keyPressed[keys_enum.D] = 0;
	    }
	});
		
});
