<script>
	import { page } from '$app/stores';
</script>

<header class="bg-neutral-800 p-4">
	<nav class="container mx-auto">
		<ul class="flex gap-4">
			<li aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
				<a href="/">Home</a>
			</li>
			<li aria-current={$page.url.pathname === '/about' ? 'page' : undefined}>
				<a href="/about">About</a>
			</li>
		</ul>
	</nav>
</header>
