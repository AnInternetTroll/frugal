import { watch } from '../dep/frugal/frugal_server.ts';
import * as path from '../dep/std/path.ts';

import { config } from '../frugal.config.ts';

await watch(config, [path.resolve(Deno.cwd(), 'docs/data')]);
