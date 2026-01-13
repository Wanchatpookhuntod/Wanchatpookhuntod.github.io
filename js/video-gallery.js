document.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 Video Gallery Loading...');
    
    const videoGrid = document.querySelector('.video-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const loadMoreBtn = document.querySelector('.load-more-btn');

    console.log('Elements found:', {
        videoGrid: !!videoGrid,
        filterButtons: filterButtons.length,
        loadMoreBtn: !!loadMoreBtn
    });

    if (!videoGrid || !filterButtons.length || !loadMoreBtn) {
        console.error('Error: Required elements missing');
        if(videoGrid) {
            videoGrid.innerHTML = '<p class="no-videos-message">เกิดข้อผิดพลาดในการโหลด</p>';
        }
        return;
    }

    let visibleItems = 9;
    let allVideos = [];
    const JSON_URL = 'api/get-videos?v=' + Date.now(); // โหลดจาก API แทน Static Json

    function createVideoCard(video, originalIndex) {
        const videoCard = document.createElement('a');
        videoCard.href = 'player.html?videoIndex=' + originalIndex;
        videoCard.className = 'video-item';
        videoCard.dataset.category = video.category.toLowerCase();

        // ตรวจสอบว่ามีภาพปกหรือไม่
        let thumbnailHTML = '';
        if (video.thumbnail && video.thumbnail.trim() !== '') {
            // ถ้ามี path ของรูปภาพ (เช่น images/cover/xxx.jpg)
            if (video.thumbnail.startsWith('images/cover/')) {
                // ใช้รูปภาพจากโฟลเดอร์โดยตรง
                console.log('🖼️ Using local image thumbnail:', video.thumbnail);
                
                // เตรียม Fallback HTML กรณีโหลดภาพไม่สำเร็จ
                const isDrive = video.url.includes('drive.google.com');
                const fallbackHtml = isDrive 
                    ? `<div class=video-container><iframe src=\\'${video.url.replace("/view", "/preview")}\\' frameborder=0 allowfullscreen></iframe></div>` 
                    : `<div class=video-container style=\\'background:#333;display:flex;align-items:center;justify-content:center;height:100%;color:#fff;\\'><span>Video</span></div>`;

                thumbnailHTML = `
                    <div class="video-thumbnail">
                        <img src="${video.thumbnail}" 
                             alt="${video.title}"
                             loading="lazy"
                             onerror="console.error('❌ Image load failed:', this.src); this.parentElement.innerHTML='${fallbackHtml}';">
                        <div class="play-button-overlay">
                            <div class="play-icon">▶</div>
                        </div>
                    </div>
                `;
            } else if (video.thumbnail.includes('drive.google.com')) {
                // แปลง Google Drive URL เป็น Direct Link (รองรับหลายรูปแบบ)
                let thumbnailUrl = video.thumbnail;
                let fileId = null;
                
                // รูปแบบ 1: https://drive.google.com/file/d/XXXXX/view
                const match1 = thumbnailUrl.match(/\/file\/d\/([^\/\?]+)/);
                // รูปแบบ 2: https://drive.google.com/open?id=XXXXX
                const match2 = thumbnailUrl.match(/[?&]id=([^&]+)/);
                // รูปแบบ 3: https://drive.google.com/uc?id=XXXXX หรือ thumbnail?id=
                const match3 = thumbnailUrl.match(/[?&]id=([^&]+)/);
                
                if (match1) {
                    fileId = match1[1];
                } else if (match2) {
                    fileId = match2[1];
                } else if (match3) {
                    fileId = match3[1];
                }
                
                // ใช้ iframe แทนเพื่อหลีกเลี่ยงปัญหา CORS
                if (fileId) {
                    console.log('🖼️ Using Google Drive thumbnail iframe for:', fileId);
                    // ใช้ Google Drive preview แบบ responsive
                    thumbnailHTML = `
                        <div class="video-thumbnail-iframe">
                            <iframe src="https://drive.google.com/file/d/${fileId}/preview" 
                                    frameborder="0" 
                                    allowfullscreen
                                    loading="lazy"></iframe>
                            <div class="play-button-overlay">
                                <div class="play-icon">▶</div>
                            </div>
                        </div>
                    `;
                } else {
                    // ถ้าหา ID ไม่เจอ ใช้ iframe ของวิดีโอ
                    const videoPreviewUrl = video.url.replace("/view", "/preview");
                    thumbnailHTML = `
                        <div class="video-container">
                            <iframe src="${videoPreviewUrl}" frameborder="0" scrolling="no" allowfullscreen></iframe>
                        </div>
                    `;
                }
            } else {
                // ใช้ภาพปกจาก URL อื่น (Imgur, etc.) พร้อม fallback
                const isDrive = video.url.includes('drive.google.com');
                const fallbackHtml = isDrive 
                    ? `<div class=video-container><iframe src=\\'${video.url.replace("/view", "/preview")}\\' frameborder=0 allowfullscreen></iframe></div>` 
                    : `<div class=video-container style=\\'background:#333;display:flex;align-items:center;justify-content:center;height:100%;color:#fff;\\'><span>Video</span></div>`;

                thumbnailHTML = `
                    <div class="video-thumbnail">
                        <img src="${video.thumbnail}" 
                             alt="${video.title}"
                             loading="lazy"
                             onerror="console.error('❌ Image load failed:', this.src); this.parentElement.innerHTML='${fallbackHtml}';">
                        <div class="play-button-overlay">
                            <div class="play-icon">▶</div>
                        </div>
                    </div>
                `;
            }
        } else {
            // กรณีไม่มีภาพปก
            if (video.url.includes('drive.google.com')) {
                // ถ้าเป็น Google Drive ใช้ iframe preview
                const videoPreviewUrl = video.url.replace("/view", "/preview");
                thumbnailHTML = `
                    <div class="video-container">
                        <iframe src="${videoPreviewUrl}" frameborder="0" scrolling="no" allowfullscreen></iframe>
                    </div>
                `;
            } else {
                // ถ้าเป็น Link ทั่วไป/R2 ให้แสดง Placeholder หรือ Video Tag
                // การใช้ video tag หลายตัวอาจทำให้หน้าเว็บช้า แต่ช่วยให้เห็นภาพได้
                thumbnailHTML = `
                    <div class="video-container">
                        <video src="${video.url}" 
                               preload="metadata" 
                               style="width:100%; height:100%; object-fit: cover; background: #000;"
                               muted>
                        </video>
                        <div class="play-button-overlay">
                            <div class="play-icon">▶</div>
                        </div>
                    </div>
                `;
            }
        }
        
        videoCard.innerHTML = `
            ${thumbnailHTML}
            <div class="video-info">
                <h4>${video.title}</h4>
                <p>${video.description}</p>
                <span class="student-name">โดย: ${video.studentName}</span>
            </div>
        `;
        
        return videoCard;
    }

    function renderVideos(filter) {
        if (!filter) filter = 'all';
        videoGrid.innerHTML = '';
        
        const filteredVideos = filter === 'all' ? allVideos : allVideos.filter(function(video) {
            return video.category.toLowerCase() === filter;
        });

        if (filteredVideos.length === 0) {
            videoGrid.innerHTML = '<p class="no-videos-message">ยังไม่มีผลงานในหมวดหมู่นี้</p>';
            loadMoreBtn.style.display = 'none';
        } else {
            const videosToRender = filteredVideos.slice(0, visibleItems);
            
            videosToRender.forEach(function(video, displayIndex) {
                // ใช้ index จาก allVideos (sorted array) แทน originalIndex
                const sortedIndex = allVideos.findIndex(function(v) {
                    return v.url === video.url && v.title === video.title;
                });
                if (sortedIndex !== -1) {
                    const videoCard = createVideoCard(video, sortedIndex);
                    videoGrid.appendChild(videoCard);
                }
            });

            if (visibleItems >= filteredVideos.length) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'block';
            }
        }
    }
    
    async function loadVideosFromJSON() {
        try {
            videoGrid.innerHTML = '<p class="no-videos-message">กำลังโหลดข้อมูล...</p>';
            
            console.log('🔄 กำลังโหลด videos.json จาก:', JSON_URL);
            const response = await fetch(JSON_URL);
            
            console.log('📡 Response status:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            console.log('📄 Response text (first 200 chars):', text.substring(0, 200));
            
            allVideos = JSON.parse(text);
            console.log('📹 Loaded videos from JSON:', allVideos.length);
            console.log('🎬 Videos data:', allVideos);
            
            if (allVideos.length === 0) {
                console.warn('⚠️ No videos found');
                videoGrid.innerHTML = '<p class="no-videos-message">ยังไม่มีผลงานที่เพิ่มเข้ามา</p>';
                loadMoreBtn.style.display = 'none';
                return;
            }
            
            // เรียงลำดับวิดีโอจากล่าสุดไปเก่าสุด (ตาม createdAt)
            allVideos.sort(function(a, b) {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            console.log('✅ Videos sorted by date (newest first)');
            
            renderVideos();
        } catch (error) {
            console.error('❌ Error loading videos from JSON:', error);
            console.error('Error details:', error.message);
            videoGrid.innerHTML = `<p class="no-videos-message">เกิดข้อผิดพลาดในการโหลดข้อมูล<br><small style="color: #666;">${error.message}</small></p>`;
            loadMoreBtn.style.display = 'none';
        }
    }
    
    function initialize() {
        // Load videos from JSON file
        loadVideosFromJSON();

        // Setup filter buttons
        filterButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                filterButtons.forEach(function(btn) {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
                const category = button.dataset.category;
                visibleItems = 9;
                renderVideos(category);
            });
        });

        // Setup load more button
        loadMoreBtn.addEventListener('click', function() {
            visibleItems += 9;
            const currentFilter = document.querySelector('.filter-btn.active').dataset.category;
            renderVideos(currentFilter);
        });
    }

    initialize();
});
