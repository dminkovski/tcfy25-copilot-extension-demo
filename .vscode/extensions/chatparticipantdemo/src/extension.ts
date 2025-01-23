import * as vscode from 'vscode';

import { handler } from './chat-handler';
import { callLLMWithValue } from './llm';

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
	const tutor = vscode.chat.createChatParticipant('tcfy25.speaker-assistant', handler);
	tutor.iconPath = vscode.Uri.joinPath(context.extensionUri, 'brain.jpeg');
}

// This method is called when your extension is deactivated
export function deactivate() {}
