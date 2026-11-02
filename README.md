🌐 Network IP Analysis Tool & Subnet Analyzer
An interactive full-stack network utility built with a Python (Flask) computation engine and a React.js + Tailwind CSS dashboard. The application simplifies IPv4 address inspection, CIDR subnetting, overlap relationship auditing, and VLSM host capacity planning.
---
📌 Project Overview
Manual calculation of IP ranges, binary conversions, and subnet boundaries is error-prone. This project automates standard networking workflows defined by RFC standards. It provides an intuitive client dashboard communicating with a lightweight REST API backend.
---
🚀 Key Features
Validate IP (`/validate`):
Validates strict 4-octet IPv4 syntax ($0\text{--}255$, leading zero checks).
Classifies Classful Addressing (Class A, B, C, D Multicast, Class E Reserved).
Identifies address scope: Public, RFC 1918 Private, Loopback, Link-Local, or Broadcast.
CIDR Subnetting (`/cidr`):
Computes Subnet Mask, Network ID, Broadcast ID, Usable Range, and Usable Hosts.
Explicit edge-case handling for RFC 3021 (`/31` point-to-point links) and host routes (`/32`).
Subnet Compare (`/compare`):
Evaluates relationship semantics between two CIDR blocks using Python set algebra.
Outputs exact status: `Identical`, `Network 1 contains Network 2`, `Network 2 contains Network 1`, `Overlapping Conflict`, or `No Overlap`.
Host Capacity Calculator (`/hostcalc`):
Reverse-VLSM provisioning engine.
Computes the smallest possible subnet mask given required host capacity to prevent IP wastage.
---
⚙️ Mathematical & Subnetting Logic
Usable Hosts Calculation:
$$\text{Usable Hosts} = 2^{(32 - \text{prefix})} - 2$$
(Subtracting 2 accounts for the reserved Network and Directed Broadcast IDs)
Host Bits Required (VLSM):
$$h = \lceil \log_2(\text{Required Hosts} + 2) \rceil$$
Optimal CIDR Prefix:
$$\text{Prefix} = 32 - h$$
---
🛠️ Architecture & Tech Stack
```text
+-----------------------------------+
|          Client Browser           |
|      React.js + Tailwind CSS      |
|           (Port: 3000)            |
+-----------------+-----------------+
                  |
     HTTP POST / JSON (REST API)
                  |
+-----------------v-----------------+
|          Python Backend           |
|            Flask + CORS           |
|   (ipaddress \& math libraries)    |
|           (Port: 5000)            |
+-----------------------------------+
```
Frontend: React.js, Tailwind CSS, Lucide React, Framer Motion
Backend: Python 3, Flask, Flask-CORS, standard `ipaddress` and `math` libraries
Network Testing: Automated validation routines
---
💻 Installation & Local Setup
1. Prerequisites
Python 3.8+
Node.js 16+ & npm
2. Backend Setup (Flask Server)
From the project root directory:
```bash
# Create and activate virtual environment
python -m venv venv

# Windows (Command Prompt / PowerShell):
venv\\Scripts\\activate

# Linux / macOS:
source venv/bin/activate

# Install backend dependencies
pip install flask flask-cors

# Start the Flask API
python app.py
```
The backend service runs on `http://127.0.0.1:5000`.
3. Frontend Setup (React Application)
Open a new terminal window:
```bash
# Navigate to the frontend directory
cd ip-tool

# Install node dependencies
npm install

# Start the React development server
npm start
```
The web interface will launch automatically at `http://localhost:3000`.
---
📡 REST API Reference
Endpoint	Method	Input Payload	Example Output
`/validate`	`POST`	`{"ip": "192.168.1.1"}`	`{"valid": true, "class": "Class C", "type": "Private"}`
`/cidr`	`POST`	`{"ip": "192.168.1.50/26"}`	`{"subnet\_mask": "255.255.255.192", "network\_address": "192.168.1.0", "broadcast\_address": "192.168.1.63", "first\_host": "192.168.1.1", "last\_host": "192.168.1.62", "usable\_hosts": 62}`
`/compare`	`POST`	`{"ip1": "10.0.0.0/16", "ip2": "10.0.1.0/24"}`	`{"relationship": "network\_1\_contains\_network\_2"}`
`/hostcalc`	`POST`	`{"hosts": 50}`	`{"cidr": "/26", "usable\_hosts": 62}`
---
👨‍💻 Project Information
Subject: Computer Networks (C.N.) Individual Project
Institution: Lok Jagruti Kendra University (LJKU)
