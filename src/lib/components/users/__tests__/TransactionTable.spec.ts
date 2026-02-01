import { beforeAll, describe, expect, it } from 'vitest';
import { compile } from 'svelte/compiler';
import fs from 'fs';
import path from 'path';

type Transaction = {
	id: number;
	title: string;
	type: string;
	processedAt: Date;
	amount: number;
	fromId: number | null;
	toId: number | null;
	reversedBy: { id: number } | null;
	reverses: { id: number } | null;
};

let renderComponent: (
	payload: { out: string; head: { out: string; title: string } },
	props: { transactions: Transaction[]; title: string; userId: number }
) => void;

beforeAll(async () => {
	const srcPath = path.resolve(__dirname, '../TransactionTable.svelte');
	const source = fs.readFileSync(srcPath, 'utf8');
	const { js } = compile(source, { generate: 'server', filename: srcPath });
	const tmpFile = path.resolve(__dirname, 'TransactionTable.generated.mjs');
	fs.writeFileSync(tmpFile, js.code);
	renderComponent = (await import(tmpFile)).default as typeof renderComponent;
});

describe('TransactionTable', () => {
	it('renders formatted rows with colors and dates', () => {
		const transactions = [
			{
				id: 1,
				title: 'Salary',
				type: 'credit',
				processedAt: new Date('2024-01-10T00:00:00Z'),
				amount: 2500,
				fromId: 2,
				toId: 1,
				reversedBy: null,
				reverses: null
			},
			{
				id: 2,
				title: 'Groceries',
				type: 'debit',
				processedAt: new Date('2024-01-11T00:00:00Z'),
				amount: 1200,
				fromId: 1,
				toId: 2,
				reversedBy: null,
				reverses: null
			}
		];

		const payload = { out: '', head: { out: '', title: '' } };
		renderComponent(payload, { transactions, title: 'Recent transactions', userId: 1 });

		const doc = new DOMParser().parseFromString(payload.out, 'text/html');
		const rows = doc.querySelectorAll('li');
		expect(rows.length).toBe(transactions.length);

		rows.forEach((row, index) => {
			const spans = row.querySelectorAll('span');
			const amountSpan = spans[0];
			const dateSpan = spans[1];

			const formatted = new Intl.NumberFormat(undefined, {
				style: 'currency',
				currency: 'EUR'
			}).format(transactions[index].amount / 100);

			// Check if amount text includes the formatted value (with +/- prefix)
			expect(amountSpan.textContent).toContain(formatted);

			// First transaction: from=2, to=1, userId=1 -> incoming (green)
			// Second transaction: from=1, to=2, userId=1 -> outgoing (red)
			if (index === 0) {
				expect(amountSpan.classList.contains('bg-green-950')).toBe(true);
			} else if (index === 1) {
				expect(amountSpan.classList.contains('bg-red-950')).toBe(true);
			}

			expect(dateSpan.textContent).toBe(transactions[index].processedAt.toDateString());
		});
	});
});
