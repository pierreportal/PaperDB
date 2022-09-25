#!/usr/bin/env node

// chmod +x build/index.js 
import { PaperDB } from './paperDB';


console.log("Hello PaperDB!");

const db = new PaperDB("test.json");

console.log(db)
db.createCollection("users");

db.get()
