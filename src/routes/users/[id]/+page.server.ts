import prisma from "$lib/prisma";
import type { PageServerLoad } from './$types';

// 1.
export const load: PageServerLoad = (async ({ params: { id } }) => {
    // 2.
    const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        include: { initiatorIn: true, recipientIn: true },
    });
    if (!user) {
        //TODO: This is not the correct way to handle any error here 
        throw new Error("User not found")
    }

    // 3.
    return { user };
});