document.addEventListener('DOMContentLoaded', function() {
    // --- DOM Elements ---
    const audioPlayer = document.getElementById('audio-player');
    const playBtn = document.getElementById('play-btn');
    const playIcon = document.getElementById('play-icon');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const repeatBtn = document.getElementById('repeat-btn');
    const progressBar = document.getElementById('progress-bar'); 
    const progressContainer = document.querySelector('.progress-container'); 
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const volumeSlider = document.getElementById('volume-slider');
    const songTitle = document.getElementById('song-title');
    const artistName = document.getElementById('artist-name');
    const albumArt = document.getElementById('album-art');
    const queueList = document.getElementById('queue-list');
    const playerContainer = document.getElementById('player-container'); 
    const volumeValue = document.getElementById('volume-value');
    const volumeDownIcon = document.getElementById('volume-down-icon');
    const volumeUpIcon = document.getElementById('volume-up-icon');

    // --- Music library (Data that would normally come from an API/DB) ---
    const songs = [
        { title: "Love Story x Golden Brown", artist: "ilblu", src: "https://condemned-beige-te8zfwksnl.edgeone.app/love%20story%20x%20golden%20brown%20-%20cover%20(ilblu).mp3", cover: "https://i.scdn.co/image/ab67616d00001e022ff8e7ddcedf9076522e8cd7", duration: "3:20" },
        { title: "Die With A Smile", artist: "Lady Gaga, Bruno Mars", src: "https://influential-white-utj3j0xj3z.edgeone.app/Lady%20Gaga,%20Bruno%20Mars%20-%20Die%20With%20A%20Smile%20(Official%20Music%20Video).mp3", cover: "https://images.genius.com/abe185baf2b9fd84ebb5d493ffe715b3.1000x1000x1.png", duration: "3:35" },
        { title: "cheri cheri lady", artist: "Modern Talking", src: "https://moaning-indigo-a1f05wrd8c.edgeone.app/Cheri_Cheri_Lady.mp3", cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVV0SIVMXyjTpUiM39U9U9SkYJbP5EMpJx9kmg&s", duration: "3:23" },
        { title: "Ed Sheeran - Shape of You", artist: "Ed Sheeran", src: "https://patient-red-nlbn3jtrtu.edgeone.app/Ed%20Sheeran%20-%20Shape%20of%20You%20(Official%20Music%20Video).mp3", cover: "https://upload.wikimedia.org/wikipedia/en/b/b4/Shape_Of_You_%28Official_Single_Cover%29_by_Ed_Sheeran.png", duration: "2:21" },
        { title: "Let Me Down Slowly x Main Dhoondne Ko Zamaane Mein (Gravero Mashup)", artist: "Gravero", src: "https://intact-fuchsia-tanizit5ua.edgeone.app/Let%20Me%20Down%20Slowly%20x%20Main%20Dhoondne%20Ko%20Zamaane%20Mein%20(Gravero%20Mashup)%20_%20Full%20Version.mp3", cover: "https://i.ytimg.com/vi/wqUFuZyR-xA/maxresdefault.jpg", duration: "3:46" },
        { title: "Ranjheya Ve", artist: "Zain Zohaib", src: "https://secret-amber-2uyqkkfbec.edgeone.app/Ranjheya%20Ve%20%20%20Zain%20Zohaib%20%20%20Yratta%20media.mp3", cover: "https://i.ytimg.com/vi/MVvEUAymQFM/maxresdefault.jpg", duration: "3:46" },
    ];
    
    // --- Player state management ---
    let currentSongIndex = 0;
    let isPlaying = false;
    let isShuffled = false;
    let isRepeated = false;
    let originalQueue = [...songs];
    let shuffledQueue = [...songs].sort(() => Math.random() - 0.5);
    
    // Utility function to format seconds into MM:SS string
    const formatTime = (time) => {
        if (!isFinite(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };
    
    // Load a song into the audio player
    function loadSong(index) {
        const queue = isShuffled ? shuffledQueue : originalQueue;
        if (index < 0 || index >= queue.length) return; 

        const song = queue[index];
        songTitle.textContent = song.title;
        artistName.textContent = song.artist;
        albumArt.src = song.cover;
        audioPlayer.src = song.src;
        
        durationEl.textContent = song.duration; 

        audioPlayer.load();

        // Wait for audio metadata to load the actual duration
        audioPlayer.onloadedmetadata = () => {
            if (isFinite(audioPlayer.duration)) {
                durationEl.textContent = formatTime(audioPlayer.duration);
            }
            renderQueue();
            // Reset progress visually when a new song loads
            progressBar.style.width = `0%`;
            currentTimeEl.textContent = '0:00';
        };
        
        currentSongIndex = index;
        renderQueue();
    }
    
    // Play song
    function playSong() {
        if (audioPlayer.src) {
            isPlaying = true;
            audioPlayer.play();
            playIcon.classList.replace('fa-play', 'fa-pause');
            playerContainer.classList.add('playing');
            updatePlayerState();
        }
    }
    
    // Pause song
    function pauseSong() {
        isPlaying = false;
        audioPlayer.pause();
        playIcon.classList.replace('fa-pause', 'fa-play');
        playerContainer.classList.remove('playing');
        updatePlayerState();
    }
    
    // Go to previous song
    function prevSong() {
        const queue = isShuffled ? shuffledQueue : originalQueue;
        // If song played for > 3 seconds, restart it
        if (audioPlayer.currentTime > 3) {
            audioPlayer.currentTime = 0; 
            return;
        }
        
        currentSongIndex--;
        if (currentSongIndex < 0) {
            currentSongIndex = queue.length - 1;
        }
        loadSong(currentSongIndex);
        if (isPlaying) {
            playSong();
        }
    }
    
    // Go to next song
    function nextSong() {
        const queue = isShuffled ? shuffledQueue : originalQueue;
        
        if (isRepeated) {
            // Loop back to the start if repeating, otherwise go to next
            currentSongIndex = (currentSongIndex + 1) % queue.length;
        } else {
            currentSongIndex++;
            // Stop if it's the end of the non-repeating queue
            if (currentSongIndex >= queue.length) {
                currentSongIndex = 0; // Reset index to the first song
                loadSong(currentSongIndex); // Load the first song
                pauseSong(); // Keep it paused at the start
                return;
            }
        }

        loadSong(currentSongIndex);
        if (isPlaying) {
            playSong();
        }
    }
    
    // Update progress bar width and current time display
    function updateProgress() {
        const { currentTime, duration } = audioPlayer;
        const progressPercent = (currentTime / duration) * 100;
        
        // Directly set width for the visual bar
        progressBar.style.width = `${progressPercent}%`;
        
        currentTimeEl.textContent = formatTime(currentTime);
    }
    
    // Seek to a new position on click
    function setProgress(e) {
        const container = e.currentTarget;
        const width = container.clientWidth;
        const clickX = e.offsetX;
        const duration = audioPlayer.duration;
        
        if (isFinite(duration) && duration > 0) {
            audioPlayer.currentTime = (clickX / width) * duration;
            updateProgress();
        }
    }

    // Determine color based on volume level
    function getVolumeColor(val) {
        if (val < 0.33) return "#3498db";
        if (val < 0.66) return "#f1c40f";
        return "#e74c3c";
    }
    
    // Set volume and update UI
    function setVolume() {
        const val = parseFloat(this.value);
        const percent = Math.round(val * 100);
        
        audioPlayer.volume = val;
        
        volumeValue.textContent = percent + '%';
        const color = getVolumeColor(val);
        
        // Update slider color (inline style for dynamic gradient)
        volumeSlider.style.background = `linear-gradient(90deg, ${color} ${percent}%, #555 ${percent}%)`;
        volumeDownIcon.style.color = val === 0 ? "#bbb" : color;
        volumeUpIcon.style.color = val > 0.7 ? color : "#888";
    }
    
    // Toggle shuffle mode
    function toggleShuffle() {
        isShuffled = !isShuffled;
        
        // Find the currently playing song
        const currentSong = isShuffled ? shuffledQueue[currentSongIndex] : originalQueue[currentSongIndex];
        
        if (isShuffled) {
            // Create a new shuffled queue based on the original list
            shuffledQueue = [...originalQueue].sort(() => Math.random() - 0.5);
            // Find the index of the currently playing song in the new shuffled list
            currentSongIndex = shuffledQueue.findIndex(song => song.title === currentSong.title);
        } else {
            // Revert to original order
            currentSongIndex = originalQueue.findIndex(song => song.title === currentSong.title);
        }
        
        // Reload to reflect potential order change in queue UI
        loadSong(currentSongIndex);
        updatePlayerState();
    }
    
    // Toggle repeat mode
    function toggleRepeat() {
        isRepeated = !isRepeated;
        updatePlayerState();
    }
    
    // Render the entire queue list dynamically
    function renderQueue() {
        queueList.innerHTML = '';
        const queue = isShuffled ? shuffledQueue : originalQueue;
        
        queue.forEach((song, index) => {
            const queueItem = document.createElement('div');
            queueItem.className = `queue-item ${index === currentSongIndex ? 'active' : ''}`;
            
            const displayDuration = (index === currentSongIndex && isFinite(audioPlayer.duration)) 
                ? formatTime(audioPlayer.duration) 
                : song.duration;
            
            queueItem.innerHTML = `
                <div class="queue-item-img">
                    <img src="${song.cover}" alt="${song.title}" onerror="this.onerror=null; this.src='https://placehold.co/40x40/1e222d/bdc3c7?text=?';">
                </div>
                <div class="queue-item-info">
                    <h4>${song.title}</h4>
                    <p>${song.artist}</p>
                </div>
                <div class="queue-item-duration">${displayDuration}</div>
            `;
            
            queueItem.addEventListener('click', () => {
                currentSongIndex = index;
                loadSong(currentSongIndex);
                playSong(); 
            });
            
            queueList.appendChild(queueItem);
        });
    }
    
    // Update visual state of all controls and queue items
    function updatePlayerState() {
        // Update active song in queue
        const queueItems = document.querySelectorAll('.queue-item');
        queueItems.forEach((item, index) => {
            item.classList.toggle('active', index === currentSongIndex);
        });
        
        // Update button states
        shuffleBtn.classList.toggle('active', isShuffled);
        repeatBtn.classList.toggle('active', isRepeated);
        
        // Update play/pause icon and container visualizer pulse
        playIcon.classList.replace(isPlaying ? 'fa-play' : 'fa-pause', isPlaying ? 'fa-pause' : 'fa-play');
        playerContainer.classList.toggle('playing', isPlaying);
    }
    
    // --- Event listeners ---
    playBtn.addEventListener('click', () => {
        isPlaying ? pauseSong() : playSong();
    });
    
    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleRepeat);
    
    // Core audio event listeners
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', nextSong); 
    
    // Seek functionality
    progressContainer.addEventListener('click', setProgress);
    volumeSlider.addEventListener('input', setVolume);
    
    // Keyboard shortcuts for smoother control
    document.addEventListener('keydown', (e) => {
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                isPlaying ? pauseSong() : playSong();
                break;
            case 'ArrowLeft':
                audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 5);
                updateProgress();
                break;
            case 'ArrowRight':
                audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 5);
                updateProgress();
                break;
            case 'ArrowUp':
                volumeSlider.value = Math.min(1, parseFloat(volumeSlider.value) + 0.1).toFixed(2);
                setVolume.call(volumeSlider);
                break;
            case 'ArrowDown':
                volumeSlider.value = Math.max(0, parseFloat(volumeSlider.value) - 0.1).toFixed(2);
                setVolume.call(volumeSlider);
                break;
        }
    });
    
    // --- Restriction Modal Setup (for unimplemented sidebar menu items) ---
    function showBlockedModal() {
        document.getElementById('block-modal').style.display = 'flex';
    }

    const restrictionMenuIds = [
        'discover-menu', 'favorites-menu', 'recent-menu', 'playlists-menu'
    ];
    
    restrictionMenuIds.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) {
            el.style.cursor = 'pointer';
            el.addEventListener('click', function(e) {
                e.stopPropagation();
                showBlockedModal();
            });
        }
    });

    // --- Initialize the player ---
    function init() {
        // Set initial volume
        setVolume.call(volumeSlider);
        // Load the first song
        loadSong(currentSongIndex);
        // Ensure initial state is rendered
        updatePlayerState();
    }

    init();

});
