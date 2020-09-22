#! /usr/bin/env node

import Ajv from 'ajv';
import yargs = require('yargs');
import fs = require('fs');
import yaml = require('js-yaml');
import glob = require("glob")

const argv = yargs.options({
    schema: {
        type: "string",
        alias: 's',
        description: 'schema',
        demandOption: true,
    },
    "schema-format": {
        type: "string",
        choices: ["json", "yaml"],
        default: "json"
    },
    directory: {
        type: "string",
        demandOption: true,
        alias: 'd',
        description: 'globs to validate'
    },
    "files-type": {
        type: "string",
        default: "yaml",
        description: 'directory to validate',
        choices: ["json", "yaml"]
    },
    "exclusion-globs": {
        type: "array",
        alias: 'x',
        description: 'globs to exclude from validation',
        demandOption: false,
    },
})
    .argv;

const ajv = new Ajv();

let exclusionGlobs = argv["exclusion-globs"] as string[]

const schemeObject = argv["schema-format"] == "json" ? JSON.parse(fs.readFileSync(argv.schema).toString()) : yaml.safeLoad(fs.readFileSync(argv.schema).toString());
const validator = ajv.compile(schemeObject);
glob(argv.directory,  {"ignore": exclusionGlobs}, function (err, files) {
   if(err) {
       console.error(err);
       process.exit(55);
   }
   files.forEach(file => {
        const fileContent =  argv["files-type"] == "json" ? JSON.parse(fs.readFileSync(file).toString()) : yaml.safeLoad(fs.readFileSync(file).toString());
        if(!validator(fileContent)) {
            console.log("\"" + file + "\" failed the validation.");
            console.error(validator.errors);
            process.exit(55);
       }
   })
});