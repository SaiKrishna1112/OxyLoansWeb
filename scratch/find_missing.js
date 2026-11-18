const fs = require('fs');
const path = require('path');

const dir = 'src/components/pages/BabuzLanding';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));
const css = fs.readFileSync(path.join(dir, 'babuz.css'), 'utf8');

const classes = new Set();
files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  const classMatches = content.match(/className="([^"]+)"/g) || [];
  classMatches.forEach(cm => {
    const clsStr = cm.replace('className="', '').replace('"', '');
    clsStr.split(/\s+/).forEach(c => {
      if (c && !c.includes('{') && !c.includes('$')) classes.add(c);
    });
  });
});

console.log('Total unique classes in JSX:', classes.size);
const missingInCss = [];
classes.forEach(c => {
  const escaped = c.replace(/[-\/\\^$*+?.()|[\]{}:%]/g, '\\$&');
  const regex = new RegExp('\\.' + escaped + '(?=[^a-zA-Z0-9_-]|$)', 'i');
  if (!css.match(regex)) {
    missingInCss.push(c);
  }
});
console.log('Classes not found in babuz.css (' + missingInCss.length + '):');
console.log(JSON.stringify(missingInCss, null, 2));
