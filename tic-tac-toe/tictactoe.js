

$(document).ready(function(){
	//hint: http-server
	$('#left_panel').load('../navbar.html');
	$("#cover").fadeOut(100);

	var is_x_turn = true;
	var is_game_won = false;
	var boxes_content = [0,0,0,
						0,0,0,
						0,0,0];
	var nb_of_wins = [0,0]

	function checkVictoryConditions(){
		//check horizontal lines
		for(i = 0; i < 9; i += 3)
			if(boxes_content[i] != 0 && 
				boxes_content[i] == boxes_content[i + 1] && 
				boxes_content[i] == boxes_content[i + 2])
				return boxes_content[i];
		//check vertical lines
		for(i = 0; i < 3; i++)
			if(boxes_content[i] != 0 && 
				boxes_content[i] == boxes_content[i + 3] && 
				boxes_content[i] == boxes_content[i + 2 * 3])
				return boxes_content[i];
		//check diagonal lines
		if(boxes_content[0] != 0 && boxes_content[0] == boxes_content[4] && boxes_content[0] == boxes_content[8])
			return boxes_content[0];
		if(boxes_content[2] != 0 && boxes_content[2] == boxes_content[4] && boxes_content[2] == boxes_content[6])
				return boxes_content[2];
		return false;
	};
	function drawBoxes(boxID){
		if(boxes_content[boxID] == 1 )
		{
			var xImg = document.createElement("IMG");
			xImg.setAttribute("src", "resources/X.png");
			xImg.setAttribute("class", "xImg")
			$('#'+boxID).append(xImg);
		}
		else if(boxes_content[boxID] == 2 )
		{
			var oImg = document.createElement("IMG");
			oImg.setAttribute("src", "resources/O.png");
			oImg.setAttribute("class", "oImg")
			$('#'+boxID).append(oImg);
		}
	};

	$(document).on('click', '#restart_button', function(event){
		is_x_turn = true;
		is_game_won = false;
		boxes_content = [0,0,0,
						0,0,0,
						0,0,0];
		$("img.xImg").remove();
		$("img.oImg").remove();
	});

	$(document).on('click', '.column', function(event){

		if(boxes_content[event.target.id] == 0 && 
			!is_game_won)
		{
			if (is_x_turn)
				boxes_content[event.target.id] = 1;
			else
				boxes_content[event.target.id] = 2;
			is_x_turn = !is_x_turn;

			drawBoxes(event.target.id);

			var winner = checkVictoryConditions()
			if(winner)
			{
				nb_of_wins[winner-1]++;
				is_game_won = true;
				$('#winner'+winner).text(nb_of_wins[winner-1]);
			}
		}
	});
});
