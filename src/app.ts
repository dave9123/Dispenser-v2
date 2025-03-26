import initBot from "./bot.ts";
import faultTolerantAPI from "./faultToleranceAPI.ts";

import config from "$config";

initBot(config.bot.token, config.bot.id);

Deno.serve({ port: config.port }, faultTolerantAPI().fetch);
