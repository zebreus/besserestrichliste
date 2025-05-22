import { describe, it, expect } from 'vitest';
import { sum } from './math';

describe('sum', () => {
	it('adds two numbers', () => {
		expect(sum(1, 2)).toBe(3);
	});
});
