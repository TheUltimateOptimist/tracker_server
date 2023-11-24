import * as out from '@output';
import * as fs from 'node:fs';

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

class LeafCommand implements Command {
    name: string;
    args: Object;
    execute: (args: Object) => out.Output;

    constructor(name: string, args: Object, execute: (args: Object) => out.Output) {
        this.name = name;
        this.args = args;
        this.execute = execute;
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
    let result = fs.readdirSync("src/commands");
    console.log(result);
    //const some = require('@commands/first/real.ts');
    //some.main();
}