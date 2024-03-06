'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  if(process.env.DATABASE_IP !== undefined) {
    let modifiedConfig = {...config, host: process.env.DATABASE_IP};
    sequelize = new Sequelize(config.database, config.username, config.password, modifiedConfig);
  } else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
  }
}

// Define model here
// ANCHOR activity table
exports.activityTable = sequelize.define('activity', {
  activity_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
  },
  merchant_id: {
    type: Sequelize.STRING(64),
    allowNull: false
  },
  store_id: {
    type: Sequelize.STRING(64),
    allowNull: false
  },
  name: {
    type: Sequelize.STRING(64),
    allowNull: false
  },
  address: {
    type: Sequelize.STRING(256),
    allowNull: false
  },
  reward_coins: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  photo_url: Sequelize.STRING(128),
  description: Sequelize.TEXT,
  form_of_participation: Sequelize.STRING(64),
  status: {
    type: Sequelize.STRING(64),
    defaultValue: 1
  },
  deleted: {
    type: Sequelize.TINYINT(1),
    defaultValue: 0
  },
  type: Sequelize.STRING(64),
  start_date: 'TIMESTAMP',
  end_date: 'TIMESTAMP',
  created_date: {
    type: 'TIMESTAMP',
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  },
  updated_date: {
    type: 'TIMESTAMP',
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  }
}, { timestamps: false, freezeTableName: true });

// ANCHOR coupon table
exports.couponTable = sequelize.define('coupon', {
  coupon_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
  },
  merchant_id: {
    type: Sequelize.STRING(64),
    allowNull: false
  },
  store_id: {
    type: Sequelize.STRING(64),
    allowNull: false
  },
  type: Sequelize.STRING(32),
  require_coins: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  name: {
    type: Sequelize.STRING(64),
    allowNull: false
  },
  description: Sequelize.TEXT,
  generated_reason: Sequelize.STRING(64),
  base_discount: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  percentage_discount: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  photo_url: Sequelize.STRING(128),
  status: {
    type: Sequelize.TINYINT(1),
    defaultValue: 1
  },
  deleted: {
    type: Sequelize.TINYINT(1),
    defaultValue: 0
  },
  start_date: 'TIMESTAMP',
  end_date: 'TIMESTAMP',
  coupon_discount_description: Sequelize.STRING(255),
  created_date: {
    type: 'TIMESTAMP',
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  },
  updated_date: {
    type: 'TIMESTAMP',
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  }
}, { timestamps: false, freezeTableName: true });

// ANCHOR merchant table
exports.merchantTable = sequelize.define('merchant', {
  merchant_id: {
    type: Sequelize.STRING(64),
    primaryKey: true,
  },
  login_id: {
    type: Sequelize.STRING(64),
    allowNull: false
  },
  name: {
    type: Sequelize.STRING(64),
    allowNull: false
  },
  description: Sequelize.TEXT,
  address: {
    type: Sequelize.STRING(256),
    allowNull: false
  },
  phone: Sequelize.STRING(16),
  email: Sequelize.STRING(32),
  opening_period: Sequelize.TEXT,
  photo_url: Sequelize.STRING(128),
  website: Sequelize.STRING(64),
  openrice: Sequelize.STRING(64),
  facebook: Sequelize.STRING(64),
  instagram: Sequelize.STRING(64),
  tags: Sequelize.TEXT,
  business_registration_number: Sequelize.STRING(64),
  created_date: {
    type: 'TIMESTAMP',
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  },
  updated_date: {
    type: 'TIMESTAMP',
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  }
}, { timestamps: false, freezeTableName: true });

// ANCHOR record table
exports.recordTable = sequelize.define('record', {
  record_id: {
    type: Sequelize.STRING(64),
    primaryKey: true,
    autoIncrement: true
  },
  activity_id: Sequelize.INTEGER,
  coupon_id: Sequelize.INTEGER,
  merchant_id: {
    type: Sequelize.STRING(64),
    allowNull: false
  },
  user_id: {
    type: Sequelize.STRING(64),
    allowNull: false
  },
  store_id: {
    type: Sequelize.STRING(64),
    allowNull: false
  },
  type: {
    type: Sequelize.STRING(16),
    allowNull: false,
  },
  coins: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  user_old_coins: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  user_new_coins: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  remarks: Sequelize.STRING(256),
  status: {
    type: Sequelize.TINYINT(1),
    defaultValue: 1
  },
  created_date: {
    type: 'TIMESTAMP',
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  },
  updated_date: {
    type: 'TIMESTAMP',
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  }
}, { timestamps: false, freezeTableName: true });

// ANCHOR store table
exports.storeTable = sequelize.define('store', {
  store_id: {
    type: Sequelize.STRING(64),
    primaryKey: true,
  },
  merchant_id: {
    type: Sequelize.STRING(64),
    allowNull: false
  },
  login_id: {
    type: Sequelize.STRING(64),
    allowNull: false
  },
  name: {
    type: Sequelize.STRING(16),
    allowNull: false
  },
  opening_period: Sequelize.TEXT,
  phone: Sequelize.STRING(16),
  latitude: Sequelize.DOUBLE,
  longitude: Sequelize.DOUBLE,
  address: {
    type: Sequelize.STRING(256),
    allowNull: false
  },
  created_date: {
    type: 'TIMESTAMP',
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  },
  updated_date: {
    type: 'TIMESTAMP',
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  }
}, { timestamps: false, freezeTableName: true });

// ANCHOR user table
exports.userTable = sequelize.define('user', {
  user_id: {
    type: Sequelize.STRING(64),
    primaryKey: true,
  },
  login_id: {
    type: Sequelize.STRING(64),
    allowNull: false
  },
  first_name: Sequelize.STRING(64),
  last_name: Sequelize.STRING(64),
  gender: Sequelize.STRING(4),
  phone: Sequelize.STRING(16),
  email: Sequelize.STRING(32),
  coins: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  photo_url: Sequelize.STRING(128),
  created_date: {
    type: 'TIMESTAMP',
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  },
  updated_date: {
    type: 'TIMESTAMP',
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  }
}, { timestamps: false, freezeTableName: true });

// ANCHOR favourite table
exports.favouriteTable = sequelize.define('favourite', {
  favourite_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: Sequelize.STRING(64),
    allowNull: false
  },
  merchant_id: {
    type: Sequelize.STRING(64),
    allowNull: false
  },
  store_id: {
    type: Sequelize.STRING(64),
    allowNull: false
  },
  created_date: {
    type: 'TIMESTAMP',
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  },
  updated_date: {
    type: 'TIMESTAMP',
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  }
}, { timestamps: false, freezeTableName: true });

// ANCHOR news table
exports.newsTable = sequelize.define('news', {
  news_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING(128),
  },
  content: {
    type: Sequelize.TEXT,
  },
  photo_url: {
    type: Sequelize.STRING(64),
  },
  author: {
    type: Sequelize.STRING(64),
  },
  created_date: {
    type: 'TIMESTAMP',
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  },
  updated_date: {
    type: 'TIMESTAMP',
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  }
}, { timestamps: false, freezeTableName: true })

exports.sequelize = sequelize;
