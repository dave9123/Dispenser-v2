import {
	ApplicationCommandOptionTypes,
	ApplicationCommandTypes,
	Bot,
	Interaction,
} from "@discordeno/bot";
import { linksDb } from "$db";
import dns from "node:dns/promises";
import Responder from "../util/responder.ts";

const data = {
	name: "bulkadd",
	description: "Bulk adds link(s)",
	type: ApplicationCommandTypes.ChatInput,
	options: [
		{
			type: ApplicationCommandOptionTypes.Attachment,
			name: "link",
			description: "The link to add, seperated by new line",
			required: true,
		},
		{
			type: ApplicationCommandOptionTypes.String,
			name: "category",
			description: "The proxy site to categorize the link",
			required: true,
		},
		{
			type: ApplicationCommandOptionTypes.String,
			name: "premium",
			description: "Is the link for premium users only?",
			required: false,
			choices: [
				{ name: "Yes", value: "true" },
				{ name: "No", value: "false" },
			],
		},
        {
            type: ApplicationCommandOptionTypes.String,
            name: "dnstype",
            description: "The type of DNS record to check for",
            required: false,
            choices: [
                { name: "A (IPv4)", value: "A" },
                { name: "AAAA (IPV6)", value: "AAAA" },
                { name: "CNAME (Alias)", value: "CNAME" }
            ],
        },
        {
            type: ApplicationCommandOptionTypes.String,
            name: "dnstarget",
            description: "The DNS record value to check for",
            required: false,
        }
	],
	dmPermission: false,
};

async function handle(bot: Bot, interaction: Interaction): Promise<void> {
	const responder = new Responder(bot, interaction.id, interaction.token);
	await responder.deferredResponse();

	const cat = interaction.data?.options?.find((option) =>
		option.name === "category"
	)?.value as string;
	const premium = interaction.data?.options?.find((option) =>
		option.name === "premium"
	)?.value as string;
    const dnstype = interaction.data?.options?.find((option) =>
        option.name === "dnstype"
    )?.value as string;
    const dnstarget = interaction.data?.options?.find((option) =>
        option.name === "dnstarget"
    )?.value as string;

	const isPremium = premium == "true";
	interaction.data?.resolved?.attachments?.forEach((attachment) => {
		fetch(attachment.url)
			.then((response) => response.text())
			.then(async (text) => {
				const lines = text.split("\n").map((line) => line.trim())
					.filter(Boolean);
				const invalidLinks: Array<string> = [];
				const validLinks: Array<string> = [];
				const lastInvalidLink = 0;
                let processed = 0;
                let error = false;

				const interval = setInterval(() => {
					if (lastInvalidLink !== invalidLinks.length) {
						responder.update(
							"Validating links..." + "\nInvalid links: " +
								invalidLinks.length,
						);
					}
				}, 1000);

				for (const line of lines) {
                    if (error) {
                        responder.update("An error occurred while processing the links, please report this to [dave@dave9123.onmicrosoft.com](mailto:dave@dave9123.onmicrosoft.com).");
                        break;
                    }
					try {
                        if (dnstype) {
							const records: string[] = await dns.resolve(new URL(line).hostname, dnstype);
							if (dnstarget && !records.includes(dnstarget)) {
								//console.error(`DNS record ${dnstarget} not found for ${line}`);
								throw new Error(`DNS record ${dnstarget} not found for ${line}`);
							}
                        }
						validLinks.push(line);
					} catch {
						invalidLinks.push(line);
					}
                    processed++;
                    clearInterval(interval);
				}

				if (invalidLinks.length > 0) {
					const response = `Invalid link${
						invalidLinks.length > 1 ? "s" : ""
					} provided, link list hasn't been modified.`;
					if (
						invalidLinks.join("\n").length + response.length +
								"\n".length > 2000
					) {
						await responder.updateMsgWithFile(
							response,
							"message.txt",
							new Blob([invalidLinks.join("\n")], {
								type: "text/plain",
							}),
						);
					} else {
						await responder.update(
							response + "\n" + invalidLinks.join("\n"),
						);
					}
				}

				if (validLinks.length > 0) {
					await linksDb.insertMany(validLinks.map((link) => ({
						guildId: String(interaction.guildId),
						link,
						cat,
						isPremium,
					})));
					await responder.update(
						`${validLinks.length} links added successfully!`,
					);
				}
			});
	});
}

const adminOnly = true;
export { adminOnly, data, handle };
