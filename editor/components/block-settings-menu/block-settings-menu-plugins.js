/**
 * External dependencies
 */
import { isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { Slot } from '@wordpress/components';
import { Fragment } from '@wordpress/element';

const BlockSettingsMenuPluginsSlot = () => (
	<Slot name="BlockSettingsMenuPluginsSlot">
		{ ( fills ) => ! isEmpty( fills ) && (
			<Fragment>
				<div className="editor-block-settings-menu__separator" />
				{ fills }
			</Fragment>
		)}
	</Slot>
);

export default BlockSettingsMenuPluginsSlot;
