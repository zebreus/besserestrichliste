import { describe, it, expect, beforeAll } from 'vitest';
import { compile } from 'svelte/compiler';
import fs from 'fs';
import path from 'path';

let renderComponent: (payload: { out: string }, props: Record<string, unknown>) => void;

beforeAll(async () => {
	const srcPath = path.resolve(__dirname, '../PriceButton.svelte');
	const source = fs.readFileSync(srcPath, 'utf8');
	const { js } = compile(source, { generate: 'server', filename: srcPath });
	const tmpFile = path.resolve(__dirname, 'PriceButton.generated.mjs');
	fs.writeFileSync(tmpFile, js.code);
	renderComponent = (await import(tmpFile)).default as typeof renderComponent;
});

function render(props: Record<string, unknown>) {
	const payload = { out: '' };
	renderComponent(payload, props);
	const doc = new DOMParser().parseFromString(payload.out, 'text/html');
	return doc;
}

type Case = {
	amount: 30 | 50 | 100 | 130 | 150 | 250;
	type: 'deposit' | 'withdraw';
	bg: string;
	textClass?: string;
};

const cases: Case[] = [
	{ amount: 30, type: 'withdraw', bg: 'bg-white', textClass: 'text-black' },
	{ amount: 50, type: 'withdraw', bg: 'bg-blue-900' },
	{ amount: 100, type: 'withdraw', bg: 'bg-amber', textClass: 'text-black' },
	{ amount: 130, type: 'withdraw', bg: 'bg-green', textClass: 'text-black' },
	{ amount: 150, type: 'withdraw', bg: 'bg-red-950' },
	{ amount: 250, type: 'deposit', bg: 'bg-green-950' }
];

describe('PriceButton', () => {
	for (const c of cases) {
		it(`renders ${c.type} ${c.amount}`, () => {
			const doc = render({ amount: c.amount, type: c.type });
			const button = doc.querySelector('button');

			if (!button) throw new Error('Button not found');

			expect(button.className).toContain(c.bg);
			if (c.textClass) {
				expect(button.className).toContain(c.textClass);
			} else {
				expect(button.className).not.toContain('text-black');
			}

			const formatted = new Intl.NumberFormat(undefined, {
				style: 'currency',
				currency: 'EUR'
			}).format(c.amount / 100);
			const sign = c.type === 'deposit' ? '+' : '-';
			expect(button.textContent).toBe(`${sign}${formatted}`);
		});
	}
});
