
var position_array = [];
var next_position = [];
var direction_enum = {
	UP: 1,
	DOWN: 2,
	LEFT: 3,
	RIGHT: 4
};
var direction = direction_enum.UP;
var direction_queue = [];//queue of direction change
var spot_location = [0,0];
var hasMovedSinceDirectionChanged = true;
var hasDied = false;
var death_color = ["#FFCE00", "#29253E"];
var keyPressed = [0,0,0,0];

var GRID_SIZE = 50;

var highscore = 0;



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

function initialize_game()
{
	for(i = 0; i < GRID_SIZE; i++)
    {
    	for(j = 0; j < GRID_SIZE; j++)
    		$("#tile" + i + "_" + j).css('background-color', '#29253E');
    }
	position_array = [[25,25],[26,25],[27,25],[28,25]];
	direction = direction_enum.UP;
	hasMovedSinceDirectionChanged = true;
	hasDied = false;
	draw_new_spot();
}

function validate_next_position()
{
	//check if still in the gaming zone
	if(next_position[0] >= 0 && next_position[0] < GRID_SIZE && 
		next_position[1] >= 0 && next_position[1] < GRID_SIZE)
	{
		//check if there's a collision with himself
		for( i = 0; i < position_array.length; i++)
		{
			if (next_position[0] == position_array[i][0] && next_position[1] == position_array[i][1])
				return false;
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
	for( i = 0; i < position_array.length; i++)
	{
		if (spot_location[0] == position_array[i][0] && spot_location[1] == position_array[i][1])
			return false;
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

function draw()
{
    $("#tile" + position_array[0][0] + "_" + position_array[0][1]).css('background-color', '#3BD11B');
    for(i = 1; i < position_array.length; i++)
    {
    	$("#tile" + position_array[i][0] + "_" + position_array[i][1]).css('background-color', '#4118F7');
    }
}

/*
function changeDirection(new_direction)
{
	direction = new_direction;
	hasMovedSinceDirectionChanged = false;
}
*/

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

function updateDirection()
{
	if(direction_queue.length > 0)
	{
		if(!isOppositeDirection(direction, direction_queue[0]) )
		{
			direction = direction_queue[0];
		}
		direction_queue.shift();
	}
}


$(document).ready(function(){
	//hint: http-server
	$('#left_panel').load('../navbar.html');
	$("#cover").fadeOut(100);

	$("#audio_music")[0].load();
	$("#audio_music")[0].volume = 0.2;
	$("#audio_music")[0].loop = true;
	$("#audio_music")[0].pause();

	load_grid();
	initialize_game();
	draw();

	//Used for death animation
	var counter = 0;
	var counter2 = 0;
	var lastcounter2 = counter2;

	setInterval(function(){ 

		if(hasDied)
		{
			counter2 = Math.floor(counter / 4) % 2;
			if(counter2 != lastcounter2)
			{
				lastcounter2 = counter2;

				for(i = 1; i < position_array.length; i++)
			    {
			    	$("#tile" + position_array[i][0] + "_" + position_array[i][1]).css('background-color', death_color[counter2]);
			    }
			}
				
		    counter++;
		}
		else{
			updateDirection();

			switch(direction) {
				case direction_enum.UP:
					next_position = [position_array[0][0] - 1, position_array[0][1]];
					break;
				case direction_enum.DOWN:
					next_position = [position_array[0][0] + 1, position_array[0][1]];
					break;
				case direction_enum.LEFT:
					next_position = [position_array[0][0], position_array[0][1] - 1];
					break;
				case direction_enum.RIGHT:
					next_position = [position_array[0][0], position_array[0][1] + 1];
					break;
			}
			

			//Check if snake is still in a valid place before updating
			if(validate_next_position())
			{
				position_array.unshift(next_position);
				
				// remove last part of snake unless he gets a goal spot
				if( next_position[0] != spot_location[0] || next_position[1] != spot_location[1]) 
				{
					removed_position = position_array.pop();
			    	$("#tile" + removed_position[0] + "_" + removed_position[1]).css('background-color', '#29253E');
			    }
			    else
			    {
			    	draw_new_spot();
			    }
	    		draw();

	    		//reset variable for a new draw iteration
	    		hasMovedSinceDirectionChanged = true;
	    	}
	    	else
	    	{
	    		hasDied = true;
	    		counter = 0;
				counter2 = 0;
				lastcounter2 = counter2;
				for(i = 1; i < position_array.length; i++)
			    {
					$("#tile" + position_array[i][0] + "_" + position_array[i][1]).css('background-color', death_color[0]);
				}
	    	}
	    }
	}, 80);

	//Detect arrow_keys pressed event
	$(document).on('keydown',function(evt) {

		if(!hasDied)
		{
		    if (evt.keyCode == 38 && !keyPressed[direction_enum.UP]) {
	    		direction_queue.push(direction_enum.UP);
		    }
		    if (evt.keyCode == 40 && !keyPressed[direction_enum.DOWN]) {
	    		direction_queue.push(direction_enum.DOWN);
		    }
		    if (evt.keyCode == 37 && !keyPressed[direction_enum.LEFT]) {
	    		direction_queue.push(direction_enum.LEFT);
		    }
		    if (evt.keyCode == 39 && !keyPressed[direction_enum.RIGHT]) {
	    		direction_queue.push(direction_enum.RIGHT);
		    }
		    if (evt.keyCode == 119) {
		    }
		    else if (evt.keyCode == 97) {
		    }
		    else if (evt.keyCode == 115) {
		    }
		    else if (evt.keyCode == 100) {
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
	    else if (evt.keyCode == 119) {
	    }
	    else if (evt.keyCode == 97) {
	    }
	    else if (evt.keyCode == 115) {
	    }
	    else if (evt.keyCode == 100) {
	    }
	});


	$(document).on('click', '#restart_button', function(event){
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
