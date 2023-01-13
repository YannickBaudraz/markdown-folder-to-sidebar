const fs = require('fs');
const childProcess = require('child_process');
const path = require('path');

describe('Markdown Folder to Sidebar tests', () => {
  const expectedFile = '_Sidebar.md';
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
    expect(fs.existsSync(expectedFile)).toBe(true);
  });

  it('should generate the correct sidebar content', () => {
    // Given
    fs.writeFileSync(generatedFolder + '/Test1.md', '# Test 1');
    fs.writeFileSync(generatedFolder + '/Test2.md', '# Test 2');
    const expectedContent = '# Navigation\n\n- [Test 1](Test1)\n- [Test 2](Test2)\n';

    // When
    childProcess.execSync(`node ../src/index -f ${generatedFolder}`);

    // Then
    const sidebarContent = fs.readFileSync('_Sidebar.md', 'utf8');
    expect(sidebarContent).toEqual(expectedContent);
  });

  it('should generate the correct sidebar content for folders,'
      + 'and only take markdown files', function() {
    // Given
    const expectedContent = fs.readFileSync('_Sidebar.expected.md', 'utf8');
    assertNonMarkdownFileInFolder('example');

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
