const YAML = require('yaml')
const Ajv = require('ajv');
const fetch = require('node-fetch');
const fs = require('fs');
const chalk = require('chalk');

const ghToken = process.env.GITHUB_TOKEN;
const ghHeaders = {'User-Agent': 'sdk-bot', 'Authorization': 'token ' + ghToken,'Accept': 'application/vnd.github.v3.raw'};

const sdkReposJSONBranch = "develop";
let sdkReposJSONPath = "http://api.github.com/repos/pubnub/documentation-resources/contents/website-common/tools/build/sdk-repos.json?ref=" + sdkReposJSONBranch;
startExecution(sdkReposJSONPath);

async function startExecution(sdkReposJSONPath){
    var sdkRepos = await requestGetFromGithub(sdkReposJSONPath);
    var sdkReposAndFeatureMappingArray = parseReposAndFeatureMapping(sdkRepos);
    var schemaText = await requestGetFromGithub(sdkReposAndFeatureMappingArray[2]);

    schema = JSON.parse(schemaText);
    var yaml = fs.readFileSync(".pubnub.yml", 'utf8');    

    if(yaml != null){
        yml = YAML.parse(yaml);
        var ajv = new Ajv({schemaId: 'id', "verbose":true, "allErrors": true});
        const validate = ajv.compile(schema);  
        const valid = validate(yml);
        if (validate.errors!= null) {            
                console.log(chalk.cyan("==================================="));
                console.log(chalk.red(yml["version"] + " validation errors..."));
                console.log(chalk.cyan("==================================="));
                console.log(validate.errors);
                console.log(chalk.cyan("==================================="));
                var result = {code:1, repo: yml["version"], msg: "validation errors"};
                printResult(result); 
                process.exit(1);
        } 
        else {
            var result = {code: 0, repo: yml["version"], msg: "validation pass"};
            printResult(result);
        }
    } else {
        var result = {code:1, repo: "yml null", msg: "validation errors"};
        printResult(result);    
        process.exit(1);
    }
} 

function printResult(result){  
    var str = result.repo + ", " + result.msg;
    if(result.code === 0){
        console.log(chalk.green(str) + ", Code: " + result.code);
    } else {
        console.log(chalk.red(str) + ", Code: " + result.code);
    }
}

async function requestGetFromGithub(url){
    try {
        const response = await fetch(url, {
            headers: ghHeaders,
            method: 'get',
        });
        if(response.status == 200){
            const json = await response.text();        
            return json;
        } else {
            console.error(chalk.red("res.status: " + response.status + "\n URL: " + url));
            return null;    
        }

    } catch (error) {
        console.error(chalk.red("requestGetFromGithub: " + error + "\n URL: " + url));
        return null;
    }
}

function parseReposAndFeatureMapping(body){
    if(body != null){
        var sdkRepos = JSON.parse(body);
        var locations = sdkRepos["locations"];
        if(locations!=null){
            var sdkURLs = locations["sdks"];
            var featureMappingURL = locations["featureMapping"];
            var pubnubYAMLSchemaURL = locations["pubnubYAMLSchema"];
            return [sdkURLs, featureMappingURL, pubnubYAMLSchemaURL];
        } else {
            console.log(chalk.red("response locations null"));
            return null;
        }
    } else {
        console.log(chalk.red("response body null"));
        return null;
    }
}
