import * as out from '@output';
import * as fs from 'fs';
import * as commands from './commands';
import * as types from '@types';

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
        console.log(char);
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

export function buildCommandTree() {
    const root = new NodeCommand("", []);
    addSubcommands(root, "");
    //@ts-ignore
    let comm: LeafCommand = root.subcommands[1].subcommands[0];
    comm.execute({name: "name", age: 1, should_kill: false}); 
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