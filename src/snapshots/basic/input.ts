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
    };
};
export type Routes = ExamplePageA | ExamplePageB | ExamplePageC | ExamplePageD;
