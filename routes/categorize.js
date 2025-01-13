const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const router = express.Router();

router.post('/api/categorize-expenses', (req, res) => {
    const { expenses } = req.body; // Array of expense objects (description and amount)

    if (!expenses || expenses.length === 0) {
        return res.status(400).json({ error: "No expenses provided." });
    }

    // Format the expenses as 'description amount' pairs for Python
    const descriptionsAndAmounts = expenses.map(expense => ({
        description: expense.description,
        amount: expense.amount
    }));

    // Format the arguments to match Python script requirements
    const formattedArgs = descriptionsAndAmounts
        .map(item => `${item.description} ${item.amount}`) // No quotes here
        .join(' ');

    const pythonScriptPath = path.join(__dirname, '../models', 'expense_model.py');
    const command = `python "${pythonScriptPath}" ${formattedArgs}`;

    console.log('Executing Python script with command:', command);
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing Python script: ${error.message}`);
            return res.status(500).json({ error: "Failed to categorize expenses." });
        }

        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ error: `Python script error: ${stderr}` });
        }

        // Parse the results (categories and amounts)
        const categorizedData = stdout.split('\n').filter(line => line).map(line => {
            const [category, amount] = line.split(':');
            return {
                category: category ? category.trim() : "Unknown",
                amount: amount ? parseFloat(amount.trim()) : 0,
            };
        });

        res.json(categorizedData);
    });
});

module.exports = router;
