// Inicializar Supabase
let supabase;
let currentBand = null;

// Inicializar Supabase si las credenciales están configuradas
if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
    supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
} else {
    console.error('❌ Las credenciales de Supabase no están configuradas en config.js');
}

// Variables globales
let songs = [];
let currentMetronome = null;
let audioContext = null;
let searchFilter = '';

// Verificar si hay una sesión activa al cargar
document.addEventListener('DOMContentLoaded', () => {
    const savedBand = localStorage.getItem('currentBand');
    if (savedBand) {
        try {
            currentBand = JSON.parse(savedBand);
            showApp();
            loadSongs();
        } catch (e) {
            console.error('Error al cargar sesión:', e);
            showLogin();
        }
    } else {
        showLogin();
    }
});

// Mostrar pantalla de login
function showLogin() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('appScreen').classList.add('hidden');
    currentBand = null;
    localStorage.removeItem('currentBand');
}

// Mostrar aplicación principal
function showApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');
    if (currentBand) {
        document.getElementById('currentBandName').textContent = `Banda: ${currentBand.name}`;
    }
}

// Autenticación con banda
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const bandName = document.getElementById('bandName').value.trim();
    const bandKey = document.getElementById('bandKey').value.trim();
    const errorDiv = document.getElementById('loginError');
    const errorText = document.getElementById('loginErrorText');
    const loginButton = document.getElementById('loginButton');
    const loginButtonText = document.getElementById('loginButtonText');
    const loginButtonSpinner = document.getElementById('loginButtonSpinner');
    
    // Ocultar error previo
    errorDiv.classList.add('hidden');
    
    // Validación básica
    if (!bandName || !bandKey) {
        errorText.textContent = 'Por favor, completa todos los campos';
        errorDiv.classList.remove('hidden');
        return;
    }
    
    if (!supabase) {
        errorText.textContent = 'Error: Supabase no está configurado. Por favor, configura config.js';
        errorDiv.classList.remove('hidden');
        return;
    }
    
    // Mostrar estado de carga
    loginButton.disabled = true;
    loginButtonText.textContent = 'Iniciando sesión...';
    loginButtonSpinner.classList.remove('hidden');
    
    try {
        // Buscar la banda por nombre
        const { data: bands, error } = await supabase
            .from('bands')
            .select('*')
            .eq('name', bandName)
            .single();
        
        if (error || !bands) {
            errorText.textContent = 'Nombre de banda o contraseña incorrectos';
            errorDiv.classList.remove('hidden');
            resetLoginButton();
            return;
        }
        
        // Verificar la contraseña (asumiendo que hay un campo 'key' o 'password' en la tabla bands)
        // Ajusta esto según la estructura real de tu tabla
        if (bands.key !== bandKey && bands.password !== bandKey) {
            errorText.textContent = 'Nombre de banda o contraseña incorrectos';
            errorDiv.classList.remove('hidden');
            resetLoginButton();
            return;
        }
        
        // Autenticación exitosa
        currentBand = {
            id: bands.id,
            name: bands.name
        };
        
        localStorage.setItem('currentBand', JSON.stringify(currentBand));
        errorDiv.classList.add('hidden');
        
        // Pequeño delay para mostrar el éxito
        loginButtonText.textContent = '¡Bienvenido!';
        await new Promise(resolve => setTimeout(resolve, 500));
        
        showApp();
        loadSongs();
        
    } catch (err) {
        console.error('Error en autenticación:', err);
        errorText.textContent = 'Error al iniciar sesión. Por favor, intenta de nuevo.';
        errorDiv.classList.remove('hidden');
        resetLoginButton();
    }
    
    function resetLoginButton() {
        loginButton.disabled = false;
        loginButtonText.textContent = 'Iniciar Sesión';
        loginButtonSpinner.classList.add('hidden');
    }
});

// Cerrar sesión
document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        showLogin();
        songs = [];
        renderSongs();
    }
});

// Cargar canciones desde Supabase
async function loadSongs() {
    if (!supabase || !currentBand) {
        songs = [];
        renderSongs();
        return;
    }
    
    try {
        const { data, error } = await supabase
            .from('songs')
            .select('*')
            .eq('band_id', currentBand.id)
            .order('name', { ascending: true });
        
        if (error) {
            console.error('Error al cargar canciones:', error);
            songs = [];
        } else {
            songs = data || [];
        }
        
        renderSongs();
    } catch (err) {
        console.error('Error al cargar canciones:', err);
        songs = [];
        renderSongs();
    }
}

// Guardar canción en Supabase
async function saveSong(song) {
    if (!supabase || !currentBand) {
        console.error('No hay conexión a Supabase o no hay banda autenticada');
        return false;
    }
    
    try {
        const { data, error } = await supabase
            .from('songs')
            .insert([
                {
                    name: song.name,
                    group: song.group || null,
                    bpm: song.bpm,
                    time_signature: song.timeSignature,
                    band_id: currentBand.id
                }
            ])
            .select()
            .single();
        
        if (error) {
            console.error('Error al guardar canción:', error);
            alert('Error al guardar la canción. Por favor, intenta de nuevo.');
            return false;
        }
        
        return true;
    } catch (err) {
        console.error('Error al guardar canción:', err);
        alert('Error al guardar la canción. Por favor, intenta de nuevo.');
        return false;
    }
}

// Eliminar canción de Supabase
async function deleteSongFromDB(songId) {
    if (!supabase || !currentBand) {
        console.error('No hay conexión a Supabase o no hay banda autenticada');
        return false;
    }
    
    try {
        const { error } = await supabase
            .from('songs')
            .delete()
            .eq('id', songId)
            .eq('band_id', currentBand.id); // Asegurar que solo se eliminen canciones de la banda actual
        
        if (error) {
            console.error('Error al eliminar canción:', error);
            alert('Error al eliminar la canción. Por favor, intenta de nuevo.');
            return false;
        }
        
        return true;
    } catch (err) {
        console.error('Error al eliminar canción:', err);
        alert('Error al eliminar la canción. Por favor, intenta de nuevo.');
        return false;
    }
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
        return `
            <div class="flex flex-col md:flex-row md:items-center md:justify-between p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition gap-3">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                        <h3 class="font-semibold text-gray-800 text-base md:text-lg truncate">${escapeHtml(song.name)}</h3>
                        ${song.group ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">${escapeHtml(song.group)}</span>` : ''}
                    </div>
                    <p class="text-xs md:text-sm text-gray-600 mt-1">
                        ${song.bpm} BPM • Compás ${song.time_signature || song.timeSignature}
                    </p>
                </div>
                <div class="flex items-center gap-2 md:space-x-2 flex-shrink-0">
                    <button 
                        onclick="playMetronome(${song.id})"
                        class="flex-1 md:flex-none px-3 md:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm md:text-base"
                    >
                        ▶ Play
                    </button>
                    <button 
                        onclick="deleteSong('${song.id}')"
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
document.getElementById('songForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentBand) {
        alert('Por favor, inicia sesión primero');
        showLogin();
        return;
    }
    
    const name = document.getElementById('songName').value.trim();
    const group = document.getElementById('group').value.trim();
    const bpm = parseInt(document.getElementById('bpm').value);
    const timeSignature = document.getElementById('timeSignature').value;
    
    // Validar que todos los campos obligatorios estén completos
    if (name && bpm >= 30 && bpm <= 300 && timeSignature) {
        const newSong = {
            name: name,
            group: group || '', // El grupo es opcional
            bpm: bpm,
            timeSignature: timeSignature
        };
        
        const success = await saveSong(newSong);
        if (success) {
            // Recargar canciones desde Supabase
            await loadSongs();
            
            // Limpiar formulario
            document.getElementById('songForm').reset();
            document.getElementById('timeSignature').value = '4/4';
        }
    }
});

// Eliminar canción
async function deleteSong(songId) {
    if (confirm('¿Estás seguro de que deseas eliminar esta canción?')) {
        const success = await deleteSongFromDB(songId);
        if (success) {
            await loadSongs();
        }
    }
}

// Reproducir metrónomo
function playMetronome(songId) {
    // Detener metrónomo actual si hay uno activo
    if (currentMetronome) {
        stopMetronome();
    }
    
    // Buscar la canción por ID
    const song = songs.find(s => s.id === songId || s.id === parseInt(songId));
    if (!song) return;
    
    // Inicializar AudioContext si no existe
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Calcular intervalo en milisegundos
    const intervalMs = (60 / song.bpm) * 1000;
    
    // Parsear compás (ej: "4/4" -> beatsPerMeasure = 4)
    const timeSig = song.time_signature || song.timeSignature;
    const [beatsPerMeasure] = timeSig.split('/').map(Number);
    
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
            `${song.name} - ${song.bpm} BPM (${timeSig})`;
        
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
