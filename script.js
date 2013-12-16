( function(){

	var	player = document.getElementById( 'player' )
	,	lyrics = [
			{ l: 'work', t: 0, e: 'inline' },
			{ l: 'it', t: 250 },
			{ l: 'harder', t: 487 },
			{ l: 'make', t: 975, e: '/inline inline' },
			{ l: 'it', t: 1251 },
			{ l: 'better', t: 1457 },
			{ l: 'do', t: 1948, e: '/inline' },
			{ l: 'it', t: 2208 },
			{ l: 'faster', t: 2429 }, 
			{ l: 'makes', t: 2919 },
			{ l: 'us', t: 3191 },
			{ l: 'stronger', t: 3402 },
			{ l: 'more', t: 3891, e: 'inline' },
			{ l: 'than', t: 4137 },
			{ l: 'ever', t: 4373 },
			{ l: 'hour', t: 4865, e: '/inline uppercase' },
			{ l: 'after', t: 5346 },
			{ l: 'our', t: 5835, e: '/uppercase inline_back' },
			{ l: 'work', t: 6317 },
			{ l: 'is', t: 6588 },
			{ l: 'never', t: 6808 },
			{ l: 'over', t: 7289, e: '/inline_back uppercase' },

			{ l: 'work', t: 7776, e: '/uppercase step' },
			{ l: 'it', t: 8014 },
			{ l: 'harder', t: 8261 },
			{ l: 'make', t: 8748, e: '/step step' },
			{ l: 'it', t: 9015 },
			{ l: 'better', t: 9233 },
			{ l: 'do', t: 9719, e: '/step step_back' },
			{ l: 'it', t: 9974 },
			{ l: 'faster', t: 10205 }, 
			{ l: 'makes', t: 10692 },
			{ l: 'us', t: 10972 },
			{ l: 'stronger', t: 11178 },
			{ l: 'more', t: 11666, e: '/step_back between' },
			{ l: 'than', t: 11895 },
			{ l: 'ever', t: 12148 },
			{ l: 'hour', t: 12638 },
			{ l: 'after', t: 13120 },
			{ l: 'our', t: 13608, e: '/between custom1' },
			{ l: 'work', t: 14090 },
			{ l: 'is', t: 14362 },
			{ l: 'never', t: 14580 },
			{ l: 'over', t: 15063 },

			{ l: 'work', t: 15550, e: '/custom1 stack' },
			{ l: 'it', t: 15788 },
			{ l: 'har', t: 16035 },
			{ l: 'der', t: 16279 },
			{ l: 'make', t: 16522 },
			{ l: 'it', t: 16789 },
			{ l: 'bet', t: 17007 },
			{ l: 'ter', t: 17251 },
			{ l: 'do', t: 17493 },
			{ l: 'it', t: 17748 },
			{ l: 'fas', t: 17979 }, 
			{ l: 'ter', t: 18223 }, 
			{ l: 'makes', t: 18466 },
			{ l: 'us', t: 18746 },
			{ l: 'stron', t: 18952 },
			{ l: 'ger', t: 19196 },
			{ l: 'more', t: 19440, e: '/stack break' },
			{ l: 'than', t: 19669 },
			{ l: 'ever', t: 19922 },
			{ l: 'hour', t: 20412 },
			{ l: 'after', t: 20894 },
			{ l: 'our', t: 21382, e: '/break table' },
			{ l: 'work', t: 21864 },
			{ l: 'is', t: 22136 },
			{ l: 'never', t: 22354 },
			{ l: 'over', t: 22839, e: '/table noclear error uppercase' }
		]
	;

	player.oncanplaythrough = tempFunctionForPlayerToWorkProperly();
	function tempFunctionForPlayerToWorkProperly(){
		var cf = new ConsoleFun( lyrics, { lag: 0 } );
		player.play();
		cf.launch();
	};

} )();