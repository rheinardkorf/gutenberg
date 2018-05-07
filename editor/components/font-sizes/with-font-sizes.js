/**
 * External dependencies
 */
import { find, get, reduce, upperFirst } from 'lodash';

/**
 * WordPress dependencies
 */
import { createHigherOrderComponent, Component, compose } from '@wordpress/element';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { getFontSize, getFontSizeClass } from './utils';

const DEFAULT_FONT_SIZES = [];

/**
 * Higher-order component, which handles font size logic for class generation,
 * font size value retrieval, and font size change handling.
 *
 * @param {...(object|string)} args The arguments should all be strings
 *                                  Each string contains the font size attribute name e.g: 'fontSize'.
 *
 * @return {Function} Higher-order component.
 */
export default ( ...fontSizeNames ) => {
	return createHigherOrderComponent(
		compose( [
			withSelect( ( select ) => {
				const settings = select( 'core/editor' ).getEditorSettings();
				return {
					fontSizes: get( settings, [ 'fontSizes' ], DEFAULT_FONT_SIZES ),
				};
			} ),
			( WrappedComponent ) => {
				return class extends Component {
					constructor( props ) {
						super( props );

						this.setters = this.createSetters();

						this.state = {};
					}

					createSetters() {
						return reduce( fontSizeNames, ( settersAccumulator, fontSizeAttributeName ) => {
							const upperFirstFontSizeAttributeName = upperFirst( fontSizeAttributeName );
							const customFontSizeAttributeName = `custom${ upperFirstFontSizeAttributeName }`;
							settersAccumulator[ `set${ upperFirstFontSizeAttributeName }` ] =
								this.createSetFontSize( fontSizeAttributeName, customFontSizeAttributeName );
							return settersAccumulator;
						}, {} );
					}

					createSetFontSize( fontSizeAttributeName, customFontSizeAttributeName ) {
						return ( fontSizeValue ) => {
							const fontSizeObject = find( this.props.fontSizes, { size: fontSizeValue } );
							this.props.setAttributes( {
								[ fontSizeAttributeName ]: fontSizeObject && fontSizeObject.slug ? fontSizeObject.slug : undefined,
								[ customFontSizeAttributeName ]: fontSizeObject && fontSizeObject.slug ? undefined : fontSizeValue,
							} );
						};
					}

					static getDerivedStateFromProps( { attributes, fontSizes }, previousState ) {
						return reduce( fontSizeNames, ( newState, fontSizeAttributeName ) => {
							const fontSizeAttribute = attributes[ fontSizeAttributeName ];
							const fontSizeObject = getFontSize(
								fontSizes,
								fontSizeAttribute,
								attributes[ `custom${ upperFirst( fontSizeAttributeName ) }` ]
							);
							const previousFontSizeObject = previousState[ fontSizeAttributeName ];

							if ( previousFontSizeObject && previousFontSizeObject.size === fontSizeObject.size ) {
								newState[ fontSizeAttributeName ] = previousFontSizeObject;
							} else {
								newState[ fontSizeAttributeName ] = {
									...fontSizeObject,
									class: fontSizeAttribute && getFontSizeClass( fontSizeAttribute ),
								};
							}
							return newState;
						}, {} );
					}

					render() {
						return (
							<WrappedComponent
								{ ...{
									...this.props,
									fontSizes: undefined,
									...this.state,
									...this.setters,
								} }
							/>
						);
					}
				};
			},
		] ),
		'withFontSizes'
	);
};
