import prisma from '$lib/prisma';
import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const response = await prisma.user.findMany({
		where: {},
		include: {}
	});

	return { users: response };
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
