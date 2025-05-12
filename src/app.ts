import initBot from "./bot.ts";
import faultTolerantAPI from "./faultToleranceAPI.ts";

import config from "$config";

initBot(config.bot.token);

Deno.serve({ port: config.port }, faultTolerantAPI().fetch);
