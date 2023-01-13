# Markdown Folder to Sidebar

A simple npm package that takes a folder containing markdown files and generates a sidebar based on
the markdown folder structure.

## Installation

```shell    
npm install -g markdown-folder-to-sidebar
```

## Usage

```shell
mdf-2-sidebar -f path/to/markdown/folder
```

The package takes one argument, `-f` or `--folder`, which is the path to the folder containing the
markdown files.

## Example

```shell
mdf-2-sidebar -f docs
```

This command will take all the markdown files in the `docs` folder and generate a sidebar
based on the folder structure. The sidebar will be written to `./_Sidebar.md`.


