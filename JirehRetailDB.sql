-- Create database
CREATE DATABASE IF NOT EXISTS jireh_retail_db;
USE jireh_retail_db; 
SET GLOBAL event_scheduler = ON;

-- Create BUSINESS_OWNER table
CREATE TABLE business_owner (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    user_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES business(id),
    FOREIGN KEY (user_id) REFERENCES user(id),
    UNIQUE KEY unique_business_owner (business_id, user_id)
);

-- Update BUSINESS table to refer to user table for owners
CREATE TABLE business (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Modify USER table to include owner role
CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    branch_id INT,
    fullname VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_role ENUM('owner', 'manager', 'admin', 'sales', 'warehouse') NOT NULL,
    is_active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMP NULL,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branch(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create PLAN table
CREATE TABLE plan (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name_en VARCHAR(100) NOT NULL,
    name_am VARCHAR(100) NOT NULL,
    monthly_price DECIMAL(10, 2) CHECK (monthly_price >= 0),
    yearly_price DECIMAL(10, 2) CHECK (yearly_price >= 0),
    duration INT NOT NULL CHECK (duration > 0),
    description_en TEXT,
    description_am TEXT,
    is_active BOOLEAN DEFAULT true,
    is_hidden BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create FEATURE table
CREATE TABLE feature (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plan_id INT NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    title_am VARCHAR(255) NOT NULL,
    included BOOLEAN DEFAULT false,
    FOREIGN KEY (plan_id) REFERENCES plan(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create SUBSCRIPTION table
CREATE TABLE subscription (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    plan_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    payment_status ENUM('PENDING', 'PAID', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    subscription_status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'INACTIVE',
    last_payment_date DATETIME,
    next_billing_date DATETIME NOT NULL,
    retry_count INT DEFAULT 0,
    last_retry_date DATETIME,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plan(id) ON DELETE RESTRICT
);

-- Create BRANCH table
CREATE TABLE branch (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES business(id)
);

-- Create EXPENSE table
CREATE TABLE expense (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    branch_id INT NOT NULL,
    category_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    expense_date DATE NOT NULL,
    payment_method ENUM('Cash', 'Telebirr', 'Bank Transfer', 'Credit') NOT NULL,
    recurring_frequency ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly'), 
    recurring_end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branch(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (created_by) REFERENCES user(id)
);

-- Create CATEGORY table
CREATE TABLE category (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create ITEM table
CREATE TABLE item (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    branch_id INT NOT NULL,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    quantity INT NOT NULL DEFAULT 0,
    unit_of_measure ENUM('pieces', 'kg', 'g', 'L', 'ml', 'm', 'box', 'pack') NULL, -- Made nullable
    last_inventory_update DATETIME,
    is_active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES business(id),
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE INDEX idx_unique_item_name_per_business (business_id, name, deleted_at)
);

-- Create ORDER table
CREATE TABLE `order` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    branch_id INT NOT NULL,
    user_id INT NOT NULL,
    order_number VARCHAR(30) UNIQUE NOT NULL,
    
    -- Customer information
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(100),
    
    -- Order status and timing
    order_date DATETIME NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    
    -- Financial information
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    
    -- Payment information
    payment_status ENUM('pending', 'paid', 'cancelled') NOT NULL DEFAULT 'pending',
    payment_method ENUM('Cash', 'Telebirr', 'Bank Transfer', 'Cheque', 'Credit') NOT NULL DEFAULT 'Cash',
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    remaining_amount DECIMAL(10,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branch(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE RESTRICT
);

-- Create ORDER items table
CREATE TABLE order_item (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    category_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES business(id),
    FOREIGN KEY (order_id) REFERENCES `order`(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES item(id),
    FOREIGN KEY (category_id) REFERENCES category(id)
);

CREATE TABLE db_version (
    version VARCHAR(50),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- For expense analysis and reporting
CREATE INDEX idx_expense_date_amount ON expense(expense_date, amount);
CREATE INDEX idx_recurring_frequency ON expense(recurring_frequency);
CREATE INDEX idx_expense_lookup ON expense(business_id, branch_id, expense_date);

-- Authentication & User Management Indices
CREATE INDEX idx_user_auth ON user(email, password_hash);  -- For login queries
CREATE INDEX idx_user_branch_role ON user(branch_id, user_role);  -- For role-based branch access
CREATE INDEX idx_user_business_status ON user(business_id, is_active);  -- For active users per business

-- branch Management Indices
CREATE INDEX idx_branch_business ON branch(business_id, is_active);  -- For business's branchs

-- Category & Item Management Indices
CREATE INDEX idx_item_inventory ON item(category_id, quantity);  -- For inventory management

-- Composite index on business_id and expense_date for quicker queries on expense
CREATE INDEX idx_expense_business_date ON expense(business_id, expense_date);

-- Composite index for order queries filtering by business_id and branch_id
CREATE INDEX idx_order_branch_business ON `order`(business_id, branch_id);

-- Composite index on user lookup by branch and role
CREATE INDEX idx_user_branch_role_status ON user(branch_id, user_role, is_active);

-- Composite index on order_item (order_id, item_id) for better join performance
CREATE INDEX idx_order_item_order_item ON order_item(order_id, item_id);

-- Add index on plan_id for better performance
CREATE INDEX idx_plan_id ON feature(plan_id);

CREATE INDEX idx_item_business ON item(business_id, is_active);
CREATE INDEX idx_order_item_business ON order_item(business_id);
CREATE INDEX idx_business_deleted ON business(deleted_at);
CREATE INDEX idx_item_deleted ON item(deleted_at);
CREATE INDEX idx_category_deleted ON category(deleted_at);
CREATE INDEX idx_order_deleted ON `order`(deleted_at);

-- Order Management Indices
CREATE INDEX idx_order_lookup ON `order`(
    business_id, 
    branch_id, 
    status,
    order_date
);  -- For order filtering and reporting

CREATE INDEX idx_order_payment ON `order`(
    payment_status,
    payment_method,
    total_amount
);  -- For payment tracking

CREATE INDEX idx_order_customer ON `order`(
    customer_phone,
    customer_email
);  -- For customer order history

CREATE INDEX idx_order_number_search ON `order`(
    order_number,
    status,
    payment_status
);  -- For order number searches

-- Subscription Management Indices
CREATE INDEX idx_subscription_tracking ON subscription(
    business_id,
    payment_status,
    end_date
);  -- For subscription status tracking

-- Create stored procedure to reset expired subscriptions
DELIMITER //
CREATE PROCEDURE reset_expired_subscriptions()
BEGIN
    UPDATE subscription
    SET subscription_status = 'INACTIVE',
        payment_status = 'EXPIRED'
    WHERE end_date < CURRENT_DATE()
      AND subscription_status != 'INACTIVE';
END //
DELIMITER ;

-- Create event scheduler to run the reset procedure daily
DELIMITER //
CREATE EVENT subscription_reset_event
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    CALL reset_expired_subscriptions();
END //


CREATE PROCEDURE create_order_and_update_inventory(
    IN p_business_id INT,
    IN p_branch_id INT,
    IN p_user_id INT,
    IN p_order_number VARCHAR(30),
    IN p_customer_name VARCHAR(100),
    IN p_customer_phone VARCHAR(20),
    IN p_customer_email VARCHAR(100),
    IN p_payment_method ENUM('Cash', 'Telebirr', 'Bank Transfer', 'Credit'),
    IN p_total_amount DECIMAL(10,2),
    IN p_paid_amount DECIMAL(10,2)
)
BEGIN
    DECLARE order_id INT;
    DECLARE done INT DEFAULT FALSE;

    -- Start transaction
    START TRANSACTION;

    -- Create the order with ALL fields
    INSERT INTO `order`(
        business_id,
        branch_id,
        user_id,
        order_number,
        customer_name,
        customer_phone,
        customer_email,
        order_date,
        total_amount,
        payment_method,
        paid_amount
    )
    VALUES (
        p_business_id,
        p_branch_id,
        p_user_id,
        p_order_number,
        p_customer_name,
        p_customer_phone,
        p_customer_email,
        NOW(),
        p_total_amount,
        p_payment_method,
        p_paid_amount
    );
    
    -- Get the inserted order ID
    SET order_id = LAST_INSERT_ID();

    -- Update the inventory for each item in the order (this should come from order items)
    -- Here is an example logic of decreasing inventory:
    DECLARE cur CURSOR FOR SELECT item_id, quantity FROM order_item WHERE order_id = order_id;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO item_id, quantity;
        IF done THEN
            LEAVE read_loop;
        END IF;
        -- Update item quantity in inventory
        UPDATE item SET quantity = quantity - quantity WHERE id = item_id;

    END LOOP;

    CLOSE cur;

    -- Commit transaction
    COMMIT;
END //


CREATE EVENT cleanup_old_orders
ON SCHEDULE EVERY 1 WEEK
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    DELETE FROM `order`
    WHERE order_date < DATE_SUB(CURDATE(), INTERVAL 2 YEAR)
      AND status = 'completed';
END //
DELIMITER ;