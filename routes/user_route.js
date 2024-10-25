var express = require("express");
var exe = require("./../connection");
var url = require("url");
const { KeyObject } = require("crypto");
var router = express.Router();

function checklogin(req, res, next) {
  if (req.session.user_id != undefined) next();
  else
    res.send(
      "<script>alert('Invalid Login');location.href = '/login';</script>"
    );
}

router.get("/", async function (req, res) {
  var banner_info = await exe("SELECT * FROM banner");
  var products = await exe("SELECT * FROM product LIMIT 3");
  var why_choose = await exe("SELECT * FROM why_choose_us");
  var points = await exe("SELECT * FROM why_choose_us_points LIMIT 4");
  var modern_design = await exe("SELECT * FROM modern_design");
  var testimonial = await exe("SELECT * FROM customer_review");
  var blogs = await exe("SELECT * FROM blog LIMIT 3");

  var obj = {
    banner_info: banner_info[0],
    products: products,
    why: why_choose[0],
    points: points,
    modern: modern_design[0],
    customer_review: testimonial,
    blogs: blogs,

    is_login: req.session.user_id ? true : false,
  };
  res.render("user/home.ejs", obj);
});
router.get("/shop", async function (req, res) {
  var ttl_products = (
    await exe("SELECT COUNT(product_id) as ttl FROM product")
  )[0].ttl;
  var per_page = 4;
  var ttl_pages =
    parseInt(ttl_products / per_page) < ttl_products / per_page
      ? parseInt(ttl_products / per_page) + 1
      : parseInt(ttl_products / per_page);

  var url_data = url.parse(req.url, true).query;
  var page_no = 1;
  if (url_data.page_no) page_no = url_data.page_no;

  var start = page_no * per_page - per_page;

  var products = await exe(`SELECT * FROM product LIMIT ${start},${per_page}`);

  obj = {
    is_login: req.session.user_id ? true : false,
    products: products,
    ttl_pages: ttl_pages,
    page_no: page_no,
  };
  res.render("user/shop.ejs", obj);
});
router.get("/about", async function (req, res) {
  var why_choose = await exe("SELECT * FROM why_choose_us");
  var points = await exe("SELECT * FROM why_choose_us_points LIMIT 4");
  var our_team = await exe("SELECT * FROM our_team");
  var testimonial = await exe("SELECT * FROM customer_review");

  obj = {
    why: why_choose[0],
    points: points,
    team: our_team,
    customer_review: testimonial,

    is_login: req.session.user_id ? true : false,
  };
  res.render("user/about.ejs", obj);
});
router.get("/services", async function (req, res) {
  var points = await exe("SELECT * FROM why_choose_us_points LIMIT 8");
  var products = await exe("SELECT * FROM product LIMIT 3");
  var testimonial = await exe("SELECT * FROM customer_review");

  obj = {
    points: points,
    products: products,
    customer_review: testimonial,

    is_login: req.session.user_id ? true : false,
  };
  res.render("user/services.ejs", obj);
});
router.get("/blog", async function (req, res) {
  var blogs = await exe("SELECT * FROM blog ");
  var testimonial = await exe("SELECT * FROM customer_review");

  obj = {
    blogs: blogs,
    customer_review: testimonial,

    is_login: req.session.user_id ? true : false,
  };
  res.render("user/blog.ejs", obj);
});
router.get("/contact", function (req, res) {
  obj = {
    is_login: req.session.user_id ? true : false,
  };
  res.render("user/contact.ejs", obj);
});

router.get("/cart", checklogin, async function (req, res) {
  var user_id = req.session.user_id;

  var cart_products = await exe(
    `SELECT * FROM  user_cart,product WHERE product.product_id = user_cart.product_id AND user_id ='${user_id}'`
  );

  obj = {
    is_login: req.session.user_id ? true : false,
    products: cart_products,
  };
  res.render("user/cart.ejs", obj);
});

router.get("/checkout", checklogin, async function (req, res) {
  var user_id = req.session.user_id;

  var p1 = await exe(
    `SELECT * FROM  user_cart,product WHERE product.product_id = user_cart.product_id AND user_id ='${user_id}'`
  );

  obj = {
    is_login: req.session.user_id ? true : false,
    products: p1,
  };
  res.render("user/checkout.ejs", obj);
});
router.get("/thankyou", function (req, res) {
  obj = {
    is_login: req.session.user_id ? true : false,
  };
  res.render("user/thankyou.ejs", obj);
});
router.get("/login", function (req, res) {
  obj = {
    is_login: req.session.user_id ? true : false,
  };
  res.render("user/login.ejs", obj);
});
router.get("/signup", function (req, res) {
  obj = {
    is_login: req.session.user_id ? true : false,
  };
  res.render("user/signup.ejs", obj);
});
router.post("/do_register", async function (req, res) {
  // var sql = `CREATE TABLE user_tbl(user_id INT PRIMARY KEY AUTO_INCREMENT,user_name VARCHAR(200),mobile_number VARCHAR(15),email_id VARCHAR(200),password VARCHAR(200))`;
  var d = req.body;
  var sql = `INSERT INTO user_tbl (user_name,mobile_number,email_id,password)
       VALUES('${d.user_name}','${d.mobile_number}','${d.email_id}','${d.password}')`;
  var data = await exe(sql);

  // res.send(data);
  res.redirect("/login");
});
router.post("/do_login", async function (req, res) {
  var d = req.body;
  var sql = `SELECT * FROM user_tbl WHERE mobile_number = '${d.mobile_number}' AND password = '${d.password}'`;
  var data = await exe(sql);
  if (data.length > 0) {
    req.session.user_id = data[0].user_id;
    // res.send("Login Success");
    res.redirect("/");
  } else {
    res.send("<script>alert('Invalid Details'); history.back();</script>");
  }
  // res.send(data);
});

router.post("/save_user", async function (req, res) {
  //   var sql = `CREATE TABLE customer(customer_id INT PRIMARY KEY AUTO_INCREMENT,first_name VARCHAR(200),last_name VARCHAR(200),email VARCHAR(200),message TEXT)`;

  var d = req.body;
  var sql = `INSERT INTO customer(first_name,last_name,email,message)
VALUES('${d.first_name}','${d.last_name}','${d.email}','${d.message}')`;

  var data = await exe(sql);

  // res.send(data);
  res.redirect("/contact");
});
router.post("/save_newsletter", async function (req, res) {
  // var sql = await exe(`CREATE TABLE newsletter(user_id INT PRIMARY KEY AUTO_INCREMENT,user_name VARCHAR(200),user_email VARCHAR(200) )`);

  var d = req.body;

  var sql = await exe(`INSERT INTO newsletter(user_name,user_email)
    VALUES('${d.user_name}','${d.user_email}')`);
  // res.send(sql);
  res.redirect("/");
});

router.get("/product_info/:product_id", async function (req, res) {
  var product_id = req.params.product_id;
  var product_det =
    await exe(`SELECT * FROM product,product_type WHERE product_type.product_type_id 
    = product.product_type_id AND product_id = '${product_id}'`);

  var user_id = req.session.user_id;
  var checkcart = await exe(
    `SELECT * FROM user_cart WHERE user_id = '${user_id}' AND product_id = '${product_id}'`
  );
  obj = {
    is_login: req.session.user_id ? true : false,
    product_det: product_det[0],
    in_cart: checkcart.length > 0 ? true : false,
  };

  res.render("user/product_info.ejs", obj);
});
router.get("/add_to_cart/:product_id", async function (req, res) {
  user_id = req.session.user_id;
  product_id = req.params.product_id;
  qty = 1;
  if (user_id == undefined)
    res.send(`<script>alert('Invalid User, Login Now...');
              location.href = '/login';</script>`);
  else {
    //USER CART
    //CREATE TABLE user_cart(user_cart_id INT PRIMARY KEY AUTO_INCREMENT,user_id INT,product_id INT,qty INT);
    var sql = `SELECT * FROM user_cart WHERE user_id = '${user_id}' AND product_id = '${product_id}'`;
    var check = await exe(sql);
    if (check.length == 0) {
      var sql2 = `INSERT INTO user_cart (user_id,product_id,qty)
        VALUES ('${user_id}','${product_id}','${qty}')`;
      var data = await exe(sql2);
    }
    // res.send(data);
    res.redirect("/product_info/" + product_id);
  }
});

router.get("/decrease_qty/:user_cart_id", async function (req, res) {
  var user_cart_id = req.params.user_cart_id;
  var sql = `SELECT * FROM user_cart,product WHERE product.product_id=user_cart.product_id AND user_cart_id = '${user_cart_id}'`;
  var data = await exe(sql);
  var new_qty = data[0].qty - 1;
  var price = data[0].product_price;
  if (new_qty > 0) {
    var total = new_qty * price;
    sql = `UPDATE user_cart SET qty = '${new_qty}' WHERE user_cart_id = '${user_cart_id}'`;
    var data = exe(sql);
    res.send({ new_qty: new_qty, total: total });
  } else {
    var total = data[0] * price;

    res.send({ new_qty: data[0].qty, total: total });
  }
});

router.get("/increase_qty/:user_cart_id", async function (req, res) {
  var sql = `UPDATE user_cart SET  qty=qty+1 WHERE user_cart_id = '${req.params.user_cart_id}'`;
  var data = await exe(sql);
  var sql = `SELECT * FROM user_cart,product WHERE product.product_id=user_cart.product_id AND user_cart_id = '${req.params.user_cart_id}'`;
  var data = await exe(sql);
  var new_qty = data[0].qty;
  var price = data[0].product_price;
  var total = new_qty * price;
  res.send({ new_qty: new_qty, total: total });
});
router.get("/delete_from_cart/:id", async function (req, res) {
  var sql = `DELETE FROM user_cart WHERE user_cart_id = '${req.params.id}'`;
  var data = await exe(sql);
  res.redirect("/cart");
});
router.post("/place_order", async function (req, res) {
  req.body.order_date = String(new Date().toISOString()).slice(0, 10);

  // var sql  = `CREATE TABLE order_tbl(order_id INT PRIMARY KEY AUTO_INCREMENT,country VARCHAR(50),c_fname VARCHAR(50),
  // c_lname VARCHAR(50),c_address TEXT,c_area TEXT,c_state VARCHAR(50),c_postal_zip VARCHAR(50),c_email_address VARCHAR(100),
  // c_phone VARCHAR(15),payment_mode VARCHAR(6),order_date VARCHAR(20))`;

  var d = req.body;
  var order_status = "pending";
  if (d.payment_mode == "online") order_status = "payment_pending";

  var sql = `INSERT INTO order_tbl(user_id,country,c_fname,c_lname,c_address,c_area,c_state,c_postal_zip,c_email_address,c_phone,payment_mode,order_date,order_status,payment_status)
    VALUES('${req.session.user_id}','${d.country}','${d.c_fname}','${d.c_lname}','${d.c_address}','${d.c_area}','${d.c_state}','${d.c_postal_zip}','${d.c_email_address}',
    '${d.c_phone}','${d.payment_mode}','${d.order_date}','${order_status}','pending')`;

  var data = await exe(sql);

  var cart_products = await exe(
    `SELECT * FROM user_cart,product WHERE product.product_id = user_cart.product_id AND user_id = '${req.session.user_id}'`
  );

  for (var i = 0; i < cart_products.length; i++) {
    order_id = data.insertId;
    user_id = req.session.user_id;
    product_id = cart_products[i].product_id;
    product_qty = cart_products[i].qty;
    product_price = cart_products[i].product_price;
    product_name = cart_products[i].product_name;
    product_details = cart_products[i].product_details;

    sql = `INSERT INTO order_products(order_id,user_id,product_id,product_qty,product_price,product_name,product_details)
        VALUES('${order_id}','${user_id}','${product_id}','${product_qty}','${product_price}','${product_name}','${product_details}')`;

    record = await exe(sql);
    console.log(record);
  }
  var sql = `DELETE FROM user_cart WHERE user_id='${req.session.user_id}'`;
  await exe(sql);
  if (order_status == "payment_pending")
    res.redirect("/pay_payment/" + data.insertId);
  else res.redirect("/my_orders");

  // res.send(record);

  // res.send("order id = "+data.insertId);
});
router.get("/pay_payment/:order_id", checklogin, async function (req, res) {
  // var order_amount = await exe("SELECT * FROM order_products");

  // var sql = `SELECT *, (SELECT SUM(product_qty*product_price) FROM order_products WHERE
  //  order_products.order_id = order_tbl.order_id) as total_amt FROM order_tbl WHERE user_id = '${req.session.user_id}'`;
  //  var orders = await exe(sql);

  //razorpay
  obj = {
    order_id: order_id,

    // "orders":orders[0],
  };
  res.render("user/pay_payment.ejs", obj);
});
router.post("/payment_success/:order_id", async function (req, res) {
  var order_id = req.params.order_id;
  var transaction_id = req.body.razorpay_payment_id;
  var today = new Date().toISOString().slice(0, 10);
  var sql = `UPDATE order_tbl SET order_status = 'pending',payment_status = 'complete',transaction_id = '${transaction_id}', payment_date = '${today}' WHERE order_id = '${order_id}'`;

  var data = await exe(sql);
  // res.send(data);
  res.redirect("/my_orders");
});
router.get("/my_orders", async function (req, res) {
  var sql = `SELECT *, (SELECT SUM(product_qty*product_price) FROM order_products WHERE
     order_products.order_id = order_tbl.order_id) as total_amt FROM order_tbl WHERE user_id = '${req.session.user_id}'`;
  var orders = await exe(sql);
  var obj = {
    is_login: req.session.user_id ? true : false,

    orders: orders,
  };
  res.render("user/my_orders.ejs", obj);
});

router.get("/profile", async function (req, res) {
  var user_id = req.session.user_id;

  // Initialize user_info as an empty array in case query returns nothing
  var user_info = (await exe(
    `SELECT * FROM user_tbl WHERE user_id ='${user_id}'`
  )) || [{}];

  // Check if user_info contains data and set it accordingly
  obj = {
    is_login: req.session.user_id ? true : false,
    user_info: user_info[0] || {
      user_name: "N/A",
      mobile_number: "N/A",
      email_id: "N/A",
    },
  };

  res.render("user/profile.ejs", obj);
});

router.get("/logout", function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect("/");
      }
    });
  }
});
router.get("/print_order/:id", async function (req, res) {
  var data = await exe(
    `SELECT * FROM order_tbl WHERE order_id ='${req.params.id}'`
  );
  var products = await exe(
    `SELECT * FROM order_products WHERE order_id ='${req.params.id}'`
  );

  var obj = {
    is_login: req.session.user_id ? true : false,
    order_info: data[0],
    products: products,
  };

  res.render("user/print_order.ejs", obj);
});

module.exports = router;

// var today = new Date().toISOString().slice(0,10);

// var sql = `UPDATE order_tbl SET order_status = 'dispatch',order_dispatch_date ='${today}'
// WHERE order_id = '${order_id}'`;
