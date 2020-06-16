# employee-tracker

*GIFS IN ASSESTS FOLDER*

The objective of this homework assignment was to build an employee tracker for use by a company that needs a visualization of their employees and the ability to update them, as well.  For this, we utilized a command line application and MySQL.  We have created CLI applications in previous homework, but for this assignment, we are now using MySQL to not only hold all of our employee data, but display it in tables that are accessible to view via the command line.

This build was tricky in many places, particularly in the mixing of switch cases and async functions.  Within our async functions, we also utilized if and else statements, along with the await prompts.  As there are many possible choices the user needs to make, there are several functions needed to reflect those choices.  Companies are multilayered organizations with multiple departments, several managers, with upwards of thousands of employee.  An employee may be hired in one department, switch to another, change roles within that department, and/or become a manager.  All of these possibilities are reflected in the functions to add an employee, add a department, add a role, and update an employee.  This excludes the simpler function of viewing employees, departments, and roles in separate tables.

This application is very similar to what corporations large and small already deploy to manage their employee databases.  From this foundation, additional functionality can be added to the app, such as viewing a single department's employees or deleting an employee, department, or role from the database.  As we move on into careers with various-sized companies, we will eventually be a part of or work with such applications, so it is important to be familiarized with them.

*GIFS IN ASSESTS FOLDER*
