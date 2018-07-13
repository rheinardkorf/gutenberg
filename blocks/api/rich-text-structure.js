/**
 * Browser dependencies
 */

const { TEXT_NODE, ELEMENT_NODE } = window.Node;

export function create( element, multiline, settings ) {
	if ( ! multiline ) {
		return createRecord( element, settings );
	}

	if ( ! element || ! element.hasChildNodes() ) {
		return [];
	}

	return Array.from( element.childNodes ).reduce( ( acc, child ) => {
		if ( child.nodeName.toLowerCase() === multiline ) {
			acc.push( createRecord( child, settings ) );
		}

		return acc;
	}, [] );
}

function createRecord( element, settings = {} ) {
	if ( ! element ) {
		return {
			formats: [],
			text: '',
		};
	}

	const {
		removeNodeMatch = () => false,
		unwrapNodeMatch = () => false,
		filterString = ( string ) => string,
	} = settings;

	if (
		element.nodeName === 'BR' &&
		! removeNodeMatch( element ) &&
		! unwrapNodeMatch( element )
	) {
		return {
			formats: Array( 1 ),
			text: '\n',
		};
	}

	if ( ! element.hasChildNodes() ) {
		return {
			formats: [],
			text: '',
		};
	}

	return Array.from( element.childNodes ).reduce( ( accumulator, node ) => {
		const { formats } = accumulator;

		if ( node.nodeType === TEXT_NODE ) {
			const text = filterString( node.nodeValue );
			accumulator.text += text;
			formats.push( ...Array( text.length ) );
		} else if ( node.nodeType === ELEMENT_NODE ) {
			if ( removeNodeMatch( node ) ) {
				return accumulator;
			}

			let format;

			if ( ! unwrapNodeMatch( node ) ) {
				const type = node.nodeName.toLowerCase();
				const attributes = getAttributes( node, settings );

				format = attributes ? { type, attributes } : { type };
			}

			const value = createRecord( node, settings );
			const text = value.text;
			const start = accumulator.text.length;

			if ( format && text.length === 0 ) {
				format.object = true;

				if ( formats[ start ] ) {
					formats[ start ].unshift( format );
				} else {
					formats[ start ] = [ format ];
				}
			} else {
				accumulator.text += text;

				let i = value.formats.length;

				while ( i-- ) {
					const index = start + i;

					if ( format ) {
						if ( formats[ index ] ) {
							formats[ index ].push( format );
						} else {
							formats[ index ] = [ format ];
						}
					}

					if ( value.formats[ i ] ) {
						if ( formats[ index ] ) {
							formats[ index ].push( ...value.formats[ i ] );
						} else {
							formats[ index ] = value.formats[ i ];
						}
					}
				}
			}
		}

		return accumulator;
	}, {
		formats: [],
		text: '',
	} );
}

function getAttributes( element, settings = {} ) {
	if ( ! element.hasAttributes() ) {
		return;
	}

	const {
		removeAttributeMatch = () => false,
	} = settings;

	return Array.from( element.attributes ).reduce( ( acc, { name, value } ) => {
		if ( ! removeAttributeMatch( name ) ) {
			acc[ name ] = value;
		}

		return acc;
	}, {} );
}

function prependChild( parent, child ) {
	return parent.insertBefore( child, parent.firstChild );
}

export function toString( record, multiline ) {
	if ( multiline ) {
		const open = '<' + multiline + '>';
		const close = '</' + multiline + '>';

		return open + ( record.map( ( v ) => toString( v ) ).join( close + open ) ) + close;
	}

	const { formats, text } = record;
	const doc = document.implementation.createHTMLDocument( '' );
	const { body } = doc;

	let i = text.length;

	if ( formats[ i ] ) {
		formats[ i ].reduce( ( element, { type, attributes } ) => {
			const newNode = doc.createElement( type );

			for ( const key in attributes ) {
				newNode.setAttribute( key, attributes[ key ] );
			}

			return element.insertBefore( newNode, element.firstChild );
		}, body );
	}

	while ( i-- ) {
		const character = text[ i ];
		const nextFormats = formats[ i ];
		let pointer = body.firstChild;

		if ( nextFormats ) {
			if ( ! pointer ) {
				pointer = prependChild( body, doc.createTextNode( '' ) );
			}

			nextFormats.forEach( ( { type, attributes, object } ) => {
				if ( pointer && type === pointer.nodeName.toLowerCase() ) {
					pointer = pointer.firstChild;
					return;
				}

				const newNode = doc.createElement( type );

				for ( const key in attributes ) {
					newNode.setAttribute( key, attributes[ key ] );
				}

				prependChild( pointer.parentNode, newNode );

				if ( object ) {
					prependChild( newNode.parentNode, doc.createTextNode( '' ) );
					pointer = newNode.nextSibling;
				} else {
					pointer = newNode.appendChild( doc.createTextNode( '' ) );
				}
			} );

			if ( pointer.nodeType === TEXT_NODE ) {
				pointer.insertData( 0, character );
			} else {
				prependChild( pointer.parentNode, doc.createTextNode( character ) );
			}
		} else if ( pointer && pointer.nodeType === TEXT_NODE ) {
			pointer.insertData( 0, character );
		} else {
			prependChild( body, doc.createTextNode( character ) );
		}
	}

	return body.innerHTML;
}

export function merge( record, ...records ) {
	if ( Array.isArray( record ) ) {
		return record.concat( ...records );
	}

	return records.reduce( ( accu, { formats, text } ) => {
		accu.text += text;
		accu.formats.push( ...formats );
		return accu;
	}, { ...record } );
}

export function isEmpty( record ) {
	if ( Array.isArray( record ) ) {
		return record.length === 0 || ( record.length === 1 && isEmpty( record[ 0 ] ) );
	}

	const { text, formats } = record;

	return text.length === 0 && formats.length === 0;
}

export function deleteCharacters( record, start, end ) {
	if ( typeof start === 'number' ) {
		const { formats } = record;
		const text = record.text.slice( 0, start ) + record.text.slice( end + 1 );
		formats.splice( start, end - start + 1 );
		record = { formats, text };
	} else {
		// Delete from highest to lowest.
		start.sort( ( a, b ) => b - a ).forEach( ( index ) => {
			record = deleteCharacters( record, index, index );
		} );
	}

	return record;
}

export function applyFormat( { formats, text }, start, end, format ) {
	let i = formats.length;

	while ( i-- ) {
		if ( i >= start && i <= end ) {
			if ( formats[ i ] ) {
				formats[ i ].push( format );
			} else {
				formats[ i ] = [ format ];
			}
		}
	}

	return { formats, text };
}
