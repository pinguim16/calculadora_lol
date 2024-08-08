// Adicione a chamada dessa função em window.onload para garantir que os campos estejam no estado correto quando a página carregar
window.onload = async () => {
    populateLeagueSelects();
    populateChampionSelects();
    // leagueSelect.onchange = async () => {
    //     const league = leagueSelect.value;
    //     await loadChampions(league);
    // };
    //await loadChampions(leagueSelect.value);
    await loadPlayers();

    // Inicializar os campos desativados se os checkboxes estiverem marcados
    toggleTeamFields('team-a');
    toggleTeamFields('team-b');
};



//Habilitar e desabilitar os combos
function toggleTeamFields(team) {
    const disableFieldsCheckbox = document.getElementById(`${team}-disable-fields`);
    const isDisabled = disableFieldsCheckbox.checked;

    const teamNameInput = document.getElementById(`${team}-name`);
    const teamWinrateInput = document.getElementById(`${team}-winrate`);
    const teamRecentWinrateInput = document.getElementById(`${team}-recent-winrate`);

    teamNameInput.disabled = isDisabled;
    teamWinrateInput.disabled = isDisabled;
    teamRecentWinrateInput.disabled = isDisabled;
}

function populateLeagueSelects() {
    const leagueSelect = document.getElementById('league-select');
    const leagueSelectTeamA = document.getElementById('league-select-team-a');
    const leagueSelectTeamB = document.getElementById('league-select-team-b');

    leagues.forEach(league => {
        const option = document.createElement('option');
        option.value = league;
        option.textContent = league;
        leagueSelect.appendChild(option.cloneNode(true));
        leagueSelectTeamA.appendChild(option.cloneNode(true));
        leagueSelectTeamB.appendChild(option.cloneNode(true));
    });
}

function toggleLeagueSelection() {
    const sameLeagueCheckbox = document.getElementById('same-league-checkbox');
    const leagueSelectGroup = document.getElementById('league-select-group');
    const leagueSelectGroupTeamA = document.getElementById('league-select-group-team-a');
    const leagueSelectGroupTeamB = document.getElementById('league-select-group-team-b');

    if (sameLeagueCheckbox.checked) {
        leagueSelectGroup.classList.remove('d-none');
        leagueSelectGroupTeamA.classList.add('d-none');
        leagueSelectGroupTeamB.classList.add('d-none');
        //loadChampions(document.getElementById('league-select').value, 'both');
    } else {
        leagueSelectGroup.classList.add('d-none');
        leagueSelectGroupTeamA.classList.remove('d-none');
        leagueSelectGroupTeamB.classList.remove('d-none');
        //loadChampions(document.getElementById('league-select-team-a').value, 'teamA');
        //loadChampions(document.getElementById('league-select-team-b').value, 'teamB');
    }
}
//#######################################
//Carregar campeoes
async function scrapeData() {
    showSpinner();
    const sameLeagueCheckbox = document.getElementById('same-league-checkbox');
    if(sameLeagueCheckbox.checked){
        const league = document.getElementById('league-select').value;
        championsTeamA = await getChampionsLeague(league);
        championsTeamB = await getChampionsLeague(league);
    }else{
        const leagueA = document.getElementById('league-select-team-a').value;
        const leagueB = document.getElementById('league-select-team-b').value;
        championsTeamA = await getChampionsLeague(leagueA);
        championsTeamB = await getChampionsLeague(leagueB);
        console.log(championsTeamA);
        console.log(championsTeamB);
    }

    await scrapeTeams();
    await loadGamesOfDay();
    hideSpinner();
}

async function getChampionsLeague(league){
    showSpinner();
    try{
        console.log(league);
        const response = await fetch(`/scrape?league=${encodeURIComponent(league)}`);
        let champ = await response.json();
        console.log(`Scraped ${champ.length} champions for league ${league}`);
        showToast('Data scraped and loaded!', 'success');
        return Promise.all(champ);
    } catch (error) {
        console.error('Failed to scrape data:', error);
    } finally {
        hideSpinner();
    }
}

function populateChampionSelects() {
    champions.sort((a, b) => a.name.localeCompare(b.name));

    const championSelectsTeamA = [
        document.getElementById('team-a-champ-1'),
        document.getElementById('team-a-champ-2'),
        document.getElementById('team-a-champ-3'),
        document.getElementById('team-a-champ-4'),
        document.getElementById('team-a-champ-5')
    ];

    const championSelectsTeamB = [
        document.getElementById('team-b-champ-1'),
        document.getElementById('team-b-champ-2'),
        document.getElementById('team-b-champ-3'),
        document.getElementById('team-b-champ-4'),
        document.getElementById('team-b-champ-5')
    ];

    championSelectsTeamA.forEach(select => {
        select.innerHTML = '<option value="">Select Champion</option>';
        allChampions.forEach(champ => {
            const option = document.createElement('option');
            option.value = champ;
            option.textContent = champ;
            select.appendChild(option);
        });
    });

    championSelectsTeamB.forEach(select => {
        select.innerHTML = '<option value="">Select Champion</option>';
        allChampions.forEach(champ => {
            const option = document.createElement('option');
            option.value = champ;
            option.textContent = champ;
            select.appendChild(option);
        });
    });
}
//#######################################