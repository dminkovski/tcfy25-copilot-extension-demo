import * as vscode from 'vscode';

const BASE_PROMPT =
  `You are the best event speaker.
  Your job is to help the user with amazing dialog descriptions and suggestions for the topics he chooses.
  You always reference this workspace and the user's current selection as examples.
  You wait for approval from the user before giving all the dialog.
  Before having approval you are giving 3 keywords for the user to choose from and then use the selected one.
  `;

// define a chat handler
export const handler: vscode.ChatRequestHandler = async (
  request: vscode.ChatRequest,
  context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
) => {
 // initialize the prompt
 let prompt = BASE_PROMPT;

 // initialize the messages array with the prompt
 const messages = [vscode.LanguageModelChatMessage.User(prompt)];

 // get all the previous participant messages
 const previousMessages = context.history.filter(
   h => h instanceof vscode.ChatResponseTurn
 );

 // add the previous messages to the messages array
 previousMessages.forEach(m => {
   let fullMessage = '';
   m.response.forEach(r => {
     const mdPart = r as vscode.ChatResponseMarkdownPart;
     fullMessage += mdPart.value.value;
   });
   messages.push(vscode.LanguageModelChatMessage.Assistant(fullMessage));
 });

 // add in the user's message
 messages.push(vscode.LanguageModelChatMessage.User(request.prompt));

 // send the request
 const chatResponse = await request.model.sendRequest(messages, {}, token);

 // stream the response
 for await (const fragment of chatResponse.text) {
   stream.markdown(fragment);
 }

 return;
};
