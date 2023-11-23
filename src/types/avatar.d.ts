import { Shapes, Sizes } from './misc';

export type AvatarProps = {
	shape: Shapes;
	size: Sizes;
	badgeColor?: string;
} & (AvatarImageProps | AvatarInitialsProps);

export type AvatarImageProps = {
	mode: 'img';
	imgSrc: string;
	fallback: Omit<AvatarInitialsProps, 'mode'>;
};

export type AvatarInitialsProps = {
	mode: 'initials';
	initials: string;
	background: string;
	color: string;
};
