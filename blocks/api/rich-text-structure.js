/**
 * External dependencies
 */
import { range as _range, mapKeys } from 'lodash';

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
			formats: {},
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
			formats: {},
			text: '\n',
		};
	}

	if ( ! element.hasChildNodes() ) {
		return {
			formats: {},
			text: '',
		};
	}

	return Array.from( element.childNodes ).reduce( ( accumulator, node ) => {
		if ( node.nodeType === TEXT_NODE ) {
			accumulator.text += node.nodeValue;
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
			const text = filterString( value.text );
			const start = accumulator.text.length;
			const end = start + text.length;

			if ( format && start === end ) {
				accumulator.formats[ start ] = [
					{ ...format, object: true },
					...( accumulator.formats[ start ] || [] ),
				];
			} else {
				const mappedIndices = mapKeys( value.formats, ( $1, index ) =>
					start + parseInt( index, 10 )
				);

				accumulator.text += text;

				if ( format ) {
					accumulator.formats = _range( start, end ).reduce( ( formats, index ) => {
						return {
							...accumulator.formats,
							...formats,
							[ index ]: [
								...( accumulator.formats[ index ] || [] ),
								format,
								...( formats[ index ] || [] ),
							],
						};
					}, mappedIndices );
				} else {
					accumulator.formats = {
						...accumulator.formats,
						...mappedIndices,
					};
				}
			}
		}

		return accumulator;
	}, {
		formats: {},
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
		const length = accu.text.length;

		accu.text += text;
		accu.formats = {
			...accu.formats,
			...mapKeys( formats, ( $1, index ) =>
				length + parseInt( index, 10 )
			),
		};

		return accu;
	}, { ...record } );
}

export function isEmpty( record ) {
	if ( Array.isArray( record ) ) {
		return record.length === 0 || ( record.length === 1 && isEmpty( record[ 0 ] ) );
	}

	const { text, formats } = record;

	return text.length === 0 && Object.keys( formats ).length === 0;
}

export function deleteCharacter( record, index ) {
	record.text = record.text.slice( 0, index ) + record.text.slice( index + 1 );
	delete record.formats[ index ];
	record.formats = mapKeys( record.formats, ( $1, i ) => i < index ? i : i - 1 );
	return record;
}

export function applyFormat( record, start, end, format ) {
	record.formats = _range( start, end + 1 ).reduce( ( formats, i ) => {
		if ( ! formats[ i ] ) {
			formats[ i ] = [];
		}

		formats[ i ].push( format );

		return formats;
	}, record.formats );
	return record;
}
