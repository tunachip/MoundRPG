#!/usr/bin/env python3
"""Generate content registry files for moves and fragments."""

from __future__ import annotations

import re
from pathlib import Path
from typing import Iterable


ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src" / "content"

ENTRY_PATTERN = re.compile(r"^(\d+)_.*\.ts$")
EXPORT_PATTERN = re.compile(r"export\s+const\s+([A-Za-z_][A-Za-z0-9_]*)\s*:")


def collect_entries(directory: Path) -> list[tuple[int, str, str]]:
	entries: list[tuple[int, str, str]] = []
	for path in sorted(directory.glob("*.ts")):
		if path.name in {"index.ts", "types.ts", "registry.ts", "00_example.ts"}:
			continue
		matched = ENTRY_PATTERN.match(path.name)
		if not matched:
			continue
		text = path.read_text()
		export_match = EXPORT_PATTERN.search(text)
		if not export_match:
			raise ValueError(f"Could not find exported const in {path}")
		definition_id = int(matched.group(1))
		export_name = export_match.group(1)
		module_name = path.name[:-3]
		entries.append((definition_id, module_name, export_name))
	return entries


def render_registry(
	label: str,
	type_name: str,
	entries: Iterable[tuple[int, str, str]],
) -> str:
	sorted_entries = sorted(entries, key=lambda item: item[0])
	lines: list[str] = [f"// src/content/{label}/registry.ts", ""]
	for _, module_name, export_name in sorted_entries:
		lines.append(f"import {{ {export_name} }} from './{module_name}.ts';")
	lines.append(f"import type {{ {type_name} }} from './types.ts';")
	lines.append("")
	lines.append(f"export const {type_name}sById: Record<number, {type_name}> = {{")
	for definition_id, _, export_name in sorted_entries:
		lines.append(f"\t{definition_id}: {export_name},")
	lines.append("};")
	lines.append("")
	lines.append(f"export function get{type_name} (definitionId: number): {type_name} {{")
	lines.append(f"\tconst definition = {type_name}sById[definitionId];")
	lines.append("\tif (!definition) {")
	lines.append(f"\t\tthrow new Error(`Unknown {type_name} definitionId: ${{definitionId}}`);")
	lines.append("\t}")
	lines.append("\treturn definition;")
	lines.append("}")
	lines.append("")
	return "\n".join(lines)


def main() -> None:
	move_entries = collect_entries(SRC / "moves")
	fragment_entries = collect_entries(SRC / "fragments")

	(SRC / "moves" / "registry.ts").write_text(
		render_registry("moves", "MoveDefinition", move_entries)
	)
	(SRC / "fragments" / "registry.ts").write_text(
		render_registry("fragments", "FragmentDefinition", fragment_entries)
	)


if __name__ == "__main__":
	main()
