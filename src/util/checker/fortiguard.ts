import config from "$config";

const blockedCats = [
    "Child Sexual Abuse",
    "Domain Parking",
    "Drug Abuse",
    "Gambling",
    "Hacking",
    "Illegal or Unethical",
    "Malicious Websites",
    "Marijuana",
    "Other Adult Materials",
    "Pornography",
    "Proxy Avoidance"
];

export default async function (link: string): Promise<boolean> {
    console.info(`Checking ${link} on FortiGuard`);
    const res = await fetch(config.checker.fortiguard, {
        "method": "POST",
        "headers": {
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Authority': 'www.fortiguard.com',
            'Content-Type': 'application/json;charset=UTF-8',
            'Cookie': 'cookiesession1=678A3E0F33B3CB9D7BEECD2B8A5DD036; privacy_agreement=true',
            'DNT': '1',
            'Origin': 'https://www.fortiguard.com',
            'Referer': 'https://www.fortiguard.com/services/sdns',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        "body": `{"value": "${link}", "version": 9}`
    })

    if (!res.ok) {
        console.error(`[FortiGuard] Failed to scan ${link}`);
        return false;
    }
    
    const json = await res.json();
    if (json["found"] === false) {
        console.info(`[FortiGuard] ${link} not found`);
        return true;
    } else {
        const cat = json["dns"]["categoryname"];
        const isUnblocked = blockedCats.every((blockedCat) => !cat.includes(blockedCat));
        console.info(`[FortiGuard] ${link} is under ${cat} and may ${isUnblocked ? "not " : ""}be blocked`);
        return isUnblocked;
    }
}