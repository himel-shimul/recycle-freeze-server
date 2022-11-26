const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.2zjbmhw.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const categories = client.db('recycleFreeze').collection('categories');
        const allProducts = client.db('recycleFreeze').collection('allProducts');
        const soldProductsCollection = client.db('recycleFreeze').collection('soldProducts');
        const usersCollection = client.db('recycleFreeze').collection('users');


        app.get('/categories', async (req, res) =>{
            const query = {};
            const allCategories = await categories.find(query).toArray();
            res.send(allCategories);
        });

        app.get('/allProducts', async (req, res) =>{
            const query = {};
            const allProduct = await allProducts.find(query).toArray();
            res.send(allProduct);
        });

        app.post('/allProducts', async (req, res) =>{
            const query = req.body;
            console.log(query);
            const result = await allProducts.insertOne(query);
            res.send(result);
        });

        app.get('/products/:id', async (req, res) =>{
            const id = req.params.id;
            const query = { cat_id: id};
            const products = await allProducts.find(query).toArray();
            res.send(products)
        });

        app.post('/soldProducts', async (req, res) =>{
            const soldProduct = req.body;
            console.log(soldProduct);
            const result = await soldProductsCollection.insertOne(soldProduct);
            res.send(result);
        });
        
        app.get('/soldProducts', async (req, res) =>{
            const email = req.query.email;
            const query = {email: email};
            const soldProducts = await soldProductsCollection.find(query).toArray();
            res.send(soldProducts);
        });

        app.get('/jwt', async (req, res) =>{
            const email = req.query.email;
            const query = { email : email};
            const user = await usersCollection.findOne(query);
            console.log(user);
            res.send({accessToken: 'token'})
        })

        app.get('/users', async (req, res) =>{
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });

        app.get('/users/seller/:email', async (req, res) =>{
            const email = req.params.email;
            const query = { email: email}
            const user = await usersCollection.findOne(query)
            res.send({isSeller : user?.select === 'seller'});
        })

        app.post('/users', async (req, res) =>{
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
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