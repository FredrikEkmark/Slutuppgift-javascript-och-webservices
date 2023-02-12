"use strict";

// Variables //

let user = JSON.parse(localStorage.getItem("user"));

let currentShop = [];

let cart = [];

if (JSON.parse(localStorage.getItem("shoppingcart")) != null) {
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
        .then(data => writeOrders(data));

}

function getUsers() {

    fetch("https://firestore.googleapis.com/v1/projects/fakestoreadmin/databases/(default)/documents/user")
        .then(res => res.json())
        .then(data => logIn(data));

}

function getUsersAdmin() {

    console.log("getUsersAdmin()");

    fetch("https://firestore.googleapis.com/v1/projects/fakestoreadmin/databases/(default)/documents/user")
        .then(res => res.json())
        .then(data => writeUsers(data));

}

function registerUser() {

    let validInput = true;

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

    if (validInput) {

        fetch("https://firestore.googleapis.com/v1/projects/fakestoreadmin/databases/(default)/documents/user")
            .then(res => res.json())
            .then(data => postUser(data, usertype, username, email, password));

    } else {
        document.getElementById("newuserbuttonmessage").innerHTML = "Require all inputs to be filled"
    }
}

function postUser(data, usertype, username, email, password) {

    data = data.documents;

    console.log(data);

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

    if (preExisting) {

    } else {

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
    }
}

function deleteUser(id) {

    console.log(id);

    id = id.replace("delete", "")

    fetch("https://firestore.googleapis.com/v1/projects/fakestoreadmin/databases/(default)/documents/user/" + id, {
        method: 'DELETE',
    })
        .then(res => res.json())
        .then(data => displayUsers());
}

function updateUser(id) {

    id = id.replace("update", "")

    fetch("https://firestore.googleapis.com/v1/projects/fakestoreadmin/databases/(default)/documents/user/" + id)
        .then(res => res.json())
        .then(data => patchUser(data, id));

}

function patchUser(data, id) {

    console.log(data);

    let username = document.getElementById("username" + id).value;

    console.log(username);
    if (username === "") {
        username = data.fields.username.stringValue;
    }

    let email = document.getElementById("email" + id).value;
    if (email === "") {
        email = data.fields.email.stringValue;
    }

    let address = document.getElementById("address" + id).value;
    if (address === "") {
        address = data.fields.address.stringValue;
    }

    let city = document.getElementById("city" + id).value;
    if (city === "") {
        city = data.fields.city.stringValue;
    }

    let password = document.getElementById("password" + id).value;
    if (password === "") {
        password = data.fields.password.stringValue;
    }

    let postalcode = document.getElementById("postalcode" + id).value;
    if (postalcode === "") {
        postalcode = data.fields.postalcode.integerValue;
    }

    let usertype = document.getElementById("usertype" + id).value;
    if (usertype === "") {
        usertype = data.fields.usertype.stringValue;
    }

    let body = JSON.stringify(
        {
            "fields": {
                "username": { "stringValue": username },
                "password": { "stringValue": password },
                "email": { "stringValue": email },
                "usertype": { "stringValue": usertype },
                "address": { "stringValue": address },
                "city": { "stringValue": city },
                "postalcode": { "integerValue": parseInt(postalcode) }
            }
        }
    )

    console.log(body);

    fetch("https://firestore.googleapis.com/v1/projects/fakestoreadmin/databases/(default)/documents/user/" + id, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: body
    })
        .then(res => res.json())
        .then(data => displayUsers());
}

function updateUserInfo() {

    let address = document.getElementById("useraddress").value;
    if (document.getElementById("useraddress").value == "") {
        address = user.address;
    }

    let postalcode = document.getElementById("userpostalcode").value;
    if (document.getElementById("userpostalcode").value == 0) {
        postalcode = user.postalcode;
    }

    let city = document.getElementById("usercity").value;
    if (document.getElementById("usercity").value == "") {
        city = user.address;
    }

    let body = JSON.stringify(
        {
            "fields": {
                "username": { "stringValue": user.username },
                "password": { "stringValue": user.password },
                "email": { "stringValue": user.email },
                "usertype": { "stringValue": user.usertype },
                "address": { "stringValue": address },
                "city": { "stringValue": city },
                "postalcode": { "integerValue": parseInt(postalcode) }
            }
        }
    )

    console.log(user.id);

    fetch("https://firestore.googleapis.com/v1/" + user.id, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: body
    })
        .then(res => res.json())
        .then(data => updateUserLocal(data));
}

function updateUserLocal(data) {

    console.log(data.fields.address.stringValue);

    user.address = data.fields.address.stringValue;
    user.postalcode = data.fields.postalcode.integerValue;
    user.city = data.fields.city.stringValue;

    localStorage.setItem("user",
                JSON.stringify({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    address: user.address,
                    postalcode: user.postalcode,
                    city: user.city,
                    usertype: user.usertype,
                    password: user.password,
                    loggedin: true
                }));

    
}

function postOrder(delivery, address, postalcode, city, sum) {

    let orderContent = [];

    for (let i = 0; i < cart.length; i++) {
        orderContent.push(
            {
                "mapValue": {
                    "fields": {
                        "category": { "stringValue": cart[i].item.category },
                        "description": { "stringValue": cart[i].item.description },
                        "id": { "integerValue": cart[i].item.id },
                        "image": { "stringValue": cart[i].item.image },
                        "title": { "stringValue": cart[i].item.title },
                        "quantity": { "integerValue": cart[i].quantity },
                        "price": { "doubleValue": parseFloat(cart[i].item.price) }
                    }
                }
            }
        )
    }


    let body = JSON.stringify(
        {
            "fields": {
                "userid": { "referenceValue": user.id },
                "username": { "stringValue": user.username },
                "email": { "stringValue": user.email },
                "address": { "stringValue": address },
                "postalcode": { "integerValue": parseInt(postalcode) },
                "city": { "stringValue": city },
                "delivery": { "stringValue": delivery },
                "ordercost": { "doubleValue": parseFloat(sum) },
                "ordercontent": {
                    "arrayValue": {
                        "values": orderContent
                    }
                }
            }
        }
    )

    fetch("https://firestore.googleapis.com/v1/projects/fakestoreadmin/databases/(default)/documents/order", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: body
    })
        .then(res => res.json())
        .then(data => orderSent(data))
}

function deleteOrder(id) {

    console.log(id);

    id = id.replace("delete", "")

    fetch("https://firestore.googleapis.com/v1/projects/fakestoreadmin/databases/(default)/documents/order/" + id, {
        method: 'DELETE',
    })
        .then(res => res.json())
        .then(data => displayOrders());
}

function updateOrder(id) {

    id = id.replace("update", "");

    fetch("https://firestore.googleapis.com/v1/projects/fakestoreadmin/databases/(default)/documents/order/" + id)
        .then(res => res.json())
        .then(data => writePatchOrderMain(data, id));

}

let orderDataTemp = {};

function writePatchOrderMain(data, id) {

    orderDataTemp = data.fields;

    document.getElementById("main").innerHTML = `

    <lable for="patchorderusername">Username:</lable><br>
    <input class="inputrow" type="text" name="patchorderusername" id="patchorderusername" placeholder="${orderDataTemp.username.stringValue}"><br>
    <lable for="patchorderuserid">User ID:</lable><br>
    <input class="inputrow" type="text" name="patchorderuserid" id="patchorderuserid" placeholder="${orderDataTemp.userid.referenceValue.replace("projects/fakestoreadmin/databases/(default)/documents/user/", "")}"><br>
    <lable for="patchorderemail">E-mail:</lable><br>
    <input class="inputrow" type="text" name="patchorderemail" id="patchorderemail" placeholder="${orderDataTemp.email.stringValue}"><br>
    <lable for="patchorderaddress">Address:</lable><br>
    <input class="inputrow" type="text" name="patchorderaddress" id="patchorderaddress" placeholder="${orderDataTemp.address.stringValue}"><br>
    <lable for="patchorderpostalcode">Postal Code:</lable><br>
    <input class="inputrow" type="text" name="patchorderpostalcode" id="patchorderpostalcode" placeholder="${orderDataTemp.postalcode.integerValue}"><br>
    <lable for="patchordercity">City:</lable><br>
    <input class="inputrow" type="text" name="patchordercity" id="patchordercity" placeholder="${orderDataTemp.city.stringValue}"><br>
    <lable for="patchorderdeliverytype">Delivery Type:</lable><br>
    <select name="patchorderdeliverytype" id="patchorderdeliverytype">
            <option value="">no change</option
            <option value="pick up at store">Pick up at store</option>
            <option value="ups">UPS</option>
            <option value="postnord">Post Nord</option>
    </select><br><br>
    <ol id="patchordercontentlist">
    </ol>
    <button id="patchorderbutton${id}" onclick="patchOrder( this.id)">Update</button>
    `;

    for (let i = 0; i < orderDataTemp.ordercontent.arrayValue.values.length; i++) {
        let item = data.fields.ordercontent.arrayValue.values[i].mapValue.fields;

        document.getElementById("patchordercontentlist").innerHTML += `

        <li>
        <lable for="patchorderitemid${i}">Item ID:</lable><br>
        <input class="inputrow" type="text" name="patchorderitemid${i}" id="patchorderitemid${i}" placeholder="${item.id.integerValue}"><br>
        <lable for="patchorderitemname${i}">Item Title:</lable><br>
        <input class="inputrow" type="text" name="patchorderitemname${i}" id="patchorderitemname${i}" placeholder="${item.title.stringValue}"><br>
        <lable for="patchorderitemprice${i}">Item Price:</lable><br>
        <input class="inputrow" type="text" name="patchorderitemprice${i}" id="patchorderitemprice${i}" placeholder="${item.price.doubleValue}"><br>
        <lable for="patchorderitemquantity${i}">Quantity:</lable><br>
        <select name="patchorderitemquantity${i}" id="patchorderitemquantity${i}">
        ${cartQuantitySelector(item.quantity.integerValue)} 
        </select><br
        <lable for="patchorderitemdelete${i}">Remove Item:</lable>
        <input type="checkbox" id="patchorderitemdelete${i}" name="patchorderitemdelete${i}">
        <br>
        </li>
        <br>
        
        `;
    }

}

function patchOrder(id) {

    id = id.replace("patchorderbutton", "/")

    console.log(id);

    let orderContent = orderDataTemp.ordercontent.arrayValue.values;

    console.log(orderContent);

    let username = document.getElementById("patchorderusername").value;
    if (username === "") {
        username = orderDataTemp.username.stringValue;
    }

    let userid = document.getElementById("patchorderuserid").value;
    if (userid === "") {
        userid = orderDataTemp.userid.referenceValue.replace("projects/fakestoreadmin/databases/(default)/documents/user/", "");
    }

    userid = "projects/fakestoreadmin/databases/(default)/documents/user/" + userid;

    console.log(userid)

    let email = document.getElementById("patchorderemail").value;
    if (email === "") {
        email = orderDataTemp.email.stringValue;
    }

    let address = document.getElementById("patchorderaddress").value;
    if (address === "") {
        address = orderDataTemp.address.stringValue;
    }

    let postalcode = document.getElementById("patchorderpostalcode").value;
    if (postalcode === "") {
        postalcode = orderDataTemp.postalcode.integerValue;
    }

    let city = document.getElementById("patchordercity").value;
    if (city === "") {
        city = orderDataTemp.city.stringValue;
    }

    let delivery = document.getElementById("patchorderdeliverytype").value;
    if (delivery === "") {
        delivery = orderDataTemp.delivery.stringValue;
    }

    let sum = 0.0;

    let orderContentNew = [];

    for (let i = 0; i < orderContent.length; i++) {

        console.log(i);

        let itemQuantity = parseInt(document.getElementById("patchorderitemquantity" + i).value);

        let itemId = document.getElementById("patchorderitemid" + i).value;
        if (itemId === "") {
            itemId = orderContent[i].mapValue.fields.id.integerValue;
        }

        let itemName = document.getElementById("patchorderitemname" + i).value;
        if (itemName === "") {
            itemName = orderContent[i].mapValue.fields.title.stringValue;
        }

        let itemPrice = document.getElementById("patchorderitemprice" + i).value;
        if (itemPrice === "") {
            itemPrice = orderContent[i].mapValue.fields.price.doubleValue;
        }

        

        orderContent[i] =
        {
            "mapValue": {
                "fields": {
                    "category": { "stringValue": orderContent[i].mapValue.fields.category.stringValue },
                    "description": { "stringValue": orderContent[i].mapValue.fields.description.stringValue },
                    "id": { "integerValue": itemId },
                    "image": { "stringValue": orderContent[i].mapValue.fields.image.stringValue },
                    "title": { "stringValue": itemName },
                    "quantity": { "integerValue": itemQuantity },
                    "price": { "doubleValue": itemPrice }
                }
            }
        }

        console.log(document.getElementById("patchorderitemdelete" + i).checked);

        if (document.getElementById("patchorderitemdelete" + i).checked !== true) {
            orderContentNew.push(orderContent[i]);
            sum += (itemPrice * itemQuantity);
        }
    }

    console.log(sum);

    let body = JSON.stringify(
        {
            "fields": {
                "userid": { "referenceValue": userid },
                "username": { "stringValue": username },
                "email": { "stringValue": email },
                "address": { "stringValue": address },
                "postalcode": { "integerValue": parseInt(postalcode) },
                "city": { "stringValue": city },
                "delivery": { "stringValue": delivery },
                "ordercost": { "doubleValue": parseFloat(sum) },
                "ordercontent": {
                    "arrayValue": {
                        "values": orderContentNew
                    }
                }
            }
        }
    )

    console.log(body);
    
fetch("https://firestore.googleapis.com/v1/projects/fakestoreadmin/databases/(default)/documents/order" + id, {
    method: 'PATCH',
    headers: {
        'Content-Type': 'application/json'
    },
    body: body
})
    .then(res => res.json())
    .then(data => orderSent(data))


    orderDataTemp = {};
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
                    <h3>${data[i].title}<br><p class="articlenr">Article Nr: ${data[i].id}</p></h3>
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
                        <h3>${cart[i].item.title}<br><p class="articlenr">Article Nr: ${cart[i].item.id}</p></h3><br>
                        
                        <strong>Price: ${cart[i].item.price} $  Quantity: </strong><select name="quantity" id="cartquantity${cart[i].item.id}" onchange="cartChangeQuantity(this.id)">${cartQuantitySelector(cart[i].quantity)}</select>
                        <br>
                    </div>
                </article>
        `;
        }
    }

    if (sum === 0) {

        document.getElementById("main").innerHTML += `
            <article class="cartarticle">
                <h2>Cart is empty, add some items if you want to shop</h2>
            </article>
        `;



    } else {

        document.getElementById("main").innerHTML += `
            <article class="cartarticle">
            <div class="carttextbox">
                <h2>Total Amount: ${sum} $</h2><br>
                <button type="button" onclick="orderMain(${sum})">Order</button>
                </div>
            </article>
        `;

    }
}

function orderMain(sum) {

    document.getElementById("main").innerHTML = `
    <article class="cartarticle">
    <div class="carttextbox">
        <form class="logginform" action="">
        <h2 class="h2loggin">Order information</h2><br>
        <lable id="addresslable" id="orderaddress" for="orderaddress">Address:</lable>
        <input type="text" name="orderaddress" id="orderaddress" placeholder="${user.address}"><br>
        <lable id="postalcodelable" id="orderpostalcode" for="orderpostalcode">Postal Code:</lable>
        <input type="number" name="orderpostalcode" id="orderpostalcode" min="10000" max="99999" placeholder="${user.postalcode}"><br>
        <lable id="citylable" for="ordercity">City:</lable>
        <input type="text" name="ordercity" id="ordercity" placeholder="${user.city}"><br>
        <lable for="orderdeliverytype">Delivery:</lable>
        <select name="orderdeliverytype" id="orderdeliverytype">
            <option value="pick up at store" selected="selected">Pick up at store</option>
            <option value="ups">UPS</option>
            <option value="postnord">Post Nord</option>
        </select><br>
        <button type="button" id="registernewuserbutton" onclick="sendOrder(${sum})">Send Order</button><br>
        <p id="orderbuttonmessage"></p>
        </form>
        </div>
        </article>
    `;
}

function sendOrder(sum) {

    let delivery = document.getElementById("orderdeliverytype").value;
    let address = "";
    let postalcode = 0;
    let city = "";

    let validInput = true;

    if (document.getElementById("orderaddress").value !== "") {
        address = document.getElementById("orderaddress").value;
    } else if (user.address !== "") {
        address = user.address;
    } else {
        document.getElementById("addresslable").innerHTML = `Address:<span style="color:red">*</span>`;
        validInput = false;
    }

    if (document.getElementById("ordercity").value !== "") {
        city = document.getElementById("ordercity").value;
    } else if (user.city !== "") {
        city = user.city;
    } else {
        document.getElementById("citylable").innerHTML = `City:<span style="color:red">*</span>`;
        validInput = false;
    }

    if (document.getElementById("orderpostalcode").value != 0) {
        postalcode = document.getElementById("orderpostalcode").value;
    } else if (user.postalcode != 0) {
        postalcode = user.postalcode;
    } else {
        document.getElementById("postalcodelable").innerHTML = `Postal Code:<span style="color:red">*</span>`;
        validInput = false;
    }

    if (validInput) {
        postOrder(delivery, address, postalcode, city, sum);
    } else {
        document.getElementById("orderbuttonmessage").innerHTML = `<span style="color:red">All fields need to be filled</span>`
    }
}

function orderSent(data) {

    document.getElementById("main").innerHTML = `

        <article class="cartarticle">
            <div class="carttextbox">
                <h2>Thank you for your order</h2><br>
            </div>
        </article>
    `;

    cart = [];
    localStorage.setItem("shoppingcart", JSON.stringify(cart));
    document.getElementById("cartcount").innerHTML = cartIconCount();
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

function cartQuantitySelector(quantity) {

    let select = "";

    for (let i = 0; i < (11 + quantity); i++) {

        if (quantity == (i)) {

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
                    password: data[i].fields.password.stringValue,
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

// Admin funtions //

function displayUsers() {

    getUsersAdmin();

}

function writeUsers(data) {

    document.getElementById("main").innerHTML = `
    <h2>Users</h2>
    <table id="usertable">
    <tr>
        <th>#</th>
        <th>ID</th>
        <th>Username</th>
        <th>Password</th>
        <th>E-mail</th>
        <th>Address</th>
        <th>Postal Code</th>
        <th>City</th>
        <th>Usertype</th>
        <th>Update</th>
        <th>Delete</th>
    </tr>
    </table>
  `;

    data = data.documents;

    for (let i = 0; i < data.length; i++) {

        let id = data[i].name.replace("projects/fakestoreadmin/databases/(default)/documents/user/", "");

        document.getElementById("usertable").innerHTML += `

        <tr id="row${id}" class="tableElement">
            <td>${i + 1}.</td>
            <td><input class="inputrow" type="text" name="name" id="id${id}" placeholder="${id}"></td>
            <td><input class="inputrow" type="text" name="age" id="username${id}" placeholder="${data[i].fields.username.stringValue}"></td>
            <td><input class="inputrow" type="text" name="age" id="password${id}" placeholder="${data[i].fields.password.stringValue}"></td>
            <td><input class="inputrow" type="text" name="level" id="email${id}" placeholder="${data[i].fields.email.stringValue}"></td>
            <td><input class="inputrow" type="text" name="age" id="address${id}" placeholder="${data[i].fields.address.stringValue}"></td>
            <td><input class="inputrow" type="text" name="age" id="postalcode${id}" placeholder="${data[i].fields.postalcode.integerValue}"></td>
            <td><input class="inputrow" type="text" name="age" id="city${id}" placeholder="${data[i].fields.city.stringValue}"></td>
            <td><input class="inputrow" type="text" name="age" id="usertype${id}" placeholder="${data[i].fields.usertype.stringValue}"></td>
            <td><button id="update${id}" onclick="updateUser(this.id)">Update</button></td>
            <td><button id="delete${id}" onclick="deleteUser(this.id)">Delete</button></td>
        </tr>

        `;
    }


}

function displayOrders() {


    document.getElementById("main").innerHTML = `
    <h2>Orders</h2>
    <ol class="orderlist" id="orderlist">
    </ol>
 
  `;

    getAllOrders();

}

function writeOrders(data) {

    console.log(data);

    data = data.documents;

    console.log(data);

    for (let i = 0; i < data.length; i++) {

        let id = data[i].name.replace("projects/fakestoreadmin/databases/(default)/documents/order/", "");

        document.getElementById("orderlist").innerHTML += `

        <li class="listelement">

            <div class="orderinfo">
            <h3 class="ordertext">Order ID: ${id}</h3>
            <button class="ordertext" id="update${id}" onclick="updateOrder(this.id)">Update</button>
            <button id="delete${id}" onclick="deleteOrder(this.id)">Delete</button>
            </div>
            <br>
            <div class="orderinfo">
                <p class="ordertext">Username:<br>${data[i].fields.username.stringValue}</p>
                <p class="ordertext">User ID:<br>${data[i].fields.userid.referenceValue.replace("projects/fakestoreadmin/databases/(default)/documents/user/", "")}</p>
                <p class="ordertext">E-mail:<br>${data[i].fields.email.stringValue}</p>
            </div><br><br>
            <div class="orderinfo">
                <p class="ordertext">Address:<br>${data[i].fields.address.stringValue}</p>
                <p class="ordertext">Postal Code:<br>${data[i].fields.postalcode.integerValue}</p>
                <p class="ordertext">City:<br>${data[i].fields.city.stringValue}</p>
            </div><br><br>
            <div class="orderinfo">
                <p class="ordertext">Order Cost:<br>${data[i].fields.ordercost.doubleValue} $</p>
                <p class="ordertext">Delivery Type:<br>${data[i].fields.delivery.stringValue}</p>
            </div><br>

            <ol class="ordercontent" id="ordercontent${id}">
            <h4>Order Content:</h4>
            <br>
            </ol>
        </li>
        
        `;

        for (let j = 0; j < data[i].fields.ordercontent.arrayValue.values.length; j++) {

            let item = data[i].fields.ordercontent.arrayValue.values[j].mapValue.fields;

            document.getElementById(`ordercontent${id}`).innerHTML += `
            <li>
            <h4>${item.title.stringValue}</h4>
            <div class="orderuserinfo">
                <p>Item ID: ${item.id.integerValue}
                <p>Price: ${item.price.doubleValue} $</p>
                <p>Quantity: ${item.quantity.integerValue}</p>
            </div>
            </li><br>
            
            `;

        }

    }

}

function userInfo() {

    document.getElementById("main").innerHTML = `
    
    <article class="cartarticle">
    <div class="carttextbox">
        <form class="logginform" action="">
        <h2 class="h2loggin">User information</h2><br>
        <p>Username:<br><p>${user.username}</p></p><br>
        <p>E-mail:<br><p>${user.email}</p></p><br>
        <lable id="addresslable" id="orderaddress" for="useraddress">Address:</lable>
        <input type="text" name="useraddress" id="useraddress" placeholder="${user.address}"><br>
        <lable id="postalcodelable" id="orderpostalcode" for="userpostalcode">Postal Code:</lable>
        <input type="number" name="userpostalcode" id="userpostalcode" min="10000" max="99999" placeholder="${user.postalcode}"><br>
        <lable id="citylable" for="usercity">City:</lable>
        <input type="text" name="usercity" id="usercity" placeholder="${user.city}"><br>
        <button type="button" id="registernewuserbutton" onclick="updateUserInfo()">Update User</button><br>
        <p id="orderbuttonmessage"></p>
        </form>
        </div>
        </article>
        `;


}

// Start Function // 

function start() {

    if (user != null) {
        if (user.usertype === "user") {

            document.getElementById("body").innerHTML = `
                <header>
                    <nav class="mainmenu">
                        <div class="mainmenuleft">
                            <button class="menubutton" type="button" id="home" onclick="getStore('')">Home</button>
                            <button class="menubutton" type="button" id="electronics" onclick="getStore(this.id)">Electronics</button>
                            <button class="menubutton" type="button" id="jewelery" onclick="getStore(this.id)">Jewelery</button>
                            <button class="menubutton" type="button" id="men's clothing" onclick="getStore(this.id)">Men's Clothing</button>
                            <button class="menubutton" type="button" id="women's clothing" onclick="getStore(this.id)">Women's Clothing</button>
                        </div>
                        <div class="mainmenuright">
                            <button class="menucartbutton" type="button" id="basket" onclick="diplayCartMain()"><p id="cartcount">${cartIconCount()}</p><img class="cartimg" src="m/cart.svg" alt=""></button>
                            <button class="menubutton" type="button" id="user" onclick="userInfo()">${user.username}</button>
                            <button class="menubutton" type="button"  onclick="logOut()">Logout</button>
                        </div>
                    </nav>
                </header>
                <main id="main">
                </main>
            `;

            getStore("");

        } else if (user.usertype === "admin") {

            document.getElementById("body").innerHTML = `
                <header>
                    <nav class="mainmenu">
                        <div class="mainmenuleft">
                            <button class="menubutton" type="button" id="adminusers" onclick="displayUsers()">Users</button>
                            <button class="menubutton" type="button" id="adminorders" onclick="displayOrders()">Orders</button>
                            <button class="menubutton" type="button"  onclick="logOut()">Logout</button>
                        </div>
                        
                    </nav>
                </header>
                <main id="main">
                </main>
            `;

            displayOrders();

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



// Start sequence //

start();
