/**
 * WordPress dependencies
 */
import { store as blocksStore } from '@wordpress/blocks';
import { useMemo, useCallback } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { store as blockEditorStore } from '../../store';
import { getActiveStyle, getRenderedStyles } from '../block-styles/utils';

export default function DefaultStylePicker( { clientId } ) {
	const {
		activeStyle,
		onUpdatePreferredStyleVariations,
		preferredStyle,
		styles,
	} = useSelect(
		( select ) => {
			const { getBlock, getSettings } = select( blockEditorStore );
			const block = getBlock( clientId );
			const settings = getSettings();
			const preferredStyleVariations =
				settings.__experimentalPreferredStyleVariations;
			const blockStyles = select( blocksStore ).getBlockStyles(
				block.name
			);
			const onUpdate = preferredStyleVariations?.onChange
				? ( blockStyle ) =>
						preferredStyleVariations?.onChange(
							block.name,
							blockStyle
						)
				: null;
			// The blocks styles inspector shows a default option,
			// so make sure this component knows about it too.
			const renderedStyles = getRenderedStyles( blockStyles );

			return {
				preferredStyle: preferredStyleVariations?.value?.[ block.name ],
				onUpdatePreferredStyleVariations: onUpdate,
				styles: renderedStyles,
				blockName: block.name,
				activeStyle: getActiveStyle(
					renderedStyles,
					block.attributes.className || ''
				),
			};
		},
		[ clientId ]
	);
	const selectOnChange = useCallback( () => {
		onUpdatePreferredStyleVariations( activeStyle.name );
	}, [ activeStyle?.name, onUpdatePreferredStyleVariations ] );

	const preferredStyleLabel = useMemo( () => {
		const preferredStyleObject = styles.find(
			( style ) => style.name === preferredStyle
		);
		return preferredStyleObject
			? preferredStyleObject?.label || preferredStyleObject?.name
			: __( 'Not set' );
	}, [ preferredStyle ] );

	return (
		onUpdatePreferredStyleVariations && (
			<div>
				<div className="default-style-picker__current-default">
					{ __( 'Default style:' ) }
					<span className="default-style-picker__style-label">
						{ preferredStyleLabel }
					</span>
				</div>
				{ preferredStyle !== activeStyle?.name && (
					<Button
						onClick={ selectOnChange }
						variant="link"
						label="Set default style"
						className="default-style-picker__style-button"
					>
						{ sprintf(
							// translators: %s: the name of a block style
							__( 'Change to %s' ),
							activeStyle?.label || activeStyle?.name
						) }
					</Button>
				) }
			</div>
		)
	);
}
