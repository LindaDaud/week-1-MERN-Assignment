const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";

const dbName = "plp_bookstore";
const collectionName = "books";

async function runQueries() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to Database");

    const db = client.db(dbName);
    const books = db.collection(collectionName);

    // ---------------------------
    // Task 1 & 2: Basic Queries
    // ---------------------------

    const genre = "Fiction";
    console.log(`\n Books in genre '${genre}':`);
    console.log(await books.find({ genre }).toArray());

    const year = 1910;
    console.log(`\n Books published after ${year}:`);
    console.log(await books.find({ published_year: { $gt: year } }).toArray());

    const author = "F. Scott Fitzgerald";
    console.log(`\n Books by '${author}':`);
    console.log(await books.find({ author }).toArray());

    const bookTitleToUpdate = "Wuthering Heights";
    const newPrice = 1500;
    console.log(`\n Updating price for '${bookTitleToUpdate}'...`);
    console.log(await books.updateOne({ title: bookTitleToUpdate }, { $set: { price: newPrice } }));

    const bookTitleToDelete = "To Kill a Mockingbird";
    console.log(`\n Deleting '${bookTitleToDelete}'...`);
    console.log(await books.deleteOne({ title: bookTitleToDelete }));


    // ---------------------------
    // Task 3: Advanced Queries
    // ---------------------------

    // Books in stock and published after 2010
    console.log(`\nBooks in stock & published after 2010:`);
    console.log(await books.find({
      in_stock: true,
      published_year: { $gt: 2010 }
    }).toArray());

    // Projection: Only show title, author, price
    console.log("\n Projection (title, author, price):");
    console.log(await books.find({}, { projection: { _id: 0, title: 1, author: 1, price: 1 } }).toArray());

    // Sorting: by price ascending and descending
    console.log("\n⬆ Books sorted by price (ascending):");
    console.log(await books.find().sort({ price: 1 }).toArray());

    console.log("\n⬇ Books sorted by price (descending):");
    console.log(await books.find().sort({ price: -1 }).toArray());

    // Pagination (5 per page)
    const page = 1; // change to 2 for next page
    console.log(`\n Books page ${page} (5 per page):`);
    console.log(await books.find().skip((page - 1) * 5).limit(5).toArray());


    // ---------------------------
    // Task 4: Aggregation Pipeline
    // ---------------------------

    // Avg price by genre
    console.log("\n Average price by genre:");
    console.log(await books.aggregate([
      { $group: { _id: "$genre", avgPrice: { $avg: "$price" } } }
    ]).toArray());

    // Author with most books
    console.log("\n Author with the most books:");
    console.log(await books.aggregate([
      { $group: { _id: "$author", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]).toArray());

    // Group by publication decade
    console.log("\n Books grouped by publication decade:");
    console.log(await books.aggregate([
      { $group: {
          _id: { $subtract: [{ $divide: ["$published_year", 10] }, { $mod: [{ $divide: ["$published_year", 10] }, 1] }] },
          count: { $sum: 1 }
      }},
      { $project: {
          decade: { $multiply: ["$_id", 10] },
          count: 1,
          _id: 0
      }},
      { $sort: { decade: 1 } }
    ]).toArray());


    // ---------------------------
    // Task 5: Indexing
    // ---------------------------

    console.log("\n⚡ Creating index on title...");
    console.log(await books.createIndex({ title: 1 }));

    console.log("\n⚡ Creating compound index on author + published_year...");
    console.log(await books.createIndex({ author: 1, published_year: -1 }));

    // Using explain() to show performance
    console.log("\n Explain() on title search (with index):");
    console.log(await books.find({ title: "Wuthering Heights" }).explain("executionStats"));


  } catch (error) {
    console.error(" Error:", error);
  } finally {
    await client.close();
    console.log("\n Database connection closed");
  }
}

runQueries();
