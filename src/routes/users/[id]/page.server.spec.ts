import { actions } from './+page.server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/prisma', () => {
	return {
		default: {
			user: { findUniqueOrThrow: vi.fn() },
			transaction: { create: vi.fn() }
		}
	};
});

const prisma = (await import('$lib/prisma')).default as {
	user: { findUniqueOrThrow: ReturnType<typeof vi.fn> };
	transaction: { create: ReturnType<typeof vi.fn> };
};

function makeFormData(amount: string, recipient: string, reason: string) {
	const formData = new FormData();
	formData.append('amount', amount);
	formData.append('recipient', recipient);
	formData.append('reason', reason);
	return formData;
}

describe('transfer action', () => {
	beforeEach(() => {
		// reset all mock calls
		vi.clearAllMocks();
	});

	it('looks up recipient by numeric id', async () => {
		prisma.user.findUniqueOrThrow.mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce({ id: 2 });

		const request = {
			formData: async () => makeFormData('100', '2', 'test')
		};
		await actions.transfer({ request, params: { id: '1' } } as Parameters<
			typeof actions.transfer
		>[0]);

		expect(prisma.user.findUniqueOrThrow).toHaveBeenNthCalledWith(1, { where: { id: 1 } });
		expect(prisma.user.findUniqueOrThrow).toHaveBeenNthCalledWith(2, { where: { id: 2 } });
	});
});
