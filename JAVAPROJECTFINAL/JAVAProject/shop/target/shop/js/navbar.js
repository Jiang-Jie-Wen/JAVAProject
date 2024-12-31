function loadNavbar(){
  fetch('./navbar.html')
  .then(response => response.text())
  .then(data => {
      document.getElementById('navbar').innerHTML = data;      
      var pageinfo = document.body.getAttribute('data-page');
      if(document.getElementById('link-'+pageinfo) != null){
          document.getElementById('link-'+pageinfo).classList.add('active');
      }    
      setCartItemCount();
  })
  .catch(error => console.error('Error, 無法載入 navbar:', error));
}


function clickuser(){
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
          window.location.href = "../member/edituser.html";
        }
      })
      .catch((error) => {
        console.error("Error sending request:", error);
      });
    window.location.assign("./login.html");
}

function setCartItemCount(){
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const num = Object.keys(cart).length;
    if(num < 10){
        document.getElementById("count").innerHTML = "0" + num;
    }else{
        document.getElementById("count").innerHTML = num;
    }
}