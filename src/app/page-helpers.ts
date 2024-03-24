function secondsToTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const formattedString = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;

  if (formattedString.startsWith("00:")) {
    return formattedString.slice(3);
  }

  return formattedString;
}

function getTimeFromLink(link: string): number {
  const timeParam = new URL(link).searchParams.get("t");
  return timeParam ? Number(timeParam) : 0;
}

export function parseLinkToVideoMoment(link: string) {
  return secondsToTime(getTimeFromLink(link));
}
