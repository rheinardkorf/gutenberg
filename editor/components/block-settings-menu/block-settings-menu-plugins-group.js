/**
 * External dependencies
 */
import { isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { createSlotFill } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { withSelect } from '@wordpress/data';

const { Fill: BlockSettingsMenuPluginsGroup, Slot } = createSlotFill( 'BlockSettingsMenuPluginsGroup' );

const BlockSettingsMenuPluginsGroupSlot = ( { fillProps, currentBlockName } ) => (
	<Slot fillProps={ { ...fillProps, currentBlockName } } >
		{ ( fills ) => ! isEmpty( fills ) && (
			<Fragment>
				<div className="editor-block-settings-menu__separator" />
				{ fills }
			</Fragment>
		) }
	</Slot>
);

BlockSettingsMenuPluginsGroup.Slot = withSelect( ( select, { fillProps: { uids } } ) => ( {
	currentBlockName: select( 'core/editor' ).getBlockName( uids ),
} ) )( BlockSettingsMenuPluginsGroupSlot );

export default BlockSettingsMenuPluginsGroup;
