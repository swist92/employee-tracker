const mysql = require("mysql");
const inquirer = require("inquirer");
const express = require("express");
const util = require("util");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "employee_trackerDB",
});

connection.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }
  startPrompt();
});

function startPrompt() {
  inquirer.prompt(questionsArray).then(function (answer) {
    beginFunction(answer.questions);
  });
}

const questionsArray = {
  type: "list",
  name: "questions",
  message: "Choose one",
  choices: [
    "View employees",
    "View departments",
    "View roles",
    "Add employee",
    "Update employee role",
    "Add department",
    "Add role",
  ],
};

function beginFunction(questions) {
  switch (questions) {
    case "View employees":
      displayTable("employee");
      break;

    case "View departments":
      displayTable("department");
      break;

    case "View roles":
      displayTable("role");
      break;

    case "Add employee":
      addEmployee();
      break;

    case "Update employee role":
      updateEmployeeRole();
      break;

    case "Add department":
      addDepartment();
      break;

    case "Add role":
      addRole();
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
    addEmployeeSupp(roleList, managerList);
  });
}

async function addEmployeeSupp(roleList, managerList) {
  const answer = await inquirer.prompt([
    {
      name: "firstName",
      type: "input",
      message: "What is the employee's first name?",
    },
    {
      name: "lastName",
      type: "input",
      message: "What is the employee's last name?",
    },
    {
      name: "role",
      type: "list",
      message: "What is the employee's role?",
      choices: roleList,
    },
    {
      name: "manager",
      type: "list",
      message: "Who is this employee's manager?",
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

function updateEmployeeRole() {
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
    updateEmployeeRoleSupp(employeeList, roleList);
  });
}

async function updateEmployeeRoleSupp(employeeList, roleList) {
  let answer = await inquirer.prompt([
    {
      name: "employee",
      type: "list",
      message: "Which employee do you want to update?",
      choices: employeeList,
    },
    {
      name: "role",
      type: "list",
      message: "What is this employee's role?",
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
      message: "What is the department you would like to add?",
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
    addRoleSupp(departmentList);
  });
}

async function addRoleSupp(departmentList) {
  const answer = await inquirer.prompt([
    {
      name: "department",
      type: "list",
      message: "Which department is this role under?",
      choices: departmentList,
    },
    {
      name: "title",
      type: "input",
      message: "What is the title of this role?",
    },
    {
      name: "salary",
      type: "input",
      message: "What is the salary of this role?",
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
