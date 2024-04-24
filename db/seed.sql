INSERT INTO department (name)
VALUES
    ('Sales'),
    ('Engineering'),
    ('Legal'),
    ('Finance');

INSERT INTO role (title, salary, department)
VALUES
    ('Salesperson', 80000, 1),
    ('Sales Lead', 100000, 1),
    ('Lead Engineer', 150000, 2),
    ('Engineer', 100000, 2),
    ('Lawyer', 2500000, 3),
    ('Legal Team Lead', 150000, 3),
    ('Accountant', 110000, 4),
    ('Account Manager', 150000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ('John', 'Doe', 2, null),
    ('Mike','Chan', 1, 1),
    ('Ashley', 'Rodriguez', 3, null),
    ('Kevin','Tupik', 4, 3),
    ('Kunal','Singh', 8, null),
    ('Malia', 'Brown', 7, 5),
    ('Sarah', 'Lourd', 6, null),
    ('Tom', 'Allen', 5, 7);

