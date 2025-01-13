import sys
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.naive_bayes import MultinomialNB

# Load your dataset
data = pd.read_csv('models/expenses.csv')

# Text vectorization using TF-IDF
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(data['description'])
y = data['category']

# Encode the labels (categories)
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

# Train Naive Bayes model
model = MultinomialNB()
model.fit(X, y_encoded)

def categorize_expenses(arguments):
    if len(arguments) % 2 != 0:
        raise ValueError("Arguments should be in description-amount pairs.")

    descriptions = []
    amounts = []

    for i in range(0, len(arguments), 2):
        description = arguments[i].strip('"')
        descriptions.append(description)
        amounts.append(float(arguments[i + 1]))

    # Transform descriptions to TF-IDF vectors
    new_data_tfidf = vectorizer.transform(descriptions)

    # Predict categories
    predictions = model.predict(new_data_tfidf)
    categories = label_encoder.inverse_transform(predictions)

    # Group amounts by category
    category_totals = {}
    for category, amount in zip(categories, amounts):
        if category in category_totals:
            category_totals[category] += amount
        else:
            category_totals[category] = amount

    # Format the output as JSON-like strings
    results = [f"{category}: {total}" for category, total in category_totals.items()]
    return results

if __name__ == "__main__":
    arguments = sys.argv[1:]
    try:
        categorized_expenses = categorize_expenses(arguments)
        print("\n".join(categorized_expenses))
    except Exception as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)
