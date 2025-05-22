import { describe, it, expect } from 'vitest';
import { parseAmount } from './money';

describe('parseAmount', () => {
	it('parses positive numbers', () => {
		expect(parseAmount('50')).toBe(50);
		expect(parseAmount(30 as unknown as FormDataEntryValue)).toBe(30);
	});

	it('rejects zero, negative and NaN', () => {
		expect(parseAmount('0')).toBeNull();
		expect(parseAmount('-5')).toBeNull();
		expect(parseAmount('foo')).toBeNull();
		expect(parseAmount(null)).toBeNull();
	});
});
