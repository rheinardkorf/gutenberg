/**
 * External dependencies
 */
import { flatten, isEmpty, map } from 'lodash';

/**
 * WordPress dependencies
 */
import { createSlotFill } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { withSelect } from '@wordpress/data';

const { Fill: BlockSettingsMenuPluginsGroup, Slot } = createSlotFill( 'BlockSettingsMenuPluginsGroup' );

const BlockSettingsMenuPluginsGroupSlot = ( { fillProps, selectedBlocks } ) => (
	<Slot fillProps={ { ...fillProps, selectedBlocks } } >
		{ ( fills ) => ! isEmpty( fills ) && (
			<Fragment>
				<div className="editor-block-settings-menu__separator" />
				{ fills }
			</Fragment>
		) }
	</Slot>
);

BlockSettingsMenuPluginsGroup.Slot = withSelect( ( select, { fillProps: { uids } } ) => ( {
	selectedBlocks: map( flatten( [ uids ] ), ( uid ) => select( 'core/editor' ).getBlockName( uid ) ),
} ) )( BlockSettingsMenuPluginsGroupSlot );

export default BlockSettingsMenuPluginsGroup;
