#!/usr/bin/env node

// chmod +x build/index.js 
import { PaperDB } from './paperDB';


const paperDB = new PaperDB('okokokok.json');


paperDB.createCollection('User');

console.log('User collection:::::');
paperDB.get()



paperDB.in.User.insert({ name: 'John', age: 20 });

paperDB.get()


console.log('find')

paperDB.in.User.find({ name: 'John' });

paperDB.in.User.find({ age: 20 });

paperDB.in.User.find({ age: 20, name: 'John' });

paperDB.in.User.findOne({ age: 20, name: 'John' });

paperDB.in.User.update({ age: 20 }, { age: 21 });

paperDB.get();

paperDB.in.User.delete({ age: 21 });

paperDB.get();
