"use client";

import React, { ChangeEvent, FormEvent, useState } from "react";
import {
  Button,
  IconButton,
  TextField,
  Typography,
  Stack,
  Select,
  InputLabel,
  MenuItem,
  FormControl,
  Container,
  Card,
  CardContent,
} from "@mui/material";

import PlayArrowIcon from "@mui/icons-material/PlayArrow";

import { processYoutubeLinkWithGPT } from "./actions";
import { SearchResult } from "./types";

import { parseLinkToVideoMoment } from "./page-helpers";
import { extractVideoId } from "./youtube-helpers";

function VideoCard({ link, text }: any, index: number) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div"></Typography>
        <Typography variant="body2" sx={{ m: 2 }}>
          {text}
        </Typography>
        <IconButton onClick={() => window.open(link)}>
          <PlayArrowIcon sx={{ height: 38, width: 38 }} />
        </IconButton>
        At {parseLinkToVideoMoment(link)}
      </CardContent>
    </Card>
  );
}

export default function FormAssistant() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [processingWithGPT, setProcessingWithGPT] = useState<Boolean>(false);

  const [formValues, setFormValues] = useState<Record<string, string>>({
    video: "",
    prompt: "",
    lang: "en",
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
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
      setProcessingWithGPT(true);
      const results = await processYoutubeLinkWithGPT({
        videoId,
        prompt,
        video,
        lang,
      });
      setProcessingWithGPT(false);
      setSearchResults(results);
      return;
    }

    alert(
      "Need a public youtube video link and a question about the video to process!",
    );
  };

  return (
    <Container maxWidth="md">
      <Stack
        spacing={2}
        sx={{
          ...{
            marginBottom: "36px",
          },
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontWeight: 400,
            fontSize: "2.125rem",
            lineHeight: 1.235,
            marginTop: "16px!important",
          }}
        >
          YouTube AI Scanner
        </Typography>
        <Typography variant="body1">
          Never watch filler content again. All you need is the YouTube link and
          what the AI should look for.
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
              disabled={Boolean(processingWithGPT)}
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
              disabled={Boolean(processingWithGPT)}
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
                <MenuItem value={"en"}>English</MenuItem>
                <MenuItem value={"pt"}>Portuguese</MenuItem>
              </Select>
            </FormControl>

            <Stack direction="column" spacing={2} alignSelf="flex-end">
              <Button
                type="submit"
                variant="contained"
                disabled={Boolean(processingWithGPT)}
              >
                Scan Video
              </Button>
              {searchResults.length ? searchResults.map(VideoCard) : ""}
            </Stack>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
}
