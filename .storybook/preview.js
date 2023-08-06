import { initialize, mswDecorator } from 'msw-storybook-addon';
import '../src/styles/styles.scss'
import '../src/styles/responsive.scss'

import '../src/styles/overrides.scss'


// Initialize MSW
initialize();

// Provide the MSW addon decorator globally
export const decorators = [mswDecorator]

export const parameters = {
  layout: 'centered',
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}