const inquirer = require('inquirer')
const {Client} = require('pg')
const client = new Client()

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

