"use strict";

// Variables //



let user = JSON.parse(localStorage.getItem("user"));

let currentShop = [];

let cart = [];

if (JSON.parse(localStorage.getItem("shoppingcart")) != null) {
    console.log(JSON.parse(localStorage.getItem("shoppingcart")))
    cart = JSON.parse(localStorage.getItem("shoppingcart"));
}

// Functions //

// FakeStore API REST Function //

function getStore(category) {

    if (category !== "") {
        category = "/category/" + category;
    }

    fetch("https://fakestoreapi.com/products" + category)
        .then(res => res.json())
        .then(data => uppdateMainStore(data));

}

// FireBase API REST Functions //

function getOrder(id) {

    fetch("https://firestore.googleapis.com/v1/projects/fakestoreadmin/databases/(default)/documents/order/" + id)
        .then(res => res.json())
        .then(data => console.log(data));


}

function getAllOrders() {

    fetch("https://firestore.googleapis.com/v1/projects/fakestoreadmin/databases/(default)/documents/order")
        .then(res => res.json())
        .then(data => console.log(data));


}

function getUsers() {

    console.log("getUsers running")

    fetch("https://firestore.googleapis.com/v1/projects/fakestoreadmin/databases/(default)/documents/user")
        .then(res => res.json())
        .then(data => logIn(data));

}

function registerUser() {

    fetch("https://firestore.googleapis.com/v1/projects/fakestoreadmin/databases/(default)/documents/user")
        .then(res => res.json())
        .then(data => postUser(data));
}

function postUser(data) {

    data = data.documents;

    console.log(data);

    let validInput = true;
    let preExisting = false;

    for (let i = 0; i < data.length; i++) {

        if (data[i].fields.username.stringValue === document.getElementById("newusername").value) {

            document.getElementById("newuserbuttonmessage").innerHTML = "Username already in use";
            preExisting = true;
        }

        if (data[i].fields.email.stringValue === document.getElementById("registeremail").value) {

            document.getElementById("newuserbuttonmessage").innerHTML = "E-mail already in use";
            preExisting = true;
        }
    }

    let usertype = document.getElementById("selectusertype").value;
    let username = "";
    let email = "";
    let password = "";

    if (document.getElementById("newusername").value != "") {
        console.log("true");
        username = document.getElementById("newusername").value;
    } else {
        validInput = false;
        document.getElementById("newusernamelable").innerHTML = `Username:<span style="color:red">*</span>`;
    }

    if (document.getElementById("newpassword").value != "" && document.getElementById("newpassword").value === document.getElementById("confirmpassword").value) {
        console.log("true");
        password = document.getElementById("newpassword").value;
    } else {
        validInput = false;
        document.getElementById("newpasswordlable").innerHTML = `Password:<span style="color:red">*</span>`;
        document.getElementById("confirmpasswordlable").innerHTML = `Confirm Password:<span style="color:red">*</span>`;
    }

    if (document.getElementById("registeremail").value != "") {
        email = document.getElementById("registeremail").value;
    } else {
        validInput = false;
        document.getElementById("registeremaillable").innerHTML = `E-mail:<span style="color:red">*</span>`;
    }

    if (preExisting) {

    } else if (validInput) {

        let body = JSON.stringify(
            {
                "fields": {
                    "username": { "stringValue": username },
                    "password": { "stringValue": password },
                    "email": { "stringValue": email },
                    "usertype": { "stringValue": usertype },
                    "address": { "stringValue": "" },
                    "city": { "stringValue": "" },
                    "postalcode": { "integerValue": 0 }
                }
            }
        )

        fetch("https://firestore.googleapis.com/v1/projects/fakestoreadmin/databases/(default)/documents/user", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: body
        })
            .then(res => res.json())
            .then(data => start());


    } else {
        document.getElementById("newuserbuttonmessage").innerHTML = "Require all inputs to be filled"
    }
}


function postOrder() {

}

// Uppdate Main functions //

function uppdateMainStore(data) {

    document.getElementById("main").innerHTML = "";

    currentShop = data;


    for (let i = 0; i < data.length; i++) {

        document.getElementById("main").innerHTML += `
        <article class="itemarticle" id="article${data[i].id}">
            <div class="articletop">
                <div class="articleleft">
                    <h3>${data[i].title}</h3>
                    <div class="articleleftcenter">
                        <div class="rating">${stars(data[i].rating.rate)}</div>
                        <b>${data[i].rating.rate} out of 5 from  ${data[i].rating.count} ratings</b><br><br>
                        <b>Price: ${data[i].price} $</b><br><br>
                        <label for="quantity"><b>Quantity: </b></label>
                        <select name="quantity" id="quantity${data[i].id}">
                            <option value="1" selected="selected">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                            <option value="10">10</option>
                        </select><br><br>
                        <button type="button" id="addtocart${data[i].id}" onclick="addToCart(this.id)">Add To Basket</button>
                    </div>
                    <p>${data[i].description}</p>
                </div>
                <div class="articleright">
                    <img class="itempicture" src="${data[i].image}" alt="Picture of the product">
                </div>
            </div>
        </article>`;
    }
}

function diplayCartMain() {

    document.getElementById("main").innerHTML = "";

    let sum = 0;

    for (let i = 0; i < cart.length; i++) {

        if (cart[i] != null) {

            sum += (cart[i].item.price * cart[i].quantity);


            document.getElementById("main").innerHTML += `
                <article class="cartarticle">
                    <div class="cartpicturebox">
                        <img src="${cart[i].item.image}" class="cartpicture" alt="Picture of Item">
                    </div>
                    <div class="carttextbox">
                        <h3>${cart[i].item.title}</h3><br>
                        <strong>Price: ${cart[i].item.price} $  Quantity: </strong>${cartQuantitySelector(cart[i].item.id, cart[i].quantity)}
                        <br>
                    </div>
                </article>
        `;
        }
    }

    if (sum === 0) {

    } else {

        document.getElementById("main").innerHTML += sum;

    }
}

function stars(rating) {

    let stars = "";

    for (let i = 1; i < 6; i++) {

        if (rating >= (i - 0.2)) {
            stars += `<img class="star" src="m/star-filled.svg" alt="">`
        } else if (rating > (i - 0.7)) {
            stars += `<img class="star" src="m/star-half-lined.svg" alt="">`
        } else {
            stars += `<img class="star" src="m/star-lined.svg" alt="">`
        }
    }

    return stars;
}

// Cart Functions //

function addToCart(id) {

    id = id.replace("addtocart", "");

    id = parseInt(id);

    let currentIdArray = []

    for (let i = 0; i < currentShop.length; i++) {
        currentIdArray[i] = currentShop[i].id;
    }

    let quantity = document.getElementById("quantity" + id).value;

    let cartIds = [];

    for (let i = 0; i < cart.length; i++) {

        cartIds[i] = cart[i].item.id;
    }

    if (cartIds.indexOf(id) === -1) {

        cart.push({ quantity: parseInt(quantity), item: currentShop[currentIdArray.indexOf(id)] });

    } else {

        cart[cartIds.indexOf(id)].quantity += parseInt(quantity);
    }

    localStorage.setItem("shoppingcart", JSON.stringify(cart));
    document.getElementById("cartcount").innerHTML = cartIconCount();
}

function cartQuantitySelector(id, quantity) {

    let select = `<select name="quantity" id="cartquantity${id}" onchange="cartChangeQuantity(this.id)">`;

    for (let i = 0; i < (11 + quantity); i++) {

        if (quantity === (i)) {

            select += `<option value="${(i)}" selected="selected">${(i)}</option>`

        } else {

            select += `<option value="${(i)}">${(i)}</option>`
        }
    }

    return select += `</select>`;
}

function cartChangeQuantity(id) {

    id = parseInt(id.replace("cartquantity", ""));

    let quantity = document.getElementById("cartquantity" + id).value;

    let cartIds = [];

    for (let i = 0; i < cart.length; i++) {
        cartIds[i] = cart[i].item.id;
    }

    console.log(quantity)

    if (quantity == 0) {

        let x = cart.splice(cartIds.indexOf(id), 1);

    } else {

        cart[cartIds.indexOf(id)].quantity = parseInt(quantity);
    }

    localStorage.setItem("shoppingcart", JSON.stringify(cart));
    document.getElementById("cartcount").innerHTML = cartIconCount();

    diplayCartMain();
}

function cartIconCount() {

    if (cart.length === 0) {
        return 0;
    } 

    let sum = 0;

    for (let i = 0; i < cart.length; i++) {

        sum += cart[i].quantity;
    }

    return sum;
}



// Menu functions

function start() {

    if (user != null) {
        if (user.usertype === "user") {

            document.getElementById("body").innerHTML = `
                <header>
                    <nav class="mainmenu">
                        <div class="mainmenusides">
                            <button class="menubutton" type="button" id="home" onclick="getStore('')">Home</button>
                            <button class="menubutton" type="button" id="electronics" onclick="getStore(this.id)">Electronics</button>
                            <button class="menubutton" type="button" id="jewelery" onclick="getStore(this.id)">Jewelery</button>
                            <button class="menubutton" type="button" id="men's clothing" onclick="getStore(this.id)">Men's Clothing</button>
                            <button class="menubutton" type="button" id="women's clothing" onclick="getStore(this.id)">Women's Clothing</button>
                        </div>
                        <div class="mainmenusides">
                            <button class="menucartbutton" type="button" id="basket" onclick="diplayCartMain()"><p id="cartcount">${cartIconCount()}</p><img class="cartimg" src="m/cart.svg" alt=""></button>
                            <button class="menubutton" type="button" id="user" onclick="logOut()">${user.username}</button>
                            <button class="menubutton" type="button"  onclick="logOut()">Logout</button>
                        </div>
                    </nav>
                </header>
                <main id="main">
                </main>
            `;

            getStore("");

        } else if (user.usertype === "admin") {


        } else {

            logOut();

        }



    } else {

        document.getElementById("body").innerHTML = `
            
            <main class="logginmain">
                <div class="logginbox" id="logginbox">
                    <form class="logginform" action="">
                        <h2 class="h2loggin">Log in</h2><br>
                        <lable for="loginusername">Username:</lable>
                        <input type="text" name="loginusername" id="loginusername"><br>
                        <lable for="loginpassword">Password:</lable>
                        <input type="password" name="loginpassword" id="loginpassword"><br>
                        <button type="button" id="loginbutton" onclick="getUsers()">Login</button><br>
                        <p id="notvaliduser"></p>
                    </form>
                    <div id="newuserform">
                        <button type="button" id="newuserformbutton" onclick="displayRegisterNewUser()">Register New User</button><br>   
                    </div>
                </div>
            </main>

        `;
    }
}

function displayRegisterNewUser() {

    document.getElementById("newuserform").innerHTML = ` 
   
        <form class="logginform" action="">
            <h2 class="h2loggin">Register New User</h2><br>
            <lable id="newusernamelable" for="newusername">Username:</lable>
            <input type="text" name="newusername" id="newusername"><br>
            <lable id="registeremaillable" for="registeremail">E-mail:</lable>
            <input type="email" name="registeremail" id="registeremail"><br>
            <lable id="newpasswordlable" for="newpassword">Password:</lable>
            <input type="password" name="newpassword" id="newpassword"><br>
            <lable id="confirmpasswordlable" for="confirmpassword">Confirm Password:</lable>
            <input type="password" name="confirmpassword" id="confirmpassword"><br>
            <lable for="selectusertype">Usertype:</lable>
            <select name="selectusertype" id="selectusertype">
                <option value="user" selected="selected">User</option>
                <option value="admin">Admin</option>
            </select><br>
            <button type="button" id="registernewuserbutton" onclick="registerUser()">Register</button><br>
            <p id="newuserbuttonmessage"></p>
        </form>
    `;

}

function logIn(data) {

    data = data.documents;

    for (let i = 0; i < data.length; i++) {
        if ((data[i].fields.username.stringValue === document.getElementById("loginusername").value)
            && (data[i].fields.password.stringValue === document.getElementById("loginpassword").value)) {

            console.log("found user")

            localStorage.setItem("user",
                JSON.stringify({
                    id: data[i].name,
                    username: data[i].fields.username.stringValue,
                    email: data[i].fields.email.stringValue,
                    address: data[i].fields.address.stringValue,
                    postalcode: data[i].fields.postalcode.integerValue,
                    city: data[i].fields.city.stringValue,
                    usertype: data[i].fields.usertype.stringValue,
                    loggedin: true
                }));
        }
    }

    user = JSON.parse(localStorage.getItem("user"));

    console.log(user);

    if (user == null) {

        console.log("no user");

        document.getElementById("notvaliduser").innerHTML = "Not a valid Username or Password";

    } else {
        start();
    }
}

function logOut() {

    localStorage.clear();
    user = null;
    cart = [];
    start();

}

// Start sequence //

start();








