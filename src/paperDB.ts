import fs from 'fs'
import path from 'path';
import { log, error, success } from './output';

export class PaperDB {

  private file: string;
  public in: any;
  private dir: string;

  constructor(fileName: string) {
    this.dir = '.db';
    this.file = this.initDB(fileName);
    this.in = {}

  }

  private initDB(fileName: string) {

    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir);
    }

    const file = path.join(this.dir, fileName);
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, '{}');
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
      return error(`Collection ${collection} not found`);
    }
    return json[collection];
  }


  public createCollection = (collectionName: string) => {

    if (typeof collectionName !== 'string') {
      return ('Collection name must be a string');
    }

    const json = this.readFile();
    if (!json) return false;

    const collName = collectionName.charAt(0).toUpperCase() + collectionName.slice(1);

    if (json[collName]) {
      return error(`Collection ${collName} already exists.`);
    }

    Object.assign(json, { [collName]: { "data": [] } });

    fs.writeFileSync(this.file!, JSON.stringify(json));

    this.in[collName] = {
      insert: (data: any) => this.insertItem(collName, data),
      find: (query: any) => this.findItems(collName, query),
      findOne: (query: any) => this.findOneItem(collName, query),
      findById: (id: string) => this.findItemById(collName, id),
      update: (query: any, data: any) => this.updateItem(collName, query, data),
      delete: (query: any) => this.deleteItem(collName, query)
    }

    return success(`Collection ${collName} created.`);
  }

  public insertItem = (collectionName: string, data: any) => {

    const json = this.readFile();
    if (!json) return false;

    if (!json[collectionName]) {
      return error(`Collection ${collectionName} not found`);
    }

    json[collectionName].data.push(data);

    fs.writeFileSync(this.file!, JSON.stringify(json));

    return success(`Item inserted in ${collectionName}.`);
  }

  public findItems = (collectionName: string, query: any) => {

    const json = this.readFile();
    if (!json) return false;
    if (!json[collectionName]) {
      return error(`Collection ${collectionName} not found.`);
    }

    const data = json[collectionName].data;

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
    return null;
  }
}

