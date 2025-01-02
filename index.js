require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.VISA_DB}:${process.env.VISA_PASS}@cluster0.zjl69.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();

    const database = client.db("visaDB");
    const visaCollection = database.collection("visa");
    const applicationCollection = database.collection("application");

    app.post('/visa', async (req, res) => {
      try {
        const newVisa = req.body;
        const result = await visaCollection.insertOne(newVisa);
        res.status(201).send(result);
      } catch (error) {
        res.status(500).send({ message: 'Error adding visa', error });
      }
    });

    app.get('/visa', async (req, res) => {
      try {
        const visa = visaCollection.find();
        const result = await visa.toArray();
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({ message: 'Error fetching visas', error });
      }
    });

    app.get('/application', async (req, res) => {
      try {
        const application = applicationCollection.find();
        const result = await application.toArray();
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({ message: 'Error fetching applications', error });
      }
    });

    app.put('/visa/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const updatedVisa = req.body;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            ...updatedVisa
          }
        };
        const result = await visaCollection.updateOne(filter, updateDoc);
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({ message: 'Error updating visa', error });
      }
    });

    app.delete('/visa/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await visaCollection.deleteOne(query);
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({ message: 'Error deleting visa', error });
      }
    });

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
  res.send('Visa server is running');
});

app.listen(port, () => {
  console.log(`Visa server is running on port ${port}`);
});
