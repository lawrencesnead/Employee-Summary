const inquirer = require("inquirer");
const fs = require('fs-extra');
const hbs = require('handlebars')
const path = require('path');

const Manager = require("./lib/Manager");
const Engineer = require("./lib/Engineer");
const Intern = require("./lib/Intern");

let employees = [];
let employee;
let filePath;
let mainHTML;

const compileEmployeeCard = async function (data) {
    const html = await fs.readFile(filePath, 'utf-8');
    return hbs.compile(html)(data);
};

const generateEmployee = async function () {
    await inquirer
        .prompt([{
            message: "Enter Employee Name:",
            name: "name"
        },
        {
            message: "Enter Employee ID:",
            name: "id"
        },
        {
            message: "Enter Employee Email:",
            name: "email"
        },
        {
            message: "Type of Employee(m for manager, e for engineer, i for intern):",
            name: "role"
        },
        {
            message: "Enter Office Number for Manager:",
            name: "officeNumber",
            when: function (answers) {
                return answers.role === "m"
            }
        },
        {
            message: "Enter GitHub Username for Engineer:",
            name: "github",
            when: function (answers) {
                return answers.role === "e"
            }
        },
        {
            message: "Enter School for Intern:",
            name: "school",
            when: function (answers) {
                return answers.role === "i"
            }
        }
    
        ])
        .then(async function ({ name, id, email, role, officeNumber, github, school }) {
            switch (role) {
                case 'm':
                    employee = new Manager(name, id, email, officeNumber);
                    filePath = path.join(process.cwd(), 'templates', `Manager.hbs`);
                    break;
                case 'e':
                    employee = new Engineer(name, id, email, github);
                    filePath = path.join(process.cwd(), 'templates', `Engineer.hbs`);
                    break;
                case 'i':
                    employee = new Intern(name, id, email, school);
                    filePath = path.join(process.cwd(), 'templates', `Intern.hbs`);
                    break;
            }
            employees.push(await compileEmployeeCard(employee));
            console.log(employees);
            
        });
}

inquirer
    .prompt([{
        message: "How many employees? (max: 6)",
        name: "total",
        default: 1
    }])
    .then(async function ({ total }) {
        for (var i = 0; i < total; i++) {
            await generateEmployee();
        }
        main();
    });

const main = async function () {
    mainHTML = await fs.readFile(path.join(process.cwd(), 'templates', `main.html`), "utf-8");
    let data = mainHTML + employees + "\n</div>\n</div>\n</body>";
    fs.writeFile("team.html", data, (err) => {
        if (err) throw err;
        console.log('done');
    })
}

            