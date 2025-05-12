Features
========

PrepPal is designed to support users in every aspect of meal planning and recipe organisation. Below is an in-depth overview of the features currently available, as well as upcoming improvements to enhance your experience.

Core Features
-------------

**1. User Accounts**
~~~~~~~~~~~~~~~~~~~~

- **Sign Up and Sign In**: Users can create an account using a unique username and email address. Upon signing in, session storage is used to maintain login state.
- **Persistent Sessions**: User information is stored temporarily in sessionStorage to allow for personalisation and recipe ownership.

**2. Recipe Management**
~~~~~~~~~~~~~~~~~~~~~~~~

- **Create Recipes**:
  - Users can add new recipes using an intuitive form interface.
  - Required fields include recipe name, description, instructions, estimated preparation time (in minutes), and ingredients with quantities.

- **Edit Recipes**:
  - Inline editing is enabled by clicking the “Edit” button on any recipe card.
  - Once in edit mode, users can update any field and save changes with the “Save” button.

- **Delete Recipes**:
  - Recipes can be permanently removed using the “Delete” button.
  - Confirmation is requested to prevent accidental deletions.

- **Storage and Retrieval**:
  - Recipes are stored in an SQLite database and retrieved via a Node.js/Express backend.
  - Only the logged-in user's recipes are shown, ensuring privacy.

**3. Ingredient Handling**
~~~~~~~~~~~~~~~~~~~~~~~~~~

- Ingredients are not simply listed as text, but are stored and displayed with both name and quantity (e.g., “Yoghurt - 100g”, “Strawberries - 50g”).
- Users can add multiple ingredients to a recipe using dynamic form fields.
- Ingredients are displayed clearly both in view and edit modes, supporting transparency in meal preparation.

**4. Dashboard View**
~~~~~~~~~~~~~~~~~~~~~

- The dashboard acts as a hub where users can:
  - View a list of all their recipes.
  - Navigate to create a new recipe or return to the dashboard from any page.
- Each recipe is shown as a “card”, presenting key details at a glance.

User Interface Features
-----------------------

**Responsive Design**
~~~~~~~~~~~~~~~~~~~~~

- The app is built with a responsive layout, ensuring accessibility on both desktop and mobile devices.
- Styling is handled through CSS, with consistent fonts, spacing, and visual hierarchy for readability.

**User Feedback and Validation**
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

- Form inputs include validation to prevent submission of empty or invalid data.
- Console logs and visual messages provide users with success or error feedback after actions like login, sign up, and recipe submission.

Planned Improvements
--------------------

**1. Weekly Meal Planner**
~~~~~~~~~~~~~~~~~~~~~~~~~~

- Users will be able to drag and drop recipes into a weekly calendar to plan meals.
- The calendar will allow easy viewing of what’s planned for each day.

**2. Public Recipe Sharing**
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

- Users will be able to publish recipes for others to see.
- A public recipe library will enable browsing and discovery of new ideas.

**3. Tags and Filtering**
~~~~~~~~~~~~~~~~~~~~~~~~~

- Recipes will support custom tags (e.g., “Vegan”, “Gluten-Free”, “Dinner”).
- Filters and search functionality will allow quick access to specific types of meals.

**4. Nutritional Insights**
~~~~~~~~~~~~~~~~~~~~~~~~~~~

- Integration with nutrition APIs to provide calories, macronutrient breakdown, and allergen information.

PrepPal is a growing platform built with the needs of real users in mind. Every feature aims to simplify the process of planning, preparing, and managing meals.

