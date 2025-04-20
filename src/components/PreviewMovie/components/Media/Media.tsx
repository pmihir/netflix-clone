import styles from "./styles.module.scss";
import { PreviewMovieProps } from "../../types";

export const Media = ({ title, backdropPath }: PreviewMovieProps.Media) => {
  return (
    <div className={styles.media}>
      <img
        src={`https://image.tmdb.org/t/p/original${backdropPath}`}
        alt={title}
      />
    </div>
  );
};
