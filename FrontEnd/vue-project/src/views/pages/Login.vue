<template>
  <div>
    <h1>Login</h1>
          <!-- Login form -->

    <form @submit.prevent="handleSubmit" class="formBox">
      <div>
        <label for="email" class="formLabel">Email:</label>
        <input id="email" name="email" v-model="email" class="formInput" />
      </div>

      <div>
        <label for="password" class="formLabel">Password:</label>
        <div class="passwordFieldWrapper">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            class="formInput"
          />

          <button type="button" @click="toggleShow" class="passwordToggleBtn">
            <span :key="showPassword">
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </span>
          </button>
        </div>
      </div>
<!-- Save button -->
      <button class="SaveButton">Login</button>
      <!-- Error Message -->

      <div class="SaveErrorMessage" v-if="error">{{ error }}</div>
            <!-- Signup Message -->

      <div class="signupMessage">
        Don't have an account?
        <router-link v-if="!isLoggedIn" to="/signup">Signup</router-link>
      </div>
    </form>
  </div>
</template>

<script>
import emailValidator from "email-validator";
import { userService } from "@/services/user.service";

export default {
  data() {
    return {
      email: "",
      password: "",
      submitted: false,
      error: "",
      isLoggedIn: false,
      showPassword: false,
    };
  },
  methods: {
    async handleSubmit() {
      this.submitted = true;
      const { email, password } = this;
      // Validation checks
      if (!email) {
        this.error = "Email is required";
        return;
      }
      if (!password) {
        this.error = "Password is required";
        return;
      }

      if (!emailValidator.validate(email)) {
        this.error = "Email must be a valid email";
        return;
      }

      const passwordPattern =
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^\w]).{8,30}$/;
      if (!passwordPattern.test(password)) {
        this.error = "Please enter correct details";
        return;
      }

      try {
        const response = await userService.login({ email, password });
        // Store the session token
        localStorage.setItem("session_token", response.session_token); 
        console.log(response.session_token);
        this.error = ""; 
        this.$router.push({
          path: "/Success",
          query: { isLoggedIn: true }, 
        });
      } catch (err) {
        console.error(err);
        this.error = err.message || "Login failed. Please try again.";
      }
    },
    toggleShow() {
      this.showPassword = !this.showPassword;
    },
  },
};
</script>

<style scoped>

.formBox {
  background-color: #121212; 
  border: 1px solid #333; 
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5); 
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem auto;
  max-width: 600px;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.formBox:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.7);
  transform: translateY(-5px);
}

/* Styling for form */
.formLabel {
  display: block;
  color: #ffffff;
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.formInput {
  width: 94%;
  padding: 1rem;
  font-size: 1rem;
  border: 1px solid #555; 
  background-color: #1e1e1e; 
  color: #ffffff; 
  border-radius: 4px;
  margin-bottom: 1rem;
  transition: border-color 0.3s;
}

.formInput:focus {
  border-color: #007bff;
  outline: none;
}

/* Styling for password fields */
.passwordFieldWrapper {
  position: relative;
  align-items: center;
  display: flex;

}

.passwordToggleBtn {
  color: #ffffff; 
  background: none;
  border: none;
  cursor: pointer;
  position: absolute;
  right: 10px;
  top: 40%;
  transform: translateY(-50%);
  font-size: 1.2rem;
}

/* Styling for the login button */
.SaveButton {
  color: #ffffff; 
  background-color: #007bff; 
  padding: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
}

.SaveButton:hover {
  background-color: #0056b3; 
}

/* Error message styling */
.SaveErrorMessage {
  color: #e63946; 
  padding-top: 0.4rem;
  font-size: 0.9rem;
  text-align: center;
}

/* Styling for Signup message  */
.signupMessage {
  color: #ffffff; 
  font-size: 1rem;
  padding-top: 0.4rem;
  text-align: center;
}

/*Responsive design for smaller screens */
@media (max-width: 1024px) {
  .formBox {
    width: 95%;
    padding: 1rem;
  }

  .formLabel {
    font-size: 1rem;
  }

  .formInput {
    padding: 0.8rem;
    font-size: 1rem;
  }

  .SaveButton {
    font-size: 1.1rem;
    padding: 0.8rem;
  }

  .passwordToggleBtn {
    font-size: 1rem;
  }
}

</style>