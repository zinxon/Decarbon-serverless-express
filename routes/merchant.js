const express = require("express");
const short = require("short-uuid");
const moment = require("moment-timezone");

const {
  createMerchant,
  getSpecificMerchantByLoginId,
  getSpecificMerchantByMerchantId,
  updateSpecificMerchant,
} = require("../models/merchantModel");
const {
  createStore,
  getSpecificStoreByStoreId,
  getSpecificStoreByMerchantIdAndStoreId,
  getSpecificStoreByLoginId,
  updateSpecificStore,
} = require("../models/storeModel");
const {
  createActivity,
  getActivityListByMerchantId,
  getActivityListByMerchantIdWithCount,
  getSpecificActivityByActivityId,
  getSpecificActivityByActivityIdAndMerchantId,
  updateSpecificActivity,
  deleteSpecificActivity,
} = require("../models/activityModel");
const {
  createCoupon,
  getCouponListByMerchantId,
  getCouponListByMerchantIdWithCount,
  getSpecificCouponByCouponId,
  getSpecificCouponByCouponIdAndMerchantId,
  updateSpecificCoupon,
  deleteSpecificCoupon,
} = require("../models/couponModel");
const {
  getSpecificUserByUserId,
  updateUserPoints,
} = require("../models/userModel");
const {
  createRecord,
  getRecordsByMerchantIdAndStoreId,
  getRecordByUserIdAndActivityId,
  getRecordByHash,
  updateCouponRecord,
} = require("../models/recordModel");
const { createFolder, createFile, deleteFile } = require("../utils/s3");
const s3Url = "https://decarbon-dev.s3.us-east-2.amazonaws.com/";

const router = express.Router();
const translator = short();

// STUB -Merchant-
// ------------------------- Merchant -------------------------
// ANCHOR createMerchant
router.post("/createMerchant", async (req, res, next) => {
  const {
    email,
    name,
    address,
    phone,
    opening_period,
    description,
    website,
    openrice,
    instagram,
    facebook,
    login_id,
    business_registration_number,
    tags,
  } = req.body;

  if (email == undefined || email == "") {
    returnFailJson(res, "Missing email", 101);
    return;
  } else if (name == undefined || name == "") {
    returnFailJson(res, "Missing merchant name", 102);
    return;
  } else if (address == undefined || address == "") {
    returnFailJson(res, "Missing address", 103);
    return;
  } else if (phone == undefined || phone == "") {
    returnFailJson(res, "Missing phone", 104);
    return;
  } else if (opening_period == undefined || opening_period == "") {
    returnFailJson(res, "Missing opening period", 105);
    return;
  } else if (login_id == undefined || login_id == "") {
    returnFailJson(res, "Missing login id", 106);
    return;
  }

  let checkResult = await getSpecificMerchantByLoginId(login_id);

  if (!checkResult.success) {
    let merchant_id = "merchant_" + translator.new();
    let params = {
      merchant_id,
      email,
      name,
      address,
      phone,
      opening_period,
      description,
      website,
      openrice,
      instagram,
      facebook,
      login_id,
      photo_url: s3Url + "merchant/" + merchant_id + "/coverpic.png",
      business_registration_number,
      tags: tags.length > 0 ? tags.join(",") : "",
    };

    let result = await createMerchant(params);

    // Create the first store when created merchant
    if (result.success) {
      if (
        req.body.image == undefined ||
        req.body.image == null ||
        req.body.image == ""
      ) {
        let createFolderResult = await createFolder(result.data.merchant_id);
      } else {
        let buf = Buffer.from(
          req.body.image.replace(/^data:image\/\w+;base64,/, ""),
          "base64"
        );
        let createImageResult = await createFile(
          "coverpic.png",
          buf,
          result.data.merchant_id,
          true
        );
      }

      let storeParams = {
        merchant_id: result.data.merchant_id,
        name: "First Store",
        address: result.data.address,
        phone: result.data.phone,
        opening_period: result.data.opening_period,
        login_id: result.data.login_id,
      };

      if (
        req.body.latitude !== undefined &&
        req.body.longitude !== undefined &&
        req.body.latitude !== "" &&
        req.body.longitude !== ""
      ) {
        storeParams.latitude = req.body.latitude;
        storeParams.longitude = req.body.longitude;
      } else {
        storeParams.latitude = NULL;
        storeParams.longitude = NULL;
      }

      let storeResult = await createStore(storeParams);

      if (storeResult.success) {
        res.json({
          success: true,
          result: {
            merchant: result.data,
            store: storeResult.data,
          },
        });
      } else {
        returnFailJson(res, "Create store error", 107);
      }
    } else {
      returnFailJson(res, "Create account error", 108);
    }
  } else {
    returnFailJson(res, "This account is registered", 109);
  }
});

// ANCHOR getMerchantProfile
router.post("/getMerchantProfile", async (req, res, next) => {
  const { login_id } = req.body;

  if (login_id == undefined || login_id == null || login_id == "") {
    returnFailJson(res, "Login id is missing", 101);
    return;
  }

  let merchantResult = await getSpecificMerchantByLoginId(login_id);
  if (
    !(
      merchantResult.success &&
      merchantResult.data !== undefined &&
      merchantResult.data !== null &&
      Object.keys(merchantResult.data).length > 0
    )
  ) {
    returnFailJson(res, "No this merchant", 102);
    return;
  }

  let storeResult = await getSpecificStoreByLoginId(login_id);
  if (
    !(
      storeResult.success &&
      storeResult.data !== undefined &&
      storeResult.data !== null &&
      Object.keys(storeResult.data).length > 0
    )
  ) {
    returnFailJson(res, "No this store", 103);
    return;
  }

  res.json({
    success: true,
    result: {
      merchant: merchantResult.data,
      store: storeResult.data,
    },
  });
});

// ANCHOR updateMerchant
router.post("/updateMerchant", async (req, res, next) => {
  let {
    merchant_id,
    login_id,
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
    latitude,
    longitude,
    store_id,
    image,
  } = req.body;
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
  };
  updateParameter.tags = tags.length > 0 ? tags.join(",") : "";

  // Check missing whether there are missing input
  // if(email == undefined || email == '') {
  //   returnFailJson(res, 'Missing email', 101)
  //   return;
  // } else
  if (name == undefined || name == "") {
    returnFailJson(res, "Missing merchant name", 101);
    return;
  } else if (address == undefined || address == "") {
    returnFailJson(res, "Missing address", 102);
    return;
  } else if (phone == undefined || phone == "") {
    returnFailJson(res, "Missing phone", 103);
    return;
  } else if (opening_period == undefined || opening_period == "") {
    returnFailJson(res, "Missing opening period", 104);
    return;
  } else if (login_id == undefined || login_id == "") {
    returnFailJson(res, "Missing login id", 105);
    return;
  } else if (merchant_id == undefined || merchant_id == "") {
    returnFailJson(res, "Missing merchant id", 106);
    return;
  } else if (store_id == undefined || store_id == "") {
    returnFailJson(res, "Missing store id", 107);
    return;
  }

  // Check phone valid
  //......

  // Check email valid
  // if(!validateEmail(email)) {
  //   returnFailJson(res, 'Email is invalid', 108)
  //   return;
  // }

  let checkResult = await getSpecificMerchantByLoginId(login_id);
  if (
    checkResult === undefined ||
    checkResult.success == false ||
    Object.keys(checkResult.data).length <= 0 ||
    checkResult.data["merchant_id"] !== merchant_id
  ) {
    returnFailJson(res, "Your login id is not the same as merchant id", 108);
    return;
  }

  // Update image if needed
  if (image !== undefined && image !== null && image !== "") {
    let buf = Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    let createImageResult = createFile(`coverpic.png`, buf, merchant_id, true);
  }

  // Update database
  let result = await updateSpecificMerchant(merchant_id, updateParameter);
  if (!result.success) {
    returnFailJson(res, "Cannot update the merchant", 109);
    return;
  }

  let storeParams = {
    store_id,
    phone,
    address,
    opening_period,
  };
  // Update store
  if (
    latitude !== undefined &&
    longitude !== undefined &&
    latitude !== "" &&
    longitude !== ""
  ) {
    storeParams.latitude = latitude;
    storeParams.longitude = longitude;
  }

  let storeUpdateResult = await updateSpecificStore(store_id, storeParams);
  if (!storeUpdateResult.success) {
    returnFailJson(res, "Cannot update the merchant store", 110);
    return;
  }

  res.json({
    success: true,
  });
});
// ------------------------- Merchant -------------------------

// STUB -Store-
// ------------------------- Store -------------------------
// ANCHOR createStore
router.post("/createStore", async (req, res, next) => {
  const {
    email,
    name,
    address,
    phone,
    opening_period,
    merchant_id,
    merchant_login_id,
    store_login_id,
  } = req.body;

  if (email == undefined || email == "") {
    returnFailJson(res, "Missing email", 101);
    return;
  } else if (name == undefined || name == "") {
    returnFailJson(res, "Missing merchant name", 102);
    return;
  } else if (address == undefined || address == "") {
    returnFailJson(res, "Missing address", 103);
    return;
  } else if (phone == undefined || phone == "") {
    returnFailJson(res, "Missing phone", 104);
    return;
  } else if (opening_period == undefined || opening_period == "") {
    returnFailJson(res, "Missing opening period", 105);
    return;
  } else if (merchant_login_id == undefined || merchant_login_id == "") {
    returnFailJson(res, "Missing merchant login id", 106);
    return;
  } else if (store_login_id == undefined || store_login_id == "") {
    returnFailJson(res, "Missing store login id", 107);
    return;
  }

  let checkResult = await getSpecificMerchantByLoginId(merchant_login_id);

  if (
    checkResult !== undefined &&
    checkResult.success == true &&
    Object.keys(checkResult.data).length > 0 &&
    merchant_id == checkResult.data["merchant_id"]
  ) {
    let checkStoreResult = await getSpecificStoreByLoginId(store_login_id);

    if (
      checkStoreResult !== undefined &&
      checkStoreResult.success &&
      Object.keys(checkStoreResult.data).length > 0
    ) {
      returnFailJson(res, "This account is registered", 108);
      return;
    }

    let storeParams = {
      merchant_id: merchant_id,
      name: name,
      address: address,
      phone: phone,
      opening_period: opening_period,
      login_id: store_login_id,
    };

    if (
      req.body.latitude !== undefined &&
      req.body.longitude !== undefined &&
      req.body.latitude !== "" &&
      req.body.longitude !== ""
    ) {
      storeParams.latitude = req.body.latitude;
      storeParams.longitude = req.body.longitude;
    } else {
      storeParams.latitude = NULL;
      storeParams.longitude = NULL;
    }

    let storeResult = await createStore(storeParams);

    if (storeResult.success) {
      res.json({
        success: true,
        result: storeResult.data,
      });
    } else {
      returnFailJson(res, "Cannot create this store", 109);
    }
  } else {
    returnFailJson(
      res,
      "Cannot find the merchant with this merchant login id",
      110
    );
  }
});

// ANCHOR getStoreProfile
router.post("/getStoreProfile", async (req, res, next) => {
  const { login_id } = req.body;

  if (login_id == undefined || login_id == null || login_id == "") {
    returnFailJson(res, "Login id is missing", 101);
    return;
  }

  let result = await getSpecificStoreByLoginId(login_id);

  if (
    result.success &&
    result.data !== undefined &&
    result.data !== null &&
    Object.keys(result.data).length > 0
  ) {
    res.json({
      success: true,
      result: {
        store: result.data,
      },
    });
  } else {
    returnFailJson(res, "Not found this store", 102);
  }
});
// ------------------------- Store -------------------------

// STUB -Activity-
// ------------------------- Activity -------------------------
// ANCHOR createActivity
router.post("/createActivity", async (req, res, next) => {
  const {
    merchant_id,
    store_id,
    name,
    address,
    status,
    type,
    description,
    reward_coins,
    form_of_participation,
    start_date,
    end_date,
    image,
    login_id,
    login_type,
  } = req.body;
  let activity_id = "activity_" + translator.new();

  // Check missing whether there are missing input
  if (merchant_id == undefined || merchant_id == "") {
    returnFailJson(res, "Missing merchant id", 101);
    return;
  } else if (store_id == undefined || store_id == "") {
    returnFailJson(res, "Missing store id", 102);
    return;
  } else if (
    start_date == undefined ||
    start_date == "" ||
    !Object.prototype.toString.call(start_date) === "[object Date]"
  ) {
    returnFailJson(res, "Start date is invalid", 103);
    return;
  } else if (
    end_date == undefined ||
    end_date == "" ||
    !!Object.prototype.toString.call(end_date) === "[object Date]"
  ) {
    returnFailJson(res, "End date is invalid", 104);
    return;
  } else if (name == undefined || name == "") {
    returnFailJson(res, "Missing activity name", 105);
    return;
  } else if (address == undefined || address == "") {
    returnFailJson(res, "Missing address", 106);
    return;
  } else if (login_id == undefined || login_id == "") {
    returnFailJson(res, "Missing login id", 107);
    return;
  } else if (login_type == undefined || login_type == "") {
    returnFailJson(res, "Missing login type", 108);
    return;
  } else if (login_type !== "merchant" && login_type !== "store") {
    returnFailJson(res, "Login type is invalid", 109);
    return;
  } else if (status == undefined || status == "") {
    status = 1;
  } else if (reward_coins == undefined || reward_coins == "") {
    reward_coins = 0;
  }

  // Check missing whether the call is valid or not
  if (login_type == "merchant") {
    let checkResult = await getSpecificMerchantByLoginId(login_id);

    if (
      checkResult === undefined ||
      !checkResult.success ||
      (checkResult.success && checkResult.data["merchant_id"] !== merchant_id)
    ) {
      returnFailJson(res, "Your login id is not the same as merchant id", 110);
      return;
    }
  } else {
    let checkResult = await getSpecificStoreByLoginId(login_id);

    if (
      checkResult === undefined ||
      !checkResult.success ||
      (checkResult.success == true && checkResult.data["store_id"] !== store_id)
    ) {
      returnFailJson(res, "Your login id is not the same as store id", 111);
      return;
    }
  }

  // let timestamp = Math.floor(Date.now() / 1000);
  let fileName = "activity" + "-" + activity_id + ".jpg";
  let photoUrl = "";

  // Upload image if needed
  if (image !== undefined && image !== null && image !== "") {
    photoUrl = s3Url + "merchant/" + merchant_id + "/" + fileName;

    let buf = Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    let createImageResult = await createFile(fileName, buf, merchant_id, true);
  }

  let params = {
    activity_id,
    merchant_id,
    store_id,
    name,
    address,
    status,
    type,
    description,
    reward_coins,
    form_of_participation,
    start_date,
    end_date,
    photo_url: photoUrl,
  };

  let result = await createActivity(params);

  if (result.success && result.data !== undefined && result.data !== null) {
    let tempData = {};
    for (let key in result.data) {
      tempData[key] = result.data[key];
    }

    res.json({
      success: true,
      result: tempData,
    });
  } else {
    returnFailJson(res, "Cannot create activity", 112);
  }
});

// ANCHOR getActivityList
router.post("/getActivityList", async (req, res, next) => {
  let { merchant_id, login_id, store_id, login_type, limit, offset } = req.body;

  // Check missing whether there are missing input
  if (merchant_id == undefined || merchant_id == "") {
    returnFailJson(res, "Merchant id is missing", 101);
    return;
  } else if (login_id == undefined || login_id == "") {
    returnFailJson(res, "Missing login id", 102);
    return;
  } else if (login_type == undefined || login_type == "") {
    returnFailJson(res, "Missing login type", 103);
    return;
  } else if (login_type !== "merchant" && login_type !== "store") {
    returnFailJson(res, "Login type is invalid", 104);
    return;
  }

  if (limit == undefined || limit == null || limit == "") {
    limit = 0;
  }
  if (offset == undefined || offset == null || offset == "") {
    offset = 0;
  }

  if (login_type == "merchant") {
    let checkResult = await getSpecificMerchantByLoginId(login_id);

    if (
      checkResult === undefined ||
      !checkResult.success ||
      (checkResult.success && checkResult.data["merchant_id"] !== merchant_id)
    ) {
      returnFailJson(res, "Your login id is not the same as merchant id", 105);
      return;
    }
  } else {
    let checkResult = await getSpecificStoreByLoginId(login_id);

    if (
      checkResult === undefined ||
      !checkResult.success ||
      (checkResult.success == true &&
        (checkResult.data["store_id"] !== store_id ||
          checkResult.data["merchant_id"] !== merchant_id))
    ) {
      returnFailJson(res, "Your login id is not the same as store id", 106);
      return;
    }
  }

  let result = await getActivityListByMerchantIdWithCount(
    merchant_id,
    limit,
    offset
  );

  if (result.success && result.data !== undefined && result.data !== null) {
    res.json({
      success: true,
      result: result.data,
    });
  } else {
    returnFailJson(res, "Not found any activities", 107);
  }
});

// ANCHOR getSpecificActivity
router.post("/getSpecificActivity", async (req, res, next) => {
  let { merchant_id, login_id, store_id, login_type, activity_id } = req.body;

  // Check missing whether there are missing input
  if (merchant_id == undefined || merchant_id == "") {
    returnFailJson(res, "Merchant id is missing", 101);
    return;
  } else if (login_id == undefined || login_id == "") {
    returnFailJson(res, "Missing login id", 102);
    return;
  } else if (login_type == undefined || login_type == "") {
    returnFailJson(res, "Missing login type", 103);
    return;
  } else if (login_type !== "merchant" && login_type !== "store") {
    returnFailJson(res, "Login type is invalid", 104);
    return;
  }

  // Check missing whether the call is valid or not
  if (login_type == "merchant") {
    let checkResult = await getSpecificMerchantByLoginId(login_id);

    if (
      checkResult === undefined ||
      !checkResult.success ||
      (checkResult.success && checkResult.data["merchant_id"] !== merchant_id)
    ) {
      returnFailJson(res, "Your login id is not the same as merchant id", 105);
      return;
    }
  } else {
    let checkResult = await getSpecificStoreByLoginId(login_id);

    if (
      checkResult === undefined ||
      !checkResult.success ||
      (checkResult.success == true &&
        (checkResult.data["store_id"] !== store_id ||
          checkResult.data["merchant_id"] !== merchant_id))
    ) {
      returnFailJson(res, "Your login id is not the same as store id", 106);
      return;
    }
  }

  let result = await getSpecificActivityByActivityId(activity_id);

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
    returnFailJson(res, "Not found this activity", 107);
  }
});

// ANCHOR updateSpecificActivity
router.post("/updateSpecificActivity", async (req, res, next) => {
  let {
    activity_id,
    merchant_id,
    store_id,
    login_id,
    login_type,
    name,
    address,
    status,
    type,
    description,
    reward_coins,
    form_of_participation,
    start_date,
    end_date,
    image,
  } = req.body;
  let updateParameter = {
    activity_id,
    merchant_id,
    store_id,
    login_id,
    login_type,
    name,
    address,
    status,
    type,
    description,
    reward_coins,
    form_of_participation,
    start_date,
    end_date,
  };

  // Check missing whether there are missing input
  if (activity_id == undefined || activity_id == "") {
    returnFailJson(res, "Activity id is missing", 101);
    return;
  } else if (merchant_id == undefined || merchant_id == "") {
    returnFailJson(res, "Merchant id is missing", 102);
    return;
  } else if (login_id == undefined || login_id == "") {
    returnFailJson(res, "Missing login id", 103);
    return;
  } else if (login_type == undefined || login_type == "") {
    returnFailJson(res, "Missing login type", 104);
    return;
  } else if (login_type !== "merchant" && login_type !== "store") {
    returnFailJson(res, "Login type is invalid", 105);
    return;
  }

  if (status == undefined || status == "") {
    status = 1;
  }

  // Check missing whether the call is valid or not
  if (login_type == "merchant") {
    let checkResult = await getSpecificMerchantByLoginId(login_id);

    if (
      checkResult === undefined ||
      !checkResult.success ||
      (checkResult.success && checkResult.data["merchant_id"] !== merchant_id)
    ) {
      returnFailJson(res, "Your login id is not the same as merchant id", 106);
      return;
    }
  } else {
    let checkResult = await getSpecificStoreByLoginId(login_id);

    if (
      checkResult === undefined ||
      !checkResult.success ||
      (checkResult.success == true &&
        checkResult.data["store_id"] !== store_id) ||
      (checkResult.success && checkResult.data["merchant_id"] !== merchant_id)
    ) {
      returnFailJson(res, "Your login id is not the same as store id", 107);
      return;
    }
  }
  let activityResult = await getSpecificActivityByActivityIdAndMerchantId(
    activity_id,
    merchant_id
  );
  if (activityResult.success && Object.keys(activityResult.data).length > 0) {
  } else {
    returnFailJson(res, "Not found this activity", 108);
    return;
  }

  // Update image if needed
  if (image !== undefined && image !== null && image !== "") {
    let buf = Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    let createImageResult = await createFile(
      `activity-${activity_id}.jpg`,
      buf,
      merchant_id,
      true
    );
  }

  // Update database
  let result = await updateSpecificActivity(activity_id, updateParameter);

  if (result.success) {
    res.json({
      success: true,
    });
  } else {
    returnFailJson(res, "Cannot update the activity", 109);
  }
});

// ANCHOR deleteSpecificActivity
router.post("/deleteSpecificActivity", async (req, res, next) => {
  let { activity_id, merchant_id, store_id, login_id, login_type } = req.body;

  // Check missing whether there are missing input
  if (activity_id == undefined || activity_id == "") {
    returnFailJson(res, "Activity id is missing", 101);
    return;
  } else if (merchant_id == undefined || merchant_id == "") {
    returnFailJson(res, "Merchant id is missing", 102);
    return;
  } else if (login_id == undefined || login_id == "") {
    returnFailJson(res, "Missing login id", 103);
    return;
  } else if (login_type == undefined || login_type == "") {
    returnFailJson(res, "Missing login type", 104);
    return;
  } else if (login_type !== "merchant" && login_type !== "store") {
    returnFailJson(res, "Login type is invalid", 105);
    return;
  }

  // Check missing whether the call is valid or not
  if (login_type == "merchant") {
    let checkResult = await getSpecificMerchantByLoginId(login_id);

    if (
      checkResult === undefined ||
      !checkResult.success ||
      (checkResult.success && checkResult.data["merchant_id"] !== merchant_id)
    ) {
      returnFailJson(res, "Your login id is not the same as merchant id", 106);
      return;
    }
  } else {
    let checkResult = await getSpecificStoreByLoginId(login_id);

    if (
      checkResult === undefined ||
      !checkResult.success ||
      (checkResult.success == true &&
        checkResult.data["store_id"] !== store_id) ||
      (checkResult.success && checkResult.data["merchant_id"] !== merchant_id)
    ) {
      returnFailJson(res, "Your login id is not the same as store id", 107);
      return;
    }
  }
  let activityResult = await getSpecificActivityByActivityIdAndMerchantId(
    activity_id,
    merchant_id
  );
  if (
    activityResult.success &&
    activityResult.data !== undefined &&
    Object.keys(activityResult.data).length > 0
  ) {
  } else {
    returnFailJson(res, "Not found this activity", 108);
    return;
  }

  // Delete activity image
  // let deleteResult = deleteFile(`activity-${activity_id}.jpg`, merchant_id)

  // Delete activity
  let result = await deleteSpecificActivity(activity_id);

  if (result.success) {
    res.json({
      success: true,
    });
  } else {
    returnFailJson(res, "Cannot delete the activity", 109);
  }
});
// ------------------------- Activity -------------------------

// STUB -Coupon-
// ------------------------- Coupon -------------------------
// ANCHOR createCoupon
router.post("/createCoupon", async (req, res, next) => {
  const {
    merchant_id,
    store_id,
    type,
    name,
    description,
    generated_reason,
    require_coins,
    status,
    base_discount,
    percentage_discount,
    start_date,
    end_date,
    image,
    login_id,
    login_type,
    coupon_discount_description,
  } = req.body;
  let coupon_id = "coupon_" + translator.new();

  // Check missing whether there are missing input
  if (merchant_id == undefined || merchant_id == "") {
    returnFailJson(res, "Missing merchant id", 101);
    return;
  } else if (store_id == undefined || store_id == "") {
    returnFailJson(res, "Missing store id", 102);
    return;
  } else if (
    start_date == undefined ||
    start_date == "" ||
    !Object.prototype.toString.call(start_date) === "[object Date]"
  ) {
    returnFailJson(res, "Start date is invalid", 103);
    return;
  } else if (
    end_date == undefined ||
    end_date == "" ||
    !!Object.prototype.toString.call(end_date) === "[object Date]"
  ) {
    returnFailJson(res, "End date is invalid", 104);
    return;
  } else if (name == undefined || name == "") {
    returnFailJson(res, "Missing coupon name", 105);
    return;
  } else if (login_id == undefined || login_id == "") {
    returnFailJson(res, "Missing login id", 106);
    return;
  } else if (login_type == undefined || login_type == "") {
    returnFailJson(res, "Missing login type", 107);
    return;
  } else if (login_type !== "merchant" && login_type !== "store") {
    returnFailJson(res, "Login type is invalid", 108);
    return;
  } else if (status == undefined || status == "") {
    status = 1;
  } else if (require_coins == undefined || require_coins == "") {
    require_coins = 0;
  }

  // Check missing whether the call is valid or not
  if (login_type == "merchant") {
    let checkResult = await getSpecificMerchantByLoginId(login_id);

    if (
      checkResult === undefined ||
      !checkResult.success ||
      (checkResult.success && checkResult.data["merchant_id"] !== merchant_id)
    ) {
      returnFailJson(res, "Your login id is not the same as merchant id", 109);
      return;
    }
  } else {
    let checkResult = await getSpecificStoreByLoginId(login_id);

    if (
      checkResult === undefined ||
      !checkResult.success ||
      (checkResult.success == true &&
        (checkResult.data["store_id"] !== store_id ||
          checkResult.data["merchant_id"] !== merchant_id))
    ) {
      returnFailJson(res, "Your login id is not the same as store id", 110);
      return;
    }
  }

  // let timestamp = Math.floor(Date.now() / 1000);
  let fileName = "coupon" + "-" + coupon_id + ".jpg";
  let photoUrl = "";

  // Upload image if needed
  if (image !== undefined && image !== null && image !== "") {
    photoUrl = s3Url + "merchant/" + merchant_id + "/" + fileName;

    let buf = Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    let createImageResult = await createFile(fileName, buf, merchant_id, true);
  }

  let params = {
    coupon_id,
    merchant_id,
    store_id,
    type,
    name,
    description,
    generated_reason,
    require_coins,
    status,
    base_discount,
    percentage_discount,
    start_date,
    end_date,
    photo_url: photoUrl,
    coupon_discount_description,
  };

  let result = await createCoupon(params);

  if (result.success && result.data !== undefined && result.data !== null) {
    res.json({
      success: true,
      result: result.data,
    });
  } else {
    returnFailJson(res, "Cannot create coupon", 111);
  }
});

// ANCHOR getCouponList
router.post("/getCouponList", async (req, res, next) => {
  let { merchant_id, login_id, store_id, login_type, limit, offset } = req.body;

  // Check missing whether there are missing input
  if (merchant_id == undefined || merchant_id == "") {
    returnFailJson(res, "Merchant id is missing", 101);
    return;
  } else if (login_id == undefined || login_id == "") {
    returnFailJson(res, "Missing login id", 102);
    return;
  } else if (login_type == undefined || login_type == "") {
    returnFailJson(res, "Missing login type", 103);
    return;
  } else if (login_type !== "merchant" && login_type !== "store") {
    returnFailJson(res, "Login type is invalid", 104);
    return;
  }

  if (limit == undefined || limit == null || limit == "") {
    limit = 0;
  }
  if (offset == undefined || offset == null || offset == "") {
    offset = null;
  }

  if (login_type == "merchant") {
    let checkResult = await getSpecificMerchantByLoginId(login_id);

    if (
      checkResult === undefined ||
      !checkResult.success ||
      (checkResult.success && checkResult.data["merchant_id"] !== merchant_id)
    ) {
      returnFailJson(res, "Your login id is not the same as merchant id", 105);
      return;
    }
  } else {
    let checkResult = await getSpecificStoreByLoginId(login_id);

    if (
      checkResult === undefined ||
      !checkResult.success ||
      (checkResult.success == true &&
        (checkResult.data["store_id"] !== store_id ||
          checkResult.data["merchant_id"] !== merchant_id))
    ) {
      returnFailJson(res, "Your login id is not the same as store id", 106);
      return;
    }
  }

  let result = await getCouponListByMerchantIdWithCount(
    merchant_id,
    limit,
    offset
  );
  if (result.success && result.data !== undefined && result.data !== null) {
    res.json({
      success: true,
      result: result.data,
    });
  } else {
    returnFailJson(res, "Not found any coupons", 107);
  }
});

// ANCHOR getSpecificCoupon
router.post("/getSpecificCoupon", async (req, res, next) => {
  let { merchant_id, login_id, store_id, login_type, coupon_id } = req.body;

  // Check missing whether there are missing input
  if (merchant_id == undefined || merchant_id == "") {
    returnFailJson(res, "Merchant id is missing", 101);
    return;
  } else if (login_id == undefined || login_id == "") {
    returnFailJson(res, "Missing login id", 102);
    return;
  } else if (login_type == undefined || login_type == "") {
    returnFailJson(res, "Missing login type", 103);
    return;
  } else if (login_type !== "merchant" && login_type !== "store") {
    returnFailJson(res, "Login type is invalid", 104);
    return;
  }

  // Check missing whether the call is valid or not
  if (login_type == "merchant") {
    let checkResult = await getSpecificMerchantByLoginId(login_id);

    if (
      checkResult === undefined ||
      !checkResult.success ||
      (checkResult.success && checkResult.data["merchant_id"] !== merchant_id)
    ) {
      returnFailJson(res, "Your login id is not the same as merchant id", 105);
      return;
    }
  } else {
    let checkResult = await getSpecificStoreByLoginId(login_id);

    if (
      checkResult === undefined ||
      !checkResult.success ||
      (checkResult.success == true &&
        (checkResult.data["store_id"] !== store_id ||
          checkResult.data["merchant_id"] !== merchant_id))
    ) {
      returnFailJson(res, "Your login id is not the same as store id", 106);
      return;
    }
  }

  let result = await getSpecificCouponByCouponId(coupon_id);

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
    returnFailJson(res, "Not found this coupon", 107);
  }
});

// ANCHOR updateSpecificCoupon
router.post("/updateSpecificCoupon", async (req, res, next) => {
  let {
    coupon_id,
    merchant_id,
    type,
    store_id,
    login_id,
    login_type,
    name,
    description,
    generated_reason,
    require_coins,
    status,
    base_discount,
    percentage_discount,
    start_date,
    end_date,
    coupon_discount_description,
    image,
  } = req.body;
  let updateParameter = {
    coupon_id,
    merchant_id,
    store_id,
    type,
    login_id,
    login_type,
    name,
    description,
    generated_reason,
    require_coins,
    status,
    base_discount,
    percentage_discount,
    start_date,
    end_date,
    coupon_discount_description,
  };

  // Check missing whether there are missing input
  if (coupon_id == undefined || coupon_id == "") {
    returnFailJson(res, "Coupon id is missing", 101);
    return;
  } else if (merchant_id == undefined || merchant_id == "") {
    returnFailJson(res, "Merchant id is missing", 102);
    return;
  } else if (login_id == undefined || login_id == "") {
    returnFailJson(res, "Missing login id", 103);
    return;
  } else if (login_type == undefined || login_type == "") {
    returnFailJson(res, "Missing login type", 104);
    return;
  } else if (login_type !== "merchant" && login_type !== "store") {
    returnFailJson(res, "Login type is invalid", 105);
    return;
  }

  if (status == undefined || status == "") {
    status = 1;
  }

  // Check missing whether the call is valid or not
  if (login_type == "merchant") {
    let checkResult = await getSpecificMerchantByLoginId(login_id);

    if (
      checkResult === undefined ||
      !checkResult.success ||
      (checkResult.success && checkResult.data["merchant_id"] !== merchant_id)
    ) {
      returnFailJson(res, "Your login id is not the same as merchant id", 106);
      return;
    }
  } else {
    let checkResult = await getSpecificStoreByLoginId(login_id);

    if (
      checkResult === undefined ||
      !checkResult.success ||
      (checkResult.success == true &&
        checkResult.data["store_id"] !== store_id) ||
      (checkResult.success == true &&
        checkResult.data["merchant_id"] !== merchant_id)
    ) {
      returnFailJson(res, "Your login id is not the same as store id", 107);
      return;
    }
  }
  let couponResult = await getSpecificCouponByCouponIdAndMerchantId(
    coupon_id,
    merchant_id
  );
  if (
    couponResult.success &&
    couponResult.data !== undefined &&
    couponResult.data !== null &&
    Object.keys(couponResult.data).length > 0
  ) {
  } else {
    returnFailJson(res, "Not found this coupon", 108);
    return;
  }

  // Update image if needed
  if (image !== undefined && image !== null && image !== "") {
    let buf = Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    let createImageResult = await createFile(
      `coupon-${coupon_id}.jpg`,
      buf,
      merchant_id,
      true
    );
  }

  // Update database
  let result = await updateSpecificCoupon(coupon_id, updateParameter);

  if (result.success) {
    res.json({
      success: true,
    });
  } else {
    returnFailJson(res, "Cannot update the coupon", 109);
  }
});

// ANCHOR deleteSpecificCoupon
router.post("/deleteSpecificCoupon", async (req, res, next) => {
  let { coupon_id, merchant_id, store_id, login_id, login_type } = req.body;

  // Check missing whether there are missing input
  if (coupon_id == undefined || coupon_id == "") {
    returnFailJson(res, "Coupon id is missing", 101);
    return;
  } else if (merchant_id == undefined || merchant_id == "") {
    returnFailJson(res, "Merchant id is missing", 102);
    return;
  } else if (login_id == undefined || login_id == "") {
    returnFailJson(res, "Missing login id", 103);
    return;
  } else if (login_type == undefined || login_type == "") {
    returnFailJson(res, "Missing login type", 104);
    return;
  } else if (login_type !== "merchant" && login_type !== "store") {
    returnFailJson(res, "Login type is invalid", 105);
    return;
  }

  // Check missing whether the call is valid or not
  if (login_type == "merchant") {
    let checkResult = await getSpecificMerchantByLoginId(login_id);

    if (
      checkResult === undefined ||
      !checkResult.success ||
      (checkResult.success && checkResult.data["merchant_id"] !== merchant_id)
    ) {
      returnFailJson(res, "Your login id is not the same as merchant id", 106);
      return;
    }
  } else {
    let checkResult = await getSpecificStoreByLoginId(login_id);

    if (
      checkResult === undefined ||
      !checkResult.success ||
      (checkResult.success == true &&
        checkResult.data["store_id"] !== store_id) ||
      (checkResult.success == true &&
        checkResult.data["merchant_id"] !== merchant_id)
    ) {
      returnFailJson(res, "Your login id is not the same as store id", 107);
      return;
    }
  }
  let couponResult = await getSpecificCouponByCouponIdAndMerchantId(
    coupon_id,
    merchant_id
  );
  if (
    couponResult.success &&
    couponResult.data !== undefined &&
    couponResult.data !== null &&
    Object.keys(couponResult.data).length > 0
  ) {
  } else {
    returnFailJson(res, "Not found this coupon", 108);
    return;
  }

  // Delete activity image
  // let deleteResult = deleteFile(`coupon-${coupon_id}.jpg`, merchant_id)

  // Delete activity
  let result = await deleteSpecificCoupon(coupon_id);

  if (result.success) {
    res.json({
      success: true,
    });
  } else {
    returnFailJson(res, "Cannot delete the coupon", 109);
  }
});

// ANCHOR redeemUserCoupon
router.post("/redeemUserCoupon", async (req, res, next) => {
  let { merchant_id, store_id, login_id, login_type, hash } = req.body;

  // Check missing whether there are missing input
  if (merchant_id == undefined || merchant_id == null || merchant_id == "") {
    returnFailJson(res, "Merchant id is missing", 101);
    return;
  } else if (login_id == undefined || login_id == null || login_id == "") {
    returnFailJson(res, "Missing login id", 102);
    return;
  } else if (
    login_type == undefined ||
    login_type == null ||
    login_type == ""
  ) {
    returnFailJson(res, "Missing login type", 103);
    return;
  } else if (login_type !== "merchant" && login_type !== "store") {
    returnFailJson(res, "Login type is invalid", 104);
    return;
  } else if (hash == undefined || hash == null || hash == "") {
    returnFailJson(res, "Missing hash", 105);
    return;
  }

  // Check missing whether the call is valid or not
  if (login_type == "merchant") {
    let checkResult = await getSpecificMerchantByLoginId(login_id);

    if (
      checkResult === undefined ||
      !checkResult.success ||
      (checkResult.success && checkResult.data["merchant_id"] !== merchant_id)
    ) {
      returnFailJson(res, "Your login id is not the same as merchant id", 106);
      return;
    }
  } else {
    let checkResult = await getSpecificStoreByLoginId(login_id);

    if (
      checkResult === undefined ||
      !checkResult.success ||
      (checkResult.success == true &&
        checkResult.data["store_id"] !== store_id) ||
      (checkResult.success == true &&
        checkResult.data["merchant_id"] !== merchant_id)
    ) {
      returnFailJson(res, "Your login id is not the same as store id", 107);
      return;
    }
  }

  let checkCouponRecordResult = await getRecordByHash(hash);
  if (
    checkCouponRecordResult.success &&
    checkCouponRecordResult.data !== undefined &&
    checkCouponRecordResult.data !== null &&
    checkCouponRecordResult.data.length > 0
  ) {
    if (checkCouponRecordResult.data[0]["status"] == 1) {
      let recordId = checkCouponRecordResult.data[0]["record_id"];

      let result = await updateCouponRecord(recordId, 0);

      if (result !== undefined && result.success) {
        res.json({
          success: true,
        });
      } else {
        returnFailJson(res, "Cannot update coupon record", 108);
      }
    } else {
      returnFailJson(res, "This coupon is redeemed before", 109);
    }
  } else {
    returnFailJson(res, "Invalid redeem", 110);
  }
});
// ------------------------- Coupon -------------------------

// STUB -User-
// ------------------------- User -------------------------
// ANCHOR addCoins
router.post("/addCoins", async (req, res, next) => {
  let {
    merchant_id,
    store_id,
    login_id,
    login_type,
    user_id,
    coins,
    remarks,
  } = req.body;

  // Check missing whether there are missing input
  if (merchant_id == undefined || merchant_id == "") {
    returnFailJson(res, "Merchant id is missing", 101);
    return;
  } else if (login_id == undefined || login_id == "") {
    returnFailJson(res, "Missing login id", 102);
    return;
  } else if (login_type == undefined || login_type == "") {
    returnFailJson(res, "Missing login type", 103);
    return;
  } else if (login_type !== "merchant" && login_type !== "store") {
    returnFailJson(res, "Login type is invalid", 104);
    return;
  } else if (parseInt(coins) == NaN || parseInt(coins) <= 0) {
    returnFailJson(res, "Coins is invalid or below 0", 105);
    return;
  }

  // Check merchant login
  if (login_type == "merchant") {
    let checkResult = await getSpecificMerchantByLoginId(login_id);

    if (
      checkResult === undefined ||
      !checkResult.success ||
      (checkResult.success && checkResult.data["merchant_id"] !== merchant_id)
    ) {
      returnFailJson(res, "Your login id is not the same as merchant id", 106);
      return;
    }
  } else {
    let checkResult = await getSpecificStoreByLoginId(login_id);

    if (
      checkResult === undefined ||
      !checkResult.success ||
      (checkResult.success == true &&
        (checkResult.data["store_id"] !== store_id ||
          checkResult.data["merchant_id"] !== merchant_id))
    ) {
      returnFailJson(res, "Your login id is not the same as store id", 107);
      return;
    }
  }

  // Check user
  let checkUserResult = await getSpecificUserByUserId(user_id);
  if (
    checkUserResult.success &&
    checkUserResult.data !== undefined &&
    checkUserResult.data !== null &&
    Object.keys(checkUserResult.data).length > 0
  ) {
    var decarbon_coins =
      checkUserResult.data["coins"] !== undefined &&
      checkUserResult.data["coins"] !== NaN
        ? checkUserResult.data["coins"]
        : 0;
  } else {
    returnFailJson(res, "Cannot find the user by this user id", 108);
    return;
  }

  // Update user coins
  let user_old_coins = decarbon_coins;
  let user_new_coins = user_old_coins + coins;
  let updateResult = await updateUserPoints(user_id, user_new_coins);

  if (updateResult.success) {
    // Add records
    let recordsParam = {
      activity_id: null,
      coupon_id: null,
      user_id,
      merchant_id,
      store_id,
      type: "coins",
      coins,
      user_old_coins,
      user_new_coins,
      remarks,
      status: "1",
    };
    let recordsReuslt = await createRecord(recordsParam);

    if (recordsReuslt.success) {
      res.json({
        success: true,
      });
    } else {
      returnFailJson(res, "Cannot add record", 109);
    }
  } else {
    returnFailJson(res, "Cannot update user coins", 110);
  }
});
// ------------------------- User -------------------------

// STUB -Record-
// ------------------------- Record -------------------------
// ANCHOR getMerchantRecords
router.post("/getMerchantRecords", async (req, res, next) => {
  let {
    merchant_id,
    store_id,
    login_id,
    login_type,
    date,
    type,
    limit,
    offset,
  } = req.body;

  if (merchant_id == undefined || merchant_id == "") {
    returnFailJson(res, "Missing merchant id", 101);
    return;
  } else if (store_id == undefined || store_id == "") {
    returnFailJson(res, "Missing store id", 102);
    return;
  } else if (login_id == undefined || login_id == "") {
    returnFailJson(res, "Missing login id", 103);
    return;
  } else if (login_type == undefined || login_type == "") {
    returnFailJson(res, "Missing login type", 104);
    return;
  } else if (login_type !== "merchant" && login_type !== "store") {
    returnFailJson(res, "Login type is invalid", 105);
    return;
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

  // Check missing whether the call is valid or not
  if (login_type == "merchant") {
    let checkResult = await getSpecificMerchantByLoginId(login_id);

    if (
      checkResult === undefined ||
      !checkResult.success ||
      (checkResult.success && checkResult.data["merchant_id"] !== merchant_id)
    ) {
      returnFailJson(res, "Your login id is not the same as merchant id", 106);
      return;
    }
  } else {
    let checkResult = await getSpecificStoreByLoginId(login_id);

    if (
      checkResult === undefined ||
      !checkResult.success ||
      (checkResult.success == true &&
        (checkResult.data["store_id"] !== store_id ||
          checkResult.data["merchant_id"] !== merchant_id))
    ) {
      returnFailJson(res, "Your login id is not the same as store id", 107);
      return;
    }
  }

  let result = await getRecordsByMerchantIdAndStoreId(
    merchant_id,
    store_id,
    limit,
    offset,
    date,
    type
  );

  if (result !== null && result.success) {
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
      tempValue['user_photo_url'] = value['user_photo_url']
      tempValue["user_first_name"] = value["user_first_name"];
      tempValue["user_last_name"] = value["user_last_name"];
      if (value["type"] == "coins") {
        tempValue["parsed_type"] = "Add Coins";
        tempValue[
          "name"
        ] = `Add Coins - (${value["user_first_name"]}, ${value["user_last_name"]})`;
        tempValue["parsed_status"] = value["status"] == 1 ? "Done" : "Invalid";
      } else if (value["type"] == "coupon") {
        tempValue["parsed_type"] = value["coupon_type"];
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
    returnFailJson(res, "Cannot get user records", 108);
  }
});

// ANCHOR addUserToActivity
router.post("/addUserToActivity", async (req, res, next) => {
  let {
    merchant_id,
    store_id,
    login_id,
    login_type,
    user_id,
    activity_id,
  } = req.body;

  if (merchant_id == undefined || merchant_id == null || merchant_id == "") {
    returnFailJson(res, "Missing merchant id", 101);
    return;
  } else if (store_id == undefined || store_id == null || store_id == "") {
    returnFailJson(res, "Missing store id", 102);
    return;
  } else if (login_id == undefined || login_id == null || login_id == "") {
    returnFailJson(res, "Missing login id", 103);
    return;
  } else if (
    login_type == undefined ||
    login_type == null ||
    login_type == ""
  ) {
    returnFailJson(res, "Missing login type", 104);
    return;
  } else if (login_type !== "merchant" && login_type !== "store") {
    returnFailJson(res, "Login type is invalid", 105);
    return;
  } else if (user_id == undefined || user_id == null || user_id == "") {
    returnFailJson(res, "Missing user id", 106);
    return;
  } else if (
    activity_id == undefined ||
    activity_id == null ||
    activity_id == ""
  ) {
    returnFailJson(res, "Missing activity id", 107);
    return;
  }

  if (login_type == "merchant") {
    let checkResult = await getSpecificMerchantByLoginId(login_id);

    if (
      checkResult === undefined ||
      !checkResult.success ||
      (checkResult.success && checkResult.data["merchant_id"] !== merchant_id)
    ) {
      returnFailJson(res, "Your login id is not the same as merchant id", 108);
      return;
    }
  } else {
    let checkResult = await getSpecificStoreByLoginId(login_id);

    if (
      checkResult === undefined ||
      !checkResult.success ||
      (checkResult.success == true &&
        (checkResult.data["store_id"] !== store_id ||
          checkResult.data["merchant_id"] !== merchant_id))
    ) {
      returnFailJson(res, "Your login id is not the same as store id", 109);
      return;
    }
  }

  let checkActivityResult = await getSpecificActivityByActivityIdAndMerchantId(
    activity_id,
    merchant_id
  );
  if (
    checkActivityResult == undefined ||
    !checkActivityResult.success ||
    Object.keys(checkActivityResult.data).length <= 0
  ) {
    returnFailJson(res, "Cannot get the activity", 110);
    return;
  }

  let checkUserRedeemResult = await getRecordByUserIdAndActivityId(
    user_id,
    activity_id
  );
  if (checkUserRedeemResult.success && checkUserRedeemResult.data.length > 0) {
    returnFailJson(res, "User join this activity before", 111);
    return;
  }

  let coins = checkActivityResult.data["reward_coins"];
  let userResult = await getSpecificUserByUserId(user_id);
  if (userResult == undefined || !userResult.success) {
    returnFailJson(res, "Cannot get the user", 112);
    return;
  }

  let userCoins = userResult.data["coins"];
  let updateUserPointsResult = await updateUserPoints(
    user_id,
    userCoins + coins
  );
  if (updateUserPointsResult == undefined || !updateUserPointsResult.success) {
    returnFailJson(res, "Cannot update user points", 113);
    return;
  }

  let parameter = {
    activity_id,
    coupon_id: null,
    merchant_id,
    user_id,
    store_id,
    type: "activity",
    coins,
    user_old_coins: userCoins,
    user_new_coins: userCoins + coins,
    remarks: null,
    status: 1,
  };
  let addRecordResult = await createRecord(parameter);

  if (addRecordResult !== undefined && addRecordResult.success) {
    res.json({
      success: true,
    });
  } else {
    let updateUserPointsResult = updateUserPoints(user_id, userCoins);
    returnFailJson(res, "Cannot insert record", 114);
  }
});
// ------------------------- Record -------------------------

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
