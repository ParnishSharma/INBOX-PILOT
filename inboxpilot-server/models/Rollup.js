const mongoose=require('mongoose');

const RollupSchema=new mongoose.Schema({
  gmailMessageId: String,
  subject: String,
  from: String,
  userEmail: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  htmlBody: {
  type: String,
}
})
module.exports=mongoose.model('Rollup', RollupSchema)