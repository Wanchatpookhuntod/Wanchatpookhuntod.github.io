document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('id');

    const playerFrame = document.getElementById('player-frame');
    const videoTitle = document.getElementById('video-title');
    const videoDescription = document.getElementById('video-description');

    try {
        // ใช้ R2 URL โดยตรง เพื่อความสดใหม่และรวดเร็ว
        const JSON_URL = 'https://pub-d6490d66d15543b1bdc77b15d2f43a64.r2.dev/data/videos.json?v=' + Date.now();
        const response = await fetch(JSON_URL);
        if (!response.ok) {
            throw new Error('Failed to load videos from R2');
        }

        const videos = await response.json();

        // ค้นหาวิดีโอโดยใช้ ID
        const video = videos.find(v => String(v.id) === String(videoId));

        if (video) {

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
                videoEl.controls = true;
                videoEl.autoplay = true;
                videoEl.playsInline = true;
                videoEl.id = 'main-video-player';
                videoEl.style.width = "100%";
                videoEl.style.height = "100%";
                videoEl.style.backgroundColor = "#000";

                // เพิ่ม source สำหรับรองรับ MP4
                const source = document.createElement('source');
                source.src = video.url;
                source.type = 'video/mp4';
                videoEl.appendChild(source);

                // ป้องกันการ download (ถ้าต้องการ)
                videoEl.controlsList = "nodownload";

                // Error handling
                videoEl.onerror = function (e) {
                    console.error('Video load error:', e);
                    playerFrame.innerHTML = `
                        <div style="color:white;text-align:center;padding:20px;">
                            <span class="material-symbols-outlined" style="font-size: 48px; color: #ff0404;">error</span>
                            <br><br>
                            ไม่สามารถเล่นวิดีโอนี้ได้<br>
                            <small style="color:#aaa;">(Format not supported or Link broken)</small><br>
                            <a href="${video.url}" target="_blank" style="color:#3498db; text-decoration: underline; margin-top:10px; display:inline-block;">ลองเปิดลิงก์โดยตรง</a>
                        </div>`;
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
