import * as vscode from 'vscode';

import { handler } from './chatparticipant-handler';
import { findScripts, registerTreeProvider } from './scripts-tree';
import { registerChatTools } from './tools';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "scriptrunnerdemo" is now active!');

	// Loader & TreeView for scripts
	context.subscriptions.push(registerTreeProvider());

	// create participant
	const runner = vscode.chat.createChatParticipant('tcfy25.script-runner', handler);
	runner.iconPath = vscode.Uri.joinPath(context.extensionUri, 'brain.jpeg');
	context.subscriptions.push(runner);

	// Register tools for Chat participant
	registerChatTools(context);
}

// This method is called when your extension is deactivated
export function deactivate() {}
