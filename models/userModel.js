const short = require('short-uuid');
const moment = require('moment-timezone');

const { userTable } = require('./index');

const translator = short();
moment.locale('zh-hk');

// ANCHOR createUser
exports.createUser = async (params) => {
  try {
    let result = await userTable.create({
      user_id: params.user_id,
      login_id: params.login_id,
      first_name: params.first_name,
      last_name: params.last_name,
      gender: params.gender,
      phone : params.phone,
      email: params.email,
      coins: 0,
      photo_url: params.photo_url,
      created_date: moment().tz('Asia/Hong_Kong').format('YYYY-MM-DD HH:mm:ss'),
      updated_date: moment().tz('Asia/Hong_Kong').format('YYYY-MM-DD HH:mm:ss')
    })

    params.coins = 0;
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

// ANCHOR getSpecificUserByLoginId
exports.getSpecificUserByLoginId = async (login_id) => {
  try {
    let parameter = {
      where: {
        login_id
      },
    }
    let result = await userTable.findOne(parameter)

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

// ANCHOR getSpecificUserByLoginId
exports.getSpecificUserByUserId = async (user_id) => {
  try {
    let parameter = {
      where: {
        user_id
      },
    }
    let result = await userTable.findOne(parameter)

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

// ANCHOR getSpecificUserByLoginId
exports.getSpecificUserByUserIdAndLoginId = async (user_id, login_id) => {
  try {
    let parameter = {
      where: {
        user_id,
        login_id
      },
    }
    let result = await userTable.findOne(parameter)

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

// ANCHOR updateSpecificUser
exports.updateSpecificUser = async (user_id, params) => {
  let { first_name, last_name, email, phone, gender, photo_url } = params

  try {
    let updateParameter = {
      first_name, 
      last_name, 
      email, 
      phone, 
      gender,
      photo_url,
      updated_date: moment().tz('Asia/Hong_Kong').format('YYYY-MM-DD HH:mm:ss')
    }
    let queryParameter = {
      where: {
        user_id
      },
    }
    let result = await userTable.update(updateParameter, queryParameter)

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

// ANCHOR updateUserPoints
exports.updateUserPoints = async (user_id, coins) => {
  try {
    let updateParameter = {
      coins, 
      updated_date: moment().tz('Asia/Hong_Kong').format('YYYY-MM-DD HH:mm:ss')
    }
    let queryParameter = {
      where: {
        user_id
      },
    }
    let result = await userTable.update(updateParameter, queryParameter)

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