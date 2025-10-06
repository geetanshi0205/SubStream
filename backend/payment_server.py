#!/usr/bin/env python3
"""
Payment Server with X402 Protocol and Supabase Integration
"""

from fastapi import FastAPI, HTTPException, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import time
import hashlib
from typing import Optional
from dotenv import load_dotenv
import requests
from web3 import Web3
from eth_account import Account

load_dotenv()

app = FastAPI(title="X402 Payment Server", version="1.0.0")

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://username:password@localhost:5432/database")

# Payment configuration
PAYMENT_AMOUNT = os.getenv("PAYMENT_AMOUNT", "0.001")  # ETH
RECIPIENT_WALLET = os.getenv("RECIPIENT_WALLET", "")
PRIVATE_KEY = os.getenv("PRIVATE_KEY", "")

# Web3 configuration
RPC_URL = os.getenv("RPC_URL", "https://rpc-amoy.polygon.technology")  # Polygon Amoy testnet
w3 = Web3(Web3.HTTPProvider(RPC_URL))

# Create account from private key
payment_account = Account.from_key(PRIVATE_KEY)
PAYMENT_WALLET_ADDRESS = payment_account.address

class PaymentRequest(BaseModel):
    wallet_address: str

class WalletVerificationRequest(BaseModel):
    wallet_address: str

def get_db_connection():
    """Get database connection"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

def init_database():
    """Initialize database schema"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Create table for wallet subscriptions
            cur.execute("""
                CREATE TABLE IF NOT EXISTS wallet_subscriptions (
                    id SERIAL PRIMARY KEY,
                    wallet_address VARCHAR(42) UNIQUE NOT NULL,
                    tx_hash VARCHAR(66) NOT NULL,
                    payment_amount VARCHAR(20) NOT NULL,
                    subscription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    is_active BOOLEAN DEFAULT TRUE,
                    expires_at TIMESTAMP DEFAULT NULL
                )
            """)
            
            # Create index on wallet_address for faster lookups
            cur.execute("""
                CREATE INDEX IF NOT EXISTS idx_wallet_address 
                ON wallet_subscriptions(wallet_address)
            """)
            
            conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database initialization failed: {str(e)}")
    finally:
        conn.close()

def execute_x402_payment(wallet_address: str) -> str:
    """
    Execute X402 payment for the wallet address using real blockchain transaction
    """
    try:
        # Check if Web3 is connected
        if not w3.is_connected():
            raise Exception("Unable to connect to blockchain network")
        
        # Get account balance
        balance = w3.eth.get_balance(payment_account.address)
        balance_eth = w3.from_wei(balance, 'ether')
        
        print(f"Payment wallet address: {payment_account.address}")
        print(f"Payment wallet balance: {balance_eth} ETH")
        
        # Convert payment amount to wei
        payment_amount_wei = w3.to_wei(float(PAYMENT_AMOUNT), 'ether')
        
        # Check if wallet has sufficient balance
        if balance < payment_amount_wei:
            raise Exception(f"Insufficient balance. Required: {PAYMENT_AMOUNT} ETH, Available: {balance_eth} ETH")
        
        # Get current gas price
        gas_price = w3.eth.gas_price
        
        # Get nonce
        nonce = w3.eth.get_transaction_count(payment_account.address)
        
        # Create transaction
        transaction = {
            'to': RECIPIENT_WALLET,
            'value': payment_amount_wei,
            'gas': 21000,  # Standard gas limit for ETH transfer
            'gasPrice': gas_price,
            'nonce': nonce,
            'chainId': 80002  # Polygon Amoy testnet chain ID
        }
        
        # Sign transaction
        signed_txn = w3.eth.account.sign_transaction(transaction, PRIVATE_KEY)
        
        # Send transaction
        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        
        # Wait for transaction receipt
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        
        print(f"X402 Payment executed successfully!")
        print(f"Transaction hash: {tx_receipt.transactionHash.hex()}")
        print(f"Gas used: {tx_receipt.gasUsed}")
        print(f"Block number: {tx_receipt.blockNumber}")
        
        return tx_receipt.transactionHash.hex()
        
    except Exception as e:
        print(f"X402 Payment failed: {str(e)}")
        raise Exception(f"X402 Payment execution failed: {str(e)}")

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_database()

@app.get("/")
async def root():
    """Health check endpoint"""
    try:
        balance = w3.eth.get_balance(payment_account.address)
        balance_eth = w3.from_wei(balance, 'ether')
        return {
            "message": "X402 Payment Server is running", 
            "status": "healthy",
            "payment_wallet": payment_account.address,
            "balance": f"{balance_eth} POL",
            "network": "Polygon Amoy",
            "connected": w3.is_connected()
        }
    except Exception as e:
        return {
            "message": "X402 Payment Server is running", 
            "status": "healthy",
            "error": str(e)
        }

@app.post("/execute-payment")
async def execute_payment(payment_request: PaymentRequest):
    """
    Execute X402 payment when receiving wallet address and grant subscription access
    """
    wallet_address = payment_request.wallet_address.lower()
    
    # Execute X402 payment for this wallet
    tx_hash = execute_x402_payment(wallet_address)
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Check if wallet already has active subscription
            cur.execute("""
                SELECT * FROM wallet_subscriptions 
                WHERE wallet_address = %s AND is_active = TRUE
            """, (wallet_address,))
            
            existing_subscription = cur.fetchone()
            
            if existing_subscription:
                return {
                    "success": True,
                    "message": "Wallet already has active subscription",
                    "wallet_address": wallet_address,
                    "subscription_date": existing_subscription['subscription_date'],
                    "tx_hash": existing_subscription['tx_hash'],
                    "payment_amount": existing_subscription['payment_amount']
                }
            
            # Insert new subscription after successful X402 payment
            cur.execute("""
                INSERT INTO wallet_subscriptions 
                (wallet_address, tx_hash, payment_amount) 
                VALUES (%s, %s, %s)
                ON CONFLICT (wallet_address) 
                DO UPDATE SET 
                    tx_hash = EXCLUDED.tx_hash,
                    payment_amount = EXCLUDED.payment_amount,
                    subscription_date = CURRENT_TIMESTAMP,
                    is_active = TRUE
                RETURNING *
            """, (wallet_address, tx_hash, PAYMENT_AMOUNT))
            
            subscription = cur.fetchone()
            conn.commit()
            
            return {
                "success": True,
                "message": "X402 payment executed successfully, subscription granted",
                "wallet_address": wallet_address,
                "subscription_date": subscription['subscription_date'],
                "tx_hash": tx_hash,
                "payment_amount": PAYMENT_AMOUNT
            }
            
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"X402 payment execution failed: {str(e)}")
    finally:
        conn.close()

@app.post("/verify-access")
async def verify_wallet_access(verification_request: WalletVerificationRequest):
    """
    Verify if wallet address has subscription access
    """
    wallet_address = verification_request.wallet_address.lower()
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT wallet_address, subscription_date, tx_hash, payment_amount, is_active
                FROM wallet_subscriptions 
                WHERE wallet_address = %s AND is_active = TRUE
            """, (wallet_address,))
            
            subscription = cur.fetchone()
            
            if subscription:
                return {
                    "has_access": True,
                    "wallet_address": wallet_address,
                    "subscription_date": subscription['subscription_date'],
                    "tx_hash": subscription['tx_hash'],
                    "payment_amount": subscription['payment_amount']
                }
            else:
                return {
                    "has_access": False,
                    "wallet_address": wallet_address,
                    "message": "No active subscription found"
                }
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Access verification failed: {str(e)}")
    finally:
        conn.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)