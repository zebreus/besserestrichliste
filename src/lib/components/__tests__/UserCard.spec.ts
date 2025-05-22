import { describe, it, expect } from 'vitest';
import { compile } from 'svelte/compiler';
import { tmpdir } from 'os';
import { join } from 'path';
import { promises as fs } from 'fs';
import { JSDOM } from 'jsdom';

async function renderComponent(props: Record<string, unknown>) {
	const source = await fs.readFile('src/lib/components/UserCard.svelte', 'utf8');
	const { js } = compile(source, { generate: 'ssr' });
	const file = join(tmpdir(), `UserCard_${Math.random()}.mjs`);
	await fs.writeFile(file, js.code);
	const mod = await import('file://' + file);
	const payload = { out: '' };
	mod.default(payload, props);
	const dom = new JSDOM(payload.out);
	return dom.window.document;
}

describe('UserCard', () => {
	it('formats balance as currency and applies positive class', async () => {
		const user = { id: 1, name: 'Alice', balance: 1234 };
		const doc = await renderComponent({ user });
		const small = doc.querySelector('small');
		const expected = new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency: 'EUR'
		}).format(user.balance / 100);
		expect(small?.textContent).toBe(expected);
		expect(small?.classList.contains('bg-green-950')).toBe(true);
	});

	it('formats negative balance and applies negative class', async () => {
		const user = { id: 2, name: 'Bob', balance: -5678 };
		const doc = await renderComponent({ user });
		const small = doc.querySelector('small');
		const expected = new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency: 'EUR'
		}).format(user.balance / 100);
		expect(small?.textContent).toBe(expected);
		expect(small?.classList.contains('bg-red-950')).toBe(true);
	});
});
