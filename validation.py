import re

def validate_email(email):
    """Validate email format"""
    if not email or not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return False
    return True

def validate_password(password):
    """Validate password strength"""
    errors = []
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    if not re.search(r"[A-Z]", password):
        errors.append("Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", password):
        errors.append("Password must contain at least one lowercase letter")
    if not re.search(r"[0-9]", password):
        errors.append("Password must contain at least one digit")
    if not re.search(r"[!@#$%^&*()-_=+{};:,<.>]", password):
        errors.append("Password must contain at least one special character")
    return errors

def validate_sensitive_data(text):
    """Check for sensitive data like private keys or seed phrases"""
    if not text:
        return False
    
    # Regex for common seed phrase patterns (12, 18, 24 words)
    seed_phrase_pattern = re.compile(r"\b(\w+\s+){11,23}\w+\b")
    
    # Regex for common private key formats (WIF, hex)
    private_key_patterns = [
        re.compile(r"^[5KL][1-9A-HJ-NP-Za-km-z]{50,51}$"),  # Bitcoin WIF
        re.compile(r"^[0-9a-fA-F]{64}$")  # Hex private key
    ]
    
    if seed_phrase_pattern.search(text):
        return True
        
    for pattern in private_key_patterns:
        if pattern.search(text):
            return True
            
    return False

