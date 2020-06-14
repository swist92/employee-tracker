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
    frontAction();
});

function frontAction() {
    inquirer.prompt(frontPrompt)
        .then(function (answer) {
            executeFunctions(answer.action);
        });
}

const frontPrompt = {
    type: 'list',
    name: 'action',
    message: "What would you like to do?",
    choices: [
        "View All Employees",
        "View All Departments",
        "View All Roles",
        "Add Employee",
        "Update Employee Role",
        "Update Employee Manager",
        "Add Department",
        "Add Role",
    ]
};

function executeFunctions(action) {
    switch (action) {
        case "View All Employees":
            viewTable("employee");
            break;

        case "View All Departments":
            viewTable("department");
            break;

        case "View All Roles":
            viewTable("role");
            break;

        case "Add Employee":
            addEmployee();
            break;

        case "Update Employee Role":
            updateEmployeeRole();
            break;

        case "Update Employee Manager":
            updateEmployeeManager();
            break;

        case "Add Department":
            addDepartment();
            break;

        case "Add Role":
            addRole();
            break;
    }
}

function viewTable(name) {
    let queryEmployee = "select e.id, e.first_name, e.last_name, role.title, department.name as \"department\", role.salary, concat(m.first_name,\" \",m.last_name) as \"manager\" from employee as e left join employee as m on m.id=e.manager_id inner join role on e.role_id=role.id inner join department on role.department_id=department.id";
    let queryDepartment = "select * from department";
    let queryRole = "select role.id, role.title, role.salary, department.name from role inner join department on role.department_id=department.id";
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
        frontAction();
    });
};

function addEmployee() {
    let roleList = [];
    let managerList = ["None"];

    connection.query("select title from role", function (err, res) {
        for (var i = 0; i < res.length; i++) {
            roleList.push(res[i].title);
        }
    });
    connection.query("select first_name, last_name from employee", function (err, res) {
        for (var i = 0; i < res.length; i++) {
            managerList.push(res[i].first_name + " " + res[i].last_name);
        }
        addEmployeeSupp(roleList, managerList);
    });
};

async function addEmployeeSupp(roleList, managerList) {
    const answer = await inquirer.prompt([{
        name: "firstName",
        type: "input",
        message: "What is the employee's first name?"
    },
    {
        name: "lastName",
        type: "input",
        message: "What is the employee's last name?"
    },
    {
        name: "role",
        type: "list",
        message: "What is the employee's role?",
        choices: roleList
    },
    {
        name: "manager",
        type: "list",
        message: "Who is this employee's manager?",
        choices: managerList
    },
    ]);
    if (answer.manager == "None") {
        const manager = null;
        let query = "insert into employee (first_name, last_name, role_id, manager_id) values (?,?,(select id from role where title =?), null)";
        connection.query(query, [answer.firstName, answer.lastName, answer.role], function (err, res) {
            if (err) throw err;
            frontAction();
        });
    } else {
        const manager = answer.manager.split(" ");
        let query = "insert into employee (first_name, last_name, role_id, manager_id) values (?,?,(select id from role where title=?), (select id from ( select * from employee) as t where first_name = ? and last_name = ? ))";
        connection.query(query, [answer.firstName, answer.lastName, answer.role, manager[0], manager[1]], function (err, res) {
            if (err) throw err;
            frontAction();
        });
    }
}


function updateEmployeeManager() {
    const employeeList = [];
    connection.query("select first_name, last_name from employee", function (err, res) {
        for (var i = 0; i < res.length; i++) {
            employeeList.push(res[i].first_name + " " + res[i].last_name);
        }
        updateEmployeeManagerSupp(employeeList);
    });
};

async function updateEmployeeManagerSupp(employeeList) {
    let answer = await inquirer.prompt([{
        name: "employee",
        type: "list",
        message: "Which employee do you want to update?",
        choices: employeeList
    },
    {
        name: "manager",
        type: "list",
        message: "Who is this employee's manager?",
        choices: employeeList
    }
    ]);
    const employee = answer.employee.split(" ");
    const manager = answer.manager.split(" ");

    let query = "update employee set manager_id = (select id from ( select * from employee) as t where first_name =? and last_name=?) where first_name=? and last_name=?"
    connection.query(query, [manager[0], manager[1], employee[0], employee[1]], function (err, res) {
        if (err) throw err;
        frontAction();
    });
};

function updateEmployeeRole() {
    let employeeList = [];
    let roleList = [];
    connection.query("select title from role", function (err, res) {
        for (var i = 0; i < res.length; i++) {
            roleList.push(res[i].title);
        }
    });
    connection.query("select first_name, last_name from employee", function (err, res) {
        for (var i = 0; i < res.length; i++) {
            employeeList.push(res[i].first_name + " " + res[i].last_name);
        }
        updateEmployeeRoleSupp(employeeList, roleList);
    });
}

async function updateEmployeeRoleSupp(employeeList, roleList) {
    let answer = await inquirer.prompt([{
        name: "employee",
        type: "list",
        message: "Which employee do you want to update?",
        choices: employeeList
    },
    {
        name: "role",
        type: "list",
        message: "What is this employee's role?",
        choices: roleList
    }
    ]);
    let employee = answer.employee.split(" ");
    let query = "update employee set role_id = (select id from role where title =?)  where first_name=? and last_name=?";
    connection.query(query, [answer.role, employee[0], employee[1]], function (err, res) {
        frontAction();
    })
}

function addDepartment() {
    inquirer.prompt({
        name: "name",
        type: "input",
        message: "What is the department you would like to add?"
    })
        .then(function (answer) {
            let value = [
                [answer.name]
            ];
            connection.query("insert into department (name) values ?", [value], function (err, res) {
                frontAction();
            });
        });
};

function addRole() {
    let departmentList = [];
    connection.query("select name from department", function (err, res) {
        for (var i = 0; i < res.length; i++) {
            departmentList.push(res[i].name);
        }
        addRoleSupp(departmentList);
    })
};

async function addRoleSupp(departmentList) {
    const answer = await inquirer.prompt([{
        name: "department",
        type: "list",
        message: "Which department is this role under?",
        choices: departmentList
    },
    {
        name: "title",
        type: "input",
        message: "What is the title of this role?"
    },
    {
        name: "salary",
        type: "input",
        message: "What is the salary of this role?"
    }
    ]);
    let finalQuery = "insert into role (title,salary,department_id) value (?,?, (select id from department where name=?))";
    connection.query(finalQuery, [answer.title, parseInt(answer.salary), answer.department], function (err, res) {
        if (err) throw err;
        frontAction();
    });
}