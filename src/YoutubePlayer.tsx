import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import List from '@mui/material/List';

import Slider, { SliderThumb } from '@mui/material/Slider';
import { styled } from '@mui/material/styles';

import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import RepeatIcon from '@mui/icons-material/Repeat';
import RepeatOnIcon from '@mui/icons-material/RepeatOn';
import QueueIcon from '@mui/icons-material/Queue';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import ShuffleOnIcon from '@mui/icons-material/ShuffleOn';

import YouTube from 'react-youtube';

import usePrevious from '../hooks/usePrevious';
import useInterval from '../hooks/useInterval';

import { fetchAPI } from '../lib/api';

import { PlayerState } from '../lib/enum';
import {
  parseDuration,
  parseDurationHMSString,
  durationToHMSString
} from '../lib/utils';

import RelatedVideo from './RelatedVideo';
import QueueVideo from './QueueVideo';

const minDistance = 10;

const PLAYER_TIME_CHECK_INTERVAL = 1.5; // in seconds

const Spinner = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  margin: '0 auto',
  position: 'absolute'
});

const AirbnbSlider = styled(Slider)(({ theme }) => ({
  color: '#3a8589',
  height: 3,
  padding: '13px 0',
  '& .MuiSlider-thumb': {
    height: 27,
    width: 27,
    backgroundColor: '#fff',
    border: '1px solid currentColor',
    '&:hover': {
      boxShadow: '0 0 0 8px rgba(58, 133, 137, 0.16)'
    },
    '& .airbnb-bar': {
      height: 9,
      width: 1,
      backgroundColor: 'currentColor',
      marginLeft: 1,
      marginRight: 1
    }
  },
  '& .MuiSlider-track': {
    height: 3
  },
  '& .MuiSlider-rail': {
    color: theme.palette.mode === 'dark' ? '#bfbfbf' : '#d8d8d8',
    opacity: theme.palette.mode === 'dark' ? undefined : 1,
    height: 3
  },
  '& .MuiSlider-valueLabel': {
    lineHeight: 1.2,
    fontSize: 12,
    background: 'unset',
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: '50% 50% 50% 0',
    backgroundColor: '#52af77',
    transformOrigin: 'bottom left',
    transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
    '&:before': { display: 'none' },
    '&.MuiSlider-valueLabelOpen': {
      transform: 'translate(50%, -100%) rotate(-45deg) scale(1)'
    },
    '& > *': {
      transform: 'rotate(45deg)'
    }
  }
}));

interface AirbnbThumbComponentProps extends React.HTMLAttributes<unknown> {}

function AirbnbThumbComponent(props: AirbnbThumbComponentProps) {
  const { children, ...other } = props;
  return (
    <SliderThumb {...other}>
      {children}
      <span className="airbnb-bar" />
      <span className="airbnb-bar" />
      <span className="airbnb-bar" />
    </SliderThumb>
  );
}

export interface IRelatedVideoProps {
  id: string;
  title: string;
  description: string;
  image: string;
}

interface IProps {
  ytid?: string;
  snippet?: any;
  content?: any;
  setYtid: (ytid: string) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  };
}

export default function Player({ ytid, snippet, content, setYtid }: IProps) {
  const router = useRouter();

  console.log({ ytid, snippet, content });

  const prevYtid = usePrevious(ytid);

  const duration = parseDuration(content?.duration);

  const [relatedVideos, setRelatedVideos] = useState<IRelatedVideoProps[]>([]);
  const [slider, setSlider] = useState<number[]>([0, 0]);
  const [isReady, setIsReady] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const playerRef = useRef<any>(null);
  const [playerState, setPlayerState] = useState(PlayerState.Unstarted);
  const [toggle, setToggle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(true);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [value, setValue] = React.useState(0);
  const [queue, setQueue] = React.useState<any[]>([]);

  useEffect(() => {
    if (ytid && prevYtid !== ytid) {
      const sliderStart = router.query?.s ? Number(router.query?.s) : 0;
      const sliderEnd = router.query?.e ? Number(router.query?.e) : duration;

      setSlider([sliderStart, sliderEnd]);
      searchRelated();
    }
  }, [ytid, prevYtid]);

  const searchRelated = async () => {
    const res = await fetchAPI('/search', {
      part: 'snippet',
      videoCategoryId: '10',
      type: 'video',
      relatedToVideoId: ytid,
      maxResults: 10
    });

    console.log('result>>>', res);

    const data = res.items
      .filter((item: any) => item.snippet)
      .map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        image: item.snippet.thumbnails?.medium?.url
      }));

    if (data.length > 0) {
      setRelatedVideos(data);
    }
  };

  // every `PLAYER_TIME_CHECK_INTERVAL` seconds, we check the current time of the video, and
  // when we're close to the end, we trigger a repeat or a next based on the RepeatMode
  useInterval(
    () => {
      // Your custom logic here
      playerTimeCheck();
    },
    // Delay in milliseconds or null to stop it
    PlayerState.Playing ? 1000 : null
  );

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const getMarks = () => {
    const startTime_str = durationToHMSString(0);
    const endTime_str = durationToHMSString(duration);

    const marks = [
      {
        value: 0,
        label: startTime_str
      },
      {
        value: duration,
        label: endTime_str
      }
    ];
    console.log(JSON.stringify(marks));

    return marks;
  };

  const handleChange1 = (
    event: Event,
    newValue: number | number[],
    activeThumb: number
  ) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    if (activeThumb === 0) {
      const startTime1 = Math.min(newValue[0], slider[1] - minDistance);
      const endTime1 = slider[1];
      router.push(`/?s=${startTime1}&e=${endTime1}`, undefined, {
        shallow: true
      });
      setSlider([startTime1, endTime1]);
    } else {
      const startTime1 = slider[0];
      const endTime1 = Math.max(newValue[1], slider[0] + minDistance);
      router.push(`/?s=${startTime1}&e=${endTime1}`, undefined, {
        shallow: true
      });
      setSlider([startTime1, endTime1]);
    }
  };

  useEffect(() => {
    switch (playerState) {
      case PlayerState.Playing:
        // console.log('play');
        pauseVideo();
        break;

      case PlayerState.Paused:
      case PlayerState.Ended:
      case PlayerState.Unstarted:
      case PlayerState.VideoCued:
        // console.log('pause');
        playVideo();
        break;

      default:
        break;
    }
  }, [toggle]);

  const onReady = (evt: any) => {
    // grab the YT player object from evt.target
    playerRef.current = evt.target;
    setIsReady(true);
  };

  const onError = (err: any) => {
    console.error('Error::', err);
    // 101 and 150 are the error codes for blocked videos
    // if (err.data == 101 || err.data == 150) {}
  };

  const onStateChange = (evt: any) => {
    const playerState = evt.data;
    const player = playerRef.current;

    // console.log('player state did change...', playerState);

    setPlayerState(playerState);

    switch (playerState) {
      case PlayerState.VideoCued:
        if (isReady && autoplay) {
          const startTime1 = Math.max(slider[0], 0);
          player.seekTo(startTime1, true);
          playVideo();
        }
        break;

      default:
        break;
    }
  };

  function playVideo() {
    const player = playerRef.current;
    if (player !== null) {
      player.playVideo();
    }
  }

  function pauseVideo() {
    const player = playerRef.current;

    if (player !== null) {
      player.pauseVideo();
    }
  }

  function playerTimeCheck() {
    var date = new Date();
    var timestamp = date.getTime();

    const player = playerRef.current;

    // not initialized yet if state player is null (see this.onReady)
    if (player === null) {
      return;
    }

    if (
      autoplay &&
      (playerState === PlayerState.VideoCued ||
        playerState === PlayerState.Unstarted)
    ) {
      playVideo();
    }

    // ignore the player's buffering state so we don't double-repeat
    if (playerState === PlayerState.Buffering) {
      return;
    }

    const duration = player.getDuration();
    // not initialized yet if duration is still 0
    if (duration === 0) {
      return;
    }

    const currentTime = player.getCurrentTime();
    // Return if the current time is undefined (embed is loading)
    if (!currentTime) {
      return;
    }

    const sliderEnd = slider[1];
    const sliderStart = slider[0];

    const endTime1 = sliderEnd && sliderEnd > 0 ? sliderEnd : duration;
    const startTime1 = sliderStart && sliderStart >= 0 ? sliderStart : 0;

    // Intentionally left these console.log here as it should surface useful information in bug reports if we receive "repeat broken" bug reports
    let repeatParam = {
      currentTime: currentTime,
      sliderEnd: sliderEnd,
      sliderStart: sliderStart,
      endTime: endTime1,
      startTime: startTime1,
      state: playerState
    };

    if (
      currentTime >= endTime1 - PLAYER_TIME_CHECK_INTERVAL ||
      playerState === PlayerState.Ended
    ) {
      queueNext();
    } else if (currentTime < startTime1) {
      player.seekTo(startTime1, true);
    }
  }

  function generateRandom(maxLimit = 10) {
    let rand = Math.random() * maxLimit;
    console.log(rand); // say 99.81321410836433

    rand = Math.floor(rand); // 99

    return rand;
  }

  function queueNext() {
    let currentUTCDay = Math.floor(
      new Date().getTime() / (1000 * 60 * 60 * 24)
    );

    if (repeatMode) {
      repeatVideo();
    } else if (shuffleMode) {
      const ytids = relatedVideos.length
        ? relatedVideos.map((item) => item.id)
        : [];
      if (ytids.length === 0) {
        // Do nothing
      } else if (ytids.length) {
        const index = generateRandom(ytids.length);
        setYtid(ytids[index]);
        window !== undefined &&
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
      }
    } else {
      // Check for single song playlist

      const ytids = relatedVideos.length
        ? relatedVideos.map((item) => item.id)
        : [];
      if (ytids.length === 0) {
        // Do nothing
      } else if (ytids.length) {
        setYtid(ytids[0]);
        window !== undefined &&
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
      }
    }
  }

  function repeatVideo() {
    const player = playerRef.current;

    const startTime1 = Math.max(slider[0], 0);
    player.seekTo(startTime1, true);

    playVideo();
  }

  return (
    <>
      <Card sx={{ maxWidth: 728, margin: 'auto' }}>
        <div className="video-container">
          <Spinner>
            <CircularProgress />
          </Spinner>
          <YouTube
            videoId={ytid}
            opts={{
              playerVars: {
                autoplay: 1
              }
            }}
            onReady={onReady}
            onStateChange={onStateChange}
            onError={onError}
          />
        </div>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              px: 1,
              pb: 1
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton aria-label="previous">
                <SkipPreviousIcon />
              </IconButton>
              <IconButton
                aria-label="play/pause"
                onClick={() => setToggle((prev) => !prev)}
              >
                <PlayArrowIcon sx={{ height: 38, width: 38 }} />
              </IconButton>
              <IconButton aria-label="next">
                <SkipNextIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                aria-label="shuffle"
                onClick={() => setRepeatMode((prev) => !prev)}
              >
                {shuffleMode ? <ShuffleOnIcon /> : <ShuffleIcon />}
              </IconButton>
              <IconButton
                aria-label="repeat"
                onClick={() => setRepeatMode((prev) => !prev)}
              >
                {repeatMode ? <RepeatOnIcon /> : <RepeatIcon />}
              </IconButton>
              <IconButton aria-label="queue">
                <QueueIcon />
              </IconButton>
            </Box>
          </Box>
          <Divider />

          <Box sx={{ py: 2, px: 1 }}>
            <AirbnbSlider
              components={{ Thumb: AirbnbThumbComponent }}
              getAriaLabel={() => 'Minimum distance'}
              min={0}
              step={1}
              max={duration}
              value={slider}
              onChange={handleChange1}
              valueLabelDisplay="auto"
              valueLabelFormat={(x) => durationToHMSString(x)}
              disableSwap
              marks={getMarks()}
            />
          </Box>

          <Typography variant="body2" color="text.secondary" align="center">
            Loop any section of the video using the slider!
          </Typography>
        </CardContent>
      </Card>

      <Paper sx={{ maxWidth: 500, margin: 'auto', mt: 5 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
            sx={{ justifyContent: 'center' }}
          >
            <Tab label="Related Videos" {...a11yProps(0)} />
            <Tab label="Queue Next" {...a11yProps(1)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {!!relatedVideos.length &&
              relatedVideos.map((relatedVideo, index) => (
                <RelatedVideo
                  key={relatedVideo?.id}
                  onClick={() => {
                    setYtid(relatedVideo.id);
                    window !== undefined &&
                      window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                      });
                  }}
                  addQueue={() => setQueue((prev) => [relatedVideo, ...prev])}
                  {...relatedVideo}
                />
              ))}
          </List>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {!!queue.length &&
              queue.map((relatedVideo) => (
                <QueueVideo
                  key={relatedVideo?.id}
                  onClick={() => {
                    setYtid(relatedVideo.id);
                    window !== undefined &&
                      window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                      });
                  }}
                  removeQueue={() =>
                    setQueue((prev) =>
                      prev.filter((x) => x.id !== relatedVideo.id)
                    )
                  }
                  {...relatedVideo}
                />
              ))}
          </List>
        </TabPanel>
      </Paper>
    </>
  );
}
