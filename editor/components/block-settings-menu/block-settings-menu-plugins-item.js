/**
 * WordPress dependencies
 */
import { IconButton } from '@wordpress/components';
import { compose } from '@wordpress/element';

/**
 * Internal dependencies
 */
import BlockSettingsMenuPluginsGroup from './block-settings-menu-plugins-group';

const BlockSettingsMenuPluginsItem = ( { icon, label, onClick, small, role } ) => (
	<BlockSettingsMenuPluginsGroup>
		{ ( fillProps ) => (
			<IconButton
				className="editor-block-settings-menu__control"
				onClick={ compose( () => ( onClick( fillProps.firstBlockUID ) ), fillProps.onClose ) }
				icon={ icon || 'admin-plugins' }
				label={ small ? label : undefined }
				role={ role }
			>
				{ ! small && label }
			</IconButton>
		) }
	</BlockSettingsMenuPluginsGroup>
);

export default BlockSettingsMenuPluginsItem;
