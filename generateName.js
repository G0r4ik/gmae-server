import { faker } from '@faker-js/faker';
import db from './database.js';
export default function createAnimalName() {
    const animal = faker.animal.type();
    const userName = `
  ${animal.toUpperCase()}-${String(Math.random()).slice(2, 6)}(G)`.trim();
    const isNotUniqUserName = db
        .prepare(`SELECT * FROM "users" WHERE "user_name" = ?`)
        .get(userName);
    if (isNotUniqUserName)
        return createAnimalName();
    return userName;
}
