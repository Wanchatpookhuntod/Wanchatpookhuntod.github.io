#!/bin/bash

echo "🏗️  สร้างไฟล์สำหรับ Deploy เว็บไซต์..."
echo "═══════════════════════════════════════════════════════════"

# เปลี่ยนไปยัง root directory ของโปรเจค
cd "$(dirname "$0")/.."

# สร้างโฟลเดอร์สำหรับ production
PROD_DIR="dist"
echo "📁 สร้างโฟลเดอร์ $PROD_DIR..."
rm -rf $PROD_DIR
mkdir -p $PROD_DIR

# คัดลอกไฟล์ที่จำเป็นสำหรับเว็บไซต์
echo "📋 คัดลอกไฟล์ที่จำเป็น..."

# HTML files
cp index.html $PROD_DIR/
cp player.html $PROD_DIR/
cp video-generator.html $PROD_DIR/

# CSS files
mkdir -p $PROD_DIR/css
cp css/styles.css $PROD_DIR/css/
cp css/video-generator.css $PROD_DIR/css/

# JS files
mkdir -p $PROD_DIR/js
cp js/video-gallery.js $PROD_DIR/js/
cp js/player.js $PROD_DIR/js/
cp js/video-generator.js $PROD_DIR/js/

# Data files
cp -r data $PROD_DIR/

# Images
cp -r images $PROD_DIR/

# Cloudflare Functions
if [ -d "functions" ]; then
    echo "⚙️  คัดลอก Cloudflare Functions..."
    cp -r functions $PROD_DIR/
fi

# สร้างไฟล์ README สำหรับ production
cat > $PROD_DIR/README.md << 'EOF'
# 🎬 TRU Multimedia Website

เว็บไซต์แสดงผลงานนักศึกษา สาขาเทคโนโลยีมัลติมีเดีย
มหาวิทยาลัยราชภัฏเทพสตรี

## 🌐 ใช้งาน

เปิด `index.html` ในเบราว์เซอร์เพื่อเข้าชมเว็บไซต์

## 📁 โครงสร้าง

- `index.html` - หน้าแรก แสดงผลงานทั้งหมด
- `player.html` - หน้าเล่นวิดีโอ
- `css/styles.css` - สไตล์ของเว็บไซต์
- `js/` - JavaScript สำหรับการทำงาน
- `data/videos.json` - ข้อมูลวิดีโอ
- `images/` - รูปภาพและไฟล์สื่อ
- `functions/` - Cloudflare Pages Functions

---
*ไฟล์นี้สร้างโดย build script อัตโนมัติ*
EOF

# แสดงสรุป
echo ""
echo "✅ สร้างไฟล์สำเร็จ!"
echo "📂 โฟลเดอร์: $PROD_DIR/"
echo ""
echo "📋 ไฟล์ที่รวม:"
echo "├── 🌐 index.html"
echo "├── 🎬 player.html"
echo "├── 🔧 video-generator.html"
echo "├── 🎨 css/styles.css"
echo "├── 🎨 css/video-generator.css"
echo "├── 💻 js/video-gallery.js"
echo "├── 💻 js/player.js"
echo "├── 💻 js/video-generator.js"
echo "├── 💾 data/videos.json"
echo "├── 🖼️  images/ (ทั้งหมด)"
if [ -d "functions" ]; then
echo "├── ⚙️  functions/ (Cloudflare Functions)"
fi
echo "└── 📖 README.md"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🎉 พร้อม Deploy ไป Cloudflare Pages!"
echo "💡 อัพโหลดโฟลเดอร์ $PROD_DIR ไปยัง Cloudflare Pages"
echo "═══════════════════════════════════════════════════════════"
