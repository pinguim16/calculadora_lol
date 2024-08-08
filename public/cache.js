let champions = [];

let championsTeamA = [];
let championsTeamB = [];
let teamCache = [];

let gamesCache = {};
let playerCache = {};
let players = [];
let playersWinrate = [];
let selectedChampionsWinrate = {
    teamA: [],
    teamB: []
};

const gameStages = {
    early_game_champions: [
        "Lee Sin", "Elise", "Pantheon", "Renekton", "Nidalee", "Draven", "Lucian", "Graves", "Darius", "Rek'Sai", "Xin Zhao",
        "Olaf", "Blitzcrank", "Thresh", "Jarvan IV", "Syndra", "Talon", "Leona", "Zed"
    ],
    mid_game_champions: [
        "Akali", "Ekko", "Kai'Sa", "Yasuo", "Katarina", "Sylas", "Fizz", "Qiyana", "Viktor", "Irelia", "Renekton", "Diana",
        "Zoe", "Corki", "Lucian", "Twisted Fate", "Kled", "Tristana", "Rumble", "Jhin", "Orianna", "Ahri", "Galio", "Rengar",
        "Xin Zhao", "LeBlanc", "Nocturne", "Volibear", "Syndra", "Kassadin", "Aatrox", "Cassiopeia", "Talon", "Yone",
        "Seraphine", "Hecarim", "Zed", "Thresh", "Nautilus", "Rakan", "Pyke", "Alistar", "Blitzcrank", "Nidalee", "Elise",
        "Rek'Sai", "Gragas", "Jarvan IV", "Kha'Zix", "Pantheon", "Graves", "Sett", "Taliyah", "Twitch", "Kalista", "Senna",
        "Aphelios", "Ezreal", "Miss Fortune", "Jinx", "Vayne", "Draven", "Samira", "Sivir", "Ziggs", "Veigar", "Vladimir",
        "Heimerdinger", "Swain", "Fiora", "Riven", "Kayle", "Camille", "Gwen", "Nasus", "Kennen", "Jayce", "Ryze", "Viktor",
        "Tryndamere", "Master Yi", "Shaco", "Warwick", "Udyr", "Ivern", "Kindred", "Lillia", "Darius", "Garen", "Mordekaiser",
        "Sion", "Singed", "Urgot", "Ornn", "Tahm Kench", "Cho'Gath", "Poppy", "Sejuani", "Nunu & Willump", "Rammus", "Amumu",
        "Zac", "Malphite", "Maokai", "Dr. Mundo", "Skarner", "Shyvana", "Volibear", "KSante"
    ],
    late_game_champions: [
        "Vayne", "Kassadin", "Jax", "Kayle", "Azir", "Twitch", "Kog'Maw", "Ryze", "Veigar", "Sivir", "Tristana", "Master Yi",
        "Gangplank", "Senna", "Yasuo", "Nasus", "Ornn", "Aatrox", "Cassiopeia", "Malzahar", "Viktor", "Vladimir", "Jinx",
        "Ezreal", "Aphelios", "Samira", "Kalista", "Draven", "Jhin", "Miss Fortune", "Ashe", "Ziggs", "Xayah", "Seraphine",
        "Syndra", "Swain", "Heimerdinger", "Zoe", "Lux", "Anivia", "Orianna", "Ahri", "Ekko", "Katarina", "Sylas", "Diana",
        "Qiyana", "Galio", "Vel'Koz", "Zilean", "LeBlanc", "Lissandra", "Twisted Fate", "Taliyah", "Neeko", "Morgana", "Brand",
        "Xerath", "Fiddlesticks", "Teemo", "Annie", "Rumble", "Zyra", "Karthus", "Aurelion Sol", "Lulu", "Nami", "Janna", "Karma",
        "Braum", "Yuumi", "Taric", "Thresh", "Rakan", "Leona", "Nautilus", "Blitzcrank", "Alistar", "Pyke", "Tahm Kench", "Bard",
        "Rell", "Maokai", "Shen", "Ivern", "Soraka", "Zac", "Rammus", "Skarner", "Amumu", "Nunu & Willump", "Sejuani", "Volibear",
        "Poppy", "Singed", "Cho'Gath", "Malphite", "Dr. Mundo", "Sion", "Mordekaiser", "Yorick", "Trundle", "Warwick", "Olaf", "Udyr",
        "Shyvana", "Rengar", "Lee Sin", "Nocturne", "Xin Zhao", "Jarvan IV", "Rek'Sai", "Graves", "Kindred", "Elise", "Kha'Zix",
        "Nidalee", "Twitch", "Lucian", "Sivir", "Kai'Sa", "Varus", "Caitlyn", "Kennen", "Graves", "Gnar", "Quinn", "Fiora", "Kled",
        "Pantheon", "Garen", "Shen", "Vladimir", "Wukong", "Akali", "Camille", "Gwen", "Irelia", "Jarvan IV", "Kayle", "Lillia",
        "Malphite", "Mordekaiser", "Sett", "Tahm Kench", "Urgot", "Wukong", "Yone", "Yuumi", "Zeri","KSante", 
    ]
};

const allChampions = [
    "Aatrox", "Ahri", "Akali", "Alistar", "Amumu", "Anivia", "Annie", "Aphelios", "Ashe", "Aurelion Sol", "Azir",
    "Bard", "Blitzcrank", "Brand", "Braum", "Caitlyn", "Camille", "Cassiopeia", "Cho'Gath", "Corki", "Darius", "Diana", "Dr. Mundo", "Draven",
    "Ekko", "Elise", "Ezreal", "Fiddlesticks", "Fiora", "Fizz", "Galio", "Gangplank", "Garen", "Gnar", "Gragas", "Graves", "Gwen",
    "Hecarim", "Heimerdinger", "Irelia", "Ivern", "Janna", "Jarvan IV", "Jax", "Jayce", "Jhin", "Jinx", "Kai'Sa", "Kalista", "Karma",
    "Karthus", "Kassadin", "Katarina", "Kayle", "Kennen", "Kha'Zix", "Kled", "Kog'Maw", "KSante", "Lee Sin", "LeBlanc", "Leona", "Lillia",
    "Lissandra", "Lucian", "Lulu", "Lux", "Malphite", "Malzahar", "Maokai", "Master Yi", "Miss Fortune", "Mordekaiser", "Morgana", "Nami",
    "Nasus", "Nautilus", "Neeko", "Nidalee", "Nocturne", "Nunu & Willump", "Olaf", "Orianna", "Ornn", "Pantheon", "Poppy", "Pyke", "Qiyana",
    "Quinn", "Rakan", "Rammus", "Rek'Sai", "Rell", "Renekton", "Rengar", "Riven", "Rumble", "Ryze", "Samira", "Sejuani", "Senna", "Sett",
    "Shaco", "Shen", "Shyvana", "Singed", "Sion", "Sivir", "Skarner", "Syndra", "Sylas", "Tahm Kench", "Taliyah", "Talon", "Taric",
    "Teemo", "Thresh", "Tristana", "Trundle", "Tryndamere", "Twisted Fate", "Twitch", "Udyr", "Urgot", "Varus", "Vayne", "Veigar", "Vel'Koz",
    "Vex", "Vi", "Viego", "Viktor", "Vladimir", "Volibear", "Warwick", "Wukong", "Xayah", "Xerath", "Xin Zhao", "Yasuo", "Yone", "Yorick",
    "Yuumi", "Zac", "Zed", "Zeri", "Ziggs", "Zilean", "Zoe", "Zyra", "Aurora", "Smolder", "Kaisa", "Kindred", "Milio", "Renata Glasc", "Seraphine"
].sort();

const leagues = [
    "LPL", "LCK", "LCK CL", "TCL", "Ultraliga", "NLC", "Prime_League",
    "LFL - La Ligue Française", "LVP", "PCS", "LEC", "LIT", "CBLOL",
    "LLA_-_Liga_Latinoamérica", "CBLOL Academy", "VCS", "Elite Series - EMEA Masters",
    "Hitpoint Masters Summer", "LCS", "NACL", "EMEA_Masters"
];

const teamNameMapping = {
    "100 Thieves": "100 Thieves",
    "C9": "Cloud9",
    "TSM": "Team SoloMid",
    "TL": "Team Liquid",
    "Gen.G": "Gen.G eSports",
    "Gen.G eSports": "Gen.G",
    "kt Rolster": "KT Rolster",
    "KT Rolster": "kt Rolster",
    "TEAM WHALES": "Team Whales",
    "Team Whales": "TEAM WHALES",
    "Unicorns of Love Sexy Edition": "Unicorns Of Love Sexy Edition",
    "Unicorns Of Love Sexy Edition": "Unicorns of Love Sexy Edition",
    "Back2TheGame": "BACK2THEGAME",
    "BACK2THEGAME": "Back2TheGame",
    "FC Schalke 04 Evolution": "Schalke 04",
    "Schalke 04": "FC Schalke 04 Evolution",
    "Crvena Zvezda Esports": "Crvena zvezda Esports",
    "Crvena zvezda Esports": "Crvena Zvezda Esports",
    "Nigma Galaxy": "Nigma Galaxy Male",
    "Nigma Galaxy Male": "Nigma Galaxy",
    "Papara SuperMassive": "Papara SuperMassive ",
    "Papara SuperMassive ": "Papara SuperMassive",
    "Barça Esports": "Barça eSports",
    "Barça eSports ": "Barça Esports",
    "Los Heretics": "Team Heretics",
    "Team Heretics": "Los Heretics",
    "DSYRE": "Dsyre Esports",
    "Dsyre Esports": "DSYRE",
    "BoostGate Espor": "BoostGate Esports",
    "BoostGate Esports": "BoostGate Espor",
    "INFINITY": "Infinity eSports",
    "Infinity eSports": "INFINITY",
    
    
    
    
    
    
    // Adicione mais mapeamentos conforme necessário
};

