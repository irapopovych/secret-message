### Project Name: Secret Message with Docker

This project is a web application that allows users to send secret messages that are encrypted, stored temporarily, and can be accessed using a unique link. It utilizes Docker to containerize the application components, which consist of a Flask backend, Redis for temporary storage, Nginx for serving the frontend, and HTML/JavaScript for user interaction.

The system allows a user to:

1. Encrypt a message on the frontend using AES-GCM encryption and send it to the backend.
2. Store the encrypted message in a Redis database with a time-to-live (TTL) expiration.
3. Retrieve the encrypted message using a unique ID link, decrypt it with the provided key and IV (Initialization Vector), and display it on the frontend.

Components of the project:

1. **Backend (Flask):**
   - A Flask-based API to handle the storage and retrieval of encrypted messages.
   - Uses Redis to store messages with an expiration time (24 hours by default).
   - Implements basic routes for storing and reading messages:
     - `/store` (POST): Stores an encrypted message.
     - `/read` (GET): Retrieves and decrypts a stored message using a provided ID, key, and IV.

2. **Frontend (HTML/JS):**
   - A user-friendly webpage that allows a user to input a message, encrypt it, and generate a secret link.
   - Uses the Web Crypto API for client-side encryption (AES-GCM).
   - Displays the secret link for sharing once the message is successfully encrypted and stored.

3. **Docker:**
   - Docker is used to containerize both the Flask backend and Nginx frontend to provide a consistent development and production environment.
   - The backend Flask app is exposed on port 8000, and the frontend is served through Nginx on port 80.

4. **Nginx:**
   - Configured to serve the static HTML, CSS, and JavaScript files for the frontend application.

### Steps to run the project:

1. **Clone the repository:**
   - First, clone this repository to your local machine.

2. **Build the Docker containers:**
   - Navigate to the root of the project and build the Docker images using the following command:
     ```
     docker-compose build
     ```

3. **Start the application with Docker Compose:**
   - Once the images are built, start the application:
     ```
     docker-compose up -d
     ```

4. **Access the application:**
   - After the Docker containers are up, navigate to `http://localhost` in your browser to access the frontend.
   - You can create secret messages and share them with others using the generated links.

### Docker setup:

- **Backend (Flask):**
   - `Dockerfile`: The backend is based on Python 3.9, and it installs the required dependencies from `requirements.txt`.
   - Exposes port `8000` for the Flask API.

- **Frontend (Nginx):**
   - `Dockerfile`: The frontend is served via Nginx. Nginx is configured with `nginx.conf` to serve the static files located in the `html` directory and handle routing.

### Additional Information:

- **Dependencies:**
  - Flask
  - Redis
  - Flask-Cors
  - Nginx

- **Environment Variables:**
  - `REDIS_HOST`: The host for the Redis instance (default: `localhost`).
  - `REDIS_PORT`: The port for the Redis instance (default: `6379`).
  - `EXPIRATION_TIME`: The time-to-live (TTL) for storing the secret messages in Redis (default: 86400 seconds / 24 hours).

### Notes:

- The project leverages encryption (AES-GCM) to ensure the confidentiality of messages. The key and IV used for encryption are unique for each message and are included in the link when the message is stored.
- The message is deleted from Redis after it is read and decrypted.
- Ensure Docker is installed on your system to run this project.

### Example usage:

1. **Send a secret message:**
   - Enter a message in the input field, click "Create secret message", and copy the generated link.

2. **Retrieve and decrypt the message:**
   - Access the link containing the message ID, key, and IV to view the secret message after decryption.
