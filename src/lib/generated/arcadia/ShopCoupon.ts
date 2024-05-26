// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.

export type ShopCoupon = { 
/**
 * The ID of the shop coupon
 */
id: string, 
/**
 * The code of the shop coupon
 */
code: string, 
/**
 * Whether the shop coupon is publicly viewable in the API or not
 */
public: boolean, 
/**
 * The maximum number of times the shop coupon can be used, if None, the shop coupon can be used an unlimited number of times
 */
max_uses: number | null, 
/**
 * The time the shop coupon was created
 */
created_at: string, 
/**
 * The user who created the shop coupon
 */
created_by: string, 
/**
 * The time the shop coupon was last updated
 */
last_updated: string, 
/**
 * The user who last updated the shop coupon
 */
updated_by: string, 
/**
 * The number of hours that must be waited to reuse the shop coupon
 *
 * If None, the shop coupon can be reused immediately without wait
 */
reuse_wait_duration: number | null, 
/**
 * The number of hours the shop coupon expires in
 *
 * If None, the shop coupon never expires
 */
expiry: number | null, 
/**
 * The items the shop coupon is applicable to
 *
 * If empty, the shop coupon is applicable to all items
 */
applicable_items: Array<string>, 
/**
 * The cents the shop coupon is worth
 *
 * If none, the shop coupon is worth the total cost of the items it is being used on
 */
cents: number | null, 
/**
 * The requirements to use the shop coupon
 */
requirements: Array<string>, 
/**
 * The users the coupon is applicable for
 *
 * If empty, the coupon is applicable to all users
 */
allowed_users: Array<string>, 
/**
 * Whether or not the coupon is usable or not
 */
usable: boolean, 
/**
 * The target types the coupon can be applied to
 *
 * If empty, the coupon is applicable to all target types
 */
target_types: Array<string>, };