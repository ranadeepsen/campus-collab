const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('route.js')) results.push(file);
    }
  });
  return results;
}

const files = walk('./src/app/api');
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Match: new NextResponse('some text', { status: 400 })
  // Match: new NextResponse("some text", { status: 400 })
  const regex = /new\s+NextResponse\(\s*['"](.*?)['"]\s*,\s*\{\s*status:\s*(\d+)\s*\}\s*\)/g;
  
  if (regex.test(content)) {
    const newContent = content.replace(regex, 'NextResponse.json({ error: "$1" }, { status: $2 })');
    fs.writeFileSync(file, newContent, 'utf8');
    count++;
  }
});

console.log('Fixed files: ' + count);
