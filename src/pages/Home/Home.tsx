import { HomeContainer } from "../../layout/HomeContainer";
import { Show } from "../../components/Show";
import { PreviewMovie } from "../../components/PreviewMovie";
import { CircularProgress } from "../../components/Loading/CircularProgress";
import { ListMovies } from "./components/ListMovies";
import { FeaturedMovie } from "./components/FeaturedMovie";
import { usePreview } from "../../context/PreviewContext";

import { useMovies } from "./hooks/useMovies";
import NetflixAssistant from "../../components/Assistant/Assistant";

export const Home = () => {
  const { previewMovie, isLoading: previewIsLoading } = usePreview();

  const { isLoading, featuredData, movieList } = useMovies({
    previewMovie,
  });

  return (
    <>
      <Show when={!isLoading}>
        <HomeContainer>
          <Show when={!!featuredData}>
            <FeaturedMovie {...featuredData!} />
          </Show>

          <Show when={movieList.length > 0}>
            <ListMovies list={movieList} />
          </Show>

          <Show when={!!previewMovie}>
            <PreviewMovie {...previewMovie!} />
          </Show>
          <NetflixAssistant />
        </HomeContainer>
      </Show>

      <Show when={previewIsLoading || isLoading}>
        <CircularProgress fullScreen={true} />
      </Show>
    </>
  );
};
