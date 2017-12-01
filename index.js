#!/usr/bin/env node

const program = require('commander');
const { prompt } = require('inquirer');
const assert = require('assert'); 

const mongoose = require('mongoose'); // An Object-Document Mapper for Node.js
console.log(process.env.MONGODB_URL);
const db = mongoose.connect(process.env.MONGODB_URL, { 
    useMongoClient: true,
    autoIndex: false, // Don't build indexes
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0 
}, 
    function(err) {
        if(err) console.log('MongoDB: connection error -> ' + err);
});
mongoose.Promise = global.Promise;
    
// Convert value to to lowercase
function toLower(v) {
    return v.toLowerCase();
}

var code_details = mongoose.Schema({
    code: { type: String, set: toLower },
    code_desc: { type: String, set: toLower },
});

var category_details = mongoose.Schema({
    categoryDesc : { type: String, set: toLower },
    categoryCode : { type: String, set: toLower },
});

// Define a contact Schema
const codesSchema = mongoose.Schema({
    is_category: { type: Boolean},
    code_details : code_details,
    category_details: category_details,
    modified_date: { type: Date},
    created_date: { type: Date},
    created_by: { type: String},
    updated_by: { type: String},
    query: { type: String},
});

// Define model as an interface with the database
const Codes = mongoose.model('codes', codesSchema);

const addCodes = (codes) => {
    console.log("here");
    Codes.create(codes, (err) => {
        assert.equal(null, err);
        console.info('New codes added');
        mongoose.connection.close();
    });
};

const questionsCodes = [
    {
      type : 'input',
      name : 'code_details.code_desc',
      message : 'Enter Code Desc ..'
    },
    {
      type : 'input',
      name : 'code_details.code',
      message : 'Enter Code ..'
    }
    
  ];

program
  .version('0.0.1')
  .description('Block5d App CLI');

  program
  .command('addCodes')
  .alias('ac')
  .description('Add a Codes')
  .action(() => {
    prompt(questionsCodes).then((answers) =>
        addCodes(answers));
  });

program
  .command('getCodes <name>')
  .alias('rc')
  .description('Get Codes')
  .action(value => getCodes(value));

program
  .command('updateCodes <_id>')
  .alias('uc')
  .description('Update Codes')
  .action(_id => {
    prompt(questionsCodes).then((answers) =>
        updateCodes(_id, answers));
  });

program
  .command('deleteCodes <_id>')
  .alias('dc')
  .description('Delete codes')
  .action(_id => deleteCodes(_id));

program
  .command('getCodesList')
  .alias('lc')
  .description('List codes')
  .action(() => getCodesList());

// Assert that a VALID command is provided 
if (!process.argv.slice(2).length || !/[arudl]/.test(process.argv.slice(2))) {
  program.outputHelp();
  process.exit();
}
program.parse(process.argv)
  