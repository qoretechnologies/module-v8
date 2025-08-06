import { configDotenv } from 'dotenv';
import {
  CreateYouTubePlaylist,
  FindYouTubeVideo,
  GetYouTubeChannelIdFromUrl,
  GetYouTubeReport,
  ListYouTubeCategories,
  ListYouTubeUserChannels,
  ListYouTubeVideoComments,
  ListYouTubeVideos,
  ReplyToYouTubeComment,
  UpdateYouTubeVideoDetails,
} from '../apps/youtube/actions';
import addVideoToPlaylist from '../apps/youtube/actions/add-video-to-playlist-action';
import { getYouTubeCategoryAllowedValues } from '../apps/youtube/helpers/get-category-allowed-values';
import { getYouTubeUserPlaylistsAllowedValues } from '../apps/youtube/helpers/get-playlist-allowed-values';
import { getYouTubeUserChannelsAllowedValues } from '../apps/youtube/helpers/get-user-channel-allowed-values';
import { getYouTubeUserVideosAllowedValues } from '../apps/youtube/helpers/get-user-video-allowed-values';
import {
  YouTubeNewChannelVideoTrigger,
  YouTubeNewLivestreamTrigger,
  YouTubeNewPlaylistVideoTrigger,
  YouTubeNewVideoBySearchTrigger,
  YouTubeNewVideoCommentTrigger,
} from '../apps/youtube/triggers';
import { Debugger, DebugLevels } from '../utils/Debugger';

configDotenv({ path: '.env' });
Debugger.level = DebugLevels.Verbose;

describe('Google Docs', () => {
  const base_context = {
    conn_opts: {
      token: '',
    } as any,
  };

  beforeAll(async () => {
    const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;
    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error(`
        Please set the YOUTUBE_REFRESH_TOKEN, YOUTUBE_CLIENT_ID, 
        and YOUTUBE_CLIENT_SECRET environment variables.
      `);
    }

    const data = {
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    };

    const formBody = Object.keys(data)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key as keyof typeof data])}`
      )
      .join('&');

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody,
    });

    const responseData = await response.json();
    if (!responseData?.access_token) {
      throw new Error('Failed to get access token');
    }

    base_context.conn_opts.token = responseData.access_token;
  });

  let userChannel: string | undefined;
  let userPlaylist: string | undefined;
  let userVideo: string | undefined;
  let comment: string | undefined;

  describe('Should test allowed values', () => {
    it('Should get category allowed values', async () => {
      const allowed_values = await getYouTubeCategoryAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get user channel allowed values', async () => {
      const allowed_values = await getYouTubeUserChannelsAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      userChannel = allowed_values[0].value;
    });

    it('Should get user videos allowed values', async () => {
      const allowed_values = await getYouTubeUserVideosAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      userVideo = allowed_values[0].value;
    });

    it('Should get user playlists allowed values', async () => {
      const allowed_values = await getYouTubeUserPlaylistsAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      userPlaylist = allowed_values[0].value;
    });
  });

  describe('Should test actions', () => {
    it('Should list videos', async () => {
      const action = ListYouTubeVideos;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBeTruthy();
    });

    it('Should list categories', async () => {
      const action = ListYouTubeCategories;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBeTruthy();
    });

    it('Should list user channels', async () => {
      const action = ListYouTubeUserChannels;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBeTruthy();
    });

    it('Should get channel report', async () => {
      const action = GetYouTubeReport;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          channel: 'MINE',
          startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          metrics: ['views'],
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBeTruthy();
    });

    it('Should update video details', async () => {
      const action = UpdateYouTubeVideoDetails;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const response = await action.api_function(
        {
          title: 'Test Video Update',
          video: 'cBwo58ULVdc',
        },
        undefined,
        base_context
      );

      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
    });

    it('Should create a playlist', async () => {
      const action = CreateYouTubePlaylist;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const response = await action.api_function(
        {
          title: 'Test Playlist',
          description: 'A playlist for testing',
          privacy: 'private',
        },
        undefined,
        base_context
      );

      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
    });

    it('Should add a video to playlist', async () => {
      const action = addVideoToPlaylist;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const response = await action.api_function(
        {
          playlistId: userPlaylist,
          videoId: userVideo,
        },
        undefined,
        base_context
      );

      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
    });

    it('Should list video comments', async () => {
      const action = ListYouTubeVideoComments;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const response = await action.api_function(
        {
          videoId: userVideo,
          order: 'time',
          textFormat: 'html',
          maxResults: 10,
        },
        undefined,
        base_context
      );

      expect(response).toBeDefined();
      expect(response.items).toBeDefined();
      expect(Array.isArray(response.items)).toBe(true);
      expect(response.pageInfo).toBeDefined();
      expect(response.items.length).toBeGreaterThan(0);

      comment = response.items[0].id;
    });

    it('Should reply to comment', async () => {
      const action = ReplyToYouTubeComment;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const response = await action.api_function(
        {
          parentId: comment,
          textOriginal: 'This is a test reply to the comment',
        },
        undefined,
        base_context
      );

      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
      expect(response.snippet).toBeDefined();
      expect(response.snippet.parentId).toBe(comment);
    });

    it('Should search videos', async () => {
      const action = FindYouTubeVideo;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const response = await action.api_function(
        {
          q: 'Testing',
          order: 'relevance',
          videoDuration: 'medium',
          videoDefinition: 'high',
          safeSearch: 'moderate',
          maxResults: 10,
        },
        undefined,
        base_context
      );

      expect(response).toBeDefined();
      expect(response.items).toBeDefined();
      expect(Array.isArray(response.items)).toBe(true);
      expect(response.pageInfo).toBeDefined();
      expect(response.items.length).toBeGreaterThan(0);
    });

    it('Should find channel id from URL', async () => {
      const action = GetYouTubeChannelIdFromUrl;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const response = await action.api_function(
        {
          url: 'https://www.youtube.com/@LofiGirl/featured',
        },
        undefined,
        base_context
      );

      expect(response).toBeDefined();
      expect(response.channelId).toBeDefined();
    });

    describe('Should test triggers event example data', () => {
      it('Should get example event data for new channel video trigger', async () => {
        const trigger = YouTubeNewChannelVideoTrigger;

        if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
          throw new Error('get_example_event_data not found in trigger');

        const result = await trigger.get_example_event_data({
          ...base_context,
          opts: { channel: userChannel } as any,
        });

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
      });

      it('Should get example event data for new playlist video trigger', async () => {
        const trigger = YouTubeNewPlaylistVideoTrigger;

        if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
          throw new Error('get_example_event_data not found in trigger');

        const result = await trigger.get_example_event_data({
          ...base_context,
          opts: { playlist: userPlaylist } as any,
        });

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
      });

      it('Should get example event data for new search video trigger', async () => {
        const trigger = YouTubeNewVideoBySearchTrigger;

        if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
          throw new Error('get_example_event_data not found in trigger');

        const result = await trigger.get_example_event_data({
          ...base_context,
          opts: { query: 'Testing' } as any,
        });

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
      });

      it('Should get example event data for new video comment', async () => {
        const trigger = YouTubeNewVideoCommentTrigger;

        if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
          throw new Error('get_example_event_data not found in trigger');

        const result = await trigger.get_example_event_data({
          ...base_context,
          opts: { video: userVideo } as any,
        });

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
      });

      it('Should get example event data for new live stream', async () => {
        const trigger = YouTubeNewLivestreamTrigger;

        if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
          throw new Error('get_example_event_data not found in trigger');

        const result = await trigger.get_example_event_data({
          ...base_context,
          opts: { channel: 'UCSJ4gkVC6NrvII8umztf0Ow' } as any,
        });

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
      });
    });
  });
});
