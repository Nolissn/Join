import { registerUser } from "./data/usersDbApi.js";
import { createUser } from "./data/usersModel.js";

function signUp() {
    const privacyCheckbox = document.getElementById("acceptPrivacyPolicy");
    if (!privacyCheckbox.checked)
        {
            const signUpErrorDialog = document.getElementById("signUpErrorDialog");
            signUpErrorDialog.showModal();
            return;
        }

         const currentValues = getSignUpInputValues();
         const currentUser = createUser(currentValues.name, currentValues.email, currentValues.password);
         registerUser(currentUser);
    };

window.signUp = signUp;
