/* ============================================
   VIRAL MOMENT - Complete JavaScript
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    const CONFIG = {
        videoSrc: 'https://files.catbox.moe/5me8mz.mp4',
        siteUrl: 'https://viral-moment.vercel.app',
        videoDuration: 90, // 1:30 in seconds
        viewerCountBase: 2400000,
        viewerIncrement: 42,
    };

    // ============================================
    // DOM REFS
    // ============================================
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const video = $('#mainVideo');
    const videoContainer = $('#videoContainer');
    const videoWrapper = $('#videoWrapper');
    const playBtnBig = $('#playBtnBig');
    const stickyPlayBtn = $('#stickyPlayBtn');
    const playPauseBtn = $('#playPauseBtn');
    const muteBtn = $('#muteBtn');
    const progressBar = $('#progressBar');
    const progressFill = $('#progressFill');
    const progressThumb = $('#progressThumb');
    const timeDisplay = $('#timeDisplay');
    const fullscreenBtn = $('#fullscreenBtn');
    const likeBtn = $('#likeBtn');
    const dislikeBtn = $('#dislikeBtn');
    const shareBtn = $('#shareBtn');
    const shareHeaderBtn = $('#shareHeaderBtn');
    const saveBtn = $('#saveBtn');
    const shareSheet = $('#shareSheet');
    const shareOverlay = $('#shareOverlay');
    const shareClose = $('#shareClose');
    const relatedGrid = $('#relatedGrid');
    const loadMore = $('#loadMore');
    const toast = $('#toast');
    const header = $('#header');
    const videoControls = $('#videoControls');

    // ============================================
    // STATE
    // ============================================
    const state = {
        isPlaying: false,
        isMuted: true,
        isFullscreen: false,
        isLiked: false,
        isDisliked: false,
        isSaved: false,
        likeCount: 89000,
        dislikeCount: 2100,
        viewerCount: CONFIG.viewerCountBase,
        relatedPage: 1,
        isLoadingMore: false,
        hasMoreVideos: true,
    };

    // ============================================
    // VIEWER COUNTER
    // ============================================
    function updateViewerCount() {
        state.viewerCount += CONFIG.viewerIncrement;
        const el = $('#viewerCount');
        if (el) {
            el.textContent = formatViewerCount(state.viewerCount);
        }
    }

    function formatViewerCount(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(0) + 'K';
        }
        return num.toString();
    }

    setInterval(updateViewerCount, 3000);

    // ============================================
    // VIDEO PLAYER
    // ============================================
    function togglePlay() {
        if (video.paused) {
            video.play().catch(() => {});
        } else {
            video.pause();
        }
    }

    function updatePlayButton() {
        const isPaused = video.paused || video.ended;
        const icon = isPaused ? '<path d="M8 5v14l11-7z"/>' : '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
        playPauseBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">${icon}</svg>`;
        
        if (isPaused) {
            playBtnBig.classList.remove('hidden');
        } else {
            playBtnBig.classList.add('hidden');
        }
    }

    function updateMuteButton() {
        const icon = video.muted
            ? '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/><line x1="22" y1="9" x2="17" y2="14" stroke="currentColor" stroke-width="2"/><line x1="17" y1="9" x2="22" y2="14" stroke="currentColor" stroke-width="2"/>'
            : '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>';
        muteBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">${icon}</svg>`;
    }

    function updateTimeDisplay() {
        const current = video.currentTime || 0;
        const duration = video.duration || CONFIG.videoDuration;
        const currentStr = formatTime(current);
        const durationStr = formatTime(duration);
        timeDisplay.textContent = `${currentStr} / ${durationStr}`;
        
        const progress = (current / duration) * 100;
        progressFill.style.width = `${progress}%`;
    }

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    function seekVideo(e) {
        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const duration = video.duration || CONFIG.videoDuration;
        video.currentTime = pos * duration;
    }

    function toggleMute() {
        video.muted = !video.muted;
        updateMuteButton();
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            videoWrapper.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    }

    // ============================================
    // VIDEO EVENTS
    // ============================================
    video.addEventListener('play', updatePlayButton);
    video.addEventListener('pause', updatePlayButton);
    video.addEventListener('ended', () => {
        updatePlayButton();
        video.currentTime = 0;
    });
    video.addEventListener('timeupdate', updateTimeDisplay);
    video.addEventListener('loadedmetadata', () => {
        updateTimeDisplay();
    });

    // Start muted autoplay
    video.muted = true;
    video.play().catch(() => {
        // Autoplay may be blocked, show play button
        playBtnBig.classList.remove('hidden');
    });
    updateMuteButton();

    // ============================================
    // PLAY BUTTONS
    // ============================================
    playBtnBig.addEventListener('click', togglePlay);
    videoContainer.addEventListener('click', togglePlay);
    playPauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlay();
    });
    stickyPlayBtn.addEventListener('click', togglePlay);

    muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMute();
    });

    fullscreenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFullscreen();
    });

    progressBar.addEventListener('click', (e) => {
        e.stopPropagation();
        seekVideo(e);
    });

    // ============================================
    // VIDEO CONTROLS VISIBILITY
    // ============================================
    let controlsTimeout;

    function showControls() {
        videoControls.classList.add('active');
        clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(() => {
            if (state.isPlaying) {
                videoControls.classList.remove('active');
            }
        }, 3000);
    }

    videoContainer.addEventListener('mousemove', showControls);
    videoContainer.addEventListener('touchstart', showControls);
    videoContainer.addEventListener('mouseenter', showControls);

    // Show controls on pause
    video.addEventListener('pause', () => {
        videoControls.classList.add('active');
    });

    // ============================================
    // STICKY PLAY BUTTON (Mobile)
    // ============================================
    let lastScrollY = 0;

    window.addEventListener('scroll', () => {
        const heroHeight = document.querySelector('.hero').offsetHeight;
        const scrollY = window.scrollY;
        
        if (scrollY > heroHeight - 200 && video.paused) {
            stickyPlayBtn.classList.add('visible');
        } else {
            stickyPlayBtn.classList.remove('visible');
        }

        // Hide header on scroll down, show on scroll up
        if (scrollY > lastScrollY && scrollY > 100) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }
        lastScrollY = scrollY;
    });

    // ============================================
    // LIKE / DISLIKE
    // ============================================
    likeBtn.addEventListener('click', () => {
        state.isLiked = !state.isLiked;
        likeBtn.classList.toggle('liked');
        
        if (state.isLiked) {
            state.likeCount++;
            if (state.isDisliked) {
                state.isDisliked = false;
                dislikeBtn.classList.remove('disliked');
                state.dislikeCount--;
                updateDislikeCount();
            }
        } else {
            state.likeCount--;
        }
        updateLikeCount();
    });

    dislikeBtn.addEventListener('click', () => {
        state.isDisliked = !state.isDisliked;
        dislikeBtn.classList.toggle('disliked');
        
        if (state.isDisliked) {
            state.dislikeCount++;
            if (state.isLiked) {
                state.isLiked = false;
                likeBtn.classList.remove('liked');
                state.likeCount--;
                updateLikeCount();
            }
        } else {
            state.dislikeCount--;
        }
        updateDislikeCount();
    });

    function updateLikeCount() {
        const el = $('#likeCount');
        el.textContent = formatCount(state.likeCount);
    }

    function updateDislikeCount() {
        const el = $('#dislikeCount');
        el.textContent = formatCount(state.dislikeCount);
    }

    function formatCount(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace('.0', '') + 'K';
        }
        return num.toString();
    }

    // ============================================
    // SAVE
    // ============================================
    saveBtn.addEventListener('click', () => {
        state.isSaved = !state.isSaved;
        saveBtn.classList.toggle('saved');
        showToast(state.isSaved ? 'Saved to playlist!' : 'Removed from playlist');
    });

    // ============================================
    // SHARE
    // ============================================
    function openShare() {
        shareSheet.classList.add('active');
        shareOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeShare() {
        shareSheet.classList.remove('active');
        shareOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    shareBtn.addEventListener('click', openShare);
    shareHeaderBtn.addEventListener('click', openShare);
    shareClose.addEventListener('click', closeShare);
    shareOverlay.addEventListener('click', closeShare);

    // Share options
    document.querySelectorAll('.share-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const platform = btn.dataset.platform;
            const url = encodeURIComponent(CONFIG.siteUrl);
            const text = encodeURIComponent('🔥 YOU WON\'T BELIEVE WHAT HAPPENS NEXT! This is going viral!');
            
            let shareUrl = '';
            
            switch (platform) {
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
                    break;
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                    break;
                case 'whatsapp':
                    shareUrl = `https://wa.me/?text=${text}%20${url}`;
                    break;
                case 'telegram':
                    shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
                    break;
                case 'reddit':
                    shareUrl = `https://reddit.com/submit?url=${url}&title=${text}`;
                    break;
                case 'copy':
                    copyToClipboard(CONFIG.siteUrl);
                    closeShare();
                    showToast('Link copied to clipboard!');
                    return;
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=500');
                closeShare();
            }
        });
    });

    function copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).catch(() => {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }

    // ============================================
    // TOAST
    // ============================================
    let toastTimeout;

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('active');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('active');
        }, 2500);
    }

    // ============================================
    // RELATED VIDEOS (MOCK DATA)
    // ============================================
    const relatedVideos = [
        {
            title: '🔥 ABSOLUTELY INSANE MOMENT CAUGHT ON CAMERA!',
            views: '3.1M',
            time: '2:15',
            uploader: 'ViralClips',
            badge: 'New',
            duration: '2:15'
        },
        {
            title: 'YOU WON\'T BELIEVE WHAT HAPPENS AT 0:45! 😱',
            views: '1.8M',
            time: '1:45',
            uploader: 'TrendingDaily',
            badge: 'Hot',
            duration: '1:45'
        },
        {
            title: 'THE MOST SHOCKING VIDEO OF 2026 SO FAR',
            views: '5.2M',
            time: '3:30',
            uploader: 'InsaneContent',
            badge: '🔥',
            duration: '3:30'
        },
        {
            title: 'EVERYONE IS TALKING ABOUT THIS VIDEO!',
            views: '2.7M',
            time: '2:00',
            uploader: 'MustWatch',
            badge: 'Viral',
            duration: '2:00'
        },
        {
            title: 'WAIT FOR IT... THE ENDING IS CRAZY! 🤯',
            views: '4.3M',
            time: '1:20',
            uploader: 'CrazyMoments',
            badge: 'New',
            duration: '1:20'
        },
        {
            title: 'THIS IS WHY IT\'S TRENDING #1 RIGHT NOW',
            views: '6.1M',
            time: '2:45',
            uploader: 'TopViral',
            badge: '🔥',
            duration: '2:45'
        },
        {
            title: 'SHE DIDN\'T EXPECT THIS TO HAPPEN...',
            views: '890K',
            time: '1:10',
            uploader: 'ReactionKing',
            badge: 'New',
            duration: '1:10'
        },
        {
            title: 'THE INTERNET IS GOING CRAZY OVER THIS',
            views: '3.8M',
            time: '2:30',
            uploader: 'ViralNation',
            badge: 'Hot',
            duration: '2:30'
        },
        {
            title: 'I CAN\'T BELIEVE THIS IS REAL FOOTAGE',
            views: '7.4M',
            time: '4:00',
            uploader: 'RealClips',
            badge: '🔥',
            duration: '4:00'
        },
        {
            title: 'THIS VIDEO WILL BLOW YOUR MIND! 🤯',
            views: '2.2M',
            time: '1:55',
            uploader: 'MindBlown',
            badge: 'New',
            duration: '1:55'
        },
        {
            title: 'WHAT HAPPENS NEXT IS UNBELIEVABLE',
            views: '5.5M',
            time: '3:15',
            uploader: 'ViralTube',
            badge: 'Hot',
            duration: '3:15'
        },
        {
            title: 'EVERYONE NEEDS TO SEE THIS RIGHT NOW',
            views: '1.9M',
            time: '2:20',
            uploader: 'ShareThis',
            badge: 'Trending',
            duration: '2:20'
        },
        {
            title: 'THE MOST CONTROVERSIAL VIDEO OF THE YEAR',
            views: '9.8M',
            time: '5:00',
            uploader: 'Controversial',
            badge: '🔥',
            duration: '5:00'
        },
        {
            title: 'YOU NEED TO WATCH THIS UNTIL THE END',
            views: '3.3M',
            time: '1:40',
            uploader: 'MustSee',
            badge: 'Viral',
            duration: '1:40'
        },
        {
            title: 'THE INTERNET IS BROKEN AFTER THIS VIDEO',
            views: '12.5M',
            time: '3:45',
            uploader: 'ViralKing',
            badge: '🔥',
            duration: '3:45'
        },
        {
            title: 'THIS IS NOT CLICKBAIT... IT\'S REAL!',
            views: '4.7M',
            time: '2:10',
            uploader: 'RealTalk',
            badge: 'New',
            duration: '2:10'
        }
    ];

    function createRelatedCard(video) {
        const thumbIndex = Math.floor(Math.random() * 10) + 1;
        const card = document.createElement('div');
        card.className = 'related-card';
        card.innerHTML = `
            <div class="related-thumb">
                <div class="related-thumb-placeholder" style="width:100%;height:100%;background:linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);display:flex;align-items:center;justify-content:center;font-size:32px;">▶</div>
                <div class="related-thumb-overlay"></div>
                <span class="related-duration">${video.duration}</span>
                <span class="related-badge">${video.badge}</span>
            </div>
            <div class="related-info">
                <div class="related-title">${video.title}</div>
                <div class="related-meta">
                    <span>${video.uploader}</span>
                    <span class="dot"></span>
                    <span>${video.views} views</span>
                </div>
            </div>
        `;
        card.addEventListener('click', () => {
            showToast('▶ Playing: ' + video.title.substring(0, 40) + '...');
        });
        return card;
    }

    function loadRelatedVideos(append = false) {
        if (state.isLoadingMore) return;
        state.isLoadingMore = true;

        if (append) {
            loadMore.classList.add('loading');
        }

        // Simulate network delay
        setTimeout(() => {
            const start = append ? (state.relatedPage - 1) * 6 : 0;
            const end = start + 6;
            const batch = relatedVideos.slice(start, end);

            if (batch.length === 0) {
                state.hasMoreVideos = false;
                loadMore.style.display = 'none';
                state.isLoadingMore = false;
                return;
            }

            batch.forEach(video => {
                relatedGrid.appendChild(createRelatedCard(video));
            });

            state.relatedPage++;
            state.isLoadingMore = false;
            loadMore.classList.remove('loading');

            if (state.relatedPage > Math.ceil(relatedVideos.length / 6)) {
                state.hasMoreVideos = false;
                loadMore.style.display = 'none';
            }
        }, 600);
    }

    // Initial load
    loadRelatedVideos();

    // Load more
    loadMore.addEventListener('click', () => {
        if (state.hasMoreVideos && !state.isLoadingMore) {
            loadRelatedVideos(true);
        }
    });

    // Infinite scroll suggestion
    let scrollTimeout;

    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
            if (scrollHeight - scrollTop - clientHeight < 300) {
                if (state.hasMoreVideos && !state.isLoadingMore) {
                    loadRelatedVideos(true);
                }
            }
        }, 200);
    });

    // ============================================
    // FULLSCREEN CHANGE EVENTS
    // ============================================
    document.addEventListener('fullscreenchange', () => {
        state.isFullscreen = !!document.fullscreenElement;
    });

    // ============================================
    // KEYBOARD SHORTCUTS
    // ============================================
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                togglePlay();
                break;
            case 'KeyM':
                toggleMute();
                break;
            case 'KeyF':
                toggleFullscreen();
                break;
            case 'Escape':
                if (shareSheet.classList.contains('active')) {
                    closeShare();
                }
                break;
        }
    });

    // ============================================
    // SERVICE WORKER REGISTRATION (for offline)
    // ============================================
    if ('serviceWorker' in navigator) {
        // Not registering a SW for simplicity, but ready for future
    }

    console.log('🔥 Viral Moment loaded successfully');
    console.log('📺 Viewer count initialized at', formatViewerCount(state.viewerCount));

})();