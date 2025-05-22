import { describe, it, beforeEach, afterEach, expect, vi, type Mock } from 'vitest';

interface MockPrisma {
	user: {
		findFirst: Mock;
		create: Mock;
	};
	transaction: {
		create: Mock;
	};
	$disconnect: Mock;
}

let mockPrisma: MockPrisma;
const parseArgsMock: Mock = vi.fn();

vi.mock('@prisma/client', () => ({
	PrismaClient: vi.fn(() => mockPrisma)
}));

vi.mock('node:util', () => ({
	parseArgs: (...args: unknown[]) => parseArgsMock(...args)
}));

vi.mock('node:util/parseArgs', () => ({
	default: (...args: unknown[]) => parseArgsMock(...args)
}));

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

beforeEach(() => {
	vi.resetModules();
	mockPrisma = {
		user: {
			findFirst: vi.fn(),
			create: vi.fn().mockResolvedValue({})
		},
		transaction: {
			create: vi.fn().mockResolvedValue({})
		},
		$disconnect: vi.fn().mockResolvedValue(undefined)
	};
	parseArgsMock.mockReset();
});

afterEach(() => {
	vi.clearAllMocks();
});

describe('seed script', () => {
	it('runs minimal seeding in production', async () => {
		parseArgsMock.mockReturnValue({ values: { environment: 'production' } });
		mockPrisma.user.findFirst.mockResolvedValue(null);
		await import('../seed');
		await flushPromises();

		expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
		expect(mockPrisma.transaction.create).not.toHaveBeenCalled();
	});

	it('creates demo data in development', async () => {
		parseArgsMock.mockReturnValue({ values: { environment: 'development' } });
		mockPrisma.user.findFirst.mockResolvedValue(null);
		await import('../seed');
		await flushPromises();

		expect(mockPrisma.user.create).toHaveBeenCalledTimes(8);
		expect(mockPrisma.transaction.create).toHaveBeenCalledTimes(10);
	});

	it('exits early when user id 0 exists', async () => {
		parseArgsMock.mockReturnValue({ values: { environment: 'development' } });
		mockPrisma.user.findFirst.mockResolvedValue({ id: 0 });
		await import('../seed');
		await flushPromises();

		expect(mockPrisma.user.create).not.toHaveBeenCalled();
		expect(mockPrisma.transaction.create).not.toHaveBeenCalled();
	});
});
