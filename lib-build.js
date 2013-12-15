var extendObj = function( sourceObj, extObj ){
		for ( var key in extObj ) {
			if ( extObj.hasOwnProperty( key ) ) {
				sourceObj[key] = extObj[key];
			}
		}
		return sourceObj;
	}
;