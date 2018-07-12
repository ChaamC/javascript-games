
$.fn.extend({
	//add a change css event to the element queue
   qcss: function(css) {
      return $(this).queue(function(next) {
         $(this).css(css);
         next();
      });
   }
});

$(document).ready(function(){
	//hint: http-server
	$('#left_panel').load('../navbar.html');
	$("#cover").fadeOut(100);

	$("#audio_pop")[0].load();
	$("#audio_pop")[0].volume = 0.4;
	$("#audio_tic")[0].load();
	$("#audio_tic")[0].volume = 0.2;
	$("#audio_tic")[0].loop = true;
	$("#audio_tic")[0].play();

	$("#audio_win")[0].load();
	$("#audio_win")[0].volume = 0.8;
	$("#audio_tie")[0].load();
	$("#audio_tie")[0].volume = 0.8;

	var is_x_turn = true;
	var is_x_last_starter = true;
	var is_game_finished = false;
	var boxes_content = [0,0,0,
						0,0,0,
						0,0,0];
	var nb_of_wins = [0,0,0] //[P1, P2, Ties]
	var winner_color = ['#4963D3', '#FD0200'];

	$("#score_p1").css( 'font-weight', 'bold');
	$('#score_p1').css('background-color', '#ffd284');

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

	function checkTieConditions(){
		for(i = 0; i < 9; i++)
		{
			if(boxes_content[i] == 0)
			{
				return false;
			}
		}
		return true;
	}

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

	function drawNextTurnDisplay(){
		if(is_x_turn){
			$("#score_p1").css( 'font-weight', 'bold');
			$('#score_p1').css('background-color', '#ffd284');
			$('#score_p2').css('background-color', '#EEEEDD');
			$("#score_p2").css( 'font-weight', 'normal');
		}
		else
		{
			$("#score_p2").css( 'font-weight', 'bold');
			$('#score_p2').css('background-color', '#ffd284');
			$('#score_p1').css('background-color', '#EEEEDD');
			$("#score_p1").css( 'font-weight', 'normal');
		}
	}

	$(document).on('click', '#restart_button', function(event){
		//Alternate between players to play first in a match
		is_x_last_starter = !is_x_last_starter;
		is_x_turn = is_x_last_starter;

		drawNextTurnDisplay();
		is_game_finished = false;
		boxes_content = [0,0,0,
						0,0,0,
						0,0,0];
		$("img.xImg").remove();
		$("img.oImg").remove();
	});

	$(document).on('click', '#sound_button', function(event){
		if($(this).hasClass("on"))
		{
			$(this).addClass("off");
			$(this).removeClass("on");
			$("#audio_tic")[0].pause();
		}
		else
		{
			$(this).addClass("on");
			$(this).removeClass("off");
			$("#audio_tic")[0].play();
		}
	});

	$(document).on('click', '.column', function(event){

		if(boxes_content[event.target.id] == 0 && 
			!is_game_finished)
		{
			$("#audio_pop").clone()[0].play();

			if (is_x_turn)
			{
				boxes_content[event.target.id] = 1;
			}
			else
			{
				boxes_content[event.target.id] = 2;
			}
			is_x_turn = !is_x_turn;

			drawNextTurnDisplay();

			drawBoxes(event.target.id);

			var winner = checkVictoryConditions()
			if(winner)
			{
				$('#score_p1').css('background-color', '#EEEEDD');
				$('#score_p2').css('background-color', '#EEEEDD');
				$("#score_p1").css( 'font-weight', 'normal');
				$("#score_p2").css( 'font-weight', 'normal');
				color = winner_color[winner-1];
				nb_of_wins[winner-1]++;
				is_game_finished = true;
				$('#winner'+winner).text(nb_of_wins[winner-1]);
				$('#score_p'+winner).css('background-color', color)
									.delay(350).qcss({ backgroundColor: '#EEEEDD'})
									.delay(350).qcss({ backgroundColor: color})
									.delay(350).qcss({ backgroundColor: '#EEEEDD'})
									.delay(350).qcss({ backgroundColor: color})
									.delay(350).qcss({ backgroundColor: '#EEEEDD'});
				$("#audio_win")[0].play();
			}
			else if(checkTieConditions())
			{
				$('#score_p1').css('background-color', '#EEEEDD');
				$('#score_p2').css('background-color', '#EEEEDD');
				$("#score_p1").css( 'font-weight', 'normal');
				$("#score_p2").css( 'font-weight', 'normal');
				nb_of_wins[2]++;
				is_game_finished = true;
				$('#ties').text(nb_of_wins[2]);
				$('#score_tie').css('background-color', '#63D349')
									.delay(350).qcss({ backgroundColor: '#EEEEDD'})
									.delay(350).qcss({ backgroundColor: '#63D349'})
									.delay(350).qcss({ backgroundColor: '#EEEEDD'})
									.delay(350).qcss({ backgroundColor: '#63D349'})
									.delay(350).qcss({ backgroundColor: '#EEEEDD'});
				$("#audio_tie")[0].play();
			}

		}
	});
});
