/**
 * WordPress dependencies
 */
import { createRichTextRecordFromDOM } from './rich-text-structure';

/**
 * External dependencies
 */
export { attr, prop, html, text, query } from 'hpq';

export const children = ( selector, multiline ) => {
	return ( domNode ) => {
		let match = domNode;

		if ( selector ) {
			match = domNode.querySelector( selector );
		}

		return createRichTextRecordFromDOM( match, multiline );
	};
};

export const node = ( selector ) => {
	return ( domNode ) => {
		let match = domNode;

		if ( selector ) {
			match = domNode.querySelector( selector );
		}

		return createRichTextRecordFromDOM( match );
	};
};
