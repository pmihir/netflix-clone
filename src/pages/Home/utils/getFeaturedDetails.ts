import api from "../../../services/api";

export const getFeaturedDetails = async (movieId: number, type: string) => {
  if (type === "movie") {
    return await api.get(`/movie/${movieId}`);
  }

  return await api.get(`/tv/${movieId}`);
};

export const getFeaturedDetailsByName = async (movieName: string) => {
  try {
    const data = await api.get(`/search/movie?query=${movieName}`);
    return data?.data?.results[0];
  } catch (error) {
    console.log("Movie details error>>>", error);
  }
};
