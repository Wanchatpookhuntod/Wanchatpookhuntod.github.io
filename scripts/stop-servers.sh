#!/bin/bash

echo "🛑 ปิดเซิร์ฟเวอร์ MultimediaTRU.github.io..."
echo "═══════════════════════════════════════════════════════════"

# หาและปิด Web Server (Port 8080)
echo "🌐 ปิด Web Server (Port 8080)..."
WEB_PID=$(lsof -ti:8080 2>/dev/null)
if [ ! -z "$WEB_PID" ]; then
    kill $WEB_PID 2>/dev/null && echo "✅ Web Server ปิดเรียบร้อย (PID: $WEB_PID)" || echo "❌ ไม่สามารถปิด Web Server"
else
    echo "ℹ️  Web Server ไม่ทำงานอยู่"
fi

# หาและปิด API Server (Port 5001)
echo "🚀 ปิด API Server (Port 5001)..."
API_PID=$(lsof -ti:5001 2>/dev/null)
if [ ! -z "$API_PID" ]; then
    kill $API_PID 2>/dev/null && echo "✅ API Server ปิดเรียบร้อย (PID: $API_PID)" || echo "❌ ไม่สามารถปิด API Server"
else
    echo "ℹ️  API Server ไม่ทำงานอยู่"
fi

# ตรวจสอบว่าปิดเรียบร้อยหรือไม่
echo ""
echo "🔍 ตรวจสอบสถานะหลังปิด..."
sleep 1

if ! lsof -ti:8080 > /dev/null 2>&1; then
    echo "✅ Web Server (8080): ปิดเรียบร้อย"
else
    echo "❌ Web Server (8080): ยังทำงานอยู่"
fi

if ! lsof -ti:5001 > /dev/null 2>&1; then
    echo "✅ API Server (5001): ปิดเรียบร้อย"
else
    echo "❌ API Server (5001): ยังทำงานอยู่"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🛑 เซิร์ฟเวอร์ทั้งสองปิดเรียบร้อยแล้ว!"
echo "💡 หากต้องการเปิดเซิร์ฟเวอร์ใหม่: ./scripts/start-servers.sh"
echo "═══════════════════════════════════════════════════════════"