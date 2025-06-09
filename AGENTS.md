# besserestrichliste

## Background

**besserestrichliste** is a modern, self-hosted tally sheet system designed for communal spaces like hackerspaces, coworking hubs, or shared housing. It digitizes the traditional "Strichliste" (German for tally sheet) used to track purchases and shared expenses among trusted groups. The system operates on a principle of mutual trust rather than technical enforcement.

- Replaces error-prone physical tally sheets or spreadsheets
- Handles shared finances without requiring real money transactions
- Built for communities where trust is implicit but accountability matters
- Members self-report transactions (deposits/withdrawals)
- Designed for communities where social accountability replaces strict access controls
- Auditability comes from transparency (visible transaction logs), not authentication

### Key Features

- **Simple Accounts**: Members need only a username to start tracking balances
- **Flexible Transactions**:
    - Record purchases or personal top-ups
    - Send/receive credits between members
    - Optional notes for context (e.g., "coffee beans")
- **Self-Service**: No admin needed for routine operations
- **Audit Trail**: Full history of all transactions

### Technical Approach

This implementation prioritizes:

- **Reliability**: Type-safe code and automated testing
- **Maintainability**: Modern toolchain with built-in formatting/linting

## Notes

- It is not allowed to use `npx` in this project. There are locally installed versions of all necessary tools, and you should use those instead.
- All the executables from packages defined in `package.json` are available directly in your PATH. For example to use eslint, just execute `eslint` in the terminal.
- You also have all common linux tools at your disposal.

## Making changes

After editing any file, make sure it is formatted correctly (using prettier). For example, if you edited `src/FILE.ts`, run:

```bash
prettier --write src/FILE.ts
```

## Verify your changes are okay

Before committing changes ALWAYS run `bash test.sh` and fix all errors that are reported. This will execute the following commands:

```bash
prettier --check .
eslint .
prisma generate
svelte-kit sync
svelte-check
vitest --run
```

These commands are defined in test.sh and ensure:

- Type safety (TypeScript validation)
- Svelte component validation (svelte-check)
- Consistent code style (Prettier)
- Code quality (ESLint)
- Functionality (Vitest tests)
- Database schema is up-to-date
