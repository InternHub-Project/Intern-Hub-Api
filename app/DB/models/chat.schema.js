const mongoose = require('mongoose');
const messageSchema = require('./message.schema.js');



  const chatSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    companyId: { type:String, required: true},
    messages: { type: [messageSchema], default: [] },
    status: {type: String, enum:['close', 'active'], default: 'active'}
  },{
    toJSON: { virtuals: true,versionKey:false },
    toObject: { virtuals: true,versionKey:false },
    timestamps:true
  });


  chatSchema.virtual("companyList",{
    ref:"Company",
    localField:"companyId",
    foreignField:"companyId",
  })
  chatSchema.virtual("userList",{
    ref:"User",
    localField:"userId",
    foreignField:"userId",
  })



  const chatModel=mongoose.model('Chat',chatSchema);
  
  module.exports=chatModel;