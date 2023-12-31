const express = require('express');
const cors = require('cors');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yj4hdna.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect();

        const carCollection = client.db('littleCars').collection('cars');


        // const indexKeys = { name: 1 };
        // const indexOptions = { name: "toyName" };
        // const result = await carCollection.createIndex(indexKeys, indexOptions)

        app.get('/cars', async (req, res) => {
            const cursor = carCollection.find();
            const result = await cursor.limit(20).toArray();
            res.send(result);
        })

        app.get('/cars/:text', async (req, res) => {
            const text = req.params.text;
            const result = await carCollection.find(
                {
                    name: { $regex: text, $options: "i" }

                }).toArray();
            res.send(result);
        })

        app.post('/addtoy', async (req, res) => {
            const body = req.body;
            const result = await carCollection.insertOne(body);
            res.send(result);
        })

        // to get user's added toy informations
        app.get('/mytoys/:email', async (req, res) => {
            const toys = await carCollection.find({
                email: req.params.email,
            }).toArray();
            res.send(toys)
        })

        // to get my toy's data according to price in descending order
        app.get('/sortToysDescend/:email', async (req, res) => {
            const toys = await carCollection.find({
                email: req.params.email,
            }).sort({ price: -1 }).toArray();
            res.send(toys)
        })

        // to get my toy's data according to price in ascending order
        app.get('/sortToysAscend/:email', async (req, res) => {
            const toys = await carCollection.find({
                email: req.params.email,
            }).sort({ price: 1 }).toArray();
            res.send(toys)
        })

        // to get information of a specific toy
        app.get('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await carCollection.findOne(query);
            res.send(result);
        })

        app.get('/allToysByCategory/:category', async (req, res) => {
            const toys = await carCollection.find({
                subCategory: req.params.category,
            }).toArray();
            res.send(toys)
        })

        app.get('/updatedtoy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await carCollection.findOne(query);
            res.send(result)
        })

        app.put('/updatedtoy/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };

            const updatedToy = req.body;
            const toy = {
                $set: {
                    price: updatedToy.price,
                    quantity: updatedToy.quantity,
                    details: updatedToy.details
                }
            }

            const result = await carCollection.updateOne(filter, toy, options);
            res.send(result);
        })

        app.delete('/mytoys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await carCollection.deleteOne(query);
            res.send(result)
        })




        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Server is running');
})

app.listen(port, () => {
    console.log(`Server is running on port:${port} `)
})