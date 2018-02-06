var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "suorcidul1",
  database: "bamazon_db"
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  start();
});

function start() {
  // Display list of items for sale
  console.log("Here is the list of items we have for sale:")
  connection.query("SELECT product_name, item_id, price, stock_quantity FROM products", function (err, results) {
    if (err) throw err;
    // get the information of all items in the database
    for (var i = 0; i < results.length; i++) {
      console.log("Product: " + results[i].product_name + ", ID: " + results[i].item_id + ", Price: " + results[i].price);
      console.log("--------------------------------------------")
      // itemIDs.push(results[i].item_id);
    };
    inquirer
      .prompt([{
        name: "choice",
        type: "list",
        message: "Would you like to purchase an item?",
        choices: ["Yes", "No"]
      }])
      .then(function (answer) {
        if (answer.choice === "Yes") {
          console.log("Great!");
          chooseProduct();
        } else {
          console.log("That's a shame. See you next time!");
        }
      });
  });
}


function chooseProduct() {
  // query the database for all items for sale
  connection.query("SELECT * FROM products", function (err, results) {
    if (err) throw err;
    // once you have the items, prompt the user for which they'd like to bid on
    inquirer
      .prompt([{
          name: "choice",
          type: "rawlist",
          choices: function () {
            var productIDs = [];
            for (var i = 0; i < results.length; i++) {
              productIDs.push(results[i].product_name);
            }
            return productIDs;
          },
          message: "Select which product ID you'd like to purchase."
        },
        {
          name: "total",
          type: "input",
          message: "How many of these would you like to buy?"
        }
      ]).then(function (answer) {
        // console.log(answer);
        var chosenItem = answer.choice;
        // console.log("blah" + typeof chosenItem);
        // console.log("ChosenItem: " + chosenItem);
        var purchaseQuantity = parseInt(answer.total);
        // console.log(purchaseQuantity);

        var queryItem;
        
        connection.query("SELECT * FROM products WHERE product_name =? ", [chosenItem], function (err, results) {
          if (err) throw err;
          // console.log(results);
          queryItem = results[0];
          // console.log("Query iTEM: " + queryItem);

          // determine if purchaseQuantity is less than the stock quantity
          if (parseInt(purchaseQuantity) <= parseInt(queryItem.stock_quantity)) {
            // console.log(parseInt(purchaseQuantity) <= parseInt(queryItem.stock_quantity));
            // console.log("there are " + queryItem.stock_quantity + " of " + queryItem.product_name + " left.");
            console.log("Your total comes to: $" + ((parseInt(purchaseQuantity) * parseInt(queryItem.price))));
            updateProduct();

          } else {
            console.log("-----------------------------------------------------------");
            console.log('Sorry, there is insufficient inventory to fill your request');
            console.log("-----------------------------------------------------------");
            chooseProduct()
          }


          function updateProduct() {
            var newQuantity = parseInt(queryItem.stock_quantity) - parseInt(purchaseQuantity);
            // console.log(newQuantity);
            // console.log("query itemstock: " + queryItem.stock_quantity);
            // console.log("query item id " + queryItem.item_id),
            connection.query(
              "UPDATE products SET ? WHERE ?", [{
                  stock_quantity: newQuantity
                },
                {
                  item_id: queryItem.item_id
                }
              ],
              
              function (error, results) {
                if (error) throw err;
                // console.log(results);
                console.log("-----------------------------------------------------------");
                console.log("Inventory Updated!");
                console.log("-----------------------------------------------------------");
                start();
              }
            );
          }
        })
      });
  });
}

