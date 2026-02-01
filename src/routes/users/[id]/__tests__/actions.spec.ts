import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

interface PrismaMock {
	user: {
		findUniqueOrThrow: ReturnType<typeof vi.fn>;
		update: ReturnType<typeof vi.fn>;
	};
	transaction: {
		create: ReturnType<typeof vi.fn>;
		findUniqueOrThrow: ReturnType<typeof vi.fn>;
	};
}

var prismaMock: PrismaMock;

vi.mock('$lib/prisma', () => {
	prismaMock = {
		user: {
			findUniqueOrThrow: vi.fn(async () => ({ id: 1 })),
			update: vi.fn(async () => ({}))
		},
		transaction: {
			create: vi.fn(async () => ({})),
			findUniqueOrThrow: vi.fn(async () => ({
				id: 1,
				amount: 100,
				title: 'Test',
				type: 'transfer',
				fromId: 1,
				toId: 2,
				processedAt: new Date(),
				reversedBy: null
			}))
		}
	};
	return { default: prismaMock };
});

import { actions } from '../+page.server';
import type { RequestEvent } from '../$types';

beforeEach(() => {
	vi.clearAllMocks();
});

describe('user actions', () => {
	it('creates deposit transaction from system to user', async () => {
		const fd = new FormData();
		fd.set('amount', '100');
		const request = { formData: vi.fn(async () => fd) } as unknown as Request;

		await actions.deposit({ request, params: { id: '1' } } as RequestEvent);

		expect(prismaMock.transaction.create).toHaveBeenCalledWith({
			data: {
				amount: 100,
				title: 'UI Transaction',
				type: 'deposit',
				from: { connect: { id: 0 } },
				to: { connect: { id: 1 } }
			}
		});
	});

	it('creates withdraw transaction from user to system', async () => {
		const fd = new FormData();
		fd.set('amount', '50');
		const request = { formData: vi.fn(async () => fd) } as unknown as Request;

		await actions.withdraw({ request, params: { id: '1' } } as RequestEvent);

		expect(prismaMock.transaction.create).toHaveBeenCalledWith({
			data: {
				amount: 50,
				title: 'UI Transaction',
				type: 'withdraw',
				from: { connect: { id: 1 } },
				to: { connect: { id: 0 } }
			}
		});
	});

	it('creates transfer transaction from sender to recipient', async () => {
		(prismaMock.user.findUniqueOrThrow as Mock).mockResolvedValueOnce({ id: 1 });
		(prismaMock.user.findUniqueOrThrow as Mock).mockResolvedValueOnce({ id: 2 });
		const fd = new FormData();
		fd.set('amount', '25');
		fd.set('recipient', '2');
		fd.set('reason', 'Lunch');
		const request = { formData: vi.fn(async () => fd) } as unknown as Request;

		await actions.transfer({ request, params: { id: '1' } } as RequestEvent);

		expect(prismaMock.transaction.create).toHaveBeenCalledWith({
			data: {
				amount: 25,
				title: 'Lunch',
				type: 'transfer',
				from: { connect: { id: 1 } },
				to: { connect: { id: 2 } }
			}
		});
	});

	it('updates user name on edit', async () => {
		const fd = new FormData();
		fd.set('name', 'Alice');
		const request = { formData: vi.fn(async () => fd) } as unknown as Request;

		await actions.edit({ request, params: { id: '1' } } as RequestEvent);

		expect(prismaMock.user.update).toHaveBeenCalledWith({
			where: { id: 1 },
			data: { name: 'Alice' }
		});
	});

	it('creates reversal transaction by swapping from/to', async () => {
		const recentDate = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes ago
		(prismaMock.transaction.findUniqueOrThrow as Mock).mockResolvedValueOnce({
			id: 5,
			amount: 100,
			title: 'Coffee',
			type: 'withdraw',
			fromId: 1,
			toId: 0,
			processedAt: recentDate,
			reversedBy: null
		});

		const fd = new FormData();
		fd.set('transactionId', '5');
		const request = { formData: vi.fn(async () => fd) } as unknown as Request;

		await actions.undo({ request, params: { id: '1' } } as RequestEvent);

		expect(prismaMock.transaction.findUniqueOrThrow).toHaveBeenCalledWith({
			where: { id: 5 },
			include: { reversedBy: true }
		});

		expect(prismaMock.transaction.create).toHaveBeenCalledWith({
			data: {
				amount: 100,
				title: 'Coffee',
				type: 'withdraw',
				fromId: 0,
				toId: 1,
				reversesId: 5
			}
		});
	});

	it('rejects undo for transactions older than 5 minutes', async () => {
		const oldDate = new Date(Date.now() - 6 * 60 * 1000); // 6 minutes ago
		(prismaMock.transaction.findUniqueOrThrow as Mock).mockResolvedValueOnce({
			id: 5,
			amount: 100,
			title: 'Coffee',
			type: 'withdraw',
			fromId: 1,
			toId: 0,
			processedAt: oldDate,
			reversedBy: null
		});

		const fd = new FormData();
		fd.set('transactionId', '5');
		const request = { formData: vi.fn(async () => fd) } as unknown as Request;

		const result = await actions.undo({ request, params: { id: '1' } } as RequestEvent);

		expect(result).toEqual({ error: 'Transaction is too old to undo' });
		expect(prismaMock.transaction.create).not.toHaveBeenCalled();
	});

	it('rejects undo for already reversed transactions', async () => {
		(prismaMock.transaction.findUniqueOrThrow as Mock).mockResolvedValueOnce({
			id: 5,
			amount: 100,
			title: 'Coffee',
			type: 'withdraw',
			fromId: 1,
			toId: 0,
			processedAt: new Date(),
			reversedBy: { id: 6 }
		});

		const fd = new FormData();
		fd.set('transactionId', '5');
		const request = { formData: vi.fn(async () => fd) } as unknown as Request;

		const result = await actions.undo({ request, params: { id: '1' } } as RequestEvent);

		expect(result).toEqual({ error: 'Transaction already reversed' });
		expect(prismaMock.transaction.create).not.toHaveBeenCalled();
	});
});
