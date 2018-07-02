import { View } from 'react-native';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { PlainText } from '@wordpress/editor';
import { createBlock, getPhrasingContentSchema } from '@wordpress/blocks';

//import RCTAztecView from 'react-native-aztec';

export const name = 'core/paragraph';

const schema = {
	content: {
		type: 'array',
		source: 'children',
		selector: 'p',
		default: [],
	},
	align: {
		type: 'string',
	},
	dropCap: {
		type: 'boolean',
		default: false,
	},
	placeholder: {
		type: 'string',
	},
	textColor: {
		type: 'string',
	},
	customTextColor: {
		type: 'string',
	},
	backgroundColor: {
		type: 'string',
	},
	customBackgroundColor: {
		type: 'string',
	},
	fontSize: {
		type: 'string',
	},
	customFontSize: {
		type: 'number',
	},
};

const supports = {
	className: false,
};

export const settings = {

	title: __( 'Paragraph' ),

	description: __( 'This is a simple text only block for adding a single paragraph of content.' ),

	icon: 'editor-paragraph',

	category: 'common',

	keywords: [ __( 'text' ) ],

	attributes: schema,

	transforms: {
	from: [
			{
				type: 'raw',
				// Paragraph is a fallback and should be matched last.
				priority: 20,
				selector: 'p',
				schema: {
					p: {
						children: {
							strong: {},
							em: {},
							del: {},
							ins: {},
							a: { attributes: [ 'href' ] },
							code: {},
							abbr: { attributes: [ 'title' ] },
							sub: {},
							sup: {},
							br: {},
							'#text': {},
						}
					},
				},
			},
		],
	},

	edit( { attributes, setAttributes, style } ) {
		return (
			<View>
				<PlainText
					value={ attributes.content }
					style={ style }
					multiline={ true }
					underlineColorAndroid="transparent"
					onChange={ ( content ) => setAttributes( { content } ) }
					placeholder={ __( 'Write code…' ) }
					aria-label={ __( 'Code' ) }
				/>
			</View>
		);
	},
	
	save( { attributes } ) {
		return attributes.content
	},
};