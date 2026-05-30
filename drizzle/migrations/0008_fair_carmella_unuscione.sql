ALTER TABLE `brands` ADD `color` text;--> statement-breakpoint
ALTER TABLE `brands` ADD `tag` text;--> statement-breakpoint
ALTER TABLE `brands` ADD `loyalty_scheme` text;--> statement-breakpoint
ALTER TABLE `images` ADD `owner` text DEFAULT 'all' NOT NULL;--> statement-breakpoint
UPDATE `brands` SET `color` = '#00539F', `tag` = 'SUPERMARKET',     `loyalty_scheme` = 'Clubcard'       WHERE `id` = 'tesco';--> statement-breakpoint
UPDATE `brands` SET `color` = '#EE7203', `tag` = 'SUPERMARKET',     `loyalty_scheme` = 'Nectar'         WHERE `id` = 'sainsburys';--> statement-breakpoint
UPDATE `brands` SET `color` = '#00482B', `tag` = 'FOOD & HOME',     `loyalty_scheme` = 'Sparks'         WHERE `id` = 'm-and-s';--> statement-breakpoint
UPDATE `brands` SET `color` = '#00263A', `tag` = 'BAKERY',          `loyalty_scheme` = 'Greggs Rewards' WHERE `id` = 'greggs';--> statement-breakpoint
UPDATE `brands` SET `color` = '#007A33', `tag` = 'SUPERMARKET',     `loyalty_scheme` = 'More Card'      WHERE `id` = 'morrisons';--> statement-breakpoint
UPDATE `brands` SET `color` = '#0A1A6B', `tag` = 'FASHION'                                              WHERE `id` = 'primark';--> statement-breakpoint
UPDATE `brands` SET `color` = '#E2231A', `tag` = 'DINING'                                               WHERE `id` = 'wagamama';--> statement-breakpoint
UPDATE `brands` SET `color` = '#16143C', `tag` = 'CINEMA',          `loyalty_scheme` = 'myVue'          WHERE `id` = 'vue-cinema';--> statement-breakpoint
UPDATE `brands` SET `color` = '#0B2A5B', `tag` = 'CINEMA'                                               WHERE `id` = 'odeon';--> statement-breakpoint
UPDATE `brands` SET `color` = '#6B7280', `tag` = 'OTHER'                                                WHERE `id` = 'uncategorised';
