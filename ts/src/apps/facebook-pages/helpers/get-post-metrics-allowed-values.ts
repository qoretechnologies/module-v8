import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const FacebookPostMetricsAllowedValues = [
  {
    value: 'page_post_engagements',
    display_name: 'Page Post Engagements',
    desc: 'The number of times people engaged with your post (likes, comments, shares, etc.)',
  },
  {
    value: 'post_negative_feedback',
    display_name: 'Post Negative Feedback',
    desc: 'The number of times people hid your post or reported it as spam',
  },
  {
    value: 'post_negative_feedback_unique',
    display_name: 'Unique Negative Feedback',
    desc: 'The number of unique people who hid your post or reported it as spam',
  },
  {
    value: 'post_reactions_by_type_total',
    display_name: 'Post Reactions by Type',
    desc: 'The number of reactions on your post, broken down by type (like, love, wow, haha, sorry, anger)',
  },
  {
    value: 'post_impressions',
    display_name: 'Post Impressions',
    desc: 'The number of times your post was displayed',
  },
  {
    value: 'post_impressions_unique',
    display_name: 'Unique Post Impressions',
    desc: 'The number of unique people who saw your post',
  },
  {
    value: 'post_impressions_paid',
    display_name: 'Paid Post Impressions',
    desc: 'The number of times your post was displayed as a paid advertisement',
  },
  {
    value: 'post_impressions_organic',
    display_name: 'Organic Post Impressions',
    desc: 'The number of times your post was displayed organically (not paid)',
  },
  {
    value: 'post_impressions_fan',
    display_name: 'Fan Post Impressions',
    desc: 'The number of times your post was displayed to fans of your page',
  },
  {
    value: 'post_clicks',
    display_name: 'Post Clicks',
    desc: 'The number of clicks on your post',
  },
  {
    value: 'post_clicks_unique',
    display_name: 'Unique Post Clicks',
    desc: 'The number of unique people who clicked on your post',
  },
  {
    value: 'post_clicks_by_type',
    display_name: 'Post Clicks by Type',
    desc: 'The number of clicks on your post, broken down by type (link, photo, video, etc.)',
  },
  {
    value: 'link_clicks',
    display_name: 'Link Clicks',
    desc: 'The number of clicks on links in your post',
  },
  {
    value: 'video_views',
    display_name: 'Video Views',
    desc: 'The number of times your video post was viewed for 3+ seconds',
  },
  {
    value: 'video_views_unique',
    display_name: 'Unique Video Views',
    desc: 'The number of unique people who viewed your video for 3+ seconds',
  },
  {
    value: 'video_view_time',
    display_name: 'Video View Time',
    desc: 'Total time spent viewing your video post',
  },
  {
    value: 'video_10s_views',
    display_name: '10-Second Video Views',
    desc: 'The number of times your video post was viewed for at least 10 seconds',
  },
  {
    value: 'fan_reach',
    display_name: 'Fan Reach',
    desc: 'The number of unique fans who saw your post',
  },
  {
    value: 'fan_engagement',
    display_name: 'Fan Engagement',
    desc: 'The number of unique fans who engaged with your post',
  },
] satisfies IQoreAllowedValue<string>[];
