( function(){

	var custom1 = function(){
		var step = 0
		,	storage
		;
		return {
			'go': function( state ){
				switch( step ) {
					case 0:
						storage = state.lexeme = state.lexeme[0].toUpperCase().split( '' );
						break;
					case 1:
						if ( !storage.length ) storage = [];
						storage[storage.length - 1] += state.lexeme[0].toUpperCase();
						state.lexeme = storage;
						break;
					case 2:
						var spaces = ''
						,	j
						;
						for ( var i = storage[storage.length - 1].length - 2; i--; ) {
							spaces += ' ';
						}
						for ( i = storage.length - 1, j = state.lexeme[0].length - 1; i--; j-- ) {
							storage[i] += ( spaces + state.lexeme[0][j].toUpperCase() );
						}
						state.lexeme = storage;
						break;
					case 3:
						storage.unshift( state.lexeme[0].toUpperCase() );
						state.lexeme = storage;
						break;
					case 4:
						storage[0] += '  V     V  EEEEE  RRRR';
						storage[1] += '   V   V   E      R   R';
						storage[2] += '    V V    EEE    RRRR';
						storage[3] += '     V     EEEEE  R   R';
						state.lexeme = storage;
						break;
				}
				step++;
			},
			'off': function(){
				step = 0;
				storage = [];
			}
		}
	};
	
	if ( window.ConsoleFunEffects ) {
		window.ConsoleFunEffects['custom1'] = custom1;
	} else {
		window.ConsoleFunEffects = { 'custom1': custom1 };
	}

} )();