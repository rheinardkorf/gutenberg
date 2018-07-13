/**
 * External dependencies
 */
import { filter, groupBy } from 'lodash';

/**
 * WordPress dependencies
 */
import { getBlockTransforms, findTransform, richTextStructure } from '@wordpress/blocks';

export default function() {
	const { onReplace } = this.props;
	const { deleteCharacters, applyFormat } = richTextStructure;

	const {
		// enter: enterPatterns,
		undefined: patterns,
	} = groupBy( filter( getBlockTransforms( 'from' ), { type: 'pattern' } ), 'trigger' );

	return [
		( record ) => {
			if ( ! onReplace ) {
				return record;
			}

			const transformation = findTransform( patterns, ( item ) => {
				return item.regExp.test( record.text );
			} );

			if ( ! transformation ) {
				return record;
			}

			const result = record.text.match( transformation.regExp );

			const block = transformation.transform( {
				content: deleteCharacters( record, 0, result[ 0 ].length - 1 ),
				match: result,
			} );

			onReplace( [ block ] );
		},
		// To do: only on enter.
		// ( record ) => {
		// 	if ( ! onReplace ) {
		// 		return record;
		// 	}

		// 	const transformation = findTransform( enterPatterns, ( item ) => {
		// 		return item.regExp.test( record.text );
		// 	} );

		// 	if ( ! transformation ) {
		// 		return record;
		// 	}

		// 	const block = transformation.transform( { content: record.text } );

		// 	onReplace( [ block ] );
		// },
		( record ) => {
			if ( record.text.indexOf( '`' ) === -1 ) {
				return record;
			}

			const match = record.text.match( /`([^`]+)`/ );

			if ( ! match ) {
				return record;
			}

			const start = match.index;
			const end = start + match[ 1 ].length - 1;

			record = deleteCharacters( record, [ start, match.index + match[ 0 ].length - 1 ] );
			record = applyFormat( record, start, end, { type: 'code' } );

			return record;
		},
	];
}
