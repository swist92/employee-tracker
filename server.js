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

connection.connect(function (err) {
  if (err) {
    console.err("connected as id " + connection.threadId);
    connection.end();
    return;
  }
  startPrompt();
});

function startPrompt() {
  inquirer.prompt(start).then(function (answers) {
    questionsArray(answers.userSelect);
  });
}

const start = {
  type: "list",
  name: "userSelect",
  message: "Choose one of the below",
  choices: [
    "View all employees",
    "View all departments",
    "View all roles",
    "Add employee",
    "Add department",
    "Add role",
    "Update Employee Role",
    "Update Employee Manager",
  ],
};

function questionsArray(userSelect) {
  switch (userSelect) {
    case "View all employees":
      displayTable("Employees");
      break;
    case "View all departments":
      displayTable("Departments");
      break;
    case "View all roles":
      displayTable("Roles");
      break;
    case "Add employee":
      addEmployee();
      break;
    case "Add department":
      addDepartment();
      break;
    case "Add role":
      addRole();
      break;
    case "Update employee role":
      updateEmployeeRole();
      break;
    case "Update employee manager":
      updateEmployeeManager();
      break;
  }
}

function displayTable(name) {
  let queryEmployee =
    'select e.id, e.first_name, e.last_name, role.title, department.name as "department", role.salary, concat(m.first_name," ",m.last_name) as "manager" from employee as e left join employee as m on m.id=e.manager_id inner join role on e.role_id=role.id inner join department on role.department_id=department.id';
  let queryDepartment = "select * from department";
  let queryRole =
    "select role.id, role.title, role.salary, department.name from role inner join department on role.department_id=department.id";
  let query = "";
  switch (name) {
    case "employee":
      query = queryEmployee;
      break;
    case "department":
      query = queryDepartment;
      break;
    case "role":
      query = queryRole;
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
  connection.query(query, function (err, res) {
    console.table(res);
    startPrompt();
  });
}

function addEmployee() {
  let roleList = [];
  let managerList = ["None"];

  connection.query("select title from role", function (err, res) {
    for (var i = 0; i < res.length; i++) {
      roleList.push(res[i].title);
    }
  });
  connection.query("select first_name, last_name from employee", function (
    err,
    res
  ) {
    for (var i = 0; i < res.length; i++) {
      managerList.push(res[i].first_name + " " + res[i].last_name);
    }
    addEmployee(roleList, managerList);
  });
}

async function addEmployee(roleList, managerList) {
  const answer = await inquirer.prompt([
    {
      name: "firstName",
      type: "input",
      message: "Employee first name",
    },
    {
      name: "lastName",
      type: "input",
      message: "Employee last name",
    },
    {
      name: "role",
      type: "list",
      message: "Employee role",
      choices: roleList,
    },
    {
      name: "manager",
      type: "list",
      message: "Employee's manager",
      choices: managerList,
    },
  ]);

  if (answer.manager == "None") {
    const manager = null;
    let query =
      "insert into employee (first_name, last_name, role_id, manager_id) values (?,?,(select id from role where title =?), null)";
    connection.query(
      query,
      [answer.firstName, answer.lastName, answer.role],
      function (err, res) {
        if (err) throw err;
        startPrompt();
      }
    );
  } else {
    const manager = answer.manager.split(" ");
    let query =
      "insert into employee (first_name, last_name, role_id, manager_id) values (?,?,(select id from role where title=?), (select id from ( select * from employee) as t where first_name = ? and last_name = ? ))";
    connection.query(
      query,
      [answer.firstName, answer.lastName, answer.role, manager[0], manager[1]],
      function (err, res) {
        if (err) throw err;
        startPrompt();
      }
    );
  }
}

function updateEmployeeManager() {
  const employeeList = [];
  connection.query("select first_name, last_name from employee", function (
    err,
    res
  ) {
    for (var i = 0; i < res.length; i++) {
      employeeList.push(res[i].first_name + " " + res[i].last_name);
    }
    updateEmployeeManager(employeeList);
  });
}

async function updateEmployeeManager(employeeList) {
  let answer = await inquirer.prompt([
    {
      name: "employee",
      type: "list",
      message: "Select employee to update",
      choices: employeeList,
    },
    {
      name: "manager",
      type: "list",
      message: "Select employee's manager",
      choices: employeeList,
    },
  ]);
  const employee = answer.employee.split(" ");
  const manager = answer.manager.split(" ");

  let query =
    "update employee set manager_id = (select id from ( select * from employee) as t where first_name =? and last_name=?) where first_name=? and last_name=?";
  connection.query(
    query,
    [manager[0], manager[1], employee[0], employee[1]],
    function (err, res) {
      if (err) throw err;
      startPrompt();
    }
  );
}

function updateEmployee() {
  let employeeList = [];
  let roleList = [];
  connection.query("select title from role", function (err, res) {
    for (var i = 0; i < res.length; i++) {
      roleList.push(res[i].title);
    }
  });
  connection.query("select first_name, last_name from employee", function (
    err,
    res
  ) {
    for (var i = 0; i < res.length; i++) {
      employeeList.push(res[i].first_name + " " + res[i].last_name);
    }
    updateEmployeeRole(employeeList, roleList);
  });
}

async function updateEmployeeRole(employeeList, roleList) {
  let answer = await inquirer.prompt([
    {
      name: "employee",
      type: "list",
      message: "Select employee to update?",
      choices: employeeList,
    },
    {
      name: "role",
      type: "list",
      message: "Select employee's role",
      choices: roleList,
    },
  ]);
  let employee = answer.employee.split(" ");
  let query =
    "update employee set role_id = (select id from role where title =?)  where first_name=? and last_name=?";
  connection.query(query, [answer.role, employee[0], employee[1]], function (
    err,
    res
  ) {
    startPrompt();
  });
}

function addDepartment() {
  inquirer
    .prompt({
      name: "name",
      type: "input",
      message: "Add department",
    })
    .then(function (answer) {
      let value = [[answer.name]];
      connection.query(
        "insert into department (name) values ?",
        [value],
        function (err, res) {
          startPrompt();
        }
      );
    });
}

function addRole() {
  let departmentList = [];
  connection.query("select name from department", function (err, res) {
    for (var i = 0; i < res.length; i++) {
      departmentList.push(res[i].name);
    }
    addRole(departmentList);
  });
}

async function addRole(departmentList) {
  const answer = await inquirer.prompt([
    {
      name: "department",
      type: "list",
      message: "Select the role's department",
      choices: departmentList,
    },
    {
      name: "title",
      type: "input",
      message: "Title of role",
    },
    {
      name: "salary",
      type: "input",
      message: "Salary of role",
    },
  ]);
  let finalQuery =
    "insert into role (title,salary,department_id) value (?,?, (select id from department where name=?))";
  connection.query(
    finalQuery,
    [answer.title, parseInt(answer.salary), answer.department],
    function (err, res) {
      if (err) throw err;
      startPrompt();
    }
  );
}
