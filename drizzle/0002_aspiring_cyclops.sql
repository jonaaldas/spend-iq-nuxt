DROP INDEX `idx_accounts_userId`;--> statement-breakpoint
CREATE INDEX `account_user_id_idx` ON `account` (`user_id`);