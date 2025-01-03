export type ExamplePageA = {
    name: "ExamplePageA";
    path: "/example-page-a";
};
export type ExamplePageB = {
    name: "ExamplePageB";
    path: "/example-page-b";
    params: {
        id: string;
    };
};
export type ExamplePageC = {
    name: "ExamplePageC";
    path: "/example-page-c";
    params: {
        id: "a" | "b" | "c";
    };
};

export type ExamplePageD = {
    name: "ExamplePageD";
    path: "/example-page-d";
    params: {
        id?: string;
        mustKey: "a" | "b";
    };
};
export type Routes = ExamplePageA | ExamplePageB | ExamplePageC | ExamplePageD;

export type RoutesHasParams = Extract<Routes, { params: unknown }>;
export type PageRoute<T extends Routes["path"]> = Extract<Routes, { path: T }>;
export const createUrl = (path: Routes["path"]) => {
    return path;
};
export const createUrlWithParams = <T extends RoutesHasParams["path"]>(
    path: T,
    params: Extract<
        RoutesHasParams,
        {
            path: T;
        }
    >["params"]
) => {
    return path + "?" + new URLSearchParams(params).toString();
};

createUrlWithParams("/example-page-b", {
    id: "1"
});
createUrlWithParams("/example-page-d", {});
