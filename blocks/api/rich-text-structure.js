/**
 * External dependencies
 */
import { range as _range, mapKeys } from 'lodash';

const { TEXT_NODE, ELEMENT_NODE } = window.Node;

export function createRichTextRecordFromDOM( element, multiline ) {
	if ( ! multiline ) {
		return createRichTextRecord( element );
	}

	if ( ! element || ! element.hasChildNodes() ) {
		return [];
	}

	return Array.from( element.childNodes ).reduce( ( acc, child ) => {
		if ( child.nodeName.toLowerCase() === multiline ) {
			acc.push( createRichTextRecord( child ) );
		}

		return acc;
	}, [] );
}

export function createRichTextRecord( element ) {
	if ( ! element ) {
		return {
			formats: {},
			text: '',
		};
	}

	if ( element.nodeName === 'BR' ) {
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
			const type = node.nodeName.toLowerCase();
			const value = createRichTextRecord( node );
			const attributes = getAttributes( node );
			const start = accumulator.text.length;
			const end = start + value.text.length;
			const format = attributes ? { type, attributes } : { type };

			if ( start === end ) {
				accumulator.formats[ start ] = [
					{ ...format, object: true },
					...( accumulator.formats[ start ] || [] ),
				];
			} else {
				const mappedIndices = mapKeys( value.formats, ( $1, index ) =>
					start + parseInt( index, 10 )
				);

				accumulator.text += value.text;
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
			}
		}

		return accumulator;
	}, {
		formats: {},
		text: '',
	} );
}

function getAttributes( element ) {
	if ( ! element.hasAttributes() ) {
		return;
	}

	return Array.from( element.attributes ).reduce( ( acc, { name, value } ) => {
		if ( name.indexOf( 'data-mce-' ) !== 0 ) {
			acc[ name ] = value;
		}

		return acc;
	}, {} );
}

function prependChild( parent, child ) {
	return parent.insertBefore( child, parent.firstChild );
}

export function createHTML( record, multiline ) {
	if ( multiline ) {
		const open = '<' + multiline + '>';
		const close = '</' + multiline + '>';

		return open + ( record.map( ( v ) => createHTML( v ) ).join( close + open ) ) + close;
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
