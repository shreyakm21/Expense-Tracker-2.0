# Expense-Tracker-2.0

## Overview
The Expense Tracker is a web-based application designed to help users manage their personal finances effectively. Built using HTML, CSS, JavaScript, Node.js, Express.js, and MongoDB, this application allows users to sign up, log in, set budgets, record expenses, and view expense summaries.

## Features

### User Authentication
- **Sign Up**: New users can create an account by providing a username and password.
- **Login**: Existing users can log in using their credentials. Token-based authentication is implemented for secure access.

### Budget Management
- **Set Budget Limit**: After logging in, users are prompted to set a budget limit, which helps in tracking their spending.
- **Update Budget**: Users can update their budget limit as needed.

### Expense Tracking
- **Add Expenses**: Users can record daily expenses by entering the name and amount of the expense. The application checks if the new expense exceeds the set budget limit.
- **View Expenses**: Users can view their recorded expenses displayed in a table format, showing the date, name, and amount.

### Summary Page
- **Expense Summary**: Users can access a summary page that displays their budget limit, total savings, and daily expenses. This provides a quick overview of their financial status.
- **Reset Tracking**: Users can reset their tracking and set a new budget to start fresh.

### Data Persistence
- **MongoDB Integration**: User data, including usernames, hashed passwords, budget limits, and expenses, are stored in a MongoDB database, ensuring data persistence across sessions.

## Technologies Used
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)


  
