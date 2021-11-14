const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId

// secure mongodb username and password
require('dotenv').config()

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sos5z.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// console.log(uri)

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try {
        await client.connect();
        console.log('connected to database')
  
      const database = client.db('travelServices');
      const servicesCollection = database.collection('services');
      const bookingsCollection = client.db("travelServices").collection("bookings");

    //   add services
    app.post('/addServices', async(req , res) => {
        const result = await servicesCollection.insertOne(req.body);
        res.send(result)
        console.log(result)
    })

    // get all services
    app.get('/allServices' , async(req , res) =>{
        const cursor = servicesCollection.find({});
        const services = await cursor.toArray();
        res.send(services)
      })

    //get single service
      app.get('/services/:id' , async(req , res) =>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const service = await servicesCollection.findOne(query);
        res.send(service)
      }) 


      // delete service
    app.delete('/deleteService/:id' , async(req , res) => {
      const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const result = await servicesCollection.deleteOne(query);
        
        res.send(result);
    })

    // confirm order
    app.post('/confirmOrder' , async(req , res) => {
      const result = await bookingsCollection.insertOne(req.body);
      res.send(result)
    })

    // my confirmOrder
    app.get('/myOrders/:email' , async(req , res) => {
      const result = await bookingsCollection.find({email: req.params.email}).toArray();
      res.send(result)
    })

    // delete order
    app.delete('/cancelOrder/:id' , async(req , res) => {
      const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const result = await bookingsCollection.deleteOne(query);
        res.send(result);
    })

    // all orders
    app.get('/allOrders' , async(req , res) => {
      const result = await bookingsCollection.find({}).toArray();
      res.send(result);
    })

    //  update status
    app.put('/updateStatus/:id' , async(req , res) => {
      const id = req.params.id;
      const updatedStatus = req.body.status;
      // console.log(updatedStatus)
      const filter = {_id: ObjectId(id)};
      const options = {upsert: true};
      const updateDoc = {
        $set: {
          status: updatedStatus
        },
      };
      const result = await bookingsCollection.updateOne(filter , updateDoc , options)
      
      res.json(result)
    })
      
    }
  
    finally{
      //   await client.close();
    }
  }

  run().catch(console.dir);

app.get('/' , (req , res) => {
    res.send('Running travel server')
})

app.listen(port , () =>{
    console.log('Running tarvel port server' , port)
})