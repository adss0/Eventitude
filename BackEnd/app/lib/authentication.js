const users = require("../models/user.server.models");

const isAuthenticated = function(req, res, next){
    //First check if the user is authenticated - the endpoint acts differently
    let token = req.get('X-Authorization');

    users.getIdFromToken(token, (err, id)=>{
        if (err|| id === null){
            // console.log("user not authenticated");
            console.log(err);
            return res.sendStatus(401);
        }
    req.user_id = id;
    next();
    })
}

module.exports={
    isAuthenticated: isAuthenticated

}