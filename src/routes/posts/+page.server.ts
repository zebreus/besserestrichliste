// src/routes/+page.server.ts

import prisma from '$lib/prisma';
import type { PageLoad } from '../$types';

export const load = (async () => {
    // 1.
    const response = await prisma.post.findMany({
        where: { published: true },
        include: { author: true },
    })
    console.log(response)

    // 2.
    return { feed: response };
}) satisfies PageLoad;