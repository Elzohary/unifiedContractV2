1. Database Configuration: SQL Server

2. API Authentication:
    - JWT authentication.
    - roles/permissions to implement: 'administrator' | 'engineer' | 'foreman' | 'worker' | 'client' | 'coordinator'

3. Specific Business Requirements:
    - 

4. Create Domain Models for:
    - Work Order with all related entities: 
        - Details
        - Tasks
        - Items //("Items" are list of items each one describes an activity has been done at the site)
        - Manpower //(it's a list of all the people assigned to the work order, it's important to track all the people assigned to this work order and knowing the number of days they worked on this work order will be included in the expenses calculation).
        - Equipment ////(it's a list of all the Equipment assigned to the work order, it's important to track all the Equipment assigned to this work order and knowing the number of days they worked on this work order will be included in the expenses calculation).
        - 
