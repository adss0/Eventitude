const db = require("../../database")
const crypto= require("crypto")

// Generate a hash
const getHash = function(password,salt){
    return crypto.pbkdf2Sync(password, salt, 100000, 256, 'sha256').toString('hex');
};

// Add in the user into the database
const addNewUser = (user,done) =>{
    const salt = crypto.randomBytes(64);
    const hash = getHash(user.password,salt)

const sql = `INSERT INTO users (first_name, last_name, email, password, salt) VALUES(?,?,?,?,?)`;

// Insert the values into the sql
let values = [user.first_name, user.last_name, user.email, hash, salt.toString(`hex`)];
// Run the SQL Query
db.run(sql, values, function(err){
    if (err){
        //If duplicate email found return
        if(err.errno === 19){
            return done("duplicateEmail")
        }
        return done(err);
    }    
    done(err, this.lastID)
});
};

// Authenticate a user
const authenticateUser = (email, password, done) => {
    const sql = `SELECT user_id, password, salt FROM users WHERE email=?`;
    // Run the SQL Query
    db.get(sql, [email], (err,row)=>{
        if (err) return done (err)

        // If no row found return 404(Unauthorized)
        if(!row) return done(404) 
        if(row.salt == null) row.salt = ''
        let salt = Buffer.from(row.salt, 'hex')
        if(row.password == getHash(password, salt)){
            return done (false, row.user_id);
        }else{
            // Return 404 in cases like wrong password
            return done (404);

        }
    });
}
 
// Set a session Token
const setToken= (id,done) =>{
    const token= crypto.randomBytes(16).toString('hex');
    const sql = 'UPDATE users SET session_token=? WHERE user_id=?'
    // Run the SQL Query
    db.run(sql, [token, id], (err)=>{
        return done(err, token)
    });
};

// Remove a session Token
const removeToken = (token,done) =>{
    const sql= 'UPDATE users SET session_token = null WHERE session_token=?'
    db.run(sql, [token], (err)=>{
        return done (err)
    })
}

// Get a sesssio Token
const getToken= (id, done)=>{
    const sql = 'SELECT session_token FROM users Where user_id=?'
    db.get(sql, [id], (err, row)=>{
        if(err) return done (err);
        return done (null, row ? row.session_token: null)
    })
}

// Get the user ID from the session token
const getIdFromToken= (token, done) =>{
    const sql = `SELECT user_id from users Where session_token=?`
    const params = [token]
    db.get(sql, params,(err, row)=>{
        if (err) return done(err)
        return done( null, row? row.user_id: null)
    })
}



module.exports = {
    getHash : getHash,
    addNewUser: addNewUser,
    authenticateUser: authenticateUser,
    setToken :setToken,
    getToken: getToken,
    removeToken:removeToken,
    getIdFromToken: getIdFromToken


}