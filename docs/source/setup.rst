Setup Guide for PrepPal
========================

This guide will help you set up and run the PrepPal application locally.

Prerequisites
-------------

Before setting up PrepPal, ensure you have the following installed:

- **Node.js** (v18 or later)
- **npm** (comes with Node.js)
- **SQLite** (or use the bundled SQLite database file)
- **Git** (optional, for cloning the repository)

Clone the Repository
--------------------

If you haven't already, clone the PrepPal repository from GitHub:

.. code-block:: bash

    git clone https://github.com/UoP-PrepPal/PrepPal

Install Dependencies
--------------------

Run the following command in the project root to install the required packages:

.. code-block:: bash

    npm install

Set Up the Database
-------------------

PrepPal uses SQLite for data storage.

1. If a database file (`database.sqlite`) is already included in the db folder, you can skip this step.
2. Otherwise, initialise the database by running:

.. code-block:: bash

    Get-Content database.sql | sqlite3 db/database.sqlite  

(This script will create the necessary tables for users, recipes and ingredients.)

Start the Server
----------------

To start the server:

.. code-block:: bash

    npm start

By default, the server runs on **http://localhost:8080**. You should see a message confirming the server has started.

Access the App
--------------

Open your browser and go to:

.. code-block:: text

    http://localhost:8080

You can now register an account, create recipes, and begin using PrepPal.

Environment Configuration (Optional)
------------------------------------

If needed, create a `.env` file in the root directory to configure environment variables:

You should include the following in your `.env` file:

SESSION_SECRET = your-personal-secret-key

Troubleshooting
---------------

- **Port already in use**: Change the `PORT` value in `.env` or terminate the process using that port.
- **Database errors**: Ensure the `database.sqlite` file exists and the schema is correct.
- **Missing dependencies**: Run `npm install` again to ensure all modules are installed.

Need Help?
----------

If you encounter issues, feel free to open an issue on the GitHub repository or contact the maintainer.

Happy prepping with PrepPal!
