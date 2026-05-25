import { serverApi, type Response } from "..";
import type { WordQuery, WordList } from "@en-learning/common/word";

export const getWordBookList = (
  params: WordQuery,
): Promise<Response<WordList>> => {
  return serverApi.get("/word-book", { params }) as Promise<Response<WordList>>;
};
