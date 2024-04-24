const router = require('express').Router()
const db = require('index.js')

// router.get('/view_employees', async (req,res) =>{
//     const allEmployees = await db.query('SELECT * FROM employee')
//     res.send(allEmployees)
// })

// module.exports = router

async function getEmployees(){
    const allEmployees = await db.query('SELECT * FROM employee')
    return allEmployees
}

module.exports = {getEmployees}