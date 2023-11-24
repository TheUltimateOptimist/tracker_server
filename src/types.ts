interface Type<T> {
    defaultValue?: T;
    fromString(input: string): T;
}

type NumberConfig = {
    default?: number;
    min?: number;
    max?: number;
    allowed?: number[];
}

class Int implements Type<number>{
    default?: number;
    min?: number;
    max?: number;
    allowed?: number[];

    constructor(config?: NumberConfig) {
        if (config !== undefined) {
            this.default = config.default;
            this.min = config.min;
            this.max = config.max;
            this.allowed = config.allowed;

        }
    }

    fromString(input: string): number {
        throw new Error("Method not implemented.");
    }
}

export function int(config?: NumberConfig): number {
    //@ts-ignore
    return new Int(config);
}

class Float implements Type<number>{
    default?: number;
    min?: number;
    max?: number;
    allowed?: number[];

    constructor(config?: NumberConfig) {
        if (config !== undefined) {
            this.default = config.default;
            this.min = config.min;
            this.max = config.max;
            this.allowed = config.allowed;

        }
    }

    fromString(input: string): number {
        throw new Error("Method not implemented.");
    }
}

export function float(config?: NumberConfig): number {
    //@ts-ignore
    return new Float(config);
}

type StringConfig = {
    default?: string;
    max?: number;
    min?: number;
    allowed?: string[];
}

export class Stringg implements Type<string>{
    default?: string;
    max?: number;
    min?: number;
    allowed?: string[];

    constructor(config?: StringConfig) {
        if (config !== undefined) {
            this.default = config.default;
            this.max = config.max;
            this.min = config.min;
            this.allowed = config.allowed;

        }
    }

    fromString(input: string): string {
        throw new Error("Method not implemented.");
    }
}

export function string(config?: StringConfig): string {
    //@ts-ignore
    return new Stringg(config);
}

class Bool implements Type<boolean>{
    default?: boolean;

    constructor(defaultValue?: boolean) {
        this.default = defaultValue;
    }

    fromString(input: string): boolean {
        throw new Error("Method not implemented.");
    }
}

export function bool(defaultValue?: boolean): boolean {
    //@ts-ignore
    return new Bool(defaultValue);
}