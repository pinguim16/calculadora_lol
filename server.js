const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const app = express();
const port = 3000;

app.use(express.static('public'));

const API_KEY = '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z';
const leagueUrls = {
    "LPL": "https://gol.gg/champion/list/season-ALL/split-ALL/tournament-LPL%20Summer%20Season%202024/",
    "LCK": "https://gol.gg/champion/list/season-ALL/split-ALL/tournament-LCK%20Summer%202024/",
    "LCK CL": "https://gol.gg/champion/list/season-ALL/split-ALL/tournament-LCK%20CL%20Summer%202024/",
    "TCL": "https://gol.gg/champion/list/season-S14/split-ALL/tournament-TCL%20Summer%202024/",
    "Ultraliga": "https://gol.gg/champion/list/season-S14/split-ALL/tournament-Ultraliga%20Summer%202024/",
    "NLC": "https://gol.gg/champion/list/season-S14/split-ALL/tournament-NLC%20Summer%202024/",
    "Prime League": "https://gol.gg/champion/list/season-S14/split-ALL/tournament-Prime%20League%20Summer%202024/",
    "LFL": "https://gol.gg/champion/list/season-S14/split-ALL/tournament-LFL%20Summer%202024/",
    "LVP": "https://gol.gg/champion/list/season-ALL/split-ALL/tournament-LVP%20SL%20Summer%202024/",
    "PCS": "https://gol.gg/tournament/tournament-stats/PCS%20Summer%202024/",
    "LEC": "https://gol.gg/tournament/tournament-stats/LEC%20Summer%20Season%202024/",
    "LIT": "https://gol.gg/tournament/tournament-stats/LIT%20Summer%202024/"
};

const TEMP_DIR = path.join(__dirname, 'temp');

// Certifique-se de que a pasta temporária exista
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

async function fetchAndSave(url, options, filename) {
    const response = await axios.get(url, options);
    const data = response.data;

    const filePath = path.join(TEMP_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return data;
}

const gamesCache = {};
const playerCache = {};

async function parseGames(data) {
    const games = [];
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const todayStr = `${yyyy}-${mm}-${dd}`;

    for (const event of data.data.schedule.events) {
        const startTime = new Date(event.startTime);
        const startDateString = startTime.toISOString().split('T')[0];
        if (startDateString === todayStr && event.type === 'match') {
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

                        const blueTeam = gameDetail.gameMetadata.blueTeamMetadata.participantMetadata.map(player => {
                            const originalName = player.summonerName;
                            const nameWithoutPrefix = originalName.replace(new RegExp(`^${blueTeamCode}\\s*`), '').trim();
                            return {
                                name: nameWithoutPrefix,
                                team: game.teams[0].name,
                                champion: player.championId
                            };
                        });

                        const redTeam = gameDetail.gameMetadata.redTeamMetadata.participantMetadata.map(player => {
                            const originalName = player.summonerName;
                            const nameWithoutPrefix = originalName.replace(new RegExp(`^${redTeamCode}\\s*`), '').trim();
                            return {
                                name: nameWithoutPrefix,
                                team: game.teams[1].name,
                                champion: player.championId
                            };
                        });

                        playerCache[game.id] = {
                            blueTeam,
                            redTeam
                        };
                    }
                });
            }
        }
    }

    games.sort((a, b) => (a.state === 'completed' ? 1 : -1));

    return games;
}

app.get('/scrape', async (req, res) => {
    const league = req.query.league;
    const url = leagueUrls[league];
    if (!url) {
        return res.status(400).send('Invalid league');
    }

    try {
        const response = await axios.get(url);
        const champions = await parseChampions(response.data);
        console.log(`Scraped ${champions.length} champions for league ${league}`);
        saveChampionsToFile(league, champions);
        res.json(champions);
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
        if (!winrate) {
            winrate = -1; // Set negative winrate for champions without a winrate
        }
        const imgElement = $(element).find('td:nth-child(1) img');
        const imgUrl = imgElement.attr('src');

        if (name && imgUrl) {
            const fullImgUrl = new URL(imgUrl, 'https://gol.gg').href; // Use the URL constructor to resolve the full URL
            const imgName = name.replace(/\s+/g, '_'); // Replace spaces with underscores for the file name
            const imgPath = path.join(imgDir, `${imgName}.png`);
            console.log(`Attempting to download image from: ${fullImgUrl} as ${imgPath}`); // Log the image URL
            if (!fs.existsSync(imgPath)) {
                const downloadPromise = downloadImage(fullImgUrl, imgPath)
                    .then(() => console.log(`Downloaded image for ${name}`))
                    .catch(err => console.error(`Failed to download image for ${name} from ${fullImgUrl}`, err));
                downloadPromises.push(downloadPromise);
            }
            champions.push({ name, winrate: parseFloat(winrate), imgUrl: fullImgUrl });
        }
    });

    await Promise.all(downloadPromises);
    return champions;
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
        const champions = fs.readFileSync(filePath);
        res.json(JSON.parse(champions));
    } else {
        res.status(404).send('File not found');
    }
});

app.get('/games', async (req, res) => {
    const url = 'https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=pt-BR';
    try {
        const response = await axios.get(url, {
            headers: {
                'x-api-key': API_KEY
            }
        });
        const games = await parseGames(response.data);
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

        console.log(`Fetching details for event: ${eventId}`);
        console.log(`Event details data: ${JSON.stringify(data)}`);

        const gameDetailsPromises = data.data.event.match.games.map(async (game) => {
            const gameUrl = `https://feed.lolesports.com/livestats/v1/window/${game.id}`;
            try {
                console.log(`Fetching game details from URL: ${gameUrl}`);
                const gameResponse = await axios.get(gameUrl);
                console.log(`Game details data: ${JSON.stringify(gameResponse.data)}`);
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

app.get('/cache', (req, res) => {
    res.json({ gamesCache, playerCache });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
