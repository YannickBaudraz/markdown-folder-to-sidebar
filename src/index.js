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

const sidebarHeader = '# Navigation\n\n';
const sidebarContent = sidebarHeader + generateSidebarContent(options.folder);

const sidebarPath = path.join(process.cwd(), '_Sidebar.md');
fs.writeFileSync(sidebarPath, sidebarContent);

console.log(`The sidebar has been written to ${sidebarPath}`);

function generateSidebarContent(folder, level = 0) {
  let filesContent = '';
  let foldersContent = '';
  const indent = '    '.repeat(level);

  const files = fs.readdirSync(folder);
  files.forEach((file) => {
    const filePath = path.join(folder, file);

    if (fs.lstatSync(filePath).isFile()) {
      if (path.extname(file) !== '.md') {
        return;
      }

      const mdList = extractMdH1ToListEl(filePath, indent)
      filesContent += mdList;
    } else {
      foldersContent += `${indent}- ${file}\n`;
      foldersContent += generateSidebarContent(filePath, level + 1);
    }
  });

  return filesContent + foldersContent;
}

function extractMdH1ToListEl(filePath, indent) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const parsedContent = md.parse(fileContent, {});

  let listElement = '';
  parsedContent.forEach((token, index) => {
    if (token.type === 'heading_open') {
      const text = parsedContent[index + 1].content;
      const file = path.basename(filePath);
      const link = path.basename(file, path.extname(file));
      listElement += `${indent}- [${text}](${link})\n`;
    }
  });

  return listElement;
}
