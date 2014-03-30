ConsoleFun
==========

ConsoleFun provides a tool for perfoming console output at a certain time.  
It is made just for fun, no practical usage, sorry.

Simple start
------------

First, link ConsoleFun script to the page:

	<script src="consolefun.js"></script>

The ConsoleFun object accepts map object as a parameter. The example of valid map object:

	var map = [
			{ l: 'console', t: 0, e: 'inline' },
			{ l: 'log', t: 1000 },
			{ l: 'me', t: 2000, e : '/inline uppercase' }
		];

Here `l` stands for lexeme to be printed, `t` stands for time in seconds since launch, at which the lexeme will be printed, and `e` stands for output effects.  
**Note: closing tag for an effect being put on the line means, that the effect won't work since the current lexeme.  
In our example this means that `inline` effect will be appended to lexemes `console` and `log`, but not `me`.**

Now create the instance of ConsoleFun with `map` as a parameter:

	var cf = new ConsoleFun( map );

Now you can perform:

	cf.launch();
	// or
	cf.pause();
	// and
	cf.lag(); //for timer shifting

As simple as that.

Built-in effects
---------------

ConsoleFun contains several built-in effects:

<table>
  <tr>
    <th>Effect</th><th>Has closing tag</th><th>Description</th>
  </tr>
  <tr>
    <td>inline</td><td>yes</td><td>performs output in one line</td>
  </tr>
  <tr>
    <td>inline_back</td><td>yes</td><td>performs right-to-left output in one line</td>
  </tr>
  <tr>
    <td>step</td><td>yes</td><td>performs 'staircase' output</td>
  </tr>
  <tr>
    <td>step_back</td><td>yes</td><td>performs right-to-left 'staircase' output</td>
  </tr>
  <tr>
    <td>between</td><td>yes</td><td>puts characters of the current lexeme between characters of the previous lexeme</td>
  </tr>
  <tr>
    <td>break</td><td>yes</td><td>inserts the current lexeme in the middle of the previous lexeme</td>
  </tr>
  <tr>
    <td>stack</td><td>yes</td><td>similar to 'inline' but with no spaces between words</td>
  </tr>
  <tr>
    <td>uppercase</td><td>no</td><td>outputs lexeme in upper case</td>
  </tr>
  <tr>
    <td>error</td><td>no</td><td>uses `console.error` output method instead of `console.log`</td>
  </tr>
  <tr>
    <td>table</td><td>yes</td><td>uses `console.table` output method instead of `console.log`</td>
  </tr>
  <tr>
    <td>noclear</td><td>no</td><td>prevents console clearing on next step</td>
  </tr>
</table>

Custom effects
--------------

You can create your own custom effects and link them to your project by following these steps:

1. 	Create a function, that returns a plain object with methods `go` and `off`.

		var customEffect = function(){
			return {
				'go': function( state ){
					//...
				},
				'off': function(){
					//...
				}
			}
		}

	Method `go` accepts `state` object, which contains information about the current step. For example, `state.lexeme` contains an array of current lexemes.  
	Method `off` doesn't accept any arguments, and is optional.

	This is how a custom effect for lexeme output in lower case could look like:

		var lowercase = function(){
				return {
					'go': function( state ){
						for ( var i = 0, l = state.lexeme.length; i < l; i++ ){
							state.lexeme[i] = state.lexeme[i].toLowerCase();
						}
					}
				}
			};

2. 	Now that you have your `customEffect` function, attach it to global `ConsoleFunEffects` object like this:

		if ( window.ConsoleFunEffects ) {
			window.ConsoleFunEffects['customEffect'] = customEffect;
		} else {
			window.ConsoleFunEffects = { 'customEffect': customEffect };
		}

3. 	From now on you can use your `customEffect` effect in the map object:

		var map = [
			{ l: 'apply custom effect to me', t: 1000, e: 'customEffect' }
		];
