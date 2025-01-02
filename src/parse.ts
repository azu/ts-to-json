import * as ts from "typescript";
import path from "node:path";
import { isLiteralTypeNode, isStringLiteral, isTypeLiteralNode, isTypeNode, isUnionTypeNode } from "typescript";

const valueOfNode = (node: ts.Node) => {
    // LiteralType > StringLiteral
    if (isLiteralTypeNode(node) && isStringLiteral(node.literal)) {
        return node.literal.text;
    }
    // string keyword
    if (isTypeNode(node) && node.kind === ts.SyntaxKind.StringKeyword) {
        return "string";
    }
    //  UnionType
    if (isUnionTypeNode(node)) {
        return node.types.map((type) => {
            // is string keyword
            if (type.kind === ts.SyntaxKind.StringKeyword) {
                return "string";
            }
            if (isLiteralTypeNode(type) && isStringLiteral(type.literal)) {
                return type.literal.text;
            }
            return undefined;
        });
    }
    // TypeLiteral
    if (isTypeLiteralNode(node)) {
        return getObjectValueFromTypeLiteral(node as ts.TypeLiteralNode);
    }
    return undefined;
};
// 再起的にmembersの値を取得して、オブジェクトにする
// "a" | "b" | "c" は ["a", "b", "c"] に変換する
// name: "ExamplePageB" は { name: "ExamplePageB" } に変換する
// params: { id: "string" } は { params: { id: "string" } } に変換する
const getObjectValueFromTypeLiteral = (node: ts.TypeLiteralNode): Record<string, unknown> => {
    const members = node.members.map((member) => {
        const isOptional = member.questionToken !== undefined;
        if (isOptional) {
            return undefined;
        }
        return {
            name: member.name?.getText(),
            // @ts-expect-error -- type
            value: valueOfNode(member.type) as string | string[] | Record<string, string> | undefined
        };
    });
    return Object.fromEntries(
        members.filter((member) => member !== undefined).map((member) => [member.name, member.value])
    );
};

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
                        const result = getObjectValueFromTypeLiteral(typeLiteral as ts.TypeLiteralNode);
                        console.log(result);
                        // output.push(formatType(typeLiteral.getText()));
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
