CREATE TABLE `brands` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `brands_name_unique` ON `brands` (`name`);--> statement-breakpoint
INSERT INTO `brands` (`id`, `name`) VALUES
	('tesco', 'Tesco'),
	('sainsburys', 'Sainsbury''s'),
	('greggs', 'Greggs'),
	('morrisons', 'Morrisons'),
	('wagamama', 'Wagamama'),
	('primark', 'Primark'),
	('vue-cinema', 'Vue Cinema'),
	('odeon', 'Odeon'),
	('uncategorised', 'Uncategorised');--> statement-breakpoint
ALTER TABLE `images` ADD `brand_id` text DEFAULT 'uncategorised' NOT NULL REFERENCES brands(id);
