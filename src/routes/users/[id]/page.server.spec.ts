import { describe, it, expect, vi } from 'vitest';
import type { Mock } from 'vitest';
import type { PageServerLoadEvent } from './$types';

vi.mock('$lib/prisma', () => ({
	default: {
		user: {
			findUnique: vi.fn(),
			findMany: vi.fn()
		}
	}
}));

import { load } from './+page.server';
import prisma from '$lib/prisma';

describe('user page loader', () => {
	it('throws 404 when user is missing', async () => {
		(prisma.user.findUnique as unknown as Mock).mockResolvedValue(null);

		const event = { params: { id: '1' } } as unknown as PageServerLoadEvent;
		await expect(load(event)).rejects.toMatchObject({ status: 404 });
	});
});
