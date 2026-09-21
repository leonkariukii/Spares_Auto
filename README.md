pd# 🚗 Spares_Auto

> A modern, responsive automotive spare-parts product showcase designed to provide customers with a simple, engaging, and user-friendly online shopping experience.

---

## 📖 Project Overview

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
- Cross-browser Compatibility
- Git and GitHub

The project is currently focused on the **frontend user interface**. Backend functionality, authentication, payment processing, inventory management, and database integration can be added in future versions.

---

## 🎯 Project Objectives

The main objectives of AutoSpares Shop are to:

- Build a professional automotive e-commerce interface.
- Create a responsive product catalogue.
- Use CSS Grid for product layout.
- Create reusable product cards.
- Implement product hover effects.
- Create a product-detail modal.
- Design a shopping-cart sidebar.
- Provide filter and sorting interfaces.
- Implement dark mode.
- Maintain a consistent design system.
- Apply accessibility principles.
- Optimize the website for performance.
- Test the website across modern browsers and devices.
- Practice Git-based development and collaboration.

---

## ✨ Features

### 🛍️ Product Catalogue

The application displays automotive spare parts using a responsive product grid.

Each product card includes:

- Product image
- Product name
- Product description
- Product price
- Rating stars
- Add-to-cart button
- Product details action

The product grid is built using **CSS Grid** and automatically adapts to different screen sizes.

---

### 🔎 Filter and Sort Interface

The product catalogue includes a user interface for filtering and sorting products.

Available options include:

- Product category
- Price range
- Rating
- Availability
- Price: Low to High
- Price: High to Low
- Popularity
- Newest products

> **Note:** The current implementation focuses on the UI. Functional filtering and sorting logic can be implemented in a future version.

---

### 📦 Product Detail Modal

Users can select a product to view additional information in a product-detail modal.

The modal can contain:

- Product image
- Product name
- Product price
- Rating
- Product description
- Vehicle compatibility
- Availability
- Add-to-cart button

The modal allows users to inspect products without leaving the main catalogue.

---

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

---

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

---

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

---

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

---

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

---

### 🖨️ Print Stylesheet

A dedicated print stylesheet is included for product information.

Unnecessary interactive elements can be hidden when printing, including:

- Navigation
- Shopping cart controls
- Filter controls
- Interactive buttons

This allows important product information to remain readable on printed pages.

---

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

---

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

---

# 📂 Project Structure

```text
autospares-shop/
│
├── index.html
│
├── css/
│   ├── style.css
│   ├── responsive.css
│   └── print.css
│
├── images/
│   ├── products/
│   │   ├── brake-pads.jpg
│   │   ├── oil-filter.jpg
│   │   ├── air-filter.jpg
│   │   ├── spark-plugs.jpg
│   │   ├── car-battery.jpg
│   │   ├── engine-belt.jpg
│   │   ├── headlights.jpg
│   │   └── shock-absorber.jpg
│   │
│   └── logo/
│       └── logo.png
│
├── assets/
│   └── icons/
│
├── pages/
│   └── product.html
│
├── README.md
│
└── LICENSE