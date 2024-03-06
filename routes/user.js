const express = require("express");
const short = require("short-uuid");
const moment = require("moment-timezone");

const {
  getMerchantStore,
  getMerchantStoreByLatLong,
  getSpecificMerchantByMerchantId,
  getSpecificMerchantStore,
} = require("../models/merchantModel");
const {
  createUser,
  getSpecificUserByLoginId,
  getSpecificUserByUserIdAndLoginId,
  updateSpecificUser,
  updateUserPoints,
} = require("../models/userModel");
const {
  getActivityListFromMerchantStore,
  getActivityListFromMerchantStoreByLatLong,
  getSpecificActivityByActivityId,
  getActivityListByMerchantId,
} = require("../models/activityModel");
const {
  getCouponListFromMerchantStore,
  getCouponListFromMerchantStoreByLatLong,
  getSpecificCouponByCouponId,
  getCouponListByMerchantId,
} = require("../models/couponModel");
const {
  createFavourite,
  getSpecificFavourite,
  getUserFavouriteList,
  deleteSpecificFavourite,
  getSpecificFavouriteWithUserInfo,
  getUserFavouriteListWithMerchantStore,
} = require("../models/favouriteModel");
const { getSpecificStoreByStoreId } = require("../models/storeModel");
const {
  createRecord,
  getCouponRecordByUserId,
  getRecordsByUserId,
  getActivityRecordByUserId
} = require('../models/recordModel');
const {
  getNewsList
} = require('../models/newsModel');
const { 
  createUserFile
} = require('../utils/s3');

const router = express.Router();
const translator = short();

const weekDayConvert = {
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
  7: 'sunday'
}

const s3Url = "https://decarbon-dev.s3.us-east-2.amazonaws.com/"

// STUB -User- 
// ------------------------- User -------------------------
// ANCHOR createUser
router.post("/createUser", async (req, res, next) => {
  let { first_name, last_name, email, phone, gender, login_id } = req.body;

  if (first_name == undefined || first_name == "") {
    returnFailJson(res, "Missing first name", 101);
  } else if (last_name == undefined || last_name == "") {
    returnFailJson(res, "Missing last name", 102);
  } else if (email == undefined || email == "") {
    returnFailJson(res, "Missing email", 103);
  } else if (phone == undefined || phone == "") {
    returnFailJson(res, "Missing phone", 104);
  } else if (
    gender == undefined ||
    gender == "" ||
    (gender.toUpperCase() !== "M" && gender.toUpperCase() !== "F")
  ) {
    gender = "M";
  }

  if (!validateEmail(email)) {
    returnFailJson(res, "Email is invalid", 105);
  }

  let checkResult = await getSpecificUserByLoginId(login_id);

  if (checkResult === undefined || !checkResult.success) {
    let user_id = "user_" + translator.new();
    let params = {
      user_id,
      first_name,
      last_name,
      email,
      phone,
      gender: gender.toUpperCase(),
      login_id,
      ...(req.body.image && {photo_url: s3Url + 'user/' + user_id + '/photo.png'}),
    }

    if(req.body.image !== undefined && req.body.image !== null && req.body.image !== '') {
      let buf = Buffer.from(req.body.image.replace(/^data:image\/\w+;base64,/, ""),'base64')
      let createImageResult = await createUserFile(user_id + '/photo.png', buf, true)
      // console.log(createImageResult);
    }
  
    let result = await createUser(params);
    if (result.success) {
      res.json({
        success: true,
        result: result.data,
      });
    } else {
      returnFailJson(res, "Create account error", 106);
    }
  } else {
    returnFailJson(res, "This account is registered", 107);
  }
});

// ANCHOR getUserProfile
router.post("/getUserProfile", async (req, res, next) => {
  const { login_id } = req.body;

  if (login_id == undefined || login_id == null || login_id == "") {
    returnFailJson(res, "Missing login id", 101);
  }

  let result = await getSpecificUserByLoginId(login_id);

  if (
    result.success &&
    result.data !== undefined &&
    result.data !== null &&
    Object.keys(result.data).length > 0
  ) {
    res.json({
      success: true,
      result: result.data,
    });
  } else {
    returnFailJson(res, "Cannot find this account", 102);
  }
});

// ANCHOR updateUser
router.post("/updateUser", async (req, res, next) => {
  const { user_id, login_id, first_name, last_name, gender } = req.body;

  if (user_id == undefined || user_id == "") {
    returnFailJson(res, "Missing user id", 101);
  } else if (login_id == undefined || login_id == "") {
    returnFailJson(res, "Missing login id", 102);
  } else if (first_name == undefined || first_name == "") {
    returnFailJson(res, "Missing first name", 103);
  } else if (last_name == undefined || last_name == "") {
    returnFailJson(res, "Missing last name", 104);
  } else if (
    gender == undefined ||
    gender == "" ||
    (gender.toUpperCase() !== "M" && gender.toUpperCase() !== "F")
  ) {
    gender == "M";
  }

  if(req.body.image !== undefined && req.body.image !== null && req.body.image !== '') {
    let buf = Buffer.from(req.body.image.replace(/^data:image\/\w+;base64,/, ""),'base64')
    let createImageResult = await createUserFile(user_id + '.png', buf, true)
  }

  let checkResult = await getSpecificUserByUserIdAndLoginId(user_id, login_id);

  if (
    checkResult.success &&
    checkResult.data !== undefined &&
    checkResult.data !== null
  ) {
    let updateParameter = {
      user_id,
      login_id,
      first_name,
      last_name,
      gender,
      photo_url: s3Url + 'user/' + user_id + '.png'
    };

    let result = await updateSpecificUser(user_id, updateParameter);

    if (result.success) {
      res.json({
        success: true,
      });
    } else {
      returnFailJson(res, "Cannot update user", 105);
    }
  } else {
    returnFailJson(res, "Cannot find this account", 106);
  }
});
// ------------------------- User -------------------------

// STUB -Merchant-
// ------------------------- Merchant -------------------------
// ANCHOR getMerchantList
router.post("/getMerchantList", async (req, res, next) => {
  let { latitude, longitude, limit, offset } = req.body;

  if (limit == undefined || limit == null || limit == "") {
    limit = 0;
  }
  if (offset == undefined || offset == null || offset == "") {
    offset = 0;
  }

  let result = null;
  if (
    latitude == undefined ||
    latitude == null ||
    latitude == null ||
    parseFloat(latitude) == NaN ||
    longitude == undefined ||
    longitude == null ||
    longitude == "" ||
    parseFloat(longitude) == NaN
  ) {
    result = await getMerchantStore(limit, offset);
  } else {
    result = await getMerchantStoreByLatLong(
      latitude,
      longitude,
      limit,
      offset
    );
  }

  if (result !== null && result.success) {
    let tempData = [];
    result.data.forEach((value, index) => {
      tempData[index] = {};
      tempData[index]["merchant_id"] = value["merchant_id"];
      tempData[index]["store_id"] = value["store_id"];
      tempData[index]["photo_url"] = value["photo_url"];
      tempData[index]["store_name"] = value["shortname"];
      tempData[index]["name"] = value["name"];
      tempData[index]["address"] = value["address"];
      tempData[index]["description"] = value["description"];
      tempData[index]["opening_period"] = "";

      try {
        let weekday = moment().tz("Asia/Hong_Kong").isoWeekday();
        let jsonOpeningPeriod = JSON.parse(value["opening_period"]);
        if (jsonOpeningPeriod[weekDayConvert[weekday]] !== undefined) {
          tempData[index]["opening_period"] =
            jsonOpeningPeriod[weekDayConvert[weekday]];
        } else {
          for (let key in jsonOpeningPeriod) {
            tempData[index]["opening_period"] = jsonOpeningPeriod[key];
            break;
          }
        }
      } catch (err) {}
    });

    res.json({
      success: true,
      result: tempData,
    });
  } else {
    returnFailJson(res, "Get merchant list error", 101);
  }
});

// ANCHOR getSpecificMerchant
router.post("/getSpecificMerchant", async (req, res, next) => {
  let {
    merchant_id,
    store_id,
    latitude,
    longitude,
    user_id,
    login_id,
  } = req.body;

  if (merchant_id == undefined || merchant_id == "") {
    returnFailJson(res, "Missing merchant id", 101);
    return;
  } else if (store_id == undefined || store_id == "") {
    returnFailJson(res, "Missing store id", 102);
    return;
  }
  if (latitude == undefined || latitude == "" || parseFloat(latitude) == NaN) {
    latitude = null;
  }
  if (
    longitude == undefined ||
    longitude == "" ||
    parseFloat(longitude) == NaN
  ) {
    longitude = null;
  }

  let result = await getSpecificMerchantStore(
    merchant_id,
    store_id,
    latitude,
    longitude
  );
  let checkFavouriteResult = null;
  if (
    user_id !== undefined &&
    user_id !== null &&
    user_id !== "" &&
    login_id !== undefined &&
    login_id !== null &&
    login_id !== ""
  ) {
    checkFavouriteResult = await getSpecificFavouriteWithUserInfo(
      user_id,
      login_id,
      merchant_id,
      store_id
    );
  }

  if (result !== undefined && result.success && result.data.length > 0) {
    let weekday = moment().tz("Asia/Hong_Kong").isoWeekday();
    let tempData = {};
    tempData = result.data[0];
    tempData["raw_opening_period"] = tempData["opening_period"];
    tempData["store_name"] = tempData["shortname"];
    delete tempData["shortname"];
    delete tempData["created_date"];
    delete tempData["updated_date"];
    delete tempData["business_registration_number"];

    let jsonOpeningPeriod = JSON.parse(tempData["opening_period"]);
    if (jsonOpeningPeriod[weekDayConvert[weekday]] !== undefined) {
      tempData["opening_period"] = jsonOpeningPeriod[weekDayConvert[weekday]];
      let tempTimeSplit = tempData["opening_period"].split("-");
      let currentTime = moment().tz("Asia/Hong_Kong").format("HH:mm");
      tempData["is_opening"] =
        currentTime > tempTimeSplit[0] && currentTime < tempTimeSplit[1];
    } else {
      for (let key in jsonOpeningPeriod) {
        tempData["opening_period"] = jsonOpeningPeriod[key];
        tempData["is_opening"] = false;
        break;
      }
    }

    if (
      checkFavouriteResult !== null &&
      checkFavouriteResult.success &&
      checkFavouriteResult.data.length > 0
    ) {
      tempData["is_liked"] = true;
    } else {
      tempData["is_liked"] = false;
    }

    res.json({
      success: true,
      result: tempData,
    });
  } else {
    returnFailJson(res, "Cannot get merchant", 101);
  }
});

// ANCHOR searchMerchantList
router.post("/searchMerchantList", async (req, res, next) => {
  let {
    shop,
    price,
    region,
    search,
    latitude,
    longitude,
    limit,
    offset,
  } = req.body;

  if (shop == undefined || shop == null || shop == "") {
    shop = null;
  }
  if (price == undefined || price == null || price == "") {
    price = null;
  }
  if (region == undefined || region == null || region == "") {
    region = null;
  }
  if (search == undefined || search == null || search == "") {
    search = null;
  }
  if (
    latitude == undefined ||
    latitude == null ||
    parseFloat(latitude) == NaN
  ) {
    latitude = null;
  }
  if (
    longitude == undefined ||
    longitude == null ||
    parseFloat(longitude) == NaN
  ) {
    longitude = null;
  }
  if (limit == undefined || limit == null || limit == "") {
    limit = 0;
  }
  if (offset == undefined || offset == null || offset == "") {
    offset = 0;
  }

  let searchField = {
    shop,
    price,
    region,
    search,
  };

  let result = null;
  if (
    latitude == undefined ||
    latitude == null ||
    latitude == null ||
    parseFloat(latitude) == NaN ||
    longitude == undefined ||
    longitude == null ||
    longitude == "" ||
    parseFloat(longitude) == NaN
  ) {
    result = await getMerchantStore(limit, offset, searchField);
  } else {
    result = await getMerchantStoreByLatLong(
      latitude,
      longitude,
      limit,
      offset,
      searchField
    );
  }

  if (result !== null && result.success) {
    let tempData = [];
    result.data.forEach((value, index) => {
      tempData[index] = {};
      tempData[index]["merchant_id"] = value["merchant_id"];
      tempData[index]["store_id"] = value["store_id"];
      tempData[index]["photo_url"] = value["photo_url"];
      tempData[index]["store_name"] = value["shortname"];
      tempData[index]["name"] = value["name"];
      tempData[index]["address"] = value["address"];
      tempData[index]["description"] = value["description"];
      tempData[index]["opening_period"] = "";

      try {
        let weekday = moment().tz("Asia/Hong_Kong").isoWeekday();
        let jsonOpeningPeriod = JSON.parse(value["opening_period"]);
        if (jsonOpeningPeriod[weekDayConvert[weekday]] !== undefined) {
          tempData[index]["opening_period"] =
            jsonOpeningPeriod[weekDayConvert[weekday]];
        } else {
          for (let key in jsonOpeningPeriod) {
            tempData[index]["opening_period"] = jsonOpeningPeriod[key];
            break;
          }
        }
      } catch (err) {}
    });

    res.json({
      success: true,
      result: tempData,
    });
  } else {
    returnFailJson(res, "Cannot get merchant list", 101);
  }
});

// ANCHOR getMapOfMerchantList
router.post("/getMapOfMerchantList", async (req, res, next) => {
  let {
    shop,
    price,
    region,
    search,
    latitude,
    longitude,
    limit,
    offset,
    distance,
  } = req.body;

  if (shop == undefined || shop == null || shop == "") {
    shop = null;
  }
  if (price == undefined || price == null || price == "") {
    price = null;
  }
  if (region == undefined || region == null || region == "") {
    region = null;
  }
  if (search == undefined || search == null || search == "") {
    search = null;
  }
  if (
    latitude == undefined ||
    latitude == null ||
    parseFloat(latitude) == NaN
  ) {
    latitude = null;
  }
  if (
    longitude == undefined ||
    longitude == null ||
    parseFloat(longitude) == NaN
  ) {
    longitude = null;
  }
  if (limit == undefined || limit == null || limit == "") {
    limit = 0;
  }
  if (offset == undefined || offset == null || offset == "") {
    offset = 0;
  }
  if (distance == undefined || distance == null || distance == "") {
    distance = null;
  }

  let searchField = {
    shop,
    price,
    region,
    search,
  };

  let result = null;
  if (
    latitude == undefined ||
    latitude == null ||
    latitude == null ||
    parseFloat(latitude) == NaN ||
    longitude == undefined ||
    longitude == null ||
    longitude == "" ||
    parseFloat(longitude) == NaN
  ) {
    result = await getMerchantStore(limit, offset, searchField);
  } else {
    result = await getMerchantStoreByLatLong(
      latitude,
      longitude,
      limit,
      offset,
      searchField,
      distance
    );
  }

  if (result !== null && result.success) {
    let tempData = [];
    result.data.forEach((value, index) => {
      tempData[index] = {};
      tempData[index]["merchant_id"] = value["merchant_id"];
      tempData[index]["store_id"] = value["store_id"];
      tempData[index]["photo_url"] = value["photo_url"];
      tempData[index]["store_name"] = value["shortname"];
      tempData[index]["name"] = value["name"];
      tempData[index]["address"] = value["address"];
      tempData[index]["description"] = value["description"];
      tempData[index]["opening_period"] = "";
      tempData[index]["latitude"] = value["latitude"];
      tempData[index]["longitude"] = value["longitude"];
      tempData[index]["tags"] = value["tags"];
      tempData[index]["distance"] =
        value["distance"] !== undefined ? value["distance"] : null;

      try {
        let weekday = moment().tz("Asia/Hong_Kong").isoWeekday();
        let jsonOpeningPeriod = JSON.parse(value["opening_period"]);
        if (jsonOpeningPeriod[weekDayConvert[weekday]] !== undefined) {
          tempData[index]["opening_period"] =
            jsonOpeningPeriod[weekDayConvert[weekday]];
          let tempTimeSplit = value["opening_period"].split("-");
          let currentTime = moment().tz("Asia/Hong_Kong").format("HH:mm");
          tempData[index]["is_opening"] =
            currentTime > tempTimeSplit[0] && currentTime < tempTimeSplit[1];
        } else {
          for (let key in jsonOpeningPeriod) {
            tempData[index]["opening_period"] = jsonOpeningPeriod[key];
            tempData[index]["is_opening"] = false;
            break;
          }
        }
      } catch (err) {}
    });

    res.json({
      success: true,
      result: tempData,
    });
  } else {
    returnFailJson(res, "Cannot get merchant list", 101);
  }
});
// ------------------------- Merchant -------------------------

// STUB -Activity-
// ------------------------- Activity -------------------------
// ANCHOR getActivityList
router.post("/getActivityList", async (req, res, next) => {
  let { latitude, longitude, limit, offset } = req.body;

  if (limit == undefined || limit == null || limit == "") {
    limit = 0;
  }
  if (offset == undefined || offset == null || offset == "") {
    offset = 0;
  }

  let result = null;
  if (
    latitude == undefined ||
    latitude == null ||
    latitude == null ||
    parseFloat(latitude) == NaN ||
    longitude == undefined ||
    longitude == null ||
    longitude == "" ||
    parseFloat(longitude) == NaN
  ) {
    result = await getActivityListFromMerchantStore(limit, offset);
  } else {
    result = await getActivityListFromMerchantStoreByLatLong(
      latitude,
      longitude,
      limit,
      offset
    );
  }

  if (result !== null && result.success) {
    let tempData = {};
    result.data.forEach((value, index) => {
      if (tempData[value.merchant_id] == undefined) {
        tempData[value.merchant_id] = {};
        tempData[value.merchant_id]["data"] = [];
      }
      tempData[value.merchant_id]["merchant_name"] = value.merchant_name;
      tempData[value.merchant_id]["merchant_id"] = value.merchant_id;

      let tempValue = {};
      tempValue["activity_id"] = value["activity_id"];
      tempValue["type"] = value["type"];
      tempValue["name"] = value["name"];
      tempValue["description"] = value["description"];
      tempValue["reward_coins"] = value["reward_coins"];
      tempValue["photo_url"] = value["photo_url"];
      if (
        value["start_date"] !== null &&
        value["start_date"] !== "" &&
        value["end_date"] !== null &&
        value["end_date"] !== ""
      ) {
        tempValue["start_date"] = moment(value["start_date"])
          .tz("Asia/Hong_Kong")
          .format("YYYY-MM-DD");
        tempValue["end_date"] = moment(value["end_date"])
          .tz("Asia/Hong_Kong")
          .format("YYYY-MM-DD");
      } else {
        tempValue["start_date"] = null;
        tempValue["end_date"] = null;
      }

      tempData[value.merchant_id]["data"].push(tempValue);
    });

    res.json({
      success: true,
      result: tempData,
    });
  } else {
    returnFailJson(res, "Get activity list error", 101);
  }
});

// ANCHOR getSpecificActivity
router.post("/getSpecificActivity", async (req, res, next) => {
  let { activity_id } = req.body;

  if (activity_id == undefined || activity_id == null || activity_id == "") {
    returnFailJson(res, "Missing activity id", 101);
    return;
  }

  result = await getSpecificActivityByActivityId(activity_id);

  if (result !== null && result.success) {
    let merchantResult = await getSpecificMerchantByMerchantId(
      result.data.merchant_id
    );
    if (merchantResult !== null && merchantResult.success) {
      let tempData = result.data;
      tempData["merchant_name"] = merchantResult.data.name;
      if (
        tempData["start_date"] !== null &&
        tempData["start_date"] !== "" &&
        tempData["end_date"] !== null &&
        tempData["end_date"] !== ""
      ) {
        tempData["start_date"] = moment(tempData["start_date"])
          .tz("Asia/Hong_Kong")
          .format("YYYY-MM-DD");
        tempData["end_date"] = moment(tempData["end_date"])
          .tz("Asia/Hong_Kong")
          .format("YYYY-MM-DD");
      } else {
        tempData["start_date"] = null;
        tempData["end_date"] = null;
      }
      delete tempData["created_date"];
      delete tempData["updated_date"];
      delete tempData["status"];

      res.json({
        success: true,
        result: tempData,
      });
    } else {
      returnFailJson(res, "Cannot get specific merchant", 102);
    }
  } else {
    returnFailJson(res, "Cannot get activity", 103);
  }
});

// ANCHOR getSpecificMerchantActivityList
router.post("/getSpecificMerchantActivityList", async (req, res, next) => {
  let { merchant_id, limit, offset } = req.body;

  if (merchant_id == undefined || merchant_id == null || merchant_id == "") {
    returnFailJson(res, "Missing merchant id", 101);
    return;
  }
  if (limit == undefined || limit == null || limit == "") {
    limit = 0;
  }
  if (offset == undefined || offset == null || offset == "") {
    offset = 0;
  }

  let checkMerchantResult = await getSpecificMerchantByMerchantId(merchant_id);
  if (!checkMerchantResult.success) {
    returnFailJson(res, "Invalid merchant id", 102);
    return;
  }

  let result = await getActivityListByMerchantId(merchant_id, limit, offset);

  if (result !== null && result.success) {
    let tempData = [];
    result.data.forEach((value, index) => {
      let tempValue = {};
      tempValue["activity_id"] = value["activity_id"];
      tempValue["type"] = value["type"];
      tempValue["name"] = value["name"];
      tempValue["description"] = value["description"];
      tempValue["reward_coins"] = value["reward_coins"];
      tempValue["photo_url"] = value["photo_url"];
      if (
        value["start_date"] !== null &&
        value["start_date"] !== "" &&
        value["end_date"] !== null &&
        value["end_date"] !== ""
      ) {
        tempValue["start_date"] = moment(value["start_date"])
          .tz("Asia/Hong_Kong")
          .format("YYYY-MM-DD");
        tempValue["end_date"] = moment(value["end_date"])
          .tz("Asia/Hong_Kong")
          .format("YYYY-MM-DD");
      } else {
        tempValue["start_date"] = null;
        tempValue["end_date"] = null;
      }

      tempData.push(tempValue);
    });

    res.json({
      success: true,
      result: tempData,
    });
  } else {
    returnFailJson(res, "Cannot get activity list", 103);
  }
});

// ANCHOR searchActivityList
router.post("/searchActivityList", async (req, res, next) => {
  let { type, region, search, latitude, longitude, limit, offset } = req.body;

  if (type == undefined || type == null || type == "") {
    type = null;
  }
  if (region == undefined || region == null || region == "") {
    region = null;
  }
  if (search == undefined || search == null || search == "") {
    search = null;
  }
  if (
    latitude == undefined ||
    latitude == null ||
    parseFloat(latitude) == NaN
  ) {
    latitude = null;
  }
  if (
    longitude == undefined ||
    longitude == null ||
    parseFloat(longitude) == NaN
  ) {
    longitude = null;
  }
  if (limit == undefined || limit == null || limit == "") {
    limit = 0;
  }
  if (offset == undefined || offset == null || offset == "") {
    offset = 0;
  }

  let searchField = {
    type,
    region,
    search,
  };

  let result = null;
  if (
    latitude == undefined ||
    latitude == null ||
    latitude == null ||
    parseFloat(latitude) == NaN ||
    longitude == undefined ||
    longitude == null ||
    longitude == "" ||
    parseFloat(longitude) == NaN
  ) {
    result = await getActivityListFromMerchantStore(limit, offset, searchField);
  } else {
    result = await getActivityListFromMerchantStoreByLatLong(
      latitude,
      longitude,
      limit,
      offset,
      searchField
    );
  }

  if (result !== null && result.success) {
    let tempData = {};
    result.data.forEach((value, index) => {
      if (tempData[value.merchant_id] == undefined) {
        tempData[value.merchant_id] = {};
        tempData[value.merchant_id]["data"] = [];
      }
      tempData[value.merchant_id]["merchant_name"] = value.merchant_name;
      tempData[value.merchant_id]["merchant_id"] = value.merchant_id;

      let tempValue = {};
      tempValue["activity_id"] = value["activity_id"];
      tempValue["type"] = value["type"];
      tempValue["name"] = value["name"];
      tempValue["description"] = value["description"];
      tempValue["reward_coins"] = value["reward_coins"];
      tempValue["photo_url"] = value["photo_url"];
      if (
        value["start_date"] !== null &&
        value["start_date"] !== "" &&
        value["end_date"] !== null &&
        value["end_date"] !== ""
      ) {
        tempValue["start_date"] = moment(value["start_date"])
          .tz("Asia/Hong_Kong")
          .format("YYYY-MM-DD");
        tempValue["end_date"] = moment(value["end_date"])
          .tz("Asia/Hong_Kong")
          .format("YYYY-MM-DD");
      } else {
        tempValue["start_date"] = null;
        tempValue["end_date"] = null;
      }

      tempData[value.merchant_id]["data"].push(tempValue);
    });

    res.json({
      success: true,
      result: tempData,
    });
  } else {
    returnFailJson(res, "Cannot get activity list", 101);
  }
});
// ------------------------- Activity -------------------------

// STUB -Coupon-
// ------------------------- Coupon -------------------------
// ANCHOR getCouponList
router.post("/getCouponList", async (req, res, next) => {
  let { latitude, longitude, limit, offset } = req.body;

  if (limit == undefined || limit == null || limit == "") {
    limit = 0;
  }
  if (offset == undefined || offset == null || offset == "") {
    offset = 0;
  }

  let result = null;
  if (
    latitude == undefined ||
    latitude == null ||
    latitude == null ||
    parseFloat(latitude) == NaN ||
    longitude == undefined ||
    longitude == null ||
    longitude == "" ||
    parseFloat(longitude) == NaN
  ) {
    result = await getCouponListFromMerchantStore(limit, offset);
  } else {
    result = await getCouponListFromMerchantStoreByLatLong(
      latitude,
      longitude,
      limit,
      offset
    );
  }

  if (result !== null && result.success) {
    let tempData = {};
    result.data.forEach((value, index) => {
      if (tempData[value.merchant_id] == undefined) {
        tempData[value.merchant_id] = {};
        tempData[value.merchant_id]["data"] = [];
      }
      tempData[value.merchant_id]["merchant_name"] = value["merchant_name"];
      tempData[value.merchant_id]["merchant_id"] = value["merchant_id"];

      let tempValue = {};
      tempValue["coupon_id"] = value["coupon_id"];
      if (value["base_discount"] > 0) {
        tempValue["type"] = value["type"];
        tempValue["discount_value"] = value["base_discount"];
        tempValue["parsed_discount_value"] = `HK$${value["base_discount"]} off`;
      } else if (value["percentage_discount"] > 0) {
        tempValue["type"] = value["type"];
        tempValue["discount_value"] = value["percentage_discount"];
        tempValue[
          "parsed_discount_value"
        ] = `${value["percentage_discount"]}% off`;
      } else {
        tempValue["type"] = value["type"];
        tempValue["discount_value"] = null;
        tempValue["parsed_discount_value"] = null;
      }
      tempValue["name"] = value["name"];
      tempValue["description"] = value["description"];
      tempValue["require_coins"] = value["require_coins"];
      tempValue["photo_url"] = value["photo_url"];

      tempData[value.merchant_id]["data"].push(tempValue);
    });

    res.json({
      success: true,
      result: tempData,
    });
  } else {
    returnFailJson(res, "Get coupon list error", 101);
  }
});

// ANCHOR getSpecificCoupon
router.post("/getSpecificCoupon", async (req, res, next) => {
  let { coupon_id } = req.body;

  if (coupon_id == undefined || coupon_id == null || coupon_id == "") {
    returnFailJson(res, "Missing coupon id", 101);
    return;
  }

  result = await getSpecificCouponByCouponId(coupon_id);

  if (result !== null && result.success) {
    let merchantResult = await getSpecificMerchantByMerchantId(
      result.data.merchant_id
    );

    if (merchantResult !== null && merchantResult.success) {
      let tempData = result.data;
      if (tempData["base_discount"] > 0) {
        tempData["discount_value"] = tempData["base_discount"];
        tempData[
          "parsed_discount_value"
        ] = `HK$${tempData["base_discount"]} off`;
      } else if (tempData["percentage_discount"] > 0) {
        tempData["discount_value"] = tempData["percentage_discount"];
        tempData[
          "parsed_discount_value"
        ] = `${tempData["percentage_discount"]}% off`;
      } else {
        tempData["discount_value"] = null;
        tempData["parsed_discount_value"] = null;
      }
      if (
        tempData["start_date"] !== null &&
        tempData["start_date"] !== "" &&
        tempData["end_date"] !== null &&
        tempData["end_date"] !== ""
      ) {
        tempData["start_date"] = moment(tempData["start_date"])
          .tz("Asia/Hong_Kong")
          .format("YYYY-MM-DD");
        tempData["end_date"] = moment(tempData["end_date"])
          .tz("Asia/Hong_Kong")
          .format("YYYY-MM-DD");
      } else {
        tempData["start_date"] = null;
        tempData["end_date"] = null;
      }
      delete tempData["base_discount"];
      delete tempData["percentage_discount"];
      delete tempData["generated_reason"];
      delete tempData["created_date"];
      delete tempData["updated_date"];
      delete tempData["status"];

      let tempMerchant = {};
      tempMerchant["name"] = merchantResult.data["name"];
      tempMerchant["address"] = merchantResult.data["address"];
      tempMerchant["photo_url"] = merchantResult.data["photo_url"];

      tempData["merchant"] = tempMerchant;

      res.json({
        success: true,
        result: tempData,
      });
    } else {
      returnFailJson(res, "Cannot get specific merchant", 102);
    }
  } else {
    returnFailJson(res, "Cannot get coupon", 103);
  }
});

// ANCHOR getSpecificMerchantCouponList
router.post("/getSpecificMerchantCouponList", async (req, res, next) => {
  let { merchant_id, limit, offset } = req.body;

  if (merchant_id == undefined || merchant_id == null || merchant_id == "") {
    returnFailJson(res, "Missing merchant id", 101);
    return;
  }
  if (limit == undefined || limit == null || limit == "") {
    limit = 0;
  }
  if (offset == undefined || offset == null || offset == "") {
    offset = 0;
  }

  let checkMerchantResult = await getSpecificMerchantByMerchantId(merchant_id);
  if (!checkMerchantResult.success) {
    returnFailJson(res, "Invalid merchant id", 102);
    return;
  }

  let result = await getCouponListByMerchantId(merchant_id, limit, offset);

  if (result !== null && result.success) {
    let tempData = [];
    result.data.forEach((value, index) => {
      let tempValue = {};
      tempValue["coupon_id"] = value["coupon_id"];
      if (value["base_discount"] > 0) {
        tempValue["type"] = "Cash";
        tempValue["discount_value"] = value["base_discount"];
        tempValue["parsed_discount_value"] = `HK$${value["base_discount"]} off`;
      } else if (value["percentage_discount"] > 0) {
        tempValue["type"] = "Discount";
        tempValue["discount_value"] = value["percentage_discount"];
        tempValue[
          "parsed_discount_value"
        ] = `${value["percentage_discount"]}% off`;
      } else {
        tempValue["type"] = "Exchange";
        tempValue["discount_value"] = null;
        tempValue["parsed_discount_value"] = null;
      }
      tempValue["name"] = value["name"];
      tempValue["description"] = value["description"];
      tempValue["require_coins"] = value["require_coins"];
      tempValue["photo_url"] = value["photo_url"];

      tempData.push(tempValue);
    });

    res.json({
      success: true,
      result: tempData,
    });
  } else {
    returnFailJson(res, "Cannot get coupon list", 103);
  }
});

// ANCHOR searchCouponList
router.post("/searchCouponList", async (req, res, next) => {
  let { type, region, search, latitude, longitude, limit, offset } = req.body;

  if (type == undefined || type == null || type == "") {
    type = null;
  }
  if (region == undefined || region == null || region == "") {
    region = null;
  }
  if (search == undefined || search == null || search == "") {
    search = null;
  }
  if (
    latitude == undefined ||
    latitude == null ||
    parseFloat(latitude) == NaN
  ) {
    latitude = null;
  }
  if (
    longitude == undefined ||
    longitude == null ||
    parseFloat(longitude) == NaN
  ) {
    longitude = null;
  }
  if (limit == undefined || limit == null || limit == "") {
    limit = 0;
  }
  if (offset == undefined || offset == null || offset == "") {
    offset = 0;
  }

  let searchField = {
    type,
    region,
    search,
  };

  let result = null;
  if (
    latitude == undefined ||
    latitude == null ||
    latitude == null ||
    parseFloat(latitude) == NaN ||
    longitude == undefined ||
    longitude == null ||
    longitude == "" ||
    parseFloat(longitude) == NaN
  ) {
    result = await getCouponListFromMerchantStore(limit, offset, searchField);
  } else {
    result = await getCouponListFromMerchantStoreByLatLong(
      latitude,
      longitude,
      limit,
      offset,
      searchField
    );
  }

  if (result !== null && result.success) {
    let tempData = {};
    result.data.forEach((value, index) => {
      if (tempData[value.merchant_id] == undefined) {
        tempData[value.merchant_id] = {};
        tempData[value.merchant_id]["data"] = [];
      }
      tempData[value.merchant_id]["merchant_name"] = value["merchant_name"];
      tempData[value.merchant_id]["merchant_id"] = value["merchant_id"];

      let tempValue = {};
      tempValue["coupon_id"] = value["coupon_id"];
      if (value["base_discount"] > 0) {
        tempValue["type"] = "Cash";
        tempValue["discount_value"] = value["base_discount"];
        tempValue["parsed_discount_value"] = `HK$${value["base_discount"]} off`;
      } else if (value["percentage_discount"] > 0) {
        tempValue["type"] = "Discount";
        tempValue["discount_value"] = value["percentage_discount"];
        tempValue[
          "parsed_discount_value"
        ] = `${value["percentage_discount"]}% off`;
      } else {
        tempValue["type"] = "Exchange";
        tempValue["discount_value"] = null;
        tempValue["parsed_discount_value"] = null;
      }
      tempValue["name"] = value["name"];
      tempValue["description"] = value["description"];
      tempValue["require_coins"] = value["require_coins"];
      tempValue["photo_url"] = value["photo_url"];

      tempData[value.merchant_id]["data"].push(tempValue);
    });

    res.json({
      success: true,
      result: tempData,
    });
  } else {
    returnFailJson(res, "Cannot get coupon list", 101);
  }
});

// ANCHOR redeemCoupon
router.post("/redeemCoupon", async (req, res, next) => {
  let { user_id, login_id, coupon_id } = req.body;

  if (user_id == undefined || user_id == null || user_id == "") {
    returnFailJson(res, "Missing user id", 101);
  } else if (login_id == undefined || login_id == null || login_id == "") {
    returnFailJson(res, "Missing login id", 102);
  } else if (coupon_id == undefined || coupon_id == null || coupon_id == "") {
    returnFailJson(res, "Missing coupon id", 103);
  }

  // Check is user first
  let checkUserResult = await getSpecificUserByLoginId(login_id);
  if (
    checkUserResult === undefined ||
    !checkUserResult.success ||
    checkUserResult.data["user_id"] !== user_id
  ) {
    returnFailJson(res, "Cannot get user", 104);
    return;
  }

  // Check is valid coupon
  let checkCouponResult = await getSpecificCouponByCouponId(coupon_id);
  if (checkCouponResult === undefined || !checkCouponResult.success) {
    returnFailJson(res, "Cannot get coupon", 105);
    return;
  }

  // Check have enough coins
  let coinsDiff =
    checkUserResult["data"]["coins"] -
    checkCouponResult["data"]["require_coins"];
  if (coinsDiff < 0) {
    returnFailJson(res, "Users does not have enough coins", 106);
    return;
  }

  // Update points
  let updatePointsResult = await updateUserPoints(user_id, coinsDiff);
  if (updatePointsResult === undefined || !updatePointsResult.success) {
    returnFailJson(res, "Cannot update points", 107);
    return;
  }

  // Add points record
  let pointsRecordParameter = {
    activity_id: null,
    coupon_id,
    merchant_id: checkCouponResult["data"]["merchant_id"],
    user_id,
    store_id: checkCouponResult["data"]["store_id"],
    type: "coupon",
    coins: -checkCouponResult["data"]["require_coins"],
    user_old_coins: checkUserResult["data"]["coins"],
    user_new_coins: coinsDiff,
    remarks: "",
    status: 1,
  };
  let addRecordResult = await createRecord(pointsRecordParameter);

  if (addRecordResult === undefined || !addRecordResult.success) {
    let updatePointsResult = updateUserPoints(
      user_id,
      checkUserResult["data"]["coins"]
    );
    returnFailJson(res, "Cannot add records", 108);
    return;
  }

  res.json({
    success: true,
    result: pointsRecordParameter,
  });
});
// ------------------------- Coupon -------------------------

// STUB -Favourite-
// ------------------------- Favourite -------------------------
// ANCHOR updateFavouriteList
router.post("/updateFavouriteList", async (req, res, next) => {
  let { user_id, login_id, merchant_id, store_id, status } = req.body;

  if (user_id == undefined || user_id == null || user_id == "") {
    returnFailJson(res, "Missing user id", 101);
    return;
  } else if (login_id == undefined || login_id == null || login_id == "") {
    returnFailJson(res, "Missing login id", 102);
    return;
  } else if (
    merchant_id == undefined ||
    merchant_id == null ||
    merchant_id == ""
  ) {
    returnFailJson(res, "Missing merchant id", 103);
    return;
  } else if (store_id == undefined || store_id == null || store_id == "") {
    returnFailJson(res, "Missing store id", 104);
    return;
  } else if (
    status === undefined ||
    status === null ||
    status === "" ||
    (status !== 0 && status !== 1)
  ) {
    returnFailJson(res, "Missing status or invalid status", 105);
    return;
  }

  let checkUserResult = await getSpecificUserByLoginId(login_id);

  if (
    checkUserResult == null ||
    !checkUserResult.success ||
    checkUserResult.data["user_id"] !== user_id
  ) {
    returnFailJson(res, "Cannot find user with this login id", 106);
    return;
  }

  let checkResult = await getSpecificFavourite(user_id, merchant_id, store_id);

  if (status == 1) {
    if (
      checkResult !== null &&
      checkResult.success &&
      checkResult.data.length <= 0
    ) {
      let parameters = {
        user_id,
        merchant_id,
        store_id,
      };
      let result = await createFavourite(parameters);

      if (result !== null && result.success) {
        res.json({
          success: true,
        });
      } else {
        returnFailJson(res, "Cannot add to favourite list", 107);
      }
    } else {
      res.json({
        success: true,
        message: "Added before",
      });
    }
  } else {
    if (checkResult !== null && checkResult.success) {
      let result = await deleteSpecificFavourite(
        user_id,
        merchant_id,
        store_id
      );

      if (result !== null && result.success) {
        res.json({
          success: true,
        });
      } else {
        returnFailJson(res, "Cannot delete from favourite list", 108);
      }
    } else {
      res.json({
        success: true,
        message: "Deleted before",
      });
    }
  }
});

// ANCHOR getUserFavouriteList
router.post("/getUserFavouriteList", async (req, res, next) => {
  let { user_id, login_id, limit, offset } = req.body;

  if (user_id == undefined || user_id == null || user_id == "") {
    returnFailJson(res, "Missing user id", 101);
    return;
  } else if (login_id == undefined || login_id == null || login_id == "") {
    returnFailJson(res, "Missing login id", 102);
    return;
  }
  if (limit == undefined || limit == null || limit == "") {
    limit = 0;
  }
  if (offset == undefined || offset == null || offset == "") {
    offset = 0;
  }

  let result = await getUserFavouriteListWithMerchantStore(
    user_id,
    login_id,
    limit,
    offset
  );

  if (result !== null && result.success) {
    let tempData = [];
    result.data.forEach((value, index) => {
      tempData[index] = {};
      tempData[index]["merchant_id"] = value["merchant_id"];
      tempData[index]["store_id"] = value["store_id"];
      tempData[index]["photo_url"] = value["photo_url"];
      tempData[index]["store_name"] = value["shortname"];
      tempData[index]["name"] = value["name"];
      tempData[index]["address"] = value["address"];
      tempData[index]["description"] = value["description"];
      tempData[index]["opening_period"] = "";

      try {
        let weekday = moment().tz("Asia/Hong_Kong").isoWeekday();
        let jsonOpeningPeriod = JSON.parse(value["opening_period"]);
        if (jsonOpeningPeriod[weekDayConvert[weekday]] !== undefined) {
          tempData[index]["opening_period"] =
            jsonOpeningPeriod[weekDayConvert[weekday]];
        } else {
          for (let key in jsonOpeningPeriod) {
            tempData[index]["opening_period"] = jsonOpeningPeriod[key];
            break;
          }
        }
      } catch (err) {}
    });

    res.json({
      success: true,
      result: tempData,
    });
  } else {
    returnFailJson(res, "Cannot get favourite list", 103);
  }
});
// ------------------------- Favourite -------------------------

// STUB -Record-
// ------------------------- Record -------------------------
// ANCHOR getCouponRecord
router.post("/getCouponRecord", async (req, res, next) => {
  let { user_id, login_id, limit, offset, status } = req.body;

  if (user_id == undefined || user_id == null || user_id == "") {
    returnFailJson(res, "Missing user id", 101);
  } else if (login_id == undefined || login_id == null || login_id == "") {
    returnFailJson(res, "Missing login id", 102);
  }
  if (limit == undefined || limit == null || limit == "") {
    limit = 0;
  }
  if (offset == undefined || offset == null || offset == "") {
    offset = 0;
  }
  if (status === undefined || status === null || status === "") {
    status = 1;
  }

  // Check is user first
  let checkUserResult = await getSpecificUserByLoginId(login_id);
  if (
    checkUserResult === undefined ||
    !checkUserResult.success ||
    checkUserResult.data["user_id"] !== user_id
  ) {
    returnFailJson(res, "Cannot get user", 103);
    return;
  }

  let result = await getCouponRecordByUserId(user_id, limit, offset, status);
  if (result !== undefined && result.success) {
    let tempData = {};
    result.data.forEach((value, index) => {
      if (tempData[value.merchant_id] == undefined) {
        tempData[value.merchant_id] = {};
        tempData[value.merchant_id]["data"] = [];
      }
      tempData[value.merchant_id]["merchant_photo_url"] =
        value["merchant_photo_url"];
      tempData[value.merchant_id]["merchant_name"] = value["merchant_name"];
      tempData[value.merchant_id]["merchant_id"] = value["merchant_id"];

      let tempValue = {};
      tempValue["record_id"] = value["record_id"];
      tempValue["coupon_id"] = value["coupon_id"];
      if (value["base_discount"] > 0) {
        tempValue["type"] = value["type"];
        tempValue["discount_value"] = value["base_discount"];
        tempValue["parsed_discount_value"] = `HK$${value["base_discount"]} off`;
        tempValue["discount_description"] =
          value["coupon_discount_description"];
      } else if (value["percentage_discount"] > 0) {
        tempValue["type"] = value["type"];
        tempValue["discount_value"] = value["percentage_discount"];
        tempValue[
          "parsed_discount_value"
        ] = `${value["percentage_discount"]}% off`;
        tempValue["discount_description"] =
          value["coupon_discount_description"];
      } else {
        tempValue["type"] = value["type"];
        tempValue["discount_value"] = null;
        tempValue["parsed_discount_value"] = null;
      }
      tempValue["name"] = value["name"];
      tempValue["description"] = value["description"];
      tempValue["require_coins"] = value["require_coins"];
      tempValue["photo_url"] = value["photo_url"];
      tempValue['deleted'] = value['deleted']
      if (
        value["start_date"] !== null &&
        value["start_date"] !== "" &&
        value["end_date"] !== null &&
        value["end_date"] !== ""
      ) {
        tempValue["start_date"] = moment(value["start_date"])
          .tz("Asia/Hong_Kong")
          .format("YYYY-MM-DD");
        tempValue["end_date"] = moment(value["end_date"])
          .tz("Asia/Hong_Kong")
          .format("YYYY-MM-DD");
      } else {
        tempValue["start_date"] = null;
        tempValue["end_date"] = null;
      }

      tempData[value.merchant_id]["data"].push(tempValue);
    });

    res.json({
      success: true,
      result: tempData,
    });
  } else {
    returnFailJson(res, "Cannot get coupon records", 104);
  }
});

// ANCHOR getUserRecords
router.post("/getUserRecords", async (req, res, next) => {
  let { user_id, login_id, limit, offset, date, type } = req.body;

  if (user_id == undefined || user_id == null || user_id == "") {
    returnFailJson(res, "Missing user id", 101);
  } else if (login_id == undefined || login_id == null || login_id == "") {
    returnFailJson(res, "Missing login id", 102);
  }
  if (limit == undefined || limit == null || limit == "") {
    limit = 0;
  }
  if (offset == undefined || offset == null || offset == "") {
    offset = 0;
  }
  if (date == undefined || date == null || date == "") {
    date = null;
  }
  if (type == undefined || type == null || type == "") {
    type = "all";
  }

  // Check is user first
  let checkUserResult = await getSpecificUserByLoginId(login_id);
  if (
    checkUserResult === undefined ||
    !checkUserResult.success ||
    checkUserResult.data["user_id"] !== user_id
  ) {
    returnFailJson(res, "Cannot get user", 103);
    return;
  }

  let result = await getRecordsByUserId(user_id, limit, offset, date, type);
  if (result !== undefined && result.success) {
    let tempData = [];
    result.data.forEach((value, index) => {
      let tempValue = {};
      tempValue["record_id"] = value["record_id"];
      tempValue["date"] = moment(value["created_date"])
        .tz("Asia/Hong_Kong")
        .format("YYYY/MM/DD HH:mm");
      tempValue["coins"] = value["coins"];
      tempValue["type"] = value["type"];
      tempValue["status"] = value["status"];
      tempValue["merchant_name"] = value["merchant_name"];
      tempValue["merchant_photo_url"] = value["merchant_photo_url"];
      if (value["type"] == "coins") {
        tempValue["parsed_type"] = "Add Coins";
        tempValue["name"] = `Add Coins - ${value["merchant_name"]}`;
        tempValue["parsed_status"] = value["status"] == 1 ? "Done" : "Invalid";
      } else if (value["type"] == "coupon") {
        if (
          tempValue["coupon_base_discount"] !== null &&
          tempValue["coupon_base_discount"] > 0
        ) {
          tempValue["parsed_type"] = "Cash";
        } else if (
          value["coupon_percentage_discount"] !== null &&
          tempValue["coupon_percentage_discount"] > 0
        ) {
          tempValue["parsed_type"] = "Discount";
        } else {
          tempValue["parsed_type"] = "Exchange";
        }
        tempValue["name"] = value["coupon_name"];
        tempValue["parsed_status"] = value["status"] == 1 ? "Not used" : "Used";
      } else if (value["type"] == "activity") {
        tempValue["parsed_type"] = value["activity_type"];
        tempValue["name"] = value["activity_name"];
        tempValue["parsed_status"] = value["status"] == 1 ? "Done" : "Invalid";
      }

      tempData.push(tempValue);
    });
    res.json({
      success: true,
      result: tempData,
    });
  } else {
    returnFailJson(res, "Cannot get user records", 104);
  }
});

// ANCHOR getUserActivity
router.post("/getUserActivity", async (req, res, next) => {
  let { user_id, login_id, limit, offset } = req.body;

  if (user_id == undefined || user_id == null || user_id == "") {
    returnFailJson(res, "Missing user id", 101);
  } else if (login_id == undefined || login_id == null || login_id == "") {
    returnFailJson(res, "Missing login id", 102);
  }
  if (limit == undefined || limit == null || limit == "") {
    limit = 0;
  }
  if (offset == undefined || offset == null || offset == "") {
    offset = 0;
  }

  // Check is user first
  let checkUserResult = await getSpecificUserByLoginId(login_id);
  if (
    checkUserResult === undefined ||
    !checkUserResult.success ||
    checkUserResult.data["user_id"] !== user_id
  ) {
    returnFailJson(res, "Cannot get user", 103);
    return;
  }

  let result = await getActivityRecordByUserId(user_id, limit, offset);
  if (result !== undefined && result.success) {
    let tempData = [];
    result.data.forEach((value, index) => {
      let tempValue = {};
      tempValue["activity_id"] = value["activity_id"];
      tempValue["type"] = value["type"];
      tempValue["name"] = value["name"];
      tempValue["description"] = value["description"];
      tempValue["reward_coins"] = value["reward_coins"];
      tempValue["photo_url"] = value["photo_url"];
      tempValue["date"] = moment(value["created_date"])
        .tz("Asia/Hong_Kong")
        .format("YYYY-MM-DD");
      tempValue['deleted'] = value['deleted']
      if (
        value["start_date"] !== null &&
        value["start_date"] !== "" &&
        value["end_date"] !== null &&
        value["end_date"] !== ""
      ) {
        tempValue["start_date"] = moment(value["start_date"])
          .tz("Asia/Hong_Kong")
          .format("YYYY-MM-DD");
        tempValue["end_date"] = moment(value["end_date"])
          .tz("Asia/Hong_Kong")
          .format("YYYY-MM-DD");
      } else {
        tempValue["start_date"] = null;
        tempValue["end_date"] = null;
      }

      tempData.push(tempValue);
    });

    res.json({
      success: true,
      result: tempData,
    });
  } else {
    returnFailJson(res, "Cannot get activity records", 104);
  }
});
// ------------------------- Record -------------------------

// STUB News
// ------------------------- News -------------------------
// ANCHOR getNewsList
router.post("/getNewsList", async (req, res, next) => {
  let { limit, offset } = req.body;

  if (limit == undefined || limit == null || limit == "") {
    limit = 0;
  }
  if (offset == undefined || offset == null || offset == "") {
    offset = 0;
  }

  let result = await getNewsList(limit, offset);

  if (result !== null && result.success) {
    let tempData = [];
    result.data.forEach((value, index) => {
      tempData[index] = {};
      tempData[index]["news_id"] = value["news_id"];
      tempData[index]["name"] = value["name"];
      tempData[index]["content"] = value["content"];
      tempData[index]["photo_url"] = value["photo_url"];
      tempData[index]["author"] = value["author"];
      tempData[index]["date"] = moment(value["created_date"])
        .tz("Asia/Hong_Kong")
        .format("YYYY-MM-DD");
    });

    res.json({
      success: true,
      result: tempData,
    });
  } else {
    returnFailJson(res, "Cannot get news list", 101);
  }
});
// ------------------------- News -------------------------

function validateEmail(mail) {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
    return true;
  }
  return false;
}
function returnFailJson(res, error, error_code) {
  res.json({
    success: false,
    error,
    error_code,
  });
}

module.exports = router;
