const tailwindcss = require('tailwindcss')
const autoprefixer = require('autoprefixer')
const flexboxFixes = require('postcss-flexbugs-fixes')
const presetEnv = require('postcss-preset-env')

const config = {
	plugins: [
		//Some plugins, like tailwindcss/nesting, need to run before Tailwind,
		tailwindcss(),
		//But others, like autoprefixer, need to run after,
		autoprefixer,
		flexboxFixes,
		presetEnv({
			autoprefixer: {
				flexbox: 'no-2009'
			},
			stage: 3,
			features: {
				'custom-properties': false,
				'nesting-rules': true
			}
		})
	]
}

module.exports = config
