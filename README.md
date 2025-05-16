
# Healthcare App

A full-stack healthcare application built with React.js and Express.js. It enables user registration and authentication, appointment booking, and management for patients and doctors. The frontend is deployed on Vercel and the backend on Render. Firebase is used as the database, with JWT-based authentication for secure user sessions.

---

## Tech Stack

- **Frontend:** React.js
- **Backend:** Express.js (Node.js)
- **Database:** Firebase Firestore
- **Authentication:** JWT (JSON Web Tokens)
- **Deployment:** Frontend on Vercel, Backend on Render

---

## Getting Started

Follow these steps to run the project locally.

### 1. Clone the repository

```bash
git clone https://github.com/vanamuthuV/healthcare-app.git
cd healthcare-app
````

### 2. Setup Client

```bash
cd client
npm install
```

* Open `client/api/axios.jsx`
* Uncomment the line with the localhost base URL:

  ```js
  const BASE_URL = "http://localhost:5000/api";
  ```
* Comment out the other production base URL line

### 3. Setup Server

```bash
cd ../server
npm install
```

* Create a `.env` file in the server root folder
* Copy the contents of `.env.example` into `.env`
* Set your own random string for `JWT_SECRET`
* Leave `PORT` and `SALT_ROUNDS` as default

### 4. Configure Firebase

* Go to [Firebase Console](https://console.firebase.google.com/) and create a new project
* Enable Firestore database (start in test mode)
* Go to **Project Settings > Service Accounts** and generate a new private key (JSON)
* From the downloaded JSON file, copy the following values into your `.env` file:

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="your-private-key"  # include quotes
FIREBASE_CLIENT_EMAIL=your-client-email
```

> Make sure to wrap the private key value in double quotes if it contains newlines (`\n`).

### 5. Run the app

Open two terminal windows/tabs:

* In the first terminal, start the backend server:

```bash
cd server
npm run dev
```

* In the second terminal, start the frontend:

```bash
cd client
npm run dev
```

---

## Available URLs

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend API: [http://localhost:5000/api](http://localhost:5000/api)

---

## License

MIT License

---

Feel free to open issues or contribute to the project!


If you want, I can help you commit this README to the repo or prepare it with badges and additional sections. Just ask!
