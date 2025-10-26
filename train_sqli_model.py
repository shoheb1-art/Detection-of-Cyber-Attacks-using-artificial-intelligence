import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from scipy.sparse import hstack
import re

# ==============================================================================
# --- CONFIGURATION: EDIT THESE THREE LINES TO MATCH YOUR FILE ---

# 1. Put the correct FULL path to your CSV file here. Use an 'r' at the beginning.
DATASET_PATH = r'D:\sql injection 2\data\SQLi.csv' 

# 2. Find the column name for the SQL queries in your file and put it here.
QUERY_COLUMN = 'Query'  # <-- CHANGE THIS if your column is named 'Sentence', 'query', etc.

# 3. Find the column name for the labels (0 or 1) and put it here.
LABEL_COLUMN = 'Label'  # <-- CHANGE THIS if your column is named 'label', 'class', etc.

# ==============================================================================


def extract_sqli_features(queries):
    # This function creates rule-based features for better accuracy
    queries_lower = queries.str.lower()
    features_df = pd.DataFrame(index=queries.index)
    
    keywords = ['select', 'union', 'insert', 'update', 'delete', 'drop']
    for keyword in keywords:
        features_df[keyword + '_count'] = queries_lower.str.count(keyword)
        
    features_df['equals_count'] = queries_lower.str.count('=')
    features_df['quotes_count'] = queries_lower.str.count("'") + queries_lower.str.count('"')
    features_df['comment_present'] = queries.str.contains(r'(?:--)|(?:#)|(?:/\*)|(?:\*/)', regex=True).astype(int)
    features_df['tautology_present'] = queries.str.contains(r"(?:\s*or\s*['\"]\d+['\"]\s*=\s*['\"]\d+['\'])", regex=True, case=False).astype(int)

    return features_df

# --- Main Script ---
print("Starting SQLi model training process...")

try:
    df = pd.read_csv(DATASET_PATH)
    df = df.dropna(subset=[QUERY_COLUMN, LABEL_COLUMN])
    print(f"Dataset loaded. The columns in your file are: {df.columns.values}")

    print("Extracting features from queries...")
    custom_features = extract_sqli_features(df[QUERY_COLUMN])
    
    tfidf_vectorizer = TfidfVectorizer(max_features=2000)
    tfidf_features = tfidf_vectorizer.fit_transform(df[QUERY_COLUMN])

    X = hstack([tfidf_features, custom_features.values])
    y = df[LABEL_COLUMN]

    print("Splitting data and training the model...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = LogisticRegression(max_iter=1000, solver='liblinear')
    model.fit(X_train, y_train)

    print("Evaluating model performance...")
    accuracy = accuracy_score(y_test, model.predict(X_test))
    print(f"Model Accuracy: {accuracy * 100:.2f}%")

    print("Saving model and vectorizer...")
    joblib.dump(model, 'model_sqli.pkl')
    joblib.dump(tfidf_vectorizer, 'vectorizer_sqli.pkl')

    print("\nSQLi model training complete!")

except KeyError as e:
    print(f"\n--- ERROR ---")
    print(f"A KeyError occurred: {e}. This means a column name is wrong.")
    print("Please check the CONFIGURATION section at the top of the script and make sure")
    print("QUERY_COLUMN and LABEL_COLUMN match the names printed by the script.")
    print("---------------")
except FileNotFoundError:
    print("\n--- ERROR ---")
    print(f"Dataset file not found. Please make sure the path in DATASET_PATH is correct.")
    print("---------------")