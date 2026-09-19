import assert from 'assert';
import path from 'path';
import * as ts from 'typescript';

describe('published TypeScript declarations', () => {
  it('type-checks the complete public bundle without skipLibCheck', function () {
    this.timeout(30000);

    const program = ts.createProgram([path.resolve(__dirname, '../../lib/types/index.d.ts')], {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      strict: true,
      skipLibCheck: false,
      noEmit: true,
      types: ['node'],
    });
    const diagnostics = ts.getPreEmitDiagnostics(program);

    assert.strictEqual(
      diagnostics.length,
      0,
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCanonicalFileName: (fileName) => fileName,
        getCurrentDirectory: () => process.cwd(),
        getNewLine: () => '\n',
      }),
    );
  });
});
