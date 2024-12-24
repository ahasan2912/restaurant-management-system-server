require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json())
app.use(cors())

const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.jqnby.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const restaurantCollection = client.db("restaurantDB").collection('restaurant');
    const purchasesCollection = client.db("restaurantDB").collection('purchases');

    app.post('/addfood', async(req, res) => {
        const addData = req.body;
        const result = await restaurantCollection.insertOne(addData);
        res.send(addData);
    })

    app.get('/allfood', async(req, res) => {
        const cursor = restaurantCollection.find().limit(6);
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/allfoods', async(req, res) => {
        const cursor = restaurantCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/food/:id', async(req, res) => {
        try{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await restaurantCollection.findOne(query);
            res.send(result);
        }
        catch(err){
            res.send({err: true, message: err.message});
        }
    })

    //for purchases producets
    app.post('/add-purchases', async(req, res) => {
        const addPurchase = req.body;
        const result = await purchasesCollection.insertOne(addPurchase);
        res.send(result);
    })

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', async(req, res) => {
    res.send('Mongodb Server is Running');
})

app.listen(port, ()=> {
    console.log(`Server Running on Port ${port}`);
})