const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.2zjbmhw.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    // console.log('token inside verify', req.headers.authorization);
    const authHeader =  req.headers.authorization;
    if(!authHeader){
        return res.status(401).send('unauthorized access')
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'forbidden access'})
        }
        req.decoded = decoded;
        next();
    })
}


async function run(){
    try{
        const categories = client.db('recycleFreeze').collection('categories');
        const allProducts = client.db('recycleFreeze').collection('allProducts');
        const soldPd = client.db('recycleFreeze').collection('soldPD');
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
            const result = await soldPd.insertOne(soldProduct);
            res.send(result);
        });
        
        app.get('/soldProducts',verifyJWT, async (req, res) =>{
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if(email !== decodedEmail){
                return res.status(403).send({message: 'forbidden access'})
            }
            const query = {email: email};
            const soldProducts = await soldPd.find(query).toArray();
            res.send(soldProducts);
        });

        app.get('/jwt', async (req, res) =>{
            const email = req.query.email;
            const query = { email : email};
            const user = await usersCollection.findOne(query);
            if(user){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
                return res.send({accessToken: token})
            }
            res.status(403).send({accessToken: ''});
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
        });

        app.get('/users/admin/:email', async (req, res) =>{
            const email = req.params.email;
            const query = { email: email}
            const user = await usersCollection.findOne(query)
            res.send({isAdmin : user?.select === 'admin'});
        })



        app.get('/sellers', async (req, res) =>{
            // const seller = req.params.seller;
            const query = {select: "seller"};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });

        app.delete('/sellers/:id', async (req, res) =>{
            const id = req.params.id;
            const filter = {_id: ObjectId(id)}
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        })
        
        app.get('/buyers', async (req, res) =>{
            // const seller = req.params.seller;
            const query = {select: "buyer"};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });

        app.delete('/buyers/:id', async (req, res) =>{
            const id = req.params.id;
            const filter = {_id: ObjectId(id)}
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        })

        // app.get('/jwt', async(req, res) =>{
        //     const email = req.query.email;
        //     const query = {email: email}
        //     const user = await usersCollection.findOne(query);
        //     if(user){
        //         const token = jwt.sign({email}, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
        //         return res.send({accessToken: token})
        //     }
        //     res.status(403).send({accessToken: ''});
        // })
        
        app.post('/users', async (req, res) =>{
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        app.get('/advertise', async(req, res) =>{
            const query = {state: 'advertise'};
            const adProducts = await allProducts.find(query).toArray();
            res.send(adProducts);
        })

        app.put('/advertise/:id', async (req, res) =>{
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const option = {upsert: true};
            const updatedDoc = {
                $set:{
                    state: 'advertise'
                }
            }
            const result = await allProducts.updateOne(filter, updatedDoc, option);
            res.send(result)
        })

        app.put('/user/admin/:id', async (req, res) =>{
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const options = {upsert: true};
            const updatedDoc = {
                $set:{
                    status: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter,updatedDoc, options);
            res.send(result);
        })

        app.get('/myProducts', async (req, res) =>{
            let query = {};
            if(req.query.email){
                query = {
                    email: req.query.email
                }
            }
            const cursor = allProducts.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        app.delete('/allProducts/:id', async (req, res) =>{
            const id = req.params.id;
            const filter = {_id: ObjectId(id)}
            const result = await allProducts.deleteOne(filter);
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