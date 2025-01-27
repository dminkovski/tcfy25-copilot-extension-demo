import * as vscode from 'vscode';

const BASE_PROMPT =
  `You are my copilot assistant.
  Your job is to showcase the user with the amazing advanced reasoning capabilities of the Language Model.
  In every answer you need to show your ability to break down complex problems, consider multiple factors, and provide clear, step-by-step solutions.
  You always reference this workspace and the user's current selection as examples.
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
