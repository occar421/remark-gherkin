<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

## When create a new package

- DO NOT use `prepublishOnly` script.
- Only use `catalog:` or `workspaces:` version in `package.json`.
- Initial package version should be `0.0.0`.

### Generate code

```
vp create vite:library
```

### Initialize package on npm

```
npx setup-npm-trusted-publish ??? --dry-run
```

## Language Policy

- All comments and markdown must be written in English.

## Handling of README.md

`README.md` is an important file for managing the project overview and the list of packages.

### Update Timing

- **When adding a new package**: Add a link and description for the new package in the `Packages` section.
- **When renaming a package**: Update the relevant part in the `Packages` section.
- **When the development flow changes**: Keep the steps in the `Development` section up to date.
- **When the overall project policy changes**: Update the introductory description.
