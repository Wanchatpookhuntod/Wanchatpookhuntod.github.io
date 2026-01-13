const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Paths - ใช้ path จาก root ของโปรเจค ไม่ใช่จาก server/
const PROJECT_ROOT = path.join(__dirname, '..');
const COVER_FOLDER = path.join(PROJECT_ROOT, 'images', 'cover');
const VIDEOS_JSON = path.join(PROJECT_ROOT, 'data', 'videos.json');

// Ensure folders exist
if (!fs.existsSync(COVER_FOLDER)) {
    fs.mkdirSync(COVER_FOLDER, { recursive: true });
}

// Ensure data folder exists
const DATA_FOLDER = path.join(PROJECT_ROOT, 'data');
if (!fs.existsSync(DATA_FOLDER)) {
    fs.mkdirSync(DATA_FOLDER, { recursive: true });
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Video Generator API is running',
        cover_folder: COVER_FOLDER,
        videos_json: VIDEOS_JSON
    });
});

// Upload image
app.post('/api/upload-image', (req, res) => {
    try {
        const { filename, data } = req.body;
        
        if (!filename || !data) {
            return res.status(400).json({ error: 'Missing filename or data' });
        }
        
        // Extract base64 data
        const base64Data = data.includes(',') ? data.split(',')[1] : data;
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Save file
        const filepath = path.join(COVER_FOLDER, filename);
        fs.writeFileSync(filepath, buffer);
        
        console.log(`✅ Saved image: ${filepath}`);
        
        res.json({
            success: true,
            path: `images/cover/${filename}`,
            message: 'Image saved successfully'
        });
        
    } catch (error) {
        console.error(`❌ Error:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

// Save videos
app.post('/api/save-videos', (req, res) => {
    try {
        const videos = req.body;
        
        if (!Array.isArray(videos)) {
            return res.status(400).json({ error: 'Expected array of videos' });
        }
        
        // Remove thumbnailData from each video
        const cleanVideos = videos.map(video => {
            const { thumbnailData, ...rest } = video;
            return rest;
        });
        
        // Save to file
        fs.writeFileSync(VIDEOS_JSON, JSON.stringify(cleanVideos, null, 2), 'utf8');
        
        console.log(`✅ Saved ${cleanVideos.length} videos to ${VIDEOS_JSON}`);
        
        res.json({
            success: true,
            count: cleanVideos.length,
            message: 'Videos saved successfully'
        });
        
    } catch (error) {
        console.error(`❌ Error:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

// Delete image
app.delete('/api/delete-image', (req, res) => {
    try {
        const { filename } = req.body;
        
        if (!filename) {
            return res.status(400).json({ error: 'Missing filename' });
        }
        
        const filepath = path.join(COVER_FOLDER, filename);
        
        // ตรวจสอบว่าไฟล์มีอยู่จริง
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            console.log(`✅ Deleted image: ${filepath}`);
            
            res.json({
                success: true,
                message: 'Image deleted successfully'
            });
        } else {
            console.log(`⚠️ Image not found: ${filepath}`);
            res.json({
                success: true,
                message: 'Image not found (already deleted)'
            });
        }
        
    } catch (error) {
        console.error(`❌ Error:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log('============================================================');
    console.log('🚀 Video Generator API Server (Node.js)');
    console.log('============================================================');
    console.log(`📁 Cover folder: ${COVER_FOLDER}`);
    console.log(`📄 Videos JSON: ${VIDEOS_JSON}`);
    console.log(`🌐 Server: http://localhost:${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log('============================================================');
});
