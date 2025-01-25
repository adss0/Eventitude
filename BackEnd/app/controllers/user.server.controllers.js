const Joi = require("joi");
const users = require("../models/user.server.models");

// Create a user Account 
const create_account = (req,res)=>{

    // Validate the user data
    const schema = Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(30).regex(/[A-Z]/).regex(/[a-z]/).regex(/[^\w]/).regex(/[0-9]/).required()
    })
    // If error send 400 (Bad Request) response
    const {error} = schema.validate(req.body);
    if(error)return res.status(400).send({error_message: error.details[0].message});
    
    // Assign the details to the user object
    let user = Object.assign({}, req.body);

    // Send the request to add the new user
    users.addNewUser(user,(err,id)=>{
        if(err){
            // If duplicate email send 400 (Bad Request) response
            if(err === "duplicateEmail"){
                return res.status(400).send({error_message: "duplicated email"})
            }
            // 500 error for all other erros
            else return res.sendStatus(500);
            }
            // Return 201 (Created) response upon success
        return res.status(201).send({user_id: id});
            
    });
}

// Login in to the user Id
const login = (req,res) =>{
    // Validate the entered login details
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(30).regex(/[A-Z]/).regex(/[a-z]/).regex(/[^\w]/).regex(/[0-9]/).required()

    })
    
    // If error send 400 (Bad Request) response
    const {error} = schema.validate(req.body);
    if(error)return res.status(400).send({error_message: error.details[0].message});
    
    // Authenticate if the user exists
    users.authenticateUser(req.body.email,req.body.password,(err,id)=>{
        // If invalid details return 400(Bad Request response)
        if(err===404) return res.status(400).send("Invalid email or password");
        // 500 response for all other errors
        if(err) return res.sendStatus(500);

        // Get the session token 
        users.getToken(id, (err,token)=>{
            if(err) return res.sendStatus(500);
            // If the token exists return 200 (OK) repsonse
            if(token){
                return res.status(200).send({user_id : id, session_token: token});
            }else{
                // IF the token doesnot exist set the token
                users.setToken(id, (err,token)=>{
                    if(err) return res.sendStatus(500);
                        return res.status(200).send({user_id: id, session_token: token});
                })
            }
        })
    })
}

// Logout out of the user Id
const logout = (req,res) =>{

    // Get the session token
    let token = req.get('X-Authorization');

    // Remove the session token
    users.removeToken(token, (err)=> {
    if(err) return res.sendStatus(500);
    // Send 200(OK) repsonse on success
     return res.sendStatus(200);
    })
}



module.exports = {
    create_account: create_account,
    login: login,
    logout: logout
}