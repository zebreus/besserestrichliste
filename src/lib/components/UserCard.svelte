<script lang="ts">
	import type { User } from '@prisma/client';

	export let user: User;
</script>

<a href={`/users/${user.id}`} class="user">
	<h2>{user.name}</h2>
	<small
		>{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(
			user.balance / 100
		)}</small
	>
</a>
