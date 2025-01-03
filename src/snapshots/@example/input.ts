export type OptionalPageA = {
    name: "OptionalPageA";
    path: "/example-page-a";
    params: {
        /**
         * @example "123"
         */
        id?: string;
        /**
         * @example "abc"
         */
        name?: string;
    };
};
export type ExamplePageB = {
    name: "ExamplePageB";
    path: "/example-page-b";
    params: {
        /**
         * @example "123"
         */
        id: string;
        /**
         * @example "abc"
         */
        name: string;
    };
};
export type Routes = OptionalPageA | ExamplePageB;
