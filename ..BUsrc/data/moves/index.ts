// src/data/moves/index.ts

import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { MoveTemplate } from '../../engine/templates/move.ts';


