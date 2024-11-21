import * as ts from "typescript";
import path from "node:path";

/**
 * typeの定義から、JSとして評価できる文字列を作成する
 *
 *
 * 例: ; を , に変換する
 *
 * {
 *     name: "ExamplePageA";
 *     path: "/example-page-a";
 * }
 * ->
 * {
 *     name: "ExamplePageA",
 *     path: "/example-page-a",
 * }
 * ----
 *
 * 例) stringを"string"に変換する
 *
 * {
 *     name: "ExamplePageB";
 *     path: "/example-page-b";
 *     params: {
 *         id: string;
 *     };
 * }
 * ->
 * {
 *    name: "ExamplePageB",
 *    path: "/example-page-b",
 *    params: {
 *      id: "string"
 *    };
 * }
 * ----
 *
 * 例) union typeを最初の要素に変換する
 *
 * {
 *     name: "ExamplePageC";
 *     path: "/example-page-c";
 *     params: {
 *         id: "a" | "b" | "c";
 *     };
 * }
 * ->
 * {
 *   name: "ExamplePageC",
 *   path: "/example-page-c",
 *   params: {
 *        id: "a"
 *   }
 * }
 * ----
 *
 * 例) optional typeを削除する
 *
 * {
 *     name: "ExamplePageD";
 *     path: "/example-page-d";
 *     params: {
 *       id?: string;
 *     }
 * }
 * ->
 * {
 *    name: "ExamplePageD",
 *    path: "/example-page-d",
 *    params: {
 *
 *    }
 *  }
 * @param text
 */
function formatType(text: string) {
    // 1. ; を , に変換する
    text = text.replace(/;/g, ",");
    // 2. stringを"string"に変換する
    text = text.replace(/(\w+)\s{0,10}:\s{0,10}string/g, '"$1": "string"');
    // 3. "a" | "b" | "c" ... を"a"に変換する
    // | を見つけたら次の ; までを取得する、その中で最初の要素を取得する
    text = text.replace(/(\w+):\s?".+?\|.+?"/g, '"$1": "$2"');
    // 4. optional typeを削除する
    text = text.replace(/(\w+)\?\s{0,10}:\s{0,10}(\w+),/g, "");
    return eval(`(${text})`);
}

/** Generate documentation for all classes in a set of .ts files */
function generateDocumentation(fileNames: string[], options: ts.CompilerOptions): void {
    // Build a program using the set of root file names in fileNames
    const program = ts.createProgram(fileNames, options);
    // これがないとパーサーが起動できない
    program.getTypeChecker();
    // Get the checker, we will use it to find more about classes
    const output: {
        name: string;
        path: string;
        params: Record<string, string>;
    }[] = [];

    // Visit every sourceFile in the program
    for (const sourceFile of program.getSourceFiles()) {
        if (!sourceFile.isDeclarationFile) {
            // Walk the tree to search for classes
            ts.forEachChild(sourceFile, traverse);
        }
    }

    // print out the doc
    console.log(JSON.stringify(output, null, 2));

    return;

    /** visit nodes finding exported classes */
    function traverse(node: ts.Node) {
        visit(node);

        function visit(node: ts.Node) {
            switch (node.kind) {
                case ts.SyntaxKind.TypeAliasDeclaration: {
                    const typeLiteral = (<ts.TypeAliasDeclaration>node).type;
                    // unionは除外
                    if (typeLiteral.kind === ts.SyntaxKind.TypeLiteral) {
                        output.push(formatType(typeLiteral.getText()));
                    }
                }
            }

            ts.forEachChild(node, visit);
        }
    }
}

generateDocumentation([path.join(import.meta.dirname, "route.ts")], {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.NodeNext
});
