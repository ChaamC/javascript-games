
GRID_SIZE = [18,11];
TILE_SIZE = 50;
var tile_type = {
	EMPTY: 0,
	DESTRUCTIBLE: 1,
	SOLID: 2
}

function Player(x,y){
	this.power = 1;
	this.x = x;
	this.y = y;
	this.size = 40;
	this.speed_factor = 10;
	this.speedX = 0;
	this.speedY = 0;
	this.bombTriggered = 0;
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

function isCollidingMap(player)
{
	var nextPosition = [player.x + player.speedX, player.y + player.speedY];
	//check each corner
	var cornersPositions = [nextPosition, 
						[nextPosition[0] + player.size - 1, nextPosition[1]], 
						[nextPosition[0], nextPosition[1] + player.size - 1],
						[nextPosition[0] + player.size - 1, nextPosition[1] + player.size - 1]];
	for (var i = 0; i < cornersPositions.length; i++)
	{
		//find on which tile the corner is
		var tilePosition = [ Math.floor(cornersPositions[i][0]/ TILE_SIZE), Math.floor(cornersPositions[i][1]/ TILE_SIZE)]
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

function updatePlayers()
{
	if(!isCollidingMap(player1) && !isCollidingPlayer(player1, player2))
	{
		player1.x += player1.speedX;
		player1.y += player1.speedY;
	}
	if(!isCollidingMap(player2) && !isCollidingPlayer(player2, player1))
	{
		player2.x += player2.speedX;
		player2.y += player2.speedY;
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
	    	player1.bombTriggered = 1;
	    }
	    if (evt.keyCode == 81) { // Q
	    	player2.bombTriggered = 1;
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
