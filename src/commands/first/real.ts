import * as t from "@types";

export let args = {
    name: t.string({max: 40}),
    age: t.int({min: 1}),
    should_kill: t.bool(false)
}

export function main() {
    console.log(`name: ${args.name}, age: ${args.age}, should_kill: ${args.should_kill}`);
}