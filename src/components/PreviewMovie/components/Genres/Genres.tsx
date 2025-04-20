import { getGenres } from "../../../../utils/getGenres";
import { PreviewMovieProps } from "../../types";

export const Genres = ({ list }: PreviewMovieProps.Genres) => {
  return (
    <div>
      <span>Genres: </span>
      <span>{getGenres(list)}</span>
    </div>
  );
};
