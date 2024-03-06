var short = require('short-uuid');
var moment = require('moment-timezone');

const { sequelize, newsTable } = require('./index');

var translator = short();
moment.locale('zh-hk');

// ANCHOR createNews
exports.createNews = async (params) => {
  try {
    let result = await newsTable.create({
      news_id: params.news_id,
      name: params.name,
      content: params.content,
      photo_url: params.photo_url,
      author: params.author,
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

// ANCHOR deleteNews
exports.deleteNews = async (news_id) => {
  try {
    let parameter = {
      where: {
        news_id
      }
    }
    let result = await newsTable.destroy(parameter)
  } catch(err) {
    return {
      success: false,
      err
    }
  }
}

// ANCHOR getNewsList
exports.getNewsList = async (limit = 0, offset = 0) => {
  try {
    let parameter = {
      order: [['updated_date', 'DESC']]
    }
    if(limit > 0) {
      parameter.limit = limit
    }
    if(offset > 0) {
      parameter.offset = offset
    }
    let result = await newsTable.findAll(parameter)

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