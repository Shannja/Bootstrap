const { MongoClient } = require('mongodb');
async function dbInit() {
    //? Connecting to mongodb
    const uri = "mongodb+srv://admin:shanshan2014@nodelogincluster.n1zawsj.mongodb.net/sample_airbnb?retryWrites=true&w=majority"
    const client = new MongoClient(uri);
    try {
        await client.connect();
        await listDatabases(client);
    } catch (e) {
        console.log(e)
    }
    finally {
        await client.close();
    }
};

async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};
module.exports = dbInit