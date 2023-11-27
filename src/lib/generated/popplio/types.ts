// Code generated by tygo. DO NOT EDIT.
import { PlatformUser } from "./eureka-dovewing"

//////////
// source: alert.go

export type AlertType = string;
export const AlertTypeSuccess: AlertType = "success";
export const AlertTypeError: AlertType = "error";
export const AlertTypeInfo: AlertType = "info";
export const AlertTypeWarning: AlertType = "warning";
export type AlertPriority = number /* int */;
export const AlertPriorityLow: AlertPriority = 0;
export const AlertPriorityMedium: AlertPriority = 1;
export const AlertPriorityHigh: AlertPriority = 2;
export interface Alert {
  itag: string /* uuid */;
  url: string | null /* nullable */; // Optional
  message: string;
  type: AlertType;
  title: string;
  created_at: string | null /* RFC3339, nullable */;
  acked: boolean;
  alert_data: { [key: string]: any}; // Optional
  icon: string; // Optional
  priority: AlertPriority; // Optional
}
export interface AlertList {
  unacked_count: number /* uint64 */;
  alerts: Alert[];
}
export interface FeaturedUserAlerts {
  unacked_count: number /* uint64 */;
  unacked: Alert[];
  acked: Alert[];
}
export interface AlertPatch {
  patches: AlertPatchItem[];
}
export interface AlertPatchItem {
  itag: string;
  patch: string;
}

//////////
// source: announcement.go

/**
 * An announcement
 */
export interface Announcement {
  author?: PlatformUser /* from eureka-dovewing.ts */; // Must be parsed internally
  id: string /* uuid */;
  title: string;
  content: string;
  last_modified: string /* RFC3339 */;
  status: string;
  target: string | null /* nullable */;
}
export interface AnnouncementList {
  announcements: Announcement[];
}

//////////
// source: apps.go

export interface Question {
  id: string;
  question: string;
  paragraph: string;
  placeholder: string;
  short: boolean;
}
export interface Position {
  id: string;
  tags: string[];
  info: string;
  name: string;
  questions: Question[];
  hidden: boolean;
  closed: boolean;
}
export interface AppMeta {
  positions: Position[];
  stable: boolean; // Stable means that the list of apps is not pending big changes
}
export interface AppResponse {
  app_id: string;
  user_id: string;
  questions: Question[];
  answers: { [key: string]: string};
  state: string;
  created_at: string /* RFC3339 */;
  position: string;
  review_feedback?: string;
}
export interface AppListResponse {
  apps: AppResponse[];
}

//////////
// source: asset.go

export interface Asset {
  type: string;
  content_type: string;
  content: number /* uint8 */[];
}
export interface AssetMetadata {
  exists: boolean;
  path?: string;
  default_path: string;
  type?: string;
  size?: number /* int64 */;
  last_modified?: string /* RFC3339 */;
  errors?: string[];
}

//////////
// source: auth.go

export interface AuthorizeRequest {
  client_id: string;
  code: string;
  redirect_uri: string;
  protocol: string;
  scope: string;
}
export interface UserLogin {
  token: string;
  user_id: string;
}
export interface OauthMeta {
  client_id: string;
  url: string;
}
export interface TestAuth {
  auth_type: string;
  target_id: string;
  token: string;
}

//////////
// source: blog.go

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  author?: PlatformUser /* from eureka-dovewing.ts */;
  created_at: string /* RFC3339 */;
  content: string;
  draft: boolean;
  tags: string[];
}
export interface BlogListPost {
  slug: string;
  title: string;
  description: string;
  author?: PlatformUser /* from eureka-dovewing.ts */;
  created_at: string /* RFC3339 */;
  draft: boolean;
  tags: string[];
}
export interface Blog {
  posts: BlogListPost[];
}
export interface PublishBlogPost {
  draft: boolean;
}
export interface CreateBlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
}
export interface EditBlogPost {
  title: string;
  description: string;
  content: string;
  tags: string[];
}

//////////
// source: bot.go

export type BotFlags = string;
/**
 * @ci table=bots, unfilled=1
 * Represents a 'index bot' (a small subset of the bot object for use in cards etc.)
 */
export interface IndexBot {
  bot_id: string;
  user?: PlatformUser /* from eureka-dovewing.ts */; // Must be parsed internally
  short: string;
  type: string;
  vanity_ref: string /* uuid */;
  vanity: string; // Must be parsed internally
  votes: number /* int */;
  shards: number /* int */;
  library: string;
  invite_clicks: number /* int */;
  clicks: number /* int */;
  servers: number /* int */;
  nsfw: boolean;
  tags: string[];
  premium: boolean;
  banner?: AssetMetadata; // Must be parsed internally
}
export interface BotStats {
  servers: number /* uint64 */;
  shards: number /* uint64 */;
  users: number /* uint64 */;
  shard_list: number /* uint64 */[];
}
/**
 * @ci table=bots
 * Bot represents a bot.
 */
export interface Bot {
  itag: string /* uuid */;
  bot_id: string;
  client_id: string;
  extra_links: Link[];
  tags: string[];
  flags: BotFlags[];
  prefix: string;
  user?: PlatformUser /* from eureka-dovewing.ts */; // Must be parsed internally
  owner?: PlatformUser /* from eureka-dovewing.ts */; // Must be parsed internally
  short: string;
  long?: string;
  library: string;
  nsfw: boolean;
  premium: boolean;
  last_stats_post: string | null /* RFC3339, nullable */;
  servers: number /* int */;
  shards: number /* int */;
  shard_list: number /* int */[];
  users: number /* int */;
  votes: number /* int */;
  clicks: number /* int */;
  unique_clicks: number /* int64 */; // Must be parsed internally
  invite_clicks: number /* int */;
  banner?: AssetMetadata; // Must be parsed internally
  invite: string;
  type: string;
  vanity_ref: string /* uuid */;
  vanity: string; // Must be parsed internally
  vote_banned: boolean;
  start_premium_period: string | null /* RFC3339, nullable */;
  premium_period_length: any /* time.Duration */;
  cert_reason: string | null /* nullable */;
  uptime: number /* int */;
  total_uptime: number /* int */;
  uptime_last_checked: string | null /* RFC3339, nullable */;
  approval_note: string | null /* nullable */;
  created_at: string | null /* RFC3339, nullable */;
  claimed_by: string | null /* nullable */;
  last_claimed: string | null /* RFC3339, nullable */;
  team_owner?: Team; // Must be parsed internally
  captcha_opt_out: boolean;
}
/**
 * @ci table=bots, unfilled=1
 * CreateBot represents the data sent for the creation of a bot.
 */
export interface CreateBot {
  bot_id: string; // impld
  client_id: string; // impld
  short: string; // impld
  long: string; // impld
  prefix: string; // impld
  invite: string; // impld
  library: string; // impld
  extra_links: Link[]; // Impld
  tags: string[];
  nsfw: boolean;
  staff_note?: string; // impld
  team_owner: string; // May or may not be present
}
export interface BotSettingsUpdate {
  short: string; // impld
  long: string; // impld
  prefix: string; // impld
  invite: string; // impld
  library: string; // impld
  extra_links: Link[]; // Impld
  tags: string[];
  nsfw: boolean;
  captcha_opt_out: boolean;
}
export interface Invite {
  invite: string;
}
/**
 * List Index
 */
export interface ListIndexBot {
  certified: IndexBot[];
  premium: IndexBot[];
  most_viewed: IndexBot[];
  packs: IndexBotPack[];
  recently_added: IndexBot[];
  top_voted: IndexBot[];
}
export interface DiscordBotMeta {
  bot_id: string;
  client_id: string;
  name: string;
  avatar: string;
  list_type: string;
  guild_count: number /* int */;
  bot_public: boolean;
  flags: string[];
  description: string;
  tags: string[];
  fallback: boolean;
  fetch_errors: { [key: string]: string};
}
export interface PatchBotTeam {
  team_id: string;
}
export interface RandomBots {
  bots: IndexBot[];
}

//////////
// source: changelogs.go

/**
 * @ci table=changelogs
 * Changelogs for the list
 */
export interface ChangelogEntry {
  version: string;
  extra_description: string;
  github_html: string | null /* nullable */;
  published: boolean;
  prerelease: boolean;
  added: string[];
  updated: string[];
  removed: string[];
  created_at: string /* RFC3339 */;
}
export interface Changelog {
  entries: ChangelogEntry[];
}

//////////
// source: common.go

/**
 * A link is any extra link
 */
export interface Link {
  name: string;
  value: string;
}
/**
 * SEO object (minified bot/user/server for seo purposes)
 */
export interface SEO {
  name: string;
  id: string;
  avatar: string;
  short: string;
}
/**
 * This represents a IBL Popplio API Error
 */
export interface ApiError {
  context?: { [key: string]: string};
  message: string;
}
/**
 * Paged result common
 */
export interface PagedResult<T extends any> {
  count: number /* uint64 */;
  per_page: number /* uint64 */;
  results: T;
}
export interface Vanity {
  itag: string /* uuid */;
  target_id: string;
  target_type: string;
  code: string;
  created_at: string /* RFC3339 */;
}

//////////
// source: notifications.go

export interface NotificationInfo {
  public_key: string;
}
/**
 * A user subscription for push notifications
 */
export interface UserSubscription {
  auth: string;
  p256dh: string;
  endpoint: string;
}
/**
 * Notification
 */
export interface NotifGet {
  endpoint: string;
  notif_id: string;
  created_at: string /* RFC3339 */;
  browser_info: NotifBrowserInfo; // Must be parsed from UA internally
}
export interface NotifBrowserInfo {
  /**
   * The OS of the browser
   */
  os: string;
  browser: string;
  browser_ver: string;
  mobile: boolean;
}
export interface NotifGetList {
  notifications: NotifGet[];
}

//////////
// source: pack.go

/**
 * Represents a Bot Pack
 */
export interface BotPack {
  owner?: PlatformUser /* from eureka-dovewing.ts */;
  name: string;
  short: string;
  votes: number /* int */;
  tags: string[];
  url: string;
  created_at: string /* RFC3339 */;
  bot_ids: string[];
  bots: IndexBot[];
}
export interface IndexBotPack {
  owner_id: string;
  name: string;
  short: string;
  votes: number /* int */;
  tags: string[];
  url: string;
  created_at: string /* RFC3339 */;
  bot_ids: string[];
}

//////////
// source: partners.go

/**
 * @ci table=partners
 * Partner represents a IBL partner.
 */
export interface Partner {
  id: string;
  name: string;
  avatar?: AssetMetadata; // Must be parsed internally
  short: string;
  links: Link[];
  type: string;
  created_at: string /* RFC3339 */;
  user?: PlatformUser /* from eureka-dovewing.ts */; // Must be parsed internally
}
/**
 * @ci table=partner_types
 * PartnerTypes represents a IBL partner type.
 */
export interface PartnerTypes {
  id: string;
  name: string;
  short: string;
  icon: string;
  created_at: string /* RFC3339 */;
}
export interface PartnerList {
  partners: Partner[];
  partner_types: PartnerTypes[];
}

//////////
// source: payments.go

export interface PaymentPlan {
  id: string;
  name: string;
  benefit: string; // To be fixed
  time_period: number /* int */; // In seconds
  price: number /* float32 */; // In USD
}
export interface PlanList {
  plans: PaymentPlan[];
}

//////////
// source: reminder.go

export interface ResolvedReminder {
  name: string;
  avatar: string;
}
export interface Reminder {
  user_id: string;
  target_type: string;
  target_id: string;
  resolved?: ResolvedReminder;
  created_at: string /* RFC3339 */;
  last_acked: string /* RFC3339 */;
}
export interface ReminderList {
  reminders: Reminder[];
}

//////////
// source: review.go

/**
 * A review is a review on ibl
 */
export interface Review {
  id: string /* uuid */;
  target_type: string;
  target_id: string;
  author?: PlatformUser /* from eureka-dovewing.ts */;
  owner_review: boolean;
  content: string;
  stars: number /* int32 */;
  created_at: string /* RFC3339 */;
  parent_id: string /* uuid */;
}
export interface CreateReview {
  content: string;
  stars: number /* int32 */;
  parent_id: string;
  owner_review: boolean;
}
export interface EditReview {
  content: string;
  stars: number /* int32 */;
}
export interface ReviewList {
  reviews: Review[];
}

//////////
// source: search.go

export interface SearchFilter {
  from: number /* int64 */;
  to: number /* int64 */;
}
export type TagMode = string;
export const TagModeAll: TagMode = "@>";
export const TagModeAny: TagMode = "&&";
export interface TagFilter {
  tags: string[];
  tag_mode: TagMode;
}
export interface SearchQuery {
  query: string;
  target_types: string[]; // Defaults to 'bot' if unset
  servers: SearchFilter;
  votes: SearchFilter;
  shards: SearchFilter;
  total_members: SearchFilter;
  tags: TagFilter;
}
export interface SearchResponse {
  target_types: string[];
  bots: IndexBot[];
  servers: IndexServer[];
}

//////////
// source: server.go

/**
 * @ci table=servers, unfilled=1
 * Represents a 'index server' (a small subset of the server object for use in cards etc.)
 */
export interface IndexServer {
  server_id: string;
  name: string;
  avatar: string;
  total_members: number /* int */;
  online_members: number /* int */;
  short: string;
  type: string;
  vanity_ref: string /* uuid */;
  vanity: string; // Must be parsed internally
  votes: number /* int */;
  invite_clicks: number /* int */;
  clicks: number /* int */;
  nsfw: boolean;
  tags: string[];
  premium: boolean;
  banner?: AssetMetadata; // Must be parsed internally
}
/**
 * @ci table=servers
 * Server represents a server.
 */
export interface Server {
  server_id: string;
  name: string;
  avatar: string;
  total_members: number /* int */;
  online_members: number /* int */;
  short: string;
  long: string;
  type: string;
  state: string;
  tags: string[];
  flags: string[];
  vanity_ref: string /* uuid */;
  vanity: string; // Must be parsed internally
  extra_links: Link[];
  team_owner?: Team; // Must be parsed internally
  invite_clicks: number /* int */;
  banner?: AssetMetadata; // Must be parsed internally
  clicks: number /* int */;
  unique_clicks: number /* int64 */; // Must be parsed internally
  nsfw: boolean;
  votes: number /* int */;
  vote_banned: boolean;
  premium: boolean;
  start_premium_period: string | null /* RFC3339, nullable */;
  premium_period_length: any /* time.Duration */;
  captcha_opt_out: boolean;
  created_at: string | null /* RFC3339, nullable */;
  claimed_by: string | null /* nullable */;
  last_claimed: string | null /* RFC3339, nullable */;
}
export interface ServerSettingsUpdate {
  short: string; // impld
  long: string; // impld
  extra_links: Link[]; // Impld
  state: string;
  tags: string[];
  nsfw: boolean;
  captcha_opt_out: boolean;
}
/**
 * List Index
 */
export interface ListIndexServer {
  certified: IndexServer[];
  premium: IndexServer[];
  most_viewed: IndexServer[];
  recently_added: IndexServer[];
  top_voted: IndexServer[];
}
export interface RandomServers {
  servers: IndexServer[];
}

//////////
// source: stafftemplates.go

export interface StaffTemplateType {
  id: string;
  name: string;
  icon: string;
  short: string;
}
export interface StaffTemplate {
  id: string;
  name: string;
  emoji: string;
  tags: string[];
  description: string;
  type: string;
  created_at: string /* RFC3339 */;
}
export interface StaffTemplateList {
  template_types: StaffTemplateType[];
  templates: StaffTemplate[];
}

//////////
// source: stats.go

export interface ListStats {
  total_bots: number /* int64 */;
  total_approved_bots: number /* int64 */;
  total_certified_bots: number /* int64 */;
  total_staff: number /* int64 */;
  total_users: number /* int64 */;
  total_votes: number /* int64 */;
  total_packs: number /* int64 */;
  total_tickets: number /* int64 */;
}
export interface StatusDocs {
  key1: string;
  key2: string;
  key3: string;
  etc: string;
}
export interface StaffTeam {
  members: UserPerm[];
}

//////////
// source: task.go

export interface TaskCreateResponse {
  task_id: string;
  task_key: string | null /* nullable */;
  allow_unauthenticated: boolean;
  task_name: string;
  expiry: any /* pgtype.Interval */;
}
/**
 * @ci table=tasks
 * Tasks are background processes that can be run on the server.
 */
export interface Task {
  task_id: string;
  allow_unauthenticated: boolean;
  task_name: string;
  output: { [key: string]: any};
  statuses: { [key: string]: any}[];
  for_user: string | null /* nullable */;
  expiry: any /* pgtype.Interval */;
  state: string;
  created_at: string | null /* RFC3339, nullable */;
}

//////////
// source: teams.go

export interface PermissionDataOverride {
  name: string;
  desc: string;
}
export interface PermissionData {
  id: string;
  name: string;
  desc: string;
  supported_entities: string[];
  data_override?: { [key: string]: PermissionDataOverride | undefined};
}
/**
 * @ci table=teams
 * Team represents a team on Infinity List.
 */
export interface Team {
  id: string;
  name: string;
  avatar?: AssetMetadata;
  banner?: AssetMetadata;
  short: string | null /* nullable */;
  tags: string[];
  vote_banned: boolean;
  votes: number /* int */;
  extra_links: Link[];
  entities?: TeamEntities; // Must be handled internally
  nsfw: boolean;
  vanity_ref: string /* uuid */;
  vanity: string; // Must be parsed internally
}
export interface TeamBulkFetch {
  teams: Team[];
}
export interface TeamEntities {
  targets?: string[];
  members?: TeamMember[];
  bots?: IndexBot[];
  servers?: IndexServer[];
}
export interface TeamMember {
  itag: string /* uuid */;
  user?: PlatformUser /* from eureka-dovewing.ts */;
  flags: string[];
  created_at: string /* RFC3339 */;
  mentionable: boolean;
  data_holder: boolean;
}
export interface CreateEditTeam {
  name: string;
  short?: string; // impld
  tags?: string[];
  extra_links?: Link[];
  nsfw?: boolean;
}
export interface CreateTeamResponse {
  team_id: string;
}
export interface PermissionResponse {
  perms: PermissionData[];
}
export interface AddTeamMember {
  user_id: string;
  perms: string[];
}
export interface EditTeamMember {
  perm_update?: PermissionUpdate;
  mentionable?: boolean;
  data_holder?: boolean;
}
export interface PermissionUpdate {
  add: string[];
  remove: string[];
}
export interface UserEntityPerms {
  perms: string[];
}

//////////
// source: ticket.go

export interface Ticket {
  id: string;
  channel_id: string;
  topic_id: string;
  issue: string;
  ticket_context: { [key: string]: string};
  messages: Message[];
  author?: PlatformUser /* from eureka-dovewing.ts */;
  close_user?: PlatformUser /* from eureka-dovewing.ts */;
  open: boolean;
  created_at: string /* RFC3339 */;
  enc_key: string | null /* nullable */;
}
export interface Message {
  id: string;
  timestamp: string /* RFC3339 */; // Not in DB, but generated from snowflake ID
  content: string;
  embeds: (any /* discordgo.MessageEmbed */ | undefined)[];
  author_id: string;
  author?: PlatformUser /* from eureka-dovewing.ts */;
  attachments: Attachment[];
}
export interface Attachment {
  id: string; // ID of the attachment within the ticket
  name: string; // Name of the attachment
  content_type: string; // Content type of the attachment
  size: number /* int */; // Size of the attachment in bytes
  errors: string[]; // Non-fatal errors that occurred while uploading the attachment
}

//////////
// source: user.go

export type UserExperiment = string;
export const ServerListingUserExperiment: UserExperiment = "SERVER_LISTING";
/**
 * @ci table=users
 */
export interface User {
  itag: string /* uuid */;
  user?: PlatformUser /* from eureka-dovewing.ts */; // Must be handled internally
  experiments: string[];
  staff_onboarded: boolean;
  staff_onboard_state: string;
  staff_onboard_last_start_time: string | null /* RFC3339, nullable */;
  staff_onboard_guild: string | null /* nullable */;
  staff_rpc_last_verify: string | null /* RFC3339, nullable */;
  staff: boolean;
  admin: boolean;
  hadmin: boolean;
  certified: boolean;
  ibldev: boolean;
  iblhdev: boolean;
  owner: boolean;
  bot_developer: boolean;
  bug_hunters: boolean;
  captcha_sponsor_enabled: boolean;
  extra_links: Link[];
  about: string | null /* nullable */;
  vote_banned: boolean;
  banned: boolean;
  user_teams: Team[]; // Must be handled internally
  user_bots: IndexBot[]; // Must be handled internally
  user_packs: IndexBotPack[]; // Must be handled internally
}
export interface UserPerm {
  user?: PlatformUser /* from eureka-dovewing.ts */; // Must be handled internally
  experiments: string[];
  banned: boolean;
  captcha_sponsor_enabled: boolean;
  vote_banned: boolean;
  staff: boolean;
  admin: boolean;
  hadmin: boolean;
  ibldev: boolean;
  iblhdev: boolean;
  owner: boolean;
}
export interface ProfileUpdate {
  about: string;
  extra_links: Link[];
  captcha_sponsor_enabled?: boolean;
}
export interface BoosterStatus {
  remark?: string;
  is_booster: boolean;
}

//////////
// source: vote.go

/**
 * @ci table=entity_votes
 * Entity Vote represents a vote on an entity.
 */
export interface EntityVote {
  itag: string /* uuid */;
  target_type: string;
  target_id: string;
  author: string;
  upvote: boolean;
  void: boolean;
  void_reason: string | null /* nullable */;
  voided_at: any /* pgtype.Timestamp */;
  created_at: string /* RFC3339 */;
  vote_num: number /* int */;
}
/**
 * Vote Info
 */
export interface VoteInfo {
  per_user: number /* int */;
  vote_time: number /* uint16 */;
}
/**
 * Stores the hours, minutes and seconds until the user can vote again
 */
export interface VoteWait {
  hours: number /* int */;
  minutes: number /* int */;
  seconds: number /* int */;
}
export interface ValidVote {
  upvote: boolean;
  created_at: string /* RFC3339 */;
}
/**
 * A user vote is a struct containing basic info on a users vote
 */
export interface UserVote {
  has_voted: boolean;
  valid_votes: (ValidVote | undefined)[];
  vote_info?: VoteInfo;
  wait?: VoteWait;
}
export interface HCaptchaInfo {
  site_key: string;
}

//////////
// source: webhook.go

/**
 * @ci table=webhooks
 * Represents a webhook on IBL
 */
export interface Webhook {
  id: string /* uuid */;
  name: string;
  target_id: string;
  target_type: string;
  url: string;
  broken: boolean;
  simple_auth: boolean;
  event_whitelist: string[];
  created_at: string /* RFC3339 */;
}
export type WebhookType = string;
export const WebhookTypeText: WebhookType = "text";
export const WebhookTypeTextArray: WebhookType = "text[]";
export const WebhookTypeLinkArray: WebhookType = "link[]";
export const WebhookTypeNumber: WebhookType = "number";
export const WebhookTypeChangeset: WebhookType = "changeset";
export const WebhookTypeBoolean: WebhookType = "boolean";
/**
 * @ci table=webhook_logs
 * Webhook log
 */
export interface WebhookLogEntry {
  id: string /* uuid */;
  webhook_id: string /* uuid */;
  target_id: string;
  target_type: string;
  user?: PlatformUser /* from eureka-dovewing.ts */; // Must be parsed internally
  url: string;
  data: { [key: string]: any};
  response: string | null /* nullable */;
  created_at: string /* RFC3339 */;
  state: string;
  tries: number /* int */;
  last_try: string /* RFC3339 */;
  bad_intent: boolean;
  status_code: number /* int */;
}
export interface PatchWebhook {
  webhook_id: string;
  name: string;
  webhook_url: string;
  webhook_secret: string;
  simple_auth: boolean;
  event_whitelist: string[];
  delete: boolean;
}
export interface GetTestWebhookMeta {
  data: TestWebhookType[];
}
export interface TestWebhookType {
  type: string;
  Data: TestWebhookVariables[];
}
export interface TestWebhookVariables {
  id: string;
  name: string;
  description: string;
  value: string;
  type: WebhookType;
}
