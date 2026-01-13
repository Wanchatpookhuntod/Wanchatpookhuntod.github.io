#!/bin/bash

echo "🚀 เริ่มต้นเซิร์ฟเวอร์ MultimediaTRU.github.io..."
echo "═══════════════════════════════════════════════════════════"

# เริ่ม Web Server (Port 8080)
echo "🌐 เริ่ม Web Server (Port 8080)..."
cd "/Users/wanchatpookhuntod/web multimedia projgram/MultimediaTRU.github.io"
python3 -m http.server 8080 > /dev/null 2>&1 &
WEB_SERVER_PID=$!
echo "✅ Web Server เริ่มทำงาน (PID: $WEB_SERVER_PID)"

# เริ่ม API Server (Port 5001)
echo "🚀 เริ่ม API Server (Port 5001)..."

# ตรวจสอบว่าติดตั้ง node_modules แล้วหรือยัง
if [ ! -d "node_modules" ]; then
    echo "📦 ติดตั้ง Node.js dependencies..."
    npm install --silent
    echo "✅ ติดตั้ง dependencies เรียบร้อย"
fi

node server/api-server.js > /dev/null 2>&1 &
API_SERVER_PID=$!
echo "✅ API Server เริ่มทำงาน (PID: $API_SERVER_PID)"

# รอให้เซิร์ฟเวอร์เริ่มทำงาน
echo ""
echo "⏳ รอเซิร์ฟเวอร์เริ่มทำงาน..."
sleep 3

# ตรวจสอบสถานะ
echo ""
echo "🔍 ตรวจสอบสถานะเซิร์ฟเวอร์..."
echo "───────────────────────────────────────────────────────────"

# ตรวจสอบ Web Server
if lsof -ti:8080 > /dev/null 2>&1; then
    echo "✅ Web Server (8080): ทำงาน"
else
    echo "❌ Web Server (8080): ไม่ทำงาน"
fi

# ตรวจสอบ API Server
if lsof -ti:5001 > /dev/null 2>&1; then
    echo "✅ API Server (5001): ทำงาน"
else
    echo "❌ API Server (5001): ไม่ทำงาน"
fi

# ทดสอบ API Health
echo ""
echo "🏥 ทดสอบ API Health..."
if curl -s http://localhost:5001/api/health | grep -q '"status":"ok"'; then
    echo "✅ API Health Check: ผ่าน"
else
    echo "❌ API Health Check: ไม่ผ่าน"
fi

echo ""
echo "🎯 การใช้งาน:"
echo "───────────────────────────────────────────────────────────"
echo "🌐 หน้าเว็บหลัก: http://localhost:8080"
echo "🔧 หน้า Admin:    http://localhost:8080/video-generator.html"
echo "🎬 หน้าเล่นวิดีโอ: http://localhost:8080/player.html?videoIndex=1"
echo ""
echo "📡 API Endpoints:"
echo "• GET  /api/health      → ตรวจสอบสถานะ"
echo "• POST /api/upload-image → อัพโหลดรูปปก"
echo "• POST /api/save-videos  → บันทึกข้อมูลวิดีโอ"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🎉 เซิร์ฟเวอร์ทั้งสองพร้อมใช้งาน!"
echo "💡 หากต้องการปิดเซิร์ฟเวอร์: ./scripts/stop-servers.sh"
echo "═══════════════════════════════════════════════════════════"