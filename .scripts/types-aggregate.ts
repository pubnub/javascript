import * as ts from 'typescript';
import { ModuleKind } from 'typescript';
import minimist from 'minimist';
import * as fs from 'fs';
import { builtinModules } from 'module';

interface ConfigurationExcluded {
  value: string;
  type: 'path' | 'type' | 'function';
}

/**
 * Types aggregator script configuration type.
 */
interface Configuration {
  /**
   * List of resources which should be excluded from the aggregated type definition file.
   */
  excluded: ConfigurationExcluded[];
}

// Parse script launch arguments
const args = minimist(process.argv.slice(2), {
  string: ['config', 'input', 'output', 'namespace'],
  default: { namespace: 'PubNub' },
});

// Processing input arguments.
const configFilePath = args.config;
const inputFilePath = args.input;
const outputFilePath = args.output;
const namespace = args.namespace;

if (configFilePath === undefined || configFilePath.length === 0) throw new Error('Configuration file path is missing.');
if (inputFilePath === undefined || inputFilePath.length === 0) throw new Error('Input file path is missing.');
if (outputFilePath === undefined || outputFilePath.length === 0) throw new Error('Output file path is missing.');
if (namespace === undefined || namespace.length === 0) throw new Error('Namespace is missing.');

const configuration: Configuration = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

// Setting up TypeScript program.
const program = ts.createProgram([inputFilePath], {
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.CommonJS,
});

const checker = program.getTypeChecker();
const visited = new Set<string>();
let output = `declare namespace ${namespace} {\n\n`;

const shouldExclude = (nodeName: string, type: ConfigurationExcluded['type']): boolean => {
  return configuration.excluded
    .filter((entry) => entry.type === type)
    .some((entry) => new RegExp(`^${entry.value.replace('*', '.*')}$`).test(nodeName));
};

const getFormattedDocumentationFromNode = (node: ts.Node): string => {
  const jsDocs = ts.getJSDocCommentsAndTags(node);

  // Reformat the documentation by adding leading *
  const formattedDocs = jsDocs.map((doc) => {
    return doc.getText();
    // const lines = doc
    //   .getText()
    //   .split('\n')
    //   .map((line) => `${line.trim()}`);
    // return lines.join('\n');
  });

  return formattedDocs.join('\n');
};

const visitNode = (node: ts.Node, sourceFile: ts.SourceFile) => {
  if (ts.isImportDeclaration(node)) {
    const importPath = (node.moduleSpecifier as ts.StringLiteral).text;

    // Ignore Node.js native modules
    // if (builtinModules.includes(importPath) || shouldExclude(importPath, 'path')) {
    if (shouldExclude(importPath, 'path')) {
      return;
    }
    console.log(`~~~~> MODULE: ${importPath}`);

    const resolvedModule = ts.resolveModuleName(importPath, sourceFile.fileName, program.getCompilerOptions(), ts.sys);
    if (resolvedModule.resolvedModule) {
      const importedFile = resolvedModule.resolvedModule.resolvedFileName;
      if (!visited.has(importedFile)) {
        visited.add(importedFile);
        const importedSourceFile = program.getSourceFile(importedFile);
        if (importedSourceFile) {
          ts.forEachChild(importedSourceFile, (childNode) => visitNode(childNode, importedSourceFile));
        }
      }
    }
  }

  if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isClassDeclaration(node)) {
    const nodeName = node.name?.getText();

    if (nodeName && !shouldExclude(nodeName, 'type') && node.name) {
      console.log(`~~~~> ${node.name.text}`);
      const symbol = checker.getSymbolAtLocation(node.name);
      if (symbol) {
        const documentation = getFormattedDocumentationFromNode(node);
        const typeString = node.getText();

        output += `  ${documentation ? `${documentation}\n  ` : ''}${typeString}\n\n`;
      }
    }
  }

  ts.forEachChild(node, (childNode) => visitNode(childNode, sourceFile));
};

// Process entry point and all related public interfaces.
const sourceFile = program.getSourceFile(inputFilePath);
if (sourceFile && !shouldExclude(inputFilePath, 'path')) {
  ts.forEachChild(sourceFile, (node) => visitNode(node, sourceFile));
}

output += '}\n';

fs.writeFileSync(outputFilePath, output, 'utf8');

console.log(`Aggregated types saved to ${outputFilePath}`);
