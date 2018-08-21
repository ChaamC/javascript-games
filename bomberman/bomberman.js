
GRID_SIZE = [18,11];
TILE_SIZE = 50;
var tile_type = {
	EMPTY: 0,
	DESTRUCTIBLE: 1,
	SOLID: 2
}
BOMB_DELAY = 50;

var branch_direction = {
	UP: 0,
	RIGHT: 1,
	DOWN: 2,
	LEFT: 3
}

var player1_animation = 0;
var player1_anim_counter = 0;

var player2_anim_onset = 0;
var player2_anim_onset_direction = 1;
var ANIM_ONSET_MAX = 7;

function Player(id, x,y,img){
	this.id = id;
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
	this.bomb_animation = 0;
	this.bomb_anim_counter = 0;
	this.explosion_animation = 0;
	this.explosion_anim_counter = 0;
	this.img = img;
	this.anim_counter = 0;
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

var player1; 
var player2;

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


		if(player.id == 1)
		{
			//Update the animation
			if(player.anim_counter == 0)
			{
				player.img.css('transform', "scaleX(-1)" );
			}
			else if(player.anim_counter == 4)
			{
				player.img.css('transform', "scaleX(1)" );
			}
			
			player.anim_counter++;
			if(player.anim_counter == 8)
				player.anim_counter = 0;
		}
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
	player.bomb_anim_counter = 0;

	var tilePosition = findTilePosition([player.x + player.size / 2, player.y + player.size / 2]);
	player.bombPosition = tilePosition;

	var img = document.createElement("IMG");
	img.setAttribute("src", "resources/bomb.png");
	img.setAttribute("class", "bomb_img")
	img.setAttribute("style", 'top: ' + (player.bombPosition[1]) * TILE_SIZE + "px");
	$('#tile' + tilePosition[0] + '_' + tilePosition[1]).append(img);


	player.bomb_animation = setInterval(function(){
	    var top_position = player.bomb_anim_counter * 50;
	    var bottom_position = top_position + 50;
	    var bomb_img_get = $('#tile' + tilePosition[0] + '_' + tilePosition[1]).find('.bomb_img');
	    bomb_img_get.css('clip', "rect(" + top_position + "px, 50px, " + bottom_position + "px, 0)" );
	    bomb_img_get.css('top', (player.bombPosition[1]) * TILE_SIZE - TILE_SIZE * player.bomb_anim_counter);
	    player.bomb_anim_counter++;
	    if(player.bomb_anim_counter == 4){
	    	player.bomb_anim_counter = 0;
	    }
	},20);
}

function destroyTile(x, y)
{
	$('#tile' + x + '_' + y + "> img.tile_img").attr("src", "resources/empty.png");
	current_map[y][x] = tile_type.EMPTY;
}

function CreateExplosionImg(src, position, player)
{
	var img = document.createElement("IMG");
	img.setAttribute("src", src);
	img.setAttribute("class", "explosion " + "explosion" + player.id);
	img.setAttribute("style", 'top: ' + (position[1]) * TILE_SIZE + "px");
	img.setAttribute("style", 'left: ' + (position[0]) * TILE_SIZE + "px");
	return img;
}

function getExplosionPosition(player, direction)
{
	var check_position = [0,0];
	switch (direction)
	{
		case branch_direction.UP:
			check_position = [player.bombPosition[0], player.bombPosition[1] - i];
			break;
		case branch_direction.DOWN:
			check_position = [player.bombPosition[0], player.bombPosition[1] + i];
			break;
		case branch_direction.LEFT:
			check_position = [player.bombPosition[0] - i, player.bombPosition[1]];
			break;
		case branch_direction.RIGHT:
			check_position = [player.bombPosition[0] + i, player.bombPosition[1]];
			break;
	}
	return check_position;
}

function validatePosition(position)
{
	return position[0] >= 0 && 
			position[0] < GRID_SIZE[0] &&
			position[1] >= 0 &&
			position[1] < GRID_SIZE[1];
}

function drawExplosionBranch(player, branch_src, tip_src, direction)
{
	var actual_power = 0;
	var explosion_position = [0,0];
	for(i = 1 ; i <= player.power ; i++)
	{
		explosion_position = getExplosionPosition(player, direction);
		if(validatePosition(explosion_position) && current_map[explosion_position[1]][explosion_position[0]] == tile_type.EMPTY )
		{
			actual_power = i;
		}
		else
		{
			break;
		}
	}
	for (i = 1 ; i <= actual_power; i++)
	{
		explosion_position = getExplosionPosition(player, direction);
		if(i == actual_power)
		{
			$('#tile' + explosion_position[0] + '_' + explosion_position[1]).append(
				CreateExplosionImg(tip_src, explosion_position, player) );	
		}
		else
		{
			$('#tile' + explosion_position[0] + '_' + explosion_position[1]).append(
				CreateExplosionImg(branch_src, explosion_position, player) );
		}
	}
}

function drawBombExplosionFrame(player)
{
	$(".explosion" + player.id).attr("src", "resources/explosion_middle.png");

	drawExplosionBranch(player, "resources/explosion_branchV.png", "resources/explosion_tip_top.png", branch_direction.UP);
	drawExplosionBranch(player, "resources/explosion_branchV.png", "resources/explosion_tip_bottom.png", branch_direction.DOWN);
	drawExplosionBranch(player, "resources/explosion_branchH.png", "resources/explosion_tip_left.png", branch_direction.LEFT);
	drawExplosionBranch(player, "resources/explosion_branchH.png", "resources/explosion_tip_right.png", branch_direction.RIGHT);

}

function drawBombExplosionAnimation(player)
{
	player.explosion_anim_counter = 0;
	player.explosion_animation = setInterval(function(){
		var explosion_offset = player.explosion_anim_counter % 4 - 1; //[-1, 2]
		if(explosion_offset == 2) // [2]
			explosion_offset = 0; // [0]
		$(".explosion" + player.id).css('transform', " translate("+ + explosion_offset + "px)" );
		if(player.explosion_anim_counter == 0)
		{
			$('#tile' + player.bombPosition[0] + '_' + player.bombPosition[1]).append(
				CreateExplosionImg("resources/explosion_one_tile.png", player.bombPosition, player) );
		}
		else if(player.explosion_anim_counter == 5)
		{
			var explosion_position = [0,0];
			$(".explosion" + player.id).attr("src", "resources/explosion_middle.png");
			drawBombExplosionFrame(player);
		}
		else if(player.explosion_anim_counter == 35)
		{

			$(".explosion" + player.id).remove();
			clearInterval(player.explosion_animation);
		}
		player.explosion_anim_counter++;
	}, 20);
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
		if(y - i >= 0 && current_map[y - i][x] == tile_type.DESTRUCTIBLE)
		{
			destroyTile(x, y - i);
		}
		if(y + i < GRID_SIZE[1] && current_map[y + i][x] == tile_type.DESTRUCTIBLE)
		{
			destroyTile(x, y + i);
		}
		if(x - i >= 0 && current_map[y][x - i] == tile_type.DESTRUCTIBLE)
		{
			destroyTile(x - i, y);
		}
		if(x + i < GRID_SIZE[0] && current_map[y][x + i] == tile_type.DESTRUCTIBLE)
		{
			destroyTile(x + i, y);
		}
	}

	clearInterval(player.bomb_animation);

	drawBombExplosionAnimation(player);
}

function draw()
{

	$("#player1_char").css('top', player1.y - 20 - 7);
	$("#player1_shadow").css('top', player1.y - 10);
	$("#player1").css('left', player1.x);
	$("#player2_char").css('top', player2.y + player2_anim_onset - 14);
	$("#player2_shadow").css('top', player2.y - 14);
	$("#player2").css('left', player2.x);
}

$(document).ready(function(){
	//hint: http-server
	$('#left_panel').load('../navbar.html');
	$("#cover").fadeOut(100);

	player1 = new Player(1, 1 * TILE_SIZE + 5, 1 * TILE_SIZE + 5, $('#player1').find('#player1_img'));
	player2 = new Player(2, 16 * TILE_SIZE + 5, 9 * TILE_SIZE + 5, $('#player2').find('#player2_img'));

	load_grid();
	load_map();

	setInterval(function(){
		if( player2_anim_onset_direction > 0 )
		{
	    	player2_anim_onset++;
	    	if (player2_anim_onset >= ANIM_ONSET_MAX)
	    		player2_anim_onset_direction = -1;
		}
		else
		{
	    	player2_anim_onset--
	    	if (player2_anim_onset <= -ANIM_ONSET_MAX)
	    		player2_anim_onset_direction = 1;
		}

	    
	},20);

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
    		player2.img.css('transform', "scaleX(1)" );
	    }
	    else if (evt.keyCode == 68) { //D
    		player2.speedX = player2.speed_factor;
    		keyPressed[keys_enum.D] = 1;
    		player2.img.css('transform', "scaleX(-1)" );
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
