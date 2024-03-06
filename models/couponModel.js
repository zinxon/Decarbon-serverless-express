const short = require('short-uuid');
const moment = require('moment-timezone');

const { sequelize, couponTable } = require('./index');

const translator = short();
moment.locale('zh-hk');

// ANCHOR createCoupon
exports.createCoupon = async (params) => {
  try {
    let result = await couponTable.create({
      coupon_id: params.coupon_id,
      merchant_id: params.merchant_id,
      store_id: params.store_id,
      type: params.type,
      require_coins: params.require_coins,
      name : params.name,
      description: params.description,
      generated_reason: params.generated_reason,
      base_discount: params.base_discount,
      percentage_discount: params.percentage_discount,
      photo_url: params.photo_url,
      status: params.status,
      start_date: params.start_date,
      end_date: params.end_date,
      coupon_discount_description: params.coupon_discount_description,
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

// ANCHOR getCouponList
exports.getCouponList = async (limit = 0, offset = 0) => {
  try {
    let parameter = {
      order: [['created_date', 'DESC']]
    }
    if(limit > 0) {
      parameter.limit = limit
    }
    if(offset > 0) {
      parameter.offset = offset
    }
    let result = await couponTable.findAll(parameter)

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

// ANCHOR getCouponListByStoreId
exports.getCouponListByStoreId = async (store_id, limit = 0, offset = 0) => {
  try {
    let parameter = {
      where: {
        store_id
      },
      order: [['created_date', 'DESC']]
    }
    if(limit > 0) {
      parameter.limit = limit
    }
    if(offset > 0) {
      parameter.offset = offset
    }
    let result = await couponTable.findAll(parameter)

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

// ANCHOR getCouponListByMerchantId
exports.getCouponListByMerchantId = async (merchant_id, limit = 0, offset = 0) => {
  try {
    let parameter = {
      where: {
        merchant_id,
        deleted: 0
      },
      order: [['created_date', 'DESC']]
    }
    if(limit > 0) {
      parameter.limit = limit
    }
    if(offset > 0) {
      parameter.offset = offset
    }
    let result = await couponTable.findAll(parameter)

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

// ANCHOR getSpecificCouponByCouponId
exports.getSpecificCouponByCouponId = async (coupon_id) => {
  try {
    let parameter = {
      where: {
        coupon_id: coupon_id,
        deleted: 0
      },
    }
    let result = await couponTable.findOne(parameter)

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

// ANCHOR getSpecificCouponByCouponIdAndMerchantId
exports.getSpecificCouponByCouponIdAndMerchantId = async (coupon_id, merchant_id) => {
  try {
    let parameter = {
      where: {
        coupon_id,
        merchant_id,
        deleted: 0
      },
    }
    let result = await couponTable.findOne(parameter)

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

// ANCHOR updateSpecificCoupon
exports.updateSpecificCoupon = async (coupon_id, params) => {
  let { name, type, description, generated_reason, require_coins, status, base_discount, percentage_discount, start_date, end_date, coupon_discount_description } = params;
  try {
    let updateParameter = {
      name,
      type,
      description,
      generated_reason,
      require_coins,
      status,
      base_discount,
      percentage_discount,
      start_date,
      end_date,
      coupon_discount_description,
      updated_date: moment().tz('Asia/Hong_Kong').format('YYYY-MM-DD HH:mm:ss')
    }
    let queryParameter = {
      where: {
        coupon_id
      },
    }
    let result = await couponTable.update(updateParameter, queryParameter)

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

// ANCHOR deleteSpecificCoupon
exports.deleteSpecificCoupon = async (coupon_id) => {
  // try {
  //   let parameter = {
  //     where: {
  //       coupon_id
  //     },
  //   }
  //   let result = await couponTable.destroy(parameter)

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
        coupon_id
      },
    }
    let result = await couponTable.update(updateParameter, queryParameter)

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

// ANCHOR getCouponListFromMerchantStoreByLatLong
exports.getCouponListFromMerchantStoreByLatLong = async (latitide, longitude, limit = 0, offset = 0, searchField = null) => {
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
          switch(value) {
            case 'discount': {
              searchSQL += `c2.percentage_discount > 0`
              break;
            }
            case 'cash': {
              searchSQL += `c2.base_discount > 0`
              break;
            }
            case 'merchandise': {
              searchSQL += `c2.base_discount <= 0 AND c2.percentage_discount <= 0`
              break;
            }
            default: {
              break;
            }
          }
          if(index < tempSplit.length - 1) {
            searchSQL += ` OR `
          }
        })
        searchSQL += ` ) `
      } else if(searchField.type !== null) {
        switch(searchField.type) {
          case 'discount': {
            searchSQL += ` AND c2.percentage_discount > 0 `
            break;
          }
          case 'cash': {
            searchSQL += ` AND c2.base_discount > 0 `
            break;
          }
          case 'merchandise': {
            searchSQL += ` AND c2.base_discount <= 0 AND c2.percentage_discount <= 0 `
            break;
          }
          default: {
            break;
          }
        }
      }

      // Filter regions
      if(searchField.region !== null && searchField.region.includes(',')) {
        let tempSplit = searchField.region.split(',');
        searchRegionSQL += ` WHERE (`
        tempSplit.forEach((value, index) => {
          searchRegionSQL += `ms1.tags LIKE "%${value}%" OR ms1.address LIKE "%${value}%"`
          if(index < tempSplit.length - 1) {
            searchRegionSQL += ` OR `
          }
        })
        searchRegionSQL += ` ) `
      } else if(searchField.region !== null) {
        searchRegionSQL += ` WHERE ms1.tags LIKE "%${searchField.region}%" OR ms1.address LIKE "%${searchField.region}%" `
      }

      // Filter regions
      if(searchField.search !== null) {
        searchSQL += ` AND (c2.name LIKE "%${searchField.search}%" OR c2.description LIKE "%${searchField.search}%" OR c2.address LIKE "${searchField.search}") `
      }
    } else {
      showPartLimit = ' LIMIT 5 '
    }

    let minCalculateDistanceSQL = `MIN(111.1111 * DEGREES(ACOS(LEAST(1.0, COS(RADIANS(${latitide})) * COS(RADIANS(latitude)) * COS(RADIANS(${longitude}) - RADIANS(longitude)) + SIN(RADIANS(${latitide})) * SIN(RADIANS(latitude)))))) AS distance`

    let sql = `SELECT c1.*, ms.distance, ms.merchant_name FROM coupon c1 INNER JOIN (SELECT merchant_id, MIN(name) AS merchant_name, ${minCalculateDistanceSQL} FROM merchant_store GROUP BY merchant_id) ms ON c1.merchant_id = ms.merchant_id WHERE coupon_id in (SELECT coupon_id FROM (SELECT coupon_id FROM coupon c2 WHERE c2.merchant_id = c1.merchant_id AND c2.start_date < CURDATE() AND c2.end_date > CURDATE() AND c2.status = 1 ${searchSQL} ORDER BY c2.created_date DESC ${showPartLimit}) c2) AND c1.deleted = 0 ORDER BY ms.distance, c1.created_date DESC`

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

// ANCHOR getCouponListFromMerchantStore
exports.getCouponListFromMerchantStore = async (limit = 0, offset = 0, searchField = null) => {
  try {
    let searchSQL = '';
    let searchRegionSQL = '';
    if(searchField !== null && Object.keys(searchField).length > 0) {
      // Filter types
      if(searchField.type !== null && searchField.type.includes(',')) {
        let tempSplit = searchField.type.split(',');
        searchSQL += ` AND ( `
        tempSplit.forEach((value, index) => {
          switch(value) {
            case 'discount': {
              searchSQL += `c2.percentage_discount > 0`
              break;
            }
            case 'cash': {
              searchSQL += `c2.base_discount > 0`
              break;
            }
            case 'merchandise': {
              searchSQL += `c2.base_discount <= 0 AND c2.percentage_discount <= 0`
              break;
            }
            default: {
              break;
            }
          }
        })
        searchSQL += ` ) `
        if(index < tempSplit.length - 1) {
          searchSQL += ` OR `
        }
      } else if(searchField.type !== null) {
        switch(searchField.type) {
          case 'discount': {
            searchSQL += ` AND c2.percentage_discount > 0 `
            break;
          }
          case 'cash': {
            searchSQL += ` AND c2.base_discount > 0 `
            break;
          }
          case 'merchandise': {
            searchSQL += ` AND c2.base_discount <= 0 AND c2.percentage_discount <= 0 `
            break;
          }
          default: {
            break;
          }
        }
      }

      // Filter regions
      if(searchField.region !== null && searchField.region.includes(',')) {
        let tempSplit = searchField.region.split(',');
        searchRegionSQL += ` AND (`
        tempSplit.forEach((value, index) => {
          searchRegionSQL += `m.tags LIKE "%${value}%" OR m.address LIKE "%${value}%"`
          if(index < tempSplit.length - 1) {
            searchRegionSQL += ` OR `
          }
        })
        searchRegionSQL += `) `
      } else if(searchField.region !== null) {
        searchRegionSQL += ` AND (m.tags LIKE "%${searchField.region}%" OR m.address LIKE "%${searchField.region}%")`
      }

      // Filter regions
      if(searchField.search !== null) {
        searchSQL += ` AND (c2.name LIKE "%${searchField.search}%" OR c2.description LIKE "%${searchField.search}%") `
      }
    }

    let sql = `SELECT c1.*, m.name AS merchant_name FROM coupon c1 INNER JOIN merchant m ON c1.merchant_id = m.merchant_id ${searchRegionSQL} WHERE coupon_id in (SELECT coupon_id FROM (SELECT coupon_id FROM coupon c2 WHERE c2.merchant_id = c1.merchant_id AND c2.start_date < CURDATE() AND c2.end_date > CURDATE() AND c2.status = 1 ${searchSQL} ORDER BY c2.created_date DESC LIMIT 5) c2) AND c1.deleted = 0 ORDER BY c1.merchant_id, c1.created_date DESC`

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

exports.getCouponListByMerchantIdWithCount = async (merchant_id, limit = 0, offset = 0) => {
  try {
    let sql = `SELECT c.*, IF(r.participation_count IS NULL, 0, r.participation_count) as participation_count, IF(r2.total_user_redeemed_count IS NULL, 0, r2.total_user_redeemed_count) as total_user_redeemed_count FROM coupon c LEFT JOIN (SELECT coupon_id, count(*) as participation_count FROM record WHERE coupon_id IS NOT NULL AND coupon_id != '' AND status = 0 GROUP BY coupon_id) r ON c.coupon_id = r.coupon_id LEFT JOIN (SELECT coupon_id, count(*) as total_user_redeemed_count FROM record WHERE coupon_id IS NOT NULL AND coupon_id != '' GROUP BY coupon_id) r2 ON c.coupon_id = r2.coupon_id WHERE merchant_id = "${merchant_id}" AND deleted = 0`;

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
