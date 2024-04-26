const mongoose = require('mongoose');

// Define the Message Schema
const messageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true
  },
  senderId: {
    type: String,
  },
  content: {
    type: String,
    required: true
  },
},{
    timestamps:true
});

// const messageModel= mongoose.model('Message', messageSchema);

module.exports = messageSchema;
