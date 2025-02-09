# WRK731 - Supercharge Developer Workflow with GitHub Copilot Workspace Extension Demo
> Tech Connect FY 25 - Workshop | February 11, 2025 | 04:00 PM PST

This repository holds the demo code on how to build a VS Code extension for GitHub Copilot with context optimization, supervised automation, advanced reasoning, and goal seeking. Participants of this workshop should already be users of VS Code and GH Copilot, and they should have a good foundational experience in software development.

Link to Workshop: [WRK731](https://techconnect.microsoft.com/en-US/sessions/WRK731?source=sessions)

## Overview
The project consists of two parts.

### Example Basic Node & Express Server
1. In the `src` folder exists a very simple and basic node & express server, as well as an openapi.yaml spec.
2. This simple app is used to demonstrate the chat participants abilities on working on some application project. 
3. To run the demo app server, use `npm install` in the root folder and `npm start` to launch it. You can see the server running - if you open `http:localhost:3000` in your browser. 

### Main Copilot Extension
1. In the `.vscode\extensions\rest-api-copilot` lives the custom extension that we can install from our local workspace.
2. In the following, the Readme guides you on how to install and use it.

## Getting Started

1. Ensure [Node.js](https://nodejs.org/) is installed.
2. In the extension root folder under `.vscode\extensions\rest-api-copilot`, run:
   ```bash
   npm install
   npm run compile
   ```
3. The compiled files will be placed in the `out` directory.

## Installation

1. Press `Ctrl+Shift+P` in Visual Studio Code to open the Command Palette.
2. Type and Select **>Developer: Install Extension from Location...**.
3. Browse to and select the folder `.vscode\extensions\rest-api-copilot`.

## Usage

1. Open Copilot in Visual Studio Code (`Ctrl+Shift+I`).
2. Mention **@rest** in the beginning of your request.
3. When you need to build a new API endpoint or test the OpenAPI spec,  (e.g., "@rest, please help me create a new endpoint.").
4. The chat participant will ask you for manual validation  to create files or run scripts. It will however only need a positive response to update files.
5. For ongoing collaboration, continue addressing **@rest** with additional questions or requests about building and testing Node.js API endpoints.

> Warning: This is a PoC and Demo that allows Copilot to update and create files as well as run scripts directly on your machine or inside a dev container.

## Example
Please check [Demo Instructions](./demo/instructions.md)

![Demo GIF](./demo/copilot-demo-video.gif)

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss any changes or improvements.

## License

This project is licensed under the MIT License.