# Redux Shortcrud

`redux-shortcrud` is a helper package to reduce boilerplate by automatically generating all Action Creators and Reducers you need for your CRUD application.

**Not ready for production yet**

## Installation

With Yarn:

```
yarn add redux-shortcrud
```

With npm:

```
npm install redux-shortcrud
```

## API / Usage

Your generated CRUD model can be of mode `list` (default) or `map`. If your API sends entity lists as array of objects `list` is the right option for you. If your API sends an object `redux-shortcrud` expects the keys of the objects to be the unique identifiers of the entities it holds and `options.mode` set to `map`.

### Examples

Sample response for type list:

```json
[
  { "id": 1, "name": "Susan" },
  { "id": 2, "name": "Paul" },
  { "id": 3, "name": "Bob" }
]
```

Sample response of type `map`

```json
{
  "1": { "id": 1, "name": "Susan" },
  "2": { "id": 2, "name": "Paul" },
  "3": { "id": 3, "name": "Bob" }
}
```

## Options
