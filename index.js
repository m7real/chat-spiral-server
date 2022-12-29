const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const { query } = require("express");
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
    const messageCollection = client.db("chatSpiral").collection("messages");
    const chatCollection = client.db("chatSpiral").collection("chats");

    // TODO: JWT token will be implemented soon...

    // get all chats
    app.get("/chats", async (req, res) => {
      const userEmail = req.query.email;

      const query = {
        "users.email": userEmail,
      };

      const chats = await chatCollection.find(query).toArray();
      res.send(chats);
    });

    // create chat (access)
    app.post("/chats", async (req, res) => {
      const { from, to } = req.body;
      const fromEmail = from?.email;
      const toEmail = to?.email;

      // users: { $elemMatch: { $eq: fromEmail } } }, { users: { $elemMatch: { $eq: toEmail } }

      // {"EmployeeDetails.EmployeeName":"David","EmployeeDetails.EmployeeEmail":"david@gmail.com"}
      const q = {
        // isGroupChat:false,
        "users.email": fromEmail,
        "users.email": toEmail,
      };

      const query = {
        $and: [{ users: { $elemMatch: { email: fromEmail } } }, { users: { $elemMatch: { email: toEmail } } }],
      };

      const chat = await chatCollection.find(query).toArray();

      if (chat.length > 0) {
        res.send(chat[0]);
      } else {
        const chatData = {
          chatName: "sender",
          isGroupChat: false,
          users: [from, to],
        };

        const createdChat = await chatCollection.insertOne(chatData);
        const newFullChat = await chatCollection.findOne({ _id: createdChat.insertedId });

        res.send(newFullChat);
      }
    });

    // create group chat
    app.post("/chats/group", async (req, res) => {
      // -----------
    });

    // get user(s)
    app.get("/users", async (req, res) => {
      const userEmail = req.query.user;
      const searchEmail = req.query.search;
      if (userEmail === searchEmail) {
        return res.send([]);
      }
      let query = { email: searchEmail } || {};

      // best-practice: use JWT to exclude current users data from this result
      // ...find(query).filter({email:{$ne: req.decoded.email}}).toArr...
      const users = await userCollection.find(query).toArray();
      res.send(users);
    });

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
