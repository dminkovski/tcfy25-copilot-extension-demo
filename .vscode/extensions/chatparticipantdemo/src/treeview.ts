import * as fs from 'fs';
import * as path from 'path';

import * as vscode from 'vscode';

export class TodoProvider implements vscode.TreeDataProvider<Todo> {
  private todos: Todo[] = [new Todo('Create Presentation'), new Todo('Create Demo'), new Todo('Create Blog Post'), new Todo('Speak at Conference')];

  constructor(private workspaceRoot: string | undefined) {}

  getTreeItem(element: Todo): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Todo): Thenable<Todo[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('No Todo in empty workspace');
      return Promise.resolve([]);
    }

    // Return all todos
    if (!element) {
      return Promise.resolve(this.todos);
    }
    return Promise.resolve([]);
  }
}

class Todo extends vscode.TreeItem {
  constructor(
    public readonly label: string,
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.tooltip = this.label;
    this.label = this.label;
  }
}

export const registerTreeProvider = () => {
  const rootPath =
  vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
    ? vscode.workspace.workspaceFolders[0].uri.fsPath
    : undefined;
  vscode.window.registerTreeDataProvider(
    'todos',
    new TodoProvider(rootPath)
  );
  vscode.window.createTreeView('todos', {
    treeDataProvider: new TodoProvider(rootPath)
  });
};