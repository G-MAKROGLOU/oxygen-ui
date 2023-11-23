import { ComponentMeta, ComponentStory } from '@storybook/react';
import { Accordion } from '../components/accordion';
import ThemeProvider from '../context/themeContext';

export default {
	title: 'Components/Data Display/Accordion',
	component: Accordion,
	tags: ['autodocs'],
	argTypes: {
		defaultActiveKey: {
			control: { type: 'text' },
			description:
				'The key of the panel to be expanded upon component initialization. Defaults to ```undefined```',
			defaultValue: undefined,
		},
		defaultAllExpanded: {
			control: { type: 'boolean' },
			description:
				'Whether all panels should be expanded upon component initialization. Defaults to ```false```',
			defaultValue: false,
		},
		multipleExpands: {
			control: { type: 'boolean' },
			description:
				'Whether one panel should always be allowed to be expanded at a time. Defaults to ```false```',
			defaultValue: false,
		},
		onExpand: {
			description:
				'An event to be fired upon the expansion of a panel. The event is of type ```(expandedKey: string | number) => void;```',
		},
		onCollapse: {
			description:
				'An event to be fired upon the collapse of a panel. The event is of type ```(collapsedKey: string | number) => void;```',
		},
		accordionIcon: {
			description:
				'An icon to replace the default icon of each panel. Defaults to ```<MdKeyboardArrowDown fontSize={25}/>``` from ```react-icons/md``` package',
		},
		width: {
			control: { type: 'number' },
			description:
				'The width of the accordion wrapper. Defaults to ```400```',
			defaultValue: 400,
		},
		items: {
			description:
				'An array of items to be displayed as the accordion panels. See ```AccordionItem``` from ```accordion.d.ts``` ',
		},
	},
	decorators: [(Story) => <ThemeProvider>{Story()}</ThemeProvider>],
} as ComponentMeta<typeof Accordion>;

const Template: ComponentStory<typeof Accordion> = (args) => (
	<Accordion {...args} />
);

export const BasicAccordion = Template.bind({});
BasicAccordion.args = {
	defaultActiveKey: 1,
	defaultAllExpanded: false,
	multipleExpands: false,
	onExpand: (expandedKey: string | number) =>
		console.log('onExpand', expandedKey),
	onCollapse: (collapsedKey: string | number) =>
		console.log('onCollapse', collapsedKey),
	accordionIcon: undefined,
	width: 600,
	items: [
		{
			key: 1,
			header: 'Very very very very very very very long header title',
			content: (
				<div style={{ padding: 5 }}>
					Lorem ipsum dolor sit amet consectetur adipisicing elit.
					Dolorum asperiores soluta numquam eaque. Omnis, rem cum at
					voluptatum ullam maiores et architecto dignissimos in rerum
					laudantium animi quia quisquam unde magnam? Placeat
					voluptate magnam explicabo neque repellendus iste odio unde.
				</div>
			),
		},
		{
			key: 2,
			header: 'Accordion Panel 2',
			content: (
				<div style={{ padding: 5 }}>
					Lorem ipsum dolor sit amet, consectetur adipisicing elit.
					Fugit ducimus eveniet saepe eligendi commodi repellat
					inventore quasi, nulla, numquam ad, illo doloremque quos ut
					minima? Consectetur, quidem nihil. Nisi quas distinctio
					dolor vero. Saepe dignissimos magnam ex laborum facilis,
					totam provident pariatur velit, itaque aperiam nam excepturi
					cumque porro est voluptas hic commodi? Perspiciatis
					recusandae, necessitatibus omnis soluta at dignissimos, non
					consequuntur ipsam similique quae commodi sint pariatur modi
					dolor, molestiae dolorem ex beatae aut reiciendis tempora
					hic. Quibusdam accusantium aut praesentium. Saepe modi rerum
					qui recusandae delectus sint molestias ea quidem veritatis
					dolore. Soluta minima eius laborum quaerat tenetur.
				</div>
			),
		},
		{
			key: 3,
			header: 'Accordion Panel 3',
			content: (
				<div style={{ padding: 5 }}>
					Lorem, ipsum dolor sit amet consectetur adipisicing elit.
					Laborum ratione, officia architecto earum voluptate, dicta
					quam fugiat sint rerum quae itaque atque magni iste hic?
					Animi repudiandae quos enim eveniet nisi nulla iure, quia,
					praesentium officia harum quasi molestias necessitatibus
					inventore autem illo dicta labore non voluptatem, ipsam
					repellat voluptas consectetur hic. Officiis dicta beatae
					corporis necessitatibus impedit rerum officia, culpa
					temporibus molestiae sequi? Dignissimos voluptatem eaque
					facilis quae corrupti veniam maiores itaque sed, dolorum
					voluptates labore ipsum in architecto commodi ut magni
					temporibus eligendi officia illum? Molestiae et in fugiat
					veritatis rem, nemo ratione quisquam ab voluptas pariatur
					accusamus eveniet aliquam commodi dolor! Aspernatur porro a
					eligendi, illum expedita, asperiores praesentium, est
					sapiente at soluta officia quod non cupiditate facilis
					corrupti eveniet. Voluptate dolorum reprehenderit ullam
					excepturi impedit ducimus eum! Tenetur harum dolores
					perferendis recusandae voluptatum? Aliquid dicta voluptatum
					natus veritatis consequuntur error amet enim unde debitis
					quibusdam repellat modi dolorum reiciendis, perferendis
					excepturi rerum reprehenderit accusantium aspernatur quaerat
					magnam? Dolor sapiente iste laborum magni odio quis aut
					cumque dolorem sunt voluptas, temporibus labore culpa
					voluptatem inventore veritatis officia quibusdam, excepturi
					doloremque id sint nemo illo repellat. Magnam, nesciunt!
					Sequi illum non culpa eum quibusdam recusandae architecto
					tempore distinctio.
				</div>
			),
		},
	],
};
