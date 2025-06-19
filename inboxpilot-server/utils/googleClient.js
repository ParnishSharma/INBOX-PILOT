const {google}=require('googleapis')

function getAuthenticatedClient(req){

    const access_token=req.cookies.access_token
    const refresh_token=req.cookies.refresh_token
      if (!access_token && !refresh_token) return null;

    const oauth2Client=new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    )

    if(access_token && refresh_token){
        oauth2Client.setCredentials({
            access_token:access_token,
            refresh_token:refresh_token
        });
        return oauth2Client

    }

    oauth2Client.on('tokens',(tokens)=>{
        if(tokens.access_token){
            req.res.cookie('access_token',tokens.access_token,{
                httpOnly:true,
                secure:false,
                maxAge:360000
            })
        }
    })

return oauth2Client;
} 

module.exports = getAuthenticatedClient;