import { ApplicationCommandTypes, ApplicationCommandOptionTypes, Bot, Interaction } from "discordeno";
import { linksDb } from "$db";
import Responder from "../util/responder.ts"

const data = {
    name: "add",
    description: "Adds a new link",
    type: ApplicationCommandTypes.ChatInput,
    options: [
        {
            type: ApplicationCommandOptionTypes.String,
            name: "link",
            description: "The link to add",
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
    ],
    dmPermission: false,
};

async function handle(bot: Bot, interaction: Interaction): Promise<void> {
    const responder = new Responder(bot, interaction.id, interaction.token);

    const link = interaction.data?.options?.find(option => option.name === "link")?.value;
    const cat = interaction.data?.options?.find(option => option.name === "category")?.value;
    const premium = interaction.data?.options?.find(option => option.name === "premium")?.value;

    const isPremium = premium === "true";

    const toInsert = {
        guildId: String(interaction.guildId),
        link,
        cat,
        isPremium,
    };

    let validLink;
    try {
        new URL(link).hostname;
        validLink = true;
    } catch (e) {
        validLink = false;
    }

    if (await linksDb.findOne(toInsert)) {
        await responder.respond("You can't insert a duplicate link!");
    } else if (validLink === false) {
        await responder.respond("The link provided isn't valid which may cause filter checking to fail. However, link has been added successfully. Correct link example: `https://astroid.gg/`");
    } else {
        await linksDb.insertOne(toInsert);
        await responder.respond(`Added ${link} to ${cat}!`);
    }
}

const adminOnly = true;
export { data, handle, adminOnly };