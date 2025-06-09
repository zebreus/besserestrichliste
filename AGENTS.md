# besserestrichliste

## Background

//TODO Add a short section on what the purpose of this software is. See https://www.strichliste.org/about/

## Notes

- It is not allowed to use `npx` in this project. There are locally installed versions of all necessary tools, and you should use those instead.
- All the executables from packages defined in `package.json` are available directly in your PATH. For example to use eslint, just execute `eslint` in the terminal, no need to prepend it with `npx`.
- You also have all common linux tools at your disposal.

## Making changes

After editing any file, make sure it is formatted correctly (using prettier). For example, if you edited `src/agents/agent.ts`, run:

```bash
prettier --write src/agents/agent.ts
```

## Committing changes

Before committing your changes, make sure the types are correct, the code is formatted, there are no linter errors, and all tests pass. You can do this by running the following commands

```bash
#TODO: Add individual commands to check types, format code, lint, and run tests. Also clarify that they should be run individually.
```
