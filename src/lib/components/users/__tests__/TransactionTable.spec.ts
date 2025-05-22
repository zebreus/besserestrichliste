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
	initiatorId: number | null;
	recipientId: number | null;
};

let renderComponent: (
	payload: { out: string; head: { out: string; title: string } },
	props: { transactions: Transaction[]; title: string }
) => void;

beforeAll(async () => {
	const srcPath = path.resolve(__dirname, '../TransactionTable.svelte');
	const source = fs.readFileSync(srcPath, 'utf8');
	const { js } = compile(source, { generate: 'ssr', filename: srcPath });
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
				initiatorId: 1,
				recipientId: null
			},
			{
				id: 2,
				title: 'Groceries',
				type: 'debit',
				processedAt: new Date('2024-01-11T00:00:00Z'),
				amount: -1200,
				initiatorId: null,
				recipientId: 2
			}
		];

		const payload = { out: '', head: { out: '', title: '' } };
		renderComponent(payload, { transactions, title: 'Recent transactions' });

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

			expect(amountSpan.textContent).toBe(formatted);

			if (transactions[index].amount > 0) {
				expect(amountSpan.classList.contains('bg-green-950')).toBe(true);
			} else if (transactions[index].amount < 0) {
				expect(amountSpan.classList.contains('bg-red-950')).toBe(true);
			}

			expect(dateSpan.textContent).toBe(transactions[index].processedAt.toDateString());
		});
	});
});
