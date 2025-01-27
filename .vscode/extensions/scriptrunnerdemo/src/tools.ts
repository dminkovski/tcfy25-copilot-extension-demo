import { exec } from 'child_process';
import { promisify } from 'util';

import * as vscode from 'vscode';

import { findScripts } from './scripts-tree';

const execAsync = promisify(exec);


export function registerChatTools(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.lm.registerTool("runScriptInTerminal", new RunInTerminalTool()));
  context.subscriptions.push(vscode.lm.registerTool("findAllScripts", new FindScriptsTool()));
  context.subscriptions.push(vscode.lm.registerTool("fixScript", new FixScriptTool()));
	context.subscriptions.push(vscode.lm.registerTool("validateScript", new RunInTerminalTool()));
}

interface IFixScript {
  fileContent: string;
  filePath: string;
}

export class FixScriptTool implements vscode.LanguageModelTool<IFixScript> {
	async invoke(
		options: vscode.LanguageModelToolInvocationOptions<IFixScript>,
		token: vscode.CancellationToken
	) {
		const params = options.input as IFixScript;
		// Open script file and save new content
    const uri = vscode.Uri.file(params.filePath);
    const doc = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(doc);
    await editor.edit(editBuilder => {
      const lastLine = doc.lineAt(doc.lineCount - 1);
      const start = new vscode.Position(0, 0);
      const end = new vscode.Position(doc.lineCount - 1, lastLine.text.length);
      editBuilder.replace(new vscode.Range(start, end), params.fileContent);
    });
    await doc.save();
    return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart('Script fixed')]);
	}

	async prepareInvocation(
		options: vscode.LanguageModelToolInvocationPrepareOptions<IFixScript>,
		_token: vscode.CancellationToken
	) {
    const confirmationMessages = {
			title: 'Fix Script',
			message: new vscode.MarkdownString(
				`Override the script: ${options.input.filePath}?` +
				`\n\n\`\`\`\n${options.input.fileContent}\n\`\`\`\n`
			),
		};

		return {
			invocationMessage: `Fixing script...`,
		};
	}
}


interface IFindScriptParameters {
}

export class FindScriptsTool implements vscode.LanguageModelTool<IFindScriptParameters> {
	async invoke(
		options: vscode.LanguageModelToolInvocationOptions<IFindScriptParameters>,
		token: vscode.CancellationToken
	) {
		const params = options.input as IFindScriptParameters;
		const files = findScripts(vscode.workspace.workspaceFolders![0].uri.fsPath);
    const strFiles = files.map((f) => `{path:${f.filePath}, name:${f.fileName}, content:${f.fileContent}}`).join('\n');
		return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(`Found ${files.length} scripts":\n${strFiles}`)]);
	}

	async prepareInvocation(
		options: vscode.LanguageModelToolInvocationPrepareOptions<IFindScriptParameters>,
		_token: vscode.CancellationToken
	) {
		return {
			invocationMessage: `Searching workspace for scripts`,
		};
	}
}

interface IRunInTerminalParameters {
	command: string;
}
export class RunInTerminalTool
	implements vscode.LanguageModelTool<IRunInTerminalParameters> {
	async invoke(
		options: vscode.LanguageModelToolInvocationOptions<IRunInTerminalParameters>,
		_token: vscode.CancellationToken
	) {
		const params = options.input as IRunInTerminalParameters;
    
    try{
     // Run the command asynchronously
			const { stdout, stderr } = await execAsync(params.command);

			// Return output or error as a result
			const resultText = stderr ? `Error: ${stderr}` : stdout;
			return new vscode.LanguageModelToolResult([
				new vscode.LanguageModelTextPart(resultText),
			]);
    }
    catch(err:any){
      return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(err?.message)]);
    }
	}

	async prepareInvocation(
		options: vscode.LanguageModelToolInvocationPrepareOptions<IRunInTerminalParameters>,
		_token: vscode.CancellationToken
	) {
		const confirmationMessages = {
			title: 'Run command in terminal',
			message: new vscode.MarkdownString(
				`Run this command in a terminal?` +
				`\n\n\`\`\`\n${options.input.command}\n\`\`\`\n`
			),
		};

		return {
			invocationMessage: `Running command in terminal`,
		};
	}
}