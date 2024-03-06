const short = require('short-uuid');
const moment = require('moment-timezone');

const { sequelize, activityTable, merchantTable } = require('./index');

const translator = short();
moment.locale('zh-hk');

// ANCHOR createActivity
exports.createActivity = async (params) => {
  try {
    let result = await activityTable.create({
      activity_id: params.activity_id,
      merchant_id: params.merchant_id,
      store_id: params.store_id,
      name : params.name,
      address: params.address,
      reward_coins: params.reward_coins,
      photo_url: params.photo_url,
      description: params.description,
      form_of_participation: params.form_of_participation,
      status: params.status,
      type: params.type,
      start_date: params.start_date,
      end_date: params.end_date,
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

// ANCHOR getActivityList
exports.getActivityList = async (limit = 0, offset = 0) => {
  try {
    let parameter = {
      order: ['created_date', 'DESC']
    }
    if(limit > 0) {
      parameter.limit = limit
    }
    if(offset > 0) {
      parameter.offset = offset
    }
    let result = await activityTable.findAll(parameter)

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

// ANCHOR getActivityListByStoreId
exports.getActivityListByStoreId = async (store_id, limit = 0, offset = 0) => {
  try {
    let parameter = {
      where: {
        store_id
      },
      order: ['created_date', 'DESC']
    }
    if(limit > 0) {
      parameter.limit = limit
    }
    if(offset > 0) {
      parameter.offset = offset
    }
    let result = await activityTable.findAll(parameter)

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

// ANCHOR getActivityListByMerchantId
exports.getActivityListByMerchantId = async (merchant_id, limit = 0, offset = 0) => {
  try {
    let parameter = {
      where: {
        merchant_id
      },
      order: [['created_date', 'DESC']]
    }
    if(limit > 0) {
      parameter.limit = limit
    }
    if(offset > 0) {
      parameter.offset = offset
    }
    let result = await activityTable.findAll(parameter)

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

// ANCHOR getSpecificActivityByActivityId
exports.getSpecificActivityByActivityId = async (activity_id) => {
  try {
    let parameter = {
      where: {
        activity_id: activity_id,
        deleted: 0
      },
    }
    let result = await activityTable.findOne(parameter)

    return {
      success: true,
      data: result['dataValues']
    }
  } catch(err) {
    return {
      success: false,
      err
    }
  }
}

// ANCHOR getSpecificActivityByActivityIdAndMerchantId
exports.getSpecificActivityByActivityIdAndMerchantId = async (activity_id, merchant_id) => {
  try {
    let parameter = {
      where: {
        activity_id,
        merchant_id,
        deleted: 0
      },
    }
    let result = await activityTable.findOne(parameter)

    return {
      success: true,
      data: result['dataValues']
    }
  } catch(err) {
    return {
      success: false,
      err
    }
  }
}

// ANCHOR updateSpecificActivity
exports.updateSpecificActivity = async (activity_id, params) => {
  let { name, address, status, type, description, reward_coins, form_of_participation, start_date, end_date } = params;
  try {
    let updateParameter = {
      name,
      address,
      status,
      type,
      description,
      reward_coins,
      form_of_participation,
      start_date,
      end_date,
      updated_date: moment().tz('Asia/Hong_Kong').format('YYYY-MM-DD HH:mm:ss')
    }
    let queryParameter = {
      where: {
        activity_id
      },
    }
    let result = await activityTable.update(updateParameter, queryParameter)

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

// ANCHOR deleteSpecificActivity
exports.deleteSpecificActivity = async (activity_id) => {
  // try {
  //   let parameter = {
  //     where: {
  //       activity_id
  //     },
  //   }
  //   let result = await activityTable.destroy(parameter)

  //   return {
  //     success: true,
  //     data: result
  //   }
  // } catch(err) {
  //   return {
  //     success: false,
  //     err
  //   }
  // }
  try {
    let updateParameter = {
      deleted: 1,
      updated_date: moment().tz('Asia/Hong_Kong').format('YYYY-MM-DD HH:mm:ss')
    }
    let queryParameter = {
      where: {
        activity_id
      },
    }
    let result = await activityTable.update(updateParameter, queryParameter)

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

// ANCHOR getActivityListFromMerchantStoreByLatLong
exports.getActivityListFromMerchantStoreByLatLong = async (latitide, longitude, limit = 0, offset = 0, searchField = null) => {
  try {
    let searchSQL = '';
    let searchRegionSQL = '';
    let showPartLimit = '';
    if(searchField !== null && Object.keys(searchField).length > 0) {
      // Filter types
      if(searchField.type !== null && searchField.type.includes(',')) {
        let tempSplit = searchField.type.split(',');
        searchSQL += ` AND ( `
        tempSplit.forEach((value, index) => {
          searchSQL += `a2.type LIKE "%${value}%"`
          if(index < tempSplit.length - 1) {
            searchSQL += ` OR `
          }
        })
        searchSQL += ` ) `
      } else if(searchField.type !== null) {
        searchSQL += ` AND a2.type LIKE "%${searchField.type}%" `
      }

      // Filter regions
      if(searchField.region !== null && searchField.region.includes(',')) {
        let tempSplit = searchField.region.split(',');
        searchSQL += ` AND ( `
        searchRegionSQL += ` WHERE (`
        tempSplit.forEach((value, index) => {
          searchSQL += `a2.address LIKE "%${value}%"`
          searchRegionSQL += `ms1.tags LIKE "%${value}%" OR ms1.address LIKE "%${value}%"`
          if(index < tempSplit.length - 1) {
            searchSQL += ` OR `
            searchRegionSQL += ` OR `
          }
        })
        searchSQL += ` ) `  
        searchRegionSQL += ` ) `
      } else if(searchField.region !== null) {
        searchSQL += ` AND a2.address LIKE "%${searchField.region}%" `
        searchRegionSQL += ` WHERE ms1.tags LIKE "%${searchField.region}%" OR ms1.address LIKE "%${searchField.region}%" `
      }

      // Filter regions
      if(searchField.search !== null) {
        searchSQL += ` AND (a2.name LIKE "%${searchField.search}%" OR a2.description LIKE "%${searchField.search}%" OR a2.address LIKE "${searchField.search}") `
      }
    } else {
      showPartLimit = ' LIMIT 5 '
    }

    let minCalculateDistanceSQL = `MIN(111.1111 * DEGREES(ACOS(LEAST(1.0, COS(RADIANS(${latitide})) * COS(RADIANS(latitude)) * COS(RADIANS(${longitude}) - RADIANS(longitude)) + SIN(RADIANS(${latitide})) * SIN(RADIANS(latitude)))))) AS distance`

    let sql = `SELECT a1.*, ms.distance, ms.merchant_name FROM activity a1 INNER JOIN (SELECT merchant_id, MIN(name) AS merchant_name, ${minCalculateDistanceSQL} FROM merchant_store ms1 ${searchRegionSQL} GROUP BY merchant_id) ms ON a1.merchant_id = ms.merchant_id WHERE activity_id in (SELECT activity_id FROM (SELECT activity_id FROM activity a2 WHERE a2.merchant_id = a1.merchant_id AND a2.start_date < CURDATE() AND a2.end_date > CURDATE() AND a2.status = 1 ${searchSQL} ORDER BY created_date DESC ${showPartLimit}) a2) AND a1.deleted = 0 ORDER BY ms.distance, a1.created_date DESC`

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

// ANCHOR getActivityListFromMerchantStore
exports.getActivityListFromMerchantStore = async (limit = 0, offset = 0, searchField = null) => {
  try {
    let searchSQL = '';
    let searchRegionSQL = '';
    if(searchField !== null && Object.keys(searchField).length > 0) {
      // Filter types
      if(searchField.type !== null && searchField.type.includes(',')) {
        let tempSplit = searchField.type.split(',');
        searchSQL += ` AND ( `
        tempSplit.forEach((value, index) => {
          searchSQL += `a2.type LIKE "%${value}%"`
          if(index < tempSplit.length - 1) {
            searchSQL += ` OR `
          }
        })
        searchSQL += ` ) `
      } else if(searchField.type !== null) {
        searchSQL += ` AND a2.type LIKE "%${searchField.type}%" `
      }

      // Filter regions
      if(searchField.region !== null && searchField.region.includes(',')) {
        let tempSplit = searchField.region.split(',');
        searchSQL += ` AND ( `
        searchRegionSQL += ` AND (`
        tempSplit.forEach((value, index) => {
          searchSQL += `a2.address LIKE "%${value}%"`
          searchRegionSQL += `m.tags LIKE "%${value}%" OR m.address LIKE "%${value}%"`
          if(index < tempSplit.length - 1) {
            searchSQL += ` OR `
            searchRegionSQL += ` OR `
          }
        })
        searchSQL += ` ) `
        searchRegionSQL += ` ) `
      } else if(searchField.region !== null) {
        searchSQL += ` AND a2.address LIKE "%${searchField.region}%" `
        searchRegionSQL += ` AND (m.tags LIKE "%${searchField.region}%" OR m.address LIKE "%${searchField.region}%")`
      }

      // Filter regions
      if(searchField.search !== null) {
        searchSQL += ` AND (a2.name LIKE "%${searchField.search}%" OR a2.description LIKE "%${searchField.search}%" OR a2.address LIKE "${searchField.search}") `
      }
    }

    let sql = `SELECT a1.*, m.name AS merchant_name FROM activity a1 INNER JOIN merchant m ON a1.merchant_id = m.merchant_id ${searchRegionSQL} WHERE activity_id in (SELECT activity_id FROM (SELECT activity_id FROM activity a2 WHERE a2.merchant_id = a1.merchant_id AND a2.start_date < CURDATE() AND a2.end_date > CURDATE() AND a2.status = 1 ${searchSQL} ORDER BY created_date DESC LIMIT 5) a2) AND a1.deleted = 0 ORDER BY a1.merchant_id, a1.created_date DESC`

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

// ANCHOR getSpecificActivityWithMerchantByActivityId
exports.getSpecificActivityWithMerchantByActivityId = async (activity_id) => {
  try {
    let parameter = {
      where: {
        activity_id: activity_id
      },
    }
    let result = await activityTable.findOne(parameter)

    return {
      success: true,
      data: result['dataValues']
    }
  } catch(err) {
    return {
      success: false,
      err
    }
  }
}

exports.getActivityListByMerchantIdWithCount = async (merchant_id, limit = 0, offset = 0) => {
  try {
    let sql = `SELECT a.*, IF(r.participation_count IS NULL, 0, r.participation_count) as participation_count FROM database_development.activity a LEFT JOIN (SELECT activity_id, count(*) as participation_count FROM database_development.record WHERE activity_id IS NOT NULL AND activity_id != '' AND status = 1 GROUP BY activity_id) r ON a.activity_id = r.activity_id WHERE merchant_id = "${merchant_id}" AND deleted = 0`;

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