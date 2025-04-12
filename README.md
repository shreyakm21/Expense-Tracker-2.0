# Expense Tracker 2.0

## Try it out!

https://expense-tracker-2-0-1-axm0.onrender.com/

## Overview

The **Expense Tracker** is a web-based application designed to help users manage their personal finances effectively. Built using HTML, CSS, JavaScript, Node.js, Express.js, and MongoDB, this application allows users to sign up, log in, set budgets, record expenses, categorize expenses, and view detailed expense summaries with visual insights.

## Features

### User Authentication
- **Sign Up**: New users can create an account by providing a username and password.
- **Login**: Existing users can log in using their credentials. Token-based authentication is implemented for secure access.

### Budget Management
- **Set Budget Limit**: After logging in, users are prompted to set a budget limit, which helps in tracking their spending.
- **Update Budget**: Users can update their budget limit as needed.

### Expense Tracking
- **Add Expenses**: Users can record daily expenses by entering the name and amount of the expense. The application checks if the new expense exceeds the set budget limit.
- **Categorize Expenses**: Expenses are automatically categorized based on their description into predefined domains such as Food, Rent, Utilities, etc., using a machine learning model.
- **View Expenses**: Users can view their recorded expenses displayed in a table format, showing the date, name, amount, and category.

### Summary Page
- **Expense Summary**: Users can access a summary page that displays their budget limit, total savings, and daily expenses. This provides a quick overview of their financial status.
- **Expense Visualization**: A pie chart visualizes the contribution of each expense category to the total spending. The expenses are grouped and summed by category for clarity and insight.
- **Reset Tracking**: Users can reset their tracking and set a new budget to start fresh.

### Data Persistence
- **MongoDB Integration**: User data, including usernames, hashed passwords, budget limits, expenses, and their categorized summaries, are stored in a MongoDB database, ensuring data persistence across sessions.

## Technologies Used
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Machine Learning**: Python (scikit-learn)
- **Authentication**: JWT (JSON Web Tokens)

# New Feature : Expense Categorization and Visualization

## Overview

This feature uses a machine learning model to classify user expenses into predefined categories based on their descriptions. It provides users with an organized view of their spending habits and visual insights using a pie chart.

## Features

- **Expense Categorization**: Uses machine learning to categorize expenses based on user input.
- **Visualization**: Displays a pie chart showing the contribution of each expense category.

## Implementation

### Categorization

- A **Naive Bayes** classification model is trained on labeled expense data to predict the category of each expense based on its description.
- The **TF-IDF** technique is used for text vectorization, converting expense descriptions into numerical data that the model can process.
- **LabelEncoder** is used to encode category labels for model training.
  
### Process

1. The user enters expense descriptions and amounts.
2. The script processes the input data.
3. The model predicts the category of each expense based on the description.
4. The amounts for each category are summed up to provide a total for each category.
  
### Visualization

- A pie chart is generated to depict the contribution of each expense category, providing an easy-to-understand breakdown of user spending.

## Requirements

- Python 3.x
- scikit-learn
- pandas
- matplotlib

## Usage

1. Train the Naive Bayes model with labeled expense data.
2. Process user inputs for expense descriptions and amounts.
3. Categorize expenses using the trained model.
4. Generate and display a pie chart of categorized expenses.

## Installation

To run the project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/Expense-Tracker-2.0.git
2. Navigate to the project directory:
   ```bash
   cd Expense-Tracker-2.0
4. Install dependencies:
   ```bash
   npm install
6. Set up environment variables for MongoDB and JWT authentication:
   Create a .env file and add your MongoDB URI and JWT secret key.
7. Run the application:
   ```bash
   npm start

This project is licensed under the MIT License - see the LICENSE file for details.

You can customize the installation and contributing sections based on the specific setup and workflow for your project.

   
