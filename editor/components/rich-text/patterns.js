/**
 * External dependencies
 */
import tinymce from 'tinymce';
import { filter, groupBy, drop } from 'lodash';

/**
 * WordPress dependencies
 */
import { ESCAPE, ENTER, SPACE, BACKSPACE } from '@wordpress/keycodes';
import { getBlockTransforms, findTransform } from '@wordpress/blocks';

export default function( editor ) {
	const getContent = this.getContent.bind( this );
	const { setTimeout, onReplace } = this.props;

	const VK = tinymce.util.VK;

	const {
		enter: enterPatterns,
		undefined: spacePatterns,
	} = groupBy( filter( getBlockTransforms( 'from' ), { type: 'pattern' } ), 'trigger' );

	let canUndo;

	editor.on( 'selectionchange', function() {
		canUndo = null;
	} );

	editor.on( 'keydown', function( event ) {
		const { keyCode } = event;

		if ( ( canUndo && keyCode === ESCAPE ) || ( canUndo === 'space' && keyCode === BACKSPACE ) ) {
			editor.undoManager.undo();
			event.preventDefault();
			event.stopImmediatePropagation();
		}

		if ( VK.metaKeyPressed( event ) ) {
			return;
		}

		if ( keyCode === ENTER ) {
			enter( event );
		// Wait for the browser to insert the character.
		} else if ( keyCode === SPACE ) {
			setTimeout( () => searchFirstText( spacePatterns ) );
		}
	}, true );

	function searchFirstText( patterns ) {
		if ( ! onReplace ) {
			return;
		}

		// Merge text nodes.
		editor.getBody().normalize();

		const content = getContent();

		if ( ! content.length ) {
			return;
		}

		const firstText = content[ 0 ];

		const transformation = findTransform( patterns, ( item ) => {
			return item.regExp.test( firstText );
		} );

		if ( ! transformation ) {
			return;
		}

		const result = firstText.match( transformation.regExp );

		const range = editor.selection.getRng();
		const matchLength = result[ 0 ].length;
		const remainingText = firstText.slice( matchLength );

		// The caret position must be at the end of the match.
		if ( range.startOffset !== matchLength ) {
			return;
		}

		const block = transformation.transform( {
			content: [ remainingText, ...drop( content ) ],
			match: result,
		} );

		onReplace( [ block ] );
	}

	function enter( event ) {
		if ( ! onReplace ) {
			return;
		}

		// Merge text nodes.
		editor.getBody().normalize();

		const content = getContent();

		if ( ! content.length ) {
			return;
		}

		const pattern = findTransform( enterPatterns, ( { regExp } ) => regExp.test( content[ 0 ] ) );

		if ( ! pattern ) {
			return;
		}

		const block = pattern.transform( { content } );
		onReplace( [ block ] );

		// We call preventDefault to prevent additional newlines.
		event.preventDefault();
		// stopImmediatePropagation is called to prevent TinyMCE's own processing of keydown which conflicts with the block replacement.
		event.stopImmediatePropagation();
	}
}
