import '../src/styles/styles.scss'
import '../src/styles/responsive.scss'
import '../src/styles/overrides.scss'


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

if (typeof global.process === 'undefined') {
    const { worker } = require("../src/mocks/server");
    worker.start();
  }