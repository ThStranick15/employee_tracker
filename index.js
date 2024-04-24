const inquirer = require('inquirer')
const table = require('console.table')
//const {getEmployees} = require('./queries.js')

const {Client} = require('pg')
const client = new Client({
    host: 'localhost',
    user: 'postgres',
    password:'pass',
    database: 'employee_tracker'
})

async function getUserInput(){
    const prompt = await inquirer.prompt([
        {
            name:'action',
            type:'list',
            message:'What would you like to do?',
            choices: ['View All Employees','Add Employee','Update Employee Role','View All Roles','Add Role','View All Departments','Add Department','Quit']
        }
    ])
    return prompt
}

async function processRequest(prompt){
    const promptInput = prompt
    console.log(promptInput.action)
    const roleChoices = await getRoles() //gets current role choices
    const employeeChoices = await getEmployees() //gets current employees
    const deptChoices = await getDepartments() //gets current department choices

    switch (promptInput.action){
        case 'View All Employees':
            const employees = await client.query(`SELECT e.id, e.first_name, e.last_name, r.title,d.name AS department, r.salary, e2.first_name || ' ' || e2.last_name AS manager
            FROM employee AS e 
            JOIN role AS r ON e.role_id = r.id 
            JOIN department AS d ON r.department = d.id 
            LEFT JOIN employee AS e2 ON e.manager_id = e2.id `) //completes JOINs on all tables to combine info
            console.table(employees.rows)
            getUserInput()
            .then(processRequest)
        break;
        case 'View All Roles':
            const roles = await client.query('SELECT r.id, r.title, r.salary, d.name AS department FROM role AS r JOIN department AS d ON r.department = d.id')
            console.table(roles.rows)
            getUserInput()
            .then(processRequest)
        break;
        case 'View All Departments':
            const departments = await client.query('SELECT * FROM department')
            console.table(departments.rows)
            getUserInput()
            .then(processRequest)
        break;
        case 'Add Employee':
            const employeePrompt = await inquirer.prompt([
                {
                    name:'first_name',
                    type:'text',
                    message:'First Name:'
                },
                {
                    name:'last_name',
                    type:'text',
                    message:'Last Name:'
                },
                {
                    name:'role',
                    type:'list',
                    message:'Role:',
                    choices: roleChoices
                },
                {
                    name:'manager',
                    type:'list',
                    message:'Manager:',
                    choices: employeeChoices
                }
            ])
            const role = await client.query('SELECT id FROM role WHERE title = ($1)', [employeePrompt.role])
            const roleID =  role.rows[0].id //get the role ID of the selected role
            const splitName = employeePrompt.manager.split(" ")
            const first = splitName[0] //get the first name from the concat
            const firstID = await client.query('SELECT id from employee WHERE first_name = ($1)', [first])
            await client.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1,$2, $3, $4)',
            [employeePrompt.first_name, employeePrompt.last_name, roleID, firstID.rows[0].id]) //insert the new employee
            console.log('Added', employeePrompt.first_name, employeePrompt.last_name, 'to the database.')
            getUserInput()
            .then(processRequest)
        break;
        case 'Add Role':
            const rolePrompt = await inquirer.prompt([
                {
                    name: 'title',
                    type: 'text',
                    message: 'New Role Title:'
                },
                {
                    name: 'salary',
                    type: 'number',
                    message: 'Salary:'
                },
                {
                    name: 'department',
                    type: 'list',
                    message: 'Department:',
                    choices: deptChoices
                }
            ])
            const deptIDQuery = await client.query('SELECT id FROM department WHERE name = ($1)', [rolePrompt.department])
            const deptID =  deptIDQuery.rows[0].id //finds department id from name
            await client.query('INSERT INTO role (title, salary, department) VALUES ($1, $2, $3)', [rolePrompt.title, rolePrompt.salary, deptID])
            console.log('Added', rolePrompt.title, 'to the database.')
            getUserInput()
            .then(processRequest)
        break;
        case 'Add Department':
            const deptPrompt = await inquirer.prompt([
                {
                    name: 'title',
                    type:'text',
                    message:'New Department Title:'
                }
            ])
            await client.query('INSERT INTO department (name) VALUES ($1)', [deptPrompt.title])
            console.log('Added', deptPrompt.title, 'to the database.')
            getUserInput()
            .then(processRequest)
        break;
        case 'Update Employee Role':
            const updatePrompt = await inquirer.prompt([
                {
                    name: 'employee',
                    type:'list',
                    message:'Employee to change:',
                    choices: employeeChoices
                },
                {
                    name: 'newRole',
                    type:'list',
                    message:'New Employee Role:',
                    choices: roleChoices
                }
            ])
            const split = updatePrompt.employee.split(" ")
            const firstName = split[0]
            const firstNameID = await client.query('SELECT id from employee WHERE first_name = ($1)', [firstName]) //gets id of employee from first name
            const roleIDQuery = await client.query('SELECT id FROM role WHERE title = ($1)', [updatePrompt.newRole]) //gets id of role from title
            await client.query('UPDATE employee SET role_id = ($1) WHERE id = ($2)',[roleIDQuery.rows[0].id, firstNameID.rows[0].id])
            console.log('Updated employee role.')
            getUserInput()
            .then(processRequest)
        break;
        default:
            process.exit()
    }
}

async function getRoles(){
    const currentRoles = await client.query('SELECT title FROM role')
    const roleChoices = currentRoles.rows.map(row => row.title)
    return roleChoices
}

async function getEmployees(){
    const currentManagers = await client.query(`SELECT first_name || ' ' || last_name AS name FROM employee`)
    const managerChoices = currentManagers.rows.map(row => row.name)
    return managerChoices
}

async function getDepartments(){
    const currentDepts = await client.query(`SELECT name FROM department`)
    const deptChoices = currentDepts.rows.map(row => row.name)
    return deptChoices
}

async function run(){
    await client.connect()
    .then(getUserInput)
    .then(processRequest)
    .catch ((err) =>{
        console.log(err)
    })
}

run()


