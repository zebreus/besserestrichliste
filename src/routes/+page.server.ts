import prisma from '$lib/prisma';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (async () => {
    // 1.
    const response = await prisma.user.findMany({
        where: {},
        include: {},
    })
    console.log(response)

    // 2.
    return { users: response };
})