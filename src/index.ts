import * as some from 'parser';

let root = some.buildCommandTree();
console.log(some.interpret("some     real sldjf lskdjf ", root));