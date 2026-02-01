import prisma from '$lib/prisma';
import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const allUsers = await prisma.user.findMany({
		where: { internal: false },
		include: {}
	});

	const twoWeeksAgo = new Date();
	twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

	const activeUsers = allUsers.filter((user) => new Date(user.lastActive) >= twoWeeksAgo);
	const inactiveUsers = allUsers.filter((user) => new Date(user.lastActive) < twoWeeksAgo);

	return { activeUsers, inactiveUsers };
};

export const actions: Actions = {
	createUser: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name');
		if (!name || typeof name !== 'string') {
			console.log('Missing name');
			return fail(400, { name, missing: true });
		}
		console.log(formData);

		const newUser = await prisma.user.create({
			data: {
				name: name
			}
		});

		redirect(303, '/users/' + newUser.id);
	}
};
