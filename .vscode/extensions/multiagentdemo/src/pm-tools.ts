import * as vscode from 'vscode';

export function registerChatToolsForProjectManager(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.lm.registerTool("CreateProjectPlan", new CreateProjectPlan()));
}

interface ICreateProjectPlanInput {
  projectDescription: string;
}
export class CreateProjectPlan implements vscode.LanguageModelTool<ICreateProjectPlanInput> {
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<ICreateProjectPlanInput>,
    token: vscode.CancellationToken
  ) {
    const params = options.input as ICreateProjectPlanInput;

    const [model] = await vscode.lm.selectChatModels({ vendor: 'copilot', family: 'gpt-4o' });
    const messages = [vscode.LanguageModelChatMessage.User("Your job is to create and display an amazing project plan that needs to be numbered and filled with jokes, irony and sarcasm."),vscode.LanguageModelChatMessage.User("This is the intial project description: "+params.projectDescription)];
    const chatResponse = await model?.sendRequest(messages, {}, new vscode.CancellationTokenSource().token);

    try {
      let response = '';
      for await (const fragment of chatResponse.text) {
        response = `${response}${fragment}`;
      }
      return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(response)]);
    } catch (err) {
      console.error(err);
    }
    return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(`Error creating project plan`)]);
  }
}
