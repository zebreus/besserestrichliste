set -ex
prettier --check .
eslint .
prisma generate
svelte-kit sync
svelte-check
vitest --run