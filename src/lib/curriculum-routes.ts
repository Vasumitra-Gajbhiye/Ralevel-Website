const LEARN_PREFIX = "/learn";

export const BOARD_ROUTE_PATTERN =
  "cambridge|edexcel-uk|edexcel-ial|aqa|ocr|wjec";

export function boardPath(board: string) {
  return `${LEARN_PREFIX}/${board}`;
}

export function levelPath(board: string, level: string) {
  return `${LEARN_PREFIX}/${board}/${level}`;
}

export function subjectPath(
  board: string,
  level: string,
  subject: string,
  subjectCode: string,
) {
  return `${LEARN_PREFIX}/${board}/${level}/${subject}/${subjectCode}`;
}

export function chapterPath(
  board: string,
  level: string,
  subject: string,
  subjectCode: string,
  chapter: string,
) {
  return `${LEARN_PREFIX}/${board}/${level}/${subject}/${subjectCode}/${chapter}`;
}

export function topicPath(
  board: string,
  level: string,
  subject: string,
  subjectCode: string,
  chapter: string,
  topic: string,
) {
  return `${chapterPath(board, level, subject, subjectCode, chapter)}/${topic}`;
}

export function topicSubPath(
  board: string,
  level: string,
  subject: string,
  subjectCode: string,
  chapter: string,
  topic: string,
  subPage: string,
) {
  return `${topicPath(board, level, subject, subjectCode, chapter, topic)}/${subPage}`;
}
