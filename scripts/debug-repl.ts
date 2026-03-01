import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import repl from 'node:repl';
import { pathToFileURL } from 'node:url';
import util from 'node:util';

type SymbolNode = {
  children: SymbolNode[];
  kind: string;
  name: string;
};

type ReplState = {
  cwd: string;
};

class RenderedText {
  text: string;

  constructor(text: string) {
    this.text = text;
  }
}

const state: ReplState = {
  cwd: process.cwd(),
};

let server: repl.REPLServer;

function resolveFromCwd(target = '.'): string {
  return path.resolve(state.cwd, target);
}

function ensureWithinProject(targetPath: string): void {
  if (!path.isAbsolute(targetPath)) {
    throw new Error('Expected an absolute path.');
  }
}

function normalizeDirentName(entry: fs.Dirent): string {
  return entry.isDirectory() ? `${entry.name}/` : entry.name;
}

function ls(target = '.'): string[] {
  const absolutePath = resolveFromCwd(target);
  const entries = fs.readdirSync(absolutePath, { withFileTypes: true });

  return entries
    .sort((left, right) => left.name.localeCompare(right.name))
    .map(normalizeDirentName);
}

function cd(target = '.'): string {
  const absolutePath = resolveFromCwd(target);
  const stats = fs.statSync(absolutePath);

  if (!stats.isDirectory()) {
    throw new Error(`${target} is not a directory.`);
  }

  state.cwd = absolutePath;

  return state.cwd;
}

function cat(...args: string[]): RenderedText {
  const { mode, target } = parseCatArgs(args);
  const absolutePath = resolveFromCwd(target);
  const source = fs.readFileSync(absolutePath, 'utf8');

  if (mode === 'list') {
    return new RenderedText(formatSymbolList(getFileSymbols(source)));
  }

  if (mode === 'tree') {
    return new RenderedText(formatSymbolTree(getFileSymbols(source)));
  }

  return new RenderedText(highlightSource(source));
}

function parseCatArgs(args: string[]): { mode: 'full' | 'list' | 'tree'; target: string } {
  let mode: 'full' | 'list' | 'tree' = 'full';
  let target = '';

  for (const arg of args) {
    if (arg === '-l') {
      mode = 'list';
      continue;
    }

    if (arg === '-t') {
      mode = 'tree';
      continue;
    }

    target = arg;
  }

  if (!target) {
    throw new Error("cat() requires a relative file path, for example cat('src/engine/rules.ts').");
  }

  return { mode, target };
}

function formatSymbolList(symbols: SymbolNode[]): string {
  if (symbols.length === 0) {
    return '(no top-level symbols found)';
  }

  return symbols.map((symbol) => formatSymbolLabel(symbol.kind, symbol.name)).join('\n');
}

function formatSymbolTree(symbols: SymbolNode[]): string {
  if (symbols.length === 0) {
    return '(no top-level symbols found)';
  }

  return symbols.map((symbol) => formatSymbolBranch(symbol, '')).join('\n');
}

function formatSymbolBranch(symbol: SymbolNode, indent: string): string {
  const lines = [`${indent}${formatSymbolLabel(symbol.kind, symbol.name)}`];

  for (const child of symbol.children) {
    lines.push(formatSymbolBranch(child, `${indent}  `));
  }

  return lines.join('\n');
}

function formatSymbolLabel(kind: string, name: string): string {
  const colorByKind: Record<string, string> = {
    class: '\x1b[35m',
    const: '\x1b[33m',
    enum: '\x1b[34m',
    function: '\x1b[32m',
    interface: '\x1b[36m',
    let: '\x1b[33m',
    member: '\x1b[90m',
    property: '\x1b[90m',
    type: '\x1b[95m',
    var: '\x1b[33m',
  };
  const reset = '\x1b[0m';
  const color = colorByKind[kind] ?? '\x1b[36m';

  return `${color}${kind}${reset} ${name}`;
}

function getFileSymbols(source: string): SymbolNode[] {
  const symbols: SymbolNode[] = [];
  const lines = source.split('\n');
  const declarationPattern =
    /^(?:export\s+)?(?:default\s+)?(?:async\s+)?(function|class|interface|type|enum|const|let|var)\s+([A-Za-z_$][\w$]*)/;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (/^\s/.test(line)) {
      continue;
    }

    const match = line.match(declarationPattern);
    if (!match) {
      continue;
    }

    const kind = match[1];
    const name = match[2];
    const blockText = extractTrailingBlock(source, line, index);
    const children = parseChildren(kind, blockText);

    symbols.push({ children, kind, name });
  }

  return symbols;
}

function extractTrailingBlock(source: string, line: string, lineIndex: number): string {
  const lines = source.split('\n');
  const startOffset = lines.slice(0, lineIndex).join('\n').length + (lineIndex > 0 ? 1 : 0);
  const lineOffset = source.indexOf(line, startOffset);
  const braceOffset = source.indexOf('{', lineOffset);

  if (braceOffset === -1) {
    return '';
  }

  let depth = 0;
  for (let index = braceOffset; index < source.length; index += 1) {
    const character = source[index];

    if (character === '{') {
      depth += 1;
    } else if (character === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(braceOffset, index + 1);
      }
    }
  }

  return '';
}

function parseChildren(kind: string, blockText: string): SymbolNode[] {
  if (!blockText) {
    return [];
  }

  if (kind === 'const' || kind === 'let' || kind === 'var') {
    return parseObjectLiteralChildren(blockText);
  }

  if (kind === 'class' || kind === 'interface' || kind === 'type') {
    return parseMemberChildren(blockText);
  }

  return [];
}

function parseObjectLiteralChildren(blockText: string): SymbolNode[] {
  const body = blockText.slice(1, -1);
  const children: SymbolNode[] = [];
  const entries = splitTopLevelEntries(body);

  for (const entry of entries) {
    pushObjectChild(entry, children);
  }

  return children;
}

function pushObjectChild(token: string, children: SymbolNode[]): void {
  const trimmed = token.trim();
  if (!trimmed) {
    return;
  }

  const propertyMatch = trimmed.match(/^['"]?([A-Za-z_$][\w$-]*)['"]?\s*:\s*(.+)$/s);
  if (!propertyMatch) {
    return;
  }

  const value = propertyMatch[2].trim();
  const nestedObject = findLeadingBalancedObject(value);

  children.push({
    children: nestedObject ? parseObjectLiteralChildren(nestedObject) : [],
    kind: 'property',
    name: propertyMatch[1],
  });
}

function parseMemberChildren(blockText: string): SymbolNode[] {
  const body = blockText.slice(1, -1);
  const children: SymbolNode[] = [];
  const lines = body.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('//')) {
      continue;
    }

    const methodMatch = line.match(/^(?:public\s+|private\s+|protected\s+|readonly\s+|static\s+)*(?:async\s+)?([A-Za-z_$][\w$]*)\s*\(/);
    if (methodMatch) {
      children.push({ children: [], kind: 'member', name: methodMatch[1] });
      continue;
    }

    const propertyMatch = line.match(/^(?:public\s+|private\s+|protected\s+|readonly\s+|static\s+)*([A-Za-z_$][\w$]*)\s*[?:=]\s*(.+)?$/);
    if (propertyMatch) {
      const nestedObject = propertyMatch[2] ? findLeadingBalancedObject(propertyMatch[2].trim()) : '';
      children.push({
        children: nestedObject ? parseObjectLiteralChildren(nestedObject) : [],
        kind: 'member',
        name: propertyMatch[1],
      });
    }
  }

  return children;
}

function splitTopLevelEntries(body: string): string[] {
  const entries: string[] = [];
  let token = '';
  let braceDepth = 0;
  let bracketDepth = 0;
  let parenDepth = 0;
  let stringQuote = '';

  for (let index = 0; index < body.length; index += 1) {
    const character = body[index];
    const nextCharacter = body[index + 1] ?? '';

    if (stringQuote) {
      token += character;
      if (character === '\\') {
        token += nextCharacter;
        index += 1;
        continue;
      }

      if (character === stringQuote) {
        stringQuote = '';
      }

      continue;
    }

    if (character === '/' && nextCharacter === '/') {
      while (index < body.length && body[index] !== '\n') {
        index += 1;
      }
      token += '\n';
      continue;
    }

    if (character === '/' && nextCharacter === '*') {
      index += 2;
      while (index < body.length && !(body[index] === '*' && body[index + 1] === '/')) {
        index += 1;
      }
      index += 1;
      continue;
    }

    if (character === "'" || character === '"' || character === '`') {
      stringQuote = character;
      token += character;
      continue;
    }

    if (character === '{') {
      braceDepth += 1;
    } else if (character === '}') {
      braceDepth -= 1;
    } else if (character === '[') {
      bracketDepth += 1;
    } else if (character === ']') {
      bracketDepth -= 1;
    } else if (character === '(') {
      parenDepth += 1;
    } else if (character === ')') {
      parenDepth -= 1;
    }

    if (braceDepth === 0 && bracketDepth === 0 && parenDepth === 0 && (character === ',' || character === '\n')) {
      const trimmed = token.trim();
      if (trimmed) {
        entries.push(trimmed);
      }
      token = '';
      continue;
    }

    token += character;
  }

  const trimmed = token.trim();
  if (trimmed) {
    entries.push(trimmed);
  }

  return entries;
}

function findLeadingBalancedObject(value: string): string {
  if (!value.startsWith('{')) {
    return '';
  }

  let depth = 0;
  let stringQuote = '';

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    const nextCharacter = value[index + 1] ?? '';

    if (stringQuote) {
      if (character === '\\') {
        index += 1;
        continue;
      }

      if (character === stringQuote) {
        stringQuote = '';
      }

      continue;
    }

    if (character === "'" || character === '"' || character === '`') {
      stringQuote = character;
      continue;
    }

    if (character === '/' && nextCharacter === '/') {
      while (index < value.length && value[index] !== '\n') {
        index += 1;
      }
      continue;
    }

    if (character === '/' && nextCharacter === '*') {
      index += 2;
      while (index < value.length && !(value[index] === '*' && value[index + 1] === '/')) {
        index += 1;
      }
      index += 1;
      continue;
    }

    if (character === '{') {
      depth += 1;
    } else if (character === '}') {
      depth -= 1;
      if (depth === 0) {
        return value.slice(0, index + 1);
      }
    }
  }

  return '';
}

function rg(query: string, target = '.'): string[] {
  if (!query) {
    throw new Error("rg() requires a search string, for example rg('ElementRules').");
  }

  const rootPath = resolveFromCwd(target);
  const matches: string[] = [];

  walkFiles(rootPath, (filePath) => {
    const source = safeReadText(filePath);
    if (source === null) {
      return;
    }

    const relativePath = path.relative(state.cwd, filePath) || path.basename(filePath);
    const lines = source.split('\n');

    lines.forEach((line, index) => {
      if (line.includes(query)) {
        matches.push(`${relativePath}:${index + 1}: ${line}`);
      }
    });
  });

  return matches;
}

function walkFiles(startPath: string, visit: (filePath: string) => void): void {
  const stats = fs.statSync(startPath);

  if (stats.isFile()) {
    visit(startPath);
    return;
  }

  for (const entry of fs.readdirSync(startPath, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') {
      continue;
    }

    const nextPath = path.join(startPath, entry.name);
    if (entry.isDirectory()) {
      walkFiles(nextPath, visit);
      continue;
    }

    if (entry.isFile()) {
      visit(nextPath);
    }
  }
}

function safeReadText(filePath: string): string | null {
  try {
    const buffer = fs.readFileSync(filePath);
    if (buffer.includes(0)) {
      return null;
    }

    return buffer.toString('utf8');
  } catch {
    return null;
  }
}

async function load(target: string): Promise<unknown> {
  const absolutePath = resolveFromCwd(target);
  ensureWithinProject(absolutePath);

  return import(pathToFileURL(absolutePath).href);
}

async function reload(target: string): Promise<unknown> {
  const absolutePath = resolveFromCwd(target);
  ensureWithinProject(absolutePath);

  const moduleUrl = pathToFileURL(absolutePath);
  moduleUrl.searchParams.set('ts', `${Date.now()}`);

  return import(moduleUrl.href);
}

async function use(nameOrTarget: string, maybeTarget?: string): Promise<unknown> {
  const target = maybeTarget ?? nameOrTarget;
  const moduleValue = await load(target);

  if (!maybeTarget) {
    return moduleValue;
  }

  validateBindingName(nameOrTarget);
  server.context[nameOrTarget] = moduleValue;

  return moduleValue;
}

async function reuse(nameOrTarget: string, maybeTarget?: string): Promise<unknown> {
  const target = maybeTarget ?? nameOrTarget;
  const moduleValue = await reload(target);

  if (!maybeTarget) {
    return moduleValue;
  }

  validateBindingName(nameOrTarget);
  server.context[nameOrTarget] = moduleValue;

  return moduleValue;
}

function validateBindingName(name: string): void {
  if (!/^[A-Za-z_$][\w$]*$/.test(name)) {
    throw new Error(`Invalid binding name: ${name}`);
  }
}

function run(target: string, ...args: string[]) {
  const absolutePath = resolveFromCwd(target);
  const result = spawnSync(process.execPath, [absolutePath, ...args], {
    cwd: state.cwd,
    encoding: 'utf8',
  });

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  return {
    signal: result.signal,
    status: result.status,
  };
}

function pwd(): string {
  return state.cwd;
}

function help(): string {
  return [
    'Available globals:',
    'CWD',
    "ls(path = '.')",
    "cd(path = '.')",
    "pwd()",
    "tree(path = '.')",
    "find(query, path = '.')",
    "cat(path) | cat('-l', path) | cat('-t', path)",
    "rg(query, path = '.')",
    "await load(path)",
    "await reload(path)",
    "await use(path) | await use(name, path)",
    "await reuse(path) | await reuse(name, path)",
    "run(path, ...args)",
  ].join('\n');
}

function highlightSource(source: string): string {
  const reset = '\x1b[0m';
  const colors = {
    comment: '\x1b[90m',
    keyword: '\x1b[36m',
    number: '\x1b[33m',
    string: '\x1b[32m',
    type: '\x1b[35m',
  };

  return source
    .split('\n')
    .map((line) => normalizeIndentation(highlightLine(line, colors, reset)))
    .join('\n');
}

function normalizeIndentation(line: string): string {
  return line.replace(/\t/g, '  ');
}

function highlightLine(
  line: string,
  colors: Record<string, string>,
  reset: string,
): string {
  if (/^\s*\/\//.test(line)) {
    return `${colors.comment}${line}${reset}`;
  }

  let highlighted = line;

  highlighted = highlighted.replace(
    /('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)/g,
    `${colors.string}$1${reset}`,
  );

  highlighted = highlighted.replace(
    /\b(export|const|let|var|function|return|if|else|class|interface|type|enum|async|await|import|from|new|extends|implements|as)\b/g,
    `${colors.keyword}$1${reset}`,
  );

  highlighted = highlighted.replace(
    /\b(\d+(?:\.\d+)?)\b/g,
    `${colors.number}$1${reset}`,
  );

  highlighted = highlighted.replace(
    /\b([A-Z][A-Za-z0-9_]*)\b/g,
    `${colors.type}$1${reset}`,
  );

  return highlighted;
}

function writeReplValue(value: unknown): string {
  if (value instanceof RenderedText) {
    return value.text;
  }

  return util.inspect(value, {
    colors: true,
    depth: 4,
  });
}

function tree(target = '.'): string {
  const absolutePath = resolveFromCwd(target);
  const rootName = path.basename(absolutePath) || absolutePath;
  const lines = [rootName];

  appendTreeLines(absolutePath, '', lines);

  return lines.join('\n');
}

function appendTreeLines(targetPath: string, indent: string, lines: string[]): void {
  const entries = fs
    .readdirSync(targetPath, { withFileTypes: true })
    .filter((entry) => entry.name !== '.git' && entry.name !== 'node_modules')
    .sort((left, right) => left.name.localeCompare(right.name));

  entries.forEach((entry, index) => {
    const isLast = index === entries.length - 1;
    const branch = isLast ? '└─ ' : '├─ ';
    const nextIndent = `${indent}${isLast ? '   ' : '│  '}`;
    const label = entry.isDirectory() ? `${entry.name}/` : entry.name;
    const nextPath = path.join(targetPath, entry.name);

    lines.push(`${indent}${branch}${label}`);

    if (entry.isDirectory()) {
      appendTreeLines(nextPath, nextIndent, lines);
    }
  });
}

function find(query: string, target = '.'): string[] {
  if (!query) {
    throw new Error("find() requires a search string, for example find('rules').");
  }

  const rootPath = resolveFromCwd(target);
  const matches: string[] = [];

  walkPaths(rootPath, (entryPath) => {
    const relativePath = path.relative(state.cwd, entryPath) || path.basename(entryPath);
    if (relativePath.includes(query)) {
      matches.push(relativePath);
    }
  });

  return matches;
}

function walkPaths(startPath: string, visit: (entryPath: string) => void): void {
  visit(startPath);

  const stats = fs.statSync(startPath);
  if (!stats.isDirectory()) {
    return;
  }

  for (const entry of fs.readdirSync(startPath, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') {
      continue;
    }

    walkPaths(path.join(startPath, entry.name), visit);
  }
}

server = repl.start({
  prompt: 'debug> ',
  useGlobal: false,
  writer: writeReplValue,
});

Object.defineProperty(server.context, 'CWD', {
  enumerable: true,
  get() {
    return state.cwd;
  },
});

server.context.ls = ls;
server.context.cd = cd;
server.context.pwd = pwd;
server.context.tree = tree;
server.context.find = find;
server.context.cat = cat;
server.context.rg = rg;
server.context.load = load;
server.context.reload = reload;
server.context.use = use;
server.context.reuse = reuse;
server.context.run = run;
server.context.help = help;

console.log('Project debug REPL');
console.log("Use help() to list commands. CWD tracks the REPL working directory.");
