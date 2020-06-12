const mysql = require("mysql");
const inquirer = require("inquirer");
const express = require("express");
const util = require("util");
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

connection.connect((function (err) {
  if (err) {
    console.err("connected as id " + connection.threadId);
    connection.end();
    return;
  }
  startPrompt();
}));

function startPrompt() {
  inquirer.prompt(start).then(function (answers) {
    questionsArray(answers.userSelect);
  });
}

const start = {
  type: 'list',
  name: 'userSelect',
  message: 'What would you like to do?',
  choices: [
    "View all employees",
    "View all departments",
    "View all roles",
    "Add employee",
    "Add department",
    "Add role",
    "Update Employee Role",
    "Exit"
  ]
};

function questionsArray(userSelect) {
  switch (userSelect) {
    case "View all employees":
      viewInput("Employee");
      break;
    case "View all departments":
      viewInput("Deparments");
      break;
    case "View all roles":
      viewInput("Roles");
      break;
    case "Add employee":
      addInput("addEmployee");
      break;
    case "Add department":
      addInput("addDeparments");
      break;
    case "Add role":
      addInput("addRole");
      break;
    case "Update employee role":
      updateInput("updateRole");
      break;
    case "Exit":
      exitArray();
      break;
  }
}

function viewInput(name) {
  let queryEmployee =
  'SELECT e.id,e.first_name, e.last_name, role.title, department.name AS "dept", role.salary,\n\
  CONCAT(m.first_name,"", m.last_name) AS "manager",\n\
  FROM employee AS e LEFT JOIN employee AS m ON m.id = e.manager_id,\n\
  INNER JOIN role ON e.role_id = role.id INNER JOIN dept ON role.department_id = department_id';

  let queryDepartment = 'SELECT * FROM department';

  let queryRole =
    'SELECT role.id, role.title, role.salary, department.name FROM role INNER JOIN department ON role.department_id = department';

  let query = "";

  switch (name) {
    case "Employee":
      query = queryEmployee;
      viewInput(name);
      break;
    case "Departments":
      query = queryDepartment;
      viewInput(name);
      break;
    case "Role":
      query = queryRole;
      viewInput(name);
      break;
    case "Add employee":
      query = queryAddEmployee;
      addEmployee(name);
      break;
    case "Add department":
      query = queryAddDepartment;
      addDepartment(name);
      break;
    case "Add role":
      query = queryAddRole;
      addRole(name);
      break;
    case "Update employee role":
      query = queryUpdateEmployee;
      updateEmployee(name);
      break;
    case "Exit":
      exitArray();
      break; 
  }
};

// function addEmployee() {
//   let queryAddEmployee = ;
//   let queryUpdateEmployee = ;
//   let queryAddRole = ;
// };

// function 
