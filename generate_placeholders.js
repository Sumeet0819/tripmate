const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'assets', 'images');

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// 1x1 transparent PNG base64
const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const buffer = Buffer.from(base64Png, 'base64');

const files = [
  'icon.png',
  'android-icon-foreground.png',
  'android-icon-background.png',
  'android-icon-monochrome.png',
  'favicon.png',
  'splash-icon.png'
];

files.forEach(file => {
  const filePath = path.join(dir, file);
  fs.writeFileSync(filePath, buffer);
  console.log(`Created placeholder: ${file}`);
});
