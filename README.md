# PaperDB

PaperDB is a lightweight and minimalistic document based NoSQL data base, easy to use for quick local experiments. 

## Operations 

- **Create new data base** will add a new json file in `.db/my-db-name.json`.
- **Delete data base**
- **Create collections** adds a new collection (or key) inside the json document.
- **Delete collection**

**Most of standard collections operations:** 

- insert
- find (returns a list of items, or all items if no filter provided)
- findOne (returns one item, or the first item found if many matches)
- findById
- update
- delete

## Usage

```
import { PaperDB } from 'paperdb';

const db = new PaperDB('my-db.json');

const friendSchema = {
    name: 'string',
    age: 'number',
    occupation: 'string'
};

db.collections.add('Friend', friendSchema);

db.collections.Friend.insert({
    name: 'Mary',
    age: 45,
    occupation: 'Scientist'
});
```

## Todo:

- Add an `insertMany` method
- Add an `updateMany` method
- Rethink schema validation
- Refactor
