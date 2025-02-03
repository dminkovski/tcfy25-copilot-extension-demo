import {
	AssistantMessage,
	BasePromptElementProps,
	Chunk,
	PrioritizedList,
	PromptElement,
	PromptElementProps,
	PromptMetadata,
	PromptPiece,
	PromptReference,
	PromptSizing,
	ToolCall,
	ToolMessage,
	UserMessage
} from '@vscode/prompt-tsx';
import { ToolResult } from '@vscode/prompt-tsx/dist/base/promptElements';
import * as vscode from 'vscode';

export interface ToolCallRound {
	response: string;
	toolCalls: vscode.LanguageModelToolCallPart[];
}

export interface ToolUserProps extends BasePromptElementProps {
	request: vscode.ChatRequest;
	context: vscode.ChatContext;
	toolCallRounds: ToolCallRound[];
	toolCallResults: Record<string, vscode.LanguageModelToolResult>;
}


export class ToolUserPrompt extends PromptElement<ToolUserProps, void> {	
	render(_state: void, _sizing: PromptSizing) {
		const root:string | undefined = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

		return (
			<>
				<UserMessage>
				You are an AI development assistant specialized in helping developers build and maintain REST APIs in Node.js. 
				Your primary tasks include: <br />
				- Assisting in API development while enforcing company-wide best practices.
				- Validating API contracts using OpenAPI and helping developers interpret errors. 
				- Guiding architecture decisions, such as rate limiting strategies.
				- Hardening security through iterative reviews.
				<br />
				Documentation and References: <br />
				- Your main source of information is in the form of markdown in the workspace folder {root}.
				- Always refer to the documentation for best practices and guidelines.				
				<br />
				Interactions: <br />
				- The user will ask a question, or ask you to perform a task, and it may
					require lots of research to answer correctly. There is a selection of
					tools that let you perform actions or retrieve helpful context to answer
					the user's question.
				- If you aren't sure which tool is relevant, you can call multiple
					tools. You can call tools repeatedly to take actions or gather as much
					context as needed until you have completed the task fully. Don't give up
					unless you are sure the request cannot be fulfilled with the tools you
					have. 
				- Don't make assumptions about the situation- gather context first, then
					perform the task or answer the question.
				- Don't ask the user for confirmation to use tools, just use them. 
				- Always give the user the ability to ask you to update the files according to your suggestion and then use the tools to do it without generating a new response.
				<br />
				Domain Context: <br />
				- The project is a REST API built in Node.js, all files and folders can be found in the current workspace. Scan it for information.
				- This project follows an internal standardized architecture.
				- API endpoints should adhere to "[Azure API Guidelines](https://github.com/microsoft/api-guidelines/tree/vNext/azure)".
				- Use OpenAPI "(Swagger)" specifications for validation.
				- Security best practices include OAuth, JWT, rate limiting, and secure headers.
				- The project is located in: {root}/src.
				<br />
				Chat Behavior: <br />
				- Provide recommendations inline with explanations.
				- If uncertain, refer the developer to official guidelines.
				- Avoid speculative security suggestions—base improvements on known best practices.
				<br />
				Limitations: <br />
				- Do not suggest code that might introduce security risks.
				- Do not generate entire project structures—focus on enhancing existing workflows.
				- Do not generate any files or code before scanning the workspace for existing projects and source code.
				<br />
				File Creation and Handling: <br />
				- All files are to be stored in the project workspace only. 
				- You execute and run all the commands inside the same opened project workspace in VS Code. Nowhere else.
				- The workspace is located in: {root}.
				- You cannot access anything outside the workspace. If the user wants you to do that, they need to give you explicit access and tell you to.
				Important:  <br />
				- Whenever you read or update a file you always provide the full system path in your tooling and response.
				<br />
				Script Creation and Execution Rules: <br />
				- You can only create and run scripts that can be executed on the machine. 
				- On windows its powershell and on linux its bash.
				- VERY IMPORTANT: Before executing any command you will always scan the workspace for existing scripts that can be used for the task and ask the user if they want to use an existing script.
				- When running or executing script you always use the entire system path for example: "powershell -ExecutionPolicy Bypass -File c:\Users\dminkovski\Development\Microsoft\TechConnect\VSCode\src\scripts\SOMESCRIPT.ps1"
				- After creating a file you always provide the full system path of the created file and you never execute it, unless the user asks you to.
				- When you notice patterns of code that can be automated, you can suggest the user to create a script for it.
				- If you encounter errors you interpret the error messages and explain them in natural language to the user.
				- You always try to help the user to fix the error by providing a solution in case of errors.
				</UserMessage>
				<History context={this.props.context} priority={10} />
				<PromptReferences
					references={this.props.request.references}
					priority={20}
				/>
				<UserMessage>{this.props.request.prompt}</UserMessage>
				<ToolCalls
					toolCallRounds={this.props.toolCallRounds}
					toolInvocationToken={this.props.request.toolInvocationToken}
					toolCallResults={this.props.toolCallResults} />
			</>
		);
	}
}

interface ToolCallsProps extends BasePromptElementProps {
	toolCallRounds: ToolCallRound[];
	toolCallResults: Record<string, vscode.LanguageModelToolResult>;
	toolInvocationToken: vscode.ChatParticipantToolToken | undefined;
}

const dummyCancellationToken: vscode.CancellationToken = new vscode.CancellationTokenSource().token;

/**
 * Render a set of tool calls, which look like an AssistantMessage with a set of tool calls followed by the associated UserMessages containing results.
 */
class ToolCalls extends PromptElement<ToolCallsProps, void> {
	async render(_state: void, _sizing: PromptSizing) {
		if (!this.props.toolCallRounds.length) {
			return undefined;
		}

		// Note- for the copilot models, the final prompt must end with a non-tool-result UserMessage
		return <>
			{this.props.toolCallRounds.map(round => this.renderOneToolCallRound(round))}
			<UserMessage>Above is the result of calling one or more tools. The user cannot see the results, so you should explain them to the user if referencing them in your answer.</UserMessage>
		</>;
	}

	private renderOneToolCallRound(round: ToolCallRound) {
		const assistantToolCalls: ToolCall[] = round.toolCalls.map(tc => ({ type: 'function', function: { name: tc.name, arguments: JSON.stringify(tc.input) }, id: tc.callId }));
		return (
			<Chunk>
				<AssistantMessage toolCalls={assistantToolCalls}>{round.response}</AssistantMessage>
				{round.toolCalls.map(toolCall =>
					<ToolResultElement toolCall={toolCall} toolInvocationToken={this.props.toolInvocationToken} toolCallResult={this.props.toolCallResults[toolCall.callId]} />)}
			</Chunk>);
	}
}

interface ToolResultElementProps extends BasePromptElementProps {
	toolCall: vscode.LanguageModelToolCallPart;
	toolInvocationToken: vscode.ChatParticipantToolToken | undefined;
	toolCallResult: vscode.LanguageModelToolResult | undefined;
}

/**
 * One tool call result, which either comes from the cache or from invoking the tool.
 */
class ToolResultElement extends PromptElement<ToolResultElementProps, void> {
	async render(state: void, sizing: PromptSizing): Promise<PromptPiece | undefined> {
		const tool = vscode.lm.tools.find(t => t.name === this.props.toolCall.name);
		if (!tool) {
			console.error(`Tool not found: ${this.props.toolCall.name}`);
			return <ToolMessage toolCallId={this.props.toolCall.callId}>Tool not found</ToolMessage>;
		}

		const tokenizationOptions: vscode.LanguageModelToolTokenizationOptions = {
			tokenBudget: sizing.tokenBudget,
			countTokens: async (content: string) => sizing.countTokens(content),
		};

		const toolResult = this.props.toolCallResult ??
			await vscode.lm.invokeTool(this.props.toolCall.name, { input: this.props.toolCall.input, toolInvocationToken: this.props.toolInvocationToken, tokenizationOptions }, dummyCancellationToken);

		return (
			<ToolMessage toolCallId={this.props.toolCall.callId}>
				<meta value={new ToolResultMetadata(this.props.toolCall.callId, toolResult)}></meta>
				<ToolResult data={toolResult} />
			</ToolMessage>
		);
	}
}

export class ToolResultMetadata extends PromptMetadata {
	constructor(
		public toolCallId: string,
		public result: vscode.LanguageModelToolResult,
	) {
		super();
	}
}

interface HistoryProps extends BasePromptElementProps {
	priority: number;
	context: vscode.ChatContext;
}

/**
 * Render the chat history, including previous tool call/results.
 */
class History extends PromptElement<HistoryProps, void> {
	render(_state: void, _sizing: PromptSizing) {
		return (
			<PrioritizedList priority={this.props.priority} descending={false}>
				{this.props.context.history.map((message) => {
					if (message instanceof vscode.ChatRequestTurn) {
						return (
							<>
								{<PromptReferences references={message.references} excludeReferences={true} />}
								<UserMessage>{message.prompt}</UserMessage>
							</>
						);
					} else if (message instanceof vscode.ChatResponseTurn) {
						const metadata = message.result.metadata;
						if(!metadata) return;
						if (metadata.toolCallsMetadata.toolCallRounds.length > 0) {
							return <ToolCalls toolCallResults={metadata.toolCallsMetadata.toolCallResults} toolCallRounds={metadata.toolCallsMetadata.toolCallRounds} toolInvocationToken={undefined} />;
						}

						return <AssistantMessage>{chatResponseToString(message)}</AssistantMessage>;
					}
				})}
			</PrioritizedList>
		);
	}
}

/**
 * Convert the stream of chat response parts into something that can be rendered in the prompt.
 */
function chatResponseToString(response: vscode.ChatResponseTurn): string {
	return response.response
		.map((r) => {
			if (r instanceof vscode.ChatResponseMarkdownPart) {
				return r.value.value;
			} else if (r instanceof vscode.ChatResponseAnchorPart) {
				if (r.value instanceof vscode.Uri) {
					return r.value.fsPath;
				} else {
					return r.value.uri.fsPath;
				}
			}

			return '';
		})
		.join('');
}

interface PromptReferencesProps extends BasePromptElementProps {
	references: ReadonlyArray<vscode.ChatPromptReference>;
	excludeReferences?: boolean;
}

/**
 * Render references that were included in the user's request, eg files and selections.
 */
class PromptReferences extends PromptElement<PromptReferencesProps, void> {
	render(_state: void, _sizing: PromptSizing): PromptPiece {
		return (
			<UserMessage>
				{this.props.references.map(ref => (
					<PromptReferenceElement ref={ref} excludeReferences={this.props.excludeReferences} />
				))}
			</UserMessage>
		);
	}
}

interface PromptReferenceProps extends BasePromptElementProps {
	ref: vscode.ChatPromptReference;
	excludeReferences?: boolean;
}

class PromptReferenceElement extends PromptElement<PromptReferenceProps> {
	async render(_state: void, _sizing: PromptSizing): Promise<PromptPiece | undefined> {
		const value = this.props.ref.value;
		if (value instanceof vscode.Uri) {
			const fileContents = (await vscode.workspace.fs.readFile(value)).toString();
			return (
				<Tag name="context">
					{!this.props.excludeReferences && <references value={[new PromptReference(value)]} />}
					{value.fsPath}:<br />
					``` <br />
					{fileContents}<br />
					```<br />
				</Tag>
			);
		} else if (value instanceof vscode.Location) {
			const rangeText = (await vscode.workspace.openTextDocument(value.uri)).getText(value.range);
			return (
				<Tag name="context">
					{!this.props.excludeReferences && <references value={[new PromptReference(value)]} />}
					{value.uri.fsPath}:{value.range.start.line + 1}-$<br />
					{value.range.end.line + 1}: <br />
					```<br />
					{rangeText}<br />
					```
				</Tag>
			);
		} else if (typeof value === 'string') {
			return <Tag name="context">{value}</Tag>;
		}
}
}

type TagProps = PromptElementProps<{
	name: string;
}>;

class Tag extends PromptElement<TagProps> {
	private static readonly _regex = /^[a-zA-Z_][\w.-]*$/;

	render() {
		const { name } = this.props;

		if (!Tag._regex.test(name)) {
			throw new Error(`Invalid tag name: ${this.props.name}`);
		}

		return (
			<>
				{'<' + name + '>'}<br />
				<>
					{this.props.children}<br />
				</>
				{'</' + name + '>'}<br />
			</>
		);
	}
}
