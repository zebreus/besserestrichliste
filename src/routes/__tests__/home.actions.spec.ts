import { describe, it, expect, beforeEach, vi, type MockInstance } from 'vitest';

// Mock prisma and sveltekit helpers before importing the actions
vi.mock('$lib/prisma', () => ({
	default: {
		user: {
			create: vi.fn()
		}
	}
}));

const failMock = vi.fn();
const redirectMock = vi.fn();
vi.mock('@sveltejs/kit', () => ({
	fail: (...args: unknown[]) => failMock(...args),
	redirect: (...args: unknown[]) => redirectMock(...args)
}));

import prisma from '$lib/prisma';
import type { RequestEvent } from '../$types';
import { actions } from '../+page.server';

describe('createUser action', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns fail(400) when name is missing', async () => {
		failMock.mockReturnValue('fail');
		const request = {
			formData: vi.fn(async () => ({ get: () => null }))
		};
		const event = { request } as unknown as RequestEvent;

		const result = await actions.createUser(event);

		expect(failMock).toHaveBeenCalledWith(400, { name: null, missing: true });
		expect(result).toBe('fail');
		expect(prisma.user.create as unknown as MockInstance).not.toHaveBeenCalled();
	});

	it('creates user and redirects when name is provided', async () => {
		(prisma.user.create as unknown as MockInstance).mockResolvedValue({ id: 1 });

		const request = {
			formData: vi.fn(async () => ({ get: () => 'Alice' }))
		};
		const event = { request } as unknown as RequestEvent;

		await actions.createUser(event);

		expect(prisma.user.create).toHaveBeenCalledWith({
			data: { name: 'Alice' }
		});
		expect(redirectMock).toHaveBeenCalledWith(303, '/users/1');
		expect(failMock).not.toHaveBeenCalled();
	});
});
