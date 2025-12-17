// MongoDB initialization script
// This runs automatically when MongoDB starts for the first time

// Create database
db = db.getSiblingDB('todoapp');

// Create collections (they will be created automatically when data is inserted)
db.createCollection('users');
db.createCollection('posts');

print('MongoDB initialized for Todo App');
