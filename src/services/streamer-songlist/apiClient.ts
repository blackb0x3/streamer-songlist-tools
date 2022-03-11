import axios, { Method } from 'axios';

export class StreamerSonglistApiClient {
  StreamerSonglistDomain: string = 'https://api.streamersonglist.com/v1';

  /**
   * Gets streamer info from streamersonglist.com via a twitch streamer's username.
   * @param twitchId The streamer's Twitch username.
   */
  async getStreamer(twitchUsername: string): Promise<any> {
    let url = `${this.StreamerSonglistDomain}/streamers/${twitchUsername.toLowerCase()}`;
    let params = {
      platform: 'twitch'
    };

    return await this.performGet(url, params, null);
  }

  /**
   * Gets a list of songs that have been played today, by the streamer with a matching id
   * @param streamerId The streamer's ID for streamersonglist.com
   */
  async getSongsPlayedToday(streamerId: number): Promise<any> {
    let url = `${this.StreamerSonglistDomain}/streamers/${streamerId}/playHistory`;
    let params = {
      size: 1000, // Just a ridiculously huge value that ensures we grab EVERYTHING
      type: 'playedAt',
      period: 'day'
    };

    return await this.performGet(url, params, null);
  }

  /**
   * Gets a list of songs that a viewer can request the streamer to play on stream.
   * @param streamerId The streamer's ID for streamersonglist.com
   * @returns 
   */
  async getSongList(streamerId: number): Promise<any> {
    let songList: Array<any> = new Array<any>();
    let url = `https://api.streamersonglist.com/v1/streamers/${streamerId}/songs`;
    let params = {
      size: 100, // Limit is sadly 100 songs
      current: 0, // API pagination
      showInactive: false,
      isNew: false,
      order: 'asc'
    };

    let firstBatch = await this.performGet(url, params, null);

    // early exit in the event something went wrong...
    if (typeof(firstBatch) === 'undefined') {
      return firstBatch;
    }

    firstBatch.items.forEach((song: any) => {
      songList.push(song);
    });

    // Because there is a fixed limit on the number of results per 'page',
    // We will have to perform multiple requests to grab ALL of the songs...
    let totalSongs: number = firstBatch.total;
    let songsLeftToFetch: number = totalSongs - params.size;

    console.log(`Total songs: ${totalSongs}`);

    while (songsLeftToFetch > 0) {
      console.log(`Songs left: ${songsLeftToFetch}`);
      params.current++;
      let nextBatch = await this.performGet(url, params, null);
      nextBatch.items.forEach((song: any) => {
        songList.push(song);
      });
      songsLeftToFetch -= params.size;
    }

    console.log(`Songs retrieved: ${songList.length}`);
    return songList;
  }

  async getQueue(streamerId: number): Promise<any> {
    let url = `${this.StreamerSonglistDomain}/streamers/${streamerId}/queue`;
    let params = null;

    return await this.performGet(url, params, null);
  }

  async queueSongs(streamerId: number, songIds: number[], bearerToken: string): Promise<void> {
    songIds.forEach(async songId => {
      let url = `${this.StreamerSonglistDomain}/streamers/${streamerId}/queue/${songId}/request`;
      let headers = {
        'Authorization': `${bearerToken}`
      };

      await this.performPost(url, null, null, headers);
    });
  }

  private async performGet(url: string, params: any, headers: any): Promise<any> {
    return await this.performRequest(url, 'GET', params, null, headers);
  }

  private async performPost(url: string, params: any, data: any, headers: any) {
    return await this.performRequest(url, 'POST', params, data, headers);
  }

  private async performRequest(url: string, requestType: string, queryParams: any, postData: any, headers: any) {
    try {

      let urlObj = new URL(url);
      urlObj.search = new URLSearchParams(queryParams).toString();
      let urlString = urlObj.toString();

      console.log(`Executing: ${urlString}`);

      var resp = await axios.request({
        url: urlString,
        method: requestType as Method,
        data: postData,
        headers: headers
      });

      return resp.data;

    } catch (error) {

      console.log(error);

      return undefined;

    }
  }
}