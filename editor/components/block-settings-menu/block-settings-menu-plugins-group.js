/**
 * External dependencies
 */
import { isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { createSlotFill } from '@wordpress/components';
import { Fragment } from '@wordpress/element';

const { Fill: BlockSettingsMenuPluginsGroup, Slot } = createSlotFill( 'BlockSettingsMenuPluginsGroup' );

BlockSettingsMenuPluginsGroup.Slot = () => (
	<Slot name="BlockSettingsMenuPluginsGroup">
		{ ( fills ) => ! isEmpty( fills ) && (
			<Fragment>
				<div className="editor-block-settings-menu__separator" />
				{ fills }
			</Fragment>
		) }
	</Slot>
);

export default BlockSettingsMenuPluginsGroup;
