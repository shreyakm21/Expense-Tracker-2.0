const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();
//const User = require('./models/User');
const bodyParser = require('body-parser');
const categorizeRoutes = require('./routes/categorize')
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002; // Change the port number if necessary
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'; // Use environment variables in production
//const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/expense';
const MONGO_URI = process.env.MONGO_URI;
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    console.error('Missing environment variables. Please check your .env file.');
    process.exit(1);
}

app.use(cors());
app.use(express.json());

app.use(bodyParser.json()); // Ensure JSON body parsing
app.use(categorizeRoutes);

// MongoDB connection
/*mongoose.connect('mongodb://localhost:27017/expense', {
    // Options like `useNewUrlParser` and `useUnifiedTopology` are no longer needed.
  })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));*/
    console.log('MONGO_URI:', process.env.MONGO_URI);
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => console.log('Connected to Atlas!'))
      .catch((err) => console.error(err));
   
      

// User model
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    budgetLimit: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

// Expenses model
const expenseSchema = new mongoose.Schema({
    username: { type: String, required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true }
});
const Expense = mongoose.model('Expense', expenseSchema);

// Summary model
const summarySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    budgetLimit: { type: Number, required: true },
    savings: { type: Number, required: true },
    expenses: [
        {
            name: String,
            amount: Number,
            date: String, // Store date as a string for simplicity, or use Date type
        },
    ],
    createdAt: { type: Date, default: Date.now }
});
const Summary = mongoose.model('Summary', summarySchema);



// Middleware to authenticate and authorize users based on JWT
function authenticate(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    //Authorization: Bearer <JWT_TOKEN>
    //split(' ')[1]: Splits the string on the space ( ) and retrieves the token part (<JWT_TOKEN>).
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Add user info to request object for access in routes
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
}


// Signup Route
app.post('/api/signup', async (req, res) => {
    const { name, password } = req.body;
    try {
        const existingUser = await User.findOne({ name });
        if (existingUser) {
            return res.status(400).json({ error: 'Username is already taken.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Error creating user.' });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    const { name, password } = req.body;
    try {
        console.log('Login attempt with name:', name);
        const user = await User.findOne({ name });
        if (!user) return res.status(401).json({ error: 'Invalid name' });
        
        const passwordMatch = await bcrypt.compare(password.trim(), user.password);
        if (!passwordMatch) return res.status(401).json({ error: 'Invalid password' });

        const token = jwt.sign({ userId: user._id, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Budget Route
app.post('/api/user/budget', async (req, res) => {
    const { username, budgetLimit } = req.body;
    try {
        await User.updateOne({ name: username }, { budgetLimit });
        res.json({ message: 'Budget set successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error setting budget' });
    }
});

// Expense Routes
app.post('/api/user/expenses', async (req, res) => {
    const { username, name, amount } = req.body;
    try {
        const totalExpenses = await Expense.aggregate([
            { $match: { username } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const currentTotal = totalExpenses[0]?.total || 0;
        const user = await User.findOne({ name: username });

        if (currentTotal + amount > user.budgetLimit) {
            return res.status(400).json({ error: 'Budget exceeded' });
        }

        const expense = new Expense({ username, name, amount });
        await expense.save();
        res.status(201).json(expense);
    } catch (error) {
        console.error("Error adding expense:", error);
        res.status(500).json({ error: 'Error adding expense' });
    }
});

app.get('/api/user/expenses/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const expenses = await Expense.find({ username });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching expenses' });
    }
});

app.delete('/api/user/expenses/:username/:id', authenticate, async (req, res) => {
    const { username, id } = req.params;
    try {
        await Expense.deleteOne({ _id: id, username });
        res.json({ message: 'Expense deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting expense' });
    }
});

// User retrieval route
app.get('/api/user/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ name: username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        //res.json(user);
        res.json({ name: user.name, budgetLimit: user.budgetLimit });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: 'Error fetching user' });
    }
});

// Route to delete all expenses for a specific user
app.delete('/api/user/expenses/:username', authenticate, async (req, res) => {
    const { username } = req.params;

    try {
        await Expense.deleteMany({ username });
        res.status(200).send({ message: 'All expenses cleared successfully.' });
    } catch (error) {
        console.error('Error clearing expenses:', error);
        res.status(500).send({ error: 'Error clearing expenses.' });
    }
});


app.post('/api/markAsDone', authenticate, async (req, res) => {
    console.log("Received request at /api/markAsDone");
    const userId = req.user.userId;  // User ID from authenticated session

    try {
        // Fetch the user’s budget and total expenses
        const user = await User.findById(userId);
        const expenses = await Expense.find({ username: user.name });

        // Calculate total expenses and savings
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const savings = user.budgetLimit - totalExpenses;

        // Prepare summary data
        const summaryData = {
            userId,
            budgetLimit: user.budgetLimit,
            savings,
            expenses: expenses.map(exp => ({
                name: exp.name,
                amount: exp.amount,
                date: new Date().toLocaleDateString()
            })),
        };

        // Save summary
        const summary = new Summary(summaryData);
        await summary.save();

        // Clear user’s expenses and reset budget
        await Expense.deleteMany({ username: user.name });
        await User.findByIdAndUpdate(userId, { budgetLimit: null });

        res.status(200).json({ message: 'Expenses marked as done and summary saved.' });
    } catch (error) {
        console.error('Error marking as done:', error);
        res.status(500).json({ error: 'Error marking as done.' });
    }
});

/*app.get('/api/getSummary', authenticate, async (req, res) => {
    const userId = req.user.userId;

    try {
        // Find the latest summary for the user based on creation date
        const summary = await Summary.findOne({ userId }).sort({ createdAt: -1 });
        
        if (!summary) {
            return res.status(404).json({ error: 'No summary found.' });
        }

        // Respond with budget limit, savings, and expenses from the summary
        res.json({
            budgetLimit: summary.budgetLimit,
            savings: summary.savings,
            expenses: summary.expenses
        });
    } catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({ error: 'Error fetching summary.' });
    }
});*/

app.get('/api/getSummary', authenticate, async (req, res) => {
    const userId = req.user.userId;

    try {
        // Find the latest summary for the user based on creation date
        const summary = await Summary.findOne({ userId }).sort({ createdAt: -1 });
        
        if (!summary) {
            return res.status(404).json({ error: 'No summary found.' });
        }

        // Map expenses to ensure the format has `date`, `name`, and `amount`
        const formattedExpenses = summary.expenses.map(expense => ({
            date: expense.date || null,
            name: expense.name || '',
            amount: expense.amount || 0
        }));

        // Respond with budget limit, savings, and formatted expenses
        res.json({
            budgetLimit: summary.budgetLimit,
            savings: summary.savings,
            expenses: formattedExpenses
        });
    } catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({ error: 'Error fetching summary.' });
    }
});



app.post('/api/restartTracking', authenticate, async (req, res) => {
    const userId = req.user.userId;

    try {
        // Reset the budget for the user
        await User.findByIdAndUpdate(userId, { budgetLimit: null });
        res.status(200).json({ message: 'Tracking reset. Set a new budget to start fresh.' });
    } catch (error) {
        console.error('Error resetting tracking:', error);
        res.status(500).json({ error: 'Error resetting tracking.' });
    }
});


// Update Expense Route (PATCH) - Updates the amount of a specific expense
app.patch('/api/user/expenses/:username/:expenseId', authenticate, async (req, res) => {
    const { username, expenseId } = req.params;
    const { amount } = req.body; // The new amount for the expense

    try {
        // Find the specific expense by expenseId and username
        const expense = await Expense.findOne({ _id: expenseId, username });

        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        // Fetch the user's current total expenses
        const totalExpenses = await Expense.aggregate([
            { $match: { username } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const currentTotal = totalExpenses[0]?.total || 0;
        const user = await User.findOne({ name: username });

        // Check if the updated expense exceeds the budget
        if (currentTotal - expense.amount + amount > user.budgetLimit) {
            return res.status(400).json({ error: 'Budget exceeded' });
        }

        // Update the expense amount
        expense.amount = amount;
        await expense.save();

        res.status(200).json(expense); // Return the updated expense
    } catch (error) {
        console.error("Error updating expense:", error);
        res.status(500).json({ error: 'Error updating expense' });
    }
});

//const path = require('path');
const { spawn } = require('child_process');

// Endpoint to execute the model
app.post('/api/runModel', (req, res) => {
    // Path to the Python script
    const pythonScriptPath = path.join(__dirname, '../models/expense_model.py');

    // Spawn a new Python process to run the script
    const pythonProcess = spawn('python', [pythonScriptPath]);

    pythonProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        res.send({ message: 'Model executed successfully' });
    });
});


//const { spawn } = require('child_process');

/*app.post('/api/categorize-expenses', (req, res) => {
    const descriptions = req.body.descriptions; // Array of expense descriptions
    if (!descriptions || descriptions.length === 0) {
        return res.status(400).json({ error: "Descriptions are required." });
    }

    const scriptPath = path.join(__dirname, 'models', 'expense_model.py');
    console.log('Executing Python script with command:', `python ${scriptPath} ${descriptions.join(' ')}`);
    const pythonProcess = spawn('python', [scriptPath, ...descriptions]);

    pythonProcess.stdout.on('data', (data) => {
        try {
            const result = data.toString().trim();
            if (!result) {
                throw new Error("No output received from the Python script.");
            }
            console.log('Python script output:', result);

            // Assuming the Python script returns data in the format: "Category:Amount\n"
            const categorized = result.split('\n').filter(line => line).map(line => {
                const [category, amount] = line.split(':');
                return { 
                    category: category.trim(), 
                    amount: parseFloat(amount) || 0 // Convert string amount to number
                };
            });

            res.json(categorized);
        } catch (err) {
            console.error("Error processing Python output:", err);
            res.status(500).json({ error: "Failed to categorize expenses." });
        }
    });

    pythonProcess.stderr.on('data', (data) => {
        const errorMessage = data.toString();
        console.error(`Python script error: ${errorMessage}`);
        res.status(500).json({ error: `Python script error: ${errorMessage}` });
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Python script exited with code ${code}`);
            res.status(500).json({ error: `Python script exited with code ${code}` });
        }
    });
});*/

app.post('/api/categorize-expenses', (req, res) => {
    const expenses = req.body.expenses;
    if (!expenses || expenses.length === 0) {
        return res.status(400).json({ error: "Expenses are required." });
    }

    // Format descriptions with quotes
    const descriptionsAndAmounts = expenses
        .map(expense => `"${expense.description}" ${expense.amount}`)
        .join(' ');

    const args = descriptionsAndAmounts.match(/"[^"]+"|\S+/g) || [];
    console.log('Python script arguments (before spawn):', args);

    const scriptPath = path.join(__dirname, 'models', 'expense_model.py');

    const pythonProcess = spawn('python', [scriptPath, ...args]);

    pythonProcess.stdout.on('data', (data) => {
        try {
            const result = data.toString().trim();
            console.log('Python script output:', result);

            const categorized = result.split('\n').map(line => {
                const [category, amount] = line.split(':');
                return {
                    category: category.trim(),
                    amount: parseFloat(amount.trim())
                };
            });

            res.json(categorized);
        } catch (err) {
            console.error("Error processing Python output:", err);
            res.status(500).json({ error: "Failed to categorize expenses." });
        }
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python script error: ${data.toString()}`);
        res.status(500).json({ error: data.toString() });
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Python script exited with code ${code}`);
            res.status(500).json({ error: `Python script exited with code ${code}` });
        }
    });
});




// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
