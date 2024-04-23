<script lang="ts">
  import Post from '$lib/components/Post.svelte'
  import type { Post as PostT, User } from "@prisma/client";
  
  export let data: { feed: Array<PostT & { author?: User }> };
</script>

<div>
  <h1>My Blog</h1>
  <main>
    <div>
        {#each data.feed as post (post.id)}
          <Post {post} />
        {/each}
    </div>
  </main>
</div>