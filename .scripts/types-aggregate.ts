import { program } from 'commander';
import * as ts from 'typescript';
import prettier from 'prettier';
import * as fs from 'fs';
import path from 'path';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

type BaseSourceFileImport = {
  /** Imported type name. */
  value: string;
  /** Name or path to the module from which type imported. */
  module: string;
  /** Import statement. */
  statement: string;
  /** Whether this is package type or not. */
  isPackageType: boolean;
};

/** Import created with type name and module path. */
type NamedSourceFileImport = BaseSourceFileImport & {
  /** Import type. */
  type: 'name';
};

/** Import created as alias (namespace) to the `*` and module path. */
type NamespacedSourceFileImport = BaseSourceFileImport & {
  /** Import type. */
  type: 'namespace';
};

/** Import created with type name, name as it imported into the code and module path. */
type AliasedSourceFileImport = BaseSourceFileImport & {
  /** Import type. */
  type: 'alias';
  /** Imported type alias name. */
  alias: string;
};

/** Package types imported in source file. */
type SourceFileImport = NamedSourceFileImport | NamespacedSourceFileImport | AliasedSourceFileImport;
// endregion

// --------------------------------------------------------
// ---------------------- Helpers -------------------------
// --------------------------------------------------------
// region Helpers

/**
 * Load target project TS configuration.
 *
 * @param configurationPath - Path to the configuration file to load.
 *
 * @returns Parsed TS configuration file object.
 */
const loadTSConfiguration = (configurationPath: string) => {
  const configFile = ts.readConfigFile(configurationPath, ts.sys.readFile);

  if (configFile.error) {
    throw new Error(`${path.basename(configurationPath)} load error: ${configFile.error.messageText}`);
  }

  return ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configurationPath));
};

/**
 * Normalize path of resource relative to the file where it used.
 *
 * @param workingDirectory - Full path to the working directory.
 * @param resourcePath - Source from which another resource accessed relatively.
 * @param resourceRelativePath - Path to the target resource which is relative to the source.
 *
 * @returns Path to the target resource which is relative to the working directory.
 */
const relativeToWorkingDirectoryPath = (
  workingDirectory: string,
  resourcePath: string,
  resourceRelativePath: string,
) => {
  const resourceFullPath = path.resolve(path.dirname(resourcePath), resourceRelativePath);
  return `.${resourceFullPath.split(workingDirectory).pop()}`;
};

// endregion

/**
 * Project package.
 *
 * Package used to aggregate definition files in the working directory.
 */
class Package {
  /** Package source files with types. */
  private readonly files: SourceFile[] = [];

  /**
   * Create package bundle.
   *
   * Create package object which contains information about types used in public interface.
   *
   * @param name - Project name.
   * @param workingDirectory - Root folder with subfolders which represent project structure and contains types definition files.
   * @param tsConfiguration - Loaded project's TS configuration
   */
  constructor(
    public readonly name: string,
    private readonly workingDirectory: string,
    private readonly tsConfiguration: ts.ParsedCommandLine,
  ) {
    this.processTypesInDirectory(workingDirectory);
  }

  /**
   * Retrieve list of type definition files identified for package.
   *
   * @returns List of type definition {@link SourceFile} instances.
   */
  get typeSourceFiles(): SourceFile[] {
    return this.files;
  }

  /**
   * Retrieve list of all external imports used in the project.
   *
   * @returns Map of imported module to the module information object.
   */
  get externalImports(): Record<string, SourceFileImport> {
    const imports: Record<string, SourceFileImport> = {};
    this.files.forEach((file) =>
      Object.entries(file.externalImports).forEach(([module, type]) => (imports[module] ??= type)),
    );
    return imports;
  }

  /**
   * Retrieve source file information for file by its path.
   *
   * @param filePath - Path to the inside of the project.
   *
   * @returns SourceFile instance or `undefined` if it can't be found at specified path.
   */
  sourceFileAtPath(filePath: string): SourceFile | undefined {
    if (filePath.startsWith('./') || filePath.startsWith('../'))
      filePath = path.resolve(this.workingDirectory, filePath);

    return this.files.find((file) => file.filePath === filePath);
  }

  /**
   * Process types in specified directory.
   *
   * @param directory - Directory inside which types and subfolder should be processed.
   */
  private processTypesInDirectory(directory: string) {
    if (!fs.existsSync(directory)) return;

    fs.readdirSync(directory).forEach((pathComponent) => {
      const resourcePath = path.join(directory, pathComponent);
      if (fs.statSync(resourcePath).isDirectory()) this.processTypesInDirectory(resourcePath);
      else {
        // TODO: IGNORE FILES IN A DIFFERENT WAY
        if (pathComponent === 'hmac-sha256.d.ts') return;
        if (!fs.existsSync(resourcePath)) return;

        // Filter out internal type definition placeholders.
        const fileContent = fs.readFileSync(resourcePath, 'utf8');
        const internalModuleMatch = fileContent.match(/^\/\*\*[\s\S]*?@internal[\s\S]*?\*\//);
        if (internalModuleMatch && internalModuleMatch.index !== undefined && internalModuleMatch.index === 0) return;

        this.files.push(new SourceFile(resourcePath, this.workingDirectory, this.tsConfiguration.options, this));
      }
    });

    // Gather type aliases.
    const aliases: Record<string, string[]> = {};
    this.files.forEach((file) => {
      file.imports
        .filter((typeImport) => typeImport.isPackageType && typeImport.type === 'alias')
        .forEach((typeImport) => {
          const { value, alias } = typeImport as AliasedSourceFileImport;
          (aliases[value] ??= []).push(alias);
        });
    });
    this.files.forEach((file) => {
      file.types
        .filter((type) => Object.keys(aliases).includes(type.name))
        .forEach((type) => aliases[type.name].forEach((alias) => type.addAlias(alias)));
    });
  }
}

/**
 * Type definition file.
 *
 * Object contain information about types and imports declared in it.
 */
class SourceFile {
  /** List of package type imports in source file */
  private readonly _imports: SourceFileImport[] = [];
  private readonly _types: TypeDefinition[] = [];

  /**
   * Create a source file from type definition file in the package.
   *
   * @param filePath - Path to the type definition file which will be analyzed.
   * @param workingDirectory - Root folder with subfolders which represent project structure and contains types definition files.
   * @param tsCompileOptions - Package's TS parsed configuration object.
   * @param projectPackage - Project with processed files information.
   */
  constructor(
    public readonly filePath: string,
    private readonly workingDirectory: string,
    private readonly tsCompileOptions: ts.CompilerOptions,
    readonly projectPackage: Package,
  ) {
    const source = this.tsSourceFile();
    this.processImports(source);
    this.processTypes(source);
  }

  /**
   * Retrieve list of imported types and modules.
   *
   * @returns List of import description objects with details about type and source file location.
   */
  get imports() {
    return this._imports;
  }

  /**
   * Retrieve list of types imported from external dependencies.
   *
   * @returns List of import description objects with details about type and source file location.
   */
  get externalImports() {
    const imports: Record<string, SourceFileImport> = {};

    this._imports
      .filter((importedType) => !importedType.isPackageType)
      .forEach((importedType) => {
        imports[importedType.value] = importedType;
      });

    return imports;
  }

  /**
   * Retrieve list of types declared in this source file.
   *
   * @returns List of pre-processed type definition object instances.
   */
  get types() {
    return this._types;
  }

  /**
   * Retrieve type definition by its name.
   *
   * @param typeName - Name of the type for which type definition should be found.
   *
   * @returns Type definition object instance or `undefined` if specified type name is not part of source file.
   */
  typeByName(typeName: string) {
    return this._types.find((type) => type.name === typeName);
  }

  /**
   * Analyze source file imports for easier types processing during type definition files merge.
   *
   * @param sourceFile - TypeScript SourceFile object with pre-processed type definition file content.
   */
  private processImports(sourceFile: ts.SourceFile) {
    const storeImport = (
      type: SourceFileImport['type'],
      module: string,
      statement: string,
      value: string,
      alias?: string,
    ) => {
      const isPackageType = module.startsWith('./') || module.startsWith('../');
      if (isPackageType) module = relativeToWorkingDirectoryPath(this.workingDirectory, this.filePath, module);
      if (type !== 'alias') this._imports.push({ type, value, module, statement, isPackageType });
      else if (alias) this._imports.push({ type, value, module, statement, isPackageType, alias });
      else throw new Error('Alias is required for alias import');
    };

    ts.forEachChild(sourceFile, (node) => {
      if (!ts.isImportDeclaration(node)) return;
      const { importClause } = node;
      if (!importClause) return;

      const moduleName = node.moduleSpecifier.getText(sourceFile).replace(/['"]/g, '');
      const statement = node.getText(sourceFile);

      // Process simple named import (import type specified with default export).
      if (importClause.name) storeImport('name', moduleName, statement, importClause.name.getText(sourceFile));

      // Check whether there is named binding specified for import or not.
      const { namedBindings } = importClause;
      if (!namedBindings) return;

      if (ts.isNamedImports(namedBindings)) {
        namedBindings.elements.forEach((element) => {
          const alias = element.name.getText(sourceFile);
          const name = element.propertyName ? element.propertyName.getText(sourceFile) : alias;
          if (name === alias) storeImport('name', moduleName, statement, name);
          else storeImport('alias', moduleName, statement, name, alias);
        });
      } else if (ts.isNamespaceImport(namedBindings) && namedBindings.name) {
        storeImport('namespace', moduleName, statement, namedBindings.name.getText(sourceFile));
      }
    });
  }

  /**
   * Analyze source file types for easier types processing during type definition files merge.
   *
   * @param sourceFile - TypeScript SourceFile object with pre-processed type definition file content.
   */
  private processTypes(sourceFile: ts.SourceFile) {
    ts.forEachChild(sourceFile, (node) => {
      if (!ts.isDeclarationStatement(node)) return;
      if (
        !ts.isClassDeclaration(node) &&
        !ts.isInterfaceDeclaration(node) &&
        !ts.isTypeAliasDeclaration(node) &&
        !ts.isEnumDeclaration(node)
      )
        return;
      if (!node.name) return;

      // Stringify node type.
      let type: TypeDefinition['type'] = 'type';
      if (ts.isClassDeclaration(node)) type = 'class';
      else if (ts.isInterfaceDeclaration(node)) type = 'interface';
      else if (ts.isEnumDeclaration(node)) type = 'enum';

      // Extract type documentation.
      const jsDocComments = ts.getJSDocCommentsAndTags(node);
      const documentation = jsDocComments.map((comment) => comment.getText(node.getSourceFile())).join('\n');
      this._types.push(
        new TypeDefinition(
          node.name.getText(sourceFile),
          type,
          this.tsSourceFile(`${documentation}\n${node.getText(sourceFile)}`),
          this,
        ),
      );
    });
  }

  /**
   * Create TypeScript source file with same path as instance but potentially different content (if passed).
   *
   * @param content - Content which should be used for source file instance instead of current file content.
   * @private
   */
  private tsSourceFile(content?: string) {
    content ??= fs.readFileSync(this.filePath, 'utf8');

    // Ensure that `default export` will be carried with type definition to the resulting definition type.
    if (content && /^export default\s[a-zA-Z]+;/gm.test(content)) {
      const matchType = /^export default\s([a-zA-Z]+);/gm.exec(content);
      if (matchType && matchType.length > 0) {
        const replaceRegexp = new RegExp(`^((declare\\s)?(enum|class|type|interface)\\s${matchType[1]})`, 'gm');
        content = content.replace(replaceRegexp, `export $1`);
      }
    }

    return ts.createSourceFile(this.filePath, content, this.tsCompileOptions.target ?? ts.ScriptTarget.ES2015, true);
  }
}

/**
 * Type definition from the source file.
 */
class TypeDefinition {
  public readonly superclass?: string;
  /** List of aliases under which type has been imported by other types. */
  private readonly aliases: string[] = [];

  constructor(
    public readonly name: string,
    public type: 'class' | 'interface' | 'type' | 'enum',
    private readonly sourceFile: ts.SourceFile,
    private readonly projectSourceFile: SourceFile,
  ) {
    if (type === 'class') {
      const match = sourceFile.getText(this.sourceFile).match(/class PubNub extends ([a-zA-Z]+)[\s|<]/) ?? [];
      if (match.length > 1) this.superclass = match[1];
    }
  }

  get filePath() {
    return this.sourceFile.fileName;
  }

  addAlias(alias: string) {
    if (!this.aliases.includes(alias)) this.aliases.push(alias);
  }

  toString(packageTypes: string[], namespace?: string): string {
    const isPackageType = (type: string) => {
      if (type.indexOf('.') === -1) return packageTypes.includes(type);
      else return packageTypes.includes(type.split('.').pop()!);
    };

    const typeReferenceTransformer = <T extends ts.Node>(context: ts.TransformationContext) => {
      const visit: ts.Visitor = (node) => {
        let replacement: ts.TypeReferenceNode | ts.ExpressionWithTypeArguments | undefined;

        if (namespace && ts.isTypeReferenceNode(node) && isPackageType(node.typeName.getText(this.sourceFile))) {
          const typeName = node.typeName.getText(this.sourceFile);
          if (namespace) {
            const reference = ts.factory.createQualifiedName(ts.factory.createIdentifier(namespace), typeName);

            replacement = ts.factory.createTypeReferenceNode(
              reference,
              node.typeArguments
                ?.map((typeArg) => ts.visitNode(typeArg, visit))
                .filter((typeArg): typeArg is ts.TypeNode => typeArg !== undefined),
            );
          }
        } else if (!namespace && ts.isTypeReferenceNode(node)) {
          const typeName = node.typeName.getText(this.sourceFile);
          let typeNamespace = namespace;
          this.projectSourceFile.imports.forEach((importType) => {
            if (importType.type === 'alias' && importType.alias === typeName && !typeNamespace)
              typeNamespace = 'PubNub';
          });
          if (typeNamespace) {
            const reference = ts.factory.createQualifiedName(ts.factory.createIdentifier(typeNamespace), typeName);

            replacement = ts.factory.createTypeReferenceNode(
              reference,
              node.typeArguments
                ?.map((typeArg) => ts.visitNode(typeArg, visit))
                .filter((typeArg): typeArg is ts.TypeNode => typeArg !== undefined),
            );
          }
        }

        if (ts.isTypeQueryNode(node)) {
          if (namespace) {
            const qualifiedName = ts.factory.createQualifiedName(
              ts.factory.createIdentifier(namespace),
              node.exprName as ts.Identifier,
            );

            return ts.factory.createTypeQueryNode(qualifiedName);
          }
        }

        // Checking whether processing superclass information or not.
        if (node.parent && ts.isHeritageClause(node.parent) && ts.isExpressionWithTypeArguments(node)) {
          const typeName = node.expression.getText(this.sourceFile);
          if (namespace) {
            let reference = node.expression;
            if (this.superclass !== typeName) {
              reference = ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(namespace), typeName);
            }

            replacement = ts.factory.createExpressionWithTypeArguments(
              reference,
              node.typeArguments
                ?.map((typeArg) => ts.visitNode(typeArg, visit))
                .filter((typeArg): typeArg is ts.TypeNode => typeArg !== undefined),
            );
          }
        }

        return replacement ?? ts.visitEachChild(node, visit, context);
      };

      return (node: T): T => ts.visitNode(node, visit) as T;
    };

    const aliasedTypeStrings: string[] = [];
    if (this.aliases.length > 0) {
      const matches = this.sourceFile
        .getText(this.sourceFile)
        .match(/^(\s*(export\s+)?(declare\s+)?(type|class|enum)\s)/gm);
      if (!matches) throw new Error(`Unable to match prefix for '${this.name}' ${this.type}`);

      this.aliases.forEach((alias) => {
        if (this.type === 'class' || this.type === 'interface' || this.type === 'enum')
          aliasedTypeStrings.push(`/** Re-export aliased type. */\nexport {${this.name} as ${alias}};\n`);
        else aliasedTypeStrings.push(`${matches[0]}${alias} = ${this.name};`);
      });
    }

    const transformed = ts.transform(this.sourceFile, [typeReferenceTransformer]);
    const formatted = ts.createPrinter().printFile(transformed.transformed[0] as ts.SourceFile);
    return aliasedTypeStrings.length === 0 ? formatted : `${formatted}\n${aliasedTypeStrings.join('\n')}`;
  }
}

class PackageTypesDefinition {
  /** Types grouped by namespaces. */
  private readonly namespaces: Record<string, { type: string; file: string }[]> = {};
  /** List of type names which is defined by package. */
  private readonly packageTypes: string[] = [];
  /** List of type names which already has been added to the output. */
  private writtenTypes: string[] = [];
  private writingPackageNamespace: boolean = false;

  /**
   * Create package types definition.
   *
   * Responsible for merged types definition generation.
   *
   * @param projectPackage - Project package object with types information.
   * @param workingDirectory - Root folder with subfolders which represent project structure and contains types definition files.
   * @param entryPoint - Path to the source file which is package's entry point and source of the public interface.
   */
  constructor(
    private readonly projectPackage: Package,
    private readonly workingDirectory: string,
    private readonly entryPoint: string,
  ) {}

  writeToFile(filePath: string) {
    this.writingPackageNamespace = false;
    const resultContent: string[] = [];
    this.writtenTypes = [];

    this.associateTypesWithNamespaces();
    this.addExternalImports(resultContent);

    // Retrieve reference to the entry point source file.
    const entryPoint = this.projectPackage.sourceFileAtPath(this.entryPoint);
    if (!entryPoint) throw new Error(`Can't load type for entry point at path: ${this.entryPoint}`);

    // Identify and add root types.
    entryPoint.types.forEach((type) => {
      this.addTypeDefinition(type, resultContent, this.projectPackage.name);

      if (type.type !== 'class' || !type.superclass) return;

      const superClassImport = entryPoint.imports.find(
        (importType) => importType.isPackageType && importType.value === type.superclass,
      );
      if (!superClassImport) return;

      const sourceFile = this.sourceFileForModule(superClassImport.module);
      if (!sourceFile) return;

      const superclassType = sourceFile.typeByName(superClassImport.value);
      if (superclassType) this.addTypeDefinition(superclassType, resultContent, this.projectPackage.name);
    });

    this.writingPackageNamespace = true;
    resultContent.push(`declare namespace ${this.projectPackage.name} {`);

    this.typeSourceFiles
      .filter((sourceFile) => sourceFile !== entryPoint)
      .forEach((sourceFile) => {
        sourceFile.types.forEach((type) => {
          this.addTypeDefinition(type, resultContent);
        });
      });

    for (const namespace in this.namespaces) {
      resultContent.push(`export namespace ${namespace} {`);
      this.namespaces[namespace].forEach((type) => {
        // Try to retrieve proper source file for imported module.
        const sourceFile = this.sourceFileForModule(type.file);
        if (!sourceFile) return;

        const typeDefinition = sourceFile.typeByName(type.type);
        if (typeDefinition) this.addTypeDefinition(typeDefinition, resultContent, undefined, true);
        // if (typeDefinition) this.addTypeDefinition(typeDefinition, resultContent, namespace, true);
      });
      resultContent.push(`}\n\n`);
    }

    resultContent.push(`}\n\nexport = ${this.projectPackage.name}`);

    prettier
      .format(resultContent.join('\n'), {
        parser: 'typescript',
        semi: true,
        printWidth: 120,
        singleQuote: true,
        trailingComma: 'all',
      })
      .then((result) => {
        fs.writeFileSync(filePath, result, 'utf-8');
      });
  }

  /**
   * Retrieve list of type source files which is specific to the entry point.
   */
  private get typeSourceFiles() {
    const files: SourceFile[] = [];
    const entryPoint = this.sourceFileForModule(this.entryPoint);
    if (!entryPoint) throw new Error(`Can't load type for entry point at path: ${this.entryPoint}`);

    const flattenImportedTypes = (sourceFile: SourceFile) => {
      sourceFile.imports
        .filter((importType) => importType.isPackageType)
        .forEach((type) => {
          const importedTypeSourceFile = this.sourceFileForModule(type.module);
          if (!importedTypeSourceFile) {
            console.warn(
              `Source file for ${type.module} is missing. File can be ignored as internal, but import is still there.`,
            );
            return;
          }

          if (!files.includes(importedTypeSourceFile)) {
            files.push(importedTypeSourceFile);
            flattenImportedTypes(importedTypeSourceFile);
          }
        });
    };
    flattenImportedTypes(entryPoint);

    return files;
  }

  /**
   * Aggregate types into corresponding namespaces.
   *
   * Some types can be imported and used through namespace import syntax and this function allows to bind types to the corresponding namespace.
   *
   * @returns Record where list of types (name and file path) stored under namespace name as key.
   */
  private associateTypesWithNamespaces() {
    const project = this.projectPackage;
    const namespacedTypes: string[] = [];

    project.typeSourceFiles.forEach((file) => {
      file.types.forEach((type) => !this.packageTypes.includes(type.name) && this.packageTypes.push(type.name));
    });

    project.typeSourceFiles.forEach((file) => {
      file.imports
        .filter((fileImport) => fileImport.isPackageType)
        .forEach((fileImport) => {
          if (fileImport.type === 'namespace') {
            if (namespacedTypes.includes(fileImport.module)) return;

            // Try to retrieve proper source file for imported module.
            const sourceFile = this.sourceFileForModule(fileImport.module);
            if (!sourceFile) return;

            namespacedTypes.push(fileImport.module);
            sourceFile.types.forEach((sourceFileType) => {
              this.namespaces[fileImport.value] = this.namespaces[fileImport.value] ?? [];
              this.namespaces[fileImport.value].push({ type: sourceFileType.name, file: fileImport.module });
            });
          } else if (namespacedTypes.includes(fileImport.module)) {
            throw new Error(`${fileImport.module} already added as namespace and can't be used separately.`);
          }
        });
    });
  }

  /**
   * Adding external imports required for the package.
   *
   * @param result - Types definition output lines.
   */
  private addExternalImports(result: string[]) {
    Object.entries(this.projectPackage.externalImports).forEach(([_, typeImport]) => {
      if (!result.includes(typeImport.statement)) result.push(typeImport.statement);
    });

    if (result.length > 1) result.push('\n\n');
  }

  private addPackageImports(imports: SourceFileImport[], result: string[]) {
    const processedSourceFiles: SourceFile[] = [];

    imports
      .filter((fileImport) => fileImport.isPackageType)
      .forEach((type) => {
        // Try to retrieve proper source file for imported module.
        const sourceFile = this.sourceFileForModule(type.module);
        if (!sourceFile) return;

        const typeDefinition = sourceFile.typeByName(type.value);
        if (typeDefinition) this.addTypeDefinition(typeDefinition, result);
        processedSourceFiles.push(sourceFile);
      });

    processedSourceFiles.forEach((sourceFile) => this.addPackageImports(sourceFile.imports, result));
  }

  private addTypeDefinition(
    typeDefinition: TypeDefinition,
    result: string[],
    namespace?: string,
    skipNamespaceCheck: boolean = false,
  ) {
    const typesCacheId = `${typeDefinition.name}-${typeDefinition.filePath}`;
    // Check whether type already has been added to the output or not.
    if (this.writtenTypes.includes(typesCacheId)) return;
    // Check whether namespace member has been added without namespace name.
    if (!skipNamespaceCheck && this.isNamespaceMember(typeDefinition)) return;

    let definition = typeDefinition.toString(this.packageTypes, namespace);

    if (this.writingPackageNamespace) {
      definition = definition.replace(/\bexport\s+(default\s+)?class\s+/gm, `export class `);
      definition = definition.replace(/\bdeclare\s+class\s+/gm, `class `);
      definition = definition.replace(/\bexport\s+declare\s+enum\s+/gm, `export enum `);
      definition = definition.replace(/\bexport\s+declare\s+abstract\s+class\s+/gm, `export abstract class `);
    } else definition = definition.replace(/\bexport\s+declare/g, 'declare');

    result.push(definition);

    this.writtenTypes.push(typesCacheId);
  }

  /**
   * Retrieve module source file.
   *
   * @param modulePath - Relative path to the module (relative to the working directory).
   */
  private sourceFileForModule(modulePath: string) {
    const project = this.projectPackage;

    // Try to retrieve proper source file for imported module.
    let sourceFile = project.sourceFileAtPath(modulePath);
    if (!sourceFile && path.extname(modulePath).length === 0) {
      sourceFile = project.sourceFileAtPath(`${modulePath}.d.ts`);
      if (!sourceFile) {
        let updatedPath = path.join(modulePath, 'index.d.ts');
        if ((modulePath.startsWith('./') || modulePath.startsWith('../')) && !updatedPath.startsWith('.'))
          updatedPath = `./${updatedPath}`;
        sourceFile = project.sourceFileAtPath(updatedPath);
      }
    }

    if (!sourceFile) {
      console.warn(
        `Source file for ${modulePath} is missing. File can be ignored as internal, but import is still there.`,
      );
    }

    return sourceFile;
  }

  /**
   * Check whether specified type is member of any known namespaces.
   *
   * @param typeDefinition - Type definition which should be checked.
   * @returns `true` in case if type has been associated with one of the namespaces.
   */
  private isNamespaceMember(typeDefinition: TypeDefinition) {
    if (Object.keys(this.namespaces).length === 0) return false;

    // Normalize type source file path.
    const extensionMatch = new RegExp(`(.d.ts|${path.extname(typeDefinition.filePath)})$`);
    let typeFilePath = typeDefinition.filePath.replace(extensionMatch, '');
    if (!typeFilePath.startsWith('./') && !typeFilePath.startsWith('../'))
      typeFilePath = `.${typeFilePath.split(this.workingDirectory).pop()!}`;

    for (const name in this.namespaces) {
      const namespace = this.namespaces[name];
      if (namespace.find((type) => type.type === typeDefinition.name && type.file === typeFilePath)) return true;
    }

    return false;
  }
}

export function syntaxKindToName(kind: ts.SyntaxKind) {
  return (<any>ts).SyntaxKind[kind];
}

// --------------------------------------------------------
// -------------------- Configuration ----------------------
// --------------------------------------------------------
// region Configuration

// Parse script launch arguments
const options = program
  .option('--package <name>', 'Name of the package to aggregate types for.')
  .option('--working-dir <path>', 'Path to the processed definition type files root directory.')
  .option('--input <path>', 'Path to the main type definition file.')
  .option('--output <path>', 'Path to the folder or filepath where aggregated type definition file should be saved.')
  .option('--ts-config <path>', "Path to the project's tsconfig.json file.")
  .parse()
  .opts();

if (options.package === undefined || options.package.length === 0) throw new Error('Package file is missing.');
if (options.workingDir === undefined || options.workingDir.length === 0)
  throw new Error('Working directory is missing.');
if (options.input === undefined || options.input.length === 0) throw new Error('Entry point file is missing.');
if (options.output === undefined || options.output.length === 0) throw new Error('Output file is missing.');
if (options.tsConfig === undefined || options.tsConfig.length === 0) throw new Error('tsconfig.json file is missing.');

const fullPathFromRelative = (relativePath: string) =>
  /^(.\/|..\/)/.test(relativePath) ? path.resolve(process.cwd(), relativePath) : relativePath;

// Processing input arguments.
const packageName = options.package;
const workingDir = fullPathFromRelative(options.workingDir);
const tsConfigFilePath = fullPathFromRelative(options.tsConfig);
const inputFilePath = fullPathFromRelative(options.input);
let outputFilePath = fullPathFromRelative(options.output);
if (path.extname(outputFilePath).length === 0)
  outputFilePath = path.resolve(outputFilePath, inputFilePath.split('/').pop()!);

// endregion

// --------------------------------------------------------
// --------------------- Processing -----------------------
// --------------------------------------------------------

const projectPackage = new Package(packageName, workingDir, loadTSConfiguration(tsConfigFilePath));
const entryPointSourceFile = projectPackage.sourceFileAtPath(inputFilePath);
if (!entryPointSourceFile) throw new Error('Entry point source file not found.');

// Files loaded into the project. Clean up working directory.
fs.rmSync(workingDir, { recursive: true, force: true });
fs.mkdirSync(workingDir);

const definition = new PackageTypesDefinition(projectPackage, workingDir, inputFilePath);
definition.writeToFile(outputFilePath);
