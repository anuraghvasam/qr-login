# QR-Based Login System

## Introduction
The QR-Based Login System allows users to log in using a QR code. The system enhances security by utilizing a session ID stored in the database, eliminating the need to pass sensitive credentials like passwords directly through the QR code. Users can generate QR codes after logging in via traditional methods (username/password) and can scan the code from another device for login.

---

## Key Features
- **QR Code Generation**: Users can generate a QR code representing their session after logging in with traditional methods.
- **Cross-Device QR Login**: Supports QR login from different devices by scanning the generated QR code.
- **Secure Session Management**: Session IDs are used to log users in, keeping their credentials safe from interception.
- **Instascan Integration**: Provides real-time QR code scanning via webcam.

---

## Project Overview
The QR-Based Login System uses technologies like Node.js, MongoDB, and Instascan to enable QR code-based authentication.

### Use Cases
- Simplifying the login process by allowing users to authenticate with QR codes.
- Enhancing security by avoiding the transmission of passwords directly in QR codes.

---

## Key Components and Technologies

### Backend
- **Node.js**: Handles requests, authentication, and QR generation.
- **MongoDB**: Stores user details and session IDs for cross-device login.
- **bcrypt**: Securely hashes and validates passwords.
- **crypto**: Provides cryptographic functionalities for session ID generation.
- **QRCode**: Generates QR codes based on session data.

### Frontend
- **HTML/CSS**: Builds the login, signup, and QR generation/scanning pages.
- **Instascan**: Enables camera-based QR code scanning in the browser.

---

## System Architecture

### Authentication Flow
1. **Signup**: Users create an account by providing their email, phone, and password. Passwords are securely hashed before storing them in MongoDB.
2. **Login**: Users log in using their email or phone number and password.
3. **QR Generation**: After logging in, users generate a QR code based on their session.
4. **QR Scanning and Login**: The scanned QR code sends the session ID to the server, which verifies the session in the database. If valid, the user is logged in.

---

## User Workflow

1. **Signup**
   - Users sign up by filling out a form with their first name, last name, email, phone, and password.

2. **Login**
   - Users log in using their email or phone number and password.
   - After successful login, the option to generate a QR code appears.

3. **QR Code Generation**
   - Users generate a QR code after logging in successfully.
   - The QR code is displayed along with the user's first and last name.

4. **QR Code Scanning**
   - The QR code can be scanned on another device, and if the session is valid, the user is logged in automatically.

---

## Code Overview

### Backend (`app.js`)
The backend manages user authentication, session management, and QR code generation.

**Key Endpoints:**
- `/signup`: Handles user registration.
- `/login`: Verifies user credentials.
- `/generate-qr`: Generates a QR code based on the user's session.
- `/qr-login`: Handles QR code scanning and validates the session ID.

### Frontend (HTML Files)
- **`index.html`**: Home page structure.
- **`login.html`**: Contains the login form where users can log in using their email/phone and password.
- **`qr-login.html`**: Displays the QR code for login after successful user login.
- **`qr-scan.html`**: Enables users to scan a QR code for cross-device login.

---

## Setup Instructions

### Requirements
- Node.js
- MongoDB Atlas (or any MongoDB instance)
- A modern browser with camera support for QR code scanning.

### Steps to Run the Project
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the server:
   ```bash
   node app.js
   ```
3. Access the application:
   - Open [http://localhost:3000](http://localhost:3000) in a browser.

---

## Security Considerations
- **Password Hashing**: All passwords are hashed using bcrypt before storage.
- **Session Management**: The session ID is used instead of passing credentials in the QR code, preventing direct credential theft.
- **Cross-Device Compatibility**: Session-based QR login ensures secure cross-device authentication without the need to transmit sensitive data.

---

## Conclusion
The QR-Based Login System provides a secure and efficient way for users to authenticate across devices using QR codes. By leveraging modern web technologies, it enhances security while providing a seamless user experience.

---

## Appendix

### Dependencies

1. **bcrypt**: For password hashing.
2. **QRCode**: For generating QR codes.
3. **Instascan**: For scanning QR codes via a webcam.
4. **crypto**: For generating session IDs.
