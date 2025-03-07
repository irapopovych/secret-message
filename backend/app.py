from flask import Flask, request, jsonify
import redis
import os
import base64
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

redis_host = os.getenv("REDIS_HOST", "localhost")
redis_port = os.getenv("REDIS_PORT", 6379)
db = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)

EXPIRATION_TIME = 86400  

@app.route('/')
def home():
    return "Backend is work!"

import base64

@app.route('/store', methods=['POST'])
def store_message():
    data = request.json
    if 'message' not in data:
        return jsonify({"error": "Not message"}), 400

    encrypted_message = data['message']
    message_id = base64.urlsafe_b64encode(os.urandom(6)).decode('utf-8')

    db.setex(message_id, EXPIRATION_TIME, encrypted_message)

    return jsonify({"id": message_id})
    

@app.route('/read', methods=['GET'])
def read_message():
    message_id = request.args.get('id')
    if not message_id:
        return jsonify({"error": "Missing id"}), 400

    encrypted_message = db.get(message_id)
    if encrypted_message:
        db.delete(message_id)
        try:
            iv, cipher_text = encrypted_message.split(":")

            return jsonify({
                "message": cipher_text.strip(), 
                "iv": iv.strip()
            })  
        except ValueError:
            return jsonify({"error": "Invalid message format"}), 500
    else:
        return jsonify({"error": "Message not found"}), 404



@app.route('/favicon.ico')
def favicon():
    return '', 204 

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
