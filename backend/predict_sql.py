import sys
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.sparse import hstack
import re

# This function is used by the ML model if the hard rules don't catch the query.
def extract_sqli_features(queries):
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

try:
    query_to_check = sys.stdin.readline().strip()
    query_lower = query_to_check.lower()

    # --- UPGRADED Rule-Based Bypass Logic ---

    # Rule 1: Check for UNION SELECT pattern.
    if 'union' in query_lower and query_lower.count('select') > 1:
        print(1)  # 1 means "Threat"
        sys.exit()

    # Rule 2: Check for a simple tautology bypass.
    if re.search(r"(\s*or\s*['\"]\d+['\"]\s*=\s*['\"]\d+['\'])", query_lower):
        print(1)
        sys.exit()
        
    # Rule 3: Check for access to the information_schema.
    if 'information_schema' in query_lower:
        print(1)
        sys.exit()
        
    # Rule 4: Check for sensitive system function calls.
    sensitive_functions = ['version()', 'database()', 'user()', '@@version', 'concat']
    if any(func in query_lower for func in sensitive_functions):
        print(1)
        sys.exit()

    # NEW Rule 5: Detect Nested SELECT in WHERE clause (Blind SQLi).
    # This regex looks for 'where' followed by other characters, then a sub-'select'.
    if 'where' in query_lower and re.search(r"where\s+.+\(select", query_lower):
        print(1)
        sys.exit()

    # --- Fallback to ML Model if no hard rules match ---
    model = joblib.load('model_sqli.pkl')
    tfidf_vectorizer = joblib.load('vectorizer_sqli.pkl')
    
    query_series = pd.Series([query_to_check])
    custom_features = extract_sqli_features(query_series)
    tfidf_features = tfidf_vectorizer.transform(query_series)
    
    live_features = hstack([tfidf_features, custom_features.values])
    prediction = model.predict(live_features)
    print(prediction[0])

except Exception as e:
    print(f"Error in Python script: {e}", file=sys.stderr)
    sys.exit(1)