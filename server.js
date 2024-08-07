const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static('public'));

const API_KEY = '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z';

const leagueUrls = {
    "LPL": [
        "https://gol.gg/champion/list/season-ALL/split-ALL/tournament-LPL%20Summer%20Season%202024/",
    ],
    "LCK": [
        "https://gol.gg/champion/list/season-ALL/split-ALL/tournament-LCK%20Summer%202024/",
    ],
    "LCK CL": [
        "https://gol.gg/champion/list/season-ALL/split-ALL/tournament-LCK%20CL%20Summer%202024/",
    ],
    "TCL": [
        "https://gol.gg/champion/list/season-S14/split-ALL/tournament-TCL%20Summer%202024/",
        "https://gol.gg/tournament/tournament-stats/TCL%20Summer%20Playoffs%202024/"
    ],
    "Ultraliga": [
        "https://gol.gg/champion/list/season-S14/split-ALL/tournament-Ultraliga%20Summer%202024/",
        "https://gol.gg/tournament/tournament-stats/Ultraliga%20Summer%20Playoffs%202024/"
    ],
    "NLC": [
        "https://gol.gg/champion/list/season-S14/split-ALL/tournament-NLC%20Summer%202024/",
        "https://gol.gg/tournament/tournament-stats/NLC%20Summer%20Playoffs%202024/"
    ],
    "Prime_League": [
        "https://gol.gg/champion/list/season-S14/split-ALL/tournament-Prime%20League%20Summer%202024/",
    ],
    "LFL": [
        "https://gol.gg/champion/list/season-S14/split-ALL/tournament-LFL%20Summer%202024/",
        "https://gol.gg/tournament/tournament-stats/LFL%20Summer%20Playoffs%202024/"
    ],
    "LVP": [
        "https://gol.gg/champion/list/season-ALL/split-ALL/tournament-LVP%20SL%20Summer%202024/",
        "https://gol.gg/tournament/tournament-stats/LVP%20SL%20Summer%20Playoffs%202024/"
    ],
    "PCS": [
        "https://gol.gg/champion/list/season-ALL/split-ALL/tournament-PCS%20Summer%202024/",
        "https://gol.gg/champion/list/season-ALL/split-ALL/tournament-PCS%20Summer%20Playoffs%202024/"
    ],
    "LEC": [
        "https://gol.gg/tournament/tournament-stats/LEC%20Summer%20Season%202024/",
        "https://gol.gg/tournament/tournament-stats/LEC%20Summer%20Playoffs%202024/"
    ],
    "LIT": [
        "https://gol.gg/tournament/tournament-stats/LIT%20Summer%202024/",
        "https://gol.gg/tournament/tournament-stats/LIT%20Summer%20Playoffs%202024/"
    ],
    "CBLOL": [
        "https://gol.gg/champion/list/season-ALL/split-ALL/tournament-CBLOL%20Split%202%202024/",
    ],
    "LLA": [
        "https://gol.gg/champion/list/season-ALL/split-ALL/tournament-LLA%20Closing%202024/",
        "https://gol.gg/champion/list/season-ALL/split-ALL/tournament-LLA%20Closing%20Playoffs%202024/"
    ],
    "CBLOL_Academy": [
        "https://gol.gg/champion/list/season-ALL/split-ALL/tournament-CBLOL%20Academy%20Split%202%202024/",
        "https://gol.gg/champion/list/season-ALL/split-ALL/tournament-CBLOL%20Academy%20Split%202%20Playoffs%202024/"
    ],
    "VCS": [
        "https://gol.gg/champion/list/season-ALL/split-ALL/tournament-VCS%20Summer%202024/",
    ],
    "Elite_Series": [
        "https://gol.gg/champion/list/season-ALL/split-ALL/tournament-Elite%20Series%20Summer%202024/",
        "https://gol.gg/champion/list/season-ALL/split-ALL/tournament-Elite%20Series%20Summer%20Playoffs%202024/"
    ],
    "Hit": [
        "https://gol.gg/champion/list/season-ALL/split-ALL/tournament-Hitpoint%20Masters%20Summer%202024/",
        "https://gol.gg/champion/list/season-ALL/split-ALL/tournament-Hitpoint%20Masters%20Summer%20Playoffs%202024/"
    ],
    "LCS": [
        "https://gol.gg/champion/list/season-ALL/split-ALL/tournament-LCS%20Summer%202024/"
    ],
    "NACL": [
        "https://gol.gg/champion/list/season-ALL/split-ALL/tournament-NACL%20Summer%202024/"
    ],
    "EMEA_Masters": [
        "https://gol.gg/champion/list/season-ALL/split-ALL/tournament-EMEA%20Masters%20Summer%20LCQ%202024/",
        "https://gol.gg/champion/list/season-ALL/split-ALL/tournament-EMEA%20Masters%20Summer%202024/"
    ],
};

const gamesCache = { data: [], timestamp: 0 };
const playerCache = { data: [], timestamp: 0 };
const teamsCache = { data: [], timestamp: 0 };


const TEMP_DIR = path.join(__dirname, 'temp');

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

//Cache validação
const CACHE_VALIDITY_DURATION = 24 * 60 * 60 * 1000; // 1 day in milliseconds

function isCacheValid(timestamp) {
    const now = Date.now();
    return (now - timestamp) < CACHE_VALIDITY_DURATION;
}

function isFileValid(filePath) {
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const fileAge = Date.now() - new Date(stats.mtime).getTime();
        return fileAge < CACHE_VALIDITY_DURATION;
    }
    return false;
}


async function fetchWithRetry(url, options, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await axios.get(url, options);
        } catch (error) {
            if (i < retries - 1) {
                console.error(`Failed to fetch ${url}. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
}

async function fetchAndSave(url, options, filename) {
    const response = await fetchWithRetry(url, options);
    const data = response.data;
    //const filePath = path.join(TEMP_DIR, filename);
    //fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return data;
}

async function parseGames(data) {
    const games = [];
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const formatDateString = (date) => {
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${yyyy}-${mm}-${dd}`;
    };

    const todayStr = formatDateString(today);
    const tomorrowStr = formatDateString(tomorrow);

    for (const event of data.data.schedule.events) {
        const startTime = new Date(event.startTime);
        const startDateString = startTime.toISOString().split('T')[0];
        if ((startDateString === todayStr || startDateString === tomorrowStr) && event.type === 'match') {
            const gameDetails = await fetchEventDetails(event.match.id);
            const game = {
                id: event.match.id,
                startTime: event.startTime,
                state: event.state,
                strategy: event.match.strategy.type,
                strategyCount: event.match.strategy.count,
                league: event.league.name,
                teams: event.match.teams.map(team => ({
                    name: team.name,
                    code: team.code,
                    image: team.image,
                    result: team.result,
                    record: team.record
                })),
                blockName: event.blockName,
                details: gameDetails
            };
            games.push(game);

            // Save to cache
            gamesCache[event.match.id] = game;

            // Process players for caching
            if (gameDetails && gameDetails.data && gameDetails.data.event && gameDetails.data.event.match && gameDetails.data.event.match.games) {
                gameDetails.data.event.match.games.forEach(gameDetail => {
                    if (gameDetail.gameMetadata && gameDetail.gameMetadata.blueTeamMetadata && gameDetail.gameMetadata.redTeamMetadata) {
                        let blueTeamCode = game.teams[0].code;
                        let redTeamCode = game.teams[1].code;

                        // Correct team codes if they are swapped
                        const firstBluePlayer = gameDetail.gameMetadata.blueTeamMetadata.participantMetadata[0].summonerName;
                        const firstRedPlayer = gameDetail.gameMetadata.redTeamMetadata.participantMetadata[0].summonerName;
                        if (!firstBluePlayer.startsWith(blueTeamCode) && firstRedPlayer.startsWith(blueTeamCode)) {
                            [blueTeamCode, redTeamCode] = [redTeamCode, blueTeamCode];
                            [game.teams[0], game.teams[1]] = [game.teams[1], game.teams[0]];
                        }

                        const players = {
                            blueTeam: gameDetail.gameMetadata.blueTeamMetadata.participantMetadata.map(player => {
                                const originalName = player.summonerName;
                                const nameWithoutPrefix = originalName.replace(new RegExp(`^${blueTeamCode}\\s*`), '').trim();
                                return {
                                    name: nameWithoutPrefix,
                                    team: game.teams[0].name,
                                    champion: player.championId
                                };
                            }),
                            redTeam: gameDetail.gameMetadata.redTeamMetadata.participantMetadata.map(player => {
                                const originalName = player.summonerName;
                                const nameWithoutPrefix = originalName.replace(new RegExp(`^${redTeamCode}\\s*`), '').trim();
                                return {
                                    name: nameWithoutPrefix,
                                    team: game.teams[1].name,
                                    champion: player.championId
                                };
                            })
                        };
                        
                        playerCache[game.id] = players;
                    }
                });
            }
        }
    }

    games.sort((a, b) => (a.state === 'completed' ? 1 : -1));

    return games;
}


async function scrapePlayerProfile(profileUrl) {
    try {
        const response = await fetchWithRetry(profileUrl);
        const $ = cheerio.load(response.data);
        const champions = [];

        $('table.table_list').each((index, table) => {
            const captionText = $(table).find('caption').text().trim();
            if (captionText.includes('champion pool')) {
                $(table).find('tbody tr').each((index, element) => {
                    const championName = $(element).find('td').first().find('a').text().trim();
                    const nbGames = $(element).find('td').eq(1).text().trim();
                    const winRate = $(element).find('td').eq(2).find('div.col-auto.pl-1').text().trim();
                    const kda = $(element).find('td').last().text().trim(); // Adjusted to use .last() for capturing KDA

                    if (championName && nbGames && winRate && kda) {
                        champions.push({
                            champion: championName,
                            nbGames: parseInt(nbGames, 10),
                            winRate: winRate.replace('%', '').trim(),
                            kda: kda
                        });
                    }
                });
            }
        });

        return champions;
    } catch (error) {
        console.error(`Failed to scrape player profile from ${profileUrl}:`, error);
        return [];
    }
}


let winratePlayersChampios = [];

app.get('/scrapePlayers', async (req, res) => {
    const url = 'https://gol.gg/players/list/season-S14/split-Summer/tournament-ALL/';
    try {
        if (winratePlayersChampios.length > 0) {
            res.json(winratePlayersChampios);
        } else {
            const response = await fetchWithRetry(url);
            const $ = cheerio.load(response.data);
            const players = [];

            const playerPromises = [];

            $('table.playerslist tbody tr').each((index, element) => {
                const playerCell = $(element).find('td').first().find('a');
                const name = playerCell.text().trim();
                let profileLink = playerCell.attr('href');
                //console.log(`Name: ${name}, Profile Link: ${profileLink}`);  // Log each player's name and profile link for debugging
                if (name && profileLink) {
                    profileLink = profileLink.startsWith('.') ? profileLink.substring(1) : profileLink;
                    const fullProfileLink = `https://gol.gg/players${profileLink}`;
                    playerPromises.push(
                        scrapePlayerProfile(fullProfileLink).then(champions => ({
                            name,
                            profileLink: fullProfileLink,
                            champions
                        }))
                    );
                }
            });

            const playersWithChampions = await Promise.all(playerPromises);
            //console.log(`Total players scraped: ${playersWithChampions.length}`);  // Log the total number of players scraped
            winratePlayersChampios = playersWithChampions; // Cache
            res.json(playersWithChampions);
        }
    } catch (error) {
        console.error('Failed to scrape player data:', error);
        res.status(500).send('Error occurred while scraping player data');
    }
});

app.get('/scrape', async (req, res) => {
    const league = req.query.league;
    const urls = leagueUrls[league];
    if (!urls || urls.length === 0) {
        return res.status(400).send('Invalid league or no URLs found');
    }

    try {
        let allChampions = [];

        for (const url of urls) {
            console.log(urls)
            const response = await fetchWithRetry(url);
            const champions = await parseChampions(response.data);
            console.log(champions)
            allChampions = combineChampions(allChampions, champions);
        }
        console.log(`Scraped and combined champions for league ${league}`);
        saveChampionsToFile(league, allChampions);
        res.json(allChampions);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error occurred while scraping data');
    }
});

async function parseChampions(html) {
    const $ = cheerio.load(html);
    const champions = [];
    const downloadPromises = [];

    const downloadImage = async (url, filepath) => {
        try {
            const response = await axios({
                url,
                method: 'GET',
                responseType: 'stream',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
                }
            });
            const writer = fs.createWriteStream(filepath);
            response.data.pipe(writer);
            return new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
        } catch (error) {
            throw new Error(`Failed to download image from ${url}`);
        }
    };

    const imgDir = path.join(__dirname, 'public', 'images');
    if (!fs.existsSync(imgDir)) {
        fs.mkdirSync(imgDir, { recursive: true });
    }

    $('table tr').each((index, element) => {
        const nameElement = $(element).find('td:nth-child(1) img').attr('alt');
        const name = nameElement ? nameElement.trim() : null;
        const winrateElement = $(element).find('td:nth-child(7)');
        let winrate = winrateElement.text().trim().replace('%', '');
        const wins = parseInt($(element).find('td:nth-child(5)').text().trim());
        const losses = parseInt($(element).find('td:nth-child(6)').text().trim());
        if (!winrate) {
            winrate = -1; // Set negative winrate for champions without a winrate
        }
        const imgElement = $(element).find('td:nth-child(1) img');
        const imgUrl = imgElement.attr('src');

        if (name && imgUrl) {
            const fullImgUrl = new URL(imgUrl, 'https://gol.gg').href; // Use the URL constructor to resolve the full URL
            const imgName = name.replace(/\s+/g, '_'); // Replace spaces with underscores for the file name
            const imgPath = path.join(imgDir, `${imgName}.png`);
            //console.log(`Attempting to download image from: ${fullImgUrl} as ${imgPath}`); // Log the image URL
            if (!fs.existsSync(imgPath)) {
                const downloadPromise = downloadImage(fullImgUrl, imgPath)
                    .then(() => console.log(`Downloaded image for ${name}`))
                    .catch(err => console.error(`Failed to download image for ${name} from ${fullImgUrl}`, err));
                downloadPromises.push(downloadPromise);
            }
            champions.push({ name, winrate: parseFloat(winrate), wins, losses, imgUrl: fullImgUrl });
        }
    });

    await Promise.all(downloadPromises);
    return champions;
}

function combineChampions(existingChampions, newChampions) {
    const championMap = {};

    existingChampions.forEach(champion => {
        championMap[champion.name] = champion;
    });

    newChampions.forEach(champion => {
        if (championMap[champion.name]) {
            console.log(champion)
            // Combine data
            const existing = championMap[champion.name];
            existing.wins += champion.wins ? champion.wins : 0;
            existing.losses += champion.losses ? champion.losses : 0;
            if(champion.winrate){
                existing.winrate = (existing.winrate + champion.winrate) / 2;
            }
        } else {
            championMap[champion.name] = champion;
        }
    });

    return Object.values(championMap);
}


function saveChampionsToFile(league, champions) {
    const dir = path.join(__dirname, 'public', 'data');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, `${league.replace(/\s+/g, '_')}.json`);
    fs.writeFileSync(filePath, JSON.stringify(champions, null, 2));
}

app.get('/champions', (req, res) => {
    const league = req.query.league;
    const filePath = path.join(__dirname, 'public', 'data', `${league.replace(/\s+/g, '_')}.json`);
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const fileAge = Date.now() - new Date(stats.mtime).getTime();
        if (fileAge < CACHE_VALIDITY_DURATION) {
            const champions = fs.readFileSync(filePath);
            return res.json(JSON.parse(champions));
        }
    }
    res.status(404).send('File not found or data expired');
});

app.get('/games', async (req, res) => {
    // if (isCacheValid(gamesCache.timestamp)) {
    //     return res.json(gamesCache.data);
    // }

    const url = 'https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=pt-BR';
    try {
        const response = await axios.get(url, { headers: { 'x-api-key': API_KEY } });
        const games = await parseGames(response.data);
        gamesCache.data = games;
        gamesCache.timestamp = Date.now();
        res.json(games);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error occurred while fetching games');
    }
});

app.get('/eventDetails', async (req, res) => {
    const eventId = req.query.id;
    const url = `https://esports-api.lolesports.com/persisted/gw/getEventDetails?hl=pt-BR&id=${encodeURIComponent(eventId)}`;
    try {
        const data = await fetchAndSave(url, { headers: { 'x-api-key': API_KEY } }, `${eventId}_event_details.json`);
        res.json(data.data.event);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error occurred while fetching event details');
    }
});

async function fetchEventDetails(eventId) {
    const url = `https://esports-api.lolesports.com/persisted/gw/getEventDetails?hl=pt-BR&id=${encodeURIComponent(eventId)}`;
    try {
        const data = await fetchAndSave(url, { headers: { 'x-api-key': API_KEY } }, `${eventId}_event_details.json`);
        const gameDetailsPromises = data.data.event.match.games.map(async (game) => {
            const gameUrl = `https://feed.lolesports.com/livestats/v1/window/${game.id}`;
            try {
                const gameResponse = await fetchWithRetry(gameUrl);
                gameResponse.data.number = game.number;
                gameResponse.data.state = game.state;
                return gameResponse.data;
            } catch (error) {
                console.error(`Failed to fetch game details for game ID: ${game.id}`, error);
                return null;
            }
        });

        const gameDetails = await Promise.all(gameDetailsPromises);
        data.data.event.match.games = gameDetails.filter(detail => detail !== null);

        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Cache temporário para armazenar os dados dos times
const profileBaseUrl = 'https://gol.gg/teams/team-stats';
const matchListBaseUrl = 'https://gol.gg/teams/team-matchlist';

app.get('/scrapeTeams', async (req, res) => {
    if (isCacheValid(teamsCache.timestamp)) {
        return res.json(teamsCache.data);
    }
    const url = 'https://gol.gg/teams/list/season-S14/split-Summer/tournament-ALL/';
    try {
        if (teamsCache.length > 0) {
            res.json(teamsCache);
        } else {
            const response = await fetchWithRetry(url);
            const $ = cheerio.load(response.data);
            const teams = [];

            const teamPromises = [];

            $('table.playerslist tbody tr').each((index, element) => {
                let teamData = {};
                teamData.name = $(element).find('td:nth-child(1)').text().trim();
                teamData.season = $(element).find('td:nth-child(2)').text().trim();
                teamData.region = $(element).find('td:nth-child(3)').text().trim();
                teamData.games = $(element).find('td:nth-child(4)').text().trim();
                teamData.winRate = $(element).find('td:nth-child(5)').text().trim();
                teamData.kd = $(element).find('td:nth-child(6)').text().trim();
                teamData.gpm = $(element).find('td:nth-child(7)').text().trim();
                teamData.gdm = $(element).find('td:nth-child(8)').text().trim();
                teamData.gameDuration = $(element).find('td:nth-child(9)').text().trim();
                teamData.killsPerGame = $(element).find('td:nth-child(10)').text().trim();
                teamData.deathsPerGame = $(element).find('td:nth-child(11)').text().trim();
                teamData.towersKilled = $(element).find('td:nth-child(12)').text().trim();
                teamData.towersLost = $(element).find('td:nth-child(13)').text().trim();
                teamData.firstBloodRate = $(element).find('td:nth-child(14)').text().trim();
                teamData.firstTowerRate = $(element).find('td:nth-child(15)').text().trim();
                teamData.dragonsKilledPerGame = $(element).find('td:nth-child(16)').text().trim();
                teamData.dragonRate = $(element).find('td:nth-child(17)').text().trim();
                teamData.voidgrubsKilledPerGame = $(element).find('td:nth-child(18)').text().trim();
                teamData.heraldKilledPerGame = $(element).find('td:nth-child(19)').text().trim();
                teamData.heraldRate = $(element).find('td:nth-child(20)').text().trim();
                teamData.dragonsAt15 = $(element).find('td:nth-child(21)').text().trim();
                teamData.towerDifferentialAt15 = $(element).find('td:nth-child(22)').text().trim();
                teamData.goldDifferentialAt15 = $(element).find('td:nth-child(23)').text().trim();
                teamData.towerPlatesDestroyedPerGame = $(element).find('td:nth-child(24)').text().trim();
                teamData.baronNashorKilledPerGame = $(element).find('td:nth-child(25)').text().trim();
                teamData.baronNashorRate = $(element).find('td:nth-child(26)').text().trim();
                teamData.creepsPerMinute = $(element).find('td:nth-child(27)').text().trim();
                teamData.damageToChampionsPerMinute = $(element).find('td:nth-child(28)').text().trim();
                teamData.wardsPerMinute = $(element).find('td:nth-child(29)').text().trim();
                teamData.visionWardsPerMinute = $(element).find('td:nth-child(30)').text().trim();
                teamData.wardsClearedPerMinute = $(element).find('td:nth-child(31)').text().trim();

                const profileLink = $(element).find('td:nth-child(1) a').attr('href');
                const teamIdMatch = profileLink ? profileLink.match(/\/(\d+)\//) : null;
                teamData.teamId = teamIdMatch ? teamIdMatch[1] : null;
                teamData.profileLink = teamData.teamId ? `${profileBaseUrl}/${teamData.teamId}/split-Summer/tournament-ALL/` : null;

                if (teamData.name && teamData.teamId) {
                    teams.push(teamData);
                    teamPromises.push(fetchAndCalculateWinRate(teamData));
                }
            });

            await Promise.all(teamPromises);

            teamsCache.data = teams;
            teamsCache.timestamp = Date.now();
            res.json(teams);
        }
    } catch (error) {
        console.error('Failed to scrape teams data:', error);
        res.status(500).send('Error occurred while scraping teams data');
    }
});

async function fetchAndCalculateWinRate(teamData) {
    try {
        const matchListUrl = `${matchListBaseUrl}/${teamData.teamId}/split-Summer/tournament-ALL/`;
        const matchListResponse = await fetchWithRetry(matchListUrl);
        const match$ = cheerio.load(matchListResponse.data);

        let wins = 0;
        let losses = 0;

        match$('table tbody tr').each((index, element) => {
            if (index < 16) {
                const result = match$(element).find('td:nth-child(1)').text().trim();
                if (result === 'WIN') {
                    wins++;
                } else if (result === 'LOSS') {
                    losses++;
                }
            }
        });

        const totalMatches = wins + losses;
        if (totalMatches > 0) {
            teamData.averageMatchWinRate = ((wins / totalMatches) * 100).toFixed(2);
        } else {
            teamData.averageMatchWinRate = 'N/A';
        }
    } catch (error) {
        console.error(`Failed to fetch match list data from ${teamData.profileLink}`, error);
    }
}

async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await axios.get(url, options);
        } catch (error) {
            if (i < retries - 1) {
                console.error(`Failed to fetch ${url}. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
}

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
