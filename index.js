const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000

//middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.ythezyh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        
        const foodCollection = client.db("DB_food").collection("food");
        const imagesCollection = client.db("DB_food").collection('images')

            app.post('/food', async (req, res) => {
                  const newProduct = req.body;
                  const result = await foodCollection.insertOne(newProduct);
                  res.send(result)
            })

            app.get('/food', async (req, res) => {
                  const courser = foodCollection.find();
                  const result = await courser.toArray();
                  res.send(result)
            })


            app.get('/food/:id', async (req, res) => {
                  const id = req.params.id;
                  const query = { _id: new ObjectId(id) };
                  const result = await foodCollection.findOne(query);
                  res.send(result);
            })
            app.get('/purchase/:id', async (req, res) => {
                  const id = req.params.id;
                  const query = { _id: new ObjectId(id) };
                  const result = await foodCollection.findOne(query);
                  res.send(result);
            })


      app.get('/images', async (req, res) => {
        const courser = imagesCollection.find();
        const result = await courser.toArray();
        res.send(result)
      })
        




    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})