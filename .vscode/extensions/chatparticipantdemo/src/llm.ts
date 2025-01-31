import * as vscode from 'vscode';

export const callLLMWithValue = async (value: string) => {
  try {
    const [model] = await vscode.lm.selectChatModels({ vendor: 'copilot', family: 'gpt-4o' });
    const messages = [vscode.LanguageModelChatMessage.User(value)];
    const chatResponse = await model?.sendRequest(messages, {}, new vscode.CancellationTokenSource().token);

    try {
      let response = '';
      // Stream the code into the editor as it is coming in from the Language Model
      for await (const fragment of chatResponse.text) {
        /*await vscode.window.activeTextEditor?.edit(edit => {
          edit.insert(new vscode.Position(vscode.window.activeTextEditor?.document.lineCount || 0, 0), fragment);
        });*/
        response = `${response}${fragment}`;
      }


      vscode.window.showInformationMessage(response);

    } catch (err) {
      // async response stream may fail, e.g network interruption or server side error
      console.error(err);
    }

  } catch (err) {
    // Making the chat request might fail because
    // - model does not exist
    // - user consent not given
    // - quota limits were exceeded
    if (err instanceof vscode.LanguageModelError) {
      console.log(err.message, err.code, err.cause);
      if (err.cause instanceof Error && err.cause.message.includes('off_topic')) {
        vscode.window.showInformationMessage(err.cause.message);
      }
    } else {
      // add other error handling logic
      throw err;
    }
  }
};