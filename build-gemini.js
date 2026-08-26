const fs = require('fs');
const path = 'C:/Users/cucu4/Desktop/stage 4eme/thiqti';

const html = fs.readFileSync(path + '/single.html', 'utf8');
const mainCss = fs.readFileSync(path + '/styles.css', 'utf8');
const css3d = fs.readFileSync(path + '/3d-effects.css', 'utf8');
const js3d = fs.readFileSync(path + '/3d-effects.js', 'utf8');

let merged = html;

// Find </style> and insert CSS
const styleEnd = merged.indexOf('</style>');
if (styleEnd > 0) {
  merged = merged.substring(0, styleEnd) + '\n' + mainCss + '\n' + css3d + '\n' + merged.substring(styleEnd);
}

// Find </script> (last one before closing body) and insert 3D JS
const lastScriptEnd = merged.lastIndexOf('</script>');
if (lastScriptEnd > 0) {
  merged = merged.substring(0, lastScriptEnd) + '\n' + js3d + '\n' + merged.substring(lastScriptEnd);
}

// Fix protocol for images
merged = merged.replace(/http:\/\/loremflickr\.com/g, 'https://loremflickr.com');
merged = merged.replace(/http:\/\/via\.placeholder\.com/g, 'https://via.placeholder.com');

fs.writeFileSync(path + '/gemini-thiqti.html', merged, 'utf8');
console.log('gemini-thiqti.html regenerated:', Math.round(merged.length/1024) + 'KB');
