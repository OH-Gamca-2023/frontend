/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			boxShadow: {
				'md-top': '0 -4px 6px -1px rgb(0 0 0 / 0.1), 0 -2px 4px -2px rgb(0 0 0 / 0.1)',
			},
			minWidth: {
				'1/2': '50%',
				'1/3': '33.333333%',
			},
			maxWidth: {
				'1/2': '50%',
				'1/3': '33.333333%',
			},
			screens: {
				lmd: '860px',
			},
			colors: {
				gray: {
					950: '#030712',
				}
			},
		},
	},
	plugins: [],
	darkMode: 'class',
}
