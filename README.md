# DBFFile

### Summary

Read and write .dbf (dBase IV) files in Node.js:

- Supports `C` (string) , `N` (numeric) , `I` (integer) , `L` (logical), `D` (date), and `M` field types
- Can open an existing .dbf file
  - Can access all field descriptors
  - Can access total record count
  - Can read records in arbitrary-sized batches
  - Supports very large files
  - Can access memo fields from the associated memo file
- Can create a new .dbf file
  - Can use field descriptors from a hash of from another instance
  - If memo fields are present it will create the memo file, if necessary
- Can append records to an existing .dbf file
  - Supports very large files
  - Appending a memo field will append it to the memo file and set the memo field (block index) in the .dbf file
- All operations are asyncronous and return a promise

### Installation

`npm install dbffile`

### Example: reading a .dbf file

```javascript
var DBFFile = require('dbffile');

DBFFile.open('[full path to .dbf file]')
    .then(dbf => {
        console.log(`DBF file contains ${dbf.recordCount} rows.`);
        console.log(`Field names: ${dbf.fields.map(f => f.name)}`);
        return dbf.readRecords(100);
    })
    .then(rows => rows.forEach(row => console.log(row)))
    .catch(err => console.log('An error occurred: ' + err));
```

### Example: writing a .dbf file

```javascript
var DBFFile = require('dbffile');

var fieldDescriptors = [
    { name: 'fname', type: 'C', size: 255 },
    { name: 'lname', type: 'C', size: 255 },
    { name: 'facts', type: 'M', size: 10 }
];

var rows = [
    { fname: 'Joe', lname: 'Bloggs', facts: 'Born and raised in Someplace, Alabama' },
    { fname: 'Mary', lname: 'Smith', memo: 'Loves knitting and crocheting' },
];

DBFFile.create('[full path to .dbf file]', fieldDescriptors)
    .then(dbf => {
        console.log('DBF file created.');
        return dbf.append(rows);
    })
    .then(() => console.log(rows.length + ' rows added.'))
    .catch(err => console.log('An error occurred: ' + err));
```

### API

The module exports two functions and a class, as follows:

```typescript

/** Open an existing DBF file. */
function open(path: string): Promise<DBFFile>;


/** Create a new DBF file with no records. */
function create(path: string, fields: Field[]): Promise<DBFFile>;


/** Represents a DBF file. */
class DBFFile {

    /** Full path to the DBF file. */
    path: string;

    /** Total number of records in the DBF file (NB: includes deleted records). */
    recordCount: number;

    /** Metadata for all fields defined in the DBF file. */
    fields: { name: string; type: string; size: number; decs: number; }[];

    /** Append the specified records to this DBF file. */
    append(records: any[]): Promise<DBFFile>;

    /** read some specific rows from the dbf file. **/
    readRecords(maxRows?: number): Promise<any[]>;
}
```
