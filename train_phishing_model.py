import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from urllib.parse import urlparse
import re

# ==============================================================================
# --- CONFIGURATION: EDIT THESE THREE LINES TO MATCH YOUR FILE ---
DATASET_PATH = r'D:\sql injection 2\data\phishing.csv' 
URL_COLUMN = 'url'      
LABEL_COLUMN = 'label'  
# ==============================================================================

def extract_features(url):
    # ... (your existing extract_features function)
    features = []
    try:
        if not isinstance(url, str): url = ""
        temp_url = url
        if '://' not in url:
            temp_url = 'http://' + url
        parsed_url = urlparse(temp_url)
        hostname = parsed_url.hostname if parsed_url.hostname else ''
        path = parsed_url.path
        trusted_domains = {
            'google.com', 'youtube.com', 'facebook.com', 'microsoft.com', 'apple.com',
            'amazon.com', 'wikipedia.org', 'twitter.com', 'instagram.com', 'linkedin.com',
            'netflix.com', 'paypal.com', 'ebay.com', 'walmart.com', 'chase.com'
        }
        main_domain = '.'.join(hostname.split('.')[-2:])
        features.extend([
            len(url), len(hostname), len(path), hostname.count('.'), hostname.count('-'),
            url.count('@'), url.count('?'), url.count('='),
            1 if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", hostname) else 0,
            1 if parsed_url.scheme == 'https' else 0,
            sum(word in url.lower() for word in ['secure', 'login', 'signin', 'bank', 'account']),
            1 if main_domain in trusted_domains else 0
        ])
    except Exception:
        features = [0] * 12
    return features

# --- Main Script ---
print("Starting model training process...")

try:
    df = pd.read_csv(DATASET_PATH)
    print(f"Dataset loaded with {len(df)} total samples.")

    print("Extracting features from URLs...")
    df['features'] = df[URL_COLUMN].apply(extract_features)

    X = list(df['features'])
    y = df[LABEL_COLUMN].apply(lambda label: 0 if label == 'benign' else 1)

    print("Splitting data into training and testing sets...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # --- NEW: Print the size of each set ---
    print(f"Total samples for model: {len(X)}")
    print(f"Number of samples for TRAINING: {len(X_train)}")
    print(f"Number of samples for TESTING: {len(X_test)}")
    # ----------------------------------------

    print("Training model with 100 trees...")
    model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    print("Evaluating model performance...")
    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)
    print(f"Model Accuracy: {accuracy * 100:.2f}%")

    print("Saving the trained model to 'model_phishing.pkl'...")
    joblib.dump(model, 'model_phishing.pkl')

    print("\nModel training complete!")

except Exception as e:
    print(f"An error occurred: {e}")