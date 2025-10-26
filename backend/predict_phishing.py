import sys
import joblib
from urllib.parse import urlparse
import re

# This function creates the features for the ML model and must be kept consistent with your training script.
def extract_features(url):
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
            'netflix.com', 'paypal.com', 'ebay.com', 'walmart.com', 'chase.com', 'wellsfargo.com'
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
    return [features]

# --- Main Script with Smarter Hybrid Logic ---
try:
    url_to_check = sys.argv[1]

    # --- Step 1: Prepare URL for Analysis ---
    trusted_domains = {
        'google.com', 'youtube.com', 'facebook.com', 'microsoft.com', 'apple.com',
        'amazon.com', 'wikipedia.org', 'twitter.com', 'instagram.com', 'linkedin.com',
        'netflix.com', 'paypal.com', 'ebay.com', 'walmart.com', 'chase.com', 'wellsfargo.com'
    }
    
    temp_url = url_to_check
    if not url_to_check.startswith(('http://', 'https://')):
        temp_url = 'http://' + url_to_check
    
    hostname = ''
    path = ''
    try:
        parsed_url = urlparse(temp_url)
        hostname = parsed_url.hostname.lower() if parsed_url.hostname else ''
        path = parsed_url.path if parsed_url.path else ''
    except Exception:
        pass

    # --- Step 2: Apply Rules ---

    # Rule 1: If the main domain is on our trusted whitelist, it's CLEAN.
    if hostname:
        main_domain = '.'.join(hostname.split('.')[-2:])
        if main_domain in trusted_domains:
            print(0) # 0 means "Clean"
            sys.exit()

    # Rule 2: If it's a direct domain (no path) BUT has suspicious markers, let the model decide.
    # Otherwise, if it's a simple, non-suspicious direct domain, it's CLEAN.
    if path == '' or path == '/':
        suspicious_markers = ['login', 'secure', 'account', 'signin', 'verify']
        has_suspicious_marker = any(marker in hostname for marker in suspicious_markers)
        has_many_hyphens = hostname.count('-') > 1

        if not has_suspicious_marker and not has_many_hyphens:
            print(0) # Classify as "Clean"
            sys.exit()

    # --- Step 3: Fallback to the Machine Learning Model ---
    # If no rules fired, the URL is complex or suspicious enough for a full ML analysis.
    model = joblib.load('model_phishing.pkl')
    live_features = extract_features(url_to_check)
    prediction = model.predict(live_features)
    print(prediction[0])

except Exception as e:
    print(f"Error in Python script: {e}", file=sys.stderr)
    sys.exit(1)