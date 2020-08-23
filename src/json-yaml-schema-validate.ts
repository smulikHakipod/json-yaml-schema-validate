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
        description: 'directory to validate'
    },
    "files-type": {
        type: "string",
        default: "yaml",
        description: 'directory to validate',
        choices: ["json", "yaml"]
    }
})
    .argv;

const ajv = new Ajv();

const schemeObject = argv["schema-format"] == "json" ? JSON.parse(fs.readFileSync(argv.schema).toString()) : yaml.safeLoad(fs.readFileSync(argv.schema).toString());
const validator = ajv.compile(schemeObject);
glob(argv.directory,  function (err, files) {
   if(err) {
       console.error(err);
       process.exit(55);
   }
   files.forEach(file => {
       const fileContent =  argv["files-type"] == "json" ? JSON.parse(fs.readFileSync(file).toString()) : yaml.safeLoad(fs.readFileSync(file).toString());
       if(!validator(fileContent)) {
           console.error(validator.errors);
           process.exit(55);
       }
   })
});