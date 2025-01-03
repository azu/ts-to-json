# ts-to-json

TypeScript `type` definition to JS

## Usage

Install with [npm](https://www.npmjs.com/package/ts-to-json):

    npm ci
    npm test

```ts
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
```

->

```json
[
  {
    "name": "OptionalPageA",
    "path": "/example-page-a",
    "params": {}
  },
  {
    "name": "ExamplePageB",
    "path": "/example-page-b",
    "params": {
      "id": "123",
      "name": "abc"
    }
  }
]
```


## Changelog

See [Releases page](https://github.com/azu/ts-to-json/releases).

## Running tests

Install devDependencies and Run `npm test`:

    npm test

## Contributing

Pull requests and stars are always welcome.

For bugs and feature requests, [please create an issue](https://github.com/azu/ts-to-json/issues).

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

- azu: [GitHub](https://github.com/azu), [Twitter](https://twitter.com/azu_re)

## License

MIT © azu
