( function(){

	var	ConsoleFun = function( map, params ){
			var that = this
			,	defaultConsoleFunEffects = {
					'inline': function(){
							var storage = [];
							return {
								'go': function( state ){
									for ( var i = 0, l = state.lexeme.length; i < l; i++ ){
										storage[i] = state.lexeme[i] = storage[i] ? [storage[i], state.lexeme[i]].join( ' ' ) : state.lexeme[i];
									}
								},
								'off': function(){
									storage = [];
								}
							}
						},
					'inline_back': function(){
						var storage = [];
						return {
							'go': function( state ){
								for ( var i = 0, l = state.lexeme.length; i < l; i++ ){
									storage[i] = state.lexeme[i] = storage[i] ? [state.lexeme[i], storage[i]].join( ' ' ) : state.lexeme[i];
								}
							},
							'off': function(){
								storage = [];
							}
						}
					},
					'step': function(){
						var storage = '';
						return {
							'go': function( state ) {
								for ( var i = 0, l = state.lexeme.length; i < l; i++ ){
									state.lexeme[i] = [storage, state.lexeme[i]].join( '' );
								}									
								state.clear = !storage;
								storage += '    ';
							},
							'off': function(){
								storage = '';
							}
						}
					},
					'step_back': function(){
						var storage = [];
						function spaces( quantity ){
							var result = '';
							for ( var i = 0; i < quantity; i++ ) {
								result += '    ';
							}
							return result;
						};
						return {
							'go': function( state ) {
								var result = [];
								storage = storage.concat( state.lexeme );
								for ( var i = 0, l = storage.length; i < l; i++ ){
									result[l - 1 - i] = [spaces( i ), storage[l - 1 - i]].join( '' );
								}
								state.lexeme = result;
							},
							'off': function(){
								storage = [];
							}
						}
					},
					'between': function(){
						var storage = []
						,	step = 0
						;
						function insert( index, lexeme ){
							var initial = ( storage.length > index && storage[index] ) ? storage[index].toLowerCase() : ''
							,	startFrom = ( lexeme.length < initial.length )
							,	result = []
							;
							initial = initial.split( '' );
							lexeme = lexeme.toUpperCase().split( '' );
							for ( var i = 0, l = lexeme.length; i < l; i++ ) {
								if ( startFrom && initial.length ) {
									result.push( initial.shift() );
								}
								startFrom = true;
								result.push( lexeme[i] );
							}
							return result.join( '' );
						};
						return {
							'go': function( state ){
								for ( var i = 0, l = state.lexeme.length; i < l; i++ ){
									storage[i] = state.lexeme[i] = insert( i, state.lexeme[i] );
								}
								step++;
							},
							'off': function(){
								storage = [];
								step = 0;
							}
						}
					},
					'break': function(){
						var storage = []
						,	step = 0
						;
						return {
							'go': function( state ){
								var half = 0;
								for ( var i = 0, l = state.lexeme.length; i < l; i++ ){
									if ( storage[i] ) {
										storage[i] = storage[i].toLowerCase().replace( /[\+\*]/g, '' );
										half = Math.ceil( storage[i].length / 2 );
										storage[i] = state.lexeme[i] = [
											storage[i].slice( 0, half ),
											state.lexeme[i].toUpperCase(),
											storage[i].slice( half )
										].join( step++ % 2 ? '+' : '*' );
									} else {
										storage[i] = state.lexeme[i];
									}
								}
							},
							'off': function(){
								storage = [];
							}
						}
					},
					'stack': function(){
						var storage = [];
						return {
							'go': function(){
								for ( var i = 0, l = state.lexeme.length; i < l; i++ ){
									storage[i] = state.lexeme[i] = storage[i] ? 
										[storage[i].toLowerCase(), state.lexeme[i].toUpperCase()].join( '' ) :
									 	state.lexeme[i].toUpperCase()
								 	;
								}
							},
							'off': function(){
								storage = [];
							}
						}
					},
					'uppercase': function(){
						return {
							'go': function( state ){
								for ( var i = 0, l = state.lexeme.length; i < l; i++ ){
									state.lexeme[i] = state.lexeme[i].toUpperCase();
								}
							}
						}
					},
					'error': function(){
						return {
							'go': function( state ){
								state.method = 'error';
							}
						}
					},
					'table': function(){
						var storage = [];
						return {
							'go': function( state ){
								if ( !storage.length || storage[storage.length - 1]['1'] ) {
									storage.push( {
										'0': state.lexeme[0],
										'1': ''
									} );
								} else {
									storage[storage.length - 1]['1'] = state.lexeme[0];
								}
								state.method = 'table';
								state.lexeme[0] = storage;
							},
							'off': function(){
								storage = [];
							}
						}
					},
					'noclear': function(){
						return {
							'go': function( state ){
								state.clear = false;
							}
						}
					}
				}
			,	compiledEffects = {}
			,	stackEffects = {}
			,	prevTimer = 0
			,	slug
			,	inline
			,	state = {}
			,	init = function(){
					that.map = map;
					// extend params object
					that.params = extendObj( {}, params );
					that.params.lag = parseInt( that.params.lag );
					that.params.lag = isNaN( that.params.lag ) ? 0 : that.params.lag;
					// init effect function
					if ( !window.ConsoleFunEffects ) {
						window.ConsoleFunEffects = defaultConsoleFunEffects;
					} else {
						window.ConsoleFunEffects = extendObj( window.ConsoleFunEffects, defaultConsoleFunEffects );
					}
					for ( var effect in ConsoleFunEffects ) {
						if ( ConsoleFunEffects.hasOwnProperty( effect ) && typeof ConsoleFunEffects[effect] === 'function' ) {
							compiledEffects[effect] = ConsoleFunEffects[effect]();
						}
					}
				}()
			;

			function _print( lexeme, effects ){
				var effect, off, modificator;
				effects = effects || '';
				effects = effects.split( ' ' );

				state.lexeme = [lexeme];

				// clear by default
				state.clear = true;

				state.method = 'log';

				// parse 'effects' string and manage 'stackEffects' array
				for ( var i = 0, l = effects.length; i < l; i++ ) {
					effect = effects[i].split( '/' );
					// if effect name contains '/', call 'off' function
					off = effect.length - 1;
					effect = effect[off];
					if ( compiledEffects[effect] !== undefined ) {
						if ( off ) {
							if ( stackEffects[effect] && typeof stackEffects[effect]['off'] === 'function' ) {
								stackEffects[effect]['off']();
							}
							stackEffects[effect] = null;
						} else {
							stackEffects[effect] = compiledEffects[effect];
						}
					}
				}

				// launch 'stackEffects'
				for ( var effect in stackEffects ) {
					if ( stackEffects.hasOwnProperty( effect ) && stackEffects[effect] && typeof stackEffects[effect]['go'] === 'function' ) {
						stackEffects[effect]['go']( state );
					}
				}

				state.clear && console.clear();
				_output( state.lexeme, state.method );
			}

			function _output( lexeme, method ){
				if ( !method || typeof console[method] !== 'function' ) {
					method = console.log;
				}
				// cons.innerHTML = [cons.innerHTML, lexeme[0]].join('<br>');
				for ( var i = 0, l = lexeme.length; i < l; i++ ) {
					console[method]( lexeme[i] );
				}
			}

			function _timer(){
				var timer = 0;
				if ( slug = that.map.next() ) {
					timer = Math.max( ( slug.t || timer ) - prevTimer, 0 );
					prevTimer = slug.t;
					setTimeout( function(){
						_print( slug.l, slug.e );
						_timer();
					}, timer + ( that.params.lag || 0 ) );
				} else {
					timer = 0;
				}
			}

			this.launch = function(){
				_timer();
			}
		}

	,	TextMapObj = function( map ){
			var index = 0
			,	map = map || []
			;
			return {
				next: function(){
					return ( map.length <= index ? null : map[index++] );
				}
			};
		}
	,	player = document.getElementById( 'player' )
	,	cons = document.getElementById( 'console' )
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
			{ l: 'harder', t: 16035 },
			{ l: 'make', t: 16522 },
			{ l: 'it', t: 16789 },
			{ l: 'better', t: 17007 },
			{ l: 'do', t: 17493 },
			{ l: 'it', t: 17748 },
			{ l: 'faster', t: 17979 }, 
			{ l: 'makes', t: 18466 },
			{ l: 'us', t: 18746 },
			{ l: 'stronger', t: 18952 },
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
	,	T = 7776
	,	map = new TextMapObj( lyrics )
	;

	player.oncanplaythrough = tempFunstionForPlayerToWorkProperly();
	function tempFunstionForPlayerToWorkProperly(){
		var cf = new ConsoleFun( map, { lag: 0 } );
		player.play();
		cf.launch();
	};

} )();