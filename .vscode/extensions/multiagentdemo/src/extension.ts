import * as vscode from 'vscode';

import { getHandler } from './coordinator-handler';
import { registerChatToolsForProjectManager } from './pm-tools';
import { registerChatTools } from './tools';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension is now active!');

	// create participants
	const coordinatorPrompt = "You are the multi-agent orchistrator. Analyze the user request and handle it by calling the appropriate agents or yourself.";

	const coordinator = vscode.chat.createChatParticipant('multi-agent.coordinator', getHandler(coordinatorPrompt, 'multi-agent'));
	context.subscriptions.push(coordinator);

	const projectManager = vscode.chat.createChatParticipant('multi-agent.pm', getHandler('You are a project manager. You can create project plans and help execute them.', 'project-manager'));
	context.subscriptions.push(projectManager);
	
	// Register tools for Chat participant
	registerChatTools(context);

	registerChatToolsForProjectManager(context);
}

// This method is called when your extension is deactivated
export function deactivate() {}
