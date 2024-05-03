import prisma from "$lib/prisma";
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = (async ({ params: { id } }) => {
    const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        include: { initiatorIn: true, recipientIn: true },
    });
    if (!user) {
        //TODO: Thisis not the correct way to handle any error here 
        throw new Error("User not found")
    }

    return { user };
});

export const actions: Actions = {
    deposit: async ({ request, params }) => {
        const formData = await request.formData();
        const initiatorId = Number(params.id);
        const amount = formData.get("amount");

        const initiator = await prisma.user.findUniqueOrThrow({
            where: { id: Number(initiatorId) },
        })

        await prisma.transaction.create({
            data: {
                amount: - Number(amount),
                title: "UI Transaction",
                type: "deposit",
                recipient: { connect: { id: 0 } },
                initiator: {
                    connect: initiator
                }
            }
        })
    },
    withdraw: async ({ request, params }) => {
        const formData = await request.formData();
        const initiatorId = Number(params.id);
        const amount = formData.get("amount");

        const initiator = await prisma.user.findUniqueOrThrow({
            where: { id: Number(initiatorId) },
        })

        await prisma.transaction.create({
            data: {
                amount: Number(amount),
                title: "UI Transaction",
                type: "transfer",
                recipient: { connect: { id: 0 } },
                initiator: {
                    connect: initiator
                }
            }
        })
    }
};