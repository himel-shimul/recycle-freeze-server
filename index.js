const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.2zjbmhw.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const categories = client.db('recycleFreeze').collection('categories');


        app.get('/categories', async (req, res) =>{
            const query = {};
            const allCategories = await categories.find(query).toArray();
            res.send(allCategories);
        })
    }
    finally{

    }
}
run().catch(console.log())


app.get('/', async (req, res) =>{
    res.send('recycle ref server is running')
})

app.listen(port, () =>{
    console.log(`Server is running on: ${port}`);
})