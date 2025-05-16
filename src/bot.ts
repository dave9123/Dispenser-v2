import {
	Bot,
	Collection,
	createBot,
	createDesiredPropertiesObject,
	CompleteDesiredProperties,
	Interaction,
	InteractionTypes,
} from "@discordeno/bot";

/*import {
	enableCachePlugin,
	enableCacheSweepers,
} from "https://deno.land/x/discordeno_cache_plugin@0.0.21/mod.ts";*/

import filterHandle from "./util/filter.ts";
import catHandle from "./util/cat.ts";
import requestHandle from "./util/request.ts";
import reportHandle from "./util/report.ts";

import Responder from "./util/responder.ts";
import isAdmin from "./util/isAdmin.ts";

import { faultToleranceDb } from "$db";

const commands = new Collection();

const isDebug = Deno.args.includes("--debug");

export default async function initBot(
	token: string,
): Promise<void> {

	const bot: Bot = createBot({
		token,
		desiredProperties: createDesiredPropertiesObject({
			interaction: {
				id: true,
				data: true,
				type: true,
				guildId: true,
				token: true,
				channelId: true,
				user: true,
				member: true,
				message: true,
			},
			member: {
				permissions: true,
				roles: true,
			},
			attachment: {
				proxyUrl: true,
				url: true
			},
		}),
	} as CompleteDesiredProperties);

	bot.events = {
		ready(): void {
			console.log("Ready!");
		},
		interactionCreate: async (interaction: Interaction) => {
			try {
				if (
					interaction.type === InteractionTypes.ApplicationCommand
				) {
					const responder = new Responder(
						bot,
						interaction.id,
						interaction.token,
					);

					const command = commands.get(
						interaction.data?.name,
					);

					if (!command) return;

					const commandName = command.data.name;

					if (
						command?.adminOnly &&
						!(await isAdmin(
							interaction.member,
							String(interaction.guildId),
						))
					) {
						console.error(
							`${interaction.user.username} tried to run ${command.data.name} without permission`,
						);
						return await responder.respond(
							"You don't have permission to run this command!",
						);
					}
					let t = performance.now();
					try {
						await command?.handle(bot, interaction);

						faultToleranceDb.deleteMany({
							commandName,
						});
					} catch (err) {
						const errFmt =
							`Error running ${command.data.name}: ${err}`;
						if (isDebug) throw new Error(errFmt);
						else console.error(errFmt);

						await faultToleranceDb.insertOne({
							commandName,
							error: err,
							timestamp: new Date(),
						});
					}
					console.info(commandName + " command took", performance.now() - t, "ms");
				} else if (
					interaction.type === InteractionTypes.MessageComponent
				) {
					if (!interaction.data) return;

					const id: string = interaction.data.customId || "";

					if (isDebug) console.log(`Interacting with ${id}`);

					const isDmRequest = id === "dmRequest";
					const isRequest = id === "request";
					const isReport = id === "report";

					const isCat = id === "cat";
					const isFilter = id === "filter";

					let t = performance.now();
					if (isDmRequest) requestHandle(bot, interaction, true);
					else if (isRequest) requestHandle(bot, interaction, false);
					else if (isReport) reportHandle(bot, interaction);
					else if (isCat) catHandle(bot, interaction);
					else if (isFilter) filterHandle(bot, interaction);
					console.info(id + " took", performance.now() - t, "ms");
				}
			} catch (err) {
				console.log(err);
			}
		},
	}

	/*const bot = enableCachePlugin(baseBot);
	enableCacheSweepers(bot);*/

	for await (
		const file of Deno.readDir(new URL("./commands", import.meta.url))
	) {
		if (file.name.endsWith(".ts")) {
			try {
				const command: {
					// deno-lint-ignore no-explicit-any
					data: any;
					list: (bot: Bot, interaction: Interaction) => void;
					adminOnly: boolean;
				} = await import(`./commands/${file.name}`);

				try {
					console.log(`Uploading ${command.data.name}`);
					bot.rest.createGlobalApplicationCommand(command.data);
				} catch (err) {
					console.info(`Error in ${file.name}:`, err);
				}

				commands.set(command.data.name, command);
			} catch (err) {
				console.log(`Error importing ${file.name}:`, err);
			}
		}
	}

	await bot.start();
}