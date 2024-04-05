
const setTokenWithCookies = (res, token)=>{
    const options = {
        domain: 'localhost',
        // sameSite: 'none',
        httpOnly: true,
        secure: false
    }
    return res.cookie("token", token, options);
}

module.exports = setTokenWithCookies