const loginbtn = document.getElementById("login_btn");

const login_error = document.getElementById("login-error-message");

const input_account = document.getElementById("account-input");
const input_password = document.getElementById("password-input");

let check = true;

function AddIncorrectClass(res, errortext,text) {
  if (res.value === "") {
    res.parentElement.classList.add("incorrect");
    errortext.innerHTML = text;
    check = false;
  }
}



loginbtn.addEventListener("click", (e) => {
  check = true;
  AddIncorrectClass(input_account, login_error,"資料未填寫完成");
  AddIncorrectClass(input_password, login_error,"資料未填寫完成");
  if (check) {
    const data = {
      account : input_account.value,
      password : input_password.value
    };
    fetch("Login", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then((response) => {
      if (response.ok) {
        return response.text();
      } else {
        throw new Error("Error:response is not OK");
      }
    })
    .then((data) => {
      if (data === "correct") {
        window.location.href = "addadmin.html";
      }else if(data === "PwdError"){
        input_password.value = "";
        AddIncorrectClass(input_password, login_error,"密碼錯誤");
      }else{
        input_account.value = "";
        input_password.value = "";
        AddIncorrectClass(input_account, login_error,"無此管理者");
        AddIncorrectClass(input_password, login_error,"無此管理者");
      }
    })
    .catch((error) => {
      console.error("Error sending request:", error);
    });
  }
});

const allInputs = [input_account, input_password].filter(
  (input) => input != null
);

allInputs.forEach((input) => {
  input.addEventListener("input", () => {
    if (input.parentElement.classList.contains("incorrect")) {
      input.parentElement.classList.remove("incorrect");
      login_error.innerText = "";
      register_error.innerText = "";
    }
  });
});

window.onload = function () {
  fetch("CheckLogin")
    .then((response) => {
      if (response.ok) {
        return response.text();
      } else {
        throw new Error("Error:response is not OK");
      }
    })
    .then((data) => {
      if (data !== "noLogin") {
        window.location.href = "addadmin.html";
      }
    })
    .catch((error) => {
      console.error("Error sending request:", error);
    });

    input_account.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        input_password.focus();
      }
    });
    
    input_password.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        loginbtn.click();
      }
    });
};
