import { beforeAll, describe, it, expect } from 'vitest';
import { compile } from 'svelte/compiler';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

let renderComponent: (payload: { out: string }, props: Record<string, unknown>) => void;

beforeAll(async () => {
	const srcPath = path.resolve(__dirname, '../UserCard.svelte');
	const source = fs.readFileSync(srcPath, 'utf8');
	const { js } = compile(source, { generate: 'ssr', filename: srcPath });
	const tmpFile = path.resolve(__dirname, 'UserCard.generated.mjs');
	fs.writeFileSync(tmpFile, js.code);
	renderComponent = (await import(tmpFile)).default as typeof renderComponent;
});

function render(props: Record<string, unknown>) {
	const payload = { out: '' };
	renderComponent(payload, props);
	const dom = new JSDOM(payload.out);
	return dom.window.document;
}

describe('UserCard', () => {
	it('formats balance as currency and applies positive class', () => {
		const user = { id: 1, name: 'Alice', balance: 1234 };
		const doc = render({ user });
		const small = doc.querySelector('small');
		const expected = new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency: 'EUR'
		}).format(user.balance / 100);
		expect(small?.textContent).toBe(expected);
		expect(small?.classList.contains('bg-green-950')).toBe(true);
	});

	it('formats negative balance and applies negative class', () => {
		const user = { id: 2, name: 'Bob', balance: -5678 };
		const doc = render({ user });
		const small = doc.querySelector('small');
		const expected = new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency: 'EUR'
		}).format(user.balance / 100);
		expect(small?.textContent).toBe(expected);
		expect(small?.classList.contains('bg-red-950')).toBe(true);
	});
});
