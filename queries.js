const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";

const dbName = "plp_bookstore";
const collectionName = "books";

async function runQueries() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected");

    const db = client.db(dbName);
    const books = db.collection(collectionName);

    // 1. Find all books in a specific genre
    const genre = "Fiction";
    const genreBooks = await books.find({ genre }).toArray();
    console.log(`\n Books in Genre '${genre}':`, genreBooks);

    // 2. Find books published after a certain year
    const year = 1910;
    const recentBooks = await books.find({ published_year: { $gt: year } }).toArray();
    console.log(`\nBooks published after ${year}:`, recentBooks);

    // 3. Find books by a specific author
    const author = "F. Scott Fitzgerald";
    const authorBooks = await books.find({ author }).toArray();
    console.log(`\nBooks by '${author}':`, authorBooks);

    // 4. Update the price of a specific book
    const bookTitleToUpdate = "Wuthering Heights";
    const newPrice = 1500;

    const updateResult = await books.updateOne(
      { title: bookTitleToUpdate },
      { $set: { price: newPrice } }
    );
    console.log(`\nUpdated price for '${bookTitleToUpdate}':`, updateResult);

    // 5. Delete a book by its title
    const bookTitleToDelete = "To Kill a Mockingbird";
    const deleteResult = await books.deleteOne({ title: bookTitleToDelete });
    console.log(`\nDeleted '${bookTitleToDelete}':`, deleteResult);
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
    console.log("\nMongoDB connection closed");
  }
}

// Run the script
runQueries();
