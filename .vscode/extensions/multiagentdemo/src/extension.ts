import * as vscode from 'vscode';

import { handler } from './chatparticipant-handler';
import { registerChatTools } from './tools';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "scriptrunnerdemo" is now active!');

	// create participant
	const runner = vscode.chat.createChatParticipant('tcfy25.multi-agent', handler);
	context.subscriptions.push(runner);

	// Register tools for Chat participant
	registerChatTools(context);
}

// This method is called when your extension is deactivated
export function deactivate() {}
