import prisma from '$lib/prisma';
import type { PageServerLoad, Actions } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params: { id } }) => {
	const user = await prisma.user.findUnique({
		where: { id: Number(id) },
		include: {
			initiatorIn: { include: { reversedBy: true, reverses: true } },
			recipientIn: { include: { reversedBy: true, reverses: true } }
		}
	});
	if (!user) {
		throw error(404, 'User not found');
	}

	const otherUsers = await prisma.user.findMany({
		select: { id: true, name: true },
		where: { NOT: { id: Number(id) } }
	});

	return { user, otherUsers };
};

export const actions: Actions = {
	deposit: async ({ request, params }) => {
		const formData = await request.formData();
		const initiatorId = Number(params.id);
		const amount = formData.get('amount');

		const initiator = await prisma.user.findUniqueOrThrow({
			where: { id: Number(initiatorId) }
		});

		await prisma.transaction.create({
			data: {
				amount: -Number(amount),
				title: 'UI Transaction',
				type: 'deposit',
				recipient: { connect: { id: 0 } },
				initiator: {
					connect: { id: initiator.id }
				}
			}
		});
	},
	withdraw: async ({ request, params }) => {
		const formData = await request.formData();
		const initiatorId = Number(params.id);
		const amount = formData.get('amount');

		const initiator = await prisma.user.findUniqueOrThrow({
			where: { id: Number(initiatorId) }
		});

		await prisma.transaction.create({
			data: {
				amount: Number(amount),
				title: 'UI Transaction',
				type: 'transfer',
				recipient: { connect: { id: 0 } },
				initiator: {
					connect: { id: initiator.id }
				}
			}
		});
	},
	transfer: async ({ request, params }) => {
		const formData = await request.formData();
		const initiatorId = Number(params.id);
		const amount = formData.get('amount');
		const recipientId = formData.get('recipient');
		const reason = formData.get('reason');

		const initiator = await prisma.user.findUniqueOrThrow({
			where: { id: Number(initiatorId) }
		});
		const recipient = await prisma.user.findUniqueOrThrow({
			where: { id: Number(recipientId) }
		});

		await prisma.transaction.create({
			data: {
				amount: Number(amount),
				title: '' + reason || '',
				type: 'transfer',
				recipient: { connect: { id: recipient.id } },
				initiator: { connect: { id: initiator.id } }
			}
		});
	},
	edit: async ({ request, params }) => {
		const formData = await request.formData();
		const userId = Number(params.id);
		const name = formData.get('name');

		await prisma.user.update({
			where: { id: Number(userId) },
			data: { name: '' + name }
		});
	},
	undo: async ({ request }) => {
		const formData = await request.formData();
		const transactionId = Number(formData.get('transactionId'));

		// Get the original transaction
		const originalTransaction = await prisma.transaction.findUniqueOrThrow({
			where: { id: transactionId },
			include: { reversedBy: true }
		});

		// Check if already reversed
		if (originalTransaction.reversedBy) {
			return { error: 'Transaction already reversed' };
		}

		// Check if transaction is within 5 minutes
		const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
		if (new Date(originalTransaction.processedAt) < fiveMinutesAgo) {
			return { error: 'Transaction is too old to undo' };
		}

		// Create reversal transaction
		await prisma.transaction.create({
			data: {
				amount: -originalTransaction.amount,
				title: originalTransaction.title,
				type: originalTransaction.type,
				initiatorId: originalTransaction.initiatorId,
				recipientId: originalTransaction.recipientId,
				reversesId: originalTransaction.id
			}
		});

		return { success: true };
	}
};
