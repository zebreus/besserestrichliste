// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import { parseArgs } from 'node:util';

const prisma = new PrismaClient();

async function main() {
	const {
		values: { environment }
	} = parseArgs({
		options: { environment: { type: 'string' } }
	});

	const isDevelopment = environment !== 'production';

	console.log(
		`Start seeding ${isDevelopment ? 'development data' : 'minimal production database'}...`
	);

	const previousUserZero = await prisma.user.findFirst({
		where: {
			id: 0
		}
	});
	if (previousUserZero) {
		console.log(`Database is already seeded ...`);
		return;
	}

	// The matekasse user is used to transfer money to other users when they put cash into the matekasse
	const matekasse = await prisma.user.create({
		data: {
			id: 0,
			name: 'Matekasse',
			internal: true
		}
	});

	if (!isDevelopment) {
		console.log(`Minimal production seeding finished.`);
		return;
	}

	const zebreus = await prisma.user.create({
		data: {
			name: 'Zerberos'
		}
	});
	const avocadoom = await prisma.user.create({
		data: {
			name: 'Avocadome'
		}
	});
	const hexa = await prisma.user.create({
		data: {
			name: 'Hexagon'
		}
	});
	const braack = await prisma.user.create({
		data: {
			name: 'Brack'
		}
	});
	const fleaz = await prisma.user.create({
		data: {
			name: 'Fließ!'
		}
	});
	const andi = await prisma.user.create({
		data: {
			name: 'andi-r'
		}
	});
	const hxr = await prisma.user.create({
		data: {
			name: 'hxr418'
		}
	});

	await prisma.transaction.create({
		data: {
			amount: 1000,
			title: '',
			type: 'cash',
			fromId: matekasse.id,
			toId: zebreus.id
		}
	});
	await prisma.transaction.create({
		data: {
			amount: 130,
			title: '',
			type: 'sale',
			fromId: zebreus.id,
			toId: matekasse.id
		}
	});
	await prisma.transaction.create({
		data: {
			amount: 130,
			title: '',
			type: 'sale',
			fromId: zebreus.id,
			toId: matekasse.id
		}
	});
	await prisma.transaction.create({
		data: {
			amount: 50,
			title: '',
			type: 'sale',
			fromId: hxr.id,
			toId: matekasse.id
		}
	});
	await prisma.transaction.create({
		data: {
			amount: 2000,
			title: '',
			type: 'cash',
			fromId: matekasse.id,
			toId: avocadoom.id
		}
	});
	await prisma.transaction.create({
		data: {
			amount: 450,
			title: 'Pizza',
			type: 'cash',
			fromId: avocadoom.id,
			toId: matekasse.id
		}
	});
	await prisma.transaction.create({
		data: {
			amount: 50,
			title: '',
			type: 'transfer',
			fromId: hexa.id,
			toId: avocadoom.id
		}
	});
	await prisma.transaction.create({
		data: {
			amount: 50,
			title: '',
			type: 'transfer',
			fromId: andi.id,
			toId: avocadoom.id
		}
	});
	await prisma.transaction.create({
		data: {
			amount: 50,
			title: '',
			type: 'transfer',
			fromId: fleaz.id,
			toId: avocadoom.id
		}
	});
	await prisma.transaction.create({
		data: {
			amount: 50,
			title: '',
			type: 'transfer',
			fromId: braack.id,
			toId: avocadoom.id
		}
	});
	console.log(`Seeding finished.`);
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
