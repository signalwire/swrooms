export let apiurl =
  process.env.REACT_APP_API_URL === "origin" || undefined
    ? window.location.origin
    : process.env.REACT_APP_API_URL;
