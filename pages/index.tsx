import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Container from '@mui/material/Container';
import SearchIcon from '@mui/icons-material/Search';

import { fetchAPI } from '../lib/api';

import { parseDuration } from '../lib/utils';

import Player from '../src/YoutubePlayer';
import Copyright from '../src/Copyright';

const Search = styled(Paper)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25)
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto'
  }
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%'
  }
}));

const Home: NextPage = ({
  ytid,
  snippet,
  contentDetails
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  console.log({ ytid, snippet, contentDetails });

  console.log('here>>', { duration: parseDuration(contentDetails.duration) });

  return (
    <>
      <AppBar position="relative">
        <Toolbar>
          <Typography variant="h6" color="inherit" noWrap>
            Youtube Looper
          </Typography>
        </Toolbar>
      </AppBar>
      <main>
        {/* Hero unit */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            pt: 8,
            pb: 6
          }}
        >
          <Container maxWidth="sm">
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="text.primary"
              gutterBottom
            >
              Album layout
            </Typography>

            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Paste Youtube URL here..."
                inputProps={{ 'aria-label': 'search' }}
              />
            </Search>
          </Container>
        </Box>
        <Container sx={{ py: 8 }} maxWidth="md">
          <Player
            ytid={ytid}
            snippet={snippet}
            content={contentDetails}
            startTime={0}
            endTime={parseDuration(contentDetails.duration)}
          />
        </Container>
      </main>
      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', p: 6 }} component="footer">
        <Typography variant="h6" align="center" gutterBottom>
          Footer
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          component="p"
        >
          Something here to give the footer a purpose!
        </Typography>
        <Copyright />
      </Box>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const v = query.v;

  const ytid = v ?? 'ttpO7wNqFv8';

  const result = await fetchAPI('/videos', {
    part: 'snippet,contentDetails',
    id: ytid
  });

  const snippet = {
    title: result.items[0].snippet?.title
  };

  const contentDetails = {
    ...result.items[0].contentDetails
  };

  return {
    props: {
      ytid,
      snippet,
      contentDetails
    } // will be passed to the page component as props
  };
};

export default Home;
