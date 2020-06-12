const mysql = require("mysql");
const inquirer = require("inquirer");
const express = require("express");
const cTable = require("console.table");

const connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "employee_trackerDB",
});

connection.connect(function (err) {
  if (err) {
    console.log("connected as id " + connection.threadId);
    connection.end();
    return;
  }
  startPrompt();
});

function startPrompt() {
  inquirer.prompt(start).then(function (answers) {
    questionsArray(answers.select);
  });
}

const start = {
  type: "list",
  name: "select",
  message: "What would you like to do?",
  choices: [
    "View all employees",
    "View all departments",
    "View all roles",
    "Add employee",
    "Add department",
    "Add role",
    "Update Employee Role",
    "Exit",
  ],
};

function questionsArray(select) {
  switch (select) {
    case "View all employees":
      viewTable("Employee");
      break;
    case "View all departments":
      viewTable("Deparments");
      break;
    case "View all roles":
      viewTable("Roles");
      break;
    case "View all departments":
      viewTable("Deparments");
      break;
    case "View all departments":
      viewTable("Deparments");
      break;
    case "View all departments":
      viewTable("Deparments");
      break;
    case "View all departments":
      viewTable("Deparments");
      break;
    case "View all departments":
      viewTable("Deparments");
      break;
  }
}
