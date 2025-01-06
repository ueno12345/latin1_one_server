# latin1_one_client
latin1_one_server is part of an order management system.<br>
latin1_one_server is a tool used in combination with [latin1_one_client](https://github.com:ueno12345/latin1_one_client.git).<br>
latin1_one_server is the backend server for the order management system.

# Requirements
+ node v20.10.0

# Setup
## latin1_one_server
1. Download modernTimes
   ```bash
   $ git clone https://github.com:ueno12345/latin1_one_server.git
   ```

# Preparation
1. Set up [latin1_one_server](https://github.com:ueno12345/latin1_one_server.git)
2. Prepare `serviceAccountKey.json` for firebase
   ```bash
   $ vim serviceAccountKey.json
   ```

# Launch
1. Execute `npm install`
   ```bash
   $ npm install
   ```
2. Launch
   ```bash
   $ npm start
   ```

# ExcelController
The `ExcelController` provides endpoints for managing Excel files, including downloading data from Firebase as Excel files and uploading Excel files to parse and register data in Firestore.
## Endpoints
### 1. `POST /excel/download`
#### Description
Generates and downloads an Excel file based on the specified data type (`shop` or `product`) by retrieving data from Firebase.

#### Request
- **Body**:
  ```json
  {
    "dataType": "shop" | "product"
  }
- **Example**:
  ```bash
  curl -X POST http://localhost:3000/excel/download \
  -H "Content-Type: application/json" \
  -d '{"dataType": "shop"}'
### 2. `POST /excel/upload`

#### Description
This endpoint allows users to upload Excel files. The uploaded file is saved on the server, parsed, and its contents are registered in Firestore.

#### Request
- **Request Format**: `multipart/form-data`
- **File Key**: `file`

- **Example**:
  ```bash
  curl -X POST http://localhost:3000/excel/upload \
  -F "file=@path/to/your/file.xlsx"

# RegisterController

The `RegisterController` provides endpoints for registering data to Firebase and managing notifications. It includes methods for registering general data and inbox data while sending notifications.

## Endpoints
### 1. `POST /register/data`
#### Description
Registers general data (category, title, body, and image) to Firebase.
#### Request
- **Body**:
  ```json
  {
    "category": "string",
    "title": "string",
    "body": "string",
    "image": "string"
  }
- **Example**:
  ```bash
  curl -X POST http://localhost:3000/register/data \
  -H "Content-Type: application/json" \
  -d '{
    "category": "news",
    "title": "Latest Updates",
    "body": "Here are the latest updates.",
    "image": "https://example.com/image.png"
    }'
### 2. `POST /register/inbox`
#### Description
Registers inbox data (topic, title, body, and image) to Firebase and sends a notification to all users subscribed to the specified topic.
#### Request
- **Body**:
  ```json
  {
    "topic": "string",
    "title": "string",
    "body": "string",
    "image": "string"
  }'
- **Example**:
  ```bash
  curl -X POST http://localhost:3000/register/inbox \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "updates",
    "title": "Important Announcement",
    "body": "Please check the new updates.",
    "image": "https://example.com/announcement.png"
    }'

# AcquireController
The `AcquireController` provides endpoints for retrieving data from Firebase. It supports fetching nested data and specific order data for shops.
## Endpoints
### 1. `POST /acquire/data`
#### Description
Fetches nested data from Firebase based on the provided collection, document, and optional subcollection details.
#### Request
- **Body**:
  ```json
  {
    "collectionId": "string",
    "documentId": "string",
    "subCollectionId": "string (optional)",
    "subDocumentId": "string (optional)"
  }
- **Example**:
  ```bash
  curl -X POST http://localhost:3000/acquire/data \
  -H "Content-Type: application/json" \
  -d '{
    "collectionId": "shops",
    "documentId": "ShopExample",
    "subCollectionId": "products"
  }'
### 2. `POST /acquire/order`
#### Description
Fetches order data for a specified shop from Firebase and flattens the nested data structure.
#### Request
- **Body**:
  ```json
  {
    "shop": "string"
  }'
- **Example**:
  ```bash
  curl -X POST http://localhost:3000/acquire/order \
  -H "Content-Type: application/json" \
  -d '{
    "shop": "ShopExample"
  }'
