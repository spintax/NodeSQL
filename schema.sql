### Schema
DROP DATABASE IF EXISTS bamazon_db;

CREATE DATABASE bamazon_db;

USE bamazon_db;

CREATE TABLE products
(
	item_id int NOT NULL AUTO_INCREMENT,
	product_name varchar(255) NOT NULL,
	department_name varchar(255) NOT NULL,
	price int NOT NULL,
	stock_quantity int NOT NULL,
	PRIMARY KEY (item_id)
);



