import * as fs from 'fs';
import * as path from 'path';

import * as vscode from 'vscode';

export class ScriptsProvider implements vscode.TreeDataProvider<Script> {
  public scripts: Script[] = [];

  constructor(private workspaceRoot: string | undefined) {}

  getTreeItem(element: Script): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Script): Thenable<Script[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('No scripts in workspace');
      return Promise.resolve([]);
    }

    // Return all todos
    if (!element) {
      this.scripts = findScripts(this.workspaceRoot);
      return Promise.resolve(this.scripts);
    }
    return Promise.resolve([]);
  }
}

export class Script extends vscode.TreeItem {
  constructor(
    public readonly fileName: string,
    public readonly fileContent: string,
    public readonly filePath: string
  ) {
    super(fileName, vscode.TreeItemCollapsibleState.None);
    this.description = fileContent.substring(0, 50);
  }
}

export const registerTreeProvider = () => {
  const rootPath =
  vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
    ? vscode.workspace.workspaceFolders[0].uri.fsPath
    : undefined;
  const provider = new ScriptsProvider(rootPath);  
  const treeDataProvider = vscode.window.registerTreeDataProvider(
    'scripts',  provider
  );
  vscode.window.createTreeView('scripts', {
    treeDataProvider: provider
  });
  return treeDataProvider;
};


// Find all scripts in the workspace in the scripts folder
export const findScripts = (rootPath: string): Script[] => {
  const scriptsPath = path.join(rootPath, 'scripts');
  if (fs.existsSync(scriptsPath)) {
    return fs.readdirSync(scriptsPath).map(script => {
      const scriptFilePath = path.join(scriptsPath, script);
      const scriptContent = fs.readFileSync(scriptFilePath, 'utf8');
      return new Script(script, scriptContent, scriptFilePath);
    });
  }
  return [];
};