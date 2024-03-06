var short = require('short-uuid');
var moment = require('moment-timezone');

const { sequelize, recordTable } = require('./index');

var translator = short();
moment.locale('zh-hk');

// ANCHOR createRecord
exports.createRecord = async (params) => {
  try {
    let result = await recordTable.create({
      activity_id: params.activity_id,
      coupon_id: params.coupon_id,
      merchant_id : params.merchant_id,
      user_id: params.user_id,
      store_id: params.store_id,
      type: params.type,
      coins: params.coins,
      user_old_coins: params.user_old_coins,
      user_new_coins: params.user_new_coins,
      remarks: params.remarks,
      status: params.status,
      created_date: moment().tz('Asia/Hong_Kong').format('YYYY-MM-DD HH:mm:ss'),
      updated_date: moment().tz('Asia/Hong_Kong').format('YYYY-MM-DD HH:mm:ss')
    })

    return {
      success: true,
      data: params
    };
  } catch(err) {
    return {
      success: false,
      err
    }
  }
}

// ANCHOR deleteRecord
exports.deleteRecord = async (record_id, user_id, merchant_id) => {
  try {
    let parameter = {
      where: {
        record_id,
        user_id,
        merchant_id
      },
    }
    let result = await recordTable.destroy(parameter)
  } catch(err) {
    return {
      success: false,
      err
    }
  }
}

// ANCHOR getCouponRecordByUserId
exports.getCouponRecordByUserId = async (user_id, limit = 0, offset = 0, status = 1) => {
  try {
    let sql = `SELECT r.record_id, m.name AS merchant_name, m.photo_url AS merchant_photo_url, c.* FROM record r INNER JOIN coupon c ON r.coupon_id = c.coupon_id AND r.type = 'coupon' INNER JOIN merchant m ON r.merchant_id = m.merchant_id WHERE r.status = ${status} AND r.user_id = '${user_id}' ORDER BY r.created_date, r.merchant_id`

    if(limit > 0) {
      sql += ` LIMIT ${limit} `;
    }
    if(offset > 0) {
      sql += ` OFFSET ${offset} `;
    }

    let result = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})

    return {
      success: true,
      data: result
    }
  } catch(err) {
    return {
      success: false,
      err
    }
  }
}

// ANCHOR updateCouponRecord
exports.updateCouponRecord = async (record_id, status) => {
  try {
    let updateParameter = {
      status,
      updated_date: moment().tz('Asia/Hong_Kong').format('YYYY-MM-DD HH:mm:ss')
    }
    let queryParameter = {
      where: {
        record_id
      },
    }
    let result = await recordTable.update(updateParameter, queryParameter)

    return {
      success: true,
      data: result
    }
  } catch(err) {
    return {
      success: false,
      err
    }
  }
}

// ANCHOR getActivityRecordByUserId
exports.getActivityRecordByUserId = async (user_id, limit = 0, offset = 0) => {
  try {
    let sql = `SELECT r.record_id, m.name AS merchant_name, m.photo_url AS merchant_photo_url, a.* FROM record r INNER JOIN activity a ON r.activity_id = a.activity_id AND r.type = 'activity' INNER JOIN merchant m ON r.merchant_id = m.merchant_id WHERE r.user_id = '${user_id}' ORDER BY r.created_date DESC`

    if(limit > 0) {
      sql += ` LIMIT ${limit} `;
    }
    if(offset > 0) {
      sql += ` OFFSET ${offset} `;
    }

    let result = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})

    return {
      success: true,
      data: result
    }
  } catch(err) {
    return {
      success: false,
      err
    }
  }
}

// ANCHOR getRecordsByUserId
exports.getRecordsByUserId = async (user_id, limit = 0, offset = 0, date = null, type = 'all') => {
  try {
    let whereSQL = ``;
    if(date !== null) {
      let dateSplit = date.split('/');
      whereSQL += ` AND r.created_date >= '${moment([dateSplit[0], dateSplit[1] - 1]).tz('Asia/Hong_Kong').format('YYYY-MM-DD')}' AND r.created_date <= '${moment([dateSplit[0], dateSplit[1] - 1]).tz('Asia/Hong_Kong').endOf('month').format('YYYY-MM-DD')}'`
    }
    if(type == 'coins' || type == 'coupon' || type == 'activity') {
      whereSQL += ` AND r.type = '${type}'`
    }
    let sql = `SELECT r.record_id, r.coins, r.user_old_coins, r.user_new_coins, r.remarks, r.type, r.status, r.created_date, m.name AS merchant_name, m.photo_url AS merchant_photo_url, c.name AS coupon_name, c.photo_url AS coupon_photo_url, c.base_discount AS coupon_base_discount, c.percentage_discount AS coupon_percentage_discount, a.name AS activity_name, a.photo_url AS activity_photo_url, a.type AS activity_type FROM record r LEFT JOIN merchant m ON r.merchant_id = m.merchant_id LEFT JOIN coupon c ON r.coupon_id = c.coupon_id LEFT JOIN activity a ON r.activity_id = a.activity_id WHERE r.user_id = '${user_id}' ${whereSQL} ORDER BY r.created_date DESC`

    if(limit > 0) {
      sql += ` LIMIT ${limit}`
    }
    if(offset > 0) {
      sql += ` OFFSET ${offset}`
    }

    let result = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})

    return {
      success: true,
      data: result
    }
  } catch(err) {
    return {
      success: false,
      err
    }
  }
}

// ANCHOR getRecordsByMerchantIdAndStoreId
exports.getRecordsByMerchantIdAndStoreId = async (merchant_id, store_id, limit = 0, offset = 0, date = null, type = 'all') => {
  try {
    let whereSQL = ``;
    if(date !== null) {
      let dateSplit = date.split('/');
      whereSQL += ` AND r.created_date >= '${moment([dateSplit[0], dateSplit[1] - 1]).tz('Asia/Hong_Kong').format('YYYY-MM-DD')}' AND r.created_date <= '${moment([dateSplit[0], dateSplit[1] - 1]).tz('Asia/Hong_Kong').endOf('month').format('YYYY-MM-DD')}'`
    }
    if(type == 'coins' || type == 'coupon' || type == 'activity') {
      whereSQL += ` AND r.type = '${type}'`
    }
    let sql = `SELECT r.record_id, r.coins, r.user_old_coins, r.user_new_coins, r.remarks, r.type, r.status, r.created_date, u.photo_url AS user_photo_url, u.first_name AS user_first_name, u.last_name AS user_last_name, c.name AS coupon_name, c.photo_url AS coupon_photo_url, c.base_discount AS coupon_base_discount, c.percentage_discount AS coupon_percentage_discount, c.type AS coupon_type, a.name AS activity_name, a.photo_url AS activity_photo_url, a.type AS activity_type FROM record r INNER JOIN user u ON r.user_id = u.user_id LEFT JOIN coupon c ON r.coupon_id = c.coupon_id LEFT JOIN activity a ON r.activity_id = a.activity_id WHERE r.merchant_id = '${merchant_id}' AND r.store_id = '${store_id}' ${whereSQL} ORDER BY r.created_date DESC`

    if(limit > 0) {
      sql += ` LIMIT ${limit}`
    }
    if(offset > 0) {
      sql += ` OFFSET ${offset}`
    }

    let result = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})

    return {
      success: true,
      data: result
    }
  } catch(err) {
    return {
      success: false,
      err
    }
  }
}

// ANCHOR getRecordByUserIdAndActivityId
exports.getRecordByUserIdAndActivityId = async (user_id, activity_id) => {
  try {
    let parameter = {
      where: {
        user_id,
        activity_id
      }
    }
    let result = await recordTable.findAll(parameter)

    return {
      success: true,
      data: result
    }
  } catch(err) {
    return {
      success: false,
      err
    }
  }
}

// ANCHOR getRecordByHash
exports.getRecordByHash = async (hash) => {
  try {
    let sql = `SELECT * FROM (SELECT *, MD5(CONCAT(CONCAT(CONCAT(CONCAT(record_id, "|"), coupon_id), "|"), user_id)) as hash FROM record) r WHERE r.hash = "${hash}"`;

    let result = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})

    return {
      success: true,
      data: result
    }
  } catch(err) {
    return {
      success: false,
      err
    }
  }
}

