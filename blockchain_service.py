import requests
import re
from flask import current_app
from src.models.wallet import WalletAssetCache

class BlockchainService:
    def __init__(self):
        self.cache = WalletAssetCache()
        self.etherscan_api_key = current_app.config.get('ETHERSCAN_API_KEY')
        self.solscan_api_key = current_app.config.get('SOLSCAN_API_KEY')
    
    def validate_address(self, address, blockchain):
        """Validate wallet address format"""
        if blockchain == 'ethereum':
            return re.match(r'^0x[a-fA-F0-9]{40}$', address) is not None
        elif blockchain == 'solana':
            return len(address) >= 32 and len(address) <= 44 and address.isalnum()
        elif blockchain == 'bitcoin':
            return re.match(r'^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$', address) is not None
        return False
    
    def get_wallet_assets(self, address, blockchain):
        """Get assets for a wallet address"""
        try:
            if blockchain == 'ethereum':
                return self._get_ethereum_assets(address)
            elif blockchain == 'solana':
                return self._get_solana_assets(address)
            elif blockchain == 'bitcoin':
                return self._get_bitcoin_assets(address)
            else:
                raise ValueError(f"Unsupported blockchain: {blockchain}")
        except Exception as e:
            current_app.logger.error(f"Failed to get assets for {blockchain} address {address}: {str(e)}")
            return []
    
    def _get_ethereum_assets(self, address):
        """Get Ethereum assets using Etherscan API"""
        assets = []
        
        try:
            # Get ETH balance
            eth_balance = self._get_eth_balance(address)
            if eth_balance > 0:
                eth_price = self._get_crypto_price('ethereum')
                assets.append({
                    'symbol': 'ETH',
                    'name': 'Ethereum',
                    'balance': str(eth_balance),
                    'value_usd': eth_balance * eth_price,
                    'contract_address': None,
                    'token_type': 'native',
                    'decimals': 18,
                    'logo_url': 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
                })
            
            # Get ERC-20 tokens
            erc20_tokens = self._get_erc20_tokens(address)
            assets.extend(erc20_tokens)
            
            # Get NFTs (ERC-721/ERC-1155)
            nfts = self._get_ethereum_nfts(address)
            assets.extend(nfts)
            
        except Exception as e:
            current_app.logger.error(f"Ethereum asset fetch error: {str(e)}")
        
        return assets
    
    def _get_eth_balance(self, address):
        """Get ETH balance from Etherscan"""
        url = f"https://api.etherscan.io/api"
        params = {
            'module': 'account',
            'action': 'balance',
            'address': address,
            'tag': 'latest',
            'apikey': self.etherscan_api_key
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        if data['status'] == '1':
            # Convert from wei to ETH
            return int(data['result']) / 10**18
        return 0
    
    def _get_erc20_tokens(self, address):
        """Get ERC-20 tokens from Etherscan"""
        tokens = []
        
        url = f"https://api.etherscan.io/api"
        params = {
            'module': 'account',
            'action': 'tokentx',
            'address': address,
            'startblock': 0,
            'endblock': 999999999,
            'sort': 'asc',
            'apikey': self.etherscan_api_key
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if data['status'] == '1':
                # Process token transactions to get current balances
                token_balances = {}
                
                for tx in data['result']:
                    contract_address = tx['contractAddress']
                    token_symbol = tx['tokenSymbol']
                    token_name = tx['tokenName']
                    decimals = int(tx['tokenDecimal'])
                    
                    if contract_address not in token_balances:
                        # Get current token balance
                        balance = self._get_token_balance(address, contract_address)
                        if balance > 0:
                            price = self._get_token_price(contract_address)
                            
                            token_balances[contract_address] = {
                                'symbol': token_symbol,
                                'name': token_name,
                                'balance': str(balance),
                                'value_usd': balance * price,
                                'contract_address': contract_address,
                                'token_type': 'erc20',
                                'decimals': decimals,
                                'logo_url': f'https://assets.coingecko.com/coins/images/1/small/{token_symbol.lower()}.png'
                            }
                
                tokens = list(token_balances.values())
                
        except Exception as e:
            current_app.logger.error(f"ERC-20 token fetch error: {str(e)}")
        
        return tokens
    
    def _get_token_balance(self, address, contract_address):
        """Get ERC-20 token balance"""
        url = f"https://api.etherscan.io/api"
        params = {
            'module': 'account',
            'action': 'tokenbalance',
            'contractaddress': contract_address,
            'address': address,
            'tag': 'latest',
            'apikey': self.etherscan_api_key
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if data['status'] == '1':
                return int(data['result']) / 10**18  # Assuming 18 decimals
            
        except Exception as e:
            current_app.logger.error(f"Token balance fetch error: {str(e)}")
        
        return 0
    
    def _get_ethereum_nfts(self, address):
        """Get Ethereum NFTs (placeholder implementation)"""
        # This would require additional NFT-specific APIs like OpenSea or Alchemy
        # For now, return empty list
        return []
    
    def _get_solana_assets(self, address):
        """Get Solana assets using Solscan API"""
        assets = []
        
        try:
            # Get SOL balance
            sol_balance = self._get_sol_balance(address)
            if sol_balance > 0:
                sol_price = self._get_crypto_price('solana')
                assets.append({
                    'symbol': 'SOL',
                    'name': 'Solana',
                    'balance': str(sol_balance),
                    'value_usd': sol_balance * sol_price,
                    'contract_address': None,
                    'token_type': 'native',
                    'decimals': 9,
                    'logo_url': 'https://assets.coingecko.com/coins/images/4128/small/solana.png'
                })
            
            # Get SPL tokens
            spl_tokens = self._get_spl_tokens(address)
            assets.extend(spl_tokens)
            
        except Exception as e:
            current_app.logger.error(f"Solana asset fetch error: {str(e)}")
        
        return assets
    
    def _get_sol_balance(self, address):
        """Get SOL balance"""
        # Using a public RPC endpoint
        url = "https://api.mainnet-beta.solana.com"
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getBalance",
            "params": [address]
        }
        
        try:
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if 'result' in data:
                # Convert from lamports to SOL
                return data['result']['value'] / 10**9
                
        except Exception as e:
            current_app.logger.error(f"SOL balance fetch error: {str(e)}")
        
        return 0
    
    def _get_spl_tokens(self, address):
        """Get SPL tokens (placeholder implementation)"""
        # This would require Solscan API or other Solana-specific services
        # For now, return empty list
        return []
    
    def _get_bitcoin_assets(self, address):
        """Get Bitcoin assets using Blockstream API"""
        assets = []
        
        try:
            btc_balance = self._get_btc_balance(address)
            if btc_balance > 0:
                btc_price = self._get_crypto_price('bitcoin')
                assets.append({
                    'symbol': 'BTC',
                    'name': 'Bitcoin',
                    'balance': str(btc_balance),
                    'value_usd': btc_balance * btc_price,
                    'contract_address': None,
                    'token_type': 'native',
                    'decimals': 8,
                    'logo_url': 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png'
                })
                
        except Exception as e:
            current_app.logger.error(f"Bitcoin asset fetch error: {str(e)}")
        
        return assets
    
    def _get_btc_balance(self, address):
        """Get Bitcoin balance using Blockstream API"""
        url = f"https://blockstream.info/api/address/{address}"
        
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            # Convert from satoshis to BTC
            return (data.get('chain_stats', {}).get('funded_txo_sum', 0) - 
                   data.get('chain_stats', {}).get('spent_txo_sum', 0)) / 10**8
                   
        except Exception as e:
            current_app.logger.error(f"BTC balance fetch error: {str(e)}")
        
        return 0
    
    def _get_crypto_price(self, coin_id):
        """Get cryptocurrency price from CoinGecko"""
        try:
            # Check cache first
            cached_price = self.cache.get_cached_asset('price', coin_id, 'usd')
            if cached_price:
                return cached_price.get('price', 0)
            
            url = f"https://api.coingecko.com/api/v3/simple/price"
            params = {
                'ids': coin_id,
                'vs_currencies': 'usd'
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            price = data.get(coin_id, {}).get('usd', 0)
            
            # Cache the price
            self.cache.cache_asset('price', coin_id, 'usd', {'price': price}, ttl_minutes=5)
            
            return price
            
        except Exception as e:
            current_app.logger.error(f"Price fetch error for {coin_id}: {str(e)}")
            return 0
    
    def _get_token_price(self, contract_address):
        """Get token price by contract address"""
        try:
            url = f"https://api.coingecko.com/api/v3/simple/token_price/ethereum"
            params = {
                'contract_addresses': contract_address,
                'vs_currencies': 'usd'
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            return data.get(contract_address.lower(), {}).get('usd', 0)
            
        except Exception as e:
            current_app.logger.error(f"Token price fetch error for {contract_address}: {str(e)}")
            return 0

