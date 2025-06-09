import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import PriceButton from '../PriceButton.svelte';

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
			const { getByRole } = render(PriceButton, {
				props: { amount: c.amount, type: c.type }
			});
			const button = getByRole('button') as HTMLButtonElement;
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
