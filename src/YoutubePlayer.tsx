import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';

import Slider, { SliderThumb } from '@mui/material/Slider';
import { styled } from '@mui/material/styles';

import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import RepeatIcon from '@mui/icons-material/Repeat';
import RepeatOnIcon from '@mui/icons-material/RepeatOn';
import QueueIcon from '@mui/icons-material/Queue';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import ShuffleOnIcon from '@mui/icons-material/ShuffleOn';

import YouTube from 'react-youtube';
import { useInterval } from 'usehooks-ts';

import { PlayerState } from '../lib/enum';
import {
  parseDuration,
  parseDurationHMSString,
  durationToHMSString
} from '../lib/utils';

const minDistance = 10;

const PLAYER_TIME_CHECK_INTERVAL = 1.5; // in seconds

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

interface Marks {
  value: number;
  label: string;
}

interface IProps {
  ytid?: string;
  snippet?: any;
  content?: any;
  startTime: number;
  endTime: number;
}

export default function Player({
  ytid,
  snippet,
  content,
  startTime,
  endTime
}: IProps) {
  const router = useRouter();

  const [slider, setSlider] = useState<number[]>([startTime, endTime]);
  const [isReady, setIsReady] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const playerRef = useRef<any>(null);
  const [playerState, setPlayerState] = useState(PlayerState.Unstarted);
  const [toggle, setToggle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(true);
  const [shuffleMode, setShuffleMode] = useState(false);

  useEffect(() => {
    const sliderStart = router.query?.s ? Number(router.query?.s) : startTime;
    const sliderEnd = router.query?.e ? Number(router.query?.e) : endTime;

    setSlider([sliderStart, sliderEnd]);
  }, []);

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

  const getMarks = () => {
    const startTime_str = durationToHMSString(startTime);
    const endTime_str = durationToHMSString(endTime);

    const marks = [
      {
        value: startTime,
        label: startTime_str
      },
      {
        value: endTime,
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

  // useEffect(() => {
  //   switch (playerState) {
  //     case PlayerState.Playing:
  //       // console.log('play');
  //       pauseVideo();
  //       break;

  //     case PlayerState.Paused:
  //     case PlayerState.Ended:
  //     case PlayerState.Unstarted:
  //     case PlayerState.VideoCued:
  //       // console.log('pause');
  //       playVideo();
  //       break;

  //     default:
  //       break;
  //   }
  // }, [toggle]);

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
          const startTime1 = Math.max(startTime, 0);
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
      startTime: startTime,
      state: playerState
    };

    if (
      currentTime >= endTime1 - PLAYER_TIME_CHECK_INTERVAL ||
      playerState === PlayerState.Ended
    ) {
      console.log('cond 1');
      queueNext();
    } else if (currentTime < startTime1) {
      player.seekTo(startTime, true);
    }
  }

  function queueNext() {
    let currentUTCDay = Math.floor(
      new Date().getTime() / (1000 * 60 * 60 * 24)
    );

    if (repeatMode) {
      repeatVideo();
    } else if (shuffleMode) {
    } else {
      // Check for single song playlist
    }
  }

  function repeatVideo() {
    const player = playerRef.current;

    const startTime1 = Math.max(startTime, 0);
    player.seekTo(startTime1, true);

    playVideo();
  }

  return (
    <Card sx={{ maxWidth: 728, margin: 'auto' }}>
      <div className="video-container">
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
            <IconButton aria-label="play/pause">
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
            max={endTime}
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
  );
}
