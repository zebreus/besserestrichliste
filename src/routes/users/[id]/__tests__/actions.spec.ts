import { describe, it, expect, vi, beforeEach } from 'vitest';

interface PrismaMock {
	user: {
		findUniqueOrThrow: ReturnType<typeof vi.fn>;
		findFirstOrThrow: ReturnType<typeof vi.fn>;
		update: ReturnType<typeof vi.fn>;
	};
	transaction: {
		create: ReturnType<typeof vi.fn>;
	};
}

let prismaMock: PrismaMock;

vi.mock('$lib/prisma', () => {
	prismaMock = {
		user: {
			findUniqueOrThrow: vi.fn(async () => ({ id: 1 })),
			findFirstOrThrow: vi.fn(async () => ({ id: 2 })),
			update: vi.fn(async () => ({}))
		},
		transaction: {
			create: vi.fn(async () => ({}))
		}
	};
	return { default: prismaMock };
});

import { actions } from '../+page.server';

beforeEach(() => {
	vi.clearAllMocks();
});

describe('user actions', () => {
	it('creates deposit transaction with negative amount', async () => {
		const fd = new FormData();
		fd.set('amount', '100');
		const request = { formData: vi.fn(async () => fd) } as unknown as Request;

		await actions.deposit({ request, params: { id: '1' } });

		expect(prismaMock.transaction.create).toHaveBeenCalledWith({
			data: {
				amount: -100,
				title: 'UI Transaction',
				type: 'deposit',
				recipient: { connect: { id: 0 } },
				initiator: { connect: { id: 1 } }
			}
		});
	});

	it('creates withdraw transaction with positive amount', async () => {
		const fd = new FormData();
		fd.set('amount', '50');
		const request = { formData: vi.fn(async () => fd) } as unknown as Request;

		await actions.withdraw({ request, params: { id: '1' } });

		expect(prismaMock.transaction.create).toHaveBeenCalledWith({
			data: {
				amount: 50,
				title: 'UI Transaction',
				type: 'transfer',
				recipient: { connect: { id: 0 } },
				initiator: { connect: { id: 1 } }
			}
		});
	});

	it('creates transfer transaction with recipient and reason', async () => {
		const fd = new FormData();
		fd.set('amount', '25');
		fd.set('recipient', 'Bob');
		fd.set('reason', 'Lunch');
		const request = { formData: vi.fn(async () => fd) } as unknown as Request;

		await actions.transfer({ request, params: { id: '1' } });

		expect(prismaMock.transaction.create).toHaveBeenCalledWith({
			data: {
				amount: 25,
				title: 'Lunch',
				type: 'transfer',
				recipient: { connect: { id: 2 } },
				initiator: { connect: { id: 1 } }
			}
		});
	});

	it('updates user name on edit', async () => {
		const fd = new FormData();
		fd.set('name', 'Alice');
		const request = { formData: vi.fn(async () => fd) } as unknown as Request;

		await actions.edit({ request, params: { id: '1' } });

		expect(prismaMock.user.update).toHaveBeenCalledWith({
			where: { id: 1 },
			data: { name: 'Alice' }
		});
	});
});
