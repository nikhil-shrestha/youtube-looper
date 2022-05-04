import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import { IRelatedVideoProps } from './YoutubePlayer';

const CardWrapper = styled('div')({
  display: 'flex',
  position: 'relative',
  cursor: 'pointer',

  '&:hover': {
    '& .layer': { display: 'block' }
  },

  '& .layer': {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    display: 'none'
  }
});

const Img = styled('img')({
  margin: 'auto',
  display: 'block',
  maxWidth: '100%',
  maxHeight: '100%'
});

interface IProps extends IRelatedVideoProps {
  onClick: () => void;
}

export default function ComplexGrid({ title, image, onClick }: IProps) {
  return (
    <Card sx={{ display: 'flex', maxWidth: 500, margin: '15px auto' }}>
      <CardWrapper>
        <CardMedia
          component="img"
          sx={{ width: 151 }}
          image={image}
          alt={title}
        />
        <div className="layer">
          <IconButton
            sx={{
              margin: 0,
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white'
            }}
            aria-label="play/pause"
            onClick={onClick}
          >
            <PlayArrowIcon sx={{ height: 38, width: 38 }} />
          </IconButton>
        </div>
      </CardWrapper>

      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            component="div"
          >
            {title}
          </Typography>
        </CardContent>
      </Box>
    </Card>
  );
}
