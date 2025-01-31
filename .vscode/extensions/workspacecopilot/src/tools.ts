import { exec } from 'child_process';

import * as vscode from 'vscode';

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
				`


\t			${options.input.filePath}
`
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
				`


\t			${options.input.fileContent}

`
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
			const { stdout, stderr } = await execAsyncWithTimeout(params.command, 10000);
			
			return new vscode.LanguageModelToolResult([
				new vscode.LanguageModelTextPart(stdout + " " +stderr),
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
				`


\t			${options.input.command}

`
			),
		};

		return {
			confirmationMessages,
			invocationMessage: `Running command in terminal`,
		};
	}
}


async function execAsyncWithTimeout(command: string, timeout: number): Promise<{ stdout: string, stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });

    setTimeout(() => {
      child.kill();
      resolve({stdout:'Command timed out or successfully running over 10 seconds', stderr:''});
    }, timeout);
  });
}