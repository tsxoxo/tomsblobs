module.exports = {
	rules: {
		'@typescript-eslint/no-require-imports': 'off',
		'@typescript-eslint/no-var-requires': 'off',
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': [
			'error',
			{
				argsIgnorePattern: '^Props',
				varsIgnorePattern: '^Props',
				caughtErrorsIgnorePattern: '^Props'
			}
		]
	},
	env: {
		node: true,
		es2022: true,
		browser: true
	},
	plugins: ['@typescript-eslint', 'jsx-a11y'],
	extends: [
		'eslint:recommended',
		'plugin:astro/recommended',
		'plugin:jsx-a11y/recommended',
		'plugin:@typescript-eslint/recommended'
	],
	parser: '@typescript-eslint/parser',

	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module'
	},
	overrides: [
		{
			// Define the configuration for `.astro` file.
			files: ['*.astro'],
			// Allows Astro components to be parsed.
			parser: 'astro-eslint-parser',
			// Parse the script in `.astro` as TypeScript by adding the following configuration.
			// It's the setting you need when using TypeScript.
			parserOptions: {
				parser: '@typescript-eslint/parser',
				extraFileExtensions: ['.astro']
			},
			rules: {
				semi: ['error', 'never'],
				'no-multi-spaces': 'error'
			}
		}
	]
}
