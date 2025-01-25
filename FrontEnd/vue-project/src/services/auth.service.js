// Returns the Session token from the local storage
const getSessionToken = () => {
    return localStorage.getItem("session_token");
  };
  
  export const authService = {
    getSessionToken:getSessionToken
  };