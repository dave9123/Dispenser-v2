import ls from "./checker/ls.ts";
import paloalto from "./checker/paloalto.ts";
import fortiguard from "./checker/fortiguard.ts";
import linewize from "./checker/linewize.ts";

import { linksDb } from "$db";

const filterMap: Record<string, { fn: (link: string) => Promise<boolean>; name: string }> = {
    ls: { fn: ls, name: "Lightspeed" },
    paloalto: { fn: paloalto, name: "Palo Alto Networks" },
    fortiguard: { fn: fortiguard, name: "Fortiguard" },
    linewize: { fn: linewize, name: "Linewize" },
};

export default async (
    guildId: string,
    ownedLinks: Array<string>,
    filters: Array<string>,
    cat: string,
    premium: boolean
): Promise<string | Error> => {
    // Fetch links based on premium status
    const query = {
        guildId,
        cat,
        ...(premium
            ? {}
            : {
                  $or: [
                      { isPremium: false },
                      { isPremium: "false" },
                      { isPremium: { $exists: false } },
                  ],
              }),
    };

    const links = await linksDb.find(query).toArray();
    if (links.length === 0) return "There are no links!";

    const filteredLinks = links
        .map((entry) => entry.link)
        .filter((link) => !ownedLinks.includes(link));

    if (filteredLinks.length === 0) {
        return new Error("We ran out of links to give you!");
    }

    // Helper function to check if a link passes all filters
    const isLinkUnblocked = async (link: string): Promise<boolean> => {
        for (const filter of filters) {
            const filterData = filterMap[filter];
            if (!filterData) continue; // Skip unknown filters

            try {
                console.time(`Checking ${link} with ${filterData.name}`);
                const isUnblocked = await filterData.fn(link);
                console.timeEnd(`Checking ${link} with ${filterData.name}`);
                if (!isUnblocked) {
                    console.log(`Link blocked by ${filterData.name}`);
                    return false; // Link is blocked by this filter
                }
            } catch (_e) {
                console.error(`An error occurred while checking with ${filterData.name}`);
            } catch (e) {
                console.error(`An error occurred while checking on ${filterName}:`, e);
            }
        }
        return true;
    };

    for (const link of filteredLinks) {
        if (await isLinkUnblocked(link)) {
            return link;
        }
    }

    return "There are no unblocked links left!";
};