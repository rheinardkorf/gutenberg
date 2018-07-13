/**
 * WordPress dependencies
 */
import { IconButton } from '@wordpress/components';
import { compose } from '@wordpress/element';

/**
 * Internal dependencies
 */
import BlockSettingsMenuPluginsGroup from './block-settings-menu-plugins-group';

const shouldRenderItem = ( currentBlockName, allowedBlockNames ) => ! Array.isArray( allowedBlockNames ) ||
	( Array.isArray( allowedBlockNames ) &&
		allowedBlockNames.some( ( blockName ) => blockName === currentBlockName ) );

const BlockSettingsMenuPluginsItem = ( { allowedBlocks, icon, label, onClick, small, role } ) => (
	<BlockSettingsMenuPluginsGroup>
		{ ( { currentBlockName, onClose } ) => {
			if ( ! shouldRenderItem( currentBlockName, allowedBlocks ) ) {
				return null;
			}
			return ( <IconButton
				className="editor-block-settings-menu__control"
				onClick={ compose( onClick, onClose ) }
				icon={ icon || 'admin-plugins' }
				label={ small ? label : undefined }
				role={ role }
			>
				{ ! small && label }
			</IconButton> );
		} }
	</BlockSettingsMenuPluginsGroup>
);

export default BlockSettingsMenuPluginsItem;
