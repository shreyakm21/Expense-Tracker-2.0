/*document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('userName');

    // Fetch user data from the server
    try {
        const response = await fetch(`http://localhost:3002/api/user/${username}`, {
        //const response = await fetch(`http://localhost:3002/api/markAsDone`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const userData = await response.json();

            // Update the HTML with the user's budget and savings
            const budgetLimitElement = document.getElementById('budget-limit');
            const savingsElement = document.getElementById('savings');

            if (budgetLimitElement && savingsElement) {
                budgetLimitElement.textContent = userData.budgetLimit;
                savingsElement.textContent = userData.savings || 0;  // Default to 0 if savings is not defined
            } else {
                console.warn("Elements 'budget-limit' and/or 'savings' not found in the HTML.");
            }

            // Populate the expense summary table
            const expenseTableBody = document.getElementById('expense-summary').querySelector('tbody');
            if (userData.expenses && expenseTableBody) {
                userData.expenses.forEach(expense => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${expense.date}</td>
                        <td>${expense.name}</td>
                        <td>₹${expense.amount}</td>
                    `;
                    expenseTableBody.appendChild(row);
                });
            }
        } else {
            console.error("Failed to fetch user data.");
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
});*/


document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');

    try {
        // Fetch the summary data from the server
        const response = await fetch(`http://localhost:3002/api/getSummary`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const summaryData = await response.json();

            // Update HTML with the user's budget and savings
            const budgetLimitElement = document.getElementById('budget-limit');
            const savingsElement = document.getElementById('savings');
            
            if (budgetLimitElement && savingsElement) {
                budgetLimitElement.textContent = summaryData.budgetLimit || 0;
                savingsElement.textContent = summaryData.savings || 0;
            } else {
                console.warn("Elements 'budget-limit' and/or 'savings' not found in the HTML.");
            }

            // Populate the expense summary table
            const expenseTableBody = document.getElementById('expense-summary').querySelector('tbody');
            if (summaryData.expenses && expenseTableBody) {
                summaryData.expenses.forEach(expense => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${expense.date}</td>
                        <td>${expense.name}</td>
                        <td>₹${expense.amount}</td>
                    `;
                    expenseTableBody.appendChild(row);
                });
            }

        

            // Prepare the data for the chart (expenses vs. budget)
            const expensesTotal = summaryData.expenses.reduce((sum, exp) => sum + exp.amount, 0);
            const chartData = {
                labels: ['Expenses', 'Remaining Budget'],
                datasets: [{
                    label: 'Budget vs. Expenses',
                    data: [expensesTotal, summaryData.budgetLimit - expensesTotal],
                    backgroundColor: ['#FF5733', '#33FF57'],  // Red for expenses, green for remaining budget
                    borderColor: ['#FF5733', '#33FF57'],
                    borderWidth: 1
                }]
            };

            // Create the chart
            const ctx = document.getElementById('expenseChart').getContext('2d');
            new Chart(ctx, {
                type: 'pie', // You can change this to 'bar' for a bar chart
                data: chartData
            });
            
            const runModelButton = document.getElementById('run-model-btn');
            if (runModelButton) {
                runModelButton.addEventListener('click', async () => {
                    const expenseDescriptions = summaryData.expenses.map(expense => ({
                        //description: expense.name,
                        description: `"${expense.name}"`,
                        amount: expense.amount
                    }));
            
                    console.log("Sending expense data:", expenseDescriptions);
            
                    try {
                        const modelResponse = await fetch(`http://localhost:3002/api/categorize-expenses`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ expenses: expenseDescriptions })
                        });
            
                        if (!modelResponse.ok) {
                            console.error("Model API error:", await modelResponse.text());
                            alert("Failed to run the model.");
                            return;
                        }
            
                        const categorizedData = await modelResponse.json();
                        console.log("Categorized data:", categorizedData);
            
                        // Aggregate the data by category
                        const categoryTotals = {};
                        categorizedData.forEach(item => {
                            if (categoryTotals[item.category]) {
                                categoryTotals[item.category] += item.amount;
                            } else {
                                categoryTotals[item.category] = item.amount;
                            }
                        });
            
                        // Prepare data for the pie chart
                        const categories = Object.keys(categoryTotals);
                        const amounts = Object.values(categoryTotals);
            
                        // Generate the pie chart
                        const ctx2 = document.getElementById('expenseChart2').getContext('2d');
                        new Chart(ctx2, {
                            type: 'pie',
                            data: {
                                labels: categories,
                                datasets: [{
                                    data: amounts,
                                    backgroundColor: ['#FF5733', '#33FF57', '#33A6FF', '#FF33A6', '#FFC133'], // Customize colors
                                }]
                            }
                        });
            
                        alert("Model executed and chart generated successfully!");
                    } catch (err) {
                        console.error("Error running the model:", err);
                        alert("An error occurred while running the model.");
                    }
                });
            }


        } else {
            console.error("Failed to fetch summary data.");
        }
    } catch (error) {
        console.error("Error fetching summary data:", error);
    }
});


// Trigger restart tracking
async function restartTracking() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('http://localhost:3002/api/restartTracking', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert('Tracking reset. Set a new budget to start fresh.');
            window.location.href = 'budget.html';
        } else {
            console.error("Failed to restart tracking.");
        }
    } catch (error) {
        console.error("Error restarting tracking:", error);
    }
}

/*async function runModel() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('http://localhost:3002/api/runModel', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert('Model executed successfully!');
        } else {
            console.error("Failed to execute model.");
        }
    } catch (error) {
        console.error("Error executing model:", error);
    }
}

// Call this function wherever you'd like to trigger the model execution, e.g., after summary data is loaded.
document.getElementById('run-model-btn').addEventListener('click', runModel);

async function categorizeExpenses(expenses) {
    const token = localStorage.getItem('token');
    const expenseDescriptions = expenses.map(expense => expense.name);

    try {
        // Send expense descriptions to backend for categorization
        const response = await fetch('http://localhost:3002/api/categorize-expenses', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ descriptions: expenseDescriptions })
        });

        if (response.ok) {
            const categorizedData = await response.json();

            // Process the categories and amounts
            const categoryData = {};
            categorizedData.forEach((category, index) => {
                const expense = expenses[index];
                if (!categoryData[category]) {
                    categoryData[category] = 0;
                }
                categoryData[category] += expense.amount;
            });

            // Update the pie chart with categorized data
            updatePieChart(categoryData);
        } else {
            console.error("Failed to categorize expenses.");
        }
    } catch (error) {
        console.error("Error categorizing expenses:", error);
    }
}

function updatePieChart(categoryData) {
    const chartData = {
        labels: Object.keys(categoryData),
        datasets: [{
            label: 'Expenses by Category',
            data: Object.values(categoryData),
            backgroundColor: ['#FF5733', '#33FF57', '#FFBD33', '#33A1FF', '#FF33A1'], // Dynamic color mapping
            borderColor: ['#FF5733', '#33FF57', '#FFBD33', '#33A1FF', '#FF33A1'],
            borderWidth: 1
        }]
    };

    const ctx = document.getElementById('expenseChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: chartData
    });
}*/