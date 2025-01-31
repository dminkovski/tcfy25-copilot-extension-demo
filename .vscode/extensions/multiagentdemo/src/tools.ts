import * as vscode from 'vscode';

export function registerChatTools(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.lm.registerTool("CallAgent", new CallAgent()));
}
      
interface ICallAgentInput {
	agent: string;
	request: string;
}
export class CallAgent implements vscode.LanguageModelTool<ICallAgentInput> {
	async invoke(
		options: vscode.LanguageModelToolInvocationOptions<ICallAgentInput>,
		token: vscode.CancellationToken
	) {
		const params = options.input as ICallAgentInput;
		
		await vscode.commands.executeCommand('workbench.action.chat.open', {query:`@${params.agent} ${params.request}`});
		/*	previousRequests: [
				{
					request: params.previousRequestByUser,
					response: params.previousResponseByCopilot,
				}
			]}); */

		await vscode.commands.executeCommand("workbench.panel.chat.view.copilot.focus");
		await vscode.commands.executeCommand("editor.action.deleteLines");
		await vscode.commands.executeCommand("type", {"text":  `@${params.agent} ${params.request}`});
		await vscode.commands.executeCommand("github.copilot.chat.explain", {query:`@${params.agent} ${params.request}`} );

		return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(`Called Agent.`)]);
	}
}
