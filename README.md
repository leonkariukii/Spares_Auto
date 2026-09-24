## Spares_Auto

A modern, responsive automotive spare-parts product showcase designed to provide customers with a simple, engaging, and user-friendly online shopping experience.

##  Project Overview

**Spares_Auto** is a responsive frontend product showcase for an online automotive spare-parts store.

The project focuses on creating a professional e-commerce interface where customers can browse automotive spare parts, view product information, interact with product cards, explore filtering and sorting options, and access a shopping cart interface.

The project was developed to demonstrate practical skills in:

- HTML5
- CSS3
- CSS Grid
- Flexbox
- Responsive Web Design
- CSS Custom Properties
- Dark Mode
- Accessibility
- UI/UX Design
- Micro-interactions
- Performance Optimization
Spares_Auto is a responsive automotive spare-parts storefront built with HTML, CSS, JavaScript, and a lightweight Express backend. The project evolved from a static product catalogue into a working e-commerce-style experience with a shopping cart, login flow, protected checkout, and polished user feedback.
- Git and GitHub

The project is currently focused on the **frontend user interface**. Backend functionality, authentication, payment processing, inventory management, and database integration can be added in future versions.
This project now includes a complete front-end customer journey for a spare-parts retailer:
## 🎯 Project Objectives
- Product gallery with automotive parts such as brake pads, oil filters, spark plugs, and air filters
- Search and category filtering
- Brand and category pill filters
- Sort options for price and product name
- Add-to-cart interactions with live cart totals
- Cart drawer with quantity updates and item removal
- Checkout flow protected by authentication
- Login modal and mock user session system
- Order confirmation panel after successful checkout
- Responsive layout that works across desktop, tablet, and mobile screens
- Toast notifications and success/error states for user feedback

The main objectives of AutoSpares Shop are to:

The application was designed to demonstrate a realistic storefront experience for a small automotive parts business. The goal was to combine visual design with working interactivity so the site feels like a usable shop rather than a static mockup.
- Create a responsive product catalogue.
- Use CSS Grid for product layout.
- Create reusable product cards.
- Implement product hover effects.
- Create a product-detail modal.
The product catalogue is rendered dynamically from app state and product data. Each item includes a name, description, price, stock status, and image. Product cards support both quick view and add-to-cart actions.
- Provide filter and sorting interfaces.
- Implement dark mode.
- Maintain a consistent design system.
Users can add products to the cart, see the count update in the navigation, and review items in a slide-out cart panel. Each cart item can be removed individually and totals are recalculated automatically.
- Optimize the website for performance.
- Test the website across modern browsers and devices.
- Practice Git-based development and collaboration.
The app includes a login modal with email and password validation. A mock backend authentication system verifies credentials and issues a token for the session. This token is stored locally and used to protect the checkout route.
## ✨ Features

### 🛍️ Product Catalogue
Checkout is only allowed when a user is logged in. The backend validates the Bearer token and confirms the cart before creating an order. Once the order is successful, the cart is cleared and a success summary is displayed to the customer.
The application displays automotive spare parts using a responsive product grid.

Each product card includes:
After checkout, the user sees a confirmation section with:
- Product image
- generated order ID
- order items summary
- final total
- continue shopping option
- Product name
- Product description
- Product price
The interface includes:
- Add-to-cart button
- responsive layout styling
- hover states and micro-interactions
- modal components for product details and login
- toast messages for state changes
- subtle success/error feedback patterns
- Product details action

The product grid is built using **CSS Grid** and automatically adapts to different screen sizes.
The project focuses on:

- clean storefront UI
- customer-friendly product browsing
- interactive cart behaviour
- secure-feeling checkout flow
- a lightweight backend API for mock commerce operations
### 🔎 Filter and Sort Interface

The product catalogue includes a user interface for filtering and sorting products.
1. Open a terminal in the project root.
2. Install the dependencies:
Available options include:
	npm install

3. Start the backend server:
- Product category
	node backend/server.js
- Price range
4. If you want to use a custom port, for example 3210:
- Rating
	Windows PowerShell:
	$env:PORT = 3210; node backend/server.js
- Availability
	Bash/macOS/Linux:
	PORT=3210 node backend/server.js
- Price: Low to High
5. Open the app in the browser at:
- Price: High to Low
	http://localhost:3000
- Popularity
	or the custom port you selected, such as:
- Newest products
	http://localhost:3210

> **Note:** The current implementation focuses on the UI. Functional filtering and sorting logic can be implemented in a future version.


### 📦 Product Detail Modal
The Express server exposes the following endpoints:
Users can select a product to view additional information in a product-detail modal.
- GET /api/products — returns the available product list
- POST /api/login — authenticates a user and returns a token
- GET /api/me — returns the authenticated user profile
- POST /api/checkout — validates a cart and creates an order for an authenticated user

The modal can contain:

The current implementation was tested for the key storefront flows:
- Product name
- product loading
- cart updates
- login success and failure states
- authenticated checkout
- order creation
- success UI rendering
- Product price
- Rating
- Product description
Potential improvements for the next phase include:
- Availability
- real database storage for products and users
- secure password hashing
- persistent carts and sessions
- payment integration
- inventory management dashboard
- admin panel for stock updates
- order history page
- user registration and password reset
- Add-to-cart button

The modal allows users to inspect products without leaving the main catalogue.
Spares_Auto has evolved from a design-focused product showcase into a functioning e-commerce prototype with customer interaction, login-based checkout, and a working backend API. It now demonstrates a much more complete view of what a modern automotive spare-parts shop could look like in a real implementation.
### 🛒 Shopping Cart Sidebar

The project includes a static shopping-cart sidebar.

The cart interface contains:

- Product thumbnail
- Product name
- Quantity
- Product price
- Remove button
- Subtotal
- Checkout button

> **Note:** The current cart is a frontend UI demonstration and does not process real payments or orders.

### 📱 Responsive Design

AutoSpares Shop is designed to work across different screen sizes.

#### Desktop

- Multi-column product grid
- Full navigation
- Large product images
- Expanded content layout
- Shopping cart sidebar

#### Tablet

- Responsive product grid
- Adjusted spacing
- Flexible navigation
- Optimized product cards

#### Mobile

- Compact navigation
- One or two-column product layout
- Touch-friendly controls
- Responsive product modal
- Mobile-friendly shopping cart

### 🌙 Dark Mode

The project includes a dark-mode interface.

Dark mode uses **CSS Custom Properties** to manage theme colours consistently across the application.

The theme controls:

- Page background
- Text colours
- Product cards
- Navigation
- Borders
- Buttons
- Sections

### ♿ Accessibility

Accessibility is considered throughout the project.

The interface focuses on:

- Semantic HTML
- Accessible colour contrast
- Descriptive image `alt` attributes
- Clear button labels
- Keyboard-friendly interactions
- Visible focus states
- Readable typography
- Touch-friendly controls

### ✨ Micro-interactions

The interface uses subtle transitions and animations to improve user experience.

Examples include:

- Product card hover effects
- Button hover states
- Product image scaling
- Smooth transitions
- Modal animations
- Cart sidebar transitions
- Loading animations
- Navigation interactions
- Focus states

Animations are kept lightweight to maintain good performance.

### 🖨️ Print Stylesheet

A dedicated print stylesheet is included for product information.

Unnecessary interactive elements can be hidden when printing, including:

- Navigation
- Shopping cart controls
- Filter controls
- Interactive buttons

This allows important product information to remain readable on printed pages.

# 🛠️ Technologies Used

| Technology | Purpose |
| --- | --- |
| HTML5 | Semantic page structure |
| CSS3 | Styling and visual presentation |
| CSS Grid | Product catalogue layout |
| Flexbox | Component alignment |
| CSS Custom Properties | Theme and design system |
| Media Queries | Responsive design |
| CSS Transitions | Micro-interactions |
| CSS Animations | Interface animations |
| Git | Version control |
| GitHub | Repository hosting |
| VS Code | Development environment |
| Chrome DevTools | Testing and debugging |
| Lighthouse | Performance and accessibility auditing |

# 🏪 Product Categories

The initial product catalogue focuses on common automotive spare parts:

1. Brake Pads
2. Oil Filters
3. Air Filters
4. Spark Plugs
5. Car Batteries
6. Engine Belts
7. Headlights
8. Shock Absorbers

The product catalogue can be expanded as the project develops.

