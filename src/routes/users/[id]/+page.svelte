<script lang="ts">
	import type { PageServerData } from './$types';

	export let data: PageServerData;
</script>

<div>
	<h1>{data.user.name}</h1>
	<p>
		Balance: {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(
			data.user.balance / 100
		)}
	</p>
	<main>
		<figure>
			<figcaption>Initiated transactions</figcaption>
			<ul>
				{#each data.user.initiatorIn as transaction (transaction.id)}
					<li>
						<span
							>{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(
								transaction.amount / 100
							)}</span
						>
						<span>{transaction.processedAt.toDateString()}</span>
						<span>To {transaction.recipientId}</span>
					</li>
				{/each}
			</ul>
		</figure>
		<figure>
			<figcaption>Received transactions</figcaption>
			<ul>
				{#each data.user.recipientIn as transaction (transaction.id)}
					<li>
						<span
							>{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(
								transaction.amount / 100
							)}</span
						>
						<span>{transaction.processedAt.toDateString()}</span>
						<span>From {transaction.initiatorId}</span>
					</li>
				{/each}
			</ul>
		</figure>
	</main>
</div>
