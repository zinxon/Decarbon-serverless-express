const short = require('short-uuid');
const moment = require('moment-timezone');

const { sequelize, storeTable } = require('./index');

const translator = short();
moment.locale('zh-hk');

exports.createStore = async (params) => {
  try {
    let tempParams = {
      store_id: 'store_' + translator.new(),
      merchant_id: params.merchant_id,
      login_id: params.login_id,
      name : params.name,
      opening_period: params.opening_period,
      phone: params.phone,
      latitude: params.latitude,
      longitude: params.longitude,
      address: params.address,
      created_date: moment().tz('Asia/Hong_Kong').format('YYYY-MM-DD HH:mm:ss'),
      updated_date: moment().tz('Asia/Hong_Kong').format('YYYY-MM-DD HH:mm:ss')
    };

    let result = await storeTable.create(tempParams)

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

exports.getSpecificStoreByStoreId = async (store_id) => {
  try {
    let parameter = {
      where: {
        store_id
      },
    }
    let result = await storeTable.findOne(parameter)

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

exports.getSpecificStoreByMerchantIdAndStoreId = async (merchant_id, store_id) => {
  try {
    let parameter = {
      where: {
        store_id,
        merchant_id
      },
    }
    let result = await storeTable.findOne(parameter)

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

exports.getSpecificStoreByLoginId = async (login_id) => {
  try {
    let parameter = {
      where: {
        login_id,
      },
    }
    let result = await storeTable.findOne(parameter)

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

exports.updateSpecificStore = async (store_id, params) => {
  let { address, phone } = params;
  try {
    let updateParameter = {
      address, 
      phone, 
      updated_date: moment().tz('Asia/Hong_Kong').format('YYYY-MM-DD HH:mm:ss')
    }
    if(params.latitude !== undefined) {
      updateParameter.latitude = params.latitude;
    }
    if(params.longitude !== undefined) {
      updateParameter.longitude = params.longitude;
    }
    let queryParameter = {
      where: {
        store_id
      },
    }
    let result = await storeTable.update(updateParameter, queryParameter)

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
