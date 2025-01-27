import { exec } from 'child_process';
import { promisify } from 'util';

import * as vscode from 'vscode';

const execAsync = promisify(exec);


const TRUST_WORTHY_SCRIPTS = new Map<string, boolean>();

export function registerChatTools(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.lm.registerTool("runScript", new RunInTerminalTool()));
  context.subscriptions.push(vscode.lm.registerTool("updateFile", new updateFileTool()));
	context.subscriptions.push(vscode.lm.registerTool("createFile", new createFileTool()));
	context.subscriptions.push(vscode.lm.registerTool("deleteFile", new deleteFileTool()));
}

interface IDeleteFile {
	filePath: string;
}

export class deleteFileTool implements vscode.LanguageModelTool<IDeleteFile> {
	async invoke(
		options: vscode.LanguageModelToolInvocationOptions<IDeleteFile>,
		token: vscode.CancellationToken
	) {
		const params = options.input as IDeleteFile;
		const uri = vscode.Uri.file(params.filePath);

		try {
			await vscode.workspace.fs.delete(uri);
			return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart('File Deleted.')]);
		} catch (err: any) {
			return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(`Error: ${err.message}`)]);
		}
	}

	async prepareInvocation(
		options: vscode.LanguageModelToolInvocationPrepareOptions<IDeleteFile>,
		_token: vscode.CancellationToken
	) {
		const confirmationMessages = {
			title: 'Delete file',
			message: new vscode.MarkdownString(
				`Are you sure you want me to delete this file?` +
				`\n\n\`\`\`\n${options.input.filePath}\n`
			),
		};
		return {
			confirmationMessages,
			invocationMessage: `Deleting File...`,
		};
	}
}

interface ICreateFile {
	fileContent: string;
	fileName: string;
}

export class createFileTool implements vscode.LanguageModelTool<ICreateFile> {
	async invoke(
		options: vscode.LanguageModelToolInvocationOptions<ICreateFile>,
		token: vscode.CancellationToken
	) {
		const params = options.input as ICreateFile;
		const uri = vscode.Uri.file(params.fileName);
		try {
		// Create a new file with the content
			const contentBuffer = Buffer.from(params.fileContent, 'utf-8');
			await vscode.workspace.fs.writeFile(uri, new Uint8Array(contentBuffer));
		}
		catch(e:any) {
			return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(`Error: ${e.message}`)]);
		}
		return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(`File Created: ${uri.fsPath}`)]);
	}

	async prepareInvocation(
		options: vscode.LanguageModelToolInvocationPrepareOptions<ICreateFile>,
		_token: vscode.CancellationToken
	) {
		const confirmationMessages = {
			title: 'Creating File',
			message: new vscode.MarkdownString(
				`Create File: ${options.input.fileName}?`
			),
		};
		return {
			confirmationMessages,
			invocationMessage: `Creating File...`,
		};
	}
}

interface IUpdateFile {
  fileContent: string;
  filePath: string;
}

export class updateFileTool implements vscode.LanguageModelTool<IUpdateFile> {
	async invoke(
		options: vscode.LanguageModelToolInvocationOptions<IUpdateFile>,
		token: vscode.CancellationToken
	) {
		const params = options.input as IUpdateFile;
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
    return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart('File Updated.')]);
	}

	async prepareInvocation(
		options: vscode.LanguageModelToolInvocationPrepareOptions<IUpdateFile>,
		_token: vscode.CancellationToken
	) {
    const confirmationMessages = {
			title: 'Update File',
			message: new vscode.MarkdownString(
				`Update File: ${options.input.filePath}?` +
				`\n\n\`\`\`\n${options.input.fileContent}\n\`\`\`\n`
			),
		};

		return {
			invocationMessage: `Updating File...`,
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
    TRUST_WORTHY_SCRIPTS.set(params.command, true);
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

		return !TRUST_WORTHY_SCRIPTS.has(options.input.command) ?{
			confirmationMessages,
			invocationMessage: `Running command in terminal`,
		} : {
			invocationMessage: `Running trusted command in terminal`,
		};
	}
}