import * as out from '@output';
import * as fs from 'fs';
import * as commands from './commands';
//import * as types from '@types';

class Idle { }
class TokenStarted {
    content: string;
    endingChar: string;

    constructor(content: string, endingChar: string) {
        this.content = content;
        this.endingChar = endingChar;
    }
}

function tokenize(input: string): string[] {
    let state: Idle | TokenStarted = new Idle();
    let tokens: string[] = []
    for (let char of input) {
        if (state instanceof Idle && char !== " ") {
            let content = char;
            let endingChar = " "
            if (char === '"' || char === "'") {
                endingChar = char;
                content = ""
            }
            state = new TokenStarted(content, endingChar);
        }
        else if (state instanceof TokenStarted && state.endingChar === char) {
            tokens.push(state.content);
            state = new Idle();
        }
        else if (state instanceof TokenStarted) {
            state.content = state.content + char;
        }
    }
    if (state instanceof TokenStarted) {
        tokens.push(state.content);
    }
    return tokens;
}

class PosParam {
    name: string;
    type: string;

    constructor(name: string, type: string) {
        this.name = name;
        this.type = type;
    }
}

class OptParam extends PosParam {
    defaultValue: string | undefined;

    constructor(name: string, type: string, defaultValue: string | undefined) {
        super(name, type);
        this.defaultValue = defaultValue;
    }
}

interface Command {
    name: string;
}

type Module = {
    args: Object,
    main: () => out.Output
}

class LeafCommand implements Command {
    name: string;
    module: Module;
    args: Object;

    constructor(name: string, module: Module) {
        this.name = name;
        this.module = module;
        this.args = module.args
    }

    execute(input: Object) {
        console.log(this.args);
        this.module.args = input;
        this.module.main();
        console.log(this.args);
    }
}

class NodeCommand implements Command {
    name: string;
    subcommands: Command[];

    constructor(name: string, subcommands: Command[]) {
        this.name = name;
        this.subcommands = subcommands;
    }
}
export function interpret(input: string, command_tree: NodeCommand): string {
    let tokens = tokenize(input);
    let searchResult = findCommand(tokens, command_tree);
    if (searchResult.remaining_tokens.length == 1 && searchResult.remaining_tokens[0] == "--help") {
        //todo: return help
        return "help"
    }
    if (searchResult.command instanceof NodeCommand && searchResult.remaining_tokens.length > 0) {
        return invalidCommand(searchResult.command, searchResult.remaining_tokens)
    }
    else if (searchResult.command instanceof NodeCommand) {
        //todo: return help
        return "help"
    }
    else {
       let command = searchResult.command as LeafCommand
       return "execute leaf command"
    }
}

function invalidCommand(command: NodeCommand, remaining_tokens: string[]): string {
    let names: string[] = [];
    for (let commandIndex in command.subcommands) {
        let subcommand = command.subcommands[commandIndex];
        names.push(`<span>${subcommand.name}</span>`)
    }
    return `
        <p>
            <span style="color: red;">Ungültige Eingabe: '${remaining_tokens.join(" ")}'</span>
            <br>
            <span>Gültige Befehle sind:</span>
            <br>
            ${names.join("<br>")}
        <p/> 
        `
}

type SearchResult = {
    command: Command,
    remaining_tokens: string[]
}

function findCommand(tokens: string[], command_tree: NodeCommand): SearchResult {
    let found = command_tree
    for (let tokenIndex in tokens) {
        let token = tokens[tokenIndex];
        let matchedCommand = subcommandWithToken(found, token);
        if (matchedCommand === null) {
            //@ts-ignore
            return { command: found, remaining_tokens: tokens.slice(tokenIndex) };
        }
        else if (matchedCommand instanceof LeafCommand) {
            //@ts-ignore
            return { command: matchedCommand, remaining_tokens: tokens.slice(tokenIndex + 1) };
        }
        else if (matchedCommand instanceof NodeCommand) {
            found = matchedCommand;
        }
    }
    return { command: found, remaining_tokens: [] };
}

function subcommandWithToken(root: NodeCommand, token: string): Command | null {
    for (let subcommandIndex in root.subcommands) {
        let subcommand = root.subcommands[subcommandIndex];
        if (subcommand.name === token) {
            return subcommand;
        }
    }
    return null;
}

export function buildCommandTree(): NodeCommand {
    const root = new NodeCommand("", []);
    addSubcommands(root, "");
    return root;
}

function addSubcommands(command: NodeCommand, path: string) {
    let children = fs.readdirSync(merge(["src/commands", path]));
    for (let childIndex in children) {
        let child = children[childIndex];
        if (!child.includes(".")) {
            let nodeCommand = new NodeCommand(child, []);
            addSubcommands(nodeCommand, merge([path, child]));
            command.subcommands.push(nodeCommand);
        }
        else if (child.endsWith(".ts")) {
            let name = child.split(".")[0];
            let module_name = merge([path.replace("/", "_"), name], "_");
            //@ts-ignore
            let module = commands[module_name];
            let leafCommand = new LeafCommand(name, module);
            command.subcommands.push(leafCommand);
        }
    }
}

function merge(paths: string[], joinWith: string = "/") {
    let nonEmpty = paths.filter((v, n) => v !== "");
    return nonEmpty.join(joinWith);
}