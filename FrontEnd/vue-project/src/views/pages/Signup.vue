<template>
  <div>
    <h1>Signup</h1>
    <form @submit.prevent="handleSubmit" class="formBox">
      <div class="inline-group">
        <!-- First Name and Last Name Field -->
        <div>
          <label for="first_name" class="formLabelName">First Name:</label>
          <input id="first_name" name="first_name" v-model="first_name" class="formInputName" required />
        </div>

        <div>
          <label for="last_name" class="formLabelName">Last Name:</label>
          <input id="last_name" name="last_name" v-model="last_name" class="formInputName" required />
        </div>
      </div>

      <!-- Email Field -->
      <div>
        <label for="email" class="formLabel">Email:</label>
        <input id="email" name="email" v-model="email" class="formInput" required />
      </div>

      <!-- Confirm Email Field -->
      <div>
        <label for="confirm_email" class="formLabel">Confirm Email:</label>
        <input id="confirm_email" name="confirm_email" v-model="confirm_email" class="formInput" required />
      </div>

      <!-- Password Field -->
      <div>
        <label for="password" class="formLabel">Password:</label>
        <div class="passwordFieldWrapper">
          <input :type="showPassword ? 'text' : 'password'" v-model="password" class="formInput" required />
          <button type="button" @click="toggleShow" class="passwordToggleBtn">
            <span :key="showPassword">
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </span>
          </button>
        </div>
      </div>
      <ul class="passwordRequirementList">
            <li>At Least One Uppercase and Lowercase Letter </li>
            <li>At Least One Digit</li>
            <li>At Least One Special Character </li>
            <li>Length Between 8 and 30 Characters </li>
          </ul>

      <!-- Confirm Password Field -->
      <div>
        <label for="confirm_password" class="formLabel">Confirm Password:</label>
        <div class="passwordFieldWrapper">
          <input :type="showConfirmPassword ? 'text' : 'password'" v-model="confirm_password" class="formInput"
            required />
          <button type="button" @click="toggleConfirmShow" class="passwordToggleBtn">
            <span :key="showConfirmPassword">
              <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </span>
          </button>
        </div>
      </div>

      <!-- Submit Button -->
      <button type="submit" class="SaveButton">Signup</button>
      <!-- Submit Button -->
      <div v-if="error" class="errorMessage">{{ error }}</div>
    </form>
  </div>
</template>

<script>
import emailValidator from 'email-validator';
import { userService } from "../../services/user.service";

export default {
  data() {
    return {
      first_name: "",
      last_name: "",
      email: "",
      confirm_email: "",
      password: "",
      confirm_password: "",
      submitted: false,
      error: "",
      showPassword: false,
      showConfirmPassword: false,
    };
  },

  methods: {
    // Toggle password visibilty
    toggleShow() {
      this.showPassword = !this.showPassword;
    },
    toggleConfirmShow() {
      this.showConfirmPassword = !this.showConfirmPassword;
    },

    handleSubmit() {
      this.submitted = true;
      // Validation checks for the signup form 
      const { email, confirm_email, password, confirm_password, first_name, last_name } = this;

      const namePattern = /^[A-Za-z]+$/;

      if (!namePattern.test(first_name) || !namePattern.test(last_name)) {
        this.error = "Please enter a valid name";
        return;
      }
      if (!(email && confirm_email && password && confirm_password)) {
        this.error = "Please fill in all the fields";
        return;
      }
      if (!emailValidator.validate(email)) {
        this.error = "Invalid email!";
        return;
      }
      if (email !== confirm_email) {
        this.error = "Emails do not match!";
        return;
      }
      const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^\w]).{8,30}$/;
      if (!passwordPattern.test(password)) {
        this.error = "Password not strong enough.";
        return;
      }
      if (password !== confirm_password) {
        this.error = "Passwords do not match!";
        return;
      }

      userService.create_account({
        first_name,
        last_name,
        email,
        password,
      })
        .then((response) => {
          console.log("Account created:", response);
          alert("Signup Form submitted successfully!");
          this.$router.push({
            path: "/Success",
            query: { isSignup: true },
          });
        })
        .catch((error) => {
          console.log("Error:", error);
          this.error = error.message === "duplicateEmail" ? "This email is already in use!" : "Account creation failed";
        });
    },
  },
};
</script>

<style scoped>
/*Style for form box */
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

.formLabel,
.formLabelName {
  display: block;
  font-size: 1rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

/**Style for form inline group */
.formInput,
.formInputName {
  width: 94%;
  border: 1px solid #555;
  padding: 1rem;
  font-size: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  background-color: #1e1e1e;
  color: #ffffff;
}

.inline-group {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.formInputName {
  width: 84%;
}
/*Style for Password toggle button */
.passwordToggleBtn {
  color: #ffffff;
  background: none;
  border: none;
  position: absolute;
  right: 10px;
  font-size: 1.2rem;
  cursor: pointer;
}

/*Style for password field*/
.passwordFieldWrapper {
  display: flex;
  position: relative;
  align-items: center;
}

/*Style for save button */

.SaveButton {
  padding: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
}

.SaveButton:hover {
  background-color: #0056b3;
}
.passwordRequirementList {
  margin: 1rem 0;
  font-size: 0.7rem;
  padding-left: 1.5rem;
  line-height: 1.5;
}

.errorMessage {
  color: #e63946;
  margin-top: 0.4rem;
  font-size: 0.9rem;
  text-align: center;
}

/*Responsive desgin for smaller screens */
@media (max-width: 1024px) {
  .formBox {
    width: 95%;
    padding: 1rem;
  }

  .formLabel,
  .formLabelName {
    font-size: 1rem;
  }

  .formInput,
  .formInputName {
    font-size: 1rem;
    padding: 0.8rem;
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
