# 📌 Price Tracking Application – Features Document

## 🔹 Overview

The **Price Tracking Application** is a full-stack web solution built with **Django REST Framework (backend)** and **React (frontend)**.
It enables users to browse products, track their prices, and receive alerts when prices drop.
Admins can manage products, tracked items, and monitor user activities through a dedicated dashboard.

---

## 🔹 Core Modules

### 🟢 **User-Side Features**

* **Authentication**

  * User registration
  * Secure login with JWT tokens
  * Logout functionality

* **Product Management**

  * Browse all available products
  * Search functionality for quick product lookup
  * Product detail view

* **Tracking**

  * Add products to personal “Tracked List”
  * Remove products from tracking
  * View and manage tracked products

* **Price History**

  * Visualize historical product price trends (graph/table)

* **Notifications**

  * Email or in-app alerts for price drops
  * Set custom price thresholds for alerts

---

### 🔵 **Admin-Side Features**

* **Authentication**

  * Secure admin login

* **Dashboard**

  * Sidebar navigation for quick access
  * **Statistics:**

    * Total Products
    * Total Tracked Items
    * Total Users

* **Management Panels**

  * **Products:** View and manage all products
  * **Tracked Products:** Monitor all user-tracked items
  * **Price History:** Detailed view of product price changes
  * **Users:** Manage user accounts (view, activate/deactivate)

---

### ⚙️ **Backend (Django REST API)**

* **Products API** – CRUD operations
* **Tracked Products API** – user-specific tracked items
* **Price History API** – store & fetch price updates
* **User API** – authentication & profile management
* **Admin API** – stats and admin-only operations

---

### 🤖 **Automation & Advanced Features**

* **Web Scraping**

  * Automated fetching of the latest product prices
  * Data stored into the price history database

* **Scheduler**

  * Background jobs (via Celery/cron) to update prices periodically

* **Notification System**

  * Email alerts for price changes
  * Optional SMS/push notification integration

---

## 🔹 Tech Stack

* **Frontend:** React, TailwindCSS, JWT auth
* **Backend:** Django, Django REST Framework
* **Database:** PostgreSQL / SQLite (dev)
* **Background Tasks:** Celery / Cron jobs
* **Notifications:** SMTP (email)

---

## 🔹 Future Enhancements (Optional)

* Multi-currency support
* Browser extension for quick tracking
* AI-based price prediction
* Mobile app integration

---
Credit
