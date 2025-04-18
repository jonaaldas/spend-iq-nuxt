CREATE INDEX IF NOT EXISTS `idx_account_userId` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_session_userId` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_session_token` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_session_userId_token` ON `session` (`user_id`,`token`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `email_index` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_verification_identifier` ON `verification` (`identifier`);