const short = require('short-uuid');
const moment = require('moment-timezone');

const { sequelize, merchantTable } = require('./index');

const translator = short();
moment.locale('zh-hk');

// ANCHOR createMerchant
exports.createMerchant = async (params) => {
  try {
    let result = await merchantTable.create({
      merchant_id: params.merchant_id,
      login_id: params.login_id,
      name: params.name,
      description: params.description,
      address : params.address,
      phone: params.phone,
      email: params.email,
      opening_period: params.opening_period,
      photo_url: params.photo_url,
      website: params.website,
      openrice: params.openrice,
      facebook: params.facebook,
      instagram: params.instagram,
      tags: params.tags,
      business_registration_number: params.business_registration_number,
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

// ANCHOR getMerchantList
exports.getMerchantList = async (limit = 0, offset = 0) => {
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
    let result = await merchantTable.findAll(parameter)

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

// ANCHOR getSpecificMerchantByLoginId
exports.getSpecificMerchantByLoginId = async (login_id) => {
  try {
    let parameter = {
      where: {
        login_id
      },
    }
    let result = await merchantTable.findOne(parameter)

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

// ANCHOR getSpecificMerchantByMerchantId
exports.getSpecificMerchantByMerchantId = async (merchant_id) => {
  try {
    let parameter = {
      where: {
        merchant_id
      },
    }
    let result = await merchantTable.findOne(parameter)

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

// ANCHOR updateSpecificMerchant
exports.updateSpecificMerchant = async (merchant_id, params) => {
  let { name, address, phone, opening_period, description, website, openrice, instagram, facebook, tags, business_registration_number } = params;
  try {
    let updateParameter = {
      name,
      address, 
      phone, 
      opening_period, 
      description, 
      website, 
      openrice, 
      instagram, 
      facebook, 
      tags, 
      business_registration_number,
      updated_date: moment().tz('Asia/Hong_Kong').format('YYYY-MM-DD HH:mm:ss')
    }
    let queryParameter = {
      where: {
        merchant_id
      },
    }
    let result = await merchantTable.update(updateParameter, queryParameter)

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

// ANCHOR getMerchantStore
exports.getMerchantStore = async (limit = 0, offset = 0, searchField = null) => {
  try{
    let searchSQL = '';
    if(searchField !== null && Object.keys(searchField).length > 0) {
      // Filter shop
      if(searchField.shop !== null && searchField.shop.includes(',')) {
        let tempSplit = searchField.shop.split(',');
        searchSQL += ` AND ( `
        tempSplit.forEach((value, index) => {
          searchSQL += `m2.tags LIKE "%${value}%"`
          if(index < tempSplit.length - 1) {
            searchSQL += ` OR `
          }
        })
        searchSQL += ` ) `
      } else if(searchField.shop !== null) {
        searchSQL += ` AND m2.tags LIKE "%${searchField.shop}%" `
      }

      // Filter price
      if(searchField.price !== null && searchField.price.includes(',')) {
        let tempSplit = searchField.price.split(',');
        searchSQL += ` AND ( `
        tempSplit.forEach((value, index) => {
          searchSQL += `m2.tags LIKE "%${value}%"`
          if(index < tempSplit.length - 1) {
            searchSQL += ` OR `
          }
        })
        searchSQL += ` ) `
      } else if(searchField.price !== null) {
        searchSQL += ` AND m2.tags LIKE "%${searchField.price}%" `
      }

      // Filter region
      if(searchField.region !== null && searchField.region.includes(',')) {
        let tempSplit = searchField.region.split(',');
        searchSQL += ` AND ( `
        tempSplit.forEach((value, index) => {
          searchSQL += `m2.tags LIKE "%${value}%" OR m2.address LIKE "%${value}%"`
          if(index < tempSplit.length - 1) {
            searchSQL += ` OR `
          }
        })
        searchSQL += ` ) `
      } else if(searchField.region !== null) {
        searchSQL += ` AND (m2.tags LIKE "%${searchField.region}%" OR m2.address LIKE "%${searchField.region}%" `
      }

      // Filter search
      if(searchField.search !== null) {
        searchSQL += ` AND (m2.name LIKE "%${searchField.search}%" OR m2.description LIKE "%${searchField.search}%" OR m2.address LIKE "${searchField.search}") `
      }
    }

    let sql = `SELECT * FROM merchant_store m1 WHERE m1.store_id = (SELECT store_id FROM (SELECT * FROM merchant_store m2 WHERE m2.merchant_id = m1.merchant_id ${searchSQL} ORDER BY created_date LIMIT 1) m3) ORDER BY created_date DESC`

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

// ANCHOR getMerchantStoreByLatLong
exports.getMerchantStoreByLatLong = async (latitude, longitude, limit = 0, offset = 0, searchField = null, distance = null) => {
  try {
    let searchSQL = '';
    let searchDistanceSQL = '';
    if(searchField !== null && Object.keys(searchField).length > 0) {
      // Filter shop
      if(searchField.shop !== null && searchField.shop.includes(',')) {
        let tempSplit = searchField.shop.split(',');
        searchSQL += ` AND ( `
        tempSplit.forEach((value, index) => {
          searchSQL += `m1.tags LIKE "%${value}%"`
          if(index < tempSplit.length - 1) {
            searchSQL += ` OR `
          }
        })
        searchSQL += ` ) `
      } else if(searchField.shop !== null) {
        searchSQL += ` AND m1.tags LIKE "%${searchField.shop}%" `
      }

      // Filter price
      if(searchField.price !== null && searchField.price.includes(',')) {
        let tempSplit = searchField.price.split(',');
        searchSQL += ` AND ( `
        tempSplit.forEach((value, index) => {
          searchSQL += `m2.tags LIKE "%${value}%"`
          if(index < tempSplit.length - 1) {
            searchSQL += ` OR `
          }
        })
        searchSQL += ` ) `
      } else if(searchField.price !== null) {
        searchSQL += ` AND m2.tags LIKE "%${searchField.price}%" `
      }

      // Filter region
      if(searchField.region !== null && searchField.region.includes(',')) {
        let tempSplit = searchField.region.split(',');
        searchSQL += ` AND ( `
        tempSplit.forEach((value, index) => {
          searchSQL += `m2.tags LIKE "%${value}%" OR m2.address LIKE "%${value}%"`
          if(index < tempSplit.length - 1) {
            searchSQL += ` OR `
          }
        })
        searchSQL += ` ) `
      } else if(searchField.region !== null) {
        searchSQL += ` AND (m2.tags LIKE "%${searchField.region}%" OR m2.address LIKE "%${searchField.region}%") `
      }

      // Filter search
      if(searchField.search !== null) {
        searchSQL += ` AND (m2.name LIKE "%${searchField.search}%" OR m2.description LIKE "%${searchField.search}%" OR m2.address LIKE "${searchField.search}") `
      }
    }

    if(distance !== null) {
      searchDistanceSQL += ` AND m1.distance <= ${distance} `;
    }

    let calculateDistanceSQL = `111.1111 * DEGREES(ACOS(LEAST(1.0, COS(RADIANS(${latitude})) * COS(RADIANS(latitude)) * COS(RADIANS(${longitude}) - RADIANS(longitude)) + SIN(RADIANS(${latitude})) * SIN(RADIANS(latitude))))) AS distance`

    let sql = `SELECT * FROM (SELECT *, ${calculateDistanceSQL} FROM merchant_store) m1 WHERE m1.store_id = (SELECT store_id FROM (SELECT *, ${calculateDistanceSQL} FROM merchant_store m2 WHERE m2.merchant_id = m1.merchant_id ${searchSQL} ORDER BY distance LIMIT 1) m3) ${searchDistanceSQL} ORDER BY distance`

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

// ANCHOR 
exports.getSpecificMerchantStore = async (merchant_id, store_id, latitude = null, longitude = null) => {
  try {
    let calculateDistanceSQL = ``;
    if(latitude !== null && longitude !== null) {
      calculateDistanceSQL = `, `
      calculateDistanceSQL += `111.1111 * DEGREES(ACOS(LEAST(1.0, COS(RADIANS(${latitude})) * COS(RADIANS(latitude)) * COS(RADIANS(${longitude}) - RADIANS(longitude)) + SIN(RADIANS(${latitude})) * SIN(RADIANS(latitude))))) AS distance`
    }

    let sql = `SELECT *${calculateDistanceSQL} FROM merchant_store WHERE merchant_id = "${merchant_id}" AND store_id = "${store_id}"`;

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