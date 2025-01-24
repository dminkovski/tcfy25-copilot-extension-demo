import * as vscode from 'vscode';

import { handler as advancedHandler } from './advanced-reasoning';
import { handler } from './chat-handler';
import { callLLMWithValue } from './llm';
import { createRefactorCommand } from './supervised-automation';
import { registerTreeProvider } from './treeview';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "chatparticipantdemo" is now active!');

	const disposable = vscode.commands.registerCommand('tcfy25.llm', () => {
		vscode.window.showInputBox({
			placeHolder: 'How can I help you?'
		}).then( async(value) => {
			await callLLMWithValue(value || '');
		});
	});

	context.subscriptions.push(disposable);

	
	// create participant
	const speaker = vscode.chat.createChatParticipant('tcfy25.speaker-assistant', handler);
	speaker.iconPath = vscode.Uri.joinPath(context.extensionUri, 'brain.jpeg');

	// Add supervised automation example
	context.subscriptions.push(createRefactorCommand());

	// Advanced reasoning chat participant
	vscode.chat.createChatParticipant('tcfy25.advanced-assistant', advancedHandler);

	// Advanced UI - Tree View
	registerTreeProvider();
}

// This method is called when your extension is deactivated
export function deactivate() {}
