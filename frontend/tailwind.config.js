import fs from 'fs';

const configContent = `/** @type {import('tailwindcss').Config} */
export default {
	theme: {
		extend: {},
	},
	plugins: [],
};
`;

fs.writeFileSync('tailwind.config.cjs', configContent, 'utf8');
console.log('tailwind.config.cjs has been created!');
