var express = require("express");
var url = require("url");
var exe = require("./../connection");
var router = express.Router();


router.get("/home",async function(req,res){
    var admin_id = req.session.admin_id


    var admin_info = await exe(`SELECT * FROM  admin_tbl WHERE admin_id ='${admin_id}'`);
    obj = {       
        "is_login":((req.session.admin_id) ? true:false), 
        "admin_info":admin_info[0],
    };
    res.render("admin/home.ejs",obj);
});



router.get("/",function(req,res){
    res.render("admin/login.ejs");
});

router.post("/do_login" ,async function (req,res) {
    var d =  req.body;
       var sql = `SELECT * FROM admin_tbl WHERE mobile = '${d.mobile}' AND password = '${d.password}'`;
    var data = await exe(sql);
    if(data.length>0)
    {
        req.session.admin_id = data[0].admin_id;
        // res.send("Login Success");
        res.redirect("/admin/home");
    }
    else{
        res.send("<script>alert('Invalid Details'); history.back();</script>");
    }
    // res.send(data);
});

router.get('/Logout',  function (req, res, next)  {
    if (req.session) {
      // delete session object
      req.session.destroy(function (err) {
        if (err) {
          return next(err);
        } else {
          return res.redirect('/admin');
        }
      });
    }
  }); 
  



router.get("/manage_banner",async function(req,res){
    var banner_info = await exe("SELECT * FROM banner");
    var obj = {
        "banner_info":banner_info[0],
        "banner_i":banner_info
    };
    res.render("admin/manage_banner.ejs",obj);
});
router.post("/save_banner",async function(req,res){

    if(req.files){
    
    var banner_image = new Date().getTime() + req.files.banner_image.name;
    req.files.banner_image.mv("public/uploads/" + banner_image)

    // CREATE TABLE banner(banner_id INT PRIMARY KEY AUTO_INCREMENT,banner_title VARCHAR(200),banner_details TEXT,banner_link TEXT,banner_image TEXT)
    var d = req.body;
    var sql = `UPDATE banner SET banner_title ='${d.banner_title}',banner_details='${d.banner_details}',
    banner_link = '${d.banner_link}',banner_image='${banner_image}' WHERE banner_id = 1`;
    var data = await exe(sql);
    // res.send(data);
    }
    else{
        var d = req.body;
    var sql = `UPDATE banner SET banner_title ='${d.banner_title}',banner_details='${d.banner_details}',
    banner_link = '${d.banner_link}' WHERE banner_id = 1`;
    var data = await exe(sql);
    }
    res.redirect("/admin/manage_banner");
});
router.get("/product_type",async function(req,res){
    
    var types = await exe("SELECT * FROM product_type");
    var obj = {"types":types};
    res.render("admin/product_type.ejs",obj);
});
router.post("/save_product_type",async function(req,res){

//    var sql = `CREATE TABLE product_type(product_type_id INT PRIMARY KEY AUTO_INCREMENT,product_type_name VARCHAR(200))`;
      var sql = `INSERT INTO product_type (product_type_name) VALUES ('${req.body.product_type_name}')`;  
var data = await exe(sql);
   res.redirect("/admin/product_type");
});

router.get("/product",async function(req,res){

    var types = await exe("SELECT * FROM product_type");
    var obj = {"types":types};
    res.render("admin/product.ejs",obj);
});
router.post("/save_product",async function(req,res){
  
    // var file_name="";
    if(req.files)
    {
    if(req.files.product_image[0])
    {
        var file_names = [];
        console.log("multiple images uploaded");
        for(var i=0;i<req.files.product_image.length;i++)
        {
            var fn = new Date().getTime() + req.files.product_image[i].name;
            req.files.product_image[i].mv("public/uploads/"+fn);

            file_names.push(fn);
        }
         var file_name = file_names.join(",");
    }
    else{
        var  file_name = new Date().getTime()+req.files.product_image.name;
        req.files.product_image.mv("public/uploads/"+file_name);
    }
}

 

    // var sql = `CREATE TABLE product (product_id INT PRIMARY KEY AUTO_INCREMENT,product_type_id INT,product_name TEXT,
    //     product_price INT,duplicate_price INT,product_size VARCHAR(200),product_color VARCHAR(20),
    //     product_label VARCHAR(200),product_details TEXT)`;
     
    var d = req.body;
    d.product_details= d.product_details.replaceAll("'","`");
     var sql  = `INSERT INTO product(product_type_id,product_name,product_price,duplicate_price,product_size,
        product_color,product_label,product_details, product_image) VALUES ('${d.product_type}','${d.product_name}','${d.product_price}',
        '${d.duplicate_price}','${d.product_size}','${d.product_color}','${d.product_label}','${d.product_details}',
        '${file_name}')`;
        
        var data = await exe(sql);
   
    // console.log(req.files);
    // res.send(req.files);
    res.redirect("/admin/product");

});
router.get("/product_list",async function(req,res){
    var products = await exe ("SELECT * FROM product,product_type WHERE product.product_type_id = product_type.product_type_id ");
    var obj = {"products":products};
    res.render("admin/product_list.ejs",obj);
});
router.get("/product_search",async function(req,res){
  var url_data = url.parse(req.url,true).query;
  var str = url_data.str;
  var sql = `SELECT * FROM product,product_type WHERE product.product_type_id = product_type.product_type_id  AND ( product_name LIKE '%${str}%' 
  OR product_type_name LIKE '%${str}%' OR  product_size LIKE '%${str}%' OR product_price LIKE '%${str}%' OR product_label LIKE '%${str}%' OR product_details LIKE '%${str}%' )`;
    var products = await exe(sql);
    var obj = {"products":products};

    res.render("admin/product_list.ejs",obj);

});

router.get("/why_choose_us",async function(req,res){
    var sql = await exe("SELECT * FROM why_choose_us");
    var obj = {
        "why_choose_us_h":sql[0],
        "why_choose":sql
    };
    res.render("admin/why_choose_us.ejs",obj);
});
router.post("/save_why_choose_us_heading",async function(req,res){

    if(req.files){
    
        var image = new Date().getTime() + req.files.image.name;
        req.files.image.mv("public/uploads/" + image)
    
        // CREATE TABLE banner(banner_id INT PRIMARY KEY AUTO_INCREMENT,banner_title VARCHAR(200),banner_details TEXT,banner_link TEXT,banner_image TEXT)
        var d = req.body;
        var sql = `UPDATE why_choose_us SET heading ='${d.heading}',image='${image}' WHERE why_choose_us_id = 1`;
        var data = await exe(sql);
        // res.send(data);
        }
        else{
            var d = req.body;
            var sql = `UPDATE why_choose_us SET heading ='${d.heading}' WHERE why_choose_us_id = 1`;

        var data = await exe(sql);
        }
        res.redirect("/admin/why_choose_us");
});

router.get("/why_choose_us_points",async function(req,res){
    var sql = await exe("SELECT * FROM why_choose_us_points");
    obj = {"points":sql};
    res.render("admin/why_choose_us_points.ejs",obj);
})
router.post("/why_choose_points",async function(req,res){


// var sql = await exe(`CREATE TABLE why_choose_us_points (why_choose_us_points_id INT PRIMARY KEY AUTO_INCREMENT,image TEXT,name VARCHAR(200),details VARCHAR(200));  `);

    var image = "";

    if(req.files !=null)
    {

    if(req.files.image!=undefined){

     image = new Date().getTime()+req.files.image.name;
    req.files.image.mv("public/uploads/"+image);

    }
   }
  
   var d=req.body;
   var sql = `INSERT INTO why_choose_us_points (image,name,details) VALUES('${image}','${d.name}','${d.details}')`;
   var data = await exe(sql);
      res.redirect("/admin/why_choose_us_points");


//    res.send(sql);
// res.send(req.body);
    // console.log(req.files);
});
router.get("/edit_why_choose_points/:id",async function(req,res){
   var sql = await exe (`SELECT * FROM why_choose_us_points WHERE why_choose_us_points_id = '${req.params.id}' `);
   obj ={"points":sql[0]};
   res.render("admin/edit_why_points.ejs",obj);
});
router.post("/update_why_choose_points",async function(req,res){
    
    var d =req.body;
    if(req.files)
    {
        if(req.files.image!=undefined){

           var image = new Date().getTime()+req.files.image.name;
           req.files.image.mv("public/uploads/"+image);
           await exe(`UPDATE why_choose_us_points SET image = '${image}' WHERE why_choose_us_points_id = '${d.why_choose_us_points_id}'`);

       
        }
    };

    var sql = `UPDATE why_choose_us_points SET name = '${d.name}',details = '${d.details}' WHERE why_choose_us_points_id = '${d.why_choose_us_points_id}'`;

    var data = await exe(sql);
    // res.send(data);
    res.redirect("/admin/why_choose_us_points");
    // console.log(req.files);
});
router.get("/delete_why_choose_points/:id",async function(req,res){
  
    var id =  req.params.id;
    var sql = await exe (`DELETE FROM why_choose_us_points WHERE why_choose_us_points_id ='${id}'`);
     
        //   res.send(sql);
        res.redirect("/admin/why_choose_us_points");

});

router.get("/modern_design",async function(req,res){
    var sql = await exe("SELECT * FROM modern_design");
    var obj = {
        "modern_i_design":sql[0],
        "modern_i":sql
    };
    res.render("admin/modern_design.ejs",obj);
});
router.post("/save_modern_design",async function(req,res){

    // var sql = `CREATE TABLE modern_design(modern_design_id INT PRIMARY KEY AUTO_INCREMENT ,image1 TEXT,image2 TEXT,image3 TEXT,heading VARCHAR(200),details TEXT,key_point1 VARCHAR(200),key_point2 VARCHAR(200),key_point3 VARCHAR(200),key_point4 VARCHAR(200))`;
    var image1 = "";
    var image2 = "";
    var image3 = "";

    if(req.files !=null)
    {

    if(req.files.image1!=undefined){

    image1 = new Date().getTime()+req.files.image1.name;
    req.files.image1.mv("public/uploads/"+image1);
    
    await exe(`UPDATE modern_design SET image1 = '${image1}' WHERE modern_design_id = 1`);

    }
    if(req.files.image2!=undefined){

        image2 = new Date().getTime()+req.files.image2.name;
        req.files.image2.mv("public/uploads/"+image2);
        await exe(`UPDATE modern_design SET image2 = '${image2}' WHERE modern_design_id = 1`);

    
    }
     if(req.files.image3!=undefined){

            image3 = new Date().getTime()+req.files.image3.name;
            req.files.image3.mv("public/uploads/"+image3);
            await exe(`UPDATE modern_design SET image3 = '${image3}' WHERE modern_design_id = 1`);

     }
   }

   var d=req.body;

   var sql = `UPDATE modern_design SET heading ='${d.heading}',details='${d.details}',
   key_point1 = '${d.key_point1}', key_point2 = '${d.key_point2}',key_point3 = '${d.key_point3}',key_point4 = '${d.key_point4}' WHERE modern_design_id = 1`;
//    var sql = `INSERT INTO modern_design (image1,image2,image3,heading,details,key_point1,key_point2,key_point3,key_point4) VALUES('${image1}','${image2}','${image3}','${d.heading}','${d.details}','${d.key_point1}','${d.key_point2}','${d.key_point3}','${d.key_point4}')`;
    

    var data = await exe(sql);
    // res.send(data);
    res.redirect("/admin/modern_design");
    // res.send(req.body);
    // console.log(req.files);
});
router.get("/testimonial",async function(req,res){
    var sql = await exe("SELECT * FROM customer_review");
    obj = {"testimonial":sql};
    res.render("admin/testimonial.ejs",obj);
});

router.post("/save_testimonial",async function(req,res){

    // var sql = `CREATE TABLE customer_review (customer_id INT PRIMARY KEY AUTO_INCREMENT,customer_photo TEXT,customer_name VARCHAR(200),customer_position VARCHAR(200),customer_message TEXT)`;
   
    var customer_photo = "";

    if(req.files !=null)
    {

    if(req.files.customer_photo!=undefined){

     customer_photo = new Date().getTime()+req.files.customer_photo.name;
    req.files.customer_photo.mv("public/uploads/"+customer_photo);

    }
   }
   var d=req.body;
   var sql = `INSERT INTO customer_review(customer_photo,customer_name,customer_position,customer_message) 
   VALUES('${customer_photo}','${d.customer_name}','${d.customer_position}','${d.customer_message}')`;
   var data = await exe(sql);
      res.redirect("/admin/testimonial");

    // var data = await exe(sql);
    // res.send(data);
    // console.log(req.files);
});

router.get("/edit_testimonial/:id",async function(req,res){

    var sql  = await exe (`SELECT * FROM customer_review WHERE customer_id = '${req.params.id}'`);
    obj = {"customers":sql[0]};
    res.render("admin/edit_testimonial.ejs",obj);
});
router.post("/update_testimonial",async function(req,res){

    
    var d =req.body;
    if(req.files)
    {
        if(req.files.customer_photo!=undefined){

           var customer_photo = new Date().getTime()+req.files.customer_photo.name;
           req.files.customer_photo.mv("public/uploads/"+customer_photo);
           await exe(`UPDATE customer_review SET customer_photo = '${customer_photo}' WHERE customer_id = '${d.customer_id}'`);

       
        }
    };

    var sql = `UPDATE customer_review SET customer_name = '${d.customer_name}', customer_position = '${d.customer_position}', customer_message = '${d.customer_message}' WHERE customer_id = '${d.customer_id}'`;

    var data = await exe(sql);
    // res.send(data);
    res.redirect("/admin/testimonial");
});
router.get("/delete_testimonial/:id",async function(req,res){
    
    var id =  req.params.id;
    var sql = await exe (`DELETE FROM customer_review WHERE customer_id ='${id}'`);
     
        //    res.send(sql);
        res.redirect("/admin/testimonial");
});

router.get("/blog", async function(req,res){
    var sql = await exe("SELECT * FROM blog");
    obj ={"blogs":sql};
    res.render("admin/blog.ejs",obj);
});
router.post("/save_blog",async function(req,res){

    // var sql = await exe(`CREATE TABLE blog (blog_id INT PRIMARY KEY AUTO_INCREMENT,blog_image TEXT,blog_title VARCHAR(200),blog_details TEXT,blog_post_date VARCHAR(200),blog_post_time VARCHAR(200),blog_post_by VARCHAR(200),blog_post_by_position VARCHAR(200))`);
    var blog_image = "";

    if(req.files !=null)
    {

    if(req.files.blog_image!=undefined){

     blog_image = new Date().getTime()+req.files.blog_image.name;
    req.files.blog_image.mv("public/uploads/"+blog_image);

    }
   }
   var d=req.body;
   var sql = `INSERT INTO blog(blog_image,blog_title,blog_details,blog_post_date,blog_post_time,blog_post_by,blog_post_by_position) 
   VALUES('${blog_image}','${d.blog_title}','${d.blog_details}','${d.blog_post_date}','${d.blog_post_time}','${d.blog_post_by}','${d.blog_post_by_position}')`;
   var data = await exe(sql);
      res.redirect("/admin/blog"); 
    // res.send(sql);
    // console.log(req.files);
});
router.get("/edit_blog/:id",async function(req,res){
    var sql  = await exe (`SELECT * FROM blog WHERE blog_id = '${req.params.id}'`);
    obj = {"blogs":sql[0]};
    res.render("admin/edit_blog.ejs",obj);
});
router.post("/update_blog",async function(req,res){
    var d =req.body;
    if(req.files)
    {
        if(req.files.blog_image!=undefined){

           var blog_image = new Date().getTime()+req.files.blog_image.name;
           req.files.blog_image.mv("public/uploads/"+blog_image);
           await exe(`UPDATE blog SET blog_image = '${blog_image}' WHERE blog_id = '${d.blog_id}'`);

       
        }
    };

    var sql = `UPDATE blog SET blog_title = '${d.blog_title}', blog_details = '${d.blog_details}', blog_post_date = '${d.blog_post_date}', blog_post_time = '${d.blog_post_time}', blog_post_by = '${d.blog_post_by}',blog_post_by_position = '${d.blog_post_by_position}' WHERE blog_id = '${d.blog_id}'`;

    var data = await exe(sql);
    // res.send(data);
    res.redirect("/admin/blog");
});
router.get("/delete_blog/:id",async function(req,res){
    var id =  req.params.id;
    var sql = await exe (`DELETE FROM blog WHERE blog_id ='${id}'`);
     
        //    res.send(sql);
        res.redirect("/admin/blog");
});

router.get("/edit_product/:id",async function(req,res){
    
    var types = await exe("SELECT * FROM product_type");
    var product_info = await exe(`SELECT * FROM product WHERE product_id = '${req.params.id}'`);
    var obj = {"types":types,"product_info":product_info[0]};
    res.render("admin/edit_product.ejs",obj);

});

router.get("/delete_product_image/:id/:img", async function(req,res){
    var data = await exe(`SELECT * FROM product WHERE product_id = '${req.params.id}'`);
    new_image = data[0]['product_image'].replaceAll(req.params.img,"");

    var sql = `UPDATE product SET product_image = '${new_image}' WHERE product_id = '${req.params.id}'`;
    var data = await exe(sql);

    res.send(data);
    // res.redirect("/admin/edit_product/:id");
});
router.get("/delete_product/:id",async function(req,res){
    var id =  req.params.id;
    var sql = await exe (`DELETE FROM product WHERE product_id ='${id}'`);
     
        //  res.send(sql);
         res.redirect("/admin/product_list");
})

router.post("/update_product",async function(req,res){

    var d = req.body;

   
    if(req.files)
    {

    if(req.files.product_image[0])
    {
        var file_names = [];
        console.log("multiple images uploaded");
        for(var i=0;i<req.files.product_image.length;i++)
        {
            var fn = new Date().getTime() + req.files.product_image[i].name;
            req.files.product_image[i].mv("public/uploads/"+fn);

            file_names.push(fn);
        }
          var file_name = file_names.join(",");
         //await exe(`UPDATE product SET product_image = '${file_name}' WHERE product_id = '${d.product_id}'`);

    }

    else{
          var file_name = new Date().getTime()+req.files.product_image.name;
        req.files.product_image.mv("public/uploads/"+file_name);

    }  
    await exe(`UPDATE product SET product_image = '${file_name}' WHERE product_id = '${d.product_id}'`);

};



    d.product_details= d.product_details.replaceAll("'","`");
    
    var sql = `UPDATE product SET product_type_id = '${d.product_type}',product_name = '${d.product_name}',
    product_price = '${d.product_price}',duplicate_price = '${d.duplicate_price}',product_size = '${d.product_size}',
    product_color = '${d.product_color}',product_label = '${d.product_label}',product_details='${d.product_details}'
      WHERE product_id = '${d.product_id}' `;

    
        var data = await exe(sql);
        // res.send(data);

    res.redirect("/admin/product_list");
});

router.get("/our_team",async function(req,res){

    var sql = await exe("SELECT * FROM our_team");
    obj = {"team":sql};
   res.render("admin/our_team.ejs",obj);
});
router.post("/save_team",async function(req,res){

    // var sql =  await exe(`CREATE TABLE our_team(our_team_id INT PRIMARY KEY AUTO_INCREMENT,image TEXT,name VARCHAR(200),
    // position VARCHAR(200),details TEXT)`);

    var image = "";

    if(req.files !=null)
    {

    if(req.files.image!=undefined){

     image = new Date().getTime()+req.files.image.name;
    req.files.image.mv("public/uploads/"+image);

    }
   }
   var d=req.body;
   var sql = `INSERT INTO our_team(image,name,position,details) 
   VALUES('${image}','${d.name}','${d.position}','${d.details}')`;
   var data = await exe(sql);
      res.redirect("/admin/our_team");


  
    // res.send(sql);
    // console.log(req.files);
});
router.get("/edit_our_team/:id",async function(req,res){

    var sql  = await exe (`SELECT * FROM our_team WHERE our_team_id = '${req.params.id}'`);
    obj = {"teams":sql[0]};
    res.render("admin/edit_our_team.ejs",obj);
});
router.post("/update_team",async function(req,res){
    var d =req.body;
    if(req.files)
    {
        if(req.files.image!=undefined){

           var image = new Date().getTime()+req.files.image.name;
           req.files.image.mv("public/uploads/"+image);
           await exe(`UPDATE our_team SET image = '${image}' WHERE our_team_id = '${d.our_team_id}'`);

       
        }
    };

    var sql = `UPDATE our_team SET name = '${d.name}',position = '${d.position}',details = '${d.details}' WHERE our_team_id = '${d.our_team_id}'`;

    var data = await exe(sql);
    // res.send(data);
    res.redirect("/admin/our_team");
});

router.get("/delete_our_team/:id",async function(req,res){
    var id =  req.params.id;
    var sql = await exe (`DELETE FROM our_team WHERE our_team_id ='${id}'`);
     
        //    res.send(sql);
        res.redirect("/admin/our_team");
});
router.get("/customer",async function(req,res){
    var sql = await exe ("SELECT * FROM customer");
    obj ={"customers":sql};
    res.render("admin/customer_data.ejs",obj);
});
router.get("/delete_customer/:id",async function(req,res){
  
    var id = req.params.id;

    var sql = await exe (`DELETE FROM customer WHERE customer_id = '${id}'`);
    // res.send(sql);
    res.redirect("/admin/customer");
});
router.get("/newsletter",async function(req,res){
    var sql = await exe ("SELECT * FROM newsletter");
    obj ={"newsletter":sql};
    res.render("admin/newsletter.ejs",obj)
});
router.get("/delete_newsletter/:id",async function(req,res){
    var id = req.params.id;

    var sql = await exe (`DELETE FROM newsletter WHERE user_id = '${id}'`);
    // res.send(sql);
    res.redirect("/admin/newsletter");
});
router.get("/pending_order",async function(req,res){

    var sql = `SELECT *,(SELECT SUM(product_qty*product_price) FROM order_products WHERE order_products.order_id
     = order_tbl.order_id) as total_amt FROM order_tbl WHERE order_status = 'pending'`;
     var obj = {
        "orders":await exe(sql),
    };
    res.render("admin/pending_order.ejs",obj);
});
router.get("/view_order/:id",async function(req,res){

    var data = await exe(`SELECT * FROM order_tbl WHERE order_id ='${req.params.id}'`);
    var products = await exe(`SELECT * FROM order_products WHERE order_id ='${req.params.id}'`);


    var obj ={
         "order_info":data[0],
         "products":products,
    }
    res.render("admin/view_order.ejs",obj);
});
router.get("/dispatch_order/:id",async function(req,res){
    var today = new Date().toISOString().slice(0,10);

    var sql = `UPDATE order_tbl SET order_dispatch_date = '${today}',order_status = 'dispatch' WHERE order_id = '${req.params.id}'`;
    var data = await exe(sql);
    // res.send(data);
    res.redirect("/admin/dispatch_order");
});

router.get("/dispatch_order",async function(req,res){
    var sql = `SELECT *,(SELECT SUM(product_qty*product_price) FROM order_products WHERE order_products.order_id
     = order_tbl.order_id) as total_amt FROM order_tbl WHERE order_status = 'dispatch'`;
     var obj = {
        "orders":await exe(sql),
    };
   res.render("admin/dispatch_order.ejs",obj);
    
});
router.get("/dispatch_view_order/:id",async function(req,res){

    
    var data = await exe(`SELECT * FROM order_tbl WHERE order_id ='${req.params.id}'`);
    var products = await exe(`SELECT * FROM order_products WHERE order_id ='${req.params.id}'`);


    var obj ={
         "order_info":data[0],
         "products":products,
    }
    res.render("admin/dispatch_view_order.ejs",obj);
});

router.get("/delivered_order/:id",async function(req,res){
    var today = new Date().toISOString().slice(0,10);

    var sql = `UPDATE order_tbl SET order_delivered_date = '${today}',order_status = 'delivered' WHERE order_id = '${req.params.id}'`;
    var data = await exe(sql);
    // res.send(data);
    res.redirect("/admin/delivered_order");
});

router.get("/delivered_order",async function(req,res){
    var sql = `SELECT *,(SELECT SUM(product_qty*product_price) FROM order_products WHERE order_products.order_id
     = order_tbl.order_id) as total_amt FROM order_tbl WHERE order_status = 'delivered'`;
     var obj = {
        "orders":await exe(sql),
    };
   res.render("admin/delivered_order.ejs",obj);
    
});
router.get("/delivered_view_order/:id",async function(req,res){

    
    var data = await exe(`SELECT * FROM order_tbl WHERE order_id ='${req.params.id}'`);
    var products = await exe(`SELECT * FROM order_products WHERE order_id ='${req.params.id}'`);


    var obj ={
         "order_info":data[0],
         "products":products,
    }
    res.render("admin/delivered_view_order.ejs",obj);
});

module.exports = router;