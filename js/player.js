document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const videoIndex = parseInt(urlParams.get('videoIndex'), 10);

    const playerFrame = document.getElementById('player-frame');
    const videoTitle = document.getElementById('video-title');
    const videoDescription = document.getElementById('video-description');

    try {
        // โหลดวิดีโอจากไฟล์ JSON ผ่าน API (เพื่อรองรับข้อมูลล่าสุดจาก R2)
        const response = await fetch('api/get-videos');
        if (!response.ok) {
            throw new Error('Failed to load videos');
        }
        
        const videos = await response.json();
        
        // เรียงลำดับวิดีโอจากล่าสุดไปเก่าสุด (เหมือนหน้าหลัก)
        videos.sort(function(a, b) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        console.log('✅ Videos sorted by date (newest first) for player');

        if (videoIndex >= 0 && videoIndex < videos.length) {
            const video = videos[videoIndex];
            
            // Update page title
            document.title = `${video.title} - Multimedia TRU`;

            // ตรวจสอบว่าเป็น Link แบบไหน (Google Drive หรือ Direct Link/R2)
            if (video.url.includes('drive.google.com')) {
                // Create iframe for the video (Google Drive)
                const iframe = document.createElement('iframe');
                const videoUrl = video.url.replace("/view", "/preview");
                // เพิ่ม rm=minimal เพื่อซ่อนปุ่มเปิดหน้าต่างใหม่
                iframe.src = videoUrl + "?autoplay=1&rm=minimal";
                iframe.width = "100%";
                iframe.height = "100%";
                iframe.allow = "autoplay";
                iframe.frameBorder = "0";
                iframe.allowFullscreen = true;
                iframe.sandbox = "allow-same-origin allow-scripts allow-popups allow-forms";
                playerFrame.appendChild(iframe);
            } else {
                // กรณีเป็น Direct Link (Cloudflare R2, อื่นๆ) ใช้ <video> tag
                const videoEl = document.createElement('video');
                videoEl.src = video.url;
                videoEl.controls = true;
                videoEl.autoplay = true;
                videoEl.id = 'main-video-player';
                videoEl.style.width = "100%";
                videoEl.style.height = "100%";
                videoEl.style.backgroundColor = "#000"; // พื้นหลังสีดำ
                
                // ป้องกันการ download (ถ้าต้องการ)
                videoEl.controlsList = "nodownload";
                
                // Error handling
                videoEl.onerror = function() {
                    console.error('Video load error');
                    playerFrame.innerHTML = '<div style="color:white;text-align:center;padding:20px;">ไม่สามารถเล่นวิดีโอนี้ได้ (Format not supported or Link broken)</div>';
                };

                playerFrame.appendChild(videoEl);
            }

            // Set video details
            videoTitle.textContent = video.title;
            videoDescription.textContent = video.description;
            
            // แสดงชื่อนักศึกษาถ้ามี
            if (video.studentName) {
                const studentInfo = document.createElement('p');
                studentInfo.className = 'video-student';
                studentInfo.textContent = `โดย: ${video.studentName}`;
                studentInfo.style.color = '#ff0404';
                studentInfo.style.fontWeight = '500';
                studentInfo.style.marginTop = '10px';
                videoDescription.parentElement.appendChild(studentInfo);
            }
        } else {
            // Handle case where video is not found
            videoTitle.textContent = 'ไม่พบวิดีโอ';
            videoDescription.textContent = 'ไม่พบวิดีโอที่คุณต้องการ โปรดกลับไปที่หน้าหลักและลองอีกครั้ง';
        }
    } catch (error) {
        console.error('Error loading video:', error);
        videoTitle.textContent = 'เกิดข้อผิดพลาด';
        videoDescription.textContent = 'ไม่สามารถโหลดวิดีโอได้ในขณะนี้ โปรดลองใหม่อีกครั้ง';
    }
});
