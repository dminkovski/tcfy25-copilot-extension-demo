import * as vscode from 'vscode';

export const createRefactorCommand = ():vscode.Disposable => {
    return vscode.commands.registerCommand('tcfy25.refactorCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found!');
            return;
        }

        // Example input to the LLM
        const userCode = editor.document.getText(editor.selection);
        const suggestion = await getCodeSuggestion(userCode, "");

        vscode.window.showInformationMessage(suggestion);
        
        // Display suggestion and interactive options
        const choice = await vscode.window.showQuickPick(['Accept', 'Reject', 'Refine'], {
            placeHolder: "",
        });

        if (choice === 'Accept') {
            editor.edit(editBuilder => {
                editBuilder.replace(editor.selection, suggestion);
            });
            vscode.window.showInformationMessage('Suggestion applied!');
        } else if (choice === 'Reject') {
            vscode.window.showInformationMessage('Suggestion rejected.');
        } else if (choice === 'Refine') {
            const feedback = await vscode.window.showInputBox({
                placeHolder: 'Provide feedback for a refined suggestion.',
            });
            if (feedback) {
                const refinedSuggestion = await getCodeSuggestion(userCode, feedback);
                editor.edit(editBuilder => {
                    editBuilder.replace(editor.selection, refinedSuggestion);
                });
                vscode.window.showInformationMessage('Refined suggestion applied!');
            }
        }
    });
}

async function getCodeSuggestion(code: string, feedback: string): Promise<string> {
  const [model] = await vscode.lm.selectChatModels({ vendor: 'copilot', family: 'gpt-4o' });
      const messages = [vscode.LanguageModelChatMessage.User("Your Job is to provide code suggestions based on the provided Code and Feedback."),vscode.LanguageModelChatMessage.User(`Code: ${code}`), vscode.LanguageModelChatMessage.User(`Feedback: ${feedback}`)];
      const chatResponse = await model?.sendRequest(messages, {}, new vscode.CancellationTokenSource().token);
  
      try {
        let response = '';
        // Stream the code into the editor as it is coming in from the Language Model
        for await (const fragment of chatResponse.text) {
          response = `${response}${fragment}`;
        }
        return response;
  
      } catch (err) {
        // async response stream may fail, e.g network interruption or server side error
        console.error(err);
      }
  return "";
}