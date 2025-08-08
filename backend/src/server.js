
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const budgetRoutes = require('./routes/budgetRoutes');


const app = express();


const PORT = process.env.PORT || 5000;
const MDB_URI = process.env.MDB_URI;


if (!MDB_URI) {
    console.error("\nCRITICAL ERROR: MDB_URI is not defined in your .env file.");
    console.error("Please ensure you have a .env file in the 'backend' folder with MDB_URI set.");
    console.error("Example: MDB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority");
    process.exit(1); 
}



mongoose.connect(MDB_URI)
  .then(() => {
    console.log('MongoDB Connected...');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
   
    process.exit(1);
  });

// Middleware
app.use(cors()); 
app.use(express.json()); 


app.get('/', (req, res) => {
  res.send('Expense Planner API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});