"""
Encryption Utilities for Last Wish Platform
Provides AES-256 encryption for sensitive data
"""

import os
import base64
import hashlib
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import secrets
import json
from typing import Dict, Any, Optional

class EncryptionService:
    """Service for encrypting and decrypting sensitive data"""
    
    def __init__(self, master_key: Optional[str] = None):
        """Initialize encryption service with master key"""
        self.master_key = master_key or os.environ.get('ENCRYPTION_MASTER_KEY')
        if not self.master_key:
            raise ValueError("Master encryption key is required")
        
        # Derive encryption key from master key
        self.encryption_key = self._derive_key(self.master_key.encode())
        self.fernet = Fernet(self.encryption_key)
    
    def _derive_key(self, password: bytes, salt: bytes = None) -> bytes:
        """Derive encryption key from password using PBKDF2"""
        if salt is None:
            salt = b'last_wish_platform_salt_2024'  # Static salt for consistency
        
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
            backend=default_backend()
        )
        key = base64.urlsafe_b64encode(kdf.derive(password))
        return key
    
    def encrypt_data(self, data: Any) -> str:
        """Encrypt any serializable data"""
        try:
            # Convert data to JSON string
            json_data = json.dumps(data, default=str)
            
            # Encrypt the JSON string
            encrypted_data = self.fernet.encrypt(json_data.encode())
            
            # Return base64 encoded encrypted data
            return base64.urlsafe_b64encode(encrypted_data).decode()
        except Exception as e:
            raise ValueError(f"Encryption failed: {str(e)}")
    
    def decrypt_data(self, encrypted_data: str) -> Any:
        """Decrypt data and return original object"""
        try:
            # Decode base64
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_data.encode())
            
            # Decrypt the data
            decrypted_bytes = self.fernet.decrypt(encrypted_bytes)
            
            # Parse JSON
            json_data = decrypted_bytes.decode()
            return json.loads(json_data)
        except Exception as e:
            raise ValueError(f"Decryption failed: {str(e)}")
    
    def encrypt_string(self, text: str) -> str:
        """Encrypt a string"""
        try:
            encrypted_data = self.fernet.encrypt(text.encode())
            return base64.urlsafe_b64encode(encrypted_data).decode()
        except Exception as e:
            raise ValueError(f"String encryption failed: {str(e)}")
    
    def decrypt_string(self, encrypted_text: str) -> str:
        """Decrypt a string"""
        try:
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_text.encode())
            decrypted_bytes = self.fernet.decrypt(encrypted_bytes)
            return decrypted_bytes.decode()
        except Exception as e:
            raise ValueError(f"String decryption failed: {str(e)}")
    
    def hash_password(self, password: str, salt: str = None) -> Dict[str, str]:
        """Hash password with salt using PBKDF2"""
        if salt is None:
            salt = secrets.token_hex(32)
        
        # Use PBKDF2 with SHA256
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt.encode(),
            iterations=100000,
            backend=default_backend()
        )
        
        password_hash = base64.urlsafe_b64encode(kdf.derive(password.encode())).decode()
        
        return {
            'hash': password_hash,
            'salt': salt,
            'algorithm': 'PBKDF2-SHA256',
            'iterations': 100000
        }
    
    def verify_password(self, password: str, stored_hash: str, salt: str) -> bool:
        """Verify password against stored hash"""
        try:
            # Recreate the hash with the same salt
            hash_result = self.hash_password(password, salt)
            return hash_result['hash'] == stored_hash
        except Exception:
            return False
    
    def generate_secure_token(self, length: int = 32) -> str:
        """Generate cryptographically secure random token"""
        return secrets.token_urlsafe(length)
    
    def encrypt_file_content(self, file_content: bytes) -> bytes:
        """Encrypt file content"""
        try:
            return self.fernet.encrypt(file_content)
        except Exception as e:
            raise ValueError(f"File encryption failed: {str(e)}")
    
    def decrypt_file_content(self, encrypted_content: bytes) -> bytes:
        """Decrypt file content"""
        try:
            return self.fernet.decrypt(encrypted_content)
        except Exception as e:
            raise ValueError(f"File decryption failed: {str(e)}")

class AESEncryption:
    """Advanced AES-256 encryption for high-security data"""
    
    @staticmethod
    def generate_key() -> bytes:
        """Generate a new AES-256 key"""
        return os.urandom(32)  # 256 bits
    
    @staticmethod
    def encrypt_aes(data: bytes, key: bytes) -> Dict[str, str]:
        """Encrypt data using AES-256-GCM"""
        try:
            # Generate random IV
            iv = os.urandom(12)  # 96 bits for GCM
            
            # Create cipher
            cipher = Cipher(
                algorithms.AES(key),
                modes.GCM(iv),
                backend=default_backend()
            )
            encryptor = cipher.encryptor()
            
            # Encrypt data
            ciphertext = encryptor.update(data) + encryptor.finalize()
            
            return {
                'ciphertext': base64.urlsafe_b64encode(ciphertext).decode(),
                'iv': base64.urlsafe_b64encode(iv).decode(),
                'tag': base64.urlsafe_b64encode(encryptor.tag).decode()
            }
        except Exception as e:
            raise ValueError(f"AES encryption failed: {str(e)}")
    
    @staticmethod
    def decrypt_aes(encrypted_data: Dict[str, str], key: bytes) -> bytes:
        """Decrypt data using AES-256-GCM"""
        try:
            # Decode components
            ciphertext = base64.urlsafe_b64decode(encrypted_data['ciphertext'])
            iv = base64.urlsafe_b64decode(encrypted_data['iv'])
            tag = base64.urlsafe_b64decode(encrypted_data['tag'])
            
            # Create cipher
            cipher = Cipher(
                algorithms.AES(key),
                modes.GCM(iv, tag),
                backend=default_backend()
            )
            decryptor = cipher.decryptor()
            
            # Decrypt data
            plaintext = decryptor.update(ciphertext) + decryptor.finalize()
            return plaintext
        except Exception as e:
            raise ValueError(f"AES decryption failed: {str(e)}")

class SecureDataHandler:
    """Handler for secure data operations"""
    
    def __init__(self, encryption_service: EncryptionService):
        self.encryption = encryption_service
    
    def store_sensitive_data(self, data: Dict[str, Any], user_id: int) -> str:
        """Store sensitive data with user-specific encryption"""
        try:
            # Add metadata
            secure_data = {
                'user_id': user_id,
                'timestamp': str(datetime.utcnow()),
                'data': data
            }
            
            # Encrypt the data
            encrypted_data = self.encryption.encrypt_data(secure_data)
            
            # Generate storage key
            storage_key = self.encryption.generate_secure_token()
            
            # In production, store in secure database or encrypted file system
            # For now, return the encrypted data with storage key
            return f"{storage_key}:{encrypted_data}"
        except Exception as e:
            raise ValueError(f"Secure data storage failed: {str(e)}")
    
    def retrieve_sensitive_data(self, storage_reference: str, user_id: int) -> Dict[str, Any]:
        """Retrieve and decrypt sensitive data"""
        try:
            # Parse storage reference
            storage_key, encrypted_data = storage_reference.split(':', 1)
            
            # Decrypt the data
            decrypted_data = self.encryption.decrypt_data(encrypted_data)
            
            # Verify user ownership
            if decrypted_data.get('user_id') != user_id:
                raise ValueError("Unauthorized access to sensitive data")
            
            return decrypted_data['data']
        except Exception as e:
            raise ValueError(f"Secure data retrieval failed: {str(e)}")
    
    def sanitize_input(self, input_data: str) -> str:
        """Sanitize user input to prevent injection attacks"""
        if not isinstance(input_data, str):
            return str(input_data)
        
        # Remove potentially dangerous characters
        dangerous_chars = ['<', '>', '"', "'", '&', '\x00', '\n', '\r', '\t']
        sanitized = input_data
        
        for char in dangerous_chars:
            sanitized = sanitized.replace(char, '')
        
        # Limit length
        return sanitized[:1000]  # Reasonable limit
    
    def validate_crypto_address(self, address: str, crypto_type: str) -> bool:
        """Validate cryptocurrency address format"""
        if not address or not isinstance(address, str):
            return False
        
        # Basic validation patterns
        patterns = {
            'bitcoin': r'^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$',
            'ethereum': r'^0x[a-fA-F0-9]{40}$',
            'litecoin': r'^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$',
            'dogecoin': r'^D{1}[5-9A-HJ-NP-U]{1}[1-9A-HJ-NP-Za-km-z]{32}$'
        }
        
        import re
        pattern = patterns.get(crypto_type.lower())
        if pattern:
            return bool(re.match(pattern, address))
        
        # For unknown types, basic length and character validation
        return len(address) >= 20 and len(address) <= 100 and address.isalnum()

# Global encryption service instance
encryption_service = None

def get_encryption_service() -> EncryptionService:
    """Get global encryption service instance"""
    global encryption_service
    if encryption_service is None:
        encryption_service = EncryptionService()
    return encryption_service

def init_encryption_service(master_key: str = None):
    """Initialize global encryption service"""
    global encryption_service
    encryption_service = EncryptionService(master_key)
    return encryption_service

