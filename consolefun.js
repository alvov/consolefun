var ConsoleFunTextMap = function( map ){
		var index = 0
		,	map = map || []
		;
		return {
			next: function(){
				return ( map.length <= index ? null : map[index++] );
			},
			reset: function(){
				index = 0;
			}
		};
	}
	
,	ConsoleFun = function( lyrics, params ){
		var that = this
		,	map = new ConsoleFunTextMap( lyrics )
		,	compiledEffects = {}
		,	stackEffects = {}
		,	prevTimer = 0
		,	hasOffset = true
		,	slug
		,	inline
		,	state = {}
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
		,	init = function(){
				that.map = map;
				// extend params object
				that.params = _extendObj( {}, params );
				that.params.lag = parseInt( that.params.lag, 10 );
				that.params.lag = isNaN( that.params.lag ) ? 0 : that.params.lag;
				// init effect function
				if ( !window.ConsoleFunEffects ) {
					window.ConsoleFunEffects = defaultConsoleFunEffects;
				} else {
					window.ConsoleFunEffects = _extendObj( window.ConsoleFunEffects, defaultConsoleFunEffects );
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
			for ( var i = 0, l = lexeme.length; i < l; i++ ) {
				console[method]( lexeme[i] );
			}
		}

		function _timer(){
			var timer = 0;
			if ( !that.params.paused ){
				if ( slug = that.map.next() ) {
					timer = Math.max( ( slug.t || timer ) - prevTimer, 0 );
					prevTimer = slug.t;
					setTimeout( function(){
						_print( slug.l, slug.e );
						_timer();
					}, timer + ( hasOffset ? that.params.lag : 0 ) );
				} else {
					timer = 0;
					that.map.reset();
					for ( var effect in stackEffects ) {
						if ( stackEffects[effect] && typeof stackEffects[effect]['off'] === 'function' ) {
							stackEffects[effect]['off']();
						}
						stackEffects[effect] = null;
					}
				}
			}
			// apply offset once per lag change
			hasOffset = false;
		}

		function _extendObj( sourceObj, extObj ){
			for ( var key in extObj ) {
				if ( extObj.hasOwnProperty( key ) ) {
					sourceObj[key] = extObj[key];
				}
			}
			return sourceObj;
		}

		this.lag = function( lag ){
			lag = parseInt( lag, 10 );
			that.params.lag = lag - that.params.lag;
			hasOffset = true;
		}

		this.launch = function(){
			that.params.paused = false;
			_timer();
		}

		this.pause = function(){
			that.params.paused = true;
		}
	}
;