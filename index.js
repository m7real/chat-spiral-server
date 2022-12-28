const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// mongoDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wo3xvdt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    const userCollection = client.db("chatSpiral").collection("users");

    // save new user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const email = user.email;
      const query = {
        email: email,
      };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ acknowledged: true });
      }

      const result = await userCollection.insertOne(user);
      res.send(result);
    });
  } finally {
        // prettier-ignore
    }
}

run().catch((err) => console.error(err));

// test APIs
app.get("/", (req, res) => {
  res.send("Chat Spiral Server Running");
});

app.listen(port, () => {
  console.log(`Chat Spiral Server Running On Port ${port}`);
});
