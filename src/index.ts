#!/usr/bin/env node

// chmod +x build/index.js 
import { PaperDB } from './paperDB';

console.log("Hello PaperDB!");

const db = new PaperDB("test.json");

const UserSchema = {
  name: 'string',
  age: 'number',
};
const PostSchema = {
  title: 'string',
  date: 'string',
};

db.collections.add("Users", UserSchema);
db.collections.add("Posts", PostSchema);


db.get()

db.collections.Users.insert({ name: "John", age: 20 });
db.collections.Posts.insert({ title: "Jane post", date: "2020-01-01" });

db.collections.Users.insert({ name: "John" });

db.get()

