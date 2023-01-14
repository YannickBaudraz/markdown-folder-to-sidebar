#! /usr/bin/env node
const fs = require('fs');
const md = require('markdown-it')();
const path = require('path');
const glob = require('glob');
const {program} = require('commander');
const {version} = require('../package.json');

program.version(version).
        option('-f, --folder <folder>', 'The folder containing markdown files').
        parse(process.argv);

const options = program.opts();
if (!program.opts().folder) {
  console.error('Error: Please specify a folder containing markdown files.');
  process.exit(1);
}

const sidebarHeader = '# Navigation\n\n- [Home](Home)\n';
const sidebarContent = sidebarHeader + generateSidebarContent(options.folder);
writeSidebarInFile(sidebarContent);

function generateSidebarContent(folder, level = 0) {
  let filesContent = '';
  let foldersContent = '';

  const files = fs.readdirSync(folder);
  files.forEach((file) => {
    const filePath = path.join(folder, file);

    const result = extractPathContent(filePath, level);
    if (!result) {
      return;
    }

    filesContent += result.filesContent;
    foldersContent += result.foldersContent;
  });

  return filesContent + foldersContent;
}

function extractPathContent(filePath, level) {
  const extract = {filesContent: '', foldersContent: ''};

  if (fs.lstatSync(filePath).isFile()) {
    return extractFileContent(filePath, level, extract);
  }

  return extractFolderContent(filePath, level, extract);
}

function extractFileContent(filePath, level, extract) {
  if (!isMdFile(filePath) || isFileToExclude(filePath)) {
    return;
  }

  extract.filesContent += extractMdH1ToListEl(filePath, level);
  return extract;
}

function isMdFile(filePath) {
  return path.extname(filePath) === '.md';
}

function isFileToExclude(filePath) {
  return [
    isSidebarFile,
    isHomeFile,
  ].some((isForbidden) => isForbidden(filePath));
}

function isSidebarFile(filePath) {
  return getFile(filePath) === '_Sidebar.md';
}

function isHomeFile(filePath) {
  return getFile(filePath) === 'Home.md';
}

function extractMdH1ToListEl(filePath, level) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const parsedContent = md.parse(fileContent, {});

  let listElement = '';
  parsedContent.forEach((token, index) => {
    const isH1 = (token.type === 'heading_open') && (token.tag === 'h1');
    if (!isH1) {
      return;
    }

    const text = parsedContent[index + 1].content;
    const link = getFile(filePath, true);
    listElement += `${getIndent(level)}- [${text}](${link})\n`;
  });

  return listElement;
}

function extractFolderContent(filePath, level, extract) {
  if (!hasMdFilesRecursively(filePath)) {
    return;
  }

  extract.foldersContent += `${getIndent(level)}- ${getFile(filePath)}\n`;
  extract.foldersContent += generateSidebarContent(filePath, level + 1);
  return extract;
}

function hasMdFilesRecursively(directory) {
  const files = glob.sync('**/*', {cwd: directory});
  return files.some((file) => path.extname(file) === '.md');
}

function getIndent(level) {
  return '    '.repeat(level);
}

function getFile(filePath, withoutExtension = false) {
  const ext = withoutExtension ? path.extname(filePath) : '';
  return path.basename(filePath, ext);
}

function writeSidebarInFile(content) {
  const sidebarPath = path.join(process.cwd(), '_Sidebar.md');
  fs.writeFileSync(sidebarPath, content);
  console.log(`The sidebar has been written to ${sidebarPath}`);
}
