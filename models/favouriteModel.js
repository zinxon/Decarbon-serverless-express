const short = require('short-uuid');
const moment = require('moment-timezone');

const { sequelize, favouriteTable } = require('./index');

const translator = short();
moment.locale('zh-hk');

// ANCHOR createFavourite
exports.createFavourite = async (params) => {
  try {
    let result = await favouriteTable.create({
      user_id: params.user_id,
      merchant_id: params.merchant_id,
      store_id: params.store_id,
      created_date: moment().tz('Asia/Hong_Kong').format('YYYY-MM-DD HH:mm:ss'),
      updated_date: moment().tz('Asia/Hong_Kong').format('YYYY-MM-DD HH:mm:ss')
    })

    return {
      success: true,
      data: params
    }
  } catch(err) {
    return {
      success: false,
      err
    }
  }
}

// ANCHOR getUserFavouriteList
exports.getUserFavouriteList = async(user_id) => {
  try {
    let parameter = {
      where: {
        user_id,
      },
    }
    let result = await favouriteTable.findAll(parameter)

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

// ANCHOR getSpecificFavourite
exports.getSpecificFavourite = async (user_id, merchant_id, store_id = null) => {
  try {
    let parameter = {
      where: {
        user_id,
        merchant_id,
      },
    }
    if(store_id !== null) {
      parameter['where']['store_id'] = store_id;
    }
    let result = await favouriteTable.findAll(parameter)
  
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

// ANCHOR deleteSpecificFavourite
exports.deleteSpecificFavourite = async (user_id, merchant_id, store_id = null) => {
  try {
    let parameter = {
      where: {
        user_id,
        merchant_id,
      },
    }
    if(store_id !== null) {
      parameter['where']['store_id'] = store_id;
    }
    let result = await favouriteTable.destroy(parameter)

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

// ANCHOR getSpecificFavouriteWithUserInfo
exports.getSpecificFavouriteWithUserInfo = async (user_id, login_id, merchant_id, store_id = null) => {
  try {
    let sql = `SELECT * FROM favourite f INNER JOIN user u ON f.user_id = u.user_id WHERE u.user_id = "${user_id}" AND u.login_id = "${login_id}" AND f.merchant_id = "${merchant_id}"`;
    if(store_id !== null) {
      sql += ` AND f.store_id = "${store_id}"`;
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


// ANCHOR getUserFavouriteListWithMerchantStore
exports.getUserFavouriteListWithMerchantStore = async (user_id, login_id, limit = 0, offset = 0) => {
  try {
    let sql = `SELECT ms.*, f.created_date AS date FROM favourite f INNER JOIN user u ON f.user_id = u.user_id INNER JOIN merchant_store ms ON f.merchant_id = ms.merchant_id AND f.store_id = ms.store_id WHERE u.user_id = "${user_id}" AND u.login_id = "${login_id}" ORDER BY date DESC`;

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