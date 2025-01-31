# ScriptRunnerDemo Extension

## Overview

The `ScriptRunnerDemo` extension is designed to help users run, manage, and monitor scripts directly within Visual Studio Code. This extension provides a set of tools and commands to execute scripts, update files, create new files, and delete existing files in the workspace.

## Features

- **Run Scripts in Terminal**: Execute scripts in the integrated terminal and capture their output.
- **Update Files**: Modify the content of existing files in the workspace.
- **Create Files**: Create new files with specified content.
- **Delete Files**: Remove files from the workspace.
- **Scripts Tree View**: Display all scripts found in the workspace in a tree view for easy access.

## Tools

The extension registers several tools that can be invoked from the chat interface:

1. **Run Script**: Executes a script in the terminal.
   - **Command**: `runScript`
   - **Input Parameters**:
     - `command`: The command to run.

2. **Update File**: Updates the content of a specified file.
   - **Command**: `updateFile`
   - **Input Parameters**:
     - `filePath`: The path of the file to be updated.
     - `fileContent`: The new content for the file.

3. **Create File**: Creates a new file with specified content.
   - **Command**: `createFile`
   - **Input Parameters**:
     - `fileName`: The name of the file to be created.
     - `fileContent`: The content of the new file.

4. **Delete File**: Deletes a specified file from the workspace.
   - **Command**: `deleteFile`
   - **Input Parameters**:
     - `filePath`: The path of the file to be deleted.

## Usage

### Running Scripts

To run a script, use the `runScript` tool with the appropriate command. The output of the script will be captured and displayed.

### Updating Files

To update a file, use the `updateFile` tool with the file path and new content. The file will be opened, modified, and saved automatically.

### Creating Files

To create a new file, use the `createFile` tool with the desired file name and content. The new file will be added to the workspace.

### Deleting Files

To delete a file, use the `deleteFile` tool with the file path. The specified file will be removed from the workspace.

### Scripts Tree View

The extension provides a tree view in the Explorer panel that lists all scripts found in the workspace. This allows for quick access and management of scripts.

## Installation

To install the `ScriptRunnerDemo` extension, follow these steps:

1. Clone the repository to your local machine.
2. Open the project in Visual Studio Code.
3. Run the extension by pressing `F5`.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss any changes or improvements.

## License

This project is licensed under the MIT License.