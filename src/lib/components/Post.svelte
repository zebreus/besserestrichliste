<script lang="ts">
    import { goto } from "$app/navigation";
	import type { Post, User } from "@prisma/client";
    import type { PageData } from "../../routes/$types";
  
    export let post: Post & { author?: User };
  </script>
  
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="post" on:click={() => goto(`/p/${post.id}`)}>
    <h2>{post.title}</h2>
    <small
      >{post.author?.name ? `By ${post.author.name}` : "Unknown author"}</small
    >
    <p>{@html post.content}</p>
  </div>
  
  <style>
    div {
      color: inherit;
      padding: 2rem;
    }
    .post {
      background: white;
      transition: box-shadow 0.1s ease-in;
    }
  
    .post:hover {
      box-shadow: 1px 1px 3px #aaa;
      cursor: pointer;
    }
  
    .post,
    .post {
      margin-top: 2rem;
    }
  </style>