

var direction_enum = {
	UP: 1,
	DOWN: 2,
	LEFT: 3,
	RIGHT: 4,
	W: 5,
	S: 6,
	A: 7,
	D: 8
};

var spot_location = [0,0];

var death_color = ["#FFCE00", "#29253E"];
var keyPressed = [0,0,0,0, 0,0,0,0];

var start_message = ["Press key to start", ""];

var gameStarted = false;

function snake () {
	this.ID = "";
	this.position_array = [];
	this.next_position = []
	this.direction = -1;
	this.direction_queue = [];
	this.hasMovedSinceDirectionChanged = true;
	this.hasDied = false;
	this.color = [];
	this.score = 0;
}
var snake1 = new snake();
var snake2 = new snake();

var isP2Mode = false;

var GRID_SIZE = 50;
var STARTING_LENGTH = 4;

var highscore = 0;
var tie_score = 0;

//Used for death animation
var counter = 0;
var counter2 = 0;
var lastcounter2 = counter2;


function load_grid()
{
	var grid_html = "";
	for (i = 0; i < GRID_SIZE; i++)
	{
		grid_html += "<div class=\"row\">\n";
		for (j = 0; j < GRID_SIZE; j++)
		{
			grid_html += "<div class=\"column\" id=\"tile" + i + "_" + j + "\"></div>\n";
		}
		grid_html += "</div>\n"
	}
	$('#game_screen').html(grid_html);
}
//HEAD = #4118F7
//BODY = #3BD11B
//http://paletton.com/#uid=32L1q1kllll8h12eObcrSvuCcXTkllll8h12eObcrSvuCcXTkllll8h12eObcrSvuCcXT
//starting position

function updateScoreDisplay()
{
	if(isP2Mode)
	{
		$("#best_score").text("");
		$("#p1_score").text("Blue : " + snake1.score);
		$("#p2_score").text("Purple : " + snake2.score);
		$("#tie_score").text("Ties : " + tie_score);
	}
	else
	{
		$("#best_score").text("High score : " + highscore);
		$("#p1_score").text("");
		$("#p2_score").text("");
		$("#tie_score").text("");
	}
}

function initialize_game()
{

	for(i = 0; i < GRID_SIZE; i++)
    {
    	for(j = 0; j < GRID_SIZE; j++)
    		$("#tile" + i + "_" + j).css('background-color', '#29253E');
    }
	snake1.position_array = [[25,25],[26,25],[27,25],[28,25]];
	snake1.direction = direction_enum.UP;
	snake1.direction_queue = [];
	snake1.hasMovedSinceDirectionChanged = true;
	snake1.hasDied = false;

	if(isP2Mode)
	{
		snake1.position_array = [[25,35],[26,35],[27,35],[28,35]];
	}
	snake2.position_array = [[25,15],[26,15],[27,15],[28,15]];
	snake2.direction = direction_enum.W;
	snake2.direction_queue = [];
	snake2.hasMovedSinceDirectionChanged = true;
	snake2.hasDied = false;

	gameStarted = false;

	draw_new_spot();

	draw_player(snake1.position_array, snake1.color);
	if(isP2Mode)
	{
		draw_player(snake2.position_array, snake2.color);
	}

	counter = 0;
	counter2 = 0;
	lastcounter2 = counter2;
	$("#input_message").text(start_message[counter2]);
	$("#winner_message").text("");
}

function validate_next_position(next_pos, position_arr, position_arr_enemy)
{
	//check if still in the gaming zone
	if(next_pos[0] >= 0 && next_pos[0] < GRID_SIZE && 
		next_pos[1] >= 0 && next_pos[1] < GRID_SIZE)
	{
		//check if there's a collision with himself
		for( i = 0; i < position_arr.length; i++)
		{
			if (next_pos[0] == position_arr[i][0] && next_pos[1] == position_arr[i][1])
				return false;
		}
		if(isP2Mode)
		{
			//check if there's a collision with other player
			for( i = 0; i < position_arr_enemy.length; i++)
			{
				if (next_pos[0] == position_arr_enemy[i][0] && next_pos[1] == position_arr_enemy[i][1])
					return false;
			}
		}
	}
	else
	{
		return false;
	}
	//OKAY if passed all the tests
	return true;
}


function validate_new_spot()
{
	for( i = 0; i < snake1.position_array.length; i++)
	{
		if (spot_location[0] == snake1.position_array[i][0] && spot_location[1] == snake1.position_array[i][1])
			return false;
	}
	if(isP2Mode)
	{
		for( i = 0; i < snake2.position_array.length; i++)
		{
			if (spot_location[0] == snake2.position_array[i][0] && spot_location[1] == snake2.position_array[i][1])
				return false;
		}
	}
	return true;
}

function draw_new_spot()
{
	do
	{
		spot_location = [ Math.floor(Math.random() * GRID_SIZE), Math.floor(Math.random() * GRID_SIZE) ];
	} while ( !validate_new_spot() );
	$("#tile" + spot_location[0] + "_" + spot_location[1]).css('background-color', 'red');
}

function draw_player(position_arr, color)
{
    $("#tile" + position_arr[0][0] + "_" + position_arr[0][1]).css('background-color', color[0]);
    for(i = 1; i < position_arr.length; i++)
    {
    	$("#tile" + position_arr[i][0] + "_" + position_arr[i][1]).css('background-color', color[1]);
    }
}

function isOppositeDirection(direction1, direction2)
{
	if(direction1 == direction_enum.UP && direction2 == direction_enum.DOWN)
		return true;
	if(direction1 == direction_enum.DOWN && direction2 == direction_enum.UP)
		return true;
	if(direction1 == direction_enum.LEFT && direction2 == direction_enum.RIGHT)
		return true;
	if(direction1 == direction_enum.RIGHT && direction2 == direction_enum.LEFT)
		return true;
	return false;
}
function isOppositeDirectionP2(direction1, direction2)
{
	if(direction1 == direction_enum.W && direction2 == direction_enum.S)
		return true;
	if(direction1 == direction_enum.S && direction2 == direction_enum.W)
		return true;
	if(direction1 == direction_enum.A && direction2 == direction_enum.D)
		return true;
	if(direction1 == direction_enum.D && direction2 == direction_enum.A)
		return true;
	return false;
}
function arePlayersOppositeDirection(directionP1, directionP2)
{
	if(directionP1 == direction_enum.UP && directionP2 == direction_enum.S)
		return true;
	if(directionP1 == direction_enum.DOWN && directionP2 == direction_enum.W)
		return true;
	if(directionP1 == direction_enum.LEFT && directionP2 == direction_enum.D)
		return true;
	if(directionP1 == direction_enum.RIGHT && directionP2 == direction_enum.A)
		return true;
	return false;
}

function updateDirection()
{
	if(snake1.direction_queue.length > 0)
	{
		if(!isOppositeDirection(snake1.direction, snake1.direction_queue[0]) )
		{
			snake1.direction = snake1.direction_queue[0];
		}
		snake1.direction_queue.shift();
	}
	if(isP2Mode)
	{
		if(snake2.direction_queue.length > 0)
		{
			if(!isOppositeDirectionP2(snake2.direction, snake2.direction_queue[0]) )
			{
				snake2.direction = snake2.direction_queue[0];
			}
			snake2.direction_queue.shift();
		}
	}
}

function moveSnake(p_snake, enemy_snake)
{
	//Check if snake is still in a valid place before updating
	if(validate_next_position(p_snake.next_position, p_snake.position_array, enemy_snake.position_array))
	{
		p_snake.position_array.unshift(p_snake.next_position);
		
		// remove last part of snake unless he gets a goal spot
		if( p_snake.next_position[0] != spot_location[0] || p_snake.next_position[1] != spot_location[1]) 
		{
			var removed_position = p_snake.position_array.pop();
	    	$("#tile" + removed_position[0] + "_" + removed_position[1]).css('background-color', '#29253E');
	    }
	    else
	    {
	    	draw_new_spot();
	    }
		draw_player(p_snake.position_array, p_snake.color);

		//reset variable for a new draw iteration
		p_snake.hasMovedSinceDirectionChanged = true;
	}
	else
	{
		p_snake.hasDied = true;
		counter = 0;
		counter2 = 0;
		lastcounter2 = counter2;
		for(i = 1; i < p_snake.position_array.length; i++)
	    {
			$("#tile" + p_snake.position_array[i][0] + "_" + p_snake.position_array[i][1]).css('background-color', death_color[0]);
		}

		$("#input_message").text("Press spacebar to restart, dude");

		if(isP2Mode)
		{
			//check if is a tie
			if(p_snake.next_position[0] == enemy_snake.position_array[0][0] &&
				p_snake.next_position[1] == enemy_snake.position_array[0][1] &&
				arePlayersOppositeDirection(snake1.direction, snake2.direction) )
			{
				enemy_snake.hasDied = true;
				for(i = 1; i < enemy_snake.position_array.length; i++)
			    {
					$("#tile" + enemy_snake.position_array[i][0] + "_" + enemy_snake.position_array[i][1]).css('background-color', death_color[0]);
				}
				$("#winner_message").text("It's a tie, oh my gadd D:");
				tie_score++;
			}
			else
			{
				$("#winner_message").text(enemy_snake.ID + " WINS!! :P");
				enemy_snake.score++;
			}
			updateScoreDisplay()
		}
		else
		{
			var score = p_snake.position_array.length - STARTING_LENGTH;
			if(highscore < score)
			{
				highscore = score;
				updateScoreDisplay()
			}
			$("#winner_message").text("Score : " + score);
		}
	}
}

function deathAnimation()
{
	counter2 = Math.floor(counter / 4) % 2;
	if(counter2 != lastcounter2)
	{
		lastcounter2 = counter2;

		if(snake1.hasDied)
		{
			for(i = 1; i < snake1.position_array.length; i++)
		    {
		    	$("#tile" + snake1.position_array[i][0] + "_" + snake1.position_array[i][1]).css('background-color', death_color[counter2]);
		    }
		}
		if(snake2.hasDied)
		{
			for(i = 1; i < snake2.position_array.length; i++)
		    {
		    	$("#tile" + snake2.position_array[i][0] + "_" + snake2.position_array[i][1]).css('background-color', death_color[counter2]);
		    }
		}
	}
    counter++;
}

$(document).ready(function(){
	//hint: http-server
	$('#left_panel').load('../navbar.html');
	$("#cover").fadeOut(100);

	$("#audio_music")[0].load();
	$("#audio_music")[0].volume = 0.9;
	$("#audio_music")[0].loop = true;
	$("#audio_music")[0].play();

	snake1.direction = direction_enum.UP;
	snake2.direction = direction_enum.W;
	snake1.color = ["#3BD11B", "#4118F7"];
	snake2.color = ["#eb7d2f", "#8e25a8"];//ff33cc
	snake1.ID = "Blue";
	snake2.ID = "Purple";

	load_grid();
	initialize_game();

	setInterval(function(){ 

	
		if(snake1.hasDied || snake2.hasDied)
		{
			deathAnimation();
		}
		else if(gameStarted)
		{
			updateDirection();

			switch(snake1.direction) {
				case direction_enum.UP:
					snake1.next_position = [snake1.position_array[0][0] - 1, snake1.position_array[0][1]];
					break;
				case direction_enum.DOWN:
					snake1.next_position = [snake1.position_array[0][0] + 1, snake1.position_array[0][1]];
					break;
				case direction_enum.LEFT:
					snake1.next_position = [snake1.position_array[0][0], snake1.position_array[0][1] - 1];
					break;
				case direction_enum.RIGHT:
					snake1.next_position = [snake1.position_array[0][0], snake1.position_array[0][1] + 1];
					break;
			}

			switch(snake2.direction) {
				case direction_enum.W:
					snake2.next_position = [snake2.position_array[0][0] - 1, snake2.position_array[0][1]];
					break;
				case direction_enum.S:
					snake2.next_position = [snake2.position_array[0][0] + 1, snake2.position_array[0][1]];
					break;
				case direction_enum.A:
					snake2.next_position = [snake2.position_array[0][0], snake2.position_array[0][1] - 1];
					break;
				case direction_enum.D:
					snake2.next_position = [snake2.position_array[0][0], snake2.position_array[0][1] + 1];
					break;
			}
			
			moveSnake(snake1, snake2);

			if(isP2Mode)
			{
				moveSnake(snake2, snake1);
			}
	    }
	    else
	    {
	    	counter2 = Math.floor(counter / 6) % 2;
			if(counter2 != lastcounter2)
			{
				lastcounter2 = counter2;

			    $("#input_message").text(start_message[counter2]);
			    
			}
				
		    counter++;
	    }
	}, 80);

	

	//Detect arrow_keys pressed event
	$(document).on('keydown',function(evt) {
		if(!gameStarted)
		{
			if (evt.keyCode == 38 ||
				evt.keyCode == 40 ||
				evt.keyCode == 37 ||
				evt.keyCode == 39)
			{
				gameStarted = true;
				$("#input_message").text("");
			}
			else if (isP2Mode && (evt.keyCode == 87 ||
								evt.keyCode == 83 ||
								evt.keyCode == 65 ||
								evt.keyCode == 68) )
			{
				gameStarted = true;	
				$("#input_message").text("");	
			}
		}

		if(gameStarted)
		{
			if(!snake1.hasDied)
			{
			    if (evt.keyCode == 38 && !keyPressed[direction_enum.UP]) {
		    		snake1.direction_queue.push(direction_enum.UP);
			    }
			    if (evt.keyCode == 40 && !keyPressed[direction_enum.DOWN]) {
		    		snake1.direction_queue.push(direction_enum.DOWN);
			    }
			    if (evt.keyCode == 37 && !keyPressed[direction_enum.LEFT]) {
		    		snake1.direction_queue.push(direction_enum.LEFT);
			    }
			    if (evt.keyCode == 39 && !keyPressed[direction_enum.RIGHT]) {
		    		snake1.direction_queue.push(direction_enum.RIGHT);
			    }
			}
			if(isP2Mode && !snake2.hasDied)
		    {
			    if (evt.keyCode == 87) {
	    			snake2.direction_queue.push(direction_enum.W);
			    }
			    else if (evt.keyCode == 83) {
	    			snake2.direction_queue.push(direction_enum.S);
			    }
			    else if (evt.keyCode == 65) {
	    			snake2.direction_queue.push(direction_enum.A);
			    }
			    else if (evt.keyCode == 68) {
	    			snake2.direction_queue.push(direction_enum.D);
			    }
			}
			if(snake1.hasDied || snake2.hasDied)
			{
				if (evt.keyCode == 32) // spacebar to restart a game
				{
					initialize_game();
				}
			}
		}
	});


	$(document).on('keyup',function(evt) {
		if (evt.keyCode == 38) {
	    	keyPressed[direction_enum.UP] = false;
	    }
	    else if (evt.keyCode == 40) {
	    	keyPressed[direction_enum.DOWN] = false;
	    }
	    else if (evt.keyCode == 37) {
	    	keyPressed[direction_enum.LEFT] = false;
	    }
	    else if (evt.keyCode == 39) {
	    	keyPressed[direction_enum.RIGHT] = false;
	    }
	    if(isP2Mode)
	    {
		    if (evt.keyCode == 87) {
	    		keyPressed[direction_enum.W] = false;
		    }
		    else if (evt.keyCode == 83) {
	    		keyPressed[direction_enum.S] = false;
		    }
		    else if (evt.keyCode == 65) {
	    		keyPressed[direction_enum.A] = false;
		    }
		    else if (evt.keyCode == 68) {
	    		keyPressed[direction_enum.D] = false;
		    }
		}
	});


	$(document).on('click', '#oneP_button', function(event){
		isP2Mode = false;
		updateScoreDisplay()
		$("#oneP_button").css("text-decoration", "underline");
		$("#twoP_button").css("text-decoration", "none");
		initialize_game();
	});

	$(document).on('click', '#twoP_button', function(event){
		isP2Mode = true;
		$("#oneP_button").css("text-decoration", "none");
		$("#twoP_button").css("text-decoration", "underline");
		updateScoreDisplay()
		initialize_game();
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
