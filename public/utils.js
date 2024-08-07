function getFormattedChampionName(champion) {
    const nameMappings = {
        'Leblanc': 'LeBlanc',
        'Renata': 'Renata Glasc',
        'MissFortune': 'Miss Fortune',
        'TwistedFate': 'Twisted Fate',
        'DrMundo': 'Dr. Mundo',
        'LeeSin': 'Lee Sin',
        'MonkeyKing': 'Wukong',
        'JarvanIV': 'Jarvan IV',
        'XinZhao': 'Xin Zhao',
        'TahmKench': 'Tahm Kench',

        // Add more mappings as needed
    };
    const imageMappings = {
        'LeBlanc': 'LeBlanc',
        'Renata Glasc': 'Renata_Glasc',
        'Miss Fortune': 'Miss_Fortune',
        'Twisted Fate': 'Twisted_Fate',
        'Dr. Mundo': 'Dr._Mundo',
        'Lee Sin': 'Lee_Sin',
        'Jarvan IV': 'Jarvan_IV',
        'Xin Zhao': 'Xin_Zhao',
        'Tahm Kench': 'Tahm_Kench',
        'Wukong': 'Wukong',
        'Aurelion Sol': 'Aurelion_Sol' 

        // Add more mappings as needed
    };
    return {
        displayName: nameMappings[champion] || champion,
        imageName: imageMappings[nameMappings[champion] || champion] || champion,
    };
}

function showSpinner() {
    const spinnerContainer = document.getElementById('spinner-container');
    spinnerContainer.style.display = 'block';
}

function hideSpinner() {
    const spinnerContainer = document.getElementById('spinner-container');
    spinnerContainer.style.display = 'none';
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    const toastId = `toast-${Date.now()}`;
    const toastHtml = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-delay="3000">
            <div class="toast-header">
                <strong class="mr-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
                <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    $('#' + toastId).toast('show').on('hidden.bs.toast', function () {
        this.remove();
    });
}

function toggleDetails(gameId) {
    const detailsDiv = document.getElementById(`details-${gameId}`);
    detailsDiv.classList.toggle('active');
}