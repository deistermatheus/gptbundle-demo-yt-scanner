'use client';

import React, { ChangeEvent, FormEvent, useState } from 'react';
import { Button, IconButton, TextField, Typography, Stack, Select, InputLabel, MenuItem, FormControl, Container, CircularProgress } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useRequestDialog } from './requestDialog';
import { boxForms } from './formStyles';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import { processYoutubeLinkWithGPT } from './actions';
import { SearchResult } from './types';

function secondsToTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const formattedString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  
  if (formattedString.startsWith('00:')) {
       return formattedString.slice(3)
  }

  return formattedString
}

function getTimeFromLink(link: string): number {
    const timeParam =  new URL(link).searchParams.get('t')
    return timeParam ? Number(timeParam) : 0
}

function parseLinkToVideoMoment(link: string){
    return secondsToTime(getTimeFromLink(link))
}

function extractVideoId(videoUrl: string): string | null {
  const youtubeDomains: string[] = ['www.youtube.com', 'youtube.com', 'youtu.be'];

  let parsedUrl: URL | null;

  try {
    parsedUrl = new URL(videoUrl);
  } catch (e) {
    return null;
  }

  if (!youtubeDomains.includes(parsedUrl.hostname)) {
    return null;
  }

  if (parsedUrl.hostname === 'youtu.be') {
    return parsedUrl.pathname.replaceAll('/', '');
  }

  if (parsedUrl.pathname === '/watch') {
    const videoId: string | null = parsedUrl.searchParams.get('v');
    return videoId ? videoId : null;
  } else if (parsedUrl.pathname.startsWith('/embed/') || parsedUrl.pathname.startsWith('/v/')) {
    const pathParts: string[] = parsedUrl.pathname.split('/');
    const videoId: string | null = pathParts[pathParts.length - 1] !== '' ? pathParts[pathParts.length - 1] : null;
    return videoId;
  }

  return null;
}

function VideoCard({ link, text }: any, index: number) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div">
          {/* {`Search Result ${index + 1}`} */}
        </Typography>
        <Typography variant="body2" sx={{ m: 2 }}>{text}</Typography>
        <IconButton onClick={() => window.open(link)}><PlayArrowIcon sx={{ height: 38, width: 38 }} /></IconButton> 
        At {parseLinkToVideoMoment(link)}      
      </CardContent>
    </Card>
  );
}

export default function SingleFieldFormAssistant() {
  const { requestDialog, renderDialog, isLoading } = useRequestDialog();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [processingWithGPT, setProcessingWithGPT] = useState<Boolean>(false)

  const [formValues, setFormValues] = useState<Record<string, string>>({
    video: '',
    prompt: '',
    lang: 'en',
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log('event', event);

    setFormValues({
      ...formValues,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const { video, prompt, lang } = formValues;

    const videoId = extractVideoId(video);
    const canSend = Boolean(videoId && prompt);

    if (canSend) {
      setProcessingWithGPT(true)
      const results = await processYoutubeLinkWithGPT({ videoId, prompt, video, lang });
      setProcessingWithGPT(false)
      setSearchResults(results);
      return;
    }

    alert('Need a public youtube video link and a question about the video to process!');
  };

  return (
    <Container maxWidth='md'>
    <Stack spacing={2} sx={{ ...boxForms }}>
      <Typography
        variant="h1"
        sx={{
          fontWeight: 400,
          fontSize: '2.125rem',
          lineHeight: 1.235,
          marginTop: '16px!important',
        }}
      >
        YouTube AI Scanner
      </Typography>
      <Typography variant="body1">
        Never watch filler content again. All you need is the YouTube link and what the AI should look for.
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            required
            fullWidth
            name="video"
            label="YouTube Link"
            placeholder="Paste a YouTube link here"
            minRows={10}
            disabled={isLoading}
            value={formValues.video}
            onChange={handleInputChange}
          />

          <TextField
            required
            fullWidth
            name="prompt"
            label="Question about the content"
            placeholder="What information are you looking for?"
            minRows={10}
            disabled={isLoading}
            value={formValues.prompt}
            onChange={handleInputChange}
          />

          <FormControl fullWidth>
            <InputLabel id="language-select-label">Video Language</InputLabel>
            <Select
              labelId="language-select-label"
              id="language-select"
              value={formValues.lang}
              label="Video Language"
              onChange={(event) => {
                console.log(event.target.value);
                setFormValues({
                  ...formValues,
                  lang: event.target.value,
                });
              }}
            >
              <MenuItem value={'en'}>English</MenuItem>
              <MenuItem value={'pt'}>Portuguese</MenuItem>
            </Select>
          </FormControl>

          <Stack direction="column" spacing={2} alignSelf="flex-end">
            <Button type="submit" variant="contained" disabled={isLoading}>
              Submit
            </Button>
            {processingWithGPT ? <CircularProgress/> : ''}
            {searchResults.length ? searchResults.map(VideoCard): ''}
          </Stack>
        </Stack>
      </form>
      {renderDialog()}
    </Stack>
    </Container>
  );
}
