import fs from 'fs'
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { log, error, success } from './output';

export class PaperDB {

  private file: string;
  private dir: string;
  public collections: any;

  constructor(fileName: string) {
    this.dir = '.db';
    this.collections = {
      find: this.getCollection,
      add: this.createCollection,
      delete: this.deleteCollection,
    }
    this.file = this.initDB(fileName);
  }

  private initDB(fileName: string) {

    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir);
    }

    const file = path.join(this.dir, fileName);
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, '{}');
    } else {
      this.file = path.join(this.dir, fileName);
      const json = this.readFile();
      const collections = Object.keys(json);
      collections.forEach((collection: string) => {
        this.createCollection(collection, json[collection].schema);
      });
    }
    return file;
  }

  public useFile = (fileName: string) => {

    if (!fs.existsSync(path.join(this.dir, fileName))) {
      return error("File not found");
    }
    this.file = path.join(this.dir, fileName);
  }

  public createFile = (fileName: string) => {

    if (fs.existsSync(path.join(this.dir, fileName))) {
      return error("File already exists");
    }

    fs.writeFileSync(path.join(this.dir, fileName), '{}');
    return path.join(this.dir, fileName);
  }

  private readFile = () => {
    if (!this.file) {
      return error("No file selected");
    }
    const data = fs.readFileSync(this.file, 'utf8');
    const json = JSON.parse(data);
    return json;
  }

  public getCollection = (collection: string) => {
    const json = this.readFile();
    if (!json) return false;
    if (!json[collection]) {
      error(`Collection ${collection} not found`);
      return false;
    }
    return json[collection];
  }

  public createCollection = (collectionName: string, schema: any) => {

    if (typeof collectionName !== 'string') {
      return ('Collection name must be a string');
    }

    const json = this.readFile();
    if (!json) return false;

    const collName = collectionName.charAt(0).toUpperCase() + collectionName.slice(1);

    this.collections[collName] = {
      insert: (data: any) => this.insertItem(collName, data),
      find: (query?: any) => this.findItems(collName, query),
      findOne: (query: any) => this.findOneItem(collName, query),
      findById: (id: string) => this.findItemById(collName, id),
      update: (query: any, data: any) => this.updateItem(collName, query, data),
      delete: (query: any) => this.deleteItem(collName, query)
    }

    if (!!json[collName]) {
      error(`Collection ${collName} already exists.`);
      return false;
    }

    Object.assign(json, { [collName]: { schema, data: [] } });

    fs.writeFileSync(this.file!, JSON.stringify(json));
    return success(`Collection ${collName} created.`);
  }

  public deleteCollection = (collectionName: string) => {

    if (typeof collectionName !== 'string') {
      return ('Collection name must be a string');
    }

    const json = this.readFile();
    if (!json) return false;

    if (!json[collectionName]) {
      return error(`Collection ${collectionName} not found.`);
    }

    delete json[collectionName];

    fs.writeFileSync(this.file!, JSON.stringify(json));

    delete this.collections[collectionName];

    return success(`Collection ${collectionName} deleted.`);
  }

  private typeCheck = (schema: any, data: any) => {

    const schemaKeys = Object.keys(schema);
    const dataKeys = Object.keys(data);

    const errors: Array<string> = [];

    if (schemaKeys.length !== dataKeys.length) {
      error("Data does not match schema");
      return false;
    }

    for (let i = 0; i < schemaKeys.length; i++) {
      const key = schemaKeys[i];
      const schemaType = schema[key];
      const valueType = typeof data[key];

      if (schemaType !== valueType) {
        errors.push(`Type error: ${key} should be a ${schemaType}`);
      }
    }
    if (errors.length > 0) {
      error(errors.join(", "));
      return false;
    }
    return true;
  }


  public insertItem = (collectionName: string, data: any) => {

    const json = this.readFile();
    if (!json) return false;

    if (!json[collectionName]) {
      return error(`Collection ${collectionName} not found`);
    }

    const typeChecking = this.typeCheck(json[collectionName].schema, data);

    if (!typeChecking) {
      return error("Data does not match schema");
    }

    json[collectionName].data.push({ ...data, id: uuidv4() });

    fs.writeFileSync(this.file!, JSON.stringify(json));

    return success(`Item inserted in ${collectionName}.`);
  }

  public insertManyItems = (collectionName: string, data: Array<any>) => {

    const json = this.readFile();
    if (!json) return false;

    if (!json[collectionName]) {
      return error(`Collection ${collectionName} not found`);
    }

    const typeChecking = data.every((item: any) => this.typeCheck(json[collectionName].schema, item));

    if (!typeChecking) {
      return error("Data does not match schema");
    }

    json[collectionName].data.push(...data.map((item: any) => ({ ...item, id: uuidv4() })));

    fs.writeFileSync(this.file!, JSON.stringify(json));

    return success(`${data.length} items inserted in ${collectionName}.`);
  }

  public findItems = (collectionName: string, query?: any) => {

    const json = this.readFile();
    if (!json) return false;
    if (!json[collectionName]) {
      return error(`Collection ${collectionName} not found.`);
    }

    const data = json[collectionName].data;

    if (!query) {
      return success(data);
    }

    const key = Object.keys(query)[0];

    const result = data.filter((item: any) => {
      return item[key] === query[key];
    });

    log(`${result.length} item(s) found in ${collectionName}.`);
    return success(result);
  }

  public findOneItem = (collectionName: string, query: any) => {

    const json = this.readFile();
    if (!json) return false;
    if (!json[collectionName]) {
      return error(`Collection ${collectionName} not found.`);
    }

    const data = json[collectionName].data;

    const key = Object.keys(query)[0];

    const result = data.find((item: any) => {
      return item[key] === query[key];
    });

    log(`Item found in ${collectionName}.`);
    return success(result);
  };

  public findItemById = (collectionName: string, id: string) => this.findOneItem(collectionName, { key: "id", value: id });

  public updateItem = (collectionName: string, query: any, data: any) => {

    const json = this.readFile();
    if (!json) return false;

    if (!json[collectionName]) {
      return error(`Collection ${collectionName} not found.`);
    }

    const collection = json[collectionName].data;

    const item = collection.find((item: any) => item[query.key] === query.value);

    if (!item) {
      return error(`Item not found in ${collectionName}.`);
    }

    const index = collection.indexOf(item);

    json[collectionName].data[index] = { ...item, ...data };
    fs.writeFileSync(this.file!, JSON.stringify(json));

    return log(`Item updated in ${collectionName}.`);
  }

  public deleteItem = (collectionName: string, query: any) => {

    const json = this.readFile();
    if (!json) return false;

    if (!json[collectionName]) {
      return error(`Collection ${collectionName} not found.`);
    }

    const collection = json[collectionName].data;
    const item = collection.find((item: any) => item[query.key] === query.value);
    if (!item) {
      return error(`Item not found in ${collectionName}.`);
    }

    const index = collection.indexOf(item);
    json[collectionName].data.splice(index, 1);
    fs.writeFileSync(this.file!, JSON.stringify(json));

    return success(`Item deleted in ${collectionName}.`);
  }

  public get() {
    const json = this.readFile();
    if (!json) return false;

    console.log(json);
    return json;
  }
}

