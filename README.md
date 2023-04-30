# Project Backend API Stack

## TechStack

- TypeScript (using esbuild for fast compilation, and tsx for development)
- Env vars
- Tests (using Vitest)
- Fastify
- Docker image
- Linting
- ESM (can be opt out by changing the tsconfig: https://www.typescriptlang.org/docs/handbook/esm-node.html)

**BYODB - Bring your own database** - no database connection included

## Set Up

- Install the dependencies.

  yarn

## Backend API Development

There are a number of handy commands you can run to help with development.

| Command           | Action                                                            |
| ----------------- | ----------------------------------------------------------------- |
| `yarn dev`        | Run the server in dev mode, automatically restarts on file change |
| `yarn build`      | Compile TypeScript to JavaScript                                  |
| `yarn start`      | Start JavaScript from 'build' directory                           |
| `yarn test`       | Run unit tests (run `pnpm build` before)                          |
| `yarn test:watch` | Run backend tests in watch mode, running on changed test files    |
| `yarn lint`       | Run eslint                                                        |
| `yarn lint:fix`   | Run eslint in fix mode                                            |

## Recommended Vscode Extensions

[Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
[ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

## GIT Commits

When writing a commit message in Git, it's helpful to use certain keywords to provide context and clarity. Here are some commonly used keywords and their meanings:

- **feat**: A new feature or functionality has been added.
- **fix**: A bug or issue has been fixed.
- **refactor**: Code has been refactored or optimized without changing its functionality.
- **docs**: Changes have been made to the documentation.
- **style**: Changes have been made to the formatting or style of the code, without changing its functionality.
- **test**: Changes have been made to the test suite or new tests have been added.
- **chore**: Non-code changes have been made, such as updating dependencies or configuring build tools.
- **perf**: Changes have been made to improve performance.
- **revert**: A previous commit has been reverted.
- **merge**: A merge has occurred between branches.

Using these keywords at the beginning of a commit message can help make it easier to understand the purpose and scope of the changes being made.

### References
- https://medium.com/@yonatan.bendahan/an-opinionated-node-js-boilerplate-using-typescript-fastify-62502770b07d
- https://github.com/yonathan06/fastify-typescript-starter
