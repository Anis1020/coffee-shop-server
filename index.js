const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

//middlewares
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.l8qzz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const coffeeCollection = client.db("coffeeDB").collection("coffee");
    const coffeeUsersCollection = client
      .db("coffeeUsersDB")
      .collection("users");

    //users related api ------------------------------
    app.get("/users", async (req, res) => {
      const user = coffeeUsersCollection.find();
      const result = await user.toArray();
      res.send(result);
    });
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await coffeeUsersCollection.insertOne(user);
      res.send(result);
    });

    //coffee related api -----------------------------
    app.get("/coffees", async (req, res) => {
      const coffeeData = coffeeCollection.find();
      const result = await coffeeData.toArray();
      res.send(result);
    });
    app.get("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.findOne(query);
      res.send(result);
    });

    app.post("/coffees", async (req, res) => {
      const data = req.body;
      const result = await coffeeCollection.insertOne(data);
      res.send(result);
    });
    app.put("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const coffeeId = { _id: new ObjectId(id) };
      const coffeeData = req.body;
      const options = { upsert: true };
      const filter = {
        $set: {
          name: coffeeData.name,
        },
      };
      const result = await coffeeCollection.updateOne(
        coffeeId,
        filter,
        options
      );
      res.send(result);
    });

    app.delete("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("coffee server");
});
app.listen(port, () => {
  console.log(`server is running at ${port} port`);
});
