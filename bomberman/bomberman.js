
GRID_SIZE = [18,11];
TILE_SIZE = 50;
var tile_type = {
	EMPTY: 0,
	DESTRUCTIBLE: 1,
	SOLID: 2,
	EXPLOSION_P1: 3,
	EXPLOSION_P2: 4
}
BOMB_DELAY = 100;

var branch_direction = {
	UP: 0,
	RIGHT: 1,
	DOWN: 2,
	LEFT: 3
}

var is_game_ended = false;
var score = [0,0];

var player1_animation = 0;
var player1_anim_counter = 0;

var player2_anim_onset = 0;
var player2_anim_onset_direction = 1;
var ANIM_ONSET_MAX = 7;

var POWER_UP_TYPE = {
	POWER_INC: 0,
	POWER_DEC: 1,
	PIERCE: 2,
	NB_BOMBS_INC: 3,
	NB_BOMBS_DEC: 4,
	MOV_SPEED_INC: 5,
	MOV_SPEED_DEC: 6,
	REMOTE: 7,
	INVERTED: 8,
	NORMAL_DIR: 9
}
var MAX_POWER = 10;
var SPEED_SLOW = 2;
var SPEED_NORMAL = 5;
var SPEED_FAST = 6.25;

var power_ups = [];

var POWER_UP_DELAY = 400;

function PowerUp( x, y, type ){
	this.tilePosition = [x,y];
	this.type = type;
	this.timer = 0;
}

function Explosion(){
	this.positions = [];
}

function Player(id, x,y,img){
	this.id = id;
	//powerups
	this.power = 1; // up to 10
	this.pierce = 0; // 1 when activated
	this.nb_bombs = 1; // default = 1 ; up to 3 max;
	this.nb_bombs_planted = 0;
	this.speed_factor = SPEED_NORMAL;//default = 5 ; speed up = 8 ; speed down = 2;
	this.remote = 0; // 1 when activated
	this.inverted = 0; // 1 when activated
	//
	this.x = x;
	this.y = y;
	this.size = 50;
	this.speedX = 0;
	this.speedY = 0;
	this.bombCounter = [-1,-1,-1];
	this.bombPosition = [[0,0],[0,0],[0,0]];
	this.bomb_animation = [0,0,0];
	this.bomb_anim_counter = [0,0,0];
	this.explosions = [-1,-1,-1];
	this.explosion_center_pos = [[0,0],[0,0],[0,0]];
	this.explosion_animation = [0,0,0];
	this.explosion_anim_counter = [0,0,0];
	this.img = img;
	this.anim_counter = 0;
	this.walking_on_bomb_id = [];
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
[2,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,2],
[2,1,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2],
[2,1,0,1,1,1,0,1,1,0,1,1,0,1,1,1,1,2],
[2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,1,2],
[2,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,2],
[2,0,1,2,1,2,1,2,0,2,1,2,1,2,1,2,0,2],
[2,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,2],
[2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
];
var map2 = [
[2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
[2,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,2],
[2,0,2,0,2,1,2,0,0,0,0,0,0,0,0,1,0,2],
[2,1,1,0,1,1,1,0,0,0,0,0,0,0,0,1,0,2],
[2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
[2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
[2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
[2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
[2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
[2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
[2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
];
var current_map = [];

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

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
	//remove power_ups
	for(var i = 0; i < power_ups.length; i++)
	{
		$('#tile' + power_ups[i].tilePosition[0] + '_' + power_ups[i].tilePosition[1] + "> img.power_up").remove();
		power_ups.splice(i, 1);
		i--;
	}

	for (y = 0; y < current_map.length; y++)
	{
		for(x = 0; x < current_map[y].length; x++)
		{
			switch (current_map[y][x])
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

	player1 = new Player(1, 1 * TILE_SIZE, 1 * TILE_SIZE, $('#player1').find('#player1_img'));
	player2 = new Player(2, 16 * TILE_SIZE, 9 * TILE_SIZE, $('#player2').find('#player2_img'));

	$("#winner_message").text("");
	$("#game_message").hide();
	draw();


	player1.img.css('transform', "scaleX(1) scaleY(1) rotate(0deg)");
	player2.img.css('transform', "scaleX(1) scaleY(1) rotate(0deg)");
	
	is_game_ended = false;

}
function findTilePosition(position)
{
	return [ Math.floor(position[0]/ TILE_SIZE), Math.floor(position[1]/ TILE_SIZE)];
}

function endGame(player)
{
	is_game_ended = true;
	if(player.id == 1)
		score[1]++; 
	else
		score[0]++;
	//update score
	$('#winner1').text(score[0]);
	$('#winner2').text(score[1]);

	if(player.id == 1)
		$("#winner_message").text("Player 2 wins!");
	else
		$("#winner_message").text("Player 1 wins!");

	$("#audio_death").clone()[0].play();

	var death_animation_counter = 0;
	var death_animation = setInterval(function(){

		var scale_factor = -0.02 * death_animation_counter + 1;
		var rotate_factor = death_animation_counter * 15;

		player.img.css('transform', "scaleX(" + scale_factor + ") scaleY(" + scale_factor + ")  rotate(" + rotate_factor + "deg)");

		death_animation_counter++;
		if(death_animation_counter >= 50)
		{
			$("#game_message").show();
			clearInterval(death_animation);
		}
	}, 30);

}

function checkExplosion(player)
{
	var tilePosition = findTilePosition([player.x + player.size/2, player.y + player.size/2]);
	if ( current_map[ tilePosition[1] ][ tilePosition[0] ] == tile_type.EXPLOSION_P1 ||
		 	current_map[ tilePosition[1] ][ tilePosition[0] ] == tile_type.EXPLOSION_P2 )
	{
		endGame(player);
	}
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
		if ( current_map[ tilePosition[1] ][ tilePosition[0] ] == tile_type.SOLID  ||
			current_map[ tilePosition[1] ][ tilePosition[0] ] == tile_type.DESTRUCTIBLE)
			return true; // collision detected

	}

	//no collision if all the tests are passed
	return false;
}

function isCollidingPlayer(player, nextPosition, adversary)
{
	var cornersPositions = [nextPosition, 
						[nextPosition[0] + player.size - 1, nextPosition[1]], 
						[nextPosition[0], nextPosition[1] + player.size - 1],
						[nextPosition[0] + player.size - 1, nextPosition[1] + player.size - 1]];
	for (var i = 0; i < cornersPositions.length; i++)
	{
		if( (cornersPositions[i][0] < adversary.x + adversary.size && cornersPositions[i][0] >= adversary.x) &&
			(cornersPositions[i][1] < adversary.y + adversary.size && cornersPositions[i][1] >= adversary.y) )
		{
			return true;
		}
	}
	return false;
}

function isCollidingBomb(player, nextPosition)
{
	var cornersPositions = [nextPosition, 
						[nextPosition[0] + player.size - 1, nextPosition[1]], 
						[nextPosition[0], nextPosition[1] + player.size - 1],
						[nextPosition[0] + player.size - 1, nextPosition[1] + player.size - 1]];
	
	var is_still_on_planted_bomb = [];

	for (var j = 0; j < player1.bombCounter.length; j++)
	{
		if(player1.bombCounter[j] != -1)
		{
			for (var i = 0; i < cornersPositions.length; i++)
			{
				if( (cornersPositions[i][0] < player1.bombPosition[j][0] * TILE_SIZE + TILE_SIZE &&
					 cornersPositions[i][0] >= player1.bombPosition[j][0] * TILE_SIZE) &&
					(cornersPositions[i][1] < player1.bombPosition[j][1] * TILE_SIZE + TILE_SIZE &&
					 cornersPositions[i][1] >= player1.bombPosition[j][1] * TILE_SIZE) )
				{
					if( player.walking_on_bomb_id.includes(j) && player.id == 1)
					{
						//IGNORE this case, player is still walking on his last planted bomb
						if( !is_still_on_planted_bomb.includes(j) )
							is_still_on_planted_bomb.push(j);

					}
					else
					{
						return true;
					}
				}
			}
		}
	}
	for (var j = 0; j < player2.bombCounter.length; j++)
	{
		if(player2.bombCounter[j] != -1)
		{
			for (var i = 0; i < cornersPositions.length; i++)
			{
				if( (cornersPositions[i][0] < player2.bombPosition[j][0] * TILE_SIZE + TILE_SIZE &&
					 cornersPositions[i][0] >= player2.bombPosition[j][0] * TILE_SIZE) &&
					(cornersPositions[i][1] < player2.bombPosition[j][1] * TILE_SIZE + TILE_SIZE &&
					 cornersPositions[i][1] >= player2.bombPosition[j][1] * TILE_SIZE) )
				{
					if( player.walking_on_bomb_id.includes(j) && player.id == 2)
					{
						//IGNORE this case, player is still walking on his last planted bomb
						if( !is_still_on_planted_bomb.includes(j) )
							is_still_on_planted_bomb.push(j);
					}
					else
					{
						return true;
					}
				}
			}
		}
	}

	for (var j = 0; j < player.walking_on_bomb_id.length; j++)
	{
		if( !is_still_on_planted_bomb.includes(player.walking_on_bomb_id[j]) )
		{
			player.walking_on_bomb_id.splice(player.walking_on_bomb_id.indexOf(player.walking_on_bomb_id[j]), 1);	
		}
		// for (var i = 0; i < is_still_on_planted_bomb.length; i++)
		// { 	// player is not walking on his planted bomb anymore
		// 	player.walking_on_bomb_id.splice(player.walking_on_bomb_id.indexOf(is_still_on_planted_bomb[i]), 1); 
		// }
	}
	return false;
}

function switchKeyPressed(player)
{
	var offset = 0;
	if(player.id == 2)
	{
		offset = 4;
	}
	for(var k = 0 ; k < 4; k++)
	{
		if(keyPressed[k + offset] == 0)
			keyPressed[k + offset] = 1;
		else
			keyPressed[k + offset] = 0;
	}
}

function updatePowerUpCollision(player)
{

	var DETECTION_OFFSET = 10;

	//check each corner
	var cornersPositions = [[player.x + DETECTION_OFFSET, player.y + DETECTION_OFFSET], 
						[player.x + player.size - 1 - DETECTION_OFFSET, player.y + DETECTION_OFFSET], 
						[player.x + DETECTION_OFFSET, player.y + player.size - 1 - DETECTION_OFFSET],
						[player.x + player.size - 1 - DETECTION_OFFSET, player.y + player.size - 1 - DETECTION_OFFSET]];
	for (var i = 0; i < cornersPositions.length; i++)
	{
		//find on which tile the corner is
		var tilePosition = findTilePosition(cornersPositions[i])
		for (var j = 0; j < power_ups.length; j++)
		{
			if ( tilePosition[0] == power_ups[j].tilePosition[0] && tilePosition[1] == power_ups[j].tilePosition[1])
			{
				//collision with power_up 
				switch(power_ups[j].type)
				{
					case POWER_UP_TYPE.POWER_INC:
						if(player.power < MAX_POWER)
							player.power++;
						break;
					case POWER_UP_TYPE.POWER_DEC:
						if(player.power > 1)
							player.power--;
						break;
					case POWER_UP_TYPE.PIERCE:
						player.pierce = 1;
						break;
					case POWER_UP_TYPE.NB_BOMBS_INC:
						if(player.nb_bombs < 3)
							player.nb_bombs++;
						break;
					case POWER_UP_TYPE.NB_BOMBS_DEC:
						if(player.nb_bombs > 1)
							player.nb_bombs--;
						break;
					case POWER_UP_TYPE.MOV_SPEED_INC:
						if(player.speed_factor >= SPEED_NORMAL)
							player.speed_factor = SPEED_FAST;
						else
							player.speed_factor = SPEED_NORMAL;
						break;
					case POWER_UP_TYPE.MOV_SPEED_DEC:
						if(player.speed_factor <= SPEED_NORMAL)
							player.speed_factor = SPEED_SLOW;
						else
							player.speed_factor = SPEED_NORMAL;
						break;
					case POWER_UP_TYPE.REMOTE:
						player.remote = 1;
						break;
					case POWER_UP_TYPE.INVERTED:
						if( player.inverted != 1)
						{
							player.inverted = 1;
							switchKeyPressed(player);
						}
						break;
					case POWER_UP_TYPE.NORMAL_DIR:
						if (player.inverted == 1)
						{
							player.inverted = 0;
							switchKeyPressed(player);
						}
						break;
				}

				$("#audio_ppup").clone()[0].play();

				$('#tile' + power_ups[j].tilePosition[0] + '_' + power_ups[j].tilePosition[1] + "> img.power_up").remove();
				power_ups.splice(j, 1);
				break;
			}
		}
	}

	//no collision if all the tests are passed
	return false;
}

function updatePosition(nextPosition, player, adversary, isDirectionX)
{
	// if(isCollidingPlayer(player, nextPosition, adversary))
	// {
	// 	//if collision with player, exit the function, player can't move in that direction
	// 	return;
	// }
	if(!isCollidingMap(player, nextPosition) && !isCollidingBomb(player, nextPosition))
	{
		player.x = nextPosition[0];
		player.y = nextPosition[1];

		updatePowerUpCollision(player);

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
	else //round position to the tile extremity
	{
		var tilePosition = findTilePosition(nextPosition)
		if(isDirectionX)
		{
			if(player.speedX < 0)
			{
				tilePosition[0]++;
			}
			player.x = tilePosition[0] * TILE_SIZE;
		}
		else
		{
			if(player.speedY < 0)
			{
				tilePosition[1]++;
			}
			player.y = tilePosition[1] * TILE_SIZE;
		}
	}
}

function updatePlayers()
{
	//update their position
	if(player1.speedX != 0)
		updatePosition( [player1.x + player1.speedX, player1.y], player1, player2, true);
	if(player1.speedY != 0)
		updatePosition( [player1.x, player1.y + player1.speedY], player1, player2, false);
	if(player2.speedX != 0)
		updatePosition( [player2.x + player2.speedX, player2.y], player2, player1, true);
	if(player2.speedY != 0)
		updatePosition( [player2.x, player2.y + player2.speedY], player2, player1, false);	

	//update the bomb counters
	for(var i = 0; i < player1.bombCounter.length; i++)
	{
		if(player1.bombCounter[i] >= 0)
			player1.bombCounter[i]++;
	}
	for(var i = 0; i < player2.bombCounter.length; i++)
	{
		if(player2.bombCounter[i] >= 0)
			player2.bombCounter[i]++;
	}
}

function plantBomb(player, adversary)
{
	if( player.nb_bombs_planted >= player.nb_bombs ) // do nothing if there is already a bomb planted by the player
		return;
	var bomb_id = -1;

	if(isCollidingPlayer(player, [player.x, player.y], adversary)) // do nothing if player is on another player
		return;

	var tilePosition = findTilePosition([player.x + player.size / 2, player.y + player.size / 2]);

	//check if no bomb already in place
	for(var i = 0; i < player1.bombPosition.length; i++)
	{
		if(player1.bombPosition[i][0] == tilePosition[0] && player1.bombPosition[i][1] == tilePosition[1])
			return;
	}
	for(var i = 0; i < player2.bombPosition.length; i++)
	{
		if(player2.bombPosition[i][0] == tilePosition[0] && player2.bombPosition[i][1] == tilePosition[1])
			return;
	}

	//assign an id to the first bomb slot available
	for(var i = 0; i < player.bombCounter.length; i++)
	{
		if (player.bombCounter[i] == -1)
		{
			player.bombCounter[i] = 0;
			bomb_id = i;
			break;
		}	

	}
	if(bomb_id < 0)
		return;
	player.nb_bombs_planted++;

	player.walking_on_bomb_id.push( bomb_id );

	$("#audio_planting").clone()[0].play();



	

	player.bombPosition[bomb_id] = tilePosition;

	var img = document.createElement("IMG");
	img.setAttribute("src", "resources/bomb.png");
	img.setAttribute("class", "bomb_img")
	img.setAttribute("style", 'top: ' + (player.bombPosition[bomb_id][1]) * TILE_SIZE + "px");
	$('#tile' + tilePosition[0] + '_' + tilePosition[1]).append(img);


	player.bomb_animation[bomb_id] = setInterval(function(){
	    var top_position = player.bomb_anim_counter[bomb_id] * 50;
	    var bottom_position = top_position + 50;
	    var bomb_img_get = $('#tile' + tilePosition[0] + '_' + tilePosition[1]).find('.bomb_img');
	    bomb_img_get.css('clip', "rect(" + top_position + "px, 50px, " + bottom_position + "px, 0)" );
	    bomb_img_get.css('top', (player.bombPosition[bomb_id][1]) * TILE_SIZE - TILE_SIZE * player.bomb_anim_counter[bomb_id]);
	    player.bomb_anim_counter[bomb_id]++;
	    if(player.bomb_anim_counter[bomb_id] == 4){
	    	player.bomb_anim_counter[bomb_id] = 0;
	    }
	},20);
}

function destroyTile(x, y)
{
	$('#tile' + x + '_' + y + "> img.tile_img").attr("src", "resources/empty.png");
	current_map[y][x] = tile_type.EMPTY;

	//random chance of a powerup spawning -- 
	if(getRandomInt(5) == 0)
	{
		//create new random powerups from the 10 types possible
		power_ups.push(new PowerUp(x,y, getRandomInt(10))); 

		var img = document.createElement("IMG");
		switch (power_ups[power_ups.length - 1].type)
		{
			case POWER_UP_TYPE.POWER_INC:
				img.setAttribute("src", "resources/ppup_powerP.png");
				break;
			case POWER_UP_TYPE.POWER_DEC:
				img.setAttribute("src", "resources/ppup_powerM.png");
				break;
			case POWER_UP_TYPE.PIERCE:
				img.setAttribute("src", "resources/ppup_pierce.png");
				break;
			case POWER_UP_TYPE.NB_BOMBS_INC:
				img.setAttribute("src", "resources/ppup_nbBombsP.png");
				break;
			case POWER_UP_TYPE.NB_BOMBS_DEC:
				img.setAttribute("src", "resources/ppup_nbBombsM.png");
				break;
			case POWER_UP_TYPE.MOV_SPEED_INC:
				img.setAttribute("src", "resources/ppup_speedP.png");
				break;
			case POWER_UP_TYPE.MOV_SPEED_DEC:
				img.setAttribute("src", "resources/ppup_speedM.png");
				break;
			case POWER_UP_TYPE.REMOTE:
				img.setAttribute("src", "resources/ppup_remote.png");
				break;
			case POWER_UP_TYPE.INVERTED:
				img.setAttribute("src", "resources/ppup_invert.png");
				break;
			case POWER_UP_TYPE.NORMAL_DIR:
				img.setAttribute("src", "resources/ppup_normal_direction.png");
				break;
		}
		img.setAttribute("class", "power_up")
		//img.setAttribute("style", 'top: ' + (player.bombPosition[bomb_id][1]) * TILE_SIZE + "px");
		$('#tile' + x + '_' + y).append(img);
	}


}

function CreateExplosionImg(src, position, player, bomb_id)
{
	var img = document.createElement("IMG");
	img.setAttribute("src", src);
	img.setAttribute("class", "explosion " + "explosion" + player.id + bomb_id);
	img.setAttribute("style", 'top: ' + (position[1]) * TILE_SIZE + "px");
	img.setAttribute("style", 'left: ' + (position[0]) * TILE_SIZE + "px");
	return img;
}

function getExplosionPosition(player, direction, bomb_id)
{
	var check_position = [0,0];
	switch (direction)
	{
		case branch_direction.UP:
			check_position = [player.explosions[bomb_id].positions[0][0], player.explosions[bomb_id].positions[0][1] - i];
			break;
		case branch_direction.DOWN:
			check_position = [player.explosions[bomb_id].positions[0][0], player.explosions[bomb_id].positions[0][1] + i];
			break;
		case branch_direction.LEFT:
			check_position = [player.explosions[bomb_id].positions[0][0] - i, player.explosions[bomb_id].positions[0][1]];
			break;
		case branch_direction.RIGHT:
			check_position = [player.explosions[bomb_id].positions[0][0] + i, player.explosions[bomb_id].positions[0][1]];
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

function drawExplosionBranch(player, branch_src, tip_src, direction, bomb_id)
{
	var actual_power = 0;
	var explosion_position = [0,0];
	for(i = 1 ; i <= player.power ; i++)
	{
		explosion_position = getExplosionPosition(player, direction, bomb_id);
		if(validatePosition(explosion_position) && 
			(current_map[explosion_position[1]][explosion_position[0]] == tile_type.EMPTY ||
				current_map[explosion_position[1]][explosion_position[0]] == tile_type.EXPLOSION_P1 ||
				current_map[explosion_position[1]][explosion_position[0]] == tile_type.EXPLOSION_P2 ) )
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
		explosion_position = getExplosionPosition(player, direction, bomb_id);

		player.explosions[bomb_id].positions.push(explosion_position);

		if(i == actual_power)
		{
			$('#tile' + explosion_position[0] + '_' + explosion_position[1]).append(
				CreateExplosionImg(tip_src, explosion_position, player, bomb_id) );	
		}
		else
		{
			$('#tile' + explosion_position[0] + '_' + explosion_position[1]).append(
				CreateExplosionImg(branch_src, explosion_position, player, bomb_id) );
		}
		if(player.id == 1)
			current_map[explosion_position[1]][explosion_position[0]] = tile_type.EXPLOSION_P1;
		else
			current_map[explosion_position[1]][explosion_position[0]] = tile_type.EXPLOSION_P2;
	}
}

function drawBombExplosionFrame(player, bomb_id)
{
	$(".explosion" + player.id + bomb_id).attr("src", "resources/explosion_middle.png");

	drawExplosionBranch(player, "resources/explosion_branchV.png", "resources/explosion_tip_top.png", branch_direction.UP, bomb_id);
	drawExplosionBranch(player, "resources/explosion_branchV.png", "resources/explosion_tip_bottom.png", branch_direction.DOWN, bomb_id);
	drawExplosionBranch(player, "resources/explosion_branchH.png", "resources/explosion_tip_left.png", branch_direction.LEFT, bomb_id);
	drawExplosionBranch(player, "resources/explosion_branchH.png", "resources/explosion_tip_right.png", branch_direction.RIGHT, bomb_id);

}

function foundOtherExplosions(x, y, player, bomb_id)
{
	for(var l = 0; l < player.explosions.length; l++)
	{
		if (l != bomb_id && player.explosions[l] != -1)
		{
			for(var m = 0; m < player.explosions[l].positions.length; m++)
			{
				if(player.explosions[l].positions[m][0] == x && player.explosions[l].positions[m][1] == y)
					return true;
			}
		}
	}

	var enemy;
	if(player.id == 1)
		enemy = player2;
	else
		enemy = player1;

	for(var l = 0; l < enemy.explosions.length; l++)
	{
		if(enemy.explosions[l] != -1)
		{
			for(var m = 0; m < enemy.explosions[l].positions.length; m++)
			{
				if(enemy.explosions[l].positions[m][0] == x && enemy.explosions[l].positions[m][1] == y)
					return true;
			}
		}
	}
	return false;
}

function clearExplosion(explosion_type, player, bomb_id)
{
	for(var j = 0; j < GRID_SIZE[1]; j++)
	{
		for(var i = 0; i < GRID_SIZE[0]; i++)
		{
			if(current_map[j][i] == explosion_type)
			{
				for(var k = 0; k < player.explosions[bomb_id].positions.length; k++)
				{
					//check if explosion tile is part of the explosion being cleared
					if(player.explosions[bomb_id].positions[k][0] == i && player.explosions[bomb_id].positions[k][1] == j)
					{
						if(!foundOtherExplosions(i, j, player, bomb_id))
							current_map[j][i] = tile_type.EMPTY;
					}
				}
			}
		}
	}
}

function drawBombExplosionAnimation(player, bomb_id)
{
	player.explosion_anim_counter[bomb_id] = 0;
	player.explosion_animation[bomb_id] = setInterval(function(){

		var explosion_offset = player.explosion_anim_counter[bomb_id] % 4 - 1; //[-1, 2]
		if(explosion_offset == 2) // [2]
			explosion_offset = 0; // [0]
		$(".explosion" + player.id + bomb_id).css('transform', " translate("+ + explosion_offset + "px)" );
		if(player.explosion_anim_counter[bomb_id]== 0)
		{
			$('#tile' + player.explosions[bomb_id].positions[0][0] + '_' + player.explosions[bomb_id].positions[0][1]).append(
				CreateExplosionImg("resources/explosion_one_tile.png", player.explosions[bomb_id], player, bomb_id) );

			if(player.id == 1)
				current_map[player.explosions[bomb_id].positions[0][1]][player.explosions[bomb_id].positions[0][0]] = tile_type.EXPLOSION_P1;
			else
				current_map[player.explosions[bomb_id].positions[0][1]][player.explosions[bomb_id].positions[0][0]] = tile_type.EXPLOSION_P2;
		}
		else if(player.explosion_anim_counter[bomb_id] == 5)
		{
			$(".explosion" + player.id + bomb_id).attr("src", "resources/explosion_middle.png");
			drawBombExplosionFrame(player, bomb_id);
		}
		else if(player.explosion_anim_counter[bomb_id] == 35)
		{

			$(".explosion" + player.id + bomb_id).remove();
			clearInterval(player.explosion_animation[bomb_id]);
			player.explosion_animation[bomb_id] = 0;
			player.explosion_anim_counter[bomb_id] = 0;
			if(player.id == 1)
			{	
				clearExplosion(tile_type.EXPLOSION_P1, player, bomb_id);
			}
			else
			{
				clearExplosion(tile_type.EXPLOSION_P2, player, bomb_id);
			}
			player.explosions[bomb_id] = -1;
			return;
		}

		player.explosion_anim_counter[bomb_id]++;
		
	}, 20) ;
}

function explodeBomb(player, bomb_id)
{
	$("#audio_explosion").clone()[0].play();

	var x = player.bombPosition[bomb_id][0];
	var y = player.bombPosition[bomb_id][1];
	$('#tile' + x + '_' + y + "> img.bomb_img").remove();

	//destroy destructible tiles in the x and y axis, according to the player<s power
	for(var i = 1; i <= player.power; i++)
	{
		if(y - i >= 0 && current_map[y - i][x] == tile_type.DESTRUCTIBLE)
		{
			destroyTile(x, y - i);
			if(player.pierce == 0)
				break;
		}
		else if(y - i >= 0 && current_map[y - i][x] == tile_type.SOLID)
			break;
	}
	for(var i = 1; i <= player.power; i++)
	{
		if(y + i < GRID_SIZE[1] && current_map[y + i][x] == tile_type.DESTRUCTIBLE)
		{
			destroyTile(x, y + i);
			if(player.pierce == 0)
				break;
		}
		else if(y + i < GRID_SIZE[1] && current_map[y + i][x] == tile_type.SOLID)
			break;
	}
	for(var i = 1; i <= player.power; i++)
	{
		if(x - i >= 0 && current_map[y][x - i] == tile_type.DESTRUCTIBLE)
		{
			destroyTile(x - i, y);
			if(player.pierce == 0)
				break;
		}
		else if(x - i >= 0 && current_map[y][x - i] == tile_type.SOLID)
			break;
	}
	for(var i = 1; i <= player.power; i++)
	{
		if(x + i < GRID_SIZE[0] && current_map[y][x + i] == tile_type.DESTRUCTIBLE)
		{
			destroyTile(x + i, y);
			if(player.pierce == 0)
				break;
		}
		else if(x + i < GRID_SIZE[0] && current_map[y][x + i] == tile_type.SOLID)
			break;
	}

	player.bombCounter[bomb_id] = -1;
	player.nb_bombs_planted--;
	clearInterval(player.bomb_animation[bomb_id]);
	player.bomb_animation[bomb_id] = 0;
	player.bomb_anim_counter[bomb_id] = 0;

	player.explosions[bomb_id] = new Explosion();
	player.explosions[bomb_id].positions.push(player.bombPosition[bomb_id]);
	player.bombPosition[bomb_id] = [0,0];

	drawBombExplosionAnimation(player, bomb_id);

}

function draw()
{

	$("#player1_char").css('top', player1.y - 20 - 2);
	$("#player1_shadow").css('top', player1.y - 5);
	$("#player1").css('left', player1.x);
	$("#player2_char").css('top', player2.y + player2_anim_onset - 9);
	$("#player2_shadow").css('top', player2.y - 9);
	$("#player2").css('left', player2.x);
}

$(document).ready(function(){
	//hint: http-server
	$('#left_panel').load('../navbar.html');
	$("#cover").fadeOut(100);

	$("#audio_planting")[0].load();
	$("#audio_planting")[0].volume = 1.0;
	$("#audio_explosion")[0].load();
	$("#audio_explosion")[0].volume = 0.5;
	$("#audio_ppup")[0].load();
	$("#audio_ppup")[0].volume = 0.5;
	$("#audio_death")[0].load();
	$("#audio_death")[0].volume = 0.5;

	$("#audio_music")[0].load();
	$("#audio_music")[0].volume = 0.22;
	$("#audio_music")[0].loop = true;
	$("#audio_music")[0].play();

	current_map = $.extend(true, [], map1);

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

		if(!is_game_ended)
		{
			checkExplosion(player1);
			checkExplosion(player2);
			updatePlayers();

			//check for bomb explosions
			if(player1.remote == 0)
			{
				for(var i = 0; i < player1.bombCounter.length; i++)
				{
					if(player1.bombCounter[i] >= BOMB_DELAY)
					{
						explodeBomb(player1, i);
					}
				}
			}
			if(player2.remote == 0)
			{
				for(var i = 0; i < player2.bombCounter.length; i++)
				{
					if(player2.bombCounter[i] >= BOMB_DELAY)
					{
						explodeBomb(player2, i);
					}
				}
			}

			//increase power_ups timers and check for timeouts
			for(var i = 0; i < power_ups.length; i++)
			{
				power_ups[i].timer++;
				if(power_ups[i].timer >= POWER_UP_DELAY)
				{
					$('#tile' + power_ups[i].tilePosition[0] + '_' + power_ups[i].tilePosition[1] + "> img.power_up").remove();
					power_ups.splice(i, 1);
					i--;
				}
			}

			draw();
		}
		
	}, 20);

	$(document).on('keydown',function(evt) {

		if(!is_game_ended)
		{
		    if ( (evt.keyCode == 38 && player1.inverted == 0) ||
		    		(evt.keyCode == 40 && player1.inverted == 1) ) { //UP
	    		player1.speedY = -player1.speed_factor;
	    		keyPressed[keys_enum.UP] = 1;
		    }
		    if ((evt.keyCode == 40 && player1.inverted == 0) ||
		    		(evt.keyCode == 38 && player1.inverted == 1) ) { //DOWN
	    		player1.speedY = player1.speed_factor;
	    		keyPressed[keys_enum.DOWN] = 1;
		    }
		    if ((evt.keyCode == 37 && player1.inverted == 0) ||
		    		(evt.keyCode == 39 && player1.inverted == 1) ) { //LEFT
	    		player1.speedX = -player1.speed_factor;
	    		keyPressed[keys_enum.LEFT] = 1;
		    }
		    if ((evt.keyCode == 39 && player1.inverted == 0) ||
		    		(evt.keyCode == 37 && player1.inverted == 1) ) { //RIGHT
	    		player1.speedX = player1.speed_factor;
	    		keyPressed[keys_enum.RIGHT] = 1;
		    }

		    if ((evt.keyCode == 87 && player2.inverted == 0) ||
		    		(evt.keyCode == 83 && player2.inverted == 1) ) { //W
	    		player2.speedY = -player2.speed_factor;
	    		keyPressed[keys_enum.W] = 1;
		    }
		    else if ((evt.keyCode == 83 && player2.inverted == 0) ||
		    		(evt.keyCode == 87 && player2.inverted == 1) ) { //S
	    		player2.speedY = player2.speed_factor;
	    		keyPressed[keys_enum.S] = 1;
		    }
		    else if ((evt.keyCode == 65 && player2.inverted == 0) ||
		    		(evt.keyCode == 68 && player2.inverted == 1) ) { //A
	    		player2.speedX = -player2.speed_factor;
	    		keyPressed[keys_enum.A] = 1;
	    		player2.img.css('transform', "scaleX(1)" );
		    }
		    else if ((evt.keyCode == 68 && player2.inverted == 0) ||
		    		(evt.keyCode == 65 && player2.inverted == 1) ) { //D
	    		player2.speedX = player2.speed_factor;
	    		keyPressed[keys_enum.D] = 1;
	    		player2.img.css('transform', "scaleX(-1)" );
		    }

		    //Bomb keys
		    if (evt.keyCode == 191) { // É
		    	plantBomb(player1, player2);
		    }
		    if (evt.keyCode == 81) { // Q
		    	plantBomb(player2, player1);
		    }

		    //Remote detonator keys
		    if (evt.keyCode == 190 && player1.remote == 1) { // .
		    	var highestCounter = player1.bombCounter[0];
		    	var highestCounterId = 0;
		    	for(var i = 1; i < player1.bombCounter.length; i++)
				{
					if(player1.bombCounter[i] > highestCounter)
					{
						highestCounter = player1.bombCounter[i];
						highestCounterId = i;
					}
				}
				if( highestCounter >= 0 )
				{
					explodeBomb(player1, highestCounterId);
				}
		    }
		    if (evt.keyCode == 49 && player2.remote == 1) { // 1
				var highestCounter = player2.bombCounter[0];
		    	var highestCounterId = 0;
		    	for(var i = 1; i < player2.bombCounter.length; i++)
				{
					if(player2.bombCounter[i] > highestCounter)
					{
						highestCounter = player2.bombCounter[i];
						highestCounterId = i;
					}
				}
				if( highestCounter >= 0 )
				{
					explodeBomb(player2, highestCounterId);
				}
		    }
		}
	});

	$(document).on('keyup',function(evt) {

	    if ((evt.keyCode == 38 && player1.inverted == 0) ||
	    		(evt.keyCode == 40 && player1.inverted == 1 ) ) { //UP
	    	if(!keyPressed[keys_enum.DOWN])
    			player1.speedY = 0;
    		keyPressed[keys_enum.UP] = 0;
	    }
	    if ((evt.keyCode == 40 && player1.inverted == 0) ||
	    		(evt.keyCode == 38 && player1.inverted == 1) ) { //DOWN
	    	if(!keyPressed[keys_enum.UP])
    			player1.speedY = 0;
    		keyPressed[keys_enum.DOWN] = 0;
	    }
	    if ((evt.keyCode == 37 && player1.inverted == 0) ||
	    		(evt.keyCode == 39 && player1.inverted == 1) ) { //LEFT
	    	if(!keyPressed[keys_enum.RIGHT])
    			player1.speedX = 0;
    		keyPressed[keys_enum.LEFT] = 0;
	    }
	    if ((evt.keyCode == 39 && player1.inverted == 0) ||
	    		(evt.keyCode == 37 && player1.inverted == 1) ) { //RIGHT
	    	if(!keyPressed[keys_enum.LEFT])
    			player1.speedX = 0;
    		keyPressed[keys_enum.RIGHT] = 0;
	    }

	    if ((evt.keyCode == 87 && player2.inverted == 0) ||
	    		(evt.keyCode == 83 && player2.inverted == 1) ) { //W
	    	if(!keyPressed[keys_enum.S])
    			player2.speedY = 0;
    		keyPressed[keys_enum.W] = 0;
	    }
	    else if ((evt.keyCode == 83 && player2.inverted == 0) ||
	    		(evt.keyCode == 87 && player2.inverted == 1) ) { //S
	    	if(!keyPressed[keys_enum.W])
    			player2.speedY = 0;
    		keyPressed[keys_enum.S] = 0;
	    }
	    else if ((evt.keyCode == 65 && player2.inverted == 0) ||
	    		(evt.keyCode == 68 && player2.inverted == 1) ) { //A
	    	if(!keyPressed[keys_enum.D])
    			player2.speedX = 0;
    		keyPressed[keys_enum.A] = 0;
	    }
	    else if ((evt.keyCode == 68 && player2.inverted == 0) ||
	    		(evt.keyCode == 65 && player2.inverted == 1) ) { //D
	    	if(!keyPressed[keys_enum.A])
    			player2.speedX = 0;
    		keyPressed[keys_enum.D] = 0;
	    }
	});

	$(document).on('click', '#restart_button', function(event){
		current_map = $.extend(true, [], map1);
		load_map();
	});

	$(document).on('click', '#sound_button', function(event){
		if($(this).hasClass("on"))
		{
			$(this).addClass("off");
			$(this).removeClass("on");
			$("#audio_music")[0].pause();
		}
		else
		{
			$(this).addClass("on");
			$(this).removeClass("off");
			$("#audio_music")[0].play();
		}
	});
		
});
