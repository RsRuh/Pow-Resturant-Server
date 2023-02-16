const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = 'mongodb+srv://PowPow:k0otOvfo8eyJJO6g@cluster0.v8gjvac.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {

    try {
        const usersCollection = client.db('RsPowDB').collection('users');
        const foodsCollection = client.db('RsPowDB').collection('foods');
        const reviewsCollection = client.db('RsPowDB').collection('reviews');
        const bookedCollection = client.db('RsPowDB').collection('booked');

        //add user in DB
        app.post('/users', async (req, res) => {
            const userInfo = req.body;
            const result = await usersCollection.insertOne(userInfo);
            res.send(result);
        })

        //add food in DB
        app.post('/foods', async (req, res) => {
            const foodInfo = req.body;
            const result = await foodsCollection.insertOne(foodInfo);
            res.send(result);
        })

        // get food from DB 
        app.get('/foods', async (req, res) => {
            // console.log('hi');
            const category = req.query.category;
            console.log(category);
            const query = {
                $and: [{ category: category }, { status: 'available' }]
            }
            const foods = await foodsCollection.find(query).toArray();
            res.send(foods)
        })


        // get single food information 
        app.get('/food', async (req, res) => {
            const id = req.query.id;
            console.log(id);
            const query = { _id: ObjectId(id) }
            console.log(query);
            const food = await foodsCollection.findOne(query);
            res.send(food)
        })

        // get all users 
        app.get('/users', async (req, res) => {
            const query = {}
            const users = await usersCollection.find(query).toArray();
            res.send(users)
        })

        // get all food
        app.get('/dashfood', async (req, res) => {
            const query = {}
            const users = await foodsCollection.find(query).toArray();
            res.send(users)
        })

        // set review to DB 
        app.post('/reviews', async (req, res) => {
            const query = req.body;
            const cursor = await reviewsCollection.insertOne(query)
            res.send(cursor)
        })

        // get review 
        app.get('/reviews', async (req, res) => {
            const id = req.query.id;
            const query = { foodId: id };
            const result = await reviewsCollection.find(query).sort({ $natural: -1 }).toArray()
            res.send(result)
        })










        // set purchase
        app.post('/booked', async (req, res) => {
            const id = req.query.id;
            // console.log(id);
            const filter = { _id: ObjectId(id) }

            const buyinfo = req.body;
            const purchaseQuery = { foodId: buyinfo.foodId }
            // console.log(purchaseQuery);

            const purchaseFood = await bookedCollection.findOne(purchaseQuery)
            // console.log(purchaseFood);


            if (purchaseFood) {
                const updateCollection = {
                    $set: {
                        itemsNumber: purchaseFood.itemsNumber + 1
                    }
                }

                const updatedCollection = await bookedCollection.updateOne(purchaseQuery, updateCollection);
                res.send(updatedCollection)
            }

            else {
                const purchased = await bookedCollection.insertOne(buyinfo)
                res.send(purchased)
            }


            const cursor = await foodsCollection.findOne(filter)

            if (cursor.quantity > 1) {
                const updateDoc = {
                    $set: {
                        quantity: cursor.quantity - 1
                    }
                }
                const updatedResult = await foodsCollection.updateOne(filter, updateDoc);
                res.send(updatedResult)
            }
            else {
                const updateSold = {
                    $set: {
                        status: 'unavailable'
                    }
                }
                const updatedResult = await foodsCollection.updateOne(filter, updateSold);
                res.send(updatedResult)
            }


        })


        // get booked food collection
        app.get('/booked', async (req, res) => {
            const email = req.query.email;
            // console.log(email);
            const query = { customerEmail: email }
            const cursor = await bookedCollection.find(query).toArray();
            // console.log(cursor);
            res.send(cursor)
        })

        app.delete('/delete-food', async (req, res) => {
            const id = req.query.id;
            const query = { _id: ObjectId(id) }
            // console.log(query);
            const result = await bookedCollection.deleteOne(query);
            res.send(result)
        })



    }
    finally { }
}

run().catch(console.log())





app.get('/', (req, res) => {
    res.send('Rs PowPow server is running');
})
app.listen(port, () => {
    console.log(`Running on port port ${port}`);
}) 