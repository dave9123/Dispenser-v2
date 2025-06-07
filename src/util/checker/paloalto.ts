import config from "$config";

const blockedCats = [
    "Adult",
    "Alcohol-and-Tobacco",
    "Grayware",
    "Hacking",
    "High-Risk",
    "Malware",
    "Marijuana",
    "Nudity",
    "Parked",
    "Phishing",
    "Proxy-Avoidance-and-Anonymizers",
    "Ransomware",
    "Web-Advertisements"
];

export default async function (link: string): Promise<boolean> {
    console.info(`Checking ${link} on Palo Alto Networks`);
    const response = await fetch(config.checker.paloalto + link, {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en,en-US;q=0.5",
            "Prefer": "safe",
            "Sec-GPC": "1",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Priority": "u=0, i",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache"
        },
        "method": "GET",
        "mode": "cors"
    });

    if (!response.ok) {
        console.error(`[Palo Alto Networks] Failed to fetch data for ${link}`);
        return false;
    }

    const html = await response.text();
    const categoryMatch = html.match(
        /<label[^>]*for="id_new_category"[^>]*>\s*Current Category\s*<\/label>\s*<div[^>]*class="[^"]*form-text[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/div>/i
    );

    if (!categoryMatch || categoryMatch.length < 2) {
        console.error(`Failed to extract category for ${link}`);
        return false;
    }

    const category = categoryMatch[1]
        .split(",")
        .map(cat => cat.trim());
    
    const isUnblocked = !category.every(cat => blockedCats.includes(cat));
    console.info(`[Palo Alto Networks] ${link} is under ${category} and may ${isUnblocked ? "not " : ""}be blocked`);
    return isUnblocked;
}