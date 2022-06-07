import { Fragment } from 'react';
import { styled } from '@mui/material/styles';
import MuiListItemButton from '@mui/material/ListItemButton';
import MuiListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import { IRelatedVideoProps } from './YoutubePlayer';

const ListItemButton = styled(MuiListItemButton)`
  &:hover {
    background-color: transparent;
  }
`;

const ListItem = styled(MuiListItem)`
  .MuiListItemSecondaryAction-root {
    visibility: hidden;
  }

  &:hover {
    .MuiListItemSecondaryAction-root {
      visibility: inherit;
    }
  }
`;

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

interface IProps extends IRelatedVideoProps {
  onClick: () => void;
  removeQueue: () => void;
}

export default function ComplexGrid({
  title,
  image,
  onClick,
  removeQueue
}: IProps) {
  return (
    <Fragment>
      <ListItemButton onClick={onClick} sx={{ padding: 0 }} disableRipple>
        <ListItem
          alignItems="flex-start"
          secondaryAction={
            <Tooltip title="Remove from Queue">
              <IconButton
                edge="end"
                aria-label="comments"
                onClick={(evt) => {
                  evt.stopPropagation();
                  removeQueue();
                }}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Tooltip>
          }
        >
          <ListItemAvatar sx={{ marginRight: '8px' }}>
            <CardWrapper>
              <Avatar
                sx={{ width: 96, height: 64 }}
                alt={title}
                src={image}
                variant="rounded"
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
          </ListItemAvatar>
          <ListItemText
            primary={title.length > 50 ? `${title.substring(0, 50)}...` : title}
            secondary={
              <Fragment>
                <Typography
                  sx={{ display: 'inline' }}
                  component="span"
                  variant="body2"
                  color="text.primary"
                >
                  Ali Connors
                </Typography>
                {" — I'll be in your neighborhood doing errands this…"}
              </Fragment>
            }
          />
        </ListItem>
      </ListItemButton>
      <Divider variant="inset" component="li" />
    </Fragment>
  );
}
