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

    const otherUsers = await prisma.user.findMany({
        select: { id: true, name: true },
        where: { NOT: { id: Number(id) } }
    })

    return { user, otherUsers };
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
    },
    transfer: async ({ request, params }) => {
        const formData = await request.formData();
        const initiatorId = Number(params.id);
        const amount = formData.get("amount");
        const recipientName = formData.get("recipient");
        const reason = formData.get("reason");

        const initiator = await prisma.user.findUniqueOrThrow({
            where: { id: Number(initiatorId) },
        })
        // TODO: Figure out how to use ids in the frontend
        const recipient = await prisma.user.findFirstOrThrow({
            where: { name: "" + recipientName },
        })

        await prisma.transaction.create({
            data: {
                amount: Number(amount),
                title: ("" + reason) || "",
                type: "transfer",
                recipient: { connect: recipient },
                initiator: { connect: initiator }
            }
        })
    },
    edit: async ({ request, params }) => {
        const formData = await request.formData();
        const userId = Number(params.id);
        const name = formData.get("name");

        await prisma.user.update({
            where: { id: Number(userId) },
            data: { name: "" + name }
        })
    }
};