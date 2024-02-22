const mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
const { AddressSchema } = require("../../utils/utils.schema.js");
const CONFIG = require("../../../config/config.js");

const companySchema = new mongoose.Schema(
  {
    companyId: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
    },
    encryptedPassword: {
      type: String,
    },
    address: AddressSchema,
    fields: {
        type: [String],
      default: [],
    },
    description: String,
    image: String,
    phone: {
      type: [String],
      default: [],
    },
    employees_number: Number,
    activateEmail: {
      type: Boolean,
      default: false,
    },
    recoveryCode: String,
    recoveryCodeDate: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);


companySchema
  .virtual("password")
  .set(function (password) {
    this.encryptedPassword = bcrypt.hashSync(
      password,
      parseInt(CONFIG.BCRYPT_SALT)
    );
  })
  .get(function () {
    return this.encryptedPassword;
  });

const companyModel = mongoose.model("Company", companySchema);

module.exports = companyModel;
