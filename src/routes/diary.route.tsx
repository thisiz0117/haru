import { Hono } from "hono";
import { Variable } from "..";
import { NewDiary } from "../views/pages/new-diary";

export const diaryRoute = new Hono<{Variables: Variable}>()


/*
  # /diary/write
*/
// /diary/write
diaryRoute.get('/write', (c) => {
  return c.render(<NewDiary/>)
})