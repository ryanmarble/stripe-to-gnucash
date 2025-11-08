-- CreateTable
CREATE TABLE `accounts` (
    `guid` VARCHAR(32) NOT NULL,
    `name` VARCHAR(2048) NOT NULL,
    `account_type` VARCHAR(2048) NOT NULL,
    `commodity_guid` VARCHAR(32) NULL,
    `commodity_scu` INTEGER NOT NULL,
    `non_std_scu` INTEGER NOT NULL,
    `parent_guid` VARCHAR(32) NULL,
    `code` VARCHAR(2048) NULL,
    `description` VARCHAR(2048) NULL,
    `hidden` INTEGER NULL,
    `placeholder` INTEGER NULL,

    PRIMARY KEY (`guid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- CreateTable
CREATE TABLE `books` (
    `guid` VARCHAR(32) NOT NULL,
    `root_account_guid` VARCHAR(32) NOT NULL,
    `root_template_guid` VARCHAR(32) NOT NULL,

    PRIMARY KEY (`guid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- CreateTable
CREATE TABLE `budget_amounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `budget_guid` VARCHAR(32) NOT NULL,
    `account_guid` VARCHAR(32) NOT NULL,
    `period_num` INTEGER NOT NULL,
    `amount_num` BIGINT NOT NULL,
    `amount_denom` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- CreateTable
CREATE TABLE `budgets` (
    `guid` VARCHAR(32) NOT NULL,
    `name` VARCHAR(2048) NOT NULL,
    `description` VARCHAR(2048) NULL,
    `num_periods` INTEGER NOT NULL,

    PRIMARY KEY (`guid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- CreateTable
CREATE TABLE `commodities` (
    `guid` VARCHAR(32) NOT NULL,
    `namespace` VARCHAR(2048) NOT NULL,
    `mnemonic` VARCHAR(2048) NOT NULL,
    `fullname` VARCHAR(2048) NULL,
    `cusip` VARCHAR(2048) NULL,
    `fraction` INTEGER NOT NULL,
    `quote_flag` INTEGER NOT NULL,
    `quote_source` VARCHAR(2048) NULL,
    `quote_tz` VARCHAR(2048) NULL,

    PRIMARY KEY (`guid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- CreateTable
CREATE TABLE `customers` (
    `guid` VARCHAR(32) NOT NULL,
    `name` VARCHAR(2048) NOT NULL,
    `id` VARCHAR(2048) NOT NULL,
    `notes` VARCHAR(2048) NOT NULL,
    `active` INTEGER NOT NULL,
    `discount_num` BIGINT NOT NULL,
    `discount_denom` BIGINT NOT NULL,
    `credit_num` BIGINT NOT NULL,
    `credit_denom` BIGINT NOT NULL,
    `currency` VARCHAR(32) NOT NULL,
    `tax_override` INTEGER NOT NULL,
    `addr_name` VARCHAR(1024) NULL,
    `addr_addr1` VARCHAR(1024) NULL,
    `addr_addr2` VARCHAR(1024) NULL,
    `addr_addr3` VARCHAR(1024) NULL,
    `addr_addr4` VARCHAR(1024) NULL,
    `addr_phone` VARCHAR(128) NULL,
    `addr_fax` VARCHAR(128) NULL,
    `addr_email` VARCHAR(256) NULL,
    `shipaddr_name` VARCHAR(1024) NULL,
    `shipaddr_addr1` VARCHAR(1024) NULL,
    `shipaddr_addr2` VARCHAR(1024) NULL,
    `shipaddr_addr3` VARCHAR(1024) NULL,
    `shipaddr_addr4` VARCHAR(1024) NULL,
    `shipaddr_phone` VARCHAR(128) NULL,
    `shipaddr_fax` VARCHAR(128) NULL,
    `shipaddr_email` VARCHAR(256) NULL,
    `terms` VARCHAR(32) NULL,
    `tax_included` INTEGER NULL,
    `taxtable` VARCHAR(32) NULL,

    PRIMARY KEY (`guid`)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ROW_FORMAT=DYNAMIC;

-- CreateTable
CREATE TABLE `employees` (
    `guid` VARCHAR(32) NOT NULL,
    `username` VARCHAR(2048) NOT NULL,
    `id` VARCHAR(2048) NOT NULL,
    `language` VARCHAR(2048) NOT NULL,
    `acl` VARCHAR(2048) NOT NULL,
    `active` INTEGER NOT NULL,
    `currency` VARCHAR(32) NOT NULL,
    `ccard_guid` VARCHAR(32) NULL,
    `workday_num` BIGINT NOT NULL,
    `workday_denom` BIGINT NOT NULL,
    `rate_num` BIGINT NOT NULL,
    `rate_denom` BIGINT NOT NULL,
    `addr_name` VARCHAR(1024) NULL,
    `addr_addr1` VARCHAR(1024) NULL,
    `addr_addr2` VARCHAR(1024) NULL,
    `addr_addr3` VARCHAR(1024) NULL,
    `addr_addr4` VARCHAR(1024) NULL,
    `addr_phone` VARCHAR(128) NULL,
    `addr_fax` VARCHAR(128) NULL,
    `addr_email` VARCHAR(256) NULL,

    PRIMARY KEY (`guid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- CreateTable
CREATE TABLE `entries` (
    `guid` VARCHAR(32) NOT NULL,
    `date` DATETIME(0) NOT NULL DEFAULT '1970-01-01 00:00:00',
    `date_entered` DATETIME(0) NULL DEFAULT '1970-01-01 00:00:00',
    `description` VARCHAR(2048) NULL,
    `action` VARCHAR(2048) NULL,
    `notes` VARCHAR(2048) NULL,
    `quantity_num` BIGINT NULL,
    `quantity_denom` BIGINT NULL,
    `i_acct` VARCHAR(32) NULL,
    `i_price_num` BIGINT NULL,
    `i_price_denom` BIGINT NULL,
    `i_discount_num` BIGINT NULL,
    `i_discount_denom` BIGINT NULL,
    `invoice` VARCHAR(32) NULL,
    `i_disc_type` VARCHAR(2048) NULL,
    `i_disc_how` VARCHAR(2048) NULL,
    `i_taxable` INTEGER NULL,
    `i_taxincluded` INTEGER NULL,
    `i_taxtable` VARCHAR(32) NULL,
    `b_acct` VARCHAR(32) NULL,
    `b_price_num` BIGINT NULL,
    `b_price_denom` BIGINT NULL,
    `bill` VARCHAR(32) NULL,
    `b_taxable` INTEGER NULL,
    `b_taxincluded` INTEGER NULL,
    `b_taxtable` VARCHAR(32) NULL,
    `b_paytype` INTEGER NULL,
    `billable` INTEGER NULL,
    `billto_type` INTEGER NULL,
    `billto_guid` VARCHAR(32) NULL,
    `order_guid` VARCHAR(32) NULL,

    PRIMARY KEY (`guid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- CreateTable
CREATE TABLE `invoices` (
    `guid` VARCHAR(32) NOT NULL,
    `id` VARCHAR(2048) NOT NULL,
    `date_opened` DATETIME(0) NULL DEFAULT '1970-01-01 00:00:00',
    `date_posted` DATETIME(0) NULL DEFAULT '1970-01-01 00:00:00',
    `notes` VARCHAR(2048) NOT NULL,
    `active` INTEGER NOT NULL,
    `currency` VARCHAR(32) NOT NULL,
    `owner_type` INTEGER NULL,
    `owner_guid` VARCHAR(32) NULL,
    `terms` VARCHAR(32) NULL,
    `billing_id` VARCHAR(2048) NULL,
    `post_txn` VARCHAR(32) NULL,
    `post_lot` VARCHAR(32) NULL,
    `post_acc` VARCHAR(32) NULL,
    `billto_type` INTEGER NULL,
    `billto_guid` VARCHAR(32) NULL,
    `charge_amt_num` BIGINT NULL,
    `charge_amt_denom` BIGINT NULL,

    PRIMARY KEY (`guid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- CreateTable
CREATE TABLE `jobs` (
    `guid` VARCHAR(32) NOT NULL,
    `id` VARCHAR(2048) NOT NULL,
    `name` VARCHAR(2048) NOT NULL,
    `reference` VARCHAR(2048) NOT NULL,
    `active` INTEGER NOT NULL,
    `owner_type` INTEGER NULL,
    `owner_guid` VARCHAR(32) NULL,

    PRIMARY KEY (`guid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- CreateTable
CREATE TABLE `lots` (
    `guid` VARCHAR(32) NOT NULL,
    `account_guid` VARCHAR(32) NULL,
    `is_closed` INTEGER NOT NULL,

    PRIMARY KEY (`guid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- CreateTable
CREATE TABLE `orders` (
    `guid` VARCHAR(32) NOT NULL,
    `id` VARCHAR(2048) NOT NULL,
    `notes` VARCHAR(2048) NOT NULL,
    `reference` VARCHAR(2048) NOT NULL,
    `active` INTEGER NOT NULL,
    `date_opened` DATETIME(0) NOT NULL DEFAULT '1970-01-01 00:00:00',
    `date_closed` DATETIME(0) NOT NULL DEFAULT '1970-01-01 00:00:00',
    `owner_type` INTEGER NOT NULL,
    `owner_guid` VARCHAR(32) NOT NULL,

    PRIMARY KEY (`guid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- CreateTable
CREATE TABLE `prices` (
    `guid` VARCHAR(32) NOT NULL,
    `commodity_guid` VARCHAR(32) NOT NULL,
    `currency_guid` VARCHAR(32) NOT NULL,
    `date` DATETIME(0) NOT NULL DEFAULT '1970-01-01 00:00:00',
    `source` VARCHAR(2048) NULL,
    `type` VARCHAR(2048) NULL,
    `value_num` BIGINT NOT NULL,
    `value_denom` BIGINT NOT NULL,

    PRIMARY KEY (`guid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- CreateTable
CREATE TABLE `recurrences` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `obj_guid` VARCHAR(32) NOT NULL,
    `recurrence_mult` INTEGER NOT NULL,
    `recurrence_period_type` VARCHAR(2048) NOT NULL,
    `recurrence_period_start` DATE NOT NULL,
    `recurrence_weekend_adjust` VARCHAR(2048) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- CreateTable
CREATE TABLE `schedxactions` (
    `guid` VARCHAR(32) NOT NULL,
    `name` VARCHAR(2048) NULL,
    `enabled` INTEGER NOT NULL,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `last_occur` DATE NULL,
    `num_occur` INTEGER NOT NULL,
    `rem_occur` INTEGER NOT NULL,
    `auto_create` INTEGER NOT NULL,
    `auto_notify` INTEGER NOT NULL,
    `adv_creation` INTEGER NOT NULL,
    `adv_notify` INTEGER NOT NULL,
    `instance_count` INTEGER NOT NULL,
    `template_act_guid` VARCHAR(32) NOT NULL,

    PRIMARY KEY (`guid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- CreateTable
CREATE TABLE `slots` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `obj_guid` VARCHAR(32) NOT NULL,
    `name` VARCHAR(4096) NOT NULL,
    `slot_type` INTEGER NOT NULL,
    `int64_val` BIGINT NULL,
    `string_val` VARCHAR(4096) NULL,
    `double_val` DOUBLE NULL,
    `timespec_val` DATETIME(0) NULL DEFAULT '1970-01-01 00:00:00',
    `guid_val` VARCHAR(32) NULL,
    `numeric_val_num` BIGINT NULL,
    `numeric_val_denom` BIGINT NULL,
    `gdate_val` DATE NULL,

    INDEX `slots_guid_index`(`obj_guid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- CreateTable
CREATE TABLE `splits` (
    `guid` VARCHAR(32) NOT NULL,
    `tx_guid` VARCHAR(32) NOT NULL,
    `account_guid` VARCHAR(32) NOT NULL,
    `memo` VARCHAR(2048) NOT NULL,
    `action` VARCHAR(2048) NOT NULL,
    `reconcile_state` VARCHAR(1) NOT NULL,
    `reconcile_date` DATETIME(0) NULL DEFAULT '1970-01-01 00:00:00',
    `value_num` BIGINT NOT NULL,
    `value_denom` BIGINT NOT NULL,
    `quantity_num` BIGINT NOT NULL,
    `quantity_denom` BIGINT NOT NULL,
    `lot_guid` VARCHAR(32) NULL,

    INDEX `splits_account_guid_index`(`account_guid`),
    INDEX `splits_tx_guid_index`(`tx_guid`),
    PRIMARY KEY (`guid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- CreateTable
CREATE TABLE `taxtable_entries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `taxtable` VARCHAR(32) NOT NULL,
    `account` VARCHAR(32) NOT NULL,
    `amount_num` BIGINT NOT NULL,
    `amount_denom` BIGINT NOT NULL,
    `type` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- CreateTable
CREATE TABLE `transactions` (
    `guid` VARCHAR(32) NOT NULL,
    `currency_guid` VARCHAR(32) NOT NULL,
    `num` VARCHAR(2048) NOT NULL,
    `post_date` DATETIME(0) NULL DEFAULT '1970-01-01 00:00:00',
    `enter_date` DATETIME(0) NULL DEFAULT '1970-01-01 00:00:00',
    `description` VARCHAR(2048) NULL,

    INDEX `tx_post_date_index`(`post_date`),
    PRIMARY KEY (`guid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- CreateTable
CREATE TABLE `vendors` (
    `guid` VARCHAR(32) NOT NULL,
    `name` VARCHAR(2048) NOT NULL,
    `id` VARCHAR(2048) NOT NULL,
    `notes` VARCHAR(2048) NOT NULL,
    `currency` VARCHAR(32) NOT NULL,
    `active` INTEGER NOT NULL,
    `tax_override` INTEGER NOT NULL,
    `addr_name` VARCHAR(1024) NULL,
    `addr_addr1` VARCHAR(1024) NULL,
    `addr_addr2` VARCHAR(1024) NULL,
    `addr_addr3` VARCHAR(1024) NULL,
    `addr_addr4` VARCHAR(1024) NULL,
    `addr_phone` VARCHAR(128) NULL,
    `addr_fax` VARCHAR(128) NULL,
    `addr_email` VARCHAR(256) NULL,
    `terms` VARCHAR(32) NULL,
    `tax_inc` VARCHAR(2048) NULL,
    `tax_table` VARCHAR(32) NULL,

    PRIMARY KEY (`guid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- CreateTable
CREATE TABLE `versions` (
    `table_name` VARCHAR(50) NOT NULL,
    `table_version` INTEGER NOT NULL,

    PRIMARY KEY (`table_name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- CreateTable
CREATE TABLE `billterms` (
    `guid` VARCHAR(32) NOT NULL,
    `name` VARCHAR(2048) NOT NULL,
    `description` VARCHAR(2048) NOT NULL,
    `refcount` INTEGER NOT NULL,
    `invisible` INTEGER NOT NULL,
    `parent` VARCHAR(32) NULL,
    `type` VARCHAR(2048) NOT NULL,
    `duedays` INTEGER NULL,
    `discountdays` INTEGER NULL,
    `discount_num` BIGINT NULL,
    `discount_denom` BIGINT NULL,
    `cutoff` INTEGER NULL,

    PRIMARY KEY (`guid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- CreateTable
CREATE TABLE `gnclock` (
    `Hostname` VARCHAR(255) NULL,
    `PID` INTEGER NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- CreateTable
CREATE TABLE `taxtables` (
    `guid` VARCHAR(32) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `refcount` BIGINT NOT NULL,
    `invisible` INTEGER NOT NULL,
    `parent` VARCHAR(32) NULL,

    PRIMARY KEY (`guid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
