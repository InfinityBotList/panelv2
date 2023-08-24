/** @type {import('tailwindcss').Config}*/
const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'media',
	theme: {
		extend: {
			colors: {
				blurple: 'rgba(139, 92, 246, .50)'
			}
		}
	},
	plugins: []
};

module.exports = config;
