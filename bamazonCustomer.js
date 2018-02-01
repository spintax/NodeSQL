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
        console.log("ChosenItem: " + chosenItem);
        var purchaseQuantity = parseInt(answer.total);

        // determine if purchaseQuantity is less than the stock quantity
        if (purchaseQuantity <= chosenItem.stock_quantity) {
          // if yes, then update the database with the new quantity and display total price to the user. 
          connection.query(
            "UPDATE products SET ? WHERE ?", [{
                stock_quantity: (stock_quantity - purchaseQuantity)
              },
              {
                id: chosenItem.id
              }
            ],
            function (error) {
              if (error) throw err;
              console.log("Your total comes to: " + (purchaseQuantity * chosenItem.price));
            }
          );
        } else {
          // if productquantity was more than stockquantity then show this message and start over.
          console.log("Insufficient Quantity!");
          // start();
        }
      });
  });
}