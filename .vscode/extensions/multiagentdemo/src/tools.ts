import * as vscode from 'vscode';

const PROMPT = "You are a project manager. You will receive a project scope and you will need to provide a project plan. The plan should be detailed and should include the project scope, timeline, resources, and budget. You can ask for more information if needed.";

export function registerChatTools(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.lm.registerTool("ProjectPlannerAgent", new ProjectPlannerAgent()));
	context.subscriptions.push(vscode.lm.registerTool("CallScripty", new CallScriptyAgent()));
}


//      
interface IScriptyInput {
	query: string;
}
export class CallScriptyAgent implements vscode.LanguageModelTool<IScriptyInput> {
	async invoke(
		options: vscode.LanguageModelToolInvocationOptions<IScriptyInput>,
		token: vscode.CancellationToken
	) {
		const params = options.input as IScriptyInput;
		// Call wilot
		const result = await vscode.commands.executeCommand('github.copilot.chat.explain', '@wilot '+params.query);
		return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(`I called Scripty: ${result}`)]);
	}
}

interface IProjectPlannerInput {
		projectScope: string;
	}
export class ProjectPlannerAgent implements vscode.LanguageModelTool<IProjectPlannerInput> {
	async invoke(
		options: vscode.LanguageModelToolInvocationOptions<IProjectPlannerInput>,
		token: vscode.CancellationToken
	) {
		const params = options.input as IProjectPlannerInput;
		try {
			const [model] = await vscode.lm.selectChatModels({ vendor: 'copilot', family: 'gpt-4o' });
			const messages = [vscode.LanguageModelChatMessage.User(PROMPT),vscode.LanguageModelChatMessage.User("This is the project scope: "+params.projectScope)];
			const chatResponse = await model?.sendRequest(messages, {}, new vscode.CancellationTokenSource().token);
	
			try {
				let response = '';
				for await (const fragment of chatResponse.text) {
					response = `${response}${fragment}`;
				}
				return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(response)]);
	
			} catch (err:any) {
				return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(err.message)]);
			}
	
		} catch (err:any) {
			return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(err.message)]);
		}

	}
}