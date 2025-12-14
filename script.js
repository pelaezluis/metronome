// Almacenamiento de canciones
let songs = [];
let currentMetronome = null;
let audioContext = null;
let searchFilter = '';

// Cargar canciones del localStorage al iniciar
function loadSongs() {
    const stored = localStorage.getItem('metronomeSongs');
    if (stored) {
        songs = JSON.parse(stored);
        renderSongs();
    }
}

// Guardar canciones en localStorage
function saveSongs() {
    localStorage.setItem('metronomeSongs', JSON.stringify(songs));
}

// Renderizar lista de canciones ordenada alfabéticamente
function renderSongs() {
    const songsList = document.getElementById('songsList');
    const emptyState = document.getElementById('emptyState');
    const noResultsState = document.getElementById('noResultsState');
    
    if (songs.length === 0) {
        songsList.innerHTML = '';
        emptyState.classList.remove('hidden');
        noResultsState.classList.add('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    // Filtrar canciones según el término de búsqueda (por nombre o grupo)
    let filteredSongs = songs;
    if (searchFilter.trim() !== '') {
        const searchTerm = searchFilter.toLowerCase().trim();
        filteredSongs = songs.filter(song => 
            song.name.toLowerCase().includes(searchTerm) ||
            (song.group && song.group.toLowerCase().includes(searchTerm))
        );
    }
    
    // Si no hay resultados después del filtro
    if (filteredSongs.length === 0 && searchFilter.trim() !== '') {
        songsList.innerHTML = '';
        noResultsState.classList.remove('hidden');
        return;
    }
    
    noResultsState.classList.add('hidden');
    
    // Ordenar canciones alfabéticamente por nombre
    const sortedSongs = [...filteredSongs].sort((a, b) => 
        a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
    );
    
    songsList.innerHTML = sortedSongs.map((song, index) => {
        const originalIndex = songs.findIndex(s => s.id === song.id);
        return `
            <div class="flex flex-col md:flex-row md:items-center md:justify-between p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition gap-3">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                        <h3 class="font-semibold text-gray-800 text-base md:text-lg truncate">${escapeHtml(song.name)}</h3>
                        ${song.group ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">${escapeHtml(song.group)}</span>` : ''}
                    </div>
                    <p class="text-xs md:text-sm text-gray-600 mt-1">
                        ${song.bpm} BPM • Compás ${song.timeSignature}
                    </p>
                </div>
                <div class="flex items-center gap-2 md:space-x-2 flex-shrink-0">
                    <button 
                        onclick="playMetronome(${originalIndex})"
                        class="flex-1 md:flex-none px-3 md:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm md:text-base"
                    >
                        ▶ Play
                    </button>
                    <button 
                        onclick="deleteSong(${originalIndex})"
                        class="px-3 md:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm md:text-base"
                        aria-label="Eliminar canción"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Escapar HTML para prevenir XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Agregar nueva canción
document.getElementById('songForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('songName').value.trim();
    const group = document.getElementById('group').value.trim();
    const bpm = parseInt(document.getElementById('bpm').value);
    const timeSignature = document.getElementById('timeSignature').value;
    
    // Validar que todos los campos obligatorios estén completos
    if (name && bpm >= 30 && bpm <= 300 && timeSignature) {
        const newSong = {
            id: Date.now(),
            name: name,
            group: group || '', // El grupo es opcional
            bpm: bpm,
            timeSignature: timeSignature
        };
        
        songs.push(newSong);
        saveSongs();
        renderSongs();
        
        // Limpiar formulario
        document.getElementById('songForm').reset();
        document.getElementById('timeSignature').value = '4/4';
    }
});

// Eliminar canción
function deleteSong(index) {
    if (confirm('¿Estás seguro de que deseas eliminar esta canción?')) {
        songs.splice(index, 1);
        saveSongs();
        renderSongs();
    }
}

// Reproducir metrónomo
function playMetronome(index) {
    // Detener metrónomo actual si hay uno activo
    if (currentMetronome) {
        stopMetronome();
    }
    
    const song = songs[index];
    if (!song) return;
    
    // Inicializar AudioContext si no existe
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Calcular intervalo en milisegundos
    const intervalMs = (60 / song.bpm) * 1000;
    
    // Parsear compás (ej: "4/4" -> beatsPerMeasure = 4)
    const [beatsPerMeasure] = song.timeSignature.split('/').map(Number);
    
    let beatCount = 0;
    let isPlaying = true;
    
    // Crear función de tick
    function tick() {
        if (!isPlaying) return;
        
        beatCount++;
        
        // Sonido más fuerte en el primer beat del compás
        const isFirstBeat = (beatCount % beatsPerMeasure === 1) || beatCount === 1;
        const frequency = isFirstBeat ? 800 : 400;
        const duration = isFirstBeat ? 0.1 : 0.05;
        
        // Generar tono
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
        
        // Animación visual
        const indicator = document.getElementById('beatIndicator');
        indicator.classList.add('beat-animation');
        setTimeout(() => {
            indicator.classList.remove('beat-animation');
        }, 100);
        
        // Actualizar información
        document.getElementById('activeSongInfo').textContent = 
            `${song.name} - ${song.bpm} BPM (${song.timeSignature})`;
        
        // Programar siguiente tick
        currentMetronome = setTimeout(tick, intervalMs);
    }
    
    // Mostrar indicador
    document.getElementById('metronomeIndicator').classList.remove('hidden');
    
    // Iniciar metrónomo
    tick();
    
    // Guardar función de detención
    window.currentMetronomeStop = () => {
        isPlaying = false;
        if (currentMetronome) {
            clearTimeout(currentMetronome);
            currentMetronome = null;
        }
        document.getElementById('metronomeIndicator').classList.add('hidden');
    };
}

// Detener metrónomo
function stopMetronome() {
    if (window.currentMetronomeStop) {
        window.currentMetronomeStop();
    }
}

// Botón de detener
document.getElementById('stopMetronome').addEventListener('click', stopMetronome);

// Filtro de búsqueda
document.getElementById('searchInput').addEventListener('input', (e) => {
    searchFilter = e.target.value;
    renderSongs();
});

// Cargar canciones al iniciar
loadSongs();

