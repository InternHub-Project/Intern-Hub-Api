







const test=async(req,res,next)=>{
    try {
        res.json({message:"done",user:req.user})
    } catch (error) {
    sendResponse(res, constans.RESPONSE_INT_SERVER_ERROR, constans.UNHANDLED_ERROR, {}, [error.message]);
        
    }
}


module.exports={
    test
}