// Create a user Account
const create_account = (userData) => {
  return fetch("http://localhost:3333/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // Convert the user Data to a JSON String
    body: JSON.stringify(userData),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        return response.json().then((errorData) => {
          // In case of a duplicate email
          if (errorData.error_message === "duplicated email") {
            throw new Error("duplicateEmail");
          } else {
            throw new Error("Something went wrong with the request.");
          }
        });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      return Promise.reject(error);
    });
};

// Login in to a user account

const login = (loginData) => {
  return fetch("http://localhost:3333/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // Convert the login data to a JSON String
    body: JSON.stringify(loginData),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Login failed");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      return Promise.reject(error);
    });
};

// Logout of a user accoutn
const logout = () => {
  return fetch("http://localhost:3333/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Authorization": localStorage.getItem("session_token"), // Get the session token
    },
  }).then((response) => {
    // Clear the session token
    localStorage.removeItem("session_token");
    if (!response.ok) {
      throw new Error("Logout failed");
    }
    // Return
    return; 
  });
};

export const userService = {
  create_account: create_account,
  login: login,
  logout: logout,
};
