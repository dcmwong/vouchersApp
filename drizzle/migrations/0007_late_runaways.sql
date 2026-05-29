ALTER TABLE `images` ADD `current_value` text;--> statement-breakpoint
ALTER TABLE `images` ADD `value_updated_at` text;--> statement-breakpoint
UPDATE `images` SET `current_value` = `value`, `value_updated_at` = `created_at` WHERE `current_value` IS NULL;
