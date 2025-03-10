import * as vscode from 'vscode';

import { handler } from './chatparticipant-handler';
import { registerChatTools } from './tools';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension is now active!');

	// Create participant
	const runner = vscode.chat.createChatParticipant('rest', handler);
	runner.iconPath = vscode.Uri.joinPath(context.extensionUri, 'icon.png');
	context.subscriptions.push(runner);

	// Register tools for chat participant
	registerChatTools(context);
}

// This method is called when your extension is deactivated
export function deactivate() {}
