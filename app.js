const { MongoClient } = require('mongodb');
const express = require('express');

const app = express();
const uri = 'mongodb://localhost:27017';
const dbName = 'SchoolDB';

async function fetchData() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(dbName);
        const collections = await db.listCollections().toArray();
        console.log(`Number of collections (tables): ${collections.length}`);

        let data = {};
        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            const collection = db.collection(collectionName);
            const firstDocument = await collection.findOne({});
            if (firstDocument) {
                const fields = Object.keys(firstDocument);
                data[collectionName] = {
                    numberOfFields: fields.length,
                    fields: fields
                };
            } else {
                data[collectionName] = { message: 'This collection is empty.' };
            }
        }

        // Récupérer les données de la collection "students"
        const studentsCollection = db.collection('students');
        const students = await studentsCollection.find({}).toArray();
        data.students = students;

        return data;
    } catch (err) {
        console.error('Error:', err);
        return { error: 'Failed to fetch data' };
    } finally {
        await client.close();
        console.log('Connection closed');
    }
}

// Route principale
app.get('/', (req, res) => {
    res.send('Welcome to the API. Use /api/getall to fetch data.');
});

// Route API pour récupérer les données
app.get('/api/getall', async (req, res) => {
    try {
        const data = await fetchData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Lancement du serveur Express
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
