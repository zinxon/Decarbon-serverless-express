# AWS Serverless Express API

This project is a serverless Express.js API built for AWS, designed to handle merchant and user operations for a loyalty program or coupon system.

## Table of Contents

- [AWS Serverless Express API](#aws-serverless-express-api)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API Endpoints](#api-endpoints)
  - [Database](#database)

## Features

- Merchant management (create, update, get profile)
- Store management
- Activity management
- Coupon management
- User point system
- Favorite system
- Serverless architecture for AWS deployment

## Prerequisites

- Node.js
- npm or yarn
- AWS account and configured AWS CLI
- Sequelize ORM

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-username/aws-serverless-express.git
   ```

2. Install dependencies:

   ```
   yarn install
   ```

3. Initialize Sequelize:

   ```
   npx sequelize init
   ```

4. Set up your environment variables in a `.env` file.

## Usage

To start the application locally:

yarn start-test

For deployment to AWS Lambda, follow AWS Serverless Express deployment guidelines.

## API Endpoints

The API includes various endpoints for merchant and user operations. Some key endpoints include:

- `/merchant/createMerchant`: Create a new merchant
- `/merchant/getMerchantProfile`: Get merchant profile
- `/merchant/createStore`: Create a new store
- `/merchant/createActivity`: Create a new activity
- `/merchant/createCoupon`: Create a new coupon
- `/user/addCoins`: Add coins to a user's account

For a complete list of endpoints, refer to the `routes/merchant.js` and `routes/user.js` files.

## Database

This project uses Sequelize ORM with the following models:

- Merchant
- Store
- Activity
- Coupon
- User
- Favorite
- Record
