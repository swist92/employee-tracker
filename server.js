const mysql = require("mysql");
const inquirer = require("inquirer");
const express = require("express");
const cTable = require("console.table")

const connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "employee_trackerDB"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  connection.end();
});

async function start() {
  const choice = await inquirer
  .prompt([
    {
      type: "list",
      name: "choice",
      message: "What would you like to do?",
      choices: ["eat bread", 2, "go play"]
    }
  ]);
  console.log(choice);
}
start();

inquirer.prompt([
  {
    type: "list",
    name: "choice",
    message: "What would you like to do?",
    choices: ["View all employees", "View all departments", "Add employee"]
  }
])
if (choice.choice === "Add employee") {
  const employee = await prompt(questions);
}
