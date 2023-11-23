import { useTheme } from '../../hooks';
import { ButtonProps } from '../../types/button';

const Button = ({
	type = 'primary',
	buttonType = 'button',
	icon,
	loading = false,
	disabled = false,
	content = 'Button',
	onClick,
	iconRight = false,
	loadingIcon,
	style,
}: ButtonProps) => {
	const { theme } = useTheme();

	return (
		<button
			className={`oxyui__button oxyui__button__${theme}__${type} oxyui__button_icon_right_${iconRight}`}
			type={buttonType}
			style={style}
			onClick={onClick}
			disabled={disabled || loading}
		>
			<span className={loading ? 'oxyui__button__spinner' : ''}>
				{loading ? (
					loadingIcon ? (
						<span className="oxyui__button__custom_spinner">
							{loadingIcon}
						</span>
					) : (
						<div className="oxyui__default__button__spinner" />
					)
				) : (
					<span className="oxyui__button_icon">{icon}</span>
				)}
			</span>
			<span>{content}</span>
		</button>
	);
};

export default Button;
