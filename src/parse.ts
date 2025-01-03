import * as ts from "typescript";
import {
    isJSDoc,
    isLiteralTypeNode,
    isStringLiteral,
    isTypeLiteralNode,
    isTypeNode,
    isUnionTypeNode,
    JSDoc,
    JSDocTag
} from "typescript";

const DEFAULT_VALUES = {
    STRING_KEYWORD: "string"
};

const valueOfNode = (node: ts.Node) => {
    // LiteralType > StringLiteral
    if (isLiteralTypeNode(node) && isStringLiteral(node.literal)) {
        return node.literal.text;
    }
    // string keyword
    if (isTypeNode(node) && node.kind === ts.SyntaxKind.StringKeyword) {
        return DEFAULT_VALUES.STRING_KEYWORD;
    }
    //  UnionType - use the first type
    if (isUnionTypeNode(node)) {
        const firstUnionType = node.types[0];
        return valueOfNode(firstUnionType);
    }
    // TypeLiteral
    if (isTypeLiteralNode(node)) {
        return getObjectValueFromTypeLiteral(node as ts.TypeLiteralNode);
    }
    return undefined;
};
/**
 * unquote string
 * @example
 * stringLiteralToValue("'string'") // "string"
 * @param rawStr
 */
const stringLiteralToValue = (rawStr?: string): string | undefined => {
    if (!rawStr) return undefined;
    // remove quotes without eval
    return rawStr.replace(/['"]+/g, "");
};
/**
 * get @example value from JSDoc
 * @example
 * // @example "example"
 * getExampleValueFromJSDoc(comment) // "example"
 * @param comment
 */
const getExampleValueFromJSDoc = (comment: readonly (JSDoc | JSDocTag)[]) => {
    let exampleValue: string | undefined;
    for (const tag of comment) {
        if (isJSDoc(tag)) {
            const exampleTag = tag.tags?.find((tag) => {
                return tag.tagName.escapedText === "example";
            });
            if (exampleTag) {
                exampleValue = stringLiteralToValue(exampleTag.comment?.toString()) ?? undefined;
            }
        } else {
            if (tag.tagName.escapedText === "example") {
                exampleValue = stringLiteralToValue(tag.getText());
            }
        }
    }
    return exampleValue;
};
const getObjectValueFromTypeLiteral = (node: ts.TypeLiteralNode): Record<string, unknown> => {
    const members = node.members.map((member) => {
        const isOptional = member.questionToken !== undefined;
        if (isOptional) {
            return undefined;
        }
        const comment = ts.getJSDocCommentsAndTags(member);

        const exampleValue = getExampleValueFromJSDoc(comment);
        return {
            name: member.name?.getText(),
            // @ts-expect-error -- type
            value: exampleValue ?? (valueOfNode(member.type) as string | string[] | Record<string, string> | undefined)
        };
    });
    return Object.fromEntries(
        members.filter((member) => member !== undefined).map((member) => [member.name, member.value])
    );
};

// Get the checker, we will use it to find more about classes
export type ParsedOutput = {
    name: string;
    path: string;
    params?: Record<string, string>;
};

const validateOutput = (output: Record<string, unknown>): output is ParsedOutput => {
    return output.name !== undefined && output.path !== undefined;
};

/**
 * Parse routes from TypeScript files
 * @example
 * ```ts
 * type AboutPage = {
 *  name: "AboutPage";
 *  path: "/about";
 *  params: {
 *    /** @example "12345" *\/
 *    id: string;
 *  };
 * }
 * ```
 * ->
 * ```json
 * {
 *  name: "AboutPage",
 *  path: "/about",
 *  params: {
 *   id: "12345"
 *  }
 * }
 * @param fileNames
 * @param options
 */
export function parseRoutes(fileNames: string[], options: ts.CompilerOptions): ParsedOutput[] {
    // Build a program using the set of root file names in fileNames
    const program = ts.createProgram(fileNames, options);
    // @ts-expect-error -- require to parse the AST, but this result is not used
    const _ = program.getTypeChecker();

    const output: ParsedOutput[] = [];

    // Visit every sourceFile in the program
    for (const sourceFile of program.getSourceFiles()) {
        if (!sourceFile.isDeclarationFile) {
            // Walk the tree to search for classes
            ts.forEachChild(sourceFile, traverse);
        }
    }

    return output;

    /** visit nodes finding exported classes */
    function traverse(node: ts.Node) {
        visit(node);

        function visit(node: ts.Node) {
            switch (node.kind) {
                // type XxxxPage = { ...} のみを対象にする
                case ts.SyntaxKind.TypeAliasDeclaration: {
                    const typeName = (node as ts.TypeAliasDeclaration).name.getText();
                    const typeLiteral = (node as ts.TypeAliasDeclaration).type;
                    if (typeName.includes("Page") && isTypeLiteralNode(typeLiteral)) {
                        const result = getObjectValueFromTypeLiteral(typeLiteral as ts.TypeLiteralNode);
                        if (!validateOutput(result)) {
                            console.warn("Invalid output", result);
                            return;
                        }
                        output.push(result);
                    }
                }
            }
            ts.forEachChild(node, visit);
        }
    }
}
