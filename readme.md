# AWS Serverless Express API

This project is a serverless Express.js API built for AWS, designed to handle merchant and user operations for a loyalty program or coupon system.

## Table of Contents

- [AWS Serverless Express API](#aws-serverless-express-api)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)

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
