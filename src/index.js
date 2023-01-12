const fs = require('fs');
const MarkdownIt = require('markdown-it');
const path = require('path');
const {program} = require('commander');
const {version} = require('../package.json');

program.version(version).
        option('-f, --folder <folder>', 'The folder containing markdown files').
        parse(process.argv);

const options = program.opts();

if (!options.folder) {
  console.error('Error: Please specify a folder containing markdown files.');
  process.exit(1);
}

const md = new MarkdownIt();

let sidebarContent = createSidebar(options.folder, 0);
sidebarContent = `# Navigation\n\n${sidebarContent}`;

const sidebarPath = path.join(process.cwd(), '_Sidebar.md');
fs.writeFileSync(sidebarPath, sidebarContent);
console.log(`The sidebar has been written to ${sidebarPath}`);

function createSidebar(folder, level = 0) {
  let sidebarContent = '';

  const files = fs.readdirSync(folder);
  files.forEach((file) => {
    const filePath = path.join(folder, file);
    const indentSize = '    ';
    const indent = indentSize.repeat(level);

    if (fs.lstatSync(filePath).isFile()) {
      if (path.extname(file) !== '.md') {
        return;
      }

      const fileContent = fs.readFileSync(filePath, 'utf8');
      const parsedContent = md.parse(fileContent, {});

      parsedContent.forEach((token, index) => {
        if (token.type === 'heading_open') {
          const text = parsedContent[index+1].content;
          const link = path.basename(file, path.extname(file));
          sidebarContent += `${indent}- [${text}](${link})\n`;
        }
      });
    } else {
      sidebarContent += `${indent}- ${file}\n`;
      sidebarContent += createSidebar(filePath, level + 1);
    }
  });

  return sidebarContent;
}
