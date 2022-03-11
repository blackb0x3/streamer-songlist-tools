import { StreamerSonglistApiClient } from "./services";
import { Command } from 'commander';

const program = new Command();

program
  .requiredOption('-s, --streamer <username>', 'Twitch streamer username.')
  .option('--threshold <value>', 'Number of songs left in queue before auto adding more.', '1')
  .option('--songs-to-auto-queue <value>', 'Number of songs to queue once threshold is met.', '2');

async function main() {
  try {
    program.parse();
    let options = program.opts();
    let sslClient = new StreamerSonglistApiClient();
    let streamer = await sslClient.getStreamer(options.streamer);
    console.log(streamer.id);
    let songList: Array<any> = await sslClient.getSongList(streamer.id);
  } catch (e) {
    console.error(e);
  }
}

main();
