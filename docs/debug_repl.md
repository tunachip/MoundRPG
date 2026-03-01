# Debug REPL

Run the helper with:

```bash
node ./scripts/debug-repl.ts
```

Available globals inside the REPL:

```js
CWD
ls()
cd('src/engine')
pwd()
tree()
find('rules')
cat('rules.ts')
cat('-l', 'rules.ts')
cat('-t', 'rules.ts')
rg('ElementRules')
const mod = await load('src/engine/rules.ts')
mod.ElementRules
const fresh = await reload('src/engine/rules.ts')
fresh.ElementRules.water
const rules = await use('./src/engine/rules.ts')
rules.ElementRules.water.weakTo
await use('rules', './src/engine/rules.ts')
rules.ElementRules.water.weakTo
await reuse('rules', './src/engine/rules.ts')
rules.ElementRules.water.weakTo
run('src/engine/rules.ts')
```

Notes:
- `CWD` starts as the shell directory where you launched the script.
- `cd()` only changes the REPL's `CWD`; it does not change your shell session.
- `tree()` shows a recursive directory tree from the REPL `CWD` or a relative target path.
- `find(query, path)` searches file and directory names by substring.
- `cat('-l', file)` lists top-level declarations.
- `cat('-t', file)` expands nested object properties and member names when it can infer them.
- `load(path)` imports a file relative to `CWD`.
- `reload(path)` re-imports a file with cache-busting so repeated edits are visible.
- `use(path)` returns the imported module so you can assign it to a REPL variable.
- `use(name, path)` also creates a REPL global with that name.
- `reuse(path)` and `reuse(name, path)` do the same thing, but with cache-busting reload behavior.
- `run(path, ...args)` executes a file in a fresh Node process relative to the REPL `CWD`.
- On this machine, `load('src/engine/rules.ts')` returns a module with `ElementRules` at the top level.
