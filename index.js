const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000

//middleware
app.use(cors({
    origin: [
      "http://localhost:5173",
      "https://spicyking-4c20c.web.app",
      "https://spicyking-4c20c.firebaseapp.com",
    ],
    credentials: true,
  }))
app.use(express.json())
app.use(cookieParser())



const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.ythezyh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "Invalid" })
  }
  jwt.verify(token, process.env.TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({message: 'unauthorize Access'})
    }
    req.user = decoded;
    next();
  });
}



async function run() {
  try {
    
  const foodCollection = client.db("DB_food").collection("food");
  const imagesCollection = client.db("DB_food").collection('images');
  const userCollection = client.db("DB_food").collection('user');
  const purchaseCollection = client.db("DB_food").collection('purchase');
  
  app.post('/jwt', async (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, process.env.TOKEN, { expiresIn: '7h' });
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      })
      .send({ success: true });
  })
    
    
  app.post("/logout", async (req, res) => {
    
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 0,
    })
    .send({ success: true })
  });

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

  app.get('/food/search', async (req, res) => {
    const search = req.query.search;
    const query = {
      name: {$regex : search, $options : 'i'},
    }
    const courser = foodCollection.find(query);
    const result = await courser.toArray();
    res.send(result)
  })
    
  
    
    
  app.post('/purchase', async (req, res) => {
    const purchaseProduct = req.body;
    const quantity = purchaseProduct.quantity;
    const { name, userEmail, price, origin, date, buyer } = purchaseProduct;

    const result = await purchaseCollection.updateOne(
      {
        name : name,
        userEmail: userEmail,
        price: price,
        origin: origin,
        date: date,
        buyer: buyer,
      },
      { $inc: { quantity: quantity } },
      { upsert: true }
    );
    res.send(result)

  })
    
   
    
  app.get('/purchaseUserEmail/:email',  async (req, res) => {
    const email = req.params.email;
    const query = { userEmail: email };
    const courser = purchaseCollection.find(query);
    const result = await courser.toArray();
    res.send(result)
  })
  
  app.delete('/purchase/delete/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await purchaseCollection.deleteOne(query);
    res.send(result);
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
    
  app.get('/sportByEmail/:email', verifyToken, async (req, res) => {
    const email = req.params.email;
    const query = {'buyer.email': email};
    const courser = foodCollection.find(query);
    const result = await courser.toArray();
    res.send(result)
  })
    
    
    
  app.patch('/update/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const option = { upsert: true };
    const updateProduct = req.body;
    const food = {
      $set:{
        name: updateProduct.name,
        category: updateProduct.category,
        price: updateProduct.price,
        quantity: updateProduct.quantity,
        origin: updateProduct.origin,
        photo: updateProduct.photo,
        desc: updateProduct.desc,
      }
    }
    const result = await foodCollection.updateOne(filter, food, option)
    res.send(result);

  })

    
    
  app.delete('/delete/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await foodCollection.deleteOne(query);
    res.send(result);
  })

    
  
  app.get('/images', async (req, res) => {
    const courser = imagesCollection.find();
    const result = await courser.toArray();
    res.send(result)
  })
    
    
  app.post('/user', async (req, res) => {
    const newUser = req.body;
    //console.log(newUser);
    const result = await userCollection.insertOne(newUser);
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