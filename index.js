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
        const search = req.query.search;
        let options = {};
        let query ={
          fName:
          {
            $regex: search,
            $options: 'i',
          },
        };
        const cursor = restaurantCollection.find(query, options);
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

    //My Posted Foods or Admin Posted Food for specific email
    app.get('/allFoods/:email', async(req, res) => {
      const email = req.params.email;
      const query = {email: email};
      const result = await restaurantCollection.find(query).toArray();
      res.send(result);
    })

    //update Posted Food
    app.patch('/postUpdate/:id', async(req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const { fName, photo, category, quantity, price, origin, description } = updateData;
      const query = {_id: new ObjectId(id)}
      const update = {
        $set: {
          fName: fName,
          photo: photo,
          category: category,
          quantity: quantity,
          price: price,
          origin: origin,
          description: description
        }
      }
      const result = await restaurantCollection.updateOne(query,update);
      res.send(result);
    })

    //Added Food Delete
    app.delete('/postedDelete/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await restaurantCollection.deleteOne(query);
      res.send(result);
    })

    //for purchases producets
    app.post('/add-purchases', async(req, res) => {
        const addPurchase = req.body;
        const result = await purchasesCollection.insertOne(addPurchase);
        res.send(result);
    })

    //for orderlist
    app.get('/myFoodOrder/:email',async (req, res) => {
      const email = req.params.email;
      const query = {userEmail: email};
      const result = await purchasesCollection.find(query).toArray();
      res.send(result);
    });

    //delete order for specific item
    app.delete('/deleleList/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await purchasesCollection.deleteOne(query);
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