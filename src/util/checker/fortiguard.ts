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
    let res = await fetch("https://www.fortiguard.com/learnmore/dns",{
        "method":"POST",
        "headers": {
            'Accept':
            '*/*',
            'Accept-Language':
            'en-US,en;q=0.9',
            'Authority':
            'www.fortiguard.com',
            'Content-Type':
            'application/json;charset=UTF-8',
            'Cookie':
            'cookiesession1=678A3E0F33B3CB9D7BEECD2B8A5DD036; privacy_agreement=true',
            'Origin':
            'https://www.fortiguard.com',
            'Referer':
            'https://www.fortiguard.com/services/sdns',
            'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        "body": `{"value": "${url}", "version": 9}`
    })
    let rJson = await res.json();
    return rJson["dns"]["categoryname"]
}