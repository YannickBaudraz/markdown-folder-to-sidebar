const fs = require('fs');
const childProcess = require('child_process');
const path = require('path');

describe('Markdown Folder to Sidebar tests', () => {
  const expectedFileToBeGenerated = '_Sidebar.md';
  const generatedFolder = 'generated';
  const exampleFolder = 'example';

  beforeAll(() => process.chdir('test'));
  beforeEach(() => fs.mkdirSync(generatedFolder));
  afterEach(() => fs.rmSync(generatedFolder, {recursive: true}));

  it('should generate the _Sidebar.md file', () => {
    // Given
    fs.writeFileSync(`${generatedFolder}/Test1.md`, '# Test 1');
    fs.writeFileSync(`${generatedFolder}/Test2.md`, '# Test 2');

    // When
    childProcess.execSync(`node ../src/index -f ${generatedFolder}`);

    // Then
    const isSidebarFileExists = fs.existsSync(expectedFileToBeGenerated);
    expect(isSidebarFileExists).toBe(true);
  });

  it('should always generate Home link', function() {
    // Given
    fs.writeFileSync(`${generatedFolder}/Test1.md`, '# Test 1');
    const expectedContent = '# Navigation\n\n- [Home](Home)\n- [Test 1](Test1)\n';

    // When
    childProcess.execSync(`node ../src/index -f ${generatedFolder}`);

    // Then
    const sidebarContent = fs.readFileSync(expectedFileToBeGenerated, 'utf8');
    expect(sidebarContent).toBe(expectedContent);
  });

  it('should generate the correct sidebar content', () => {
    // Given
    fs.writeFileSync(generatedFolder + '/Home.md', '# Home Page');
    fs.writeFileSync(generatedFolder + '/Contributing.md', '# For Contributors');
    const expectedContent = '# Navigation\n\n- [Home](Home)\n- [For Contributors](Contributing)\n';

    // When
    childProcess.execSync(`node ../src/index -f ${generatedFolder}`);

    // Then
    const sidebarContent = fs.readFileSync('_Sidebar.md', 'utf8');
    expect(sidebarContent).toEqual(expectedContent);
  });

  it('should generate the correct sidebar content for folders', () => {
    // Given
    const expectedContent = fs.readFileSync('_Sidebar.expected.md', 'utf8');
    assertNonMarkdownFileInFolder(exampleFolder);

    // When
    childProcess.execSync(`node ../src/index -f ${exampleFolder}`);

    // Then
    const sidebarContent = fs.readFileSync('_Sidebar.md', 'utf8');
    expect(sidebarContent).toEqual(expectedContent);
  });

  function assertNonMarkdownFileInFolder(folder) {
    const files = fs.readdirSync(folder);
    expect(files.some(file => {
      const isFile = fs.lstatSync(path.join(folder, file)).isFile();
      return isFile ? path.extname(file) !== '.md' : false;
    })).toBe(true);
  }
});
